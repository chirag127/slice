import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { useAuth } from '../../context/AuthContext';
<<<<<<< HEAD
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
import { CurrencyUtils } from '../../lib/utils/currency';
import {
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from 'recharts';

export default function RepDashboard() {
    const { user, profile } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [plan, setPlan] = useState<CommissionPlan | null>(null);
    const [loading, setLoading] = useState(true);
    const [summary, setSummary] = useState<PayoutSummary | null>(null);
    const [showBreakdown, setShowBreakdown] = useState(false);
    const [trendData, setTrendData] = useState<any[]>([]);
    const [projected, setProjected] = useState(0);
    const [stats, setStats] = useState({
        totalSales: 0,
        commission: 0,
        count: 0,
        tier: 'Standard'
    });
=======
import { type Payout, type Transaction, type CommissionPlan } from '../../lib/CommissionEngine';
import { DollarSign, FileText, Activity } from 'lucide-react';
import { format } from 'date-fns';

const RepDashboard: React.FC = () => {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [plan, setPlan] = useState<CommissionPlan | null>(null);
  const [loading, setLoading] = useState(true);
>>>>>>> bcda1b509d88e925507d3cf43fe44e3e34c7adaf

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!user?.uid || !user?.plan_id) {
        setLoading(false);
        return;
      }

      setLoading(true);
      try {
        // Fetch Plan Details
        const planDoc = await getDocs(query(collection(db, 'commission_plans'), where('plan_id', '==', user.plan_id)));
        if (!planDoc.empty) {
          setPlan(planDoc.docs[0].data() as CommissionPlan);
        }

        // Fetch Open Payouts
        const payoutsQuery = query(
          collection(db, 'payouts'),
          where('rep_uid', '==', user.uid),
          orderBy('cycle_month', 'desc')
        );
        const payoutsSnap = await getDocs(payoutsQuery);
        setPayouts(payoutsSnap.docs.map(doc => doc.data() as Payout));

        // Fetch Recent Transactions
        const txQuery = query(
          collection(db, 'transactions'),
          where('rep_uid', '==', user.uid),
          orderBy('date', 'desc')
        );
        const txSnap = await getDocs(txQuery);
        setRecentTransactions(txSnap.docs.map(doc => doc.data() as Transaction).slice(0, 50)); // Limit client side for view

<<<<<<< HEAD
            const q = query(
                collection(db, 'transactions'),
                where('repId', '==', user?.uid),
                where('date', '>=', startOfMonth),
                orderBy('date', 'desc')
            );

            const snap = await getDocs(q);
            const ts = snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction));
            setTransactions(ts);

            // 3. Calculate Stats & Projections
            if (currentPlan) {
                const netSales = ts.reduce((sum, t) => {
                    const amount = t.type === 'split' ? t.amount * (t.splitPercentage || 0.5) : (t.type === 'clawback' ? -t.amount : t.amount);
                    return sum + amount;
                }, 0);

                const payout = CommissionEngine.calculatePayout(ts, currentPlan);
                setSummary(payout);

                // Task 110: Projected Earnings (Linear Projection)
                const dayOfMonth = now.getDate();
                const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
                const velocity = Math.max(0, netSales) / Math.max(1, dayOfMonth);
                const projectedSales = velocity * daysInMonth;

                const mockTs: Transaction[] = [{
                    id: 'mock',
                    amount: projectedSales,
                    date: now.toISOString(),
                    type: 'sale',
                    repId: user?.uid || ''
                }];
                const projectedPayout = CommissionEngine.calculatePayout(mockTs, currentPlan);
                setProjected(projectedPayout.payoutAmount);

                setStats({
                    totalSales: netSales,
                    commission: payout.payoutAmount,
                    count: ts.length,
                    tier: netSales >= (currentPlan.quota || 10000000) ? 'Accelerator 🚀' : 'Standard'
                });

                // Task 113: Sales Trend (Last 7 days)
                const trend: Record<string, number> = {};
                for (let i = 6; i >= 0; i--) {
                    const d = new Date();
                    d.setDate(d.getDate() - i);
                    trend[d.toISOString().split('T')[0]] = 0;
                }
                ts.forEach(t => {
                    const dateKey = t.date.split('T')[0];
                    if (trend[dateKey] !== undefined) {
                        trend[dateKey] += (t.type === 'sale' ? t.amount : 0);
                    }
                });
                setTrendData(Object.entries(trend).map(([name, value]) => ({
                    name: name.split('-').reverse().slice(0, 2).reverse().join('/'),
                    value
                })));
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

    const quota = plan?.quota || 500000;
    const progress = Math.min(100, Math.round((stats.totalSales / quota) * 100));

    return (
        <div className="space-y-8 animate-in fade-in duration-500 text-black font-inter pb-12">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black text-gray-900 font-outfit tracking-tight">Rep Command Center</h1>
                    <p className="text-gray-500 font-medium">Performance intelligence for {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}.</p>
                </div>
                <div className="flex items-center gap-3 px-6 py-3 bg-white border border-gray-100 rounded-[2rem] shadow-sm">
                    <Calendar className="w-5 h-5 text-blue-600" />
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Cycle</p>
                        <p className="text-sm font-black text-gray-900">{new Date().toISOString().substring(0, 7)}</p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Monthly Volume"
                    value={CurrencyUtils.formatINR(stats.totalSales)}
                    icon={<Activity className="w-6 h-6" />}
                    trend="Real-time sales"
                    color="blue"
                />
                <StatCard
                    title="Current Earnings"
                    value={CurrencyUtils.formatINR(stats.commission)}
                    icon={<DollarSign className="w-6 h-6" />}
                    trend="Calculated payout"
                    color="green"
                />
                <StatCard
                    title="Projected Payout"
                    value={CurrencyUtils.formatINR(projected)}
                    icon={<TrendingUp className="w-6 h-6" />}
                    trend="End of cycle forecast"
                    color="purple"
                />
                <StatCard
                    title="Status"
                    value={stats.tier}
                    icon={<Target className="w-6 h-6" />}
                    trend={progress >= 100 ? "Goal achieved!" : `Next tier at ${CurrencyUtils.formatINR(quota)}`}
                    color="amber"
                />
            </div>

            {/* Visual Insights */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Trend Chart */}
                <div className="lg:col-span-2 bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-50/50 rounded-bl-full -mr-20 -mt-20 transition-all group-hover:scale-110" />

                    <div className="flex justify-between items-center mb-10 relative">
                        <div>
                            <h3 className="text-xl font-black font-outfit">Sales Momentum</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">7-Day Daily Revenue</p>
                        </div>
                        <div className="flex gap-4">
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Volume (₹)</span>
                            </div>
                        </div>
                    </div>

                    <div className="h-[320px] w-full pr-4">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={trendData}>
                                <defs>
                                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    dy={15}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fontSize: 10, fontWeight: 900, fill: '#94a3b8' }}
                                    tickFormatter={(v) => `₹${v / 1000}k`}
                                />
                                <Tooltip
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.15)', padding: '16px' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '4px', fontSize: '10px', color: '#64748b' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="value"
                                    stroke="#3b82f6"
                                    strokeWidth={5}
                                    fillOpacity={1}
                                    fill="url(#colorValue)"
                                    animationDuration={2000}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Quota Progress */}
                <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden group">
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-slate-50 rounded-tr-full -ml-16 -mb-16 transition-all group-hover:scale-110" />

                    <h3 className="text-xl font-black font-outfit mb-2 relative">Target Tracking</h3>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-widest mb-12 relative">Progress to Accelerator</p>

                    <div className="flex-1 flex flex-col items-center justify-center relative">
                        <div className="relative w-56 h-56 flex items-center justify-center">
                            <svg className="w-full h-full transform -rotate-90">
                                <circle
                                    cx="112"
                                    cy="112"
                                    r="100"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    fill="transparent"
                                    className="text-slate-50"
                                />
                                <circle
                                    cx="112"
                                    cy="112"
                                    r="100"
                                    stroke="currentColor"
                                    strokeWidth="16"
                                    fill="transparent"
                                    strokeDasharray={2 * Math.PI * 100}
                                    strokeDashoffset={2 * Math.PI * 100 * (1 - progress / 100)}
                                    strokeLinecap="round"
                                    className="text-blue-600 transition-all duration-1000 ease-out"
                                />
                            </svg>
                            <div className="absolute flex flex-col items-center justify-center">
                                <span className="text-5xl font-black text-slate-900 font-outfit letter-tight">{progress}%</span>
                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Goal completion</span>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 space-y-5 relative">
                        <div className="flex justify-between items-end">
                            <div>
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Active Velocity</p>
                                <p className="text-lg font-black text-gray-900 font-outfit">{CurrencyUtils.formatINR(stats.totalSales)}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Milestone</p>
                                <p className="text-sm font-black text-slate-500">{CurrencyUtils.formatINR(quota)}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Plan Highlights Card */}
                <div className="bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-bl-full -mr-20 -mt-20 transition-all group-hover:scale-110" />

                    <h3 className="text-2xl font-black mb-8 font-outfit">Plan Details</h3>
                    <div className="space-y-6">
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Contract Type</p>
                            <p className="text-lg font-black text-white uppercase tracking-tight">{plan?.name || 'Standard Representative'}</p>
                        </div>
                        <div className="p-6 bg-white/5 rounded-3xl border border-white/10 hover:bg-white/10 transition-colors">
                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">Commission Rate</p>
                            <p className="text-lg font-black text-white">{plan?.baseRate || 0}% Baseline Profit Share</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowBreakdown(true)}
                        className="w-full mt-10 py-5 bg-white text-slate-900 rounded-3xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-blue-50 transition-all shadow-xl active:scale-95"
                    >
                        Detailed Calculation Audit
                    </button>
                </div>

                {/* Recent Activity Table */}
                <div className="lg:col-span-2 bg-white rounded-[3rem] border border-gray-100 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-10 border-b border-gray-50 flex flex-col md:flex-row justify-between items-center gap-4">
                        <div>
                            <h3 className="text-xl font-black font-outfit">Closing Events</h3>
                            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Latest verified contracts</p>
                        </div>
                        <div className="relative w-full md:w-auto">
                            <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search transactions..."
                                className="w-full md:w-72 pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            />
                        </div>
                    </div>

                    <div className="overflow-x-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50/50">
                                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Execution Date</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Client/Project</th>
                                    <th className="px-10 py-5 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Contract Value</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {transactions.length === 0 ? (
                                    <tr>
                                        <td colSpan={3} className="px-10 py-20 text-center text-gray-300 font-black uppercase tracking-[0.3em] text-[10px]">
                                            No recent closing activity
                                        </td>
                                    </tr>
                                ) : (
                                    transactions.slice(0, 4).map((t) => (
                                        <tr key={t.id} className="hover:bg-blue-50/50 transition-colors group">
                                            <td className="px-10 py-8 text-xs font-black text-slate-500">{new Date(t.date).toLocaleDateString()}</td>
                                            <td className="px-10 py-8">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-black text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{t.description || 'Enterprise Contract'}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className={`w-2 h-2 rounded-full ${t.type === 'sale' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.type} record</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-10 py-8 text-right font-black text-slate-900 font-outfit text-base">{CurrencyUtils.formatINR(t.amount)}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-8 bg-slate-50 text-center border-t border-slate-100">
                        <button className="text-[10px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-[0.3em] flex items-center justify-center gap-3 mx-auto transition-all group">
                            Access Digital Ledger <ChevronRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Breakdown Modal */}
            {showBreakdown && summary && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-2xl transition-all">
                    <div className="relative w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden animate-in zoom-in-95 duration-500 border border-white/20">
                        <button
                            onClick={() => setShowBreakdown(false)}
                            className="absolute top-8 right-8 p-3 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-all z-10 active:scale-90"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <PayoutBreakdown summary={summary} plan={plan!} />
                        <div className="p-10 bg-slate-50 flex justify-end gap-4 border-t border-slate-100">
                            <button
                                onClick={() => setShowBreakdown(false)}
                                className="px-14 py-5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-3xl hover:bg-slate-800 transition-all shadow-2xl active:scale-95"
                            >
                                Close Audit
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatCard({ title, value, icon, trend, color }: { title: string, value: string, icon: any, trend: string, color: 'blue' | 'green' | 'purple' | 'amber' }) {
    const variants = {
        blue: 'from-blue-600 to-indigo-600 text-blue-600 bg-blue-50 border-blue-100',
        green: 'from-emerald-600 to-teal-600 text-emerald-600 bg-emerald-50 border-emerald-100',
        purple: 'from-purple-600 to-violet-600 text-purple-600 bg-purple-50 border-purple-100',
        amber: 'from-amber-500 to-orange-600 text-amber-600 bg-amber-50 border-amber-100'
=======
      } catch (error) {
        console.error("Error fetching rep data:", error);
      } finally {
        setLoading(false);
      }
>>>>>>> bcda1b509d88e925507d3cf43fe44e3e34c7adaf
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-secondary">Loading your dashboard...</div>;

  if (!user?.plan_id) {
    return (
<<<<<<< HEAD
        <div className="bg-white p-10 rounded-[3rem] border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-700 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 opacity-5 rounded-bl-full -mr-12 -mt-12 bg-current transition-all group-hover:scale-125 duration-700 ${variants[color].split(' ')[2]}`} />

            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-8 shadow-xl shadow-current/5 border transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 ${variants[color]}`}>
                {icon}
            </div>

            <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-2">{title}</p>
            <h4 className="text-3xl font-black text-gray-900 font-outfit mb-6 tracking-tight">{value}</h4>

            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${variants[color].split(' ')[2]}`} />
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{trend}</span>
            </div>
=======
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You currently do not have a commission plan assigned. Please contact your administrator.
            </p>
          </div>
>>>>>>> bcda1b509d88e925507d3cf43fe44e3e34c7adaf
        </div>
      </div>
    );
  }

  // Calculate current open cycle totals
  const openPayout = payouts.find(p => p.status === 'open');
  const currentCommission = openPayout?.total_commission || 0;
  const currentGross = openPayout?.total_gross || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary tracking-tight">My Commissions</h1>
        <div className="text-sm text-secondary bg-surface px-3 py-1 rounded-full border border-border">
          Plan: <span className="font-semibold">{plan?.name || 'Unknown'}</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="bg-surface overflow-hidden shadow rounded-lg border border-border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <DollarSign className="h-6 w-6 text-green-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary truncate">Estimated Commission (Open Cycle)</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-primary">
                      ${currentCommission.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-surface overflow-hidden shadow rounded-lg border border-border">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Activity className="h-6 w-6 text-blue-500" aria-hidden="true" />
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-secondary truncate">Total Gross Volume (Open Cycle)</dt>
                  <dd className="flex items-baseline">
                    <div className="text-2xl font-bold text-primary">
                      ${currentGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Payouts History Table */}
        <div className="bg-surface shadow sm:rounded-lg border border-border">
          <div className="px-4 py-5 sm:px-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-primary">Payout Cycles</h3>
            <FileText className="h-5 w-5 text-secondary" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Cycle Month</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Gross Volume</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Commission</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {payouts.map((payout) => (
                  <tr key={payout.payout_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{payout.cycle_month}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">${payout.total_gross.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-accent">${payout.total_commission.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${payout.status === 'open' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {payout.status.toUpperCase()}
                      </span>
                    </td>
                  </tr>
                ))}
                {payouts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-center">No payouts found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Transactions Table */}
        <div className="bg-surface shadow sm:rounded-lg border border-border">
          <div className="px-4 py-5 sm:px-6 border-b border-border flex items-center justify-between">
            <h3 className="text-lg leading-6 font-medium text-primary">Recent Transactions</h3>
            <Activity className="h-5 w-5 text-secondary" />
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Date</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Type</th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-secondary uppercase tracking-wider">Amount</th>
                </tr>
              </thead>
              <tbody className="bg-surface divide-y divide-border">
                {recentTransactions.map((tx) => (
                  <tr key={tx.transaction_id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      {format(new Date(tx.date), 'MMM dd, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${tx.type === 'sale' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {tx.type.toUpperCase()}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${tx.type === 'clawback' ? 'text-danger' : 'text-primary'}`}>
                      {tx.type === 'clawback' ? '-' : '+'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                  </tr>
                ))}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-6 py-4 whitespace-nowrap text-sm text-secondary text-center">No transactions found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RepDashboard;
