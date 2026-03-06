import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import { useAuth } from './context/AuthContext';

// Pages (to be implemented)
import Login from './pages/Login';
import Signup from './pages/Signup';
import AdminDashboard from './pages/admin/AdminDashboard';
<<<<<<< HEAD
import UserManagement from './pages/admin/UserManagement';
import PlanBuilder from './pages/admin/PlanBuilder';
import TransactionsList from './pages/admin/TransactionsList';
import CSVImporter from './pages/admin/CSVImporter';
import PayoutHistory from './pages/admin/PayoutHistory';
import PayoutPeriodManager from './pages/admin/PayoutPeriodManager';
import SystemStatus from './pages/admin/SystemStatus';
import RepDashboard from './pages/rep/RepDashboard';
import TransactionHistory from './pages/rep/TransactionHistory';
import MyPayouts from './pages/rep/MyPayouts';
import RepSettings from './pages/rep/RepSettings';
=======
import RepDashboard from './pages/rep/RepDashboard';
import PendingScreen from './pages/PendingScreen';
import NotFound from './pages/NotFound';
import Layout from './components/layout/Layout';

const HomeRedirect: React.FC = () => {
  const { user, loading } = useAuth();

  if (loading) return <div>Loading...</div>;

  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'rep') return <Navigate to="/dashboard" replace />;

  return <Navigate to="/pending" replace />;
};
>>>>>>> bcda1b509d88e925507d3cf43fe44e3e34c7adaf

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Pending Users Route */}
          <Route element={<ProtectedRoute allowedRoles={['pending']} />}>
             <Route path="/pending" element={<PendingScreen />} />
          </Route>

<<<<<<< HEAD
              <Route element={<AppLayout />}>
                <Route path="/" element={<RepDashboard />} />
                <Route path="/transactions" element={<TransactionHistory />} />
                <Route path="/payouts" element={<MyPayouts />} />
                <Route path="/settings" element={<RepSettings />} />
              </Route>

              <Route element={<AdminRoute />}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<UserManagement />} />
                <Route path="/admin/plans" element={<PlanBuilder />} />
                <Route path="/admin/transactions" element={<TransactionsList />} />
                <Route path="/admin/import" element={<CSVImporter />} />
                <Route path="/admin/payouts" element={<PayoutHistory />} />
                <Route path="/admin/periods" element={<PayoutPeriodManager />} />
                <Route path="/admin/status" element={<SystemStatus />} />
              </Route>
=======
          {/* Authenticated Layout Routes */}
          <Route element={<Layout />}>
            {/* Admin Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/admin" element={<AdminDashboard />} />
>>>>>>> bcda1b509d88e925507d3cf43fe44e3e34c7adaf
            </Route>

            {/* Rep Routes */}
            <Route element={<ProtectedRoute allowedRoles={['rep']} />}>
              <Route path="/dashboard" element={<RepDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
