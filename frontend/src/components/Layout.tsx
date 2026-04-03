import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import FirstTimePasswordPrompt from './FirstTimePasswordPrompt';
import { 
  getNotifications, 
  markAllNotificationsAsRead, 
  formatNotificationTime,
  getNotificationIcon,
  notificationRealtime,
  type Notification 
} from '../services/notificationService';
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
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoadingNotifications, setIsLoadingNotifications] = useState(false);
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
      if (profileDropdownOpen && !(event.target as Element).closest('.profile-dropdown')) {
        setProfileDropdownOpen(false);
      }
      if (notificationsOpen && !(event.target as Element).closest('.notifications-dropdown')) {
        setNotificationsOpen(false);
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
    { name: 'Dashboard', href: '/dashboard', icon: '📊', current: location.pathname === '/dashboard', restricted: false },
    { name: 'Income', href: '/income', icon: '💰', current: location.pathname === '/income', restricted: false },
    { name: 'Expenses', href: '/expenses', icon: '💳', current: location.pathname === '/expenses', restricted: false },
    { name: 'Inventory', href: '/inventory', icon: '📦', current: location.pathname === '/inventory', feature: 'inventoryTransactions' as const, restricted: true },
    { name: 'Assets', href: '/assets', icon: '🚜', current: location.pathname === '/assets', feature: 'inventoryTransactions' as const, restricted: true },
    { name: 'CCTV', href: '/cctv', icon: '📹', current: location.pathname === '/cctv', feature: 'inventoryTransactions' as const, restricted: true },
    { name: 'Analytics', href: '/analytics', icon: '📊', current: location.pathname === '/analytics', feature: 'analytics' as const, restricted: true },
    { name: 'Reports', href: '/reports', icon: '📈', current: location.pathname === '/reports', feature: 'financialReports' as const, restricted: true },
  ];

  // Show all navigation items to all users (including freemium and workers)
  // Restrictions will be handled at the page level with upgrade prompts
  const navigation = allNavigation;

  const isAdmin = user ? (user.role === 'OWNER' || user.role === 'MANAGER') : false;

  // Fetch notifications on component mount and when notifications panel is opened
  useEffect(() => {
    if (user && (notificationsOpen || notifications.length === 0)) {
      fetchNotifications();
    }
  }, [user, notificationsOpen]);

  // Set up real-time notifications
  useEffect(() => {
    if (user) {
      // Connect to real-time notification service
      notificationRealtime.connect();

      // Subscribe to new notifications
      const unsubscribeNewNotification = notificationRealtime.subscribe('notification', (notification: Notification) => {
        setNotifications(prev => [notification, ...prev]);
        setUnreadCount(prev => prev + 1);
      });

      // Subscribe to unread notifications (initial load)
      const unsubscribeUnreadNotifications = notificationRealtime.subscribe('unread_notifications', (unreadNotifications: Notification[]) => {
        setNotifications(unreadNotifications);
        setUnreadCount(unreadNotifications.filter(n => !n.isRead).length);
      });

      // Cleanup on unmount
      return () => {
        unsubscribeNewNotification();
        unsubscribeUnreadNotifications();
        notificationRealtime.disconnect();
      };
    }
  }, [user]);

  const fetchNotifications = async () => {
    if (!user) return;
    
    setIsLoadingNotifications(true);
    try {
      const response = await getNotifications({ limit: 10 });
      setNotifications(response.notifications);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to fetch notifications:', error);
    } finally {
      setIsLoadingNotifications(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      // Update local state
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
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
            className="fixed inset-0 bg-gray-600 dark:bg-gray-800 bg-opacity-75 dark:bg-opacity-75" 
            onClick={() => setSidebarOpen(false)}
          />
        </div>
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-48 sm:w-56 md:w-64 bg-white dark:bg-gray-800 shadow-lg transform transition-transform duration-300 ease-in-out
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
            <span className="text-white text-md font-bold">Track-Farm-Ops</span>
          </div>
        </div>
        
        {/* Sidebar content - hide when collapsed */}
        <div className={`transition-opacity duration-300 ${sidebarOpen ? 'lg:opacity-100' : 'lg:opacity-0 lg:hidden'}`}>
          <nav className="mt-8 px-4">
            <ul className="space-y-2">
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
            <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Logged in as</div>
              <div className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{user.role}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${sidebarOpen ? 'lg:ml-48' : 'lg:ml-0'}`}>
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 relative z-50">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Mobile menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                ☰
              </button>

              {/* Desktop menu button */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? '◀' : '☰'}
              </button>

              {/* Page title */}
              <div className="flex-1 flex justify-center lg:justify-start">
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {navigation.find(item => item.current)?.name || 'Track-Farm-Ops'}
                </h1>
              </div>

              {/* Right side buttons */}
              <div className="flex items-center space-x-4">
                {/* User Info */}
                <div className="hidden sm:flex items-center space-x-3 text-sm">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {user.role}
                    </span>
                    {user.organizationName && (
                      <>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-600 dark:text-gray-400">
                          {user.organizationName}
                        </span>
                      </>
                    )}
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    user.role === 'OWNER' 
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      : user.role === 'MANAGER'
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                  }`}>
                    Authorized
                  </span>
                  {/* Subscription Indicator */}
                  {subscription && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ml-2">
                      ⭐ {subscription.plan.charAt(0).toUpperCase() + subscription.plan.slice(1)} Plan
                      {subscription.status === 'trial' && (
                        <span className="ml-1 text-yellow-600 dark:text-yellow-400">(Trial)</span>
                      )}
                    </span>
                  )}
                </div>

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>

                {/* Notifications */}
                <div className="relative notifications-dropdown">
                  <button
                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                    className="p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  >
                    🔔
                    {unreadCount > 0 && (
                      <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-400 ring-2 ring-white dark:ring-gray-800"></span>
                    )}
                  </button>
                  
                  {notificationsOpen && (
                    <div className="absolute right-0 sm:right-0 mt-2 w-72 sm:w-80 md:w-96 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-none">
                      <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-64 sm:max-h-80 md:max-h-96 overflow-y-auto">
                        {isLoadingNotifications ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            Loading notifications...
                          </div>
                        ) : notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                            No notifications
                          </div>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification.id}
                              className={`p-2 sm:p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
                            >
                              <div className="flex items-start">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white truncate">{notification.title}</p>
                                  </div>
                                  <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1 line-clamp-1 sm:line-clamp-2">{notification.message}</p>
                                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{formatNotificationTime(notification.createdAt)}</p>
                                </div>
                                {!notification.isRead && (
                                  <div className="ml-1 sm:ml-2 flex-shrink-0">
                                    <span className="block h-1.5 w-1.5 sm:h-2 sm:w-2 rounded-full bg-blue-400"></span>
                                  </div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
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
                    className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block text-sm font-medium text-gray-700 dark:text-gray-300">{user.name}</span>
                  </button>

                  {profileDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                      <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.role}</p>
                      </div>
                      <div className="py-1">
                        <Link
                          to="/profile"
                          className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => setProfileDropdownOpen(false)}
                        >
                          👤 Profile
                        </Link>
                        {isAdmin && (
                          <Link
                            to="/settings"
                            className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                            onClick={() => setProfileDropdownOpen(false)}
                          >
                            ⚙️ Settings
                          </Link>
                        )}
                        <button
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        >
                          🚪 Logout
                        </button>
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
      </div>
    </div>
  );
};

export default Layout;
