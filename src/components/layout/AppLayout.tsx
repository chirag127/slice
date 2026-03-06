import { useState, useEffect } from "react";
import { Outlet, Link } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import {
    LogOut,
    LayoutDashboard,
    FileSpreadsheet,
    Settings,
    ShieldCheck,
    Users,
    Database,
    FileUp,
    History as HistoryIcon,
    Lock,
    CreditCard,
    Activity,
    Sun,
    Moon
} from "lucide-react";

export function AppLayout() {
    const { profile, signOut } = useAuth();
    const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') === 'dark');

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    return (
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-slate-950 flex font-inter text-slate-900 dark:text-slate-100 transition-colors duration-300">
            {/* Sidebar */}
            <nav className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col fixed inset-y-0 shadow-sm z-10 font-medium transition-colors duration-300">
                <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                    <div>
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-sm">S</div>
                            <span className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-white font-outfit">Slice</span>
                        </div>
                        <div className="mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">Oriz Suite Admin</div>
                    </div>
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all text-slate-500 dark:text-slate-400"
                    >
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto py-6 px-3 space-y-8">
                    {/* Standard Links */}
                    <div className="space-y-1">
                        <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Main Dashboard</div>
                        <Link to="/" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                            <LayoutDashboard size={18} />
                            Overview
                        </Link>
                        <Link to="/transactions" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                            <Database size={18} />
                            My Transactions
                        </Link>
                        <Link to="/payouts" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                            <CreditCard size={18} />
                            My Payouts
                        </Link>
                        <Link to="/settings" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                            <Settings size={18} />
                            Personal Settings
                        </Link>
                    </div>

                    {/* Admin Specific */}
                    {profile?.role === 'admin' && (
                        <div className="space-y-1">
                            <div className="px-3 mb-2 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Admin Control</div>
                            <Link to="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                                <ShieldCheck size={18} />
                                Admin Dashboard
                            </Link>
                            <Link to="/admin/status" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                                <Activity size={18} />
                                System Status
                            </Link>
                            <Link to="/admin/users" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                                <Users size={18} />
                                User Access
                            </Link>
                            <Link to="/admin/plans" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                                <FileSpreadsheet size={18} />
                                Commission Plans
                            </Link>
                            <Link to="/admin/transactions" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                                <Database size={18} />
                                Global Transactions
                            </Link>
                            <Link to="/admin/import" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                                <FileUp size={18} />
                                Import Tools
                            </Link>
                            <Link to="/admin/payouts" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                                <HistoryIcon size={18} />
                                Payout History
                            </Link>
                            <Link to="/admin/periods" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-blue-600 transition-all font-bold text-sm">
                                <Lock size={18} />
                                Period Control
                            </Link>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                    <div className="flex items-center gap-3 mb-4 px-2">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold text-xs uppercase">
                            {profile?.email?.[0] || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#0F172A] dark:text-white truncate">{profile?.email}</p>
                            <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">{profile?.role}</p>
                        </div>
                    </div>
                    <button
                        onClick={() => signOut()}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all cursor-pointer border border-transparent hover:border-red-100 dark:hover:border-red-900/40"
                    >
                        <LogOut size={14} />
                        Sign Out
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 ml-64 p-8 bg-[#F8FAFC] dark:bg-slate-950 transition-colors duration-300">
                <div className="max-w-6xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
