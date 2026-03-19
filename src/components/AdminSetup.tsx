import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import UserManagement from './UserManagement';

const AdminSetup = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'users' | 'system'>('users');

  if (!user) {
    return <div>Please log in to access admin setup.</div>;
  }

  if (user.role !== 'OWNER') {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-red-900 mb-2">Access Restricted</h3>
        <p className="text-red-700">
          Only farm owners can access admin setup and user management.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Setup</h1>
        <p className="text-gray-600 mt-1">Manage users and system configuration</p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('users')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'users'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            User Management
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'system'
                ? 'border-green-500 text-green-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            System Info
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'users' && <UserManagement />}

      {activeTab === 'system' && (
        <div className="space-y-6">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">System Configuration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-md font-medium text-gray-900 mb-3">System Status</h3>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Environment:</span>
                    <span className="text-sm font-medium text-gray-900">Development</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Version:</span>
                    <span className="text-sm font-medium text-gray-900">v2.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Database:</span>
                    <span className="text-sm font-medium text-green-600">PostgreSQL</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">User Roles & Permissions</h3>
            
            <div className="space-y-4">
              <div className="border-l-4 border-purple-500 pl-4">
                <div className="font-medium text-gray-900">Owner</div>
                <div className="text-sm text-gray-600">Full access to all features including user management, reports, and system configuration</div>
              </div>
              
              <div className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium text-gray-900">Manager</div>
                <div className="text-sm text-gray-600">Can view reports, manage inventory, and access all financial features</div>
              </div>
              
              <div className="border-l-4 border-gray-500 pl-4">
                <div className="font-medium text-gray-900">Worker</div>
                <div className="text-sm text-gray-600">Can record income, expenses, and update inventory quantities</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSetup;
