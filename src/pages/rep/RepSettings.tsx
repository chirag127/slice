import { useState } from 'react';
import {
    User,
    Mail,
    Shield,
    Smartphone,
    Save,
    Lock,
    Eye,
    EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function RepSettings() {
    const { user, profile } = useAuth();
    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="max-w-4xl space-y-8 text-black font-inter pb-20">
            <div>
                <h1 className="text-3xl font-black text-gray-900 font-outfit">Personal Settings</h1>
                <p className="text-gray-500 font-medium">Manage your professional profile and security preferences.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold font-outfit mb-6 flex items-center gap-3 text-gray-900">
                            <User className="w-5 h-5 text-blue-600" /> Public Profile
                        </h3>

                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Display Name</label>
                                    <div className="relative">
                                        <User className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="text"
                                            readOnly
                                            value={profile?.displayName || user?.displayName || 'Not Set'}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none focus:ring-2 focus:ring-blue-500 transition-all cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                                    <div className="relative">
                                        <Mail className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input
                                            type="email"
                                            readOnly
                                            value={user?.email || ''}
                                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                                <Smartphone className="w-5 h-5 text-blue-600 shrink-0 mt-1" />
                                <div>
                                    <p className="text-xs font-bold text-blue-900">Two-Factor Authentication</p>
                                    <p className="text-[10px] text-blue-700 font-medium">Adding a phone number for extra security is highly recommended.</p>
                                    <button className="mt-2 text-[10px] font-black text-blue-600 uppercase tracking-widest underline decoration-2 underline-offset-4">Setup now</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm">
                        <h3 className="text-xl font-bold font-outfit mb-6 flex items-center gap-3 text-gray-900">
                            <Lock className="w-5 h-5 text-rose-600" /> Password & Security
                        </h3>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Account Password</label>
                                <div className="relative group">
                                    <Lock className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        readOnly
                                        value="••••••••••••••••"
                                        className="w-full pl-12 pr-12 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-700 outline-none"
                                    />
                                    <button
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1.5 hover:bg-gray-100 rounded-xl transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={16} className="text-gray-400" /> : <Eye size={16} className="text-gray-400" />}
                                    </button>
                                </div>
                                <p className="mt-2 text-[10px] text-gray-400 font-medium italic">Passwords are securely managed by Firebase Identity Service.</p>
                            </div>

                            <button className="flex items-center gap-2 px-8 py-3 bg-slate-900 text-white font-black rounded-2xl text-sm hover:bg-slate-800 transition-all shadow-lg active:scale-95">
                                Change Password
                            </button>
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="space-y-6">
                    <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl">
                        <Shield className="w-12 h-12 text-blue-500 mb-6" />
                        <h4 className="text-lg font-bold font-outfit mb-2">Access Control</h4>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">You are currently logged in with <strong>{profile?.role.toUpperCase()}</strong> privileges. Some settings are restricted by your administrator.</p>

                        <div className="pt-6 border-t border-white/10 space-y-4">
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">Account ID</span>
                                <span className="text-slate-200 font-mono text-[10px]">{user?.uid.substring(0, 12)}...</span>
                            </div>
                            <div className="flex justify-between text-xs">
                                <span className="text-slate-500 font-bold uppercase tracking-widest">Verified Status</span>
                                <span className="text-emerald-400 font-black">ACTIVE</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full py-4 bg-rose-50 border border-rose-100 text-rose-600 rounded-2xl text-sm font-black hover:bg-rose-100 transition-all flex items-center justify-center gap-2">
                        Request Account Deletion
                    </button>
                </div>
            </div>

            <div className="flex justify-end pt-8">
                <button className="flex items-center gap-2 px-12 py-4 bg-blue-600 text-white font-black rounded-[2rem] text-base hover:bg-blue-500 transition-all shadow-[0_15px_30px_rgba(37,99,235,0.3)] active:scale-95">
                    <Save className="w-5 h-5" /> Save Changes
                </button>
            </div>
        </div>
    );
}
