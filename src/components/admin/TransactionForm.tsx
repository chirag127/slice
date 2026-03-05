import { useState, useEffect } from 'react';
import {
    Save,
    X,
    AlertCircle,
    Calendar,
    DollarSign,
    User as UserIcon,
    Tag
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, addDoc, getDocs, serverTimestamp, doc, getDoc } from 'firebase/firestore';
import type { TransactionType } from '../../lib/engine/types';

interface UserOption {
    uid: string;
    email: string;
}

export default function TransactionForm({ onSuccess, onCancel }: { onSuccess?: () => void, onCancel?: () => void }) {
    const [repId, setRepId] = useState('');
    const [amount, setAmount] = useState<number>(0);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [type, setType] = useState<TransactionType>('sale');
    const [description, setDescription] = useState('');
    const [users, setUsers] = useState<UserOption[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    async function fetchUsers() {
        const snap = await getDocs(collection(db, 'users'));
        setUsers(snap.docs.map(d => ({ uid: d.id, email: d.data().email })));
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!repId || !amount || !date) return alert("Please fill all required fields");

        setLoading(true);
        try {
            // Check if period is locked
            const periodId = date.substring(0, 7); // YYYY-MM
            const periodRef = doc(db, 'periods', periodId);
            const periodSnap = await getDoc(periodRef);

            if (periodSnap.exists() && periodSnap.data().status === 'locked') {
                setLoading(false);
                return alert("This period is locked. Transactions cannot be added or modified for finalized months.");
            }

            await addDoc(collection(db, 'transactions'), {
                repId,
                amount: Number(amount),
                date,
                type,
                description,
                createdAt: serverTimestamp(),
                status: 'processed'
            });
            alert("Transaction recorded");
            onSuccess?.();
        } catch (err) {
            console.error(err);
            alert("Failed to save transaction");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="bg-white p-8 rounded-2xl border border-gray-200 shadow-xl max-w-xl mx-auto text-black font-inter animate-in fade-in slide-in-from-bottom-4">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 font-outfit">Manual Transaction Entry</h2>
                {onCancel && (
                    <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-400" />
                    </button>
                )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 gap-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                            <UserIcon className="w-4 h-4 text-blue-500" /> Sales Representative
                        </label>
                        <select
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={repId}
                            onChange={(e) => setRepId(e.target.value)}
                            required
                        >
                            <option value="">Select a Rep</option>
                            {users.map(u => <option key={u.uid} value={u.uid}>{u.email}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                <DollarSign className="w-4 h-4 text-green-500" /> Amount (INR)
                            </label>
                            <input
                                type="number"
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                                <Tag className="w-4 h-4 text-purple-500" /> Type
                            </label>
                            <select
                                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                value={type}
                                onChange={(e) => setType(e.target.value as TransactionType)}
                            >
                                <option value="sale">Sale</option>
                                <option value="clawback">Clawback</option>
                                <option value="bonus">Bonus</option>
                                <option value="adjustment">Adjustment</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5 flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-amber-500" /> Transaction Date
                        </label>
                        <input
                            type="date"
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1.5">Description / Memo</label>
                        <textarea
                            className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[100px]"
                            placeholder="e.g. Q4 Enterprise Deal #402"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3">
                    <AlertCircle className="w-5 h-5 text-blue-500 shrink-0" />
                    <p className="text-xs text-blue-800 leading-relaxed font-medium">
                        This transaction will be processed immediately and affect the next payout calculation for this representative.
                    </p>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="flex-1 py-3 text-sm font-bold text-gray-600 bg-gray-50 border border-gray-200 rounded-xl hover:bg-gray-100 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-md shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Saving...' : (
                            <>
                                <Save className="w-4 h-4" /> Record Transaction
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}
