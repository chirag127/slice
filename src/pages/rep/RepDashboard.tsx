import { useState, useEffect } from 'react';
import {
    DollarSign,
    TrendingUp,
    Users,
    Activity,
    Calendar,
    ChevronRight,
    AlertCircle,
    Target,
    X,
    Search,
    ArrowUpRight
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db } from '../../lib/firebase';
import {
    collection,
    query,
    where,
    getDocs,
    orderBy,
    doc,
    getDoc
} from 'firebase/firestore';
import { CommissionEngine } from '../../lib/engine/CommissionEngine';
import type { Transaction, CommissionPlan, PayoutSummary } from '../../lib/engine/types';
import PayoutBreakdown from '../../components/rep/PayoutBreakdown';

export default function RepDashboard() {
    const { user, profile } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [plan, setPlan] = useState<CommissionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<PayoutSummary | null>(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [stats, setStats] = useState({
        totalSales: 0,
        commission: 0,
        count: 0,
        tier: 'Standard'
    });

    useEffect(() => {
        if (user && profile?.plan_id) {
            fetchData();
        }
    }, [user, profile]);

    async function fetchData() {
        setLoading(true);
        try {
            // 1. Fetch Plan
            let currentPlan: CommissionPlan | null = null;
            if (profile?.plan_id) {
                const planSnap = await getDoc(doc(db, 'plans', profile.plan_id));
                if (planSnap.exists()) {
                    currentPlan = { id: planSnap.id, ...planSnap.data() } as CommissionPlan;
                    setPlan(currentPlan);
                }
            }

            // 2. Fetch Transactions for current month
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

            const q = query(
                collection(db, 'transactions'),
                where('repId', '==', user?.uid),
                where('date', '>=', startOfMonth),
                orderBy('date', 'desc')
            );

            const snap = await getDocs(q);
            const ts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
            setTransactions(ts);

            // 3. Calculate Stats
            if (currentPlan) {
                const payout = CommissionEngine.calculatePayout(ts, currentPlan);
                setSummary(payout);
                setStats({
                    totalSales: ts.reduce((sum, t) => sum + (t.type === 'sale' ? t.amount : 0), 0),
                    commission: payout.payoutAmount,
                    count: ts.length,
                    tier: ts.reduce((sum, t) => sum + t.amount, 0) >= (currentPlan.quota || 0) ? 'Accelerator 🚀' : 'Standard'
                });
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-black font-inter">
            {/* Greeting & Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 font-outfit">Rep Command Center</h1>
                    <p className="text-gray-500 font-medium tracking-tight">Welcome back! Here's your performance for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-100 rounded-2xl">
                    <Calendar className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-bold text-blue-700">Current Period: {new Date().toISOString().substring(0, 7)}</span>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    label="Estimated Commission"
                    value={`₹${stats.commission.toLocaleString()}`}
                    icon={<DollarSign className="w-5 h-5" />}
                    color="blue"
                />
                <StatCard
                    label="Monthly Volume"
                    value={`₹${stats.totalSales.toLocaleString()}`}
                    icon={<TrendingUp className="w-5 h-5" />}
                    color="green"
                />
                <StatCard
                    label="Deals Closed"
                    value={stats.count.toString()}
                    icon={<Activity className="w-5 h-5" />}
                    color="purple"
                />
                <StatCard
                    label="Current Status"
                    value={stats.tier}
                    icon={<Target className="w-5 h-5" />}
                    color="amber"
                />
            </div>

            {/* Middle Section: Progress & Plan Info */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-200 p-8 shadow-sm">
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h3 className="text-xl font-bold text-gray-900 font-outfit">Quota Progress</h3>
                            <p className="text-sm text-gray-500 font-medium">Progress towards your next accelerator tier.</p>
                        </div>
                        <span className="text-2xl font-black text-blue-600">
                            {Math.round((stats.totalSales / (plan?.quota || 1)) * 100)}%
                        </span>
                    </div>

                    <div className="relative h-4 bg-gray-100 rounded-full overflow-hidden mb-4">
                        <div
                            className="absolute top-0 left-0 h-full bg-blue-600 transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(37,99,235,0.4)]"
                            style={{ width: `${Math.min(100, (stats.totalSales / (plan?.quota || 1)) * 100)}%` }}
                        />
                    </div>

                    <div className="flex justify-between text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
                        <span>Baseline: ₹0</span>
                        <span>Accelerator Milestone: ₹{(plan?.quota || 0).toLocaleString()}</span>
                    </div>
                </div>

                <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl shadow-slate-200">
                    <h3 className="text-xl font-bold mb-6 font-outfit">Active Plan Details</h3>
                    <div className="space-y-4">
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Assigned Plan</p>
                            <p className="text-base font-bold text-white">{plan?.name || 'Assigned Soon'}</p>
                        </div>
                        <div className="p-5 bg-white/5 rounded-2xl border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Standard Rate</p>
                            <p className="text-base font-bold text-white">{plan?.baseRate || 0}% Per Sale</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowBreakdown(true)}
                        className="w-full mt-8 py-4 bg-white text-slate-900 rounded-2xl text-sm font-black hover:bg-blue-50 transition-all shadow-lg active:scale-95"
                    >
                        View Calculation breakdown
                    </button>
                </div>
            </div>

            {/* Breakdown Modal */}
            {showBreakdown && summary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md transition-all">
                    <div className="relative w-full max-w-2xl bg-white rounded-[2rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <button
                            onClick={() => setShowBreakdown(false)}
                            className="absolute top-6 right-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors z-10"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <PayoutBreakdown summary={summary} plan={plan!} />
                        <div className="p-6 bg-gray-50 flex justify-end">
                            <button
                                onClick={() => setShowBreakdown(false)}
                                className="px-10 py-3 bg-slate-900 text-white font-black rounded-xl hover:bg-slate-800 transition-all shadow-lg shadow-slate-200"
                            >
                                Understood
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bottom Section: Recent Activity */}
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-12">
                <div className="p-8 border-b border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div>
                        <h3 className="text-xl font-bold text-gray-900 font-outfit">My Recent Deals</h3>
                        <p className="text-sm text-gray-500 font-medium">Your latest transactions for this billing cycle.</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find a deal..."
                            className="w-full md:w-64 pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50/50">
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Description</th>
                                <th className="px-8 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-8 py-5 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sale Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-[10px]">
                                        No transactions found for this period.
                                    </td>
                                </tr>
                            ) : (
                                transactions.slice(0, 5).map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6 text-sm font-bold text-gray-900">{new Date(t.date).toLocaleDateString()}</td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900">{t.description || 'Enterprise Deal'}</span>
                                                <span className="text-[10px] text-gray-400 font-mono tracking-tighter mt-0.5">ID: #{t.id.substring(0, 8)}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${t.type === 'sale'
                                                ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
                                                : 'bg-rose-50 text-rose-700 border-rose-100'
                                                }`}>
                                                {t.type}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-right font-black text-gray-900">₹{t.amount.toLocaleString()}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-gray-50/50 text-center border-t border-gray-100">
                    <button className="text-xs font-black text-blue-600 hover:text-blue-700 uppercase tracking-widest flex items-center justify-center gap-2 mx-auto transition-all hover:gap-3">
                        Visit Full history vault <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, icon, color }: { label: string, value: string, icon: any, color: 'blue' | 'green' | 'purple' | 'amber' }) {
    const variants = {
        blue: 'from-blue-600 to-blue-700 shadow-blue-100',
        green: 'from-emerald-600 to-emerald-700 shadow-emerald-100',
        purple: 'from-indigo-600 to-indigo-700 shadow-indigo-100',
        amber: 'from-amber-500 to-amber-600 shadow-amber-100'
    };

    return (
        <div className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
            <div className={`w-12 h-12 bg-gradient-to-br ${variants[color]} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform duration-500`}>
                {icon}
            </div>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-1">{label}</p>
            <h4 className="text-2xl font-black text-gray-900 font-outfit">{value}</h4>
        </div>
    );
}
