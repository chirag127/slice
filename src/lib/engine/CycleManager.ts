import type { Transaction } from './types';

export class CycleManager {
    /**
     * Groups transactions by a period key (e.g., "2026-03" for monthly or "2026-Q1" for quarterly)
     */
    static groupTransactionsByPeriod(transactions: Transaction[], type: 'monthly' | 'quarterly' = 'monthly') {
        const groups: Record<string, Transaction[]> = {};

        transactions.forEach(t => {
            const periodKey = CycleManager.getCycle(t.date, type);
            if (!groups[periodKey]) {
                groups[periodKey] = [];
            }
            groups[periodKey].push(t);
        });

        return groups;
    }

    /**
     * Filter transactions for a specific period
     */
    static filterByPeriod(transactions: Transaction[], periodKey: string, type: 'monthly' | 'quarterly' = 'monthly') {
        const grouped = this.groupTransactionsByPeriod(transactions, type);
        return grouped[periodKey] || [];
    }

    /**
     * Get the period key for a specific date
     */
    static getCycle(dateStr: string, type: 'monthly' | 'quarterly' = 'monthly'): string {
        const date = new Date(dateStr);
        if (type === 'monthly') {
            const month = String(date.getMonth() + 1).padStart(2, '0');
            return `${date.getFullYear()}-${month}`;
        } else {
            const quarter = Math.floor(date.getMonth() / 3) + 1;
            return `${date.getFullYear()}-Q${quarter}`;
        }
    }
}
