import { useState, useEffect } from 'react';
import {
    Lock,
    Unlock,
    Calendar,
    AlertCircle
} from 'lucide-react';
import { db } from '../../lib/firebase';
import {
    collection,
    getDocs,
    doc,
    setDoc,
    query,
    orderBy,
    limit,
    serverTimestamp
} from 'firebase/firestore';

interface PayoutPeriod {
    id: string; // YYYY-MM
    status: 'open' | 'locked';
    lockedAt?: any;
    lockedBy?: string;
}

export default function PayoutPeriodManager() {
    const [periods, setPeriods] = useState<PayoutPeriod[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPeriods();
    }, []);

    async function fetchPeriods() {
        setLoading(true);
        try {
            const snap = await getDocs(query(collection(db, 'periods'), orderBy('id', 'desc'), limit(12)));
            const existing = snap.docs.map(d => ({ id: d.id, ...d.data() } as PayoutPeriod));

            // Generate last 6 months if they don't exist
            const now = new Date();
            const generated: PayoutPeriod[] = [];
            for (let i = 0; i < 6; i++) {
                const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
                const id = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
                const found = existing.find(p => p.id === id);
                generated.push(found || { id, status: 'open' });
            }

            setPeriods(generated);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function toggleLock(id: string, currentStatus: 'open' | 'locked') {
        const newStatus = currentStatus === 'open' ? 'locked' : 'open';
        const msg = newStatus === 'locked'
            ? "Locking this period will prevent any new transactions or modifications for this month. Continue?"
            : "Unlocking this period will allow new transactions and modifications. Continue?";

        if (!confirm(msg)) return;

        try {
            await setDoc(doc(db, 'periods', id), {
                status: newStatus,
                updatedAt: serverTimestamp()
            }, { merge: true });

            setPeriods(prev => prev.map(p => p.id === id ? { ...p, status: newStatus } : p));
        } catch (err) {
            console.error(err);
            alert("Failed to update period status");
        }
    }

    return (
        <div className="space-y-6 text-black">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 font-outfit">Payout Period Control</h1>
                    <p className="text-gray-500">Lock periods to finalize commissions and prevent historical data changes.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full py-20 text-center text-gray-400 font-medium">
                        Loading period metadata...
                    </div>
                ) : (
                    periods.map(period => (
                        <div
                            key={period.id}
                            className={`p-6 rounded-2xl border transition-all duration-300 ${period.status === 'locked'
                                ? 'bg-slate-50 border-slate-200'
                                : 'bg-white border-gray-200 shadow-sm hover:shadow-md'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                                    <Calendar className="w-6 h-6" />
                                </div>
                                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${period.status === 'locked'
                                    ? 'bg-slate-100 text-slate-600 border-slate-200'
                                    : 'bg-green-50 text-green-700 border-green-100'
                                    }`}>
                                    {period.status}
                                </span>
                            </div>

                            <h3 className="text-xl font-bold text-gray-900 mb-1 font-outfit">
                                {new Date(period.id + '-01').toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                            </h3>
                            <p className="text-sm text-gray-500 mb-6">Period ID: {period.id}</p>

                            <button
                                onClick={() => toggleLock(period.id, period.status)}
                                className={`w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${period.status === 'locked'
                                    ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200'
                                    }`}
                            >
                                {period.status === 'locked' ? (
                                    <>
                                        <Unlock className="w-4 h-4" /> Unlock Period
                                    </>
                                ) : (
                                    <>
                                        <Lock className="w-4 h-4" /> Lock Period
                                    </>
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>

            <div className="bg-amber-50 border border-amber-200 p-6 rounded-2xl flex gap-4">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0" />
                <div>
                    <h4 className="text-sm font-bold text-amber-900 mb-1">Administrative Note</h4>
                    <p className="text-xs text-amber-800 leading-relaxed">
                        Locking a period is a critical action. Once locked, the calculation engine will treat all transactions within that period as immutable and finalized for compliance and auditing.
                    </p>
                </div>
            </div>
        </div>
    );
}
