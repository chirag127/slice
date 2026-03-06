import { X, Calendar, User as UserIcon, Shield, CreditCard, ArrowRight } from 'lucide-react';
import { CurrencyUtils } from '@/lib/utils/currency';
import type { PayoutBreakdownItem } from '@/lib/engine/types';

interface PayoutDetailModalProps {
    payout: {
        id: string;
        month: string;
        repEmail: string;
        planName: string;
        totalSales: number;
        grossCommission: number;
        netCommission: number;
        payoutAmount: number;
        status: string;
        breakdown: PayoutBreakdownItem[];
        nextCarryover?: number;
        generatedBy?: string;
        createdAt?: { seconds: number } | any;
    };
    onClose: () => void;
}

export default function PayoutDetailModal({ payout, onClose }: PayoutDetailModalProps) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <div
                className="absolute inset-0 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="relative z-10 w-full max-w-2xl bg-white rounded-[2.5rem] shadow-2xl border border-gray-100 overflow-hidden text-black font-inter animate-in zoom-in slide-in-from-bottom-8 duration-500">
                {/* Header */}
                <div className="bg-slate-900 p-8 text-white relative">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-all text-slate-400 hover:text-white"
                    >
                        <X size={20} />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="px-3 py-1 bg-blue-500 text-[10px] font-black uppercase tracking-[0.2em] rounded-full">
                            Settlement Ledger
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${payout.status === 'paid' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-400'
                            }`}>
                            {payout.status}
                        </span>
                    </div>

                    <h2 className="text-3xl font-black font-outfit mb-1">{payout.month} Cycle</h2>
                    <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                        <UserIcon size={14} /> {payout.repEmail} • ID: {payout.id.substring(0, 8)}
                    </p>
                </div>

                {/* Body */}
                <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Sales Volume</p>
                            <p className="text-xl font-black text-slate-900 font-outfit">{CurrencyUtils.formatINR(payout.totalSales)}</p>
                        </div>
                        <div className="p-6 bg-blue-50 rounded-3xl border border-blue-100">
                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Final Payout</p>
                            <p className="text-xl font-black text-blue-900 font-outfit">{CurrencyUtils.formatINR(payout.payoutAmount)}</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div>
                            <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                                <Shield size={14} className="text-blue-600" /> Calculation Breakdown
                            </h3>
                            <div className="space-y-3">
                                {payout.breakdown.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-100 transition-all group">
                                        <div>
                                            <p className="text-xs font-black text-gray-900 group-hover:text-blue-600 transition-colors">{item.ruleId}</p>
                                            <p className="text-[10px] text-gray-500 font-medium">{item.description}</p>
                                        </div>
                                        <div className={`text-sm font-bold ${item.amount < 0 ? 'text-red-500' : 'text-emerald-600'}`}>
                                            {item.amount < 0 ? '-' : '+'}{CurrencyUtils.formatINR(Math.abs(item.amount))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {payout.nextCarryover !== undefined && payout.nextCarryover < 0 && (
                            <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <ArrowRight size={14} />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-red-900 uppercase tracking-widest">Negative Carryover</p>
                                        <p className="text-xs text-red-700 font-medium">To be deducted from next month.</p>
                                    </div>
                                </div>
                                <p className="text-sm font-black text-red-600 font-outfit">{CurrencyUtils.formatINR(payout.nextCarryover)}</p>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 pt-6 border-t border-gray-100 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                                Plan Applied
                            </div>
                            <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-700">
                                {payout.planName}
                            </div>
                        </div>
                        <p className="text-[10px] text-gray-400 font-medium">
                            Settled on {payout.createdAt ? new Date(payout.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                        </p>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-6 bg-slate-50 border-t border-gray-100 flex gap-4">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-xs font-black text-slate-600 uppercase tracking-widest border border-slate-200 rounded-xl hover:bg-white transition-all"
                    >
                        Close Ledger
                    </button>
                    <button className="flex-1 py-3 text-xs font-black text-white bg-blue-600 uppercase tracking-widest rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2">
                        <CreditCard size={14} /> Export Statement
                    </button>
                </div>
            </div>
        </div>
    );
}
