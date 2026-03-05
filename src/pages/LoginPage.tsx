import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Lock, Mail, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleEmailLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate('/');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign in';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        setLoading(true);
        setError('');
        try {
            const provider = new GoogleAuthProvider();
            await signInWithPopup(auth, provider);
            navigate('/');
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : 'Failed to sign in with Google';
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-black font-inter">
            <div className="w-full max-w-md">
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-blue-600 text-white font-bold text-2xl mb-4 shadow-sm">S</div>
                    <h1 className="text-3xl font-extrabold text-[#0F172A] tracking-tight font-outfit">Slice</h1>
                    <p className="text-slate-500 mt-2">Zero-cost commission management.</p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
                    <h2 className="text-xl font-bold text-[#0F172A] mb-6">Sign in to your account</h2>

                    <form className="space-y-4" onSubmit={handleEmailLogin}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                    placeholder="name@company.com"
                                    required
                                />
                                <Mail className="absolute left-3 top-3 text-slate-400" size={18} />
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between mb-1">
                                <label className="text-sm font-semibold text-slate-700">Password</label>
                                <button type="button" className="text-xs text-blue-600 hover:underline font-semibold">Forgot password?</button>
                            </div>
                            <div className="relative">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2.5 pl-10 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                                <Lock className="absolute left-3 top-3 text-slate-400" size={18} />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-lg text-center font-medium">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-[#0F172A] text-white font-bold py-2.5 rounded-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                        >
                            {loading ? <Loader2 className="animate-spin" size={18} /> : 'Sign In'}
                        </button>
                    </form>

                    <div className="relative my-8 text-center text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                        <div className="absolute top-1/2 left-0 w-full h-px bg-slate-100 -z-10"></div>
                        <span className="bg-white px-3">or continue with</span>
                    </div>

                    <button
                        onClick={handleGoogleLogin}
                        disabled={loading}
                        className="w-full bg-white border border-slate-200 text-[#0F172A] font-bold py-2.5 rounded-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 cursor-pointer disabled:opacity-50"
                    >
                        <svg viewBox="0 0 24 24" className="w-5 h-5">
                            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                        </svg>
                        Sign in with Google
                    </button>

                    <p className="text-center mt-8 text-sm text-slate-500">
                        Don't have an account? <span className="text-blue-600 font-bold">Contact your manager</span>
                    </p>
                </div>

                <p className="text-center mt-8 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                    © 2026 Oriz Suite Applications.
                </p>
            </div>
        </div>
    );
}
