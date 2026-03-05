import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Clock, LogOut } from 'lucide-react';

export function WaitingApprovalPage() {
    const { profile, signOut } = useAuth();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="bg-surface rounded-2xl shadow-xl border border-border p-8 max-w-md w-full text-center">
                <div className="w-16 h-16 bg-warning/10 text-warning rounded-full flex items-center justify-center mx-auto mb-6">
                    <Clock size={32} />
                </div>
                <h1 className="text-2xl font-bold text-primary mb-3">Account Pending Approval</h1>
                <p className="text-secondary mb-8 leading-relaxed">
                    Your account for <span className="text-primary font-semibold">{profile?.email}</span> has been created.
                    An administrator needs to approve your access before you can view commission data.
                </p>

                <div className="space-y-3">
                    <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-500 italic">
                        "We'll notify you once your role is assigned."
                    </div>

                    <button
                        onClick={handleLogout}
                        className="flex items-center justify-center gap-2 w-full py-2.5 text-secondary hover:text-primary font-medium transition-colors"
                    >
                        <LogOut size={18} />
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    );
}
