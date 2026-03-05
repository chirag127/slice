import {
    Info,
    ArrowRight,
    CheckCircle2,
    TrendingUp,
    ShieldAlert
} from 'lucide-react';
import type { PayoutSummary, CommissionPlan } from '../../lib/engine/types';

interface Props {
    summary: PayoutSummary;
    plan: CommissionPlan;
}

export default function PayoutBreakdown({ summary, plan }: Props) {
    const baseEarnings = summary.breakdown.find(b => b.ruleId === 'Base Rate')?.amount || 0;
    const acceleratorEarnings = summary.breakdown
        .filter(b => b.ruleId.includes('Accelerator'))
        .reduce((sum, b) => sum + b.amount, 0);

    return (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden font-inter text-black">
            <div className="p-8 bg-slate-900 text-white">
                <h3 className="text-xl font-bold font-outfit mb-2">Commission Logic Breakdown</h3>
                <p className="text-slate-400 text-sm">A transparent look at how your ₹{summary.payoutAmount.toLocaleString()} payout was calculated.</p>
            </div>

            <div className="p-8 space-y-8">
                {/* 1. Base Earnings */}
                <div className="flex gap-6">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
                        <Info className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-900">Base Commission</h4>
                                <p className="text-xs text-gray-500">Fixed rate of {plan.baseRate}% on all eligible sales.</p>
                            </div>
                            <span className="text-sm font-black">₹{baseEarnings.toLocaleString()}</span>
                        </div>
                        <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500 w-full" />
                        </div>
                    </div>
                </div>

                {/* 2. Accelerators */}
                <div className="flex gap-6">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
                        <TrendingUp className="w-6 h-6" />
                    </div>
                    <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                            <div>
                                <h4 className="font-bold text-gray-900">Accelerator Bonuses</h4>
                                <p className="text-xs text-gray-500">
                                    {acceleratorEarnings > 0
                                        ? "Congratulations! You've unlocked higher tier rates."
                                        : "Reach your quota to unlock bonus multipliers."}
                                </p>
                            </div>
                            <span className="text-sm font-black text-purple-600">
                                {acceleratorEarnings > 0 ? `+₹${acceleratorEarnings.toLocaleString()}` : '₹0'}
                            </span>
                        </div>
                        <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-purple-500 transition-all duration-1000"
                                style={{ width: acceleratorEarnings > 0 ? '100%' : '0%' }}
                            />
                        </div>
                    </div>
                </div>

                {/* 3. Deductions (Future: Clawbacks) */}
                {summary.breakdown.some(b => b.amount < 0) && (
                    <div className="flex gap-6">
                        <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center shrink-0">
                            <ShieldAlert className="w-6 h-6" />
                        </div>
                        <div className="flex-1 border-t border-gray-100 pt-6">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="font-bold text-gray-900 text-red-600">Adjustments / Deductions</h4>
                                    <p className="text-xs text-gray-500">Refunds, cancellations, or manual adjustments.</p>
                                </div>
                                <span className="text-sm font-black text-red-600">
                                    -₹{Math.abs(summary.breakdown.filter(b => b.amount < 0).reduce((s, b) => s + b.amount, 0)).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {/* Final Calculation Banner */}
                <div className="mt-10 p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Final Net Payout</p>
                            <p className="text-2xl font-black text-emerald-900 font-outfit">₹{summary.payoutAmount.toLocaleString()}</p>
                        </div>
                    </div>
                    <ArrowRight className="w-6 h-6 text-emerald-300" />
                </div>
            </div>

            <div className="px-8 py-4 bg-gray-50 text-[10px] text-gray-400 font-medium leading-relaxed">
                Note: Calculations are deterministic based on your assigned plan: <strong>{plan.name}</strong>. All sales are processed through the Slice Client-Side Engine v1.0.
            </div>
        </div>
    );
}
