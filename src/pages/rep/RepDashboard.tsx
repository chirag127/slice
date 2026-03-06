import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../lib/firebase/config';
import { useAuth } from '../../context/AuthContext';
import { type Payout, type Transaction, type CommissionPlan } from '../../lib/CommissionEngine';
import { DollarSign, FileText, Activity } from 'lucide-react';
import { format } from 'date-fns';

const RepDashboard: React.FC = () => {
  const { user } = useAuth();
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>([]);
  const [plan, setPlan] = useState<CommissionPlan | null>(null);
  const [loading, setLoading] = useState(true);

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

      } catch (error) {
        console.error("Error fetching rep data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user]);

  if (loading) return <div className="p-8 text-center text-secondary">Loading your dashboard...</div>;

  if (!user?.plan_id) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              You currently do not have a commission plan assigned. Please contact your administrator.
            </p>
          </div>
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
