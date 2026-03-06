export type TransactionType = 'sale' | 'clawback';
export type PlanType = 'flat' | 'tiered';

export interface Tier {
  threshold: number;
  percentage: number;
}

export interface CommissionPlan {
  plan_id: string;
  name: string;
  type: PlanType;
  tiers?: Tier[];
  flatPercentage?: number;
}

export interface Transaction {
  transaction_id: string;
  rep_uid: string;
  amount: number;
  type: TransactionType;
  date: string; // ISO string
  processed_status: 'pending' | 'processed';
}

export interface Payout {
  payout_id: string;
  rep_uid: string;
  cycle_month: string; // e.g., "2024-05"
  total_gross: number;
  total_commission: number;
  status: 'open' | 'closed';
}

/**
 * CommissionEngine handles all complex deterministc commission math
 * purely in the client-side browser, bypassing backend servers.
 */
export class CommissionEngine {
  /**
   * Sorts tiers ascending by threshold to ensure correct mathematical application.
   */
  private static sortTiers(tiers: Tier[]): Tier[] {
    return [...tiers].sort((a, b) => a.threshold - b.threshold);
  }

  /**
   * Calculates the commission for a given amount against a plan.
   * If the plan is tiered, it uses marginal progressive brackets.
   */
  public static calculateCommission(amount: number, plan: CommissionPlan): number {
    if (amount <= 0) return 0; // Clawbacks are handled by reducing total_gross first

    if (plan.type === 'flat') {
      const percentage = plan.flatPercentage || 0;
      return amount * (percentage / 100);
    }

    if (plan.type === 'tiered' && plan.tiers && plan.tiers.length > 0) {
      let commission = 0;

      const sortedTiers = this.sortTiers(plan.tiers);

      for (let i = 0; i < sortedTiers.length; i++) {
        const currentTier = sortedTiers[i];
        const nextTier = sortedTiers[i + 1];

        // The maximum amount that can be taxed in this bracket
        let amountInThisBracket = 0;

        if (nextTier) {
          // If there's a next tier, calculate the size of the current bracket
          const bracketSize = nextTier.threshold - currentTier.threshold;

          if (amount > currentTier.threshold) {
             // Calculate how much of the amount falls into this bracket
             const amountAboveThreshold = amount - currentTier.threshold;
             amountInThisBracket = Math.min(bracketSize, amountAboveThreshold);
          }
        } else {
          // Top tier - applies to everything above its threshold
          if (amount > currentTier.threshold) {
            amountInThisBracket = amount - currentTier.threshold;
          }
        }

        commission += amountInThisBracket * (currentTier.percentage / 100);
      }

      return Number(commission.toFixed(2));
    }

    return 0; // Fallback if no valid plan configuration
  }

  /**
   * Processes a batch of transactions for a specific rep within an open payout cycle.
   * Handles both 'sale' and 'clawback' types by adjusting the total_gross.
   * Recalculates the total_commission based on the new total_gross.
   */
  public static processTransactions(
    transactions: Transaction[],
    plan: CommissionPlan,
    currentPayout: Payout | null,
    cycleMonth: string,
    rep_uid: string
  ): Payout {

    // Initialize or clone the payout
    const payout: Payout = currentPayout ? { ...currentPayout } : {
      payout_id: crypto.randomUUID(),
      rep_uid,
      cycle_month: cycleMonth,
      total_gross: 0,
      total_commission: 0,
      status: 'open'
    };

    // If the payout is closed, we shouldn't modify it.
    // In a real scenario, an admin might need to reopen it or clawbacks roll over.
    // For this scope, we assume we only process against 'open' payouts.
    if (payout.status === 'closed') {
       console.warn("Attempting to process transactions on a closed payout cycle.");
       return payout;
    }

    // Apply all transactions to the total_gross
    for (const tx of transactions) {
      if (tx.type === 'sale') {
        payout.total_gross += tx.amount;
      } else if (tx.type === 'clawback') {
        payout.total_gross -= tx.amount;
      }
    }

    // Recalculate commission from scratch based on the new total_gross.
    // This perfectly handles retroactive tiers and clawbacks dropping reps down a tier.
    // If total_gross is negative (due to heavy clawbacks), commission is 0.
    if (payout.total_gross < 0) {
      payout.total_commission = 0;
    } else {
      payout.total_commission = this.calculateCommission(payout.total_gross, plan);
    }

    return payout;
  }
}
