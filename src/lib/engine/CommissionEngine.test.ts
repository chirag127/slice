import { describe, it, expect } from 'vitest';
import { CommissionEngine } from './CommissionEngine';
import { CycleManager } from './CycleManager';
import type { Transaction, CommissionPlan } from './types';

describe('CommissionEngine', () => {
    const mockPlan: CommissionPlan = {
        id: 'plan_1',
        name: 'Standard Tiered Plan',
        baseRate: 0.05,
        isCumulative: true,
        quota: 1000000,
        acceleratorRate: 0.10,
        tiers: [
            { threshold: 500000, rate: 0.07 },
            { threshold: 1000000, rate: 0.10, fixedFee: 5000 }
        ]
    };

    it('calculates flat commission correctly for low sales', () => {
        const transactions: Transaction[] = [
            { id: '1', date: '2026-03-01', amount: 100000, type: 'sale', repId: 'rep_1' }
        ];
        const result = CommissionEngine.calculatePayout(transactions, mockPlan);
        expect(result.grossCommission).toBe(5000);
        expect(result.payoutAmount).toBe(5000);
    });

    it('applies tiered rates correctly (Cumulative)', () => {
        const transactions: Transaction[] = [
            { id: '1', date: '2026-03-01', amount: 600000, type: 'sale', repId: 'rep_1' }
        ];
        const result = CommissionEngine.calculatePayout(transactions, mockPlan);
        expect(result.grossCommission).toBe(42000);
    });

    it('includes fixed fees in highest tier', () => {
        const transactions: Transaction[] = [
            { id: '1', date: '2026-03-01', amount: 1100000, type: 'sale', repId: 'rep_1' }
        ];
        const result = CommissionEngine.calculatePayout(transactions, mockPlan);

        // 1,000,000 sales at 10% = 100,000
        // 1 fixed fee at tier 1M = 5,000
        // 100,000 surplus at 10% = 10,000
        // Total = 115,000
        expect(result.grossCommission).toBe(115000);
    });

    it('handles split commissions correctly', () => {
        const transactions: Transaction[] = [
            { id: '1', date: '2026-03-01', amount: 100000, type: 'split', repId: 'rep_1', splitPercentage: 0.4 }
        ];
        const result = CommissionEngine.calculatePayout(transactions, mockPlan);

        // 100,000 * 0.4 = 40,000 effective sales
        // 40,000 * 0.05 (base rate) = 2,000
        expect(result.totalSales).toBe(40000);
        expect(result.grossCommission).toBe(2000);
    });

    it('deducts clawbacks and respects zero floor', () => {
        const transactions: Transaction[] = [
            { id: '1', date: '2026-03-01', amount: 100000, type: 'sale', repId: 'rep_1' },
            { id: '2', date: '2026-03-02', amount: 200000, type: 'clawback', repId: 'rep_1' }
        ];
        const result = CommissionEngine.calculatePayout(transactions, mockPlan);
        expect(result.payoutAmount).toBe(0);
        expect(result.totalClawbacks).toBe(200000);
    });
});

describe('CycleManager', () => {
    const transactions: Transaction[] = [
        { id: '1', date: '2026-03-15', amount: 100, type: 'sale', repId: '1' },
        { id: '2', date: '2026-03-20', amount: 200, type: 'sale', repId: '1' },
        { id: '3', date: '2026-04-05', amount: 300, type: 'sale', repId: '1' }
    ];

    it('groups by month correctly', () => {
        const groups = CycleManager.groupTransactionsByPeriod(transactions, 'monthly');
        expect(Object.keys(groups)).toContain('2026-03');
        expect(Object.keys(groups)).toContain('2026-04');
        expect(groups['2026-03']).toHaveLength(2);
    });

    it('groups by quarter correctly', () => {
        const groups = CycleManager.groupTransactionsByPeriod(transactions, 'quarterly');
        expect(Object.keys(groups)).toContain('2026-Q1');
        expect(Object.keys(groups)).toContain('2026-Q2');
    });
});
