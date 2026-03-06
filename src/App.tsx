import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminRoute } from '@/components/auth/AdminRoute';
import { AppLayout } from '@/components/layout/AppLayout';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { WaitingApprovalPage } from '@/pages/WaitingApprovalPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import AdminDashboard from './pages/admin/AdminDashboard';
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

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />

            {/* Guarded App Routes */}
            <Route element={<ProtectedRoute />}>
              <Route path="/waiting-approval" element={<WaitingApprovalPage />} />

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
            </Route>

            <Route path="/404" element={<NotFoundPage />} />
            <Route path="*" element={<Navigate to="/404" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App
