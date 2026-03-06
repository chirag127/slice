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
import { useAuth } from '../../context/AuthContext';
import { AuditEngine } from '../../lib/engine/AuditTrail';

interface PayoutPeriod {
    id: string; // YYYY-MM
    status: 'open' | 'locked';
    lockedAt?: any;
    lockedBy?: string;
}

export default function PayoutPeriodManager() {
    const { user: authUser } = useAuth();
    const [periods, setPeriods] = useState<PayoutPeriod[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPeriods();
    }, []);

    async function fetchPeriods() {
        setLoading(true);
        try {
            const q = query(collection(db, 'payout_periods'), orderBy('id', 'desc'), limit(12));
            const snap = await getDocs(q);
            setPeriods(snap.docs.map(d => ({ id: d.id, ...d.data() } as PayoutPeriod)));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function toggleLock(id: string, currentStatus: string) {
        if (!authUser) return;
        const newStatus = currentStatus === 'open' ? 'locked' : 'open';

        try {
            await setDoc(doc(db, 'payout_periods', id), {
                status: newStatus,
                lockedAt: newStatus === 'locked' ? serverTimestamp() : null,
                lockedBy: newStatus === 'locked' ? authUser.email : null
            }, { merge: true });

            // Audit Log
            await AuditEngine.log(
                newStatus === 'locked' ? 'PERIOD_LOCKED' : 'PERIOD_UNLOCKED',
                { uid: authUser.uid, email: authUser.email || 'unknown' },
                `${newStatus === 'locked' ? 'Locked' : 'Unlocked'} payout period ${id}`,
                { periodId: id }
            );

            fetchPeriods();
        } catch (err) {
            console.error(err);
            alert("Security Error: Failed to update period status.");
        }
    }

    return (
        <div className="space-y-8 text-black pb-12">
            <div>
                <h1 className="text-2xl font-bold font-outfit text-slate-900">Settlement Control</h1>
                <p className="text-slate-500 font-medium">Manage payout period locking to ensure data integrity and audit compliance.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-full p-12 text-center text-slate-400 font-medium">Syncing cycles...</div>
                ) : (
                    periods.map(p => (
                        <div key={p.id} className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${p.status === 'locked'
                            ? 'bg-slate-900 border-slate-800 text-white shadow-2xl'
                            : 'bg-white border-slate-100 text-slate-900 shadow-sm hover:shadow-xl'
                            }`}>
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-blue-500 rounded-2xl shadow-lg shadow-blue-500/20">
                                    <Calendar className="w-5 h-5 text-white" />
                                </div>
                                <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${p.status === 'locked'
                                    ? 'bg-red-500/20 text-red-400'
                                    : 'bg-emerald-500/10 text-emerald-600'
                                    }`}>
                                    {p.status}
                                </div>
                            </div>

                            <h3 className="text-3xl font-black font-outfit mb-2 tracking-tight">{p.id}</h3>
                            <p className={`text-xs font-medium mb-8 ${p.status === 'locked' ? 'text-slate-400' : 'text-slate-500'}`}>
                                {p.status === 'locked'
                                    ? `Finalized on ${p.lockedAt ? new Date(p.lockedAt.seconds * 1000).toLocaleDateString() : 'N/A'}`
                                    : 'Accepting new sales data'}
                            </p>

                            <button
                                onClick={() => toggleLock(p.id, p.status)}
                                className={`w-full py-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-3 cursor-pointer ${p.status === 'locked'
                                    ? 'bg-white text-slate-900 hover:bg-slate-100'
                                    : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl'
                                    }`}
                            >
                                {p.status === 'locked' ? (
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
