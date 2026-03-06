import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth, type UserRole } from '../../context/AuthContext';

interface ProtectedRouteProps {
  allowedRoles?: UserRole[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-background">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'pending' && (!allowedRoles || !allowedRoles.includes('pending'))) {
    return <Navigate to="/pending" replace />;
  }

  if (allowedRoles && user.role && !allowedRoles.includes(user.role)) {
    // User doesn't have the required role
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'rep') return <Navigate to="/dashboard" replace />;
    return <Navigate to="/unauthorized" replace />;
  }

  return <Outlet />;
};
