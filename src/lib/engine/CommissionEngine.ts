import type { Transaction, CommissionPlan } from './types';

export class CommissionEngine {
    /**
     * Calculates the payout for a list of transactions against a specific plan.
     * All math is performed in the browser for zero-cost scalability.
     */
    static calculatePayout(transactions: Transaction[], plan: CommissionPlan) {
        let totalSales = 0;
        let totalClawbacks = 0;
        let grossCommission = 0;
        const breakdown: any[] = [];

        // 1. Separate transactions
        const allSales = transactions.filter(t => t.type === 'sale' || t.type === 'split');
        const clawbacks = transactions.filter(t => t.type === 'clawback');

        // 2. Process splits and calculate Total Sales (Gross)
        const processedSales = allSales.map(t => ({
            ...t,
            effectiveAmount: t.type === 'split' ? t.amount * (t.splitPercentage || 0.5) : t.amount
        }));

        totalSales = processedSales.reduce((sum, t) => sum + t.effectiveAmount, 0);
        totalClawbacks = clawbacks.reduce((sum, t) => sum + Math.abs(t.amount), 0);

        // 3. Determine Commission Rate/Amount
        if (plan.isCumulative) {
            // Find the highest applicable tier
            const sortedTiers = [...plan.tiers].sort((a, b) => b.threshold - a.threshold);
            const applicableTier = sortedTiers.find(tier => totalSales >= tier.threshold);

            const rate = applicableTier ? applicableTier.rate : plan.baseRate;

            // If we have an accelerator, we only apply the tier rate up to the quota
            const amountForTierRate = (plan.quota && totalSales > plan.quota)
                ? plan.quota
                : totalSales;

            const baseComm = amountForTierRate * rate;
            grossCommission = baseComm;

            breakdown.push({
                ruleId: applicableTier ? `Tier: ${applicableTier.threshold}` : 'Base Rate',
                description: `Applied ${rate}% rate to ${amountForTierRate.toLocaleString()} in sales.`,
                amount: this.round(baseComm),
                rate: rate
            });

            // Add fixed fees if applicable
            if (applicableTier?.fixedFee) {
                const totalFixed = processedSales.length * applicableTier.fixedFee;
                grossCommission += totalFixed;
                breakdown.push({
                    ruleId: 'Fixed Fee',
                    description: `₹${applicableTier.fixedFee} fee per deal for ${processedSales.length} deals.`,
                    amount: totalFixed
                });
            }
        } else {
            // Marginal Tiers (Tax-bracket style)
            let remainingSales = totalSales;
            const sortedTiers = [...plan.tiers].sort((a, b) => a.threshold - b.threshold);

            for (let i = 0; i < sortedTiers.length; i++) {
                const currentTier = sortedTiers[i];
                const nextTier = sortedTiers[i + 1];
                const tierCap = nextTier ? nextTier.threshold : (plan.quota || Infinity);

                const amountInThisTier = Math.min(
                    Math.max(0, remainingSales),
                    tierCap - currentTier.threshold
                );

                const tierComm = amountInThisTier * currentTier.rate;

                if (amountInThisTier > 0) {
                    grossCommission += tierComm;
                    breakdown.push({
                        ruleId: `Marginal Tier ${i + 1}`,
                        description: `Applied ${currentTier.rate}% to ${amountInThisTier.toLocaleString()} within tier limits.`,
                        amount: this.round(tierComm),
                        rate: currentTier.rate
                    });
                }
                remainingSales -= amountInThisTier;
                if (remainingSales <= 0) break;
            }
        }

        // 4. Handle Quota Accelerators (if sales exceed quota, apply separate rate for surplus)
        if (plan.acceleratorRate && plan.quota !== undefined && totalSales > plan.quota) {
            const surplus = totalSales - plan.quota;
            const accelComm = surplus * plan.acceleratorRate;
            grossCommission += accelComm;
            breakdown.push({
                ruleId: 'Accelerator',
                description: `Applied bonus ${plan.acceleratorRate}% to surplus sales of ₹${surplus.toLocaleString()}.`,
                amount: this.round(accelComm),
                rate: plan.acceleratorRate
            });
        }

        // 5. Final Payout
        if (totalClawbacks > 0) {
            breakdown.push({
                ruleId: 'Clawbacks',
                description: 'Deductions for cancelled or refunded deals.',
                amount: -this.round(totalClawbacks)
            });
        }

        const payoutAmount = Math.max(0, grossCommission - totalClawbacks);

        return {
            totalSales: this.round(totalSales),
            totalClawbacks: this.round(totalClawbacks),
            grossCommission: this.round(grossCommission),
            payoutAmount: this.round(payoutAmount),
            tierReached: plan.tiers.filter(t => totalSales >= t.threshold).length,
            breakdown
        };
    }

    private static round(value: number): number {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }

    /**
     * Precision rounding for financial numbers
     */
    static formatCurrency(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 2
        }).format(amount);
    }
}
