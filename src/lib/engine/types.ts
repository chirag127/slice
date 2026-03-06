export type TransactionType = 'sale' | 'clawback' | 'bonus' | 'adjustment' | 'split';

export interface Transaction {
    id: string;
    date: string; // ISO string
    amount: number;
    type: TransactionType;
    repId: string;
    splitWith?: string; // UID of the other rep
    splitPercentage?: number; // e.g. 0.5 for 50/50
    metadata?: Record<string, string | number | boolean | null>;
    description?: string;
}

export interface CommissionTier {
    threshold: number;
    rate: number;
    fixedFee?: number;
}

export interface CommissionPlan {
    id: string;
    name: string;
    baseRate: number;
    isCumulative: boolean;
    tiers: CommissionTier[];
    quota?: number; // Quota for accelerators
    acceleratorRate?: number; // Rate after hitting quota
}

export interface PayoutBreakdownItem {
    ruleId: string;
    description: string;
    amount: number;
    rate?: number;
}

export interface PayoutSummary {
    totalSales: number;
    totalClawbacks: number;
    grossCommission: number;
    netCommission: number;
    payoutAmount: number;
    nextCarryover: number;
    tierReached: number;
    breakdown: PayoutBreakdownItem[];
}
