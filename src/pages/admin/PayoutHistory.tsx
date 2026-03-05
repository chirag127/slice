import { useState, useEffect } from 'react';
import {
    History,
    Download,
    Calendar,
    User as UserIcon,
    CheckCircle2
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import { CurrencyUtils } from '../../lib/utils/currency';

interface PayoutRecord {
    id: string;
    month: string;
    repEmail: string;
    planName: string;
    payoutAmount: number;
    status: string;
    createdAt: { seconds: number } | null;
}

export default function PayoutHistory() {
    const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPayouts();
    }, []);

    async function fetchPayouts() {
        setLoading(true);
        try {
            const q = query(collection(db, 'payouts'), orderBy('createdAt', 'desc'), limit(50));
            const snap = await getDocs(q);
            setPayouts(snap.docs.map(d => ({ id: d.id, ...d.data() } as PayoutRecord)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="space-y-6 text-black">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Payout History</h1>
                    <p className="text-gray-500">Review and audit all generated commission settlements.</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer">
                    <Download className="w-4 h-4" /> Global Export
                </button>
            </div>

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading payout records...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 font-outfit">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cycle</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Representative</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Plan</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Commission</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {payouts.map(p => (
                                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm font-bold text-gray-900">
                                            <Calendar className="w-4 h-4 text-blue-500" />
                                            {p.month}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                                <UserIcon size={14} />
                                            </div>
                                            <span className="text-sm font-medium text-gray-700">{p.repEmail}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {p.planName}
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                        {CurrencyUtils.formatINR(p.payoutAmount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-100">
                                            <CheckCircle2 className="w-3 h-3" />
                                            Paid
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {payouts.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center gap-2">
                                            <History size={40} className="text-gray-200" />
                                            <p>No payout history available yet.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
