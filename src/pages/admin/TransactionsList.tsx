import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Download,
    Plus,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import { db } from '../../lib/firebase';
import { collection, query, orderBy, getDocs, limit } from 'firebase/firestore';
import type { Transaction } from '../../lib/engine/types';
import { CurrencyUtils } from '../../lib/utils/currency';
import TransactionForm from '../../components/admin/TransactionForm';

export default function TransactionsList() {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        fetchTransactions();
    }, []);

    async function fetchTransactions() {
        setLoading(true);
        try {
            const q = query(collection(db, 'transactions'), orderBy('date', 'desc'), limit(100));
            const snap = await getDocs(q);
            setTransactions(snap.docs.map(d => ({ id: d.id, ...d.data() } as Transaction)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    const filtered = transactions.filter(t =>
        t.repId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    function handleExport() {
        if (filtered.length === 0) return alert("No transactions to export");

        const headers = ["Date", "Rep ID", "Type", "Amount", "Description", "Status"];
        const rows = filtered.map(t => [
            new Date(t.date).toLocaleDateString(),
            t.repId,
            t.type,
            t.amount,
            `"${(t.description || '').replace(/"/g, '""')}"`,
            "Processed"
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', `transactions_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    return (
        <div className="space-y-6 text-black relative min-h-screen">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Global Transactions</h1>
                    <p className="text-gray-500">View and audit all transaction records across the system.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                        <Download className="w-4 h-4" /> Export CSV
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm cursor-pointer"
                    >
                        <Plus className="w-4 h-4" /> Manual Entry
                    </button>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search by Rep ID or description..."
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all font-medium"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                    <Filter className="w-4 h-4" /> Filter
                </button>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden overflow-x-auto">
                {loading ? (
                    <div className="p-12 text-center text-gray-500">Loading transactions...</div>
                ) : (
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b border-gray-200 font-outfit">
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Rep ID</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Amount</th>
                                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(t => (
                                <tr key={t.id} className="hover:bg-gray-50 transition-colors group">
                                    <td className="px-6 py-4 text-sm text-gray-600 font-medium whitespace-nowrap">
                                        {new Date(t.date).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm font-bold text-gray-900">{t.repId.substring(0, 8)}...</div>
                                        <div className="text-xs text-gray-500 max-w-[200px] truncate">{t.description || 'No description'}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${t.amount >= 0 ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
                                            }`}>
                                            {t.amount >= 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                            {t.type}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                                        {CurrencyUtils.formatINR(t.amount)}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-700 border border-blue-100">
                                            Processed
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No transactions found matching your criteria.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300"
                        onClick={() => setShowModal(false)}
                    ></div>
                    <div className="relative z-10 w-full max-w-xl">
                        <TransactionForm
                            onSuccess={() => { setShowModal(false); fetchTransactions(); }}
                            onCancel={() => setShowModal(false)}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
