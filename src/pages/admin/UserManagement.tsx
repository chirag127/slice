import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Shield,
    User as UserIcon,
    Edit2,
    Trash2
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';

interface UserProfile {
    uid: string;
    email: string;
    role: 'admin' | 'rep' | 'pending';
    planId?: string;
    status: 'active' | 'inactive' | 'pending';
    displayName?: string;
    createdAt: { seconds: number; nanoseconds: number } | null;
}

interface CommissionPlanOption {
    id: string;
    name: string;
}

export default function UserManagement() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [plans, setPlans] = useState<CommissionPlanOption[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        async function fetchPlans() {
            const snap = await getDocs(collection(db, 'plans'));
            setPlans(snap.docs.map(d => ({ id: d.id, name: d.data().name })));
        }

        async function fetchUsers() {
            try {
                const snap = await getDocs(collection(db, 'users'));
                setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
            } catch (error: unknown) {
                console.error(error);
            }
        }

        fetchUsers();
        fetchPlans();
    }, []);

    async function updateRole(uid: string, newRole: 'admin' | 'rep') {
        try {
            await updateDoc(doc(db, 'users', uid), { role: newRole });
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: newRole } : u));
        } catch {
            alert("Update failed");
        }
    }

    async function updatePlan(uid: string, planId: string) {
        try {
            await updateDoc(doc(db, 'users', uid), { planId });
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, planId } : u));
        } catch {
            alert("Failed to assign plan");
        }
    }

    async function approveUser(uid: string) {
        try {
            await updateDoc(doc(db, 'users', uid), {
                role: 'rep',
                status: 'active'
            });
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, role: 'rep', status: 'active' } : u));
        } catch {
            alert("Approval failed");
        }
    }

    async function deleteUser(uid: string) {
        if (!confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
        try {
            await deleteDoc(doc(db, 'users', uid));
            setUsers(prev => prev.filter(u => u.uid !== uid));
        } catch {
            alert("Delete failed");
        }
    }

    async function toggleStatus(uid: string, currentStatus: string) {
        const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
        try {
            await updateDoc(doc(db, 'users', uid), { status: newStatus });
            setUsers(prev => prev.map(u => u.uid === uid ? { ...u, status: newStatus } : u));
        } catch {
            alert("Status update failed");
        }
    }

    const filteredUsers = users.filter(u =>
        u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.role.includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-6 text-black">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
                    <p className="text-gray-500">Manage access levels and roles across the organization.</p>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by email or role..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50 border-b border-gray-200">
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Assigned Plan</th>
                            <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {filteredUsers.map(user => (
                            <tr key={user.uid} className="hover:bg-gray-50 transition-colors">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-gray-900">{user.email}</div>
                                            <div className="text-xs text-gray-500">UID: {user.uid.substring(0, 8)}...</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                        user.role === 'pending' ? 'bg-amber-100 text-amber-800' :
                                            'bg-green-100 text-green-800'
                                        }`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    {user.createdAt ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : 'N/A'}
                                </td>
                                <td className="px-6 py-4">
                                    <select
                                        className="text-xs border rounded px-2 py-1 bg-gray-50 focus:bg-white outline-none transition-all"
                                        value={user.planId || ''}
                                        onChange={(e) => updatePlan(user.uid, e.target.value)}
                                    >
                                        <option value="">No Plan</option>
                                        {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                    </select>
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-500">
                                    <div className="flex items-center gap-2">
                                        {user.role === 'pending' && (
                                            <button
                                                onClick={() => approveUser(user.uid)}
                                                className="px-3 py-1 bg-blue-600 text-white text-[10px] font-bold rounded hover:bg-blue-700 transition-colors uppercase"
                                            >
                                                Approve
                                            </button>
                                        )}
                                        {user.role === 'rep' && (
                                            <button
                                                onClick={() => updateRole(user.uid, 'admin')}
                                                className="p-1 hover:text-purple-600 transition-colors"
                                                title="Promote to Admin"
                                            >
                                                <Shield className="w-4 h-4" />
                                            </button>
                                        )}
                                        {user.role === 'admin' && (
                                            <button
                                                onClick={() => updateRole(user.uid, 'rep')}
                                                className="p-1 hover:text-green-600 transition-colors"
                                                title="Demote to Rep"
                                            >
                                                <UserIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                        <button
                                            onClick={() => toggleStatus(user.uid, user.status)}
                                            className={`p-1 transition-colors ${user.status === 'inactive' ? 'text-amber-500' : 'hover:text-blue-600'}`}
                                            title={user.status === 'inactive' ? 'Activate' : 'Deactivate'}
                                        >
                                            <Edit2 className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => deleteUser(user.uid)}
                                            className="p-1 hover:text-red-600 transition-colors"
                                            title="Delete User"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
