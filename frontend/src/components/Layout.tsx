import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import FirstTimePasswordPrompt from './FirstTimePasswordPrompt';
import ConfirmModal from './ConfirmModal';
import api from '../lib/api';
// import { InactivityWarning } from './InactivityWarning'; // DISABLED

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const [sidebarOpen, setSidebarOpen] = useState(window.innerWidth >= 1024);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [subscription, setSubscription] = useState<any>(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  // const [showInactivityWarning, setShowInactivityWarning] = useState(false); // DISABLED
  const { user, logout, setUser } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Inactivity detection state - DISABLED
  // const [inactivityTimer, setInactivityTimer] = useState<ReturnType<typeof setTimeout> | null>(null);

  // Auto logout function - DISABLED
  // const handleAutoLogout = () => {
  //   setShowInactivityWarning(true);
  //   logout();
  // };

  // Reset inactivity timer on user activity - DISABLED
  // const resetInactivityTimer = () => {
  //   if (inactivityTimer) {
  //     clearTimeout(inactivityTimer);
  //   }
  //   const newTimer = setTimeout(() => {
  //     handleAutoLogout();
  //   }, 15 * 60 * 1000); // 15 minutes
  //   setInactivityTimer(newTimer);
  // };

  // Activity detection - DISABLED
  // const handleUserActivity = () => {
  //   resetInactivityTimer();
  // };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Close dropdowns when clicking outside
      if (profileDropdownOpen && !(event.target as Element).closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
      if (notificationsOpen && !(event.target as Element).closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
      }
      
      // Close mobile sidebar when clicking outside on mobile
      if (sidebarOpen && window.innerWidth < 1024) {
        const sidebarElement = (event.target as Element).closest('.sidebar-container');
        const menuButton = (event.target as Element).closest('.sidebar-toggle-button');
        
        if (!sidebarElement && !menuButton) {
          setSidebarOpen(false);
        }
      }
    };

    const handleResize = () => {
      const isDesktop = window.innerWidth >= 1024;
      setSidebarOpen(isDesktop);
    };

    const initializeSubscriptionRestrictions = async () => {
      // Initialize subscription restrictions (Settings.tsx will handle this)
      await SubscriptionRestrictions.initialize();
      
      // Fetch subscription data for navbar indicator
      try {
        const { api } = await import('../lib/api');
        const response = await api.get('/subscription/current');
        setSubscription(response.data.subscription || response.data);
      } catch (error) {
        console.log('No subscription data for navbar indicator');
        // Set default subscription data
        setSubscription({ plan: 'freemium', status: 'trial' });
      }

      // Check if password prompt should be shown
      if (user && !showPasswordPrompt) {
        const isFirstTimeLogin = !user.passwordChangeCount || user.passwordChangeCount === 0;
        const requiresPasswordChange = user.requiresPasswordChange || isFirstTimeLogin;
        
        // Don't show on profile page or password change page
        const excludedPaths = ['/profile', '/change-password'];
        const isExcludedPath = excludedPaths.some(path => location.pathname === path);
        
        if (requiresPasswordChange && !isExcludedPath) {
          // Small delay to allow page to load first
          setTimeout(() => {
            setShowPasswordPrompt(true);
          }, 1000);
        }
      }
    };

    // Inactivity detection setup - DISABLED
    // const setupInactivityDetection = () => {
    //   // Events that reset the inactivity timer
    //   const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    //   
    //   activityEvents.forEach(event => {
    //     document.addEventListener(event, handleUserActivity);
    //   });

    //   // Initial timer setup
    //   resetInactivityTimer();
    // };

    // const cleanupInactivityDetection = () => {
    //   const activityEvents = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    //   
    //   activityEvents.forEach(event => {
    //     document.removeEventListener(event, handleUserActivity);
    //   });

    //   if (inactivityTimer) {
    //     clearTimeout(inactivityTimer);
    //   }
    // };

    // Only setup inactivity detection if user is logged in - DISABLED
    // if (user) {
    //   setupInactivityDetection();
    // }

    initializeSubscriptionRestrictions();

    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('resize', handleResize);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('resize', handleResize);
      // cleanupInactivityDetection(); // DISABLED
    };
  }, [profileDropdownOpen, notificationsOpen, user]); // Removed logout dependency since it's disabled

  const allNavigation = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊', current: location.pathname === '/dashboard', restricted: false, allowedRoles: ['OWNER', 'ACCOUNTANT'] },
    { name: 'Income', href: '/income', icon: '💰', current: location.pathname === '/income', restricted: false, allowedRoles: ['OWNER', 'MANAGER', 'WORKER', 'ACCOUNTANT', 'VETERINARIAN'] },
    { name: 'Expenses', href: '/expenses', icon: '💳', current: location.pathname === '/expenses', restricted: false, allowedRoles: ['OWNER', 'MANAGER', 'WORKER', 'ACCOUNTANT', 'VETERINARIAN'] },
    { name: 'Inventory', href: '/inventory', icon: '📦', current: location.pathname === '/inventory', feature: 'inventoryTransactions' as const, restricted: true, allowedRoles: ['OWNER', 'MANAGER', 'ACCOUNTANT', 'INVENTORY', 'VETERINARIAN'] },
    { name: 'Assets', href: '/assets', icon: '🚜', current: location.pathname === '/assets', feature: 'inventoryTransactions' as const, restricted: true, allowedRoles: ['OWNER', 'MANAGER', 'ACCOUNTANT', 'INVENTORY', 'VETERINARIAN'] },
    { name: 'CCTV', href: '/cctv', icon: '📹', current: location.pathname === '/cctv', feature: 'inventoryTransactions' as const, restricted: true, allowedRoles: ['OWNER', 'MANAGER', 'ACCOUNTANT', 'INVENTORY'] },
    { name: 'Livestock Health', href: '/livestock-health', icon: '🐄', current: location.pathname === '/livestock-health', feature: 'inventoryTransactions' as const, restricted: true, allowedRoles: ['OWNER', 'MANAGER', 'ACCOUNTANT', 'VETERINARIAN'] },
    { name: 'Analytics', href: '/analytics', icon: '📊', current: location.pathname === '/analytics', feature: 'analytics' as const, restricted: true, allowedRoles: ['OWNER', 'MANAGER', 'ACCOUNTANT'] },
    { name: 'Reports', href: '/reports', icon: '📈', current: location.pathname === '/reports', feature: 'financialReports' as const, restricted: true, allowedRoles: ['OWNER', 'ACCOUNTANT'] },
  ];

  // Filter navigation based on user role
  const navigation = allNavigation.filter(item => {
    if (!user) return false;
    if (!item.allowedRoles) return true;
    return item.allowedRoles.includes(user.role);
  });

  const isAdmin = user ? (user.role === 'OWNER' || user.role === 'MANAGER' || user.role === 'ACCOUNTANT' || user.role === 'INVENTORY' || user.role === 'VETERINARIAN') : false;

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Fetch notifications from API
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const response = await api.get('/notifications');
          setNotifications(response.data.notifications || []);
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
          // Set empty array on error to prevent UI issues
          setNotifications([]);
        }
      }
    };

    fetchNotifications();
  }, [user]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      // Refetch notifications after marking as read
      const response = await api.get('/notifications');
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className="h-screen flex overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div 
            className="fixed inset-0 bg-transparent" 
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        sidebar-container fixed inset-y-0 left-0 z-40 w-56 sm:w-64 md:w-72 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:fixed lg:inset-y-0 lg:left-0 lg:transition-all lg:duration-300 lg:ease-in-out lg:w-48
        ${!sidebarOpen ? 'lg:w-12 lg:opacity-75' : 'lg:w-48 lg:opacity-100'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 bg-green-600 dark:bg-green-700">
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-white hover:text-gray-200"
          >
            ✕
          </button>
          <div className="flex items-center">
            <span className="text-white text-md font-bold">TrackFarmOps</span>
          </div>
        </div>
        
        {/* Sidebar content - hide when collapsed */}
        <div className={`transition-opacity duration-300 ${sidebarOpen ? 'lg:opacity-100' : 'lg:opacity-0 lg:hidden'}`}>
          <nav className="mt-8 px-4">
            <ul className="space-y-1">
              {navigation.map((item) => (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => {
                      // Close mobile sidebar when navigation item is clicked
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`
                      group flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                      ${item.current
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 border-l-4 border-green-600 dark:border-green-400'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    <span className="mr-3 text-lg">{item.icon}</span>
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="absolute bottom-0 left-0 right-0 p-4">
            {/*<div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 mb-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Logged in as</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.role}</div>
            </div>*/}
            <button
              onClick={() => {
                setShowLogoutModal(true);
              }}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
            >
              <span>🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-48' : 'lg:ml-0'}`}>
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 relative z-50">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sidebar-toggle-button lg:hidden p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ☰
              </button>

              {/* Desktop menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="sidebar-toggle-button hidden lg:block p-1.5 sm:p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? '◀' : '☰'}
              </button>

              {/* Page title */}
              <div className="flex-1 flex justify-center lg:justify-start px-2 sm:px-4">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {navigation.find(item => item.current)?.name || 'TrackFarmOps'}
                </h1>
              </div>

              {/* Right side buttons */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* User Info */}
                <div className="hidden md:flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
                  <div className="flex items-center space-x-1 sm:space-x-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300 truncate max-w-[80px] sm:max-w-none">
                      {user.role}
                    </span>
                    {user.organizationName && (
                      <>
                        <span className="text-gray-400 hidden sm:inline">•</span>
                        <span className="text-gray-600 dark:text-gray-400 hidden sm:inline truncate max-w-[100px]">
                          {user.organizationName}
                        </span>
                      </>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                    user.role === 'OWNER' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : user.role === 'MANAGER'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : user.role === 'ACCOUNTANT'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200'
                      : user.role === 'INVENTORY'
                      ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                      : user.role === 'VETERINARIAN'
                      ? 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    Authorized
                  </span>
                  {/* Subscription Indicator */}
                  {subscription && (
                    <span className="inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-1 sm:ml-2">
                      ⭐ {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)}
                      {subscription.status === 'trial' && (
                        <span className="ml-0.5 sm:ml-1 text-yellow-600 dark:text-yellow-400 hidden sm:inline">(Trial)</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>

                {/* Notifications */}
                <div className="relative notifications-dropdown">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800"></span>
                    )}
                  </button>
                  
                  {notificationsOpen && (
                    <div className="absolute right-0 sm:right-0 mt-2 w-56 sm:w-60 md:w-60 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-none">
                      <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-60 sm:max-h-80 md:max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            className={`p-2 sm:p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                          >
                            <div className="flex items-start">
                              <div className="flex-1 min-w-0">
                                <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{notification.title}</p>
                                <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 sm:line-clamp-2">{notification.message}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{notification.time}</p>
                              </div>
                              {!notification.read && (
                                <div className="ml-1 sm:ml-2 flex-shrink-0">
                                  <span className="block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400"></span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="p-2 sm:p-2 md:p-3 border-t border-gray-200 dark:border-gray-700">
                        <button 
                          onClick={handleMarkAllAsRead}
                          className="text-xs sm:text-sm text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 font-medium w-full text-center py-1 sm:py-1"
                        >
                          Mark all as read
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div className="relative profile-dropdown">
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center space-x-2 sm:space-x-3 p-1.5 sm:p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium text-xs sm:text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden lg:block text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-44 sm:w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-2 sm:p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          👤 Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/settings"
                            className="block px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            ⚙️ Settings
                          </Link>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* Inactivity Warning Modal - DISABLED */}
        {/*showInactivityWarning && (
          <InactivityWarning 
            onLogout={() => {
              setShowInactivityWarning(false);
              logout();
            }}
          />
        )*/}

        {/* First-time password change prompt */}
        {user && (
          <FirstTimePasswordPrompt
            isOpen={showPasswordPrompt}
            onClose={() => setShowPasswordPrompt(false)}
            user={user}
            onSuccess={() => {
              // Update user state to reflect password change
              setUser({
                ...user,
                requiresPasswordChange: false,
                passwordChangeCount: (user.passwordChangeCount || 0) + 1
              });
            }}
          />
        )}

        {/* Logout confirmation modal */}
        <ConfirmModal
          isOpen={showLogoutModal}
          onClose={() => setShowLogoutModal(false)}
          onConfirm={() => {
            logout();
            setSidebarOpen(false);
            setShowLogoutModal(false);
          }}
          title="Confirm Logout"
          message="Are you sure you want to logout? You will need to log in again to access your account."
          confirmText="Logout"
          cancelText="Cancel"
          type="danger"
        />
      </div>
    </div>
  );
};

export default Layout;
