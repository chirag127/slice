import React, { useEffect, useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../../lib/firebase/config';
import { type AppUser } from '../../../context/AuthContext';
import { type CommissionPlan } from '../../../lib/CommissionEngine';

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<AppUser[]>([]);
  const [plans, setPlans] = useState<CommissionPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const usersSnap = await getDocs(collection(db, 'users'));
        const usersData = usersSnap.docs.map(doc => doc.data() as AppUser);
        setUsers(usersData);

        const plansSnap = await getDocs(collection(db, 'commission_plans'));
        const plansData = plansSnap.docs.map(doc => doc.data() as CommissionPlan);
        setPlans(plansData);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleUpdateRole = async (uid: string, newRole: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { role: newRole });
      setUsers(users.map(u => u.uid === uid ? { ...u, role: newRole as any } : u));
    } catch (error) {
      console.error("Error updating role:", error);
    }
  };

  const handleUpdatePlan = async (uid: string, planId: string) => {
    try {
      await updateDoc(doc(db, 'users', uid), { plan_id: planId });
      setUsers(users.map(u => u.uid === uid ? { ...u, plan_id: planId } : u));
    } catch (error) {
      console.error("Error updating plan:", error);
    }
  };

  if (loading) return <div>Loading users...</div>;

  return (
    <div>
      <h3 className="text-lg leading-6 font-medium text-primary mb-4">Manage Users</h3>
      <div className="flex flex-col">
        <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
            <div className="shadow overflow-hidden border-b border-border sm:rounded-lg">
              <table className="min-w-full divide-y divide-border">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Role</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Plan</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-secondary uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-surface divide-y divide-border">
                  {users.map((user) => (
                    <tr key={user.uid}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-primary">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        <select
                          value={user.role || 'pending'}
                          onChange={(e) => handleUpdateRole(user.uid, e.target.value)}
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md"
                        >
                          <option value="pending">Pending</option>
                          <option value="rep">Sales Rep</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        {user.role === 'rep' ? (
                          <select
                            value={user.plan_id || ''}
                            onChange={(e) => handleUpdatePlan(user.uid, e.target.value)}
                            className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-border focus:outline-none focus:ring-accent focus:border-accent sm:text-sm rounded-md"
                          >
                            <option value="" disabled>Select a plan...</option>
                            {plans.map(plan => (
                              <option key={plan.plan_id} value={plan.plan_id}>{plan.name}</option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-400">N/A</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-secondary">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                          {user.role === 'pending' ? 'Needs Approval' : 'Active'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserManagement;
