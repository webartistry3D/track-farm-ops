import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import BottomNav from './BottomNav';
import ConfirmModal from './ConfirmModal';
import { Bell, RefreshCw, LogOut } from 'lucide-react';

interface SuperUserLayoutProps {
  children: React.ReactNode;
  onRefresh?: () => void;
  refreshing?: boolean;
  title?: string;
  subtitle?: string;
}

const SuperUserLayout = ({
  children,
  onRefresh,
  refreshing = false,
  title = 'Superuser Panel',
  subtitle = 'Complete system oversight and control'
}: SuperUserLayoutProps) => {
  const { logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex flex-col">
      {/* Top Header */}
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
        <div className="px-4 py-3 max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
            </button>
            <button className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
              <Bell className="w-5 h-5 text-slate-600 dark:text-slate-300" />
            </button>
            {onRefresh && (
              <button
                onClick={onRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            )}
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 transition-colors"
              title="Logout"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:p-6 max-w-7xl mx-auto w-full pb-24">
        {children}
      </main>

      {/* Bottom Navigation - Persistent across all superuser pages */}
      <BottomNav onLogout={handleLogout} />

      {/* Logout confirmation modal */}
      <ConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={confirmLogout}
        title="Confirm Logout"
        message="Are you sure you want to logout? You will need to log in again to access your account."
        confirmText="Logout"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default SuperUserLayout;
