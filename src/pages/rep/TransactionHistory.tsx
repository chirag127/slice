import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar,
    ChevronLeft,
    ChevronRight
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
import type { Transaction } from '../../lib/engine/types';

export default function TransactionHistory() {
    const { user } = useAuth();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState<'all' | 'sale' | 'clawback' | 'bonus'>('all');

    useEffect(() => {
        if (user) {
            fetchTransactions();
        }
    }, [user]);

    async function fetchTransactions() {
        setLoading(true);
        try {
            const q = query(
                collection(db, 'transactions'),
                where('repId', '==', user?.uid),
                orderBy('date', 'desc')
            );
            const snap = await getDocs(q);
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filtered = transactions.filter(t => {
        const matchesSearch = t.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            t.id.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = filterType === 'all' || t.type === filterType;
        return matchesSearch && matchesType;
    });

    function handleExport() {
        const headers = ["Date", "ID", "Description", "Type", "Amount"];
        const rows = filtered.map(t => [
            t.date,
            t.id,
            t.description || '',
            t.type,
            t.amount.toString()
        ]);

        const csvContent = [headers, ...rows].map(e => e.join(",")).join("\n");
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `my_transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.click();
    }

    return (
        <div className="space-y-8 text-black font-inter">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 font-outfit">My Transaction History</h1>
                    <p className="text-gray-500 font-medium">A complete record of all your processed sales and adjustments.</p>
                </div>
                <button
                    onClick={handleExport}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                >
                    <Download className="w-4 h-4" /> Export CSV
                </button>
            </div>

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-8">
                <div className="p-6 border-b border-gray-100 bg-gray-50/30 flex flex-col md:flex-row gap-4 justify-between">
                    <div className="relative flex-1 max-w-md">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by ID or description..."
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-gray-400" />
                        <select
                            className="bg-white border border-gray-200 rounded-xl px-3 py-2 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                            value={filterType}
                            onChange={(e) => setFilterType(e.target.value as any)}
                        >
                            <option value="all">All Types</option>
                            <option value="sale">Sales Only</option>
                            <option value="clawback">Clawbacks</option>
                            <option value="bonus">Bonuses</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50/50 border-b border-gray-100">
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Date</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Transaction Details</th>
                                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Type</th>
                                <th className="px-8 py-4 text-right text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Net Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400">Loading history...</td>
                                </tr>
                            ) : filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="px-8 py-20 text-center text-gray-400">No matching transactions found.</td>
                                </tr>
                            ) : (
                                filtered.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-lg ${t.type === 'sale' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                                                    <Calendar className="w-4 h-4" />
                                                </div>
                                                <span className="text-sm font-bold text-gray-900">{new Date(t.date).toLocaleDateString()}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                                                    {t.description || 'Processed Sale'}
                                                </span>
                                                <span className="text-xs text-gray-400 font-mono mt-0.5 tracking-tighter">ID: #{t.id.substring(0, 12)}</span>
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
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-sm font-black ${t.type === 'sale' ? 'text-gray-900' : 'text-rose-600'}`}>
                                                    {t.type === 'sale' ? '+' : '-'}₹{t.amount.toLocaleString()}
                                                </span>
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-gray-400">
                                                    Status: <span className="text-green-600">Verified</span>
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 border-t border-gray-100 flex justify-between items-center text-sm font-bold text-gray-500">
                    <p>Showing {filtered.length} of {transactions.length} total records</p>
                    <div className="flex gap-2">
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"><ChevronLeft className="w-4 h-4" /></button>
                        <button className="p-2 border border-blue-600 bg-blue-600 text-white rounded-lg">1</button>
                        <button className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-30"><ChevronRight className="w-4 h-4" /></button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl shadow-blue-100 flex items-center justify-between">
                    <div>
                        <p className="text-blue-100 text-xs font-bold uppercase tracking-widest mb-1">Total Lifetime Sales</p>
                        <h3 className="text-3xl font-black font-outfit">₹{transactions.reduce((sum, t) => sum + (t.type === 'sale' ? t.amount : 0), 0).toLocaleString()}</h3>
                    </div>
                    <ArrowUpRight className="w-12 h-12 text-blue-400 opacity-50" />
                </div>
                <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-100 flex items-center justify-between">
                    <div>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Total Lifetime Payouts</p>
                        <h3 className="text-3xl font-black font-outfit">₹{(transactions.reduce((sum, t) => sum + (t.type === 'sale' ? t.amount * 0.1 : 0), 0)).toLocaleString()}</h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-1">* Estimated based on 10% base rate average</p>
                    </div>
                    <ArrowDownLeft className="w-12 h-12 text-slate-700" />
                </div>
            </div>
        </div>
    );
}
