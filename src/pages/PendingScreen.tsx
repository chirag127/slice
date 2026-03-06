import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

const PendingScreen: React.FC = () => {
  const { signOut } = useAuth();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h2 className="mt-6 text-3xl font-extrabold text-primary">Approval Pending</h2>
        <p className="mt-4 text-lg text-secondary">
          Your account has been created successfully, but it requires administrator approval before you can access the platform.
        </p>
        <p className="mt-2 text-sm text-secondary">
          Please contact your administrator if you need immediate assistance.
        </p>

        <div className="mt-8 flex justify-center">
          <button
            onClick={signOut}
            className="flex items-center px-4 py-2 border border-border shadow-sm text-sm font-medium rounded-md text-primary bg-surface hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-accent"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default PendingScreen;
