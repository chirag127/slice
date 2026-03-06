import { useState, useEffect } from 'react';
import {
    CreditCard,
    Calendar,
    ArrowUpRight,
    TrendingUp
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy
} from 'firebase/firestore';
import { CurrencyUtils } from '../../lib/utils/currency';
import PayoutDetailModal from '../../components/shared/PayoutDetailModal';

interface PayoutRecord {
    id: string;
    month: string;
    repEmail: string;
    planName: string;
    totalSales: number;
    grossCommission: number;
    netCommission: number;
    payoutAmount: number;
    status: string;
    breakdown: any[];
    nextCarryover?: number;
    createdAt?: any;
}

export default function MyPayouts() {
    const { user } = useAuth();
    const [payouts, setPayouts] = useState<PayoutRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayout, setSelectedPayout] = useState<PayoutRecord | null>(null);

    useEffect(() => {
        if (user) {
            fetchPayouts();
        }
    }, [user]);

    async function fetchPayouts() {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'payouts'),
                where('repId', '==', user?.uid),
                orderBy('month', 'desc')
            );
            const snap = await getDocs(q);
            setPayouts(snap.docs.map(d => ({ id: d.id, ...d.data() } as PayoutRecord)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const totalLifetime = payouts.reduce((sum, p) => sum + p.payoutAmount, 0);

    return (
        <div className="space-y-8 text-black font-inter pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 font-outfit">My Earnings History</h1>
                    <p className="text-gray-500 font-medium">Track your historical performance and finalized payouts.</p>
                </div>
                <div className="flex items-center gap-4 px-6 py-3 bg-emerald-50 border border-emerald-100 rounded-2xl">
                    <TrendingUp className="w-5 h-5 text-emerald-600" />
                    <div>
                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Lifetime Earnings</p>
                        <p className="text-xl font-black text-emerald-900 font-outfit">{CurrencyUtils.formatINR(totalLifetime)}</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-medium">Loading your history...</div>
                ) : payouts.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-gray-50 rounded-[2.5rem] border-2 border-dashed border-gray-200">
                        <CreditCard className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                        <p className="text-gray-500 font-bold uppercase tracking-widest text-xs">No payouts recorded yet.</p>
                    </div>
                ) : (
                    payouts.map((p) => (
                        <div key={p.id} className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50/50 rounded-bl-full -mr-8 -mt-8 transition-all group-hover:scale-110" />

                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-100">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
                                    }`}>
                                    {p.status}
                                </span>
                            </div>

                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{p.month}</p>
                            <h4 className="text-2xl font-black text-gray-900 font-outfit mb-4">{CurrencyUtils.formatINR(p.payoutAmount)}</h4>

                            <div className="space-y-2 border-t border-gray-50 pt-4">
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-400 uppercase tracking-wider">Plan</span>
                                    <span className="text-gray-700">{p.planName}</span>
                                </div>
                                <div className="flex justify-between text-xs font-bold">
                                    <span className="text-gray-400 uppercase tracking-wider">Total Sales</span>
                                    <span className="text-gray-700">{CurrencyUtils.formatINR(p.totalSales)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setSelectedPayout(p)}
                                className="w-full mt-6 flex items-center justify-center gap-2 text-[10px] font-black text-blue-600 uppercase tracking-widest hover:gap-3 transition-all cursor-pointer"
                            >
                                View Full Breakdown <ArrowUpRight className="w-4 h-4" />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {
                selectedPayout && (
                    <PayoutDetailModal
                        payout={selectedPayout}
                        onClose={() => setSelectedPayout(null)}
                    />
                )
            }

            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 shadow-2xl">
                <div>
                    <h3 className="text-xl font-bold font-outfit mb-2">Need a detailed report?</h3>
                    <p className="text-slate-400 text-sm">Download your full annual earnings statement for tax purposes.</p>
                </div>
                <button className="px-8 py-4 bg-white text-slate-900 font-black rounded-2xl text-sm hover:bg-blue-50 transition-all">
                    Download Annual Report
                </button>
            </div>
        </div >
    );
}
