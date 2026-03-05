import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Loader2 } from 'lucide-react';

export function AdminRoute() {
    const { profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
                <Loader2 className="animate-spin text-accent mb-4" size={32} />
                <p className="text-secondary font-medium animate-pulse">Checking permissions...</p>
            </div>
        );
    }

    if (profile?.role !== 'admin') {
        return <Navigate to="/404" replace />;
    }

    return <Outlet />;
}
