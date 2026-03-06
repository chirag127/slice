import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LogOut } from 'lucide-react';

const Layout: React.FC = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navigation */}
      <nav className="bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-primary tracking-tighter">Slice</span>
              </div>
              <div className="hidden sm:-my-px sm:ml-6 sm:flex sm:space-x-8">
                {user?.role === 'admin' ? (
                  <>
                    <Link to="/admin" className="border-accent text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Dashboard
                    </Link>
                  </>
                ) : user?.role === 'rep' ? (
                  <>
                    <Link to="/dashboard" className="border-accent text-primary inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium">
                      Dashboard
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-secondary mr-4">
                {user?.email} ({user?.role})
              </span>
              <button
                onClick={signOut}
                className="inline-flex items-center px-3 py-1.5 border border-border shadow-sm text-xs font-medium rounded text-secondary bg-surface hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
              >
                <LogOut className="mr-1.5 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
