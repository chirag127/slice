<<<<<<< HEAD
import { useState, useEffect } from 'react';
import {
    Users,
    TrendingUp,
    AlertCircle,
    CheckCircle,
    Clock,
    ArrowRight,
    Calculator
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore';
import { CurrencyUtils } from '../../lib/utils/currency';
import { PayoutBatchManager } from '../../lib/PayoutBatchManager';
import { useAuth } from '../../context/AuthContext';
=======
import React, { useState } from 'react';
import UserManagement from './components/UserManagement';
import PlanManagement from './components/PlanManagement';
import CsvUpload from './components/CsvUpload';
>>>>>>> bcda1b509d88e925507d3cf43fe44e3e34c7adaf

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'upload'>('users');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Admin Dashboard</h1>
      </div>

<<<<<<< HEAD
export default function AdminDashboard() {
    const { user: authUser } = useAuth();
    const [stats, setStats] = useState<Stats>({
        totalUsers: 0,
        pendingApprovals: 0,
        totalSalesVolume: 0,
        activePlans: 0
    });
    const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);

    useEffect(() => {
        fetchAdminData();
    }, []);

    async function fetchAdminData() {
        setLoading(true);
        try {
            const usersSnap = await getDocs(collection(db, 'users'));
            const plansSnap = await getDocs(collection(db, 'plans'));
            const transSnap = await getDocs(collection(db, 'transactions'));

            const allUsers = usersSnap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile));
            const pending = allUsers.filter(u => u.role === 'pending');

            let volume = 0;
            transSnap.forEach(d => {
                volume += d.data().amount || 0;
            });

            setStats({
                totalUsers: allUsers.length,
                pendingApprovals: pending.length,
                totalSalesVolume: volume,
                activePlans: plansSnap.size
            });

            setPendingUsers(pending);
        } catch (error: unknown) {
            console.error("Error fetching admin data:", error);
        } finally {
            setLoading(false);
        }
    }

    async function handleApprove(uid: string) {
        try {
            await updateDoc(doc(db, 'users', uid), { role: 'rep' });
            setPendingUsers(prev => prev.filter(u => u.uid !== uid));
            setStats(prev => ({ ...prev, pendingApprovals: prev.pendingApprovals - 1 }));
        } catch (error: unknown) {
            console.error(error);
            alert("Failed to approve user");
        }
    }

    async function handleGeneratePayouts() {
        const month = new Date().toISOString().slice(0, 7); // YYYY-MM
        if (!window.confirm(`Generate payouts for ${month}?`)) return;

        setIsGenerating(true);
        try {
            const results = await PayoutBatchManager.generateMonthlyPayouts(
                month,
                authUser ? { uid: authUser.uid, email: authUser.email || 'Admin' } : undefined
            );
            alert(`Successfully generated ${results.length} payouts.`);
        } catch (error: unknown) {
            console.error(error);
            alert("Payout generation failed. Check console for details.");
        } finally {
            setIsGenerating(false);
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-8 text-black font-inter">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Admin Command Center</h1>
                    <p className="text-gray-500">Global system overview and user management.</p>
                </div>
                <button
                    onClick={handleGeneratePayouts}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-100 disabled:opacity-50 cursor-pointer"
                >
                    <Calculator size={18} />
                    {isGenerating ? 'Calculating...' : 'Generate Payouts'}
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    title="Total Users"
                    value={stats.totalUsers.toString()}
                    icon={<Users className="w-5 h-5" />}
                    trend="+2 this week"
                />
                <StatCard
                    title="Pending Approvals"
                    value={stats.pendingApprovals.toString()}
                    icon={<Clock className="w-5 h-5" />}
                    color={stats.pendingApprovals > 0 ? "text-amber-600" : "text-gray-600"}
                />
                <StatCard
                    title="Total Volume"
                    value={CurrencyUtils.formatINR(stats.totalSalesVolume)}
                    icon={<TrendingUp className="w-5 h-5" />}
                    trend="Automated tracking"
                />
                <StatCard
                    title="Commission Plans"
                    value={stats.activePlans.toString()}
                    icon={<CheckCircle className="w-5 h-5" />}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                        <h2 className="font-semibold text-gray-900 font-outfit">Pending User Approvals</h2>
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="divide-y divide-gray-100 font-inter">
                        {pendingUsers.length === 0 ? (
                            <div className="px-6 py-12 text-center text-gray-500">
                                No users awaiting approval.
                            </div>
                        ) : (
                            pendingUsers.map(user => (
                                <div key={user.uid} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors">
                                    <div>
                                        <p className="font-medium text-gray-900">{user.email}</p>
                                        <p className="text-sm text-gray-500">Joined on {user.createdAt ? new Date(user.createdAt?.seconds * 1000).toLocaleDateString() : 'Just now'}</p>
                                    </div>
                                    <button
                                        onClick={() => handleApprove(user.uid)}
                                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Approve <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-4 font-outfit">Quick Actions</h3>
                        <div className="space-y-2">
                            <ActionButton label="Create Commission Plan" />
                            <ActionButton label="Import Bulk Transactions" />
                            <ActionButton label="Export Monthly Report" />
                            <ActionButton label="System Settings" />
                        </div>
                    </div>

                    <div className="bg-[#F8FAFC] p-6 rounded-xl border border-slate-200">
                        <h3 className="font-semibold text-[#0F172A] mb-2 font-outfit">Zero-Cost Infrastructure</h3>
                        <p className="text-sm text-slate-600 leading-relaxed font-inter">
                            Analytics and commission settlements are processed entirely in-browser.
                            Your database costs remain near $0 even with high scale.
                        </p>
                    </div>
                </div>
            </div>
=======
      <div className="bg-surface shadow rounded-lg">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-secondary hover:text-primary hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`${
                activeTab === 'plans'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-secondary hover:text-primary hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Commission Plans
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`${
                activeTab === 'upload'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-secondary hover:text-primary hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Upload Transactions
            </button>
          </nav>
>>>>>>> bcda1b509d88e925507d3cf43fe44e3e34c7adaf
        </div>

        <div className="p-6">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'plans' && <PlanManagement />}
          {activeTab === 'upload' && <CsvUpload />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
