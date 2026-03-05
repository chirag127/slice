export class CurrencyUtils {
    /**
     * Formats a number as Indian Rupee (INR)
     */
    static formatINR(amount: number): string {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 2,
        }).format(amount);
    }

    /**
     * Precision arithmetic for currency to avoid floating point issues
     */
    static round(value: number): number {
        return Math.round((value + Number.EPSILON) * 100) / 100;
    }

    /**
     * Converts a value to local currency string (compact)
     * Example: 1,50,000 -> ₹1.5L
     */
    static formatCompact(amount: number): string {
        const formatter = Intl.NumberFormat('en-IN', {
            notation: 'compact',
            style: 'currency',
            currency: 'INR',
        });
        return formatter.format(amount);
    }
}
