import React, { useState } from 'react';
import UserManagement from './components/UserManagement';
import PlanManagement from './components/PlanManagement';
import CsvUpload from './components/CsvUpload';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'users' | 'plans' | 'upload'>('users');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-primary tracking-tight">Admin Dashboard</h1>
      </div>

      <div className="bg-surface shadow rounded-lg">
        <div className="border-b border-border">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('users')}
              className={`${
                activeTab === 'users'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-secondary hover:text-primary hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Users
            </button>
            <button
              onClick={() => setActiveTab('plans')}
              className={`${
                activeTab === 'plans'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-secondary hover:text-primary hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Commission Plans
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`${
                activeTab === 'upload'
                  ? 'border-accent text-accent'
                  : 'border-transparent text-secondary hover:text-primary hover:border-border'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Upload Transactions
            </button>
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'users' && <UserManagement />}
          {activeTab === 'plans' && <PlanManagement />}
          {activeTab === 'upload' && <CsvUpload />}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
