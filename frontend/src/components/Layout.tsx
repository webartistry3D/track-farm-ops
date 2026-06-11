import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { SubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import FirstTimePasswordPrompt from './FirstTimePasswordPrompt';
import ConfirmModal from './ConfirmModal';
import BottomNav from './BottomNav';
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
  const [notificationPage, setNotificationPage] = useState(1);
  const notificationItemsPerPage = 10;
  const [hasPlayedNotificationSound, setHasPlayedNotificationSound] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

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

  const unreadCount = notifications.filter((n: any) => !n.read).length;

  // Play notification sound
  const playNotificationSound = () => {
    try {
      const audio = new Audio('/mixkit-happy-bells-notification-937.wav');
      audio.play().catch(error => {
        console.log('Audio play failed (user may need to interact first):', error);
      });
    } catch (error) {
      console.error('Failed to play notification sound:', error);
    }
  };

  // Fetch notifications from API with pagination
  useEffect(() => {
    const fetchNotifications = async () => {
      if (user) {
        try {
          const offset = (notificationPage - 1) * notificationItemsPerPage;
          const response = await api.get('/notifications', {
            params: {
              limit: notificationItemsPerPage,
              offset: offset
            }
          });
          const fetchedNotifications = response.data.notifications || [];
          setNotifications(fetchedNotifications);
          
          // Play notification sound if there are unread notifications and sound hasn't been played yet
          const unreadNotifications = fetchedNotifications.filter((n: any) => !n.read);
          if (unreadNotifications.length > 0 && !hasPlayedNotificationSound) {
            playNotificationSound();
            setHasPlayedNotificationSound(true);
          }
        } catch (error) {
          console.error('Failed to fetch notifications:', error);
          // Set empty array on error to prevent UI issues
          setNotifications([]);
        }
      }
    };

    fetchNotifications();
  }, [user, notificationPage]);

  const handleMarkAllAsRead = async () => {
    try {
      await api.patch('/notifications/read-all');
      // Refetch notifications after marking as read with pagination
      const offset = (notificationPage - 1) * notificationItemsPerPage;
      const response = await api.get('/notifications', {
        params: {
          limit: notificationItemsPerPage,
          offset: offset
        }
      });
      setNotifications(response.data.notifications || []);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const handleNotificationClick = async (notification: any) => {
    try {
      // Mark individual notification as read
      await api.patch(`/notifications/${notification.id}/read`);
      // Refetch notifications after marking as read with pagination
      const offset = (notificationPage - 1) * notificationItemsPerPage;
      const response = await api.get('/notifications', {
        params: {
          limit: notificationItemsPerPage,
          offset: offset
        }
      });
      setNotifications(response.data.notifications || []);
      
      // Navigate to appropriate page based on notification type
      const relatedEntity = notification.relatedEntity || notification.type;
      
      switch (relatedEntity) {
        case 'IncomeEntry':
        case 'INCOME_CREATED':
          // Navigate to Income records tab
          navigate('/income?tab=records');
          break;
        case 'ExpenseEntry':
        case 'EXPENSE_CREATED':
          // Navigate to Expenses page
          navigate('/expenses');
          break;
        case 'InventoryItem':
        case 'INVENTORY_CREATED':
        case 'INVENTORY_UPDATED':
          // Navigate to Inventory page
          navigate('/inventory');
          break;
        case 'Asset':
        case 'ASSET_CREATED':
        case 'ASSET_UPDATED':
          // Navigate to Assets page
          navigate('/assets');
          break;
        case 'Livestock':
        case 'HealthRecord':
        case 'Vaccination':
        case 'LIVESTOCK_CREATED':
        case 'HEALTH_RECORD_CREATED':
        case 'VACCINATION_CREATED':
          // Navigate to Livestock Health page
          navigate('/livestock-health');
          break;
        default:
          console.log('Unknown notification type:', relatedEntity);
          break;
      }
      
      // Close notifications dropdown
      setNotificationsOpen(false);
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  if (!user) {
    return <div>{children}</div>;
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-gray-100 dark:bg-gray-900">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top navigation */}
        <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 relative z-50">
          <div className="px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex items-center justify-between h-14 sm:h-16">
              {/* Page title */}
              <div className="flex-1 flex justify-left lg:justify-start px-2 sm:px-4">
                <h1 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
                  {navigation.find(item => item.current)?.name || 'TrackFarmOps'}
                </h1>
              </div>

              {/* Right side buttons */}
              <div className="flex items-center space-x-2 sm:space-x-4">
                {/* User Info */}
                <div className="md:flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm">
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
                  <span className={`inline-flex items-center px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full text-[10px] hidden sm:text-xs font-medium ${
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

                {/* Theme Toggle 
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
                */}

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
                    <div className="absolute right-0 sm:right-0 mt-2 w-72 sm:w-80 md:w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50 max-w-[calc(100vw-1rem)] sm:max-w-[calc(100vw-2rem)] md:max-w-none">
                      <div className="p-2 sm:p-3 md:p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">Notifications</h3>
                      </div>
                      <div className="max-h-60 sm:max-h-80 md:max-h-96 overflow-y-auto">
                        {notifications.map((notification) => (
                          <div
                            key={notification.id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`p-2 sm:p-3 md:p-4 hover:bg-gray-50 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-600 cursor-pointer ${!notification.read ? 'bg-blue-50 dark:bg-blue-900/20' : ''}`}
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
                      {/* Pagination Controls */}
                      <div className="p-2 sm:p-2 md:p-3 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
                        <button
                          onClick={() => setNotificationPage(prev => Math.max(1, prev - 1))}
                          disabled={notificationPage === 1}
                          className="text-xs sm:text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Previous
                        </button>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          Page {notificationPage}
                        </span>
                        <button
                          onClick={() => setNotificationPage(prev => prev + 1)}
                          disabled={notifications.length < notificationItemsPerPage}
                          className="text-xs sm:text-sm px-2 py-1 rounded bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Next
                        </button>
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

                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="p-1.5 sm:p-2 rounded-full text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
                  title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                  {isDark ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 overflow-auto">
          <div className="py-12 pb-24">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {children}
            </div>
          </div>
        </main>

        {/* Mobile Bottom Navigation - For all users including Superuser */}
        <BottomNav onLogout={() => setShowLogoutModal(true)} />

        {/* First-time password change prompt */}
        {user && (
          <FirstTimePasswordPrompt
            isOpen={showPasswordPrompt}
            onClose={() => setShowPasswordPrompt(false)}
            user={user}
            onSuccess={() => {
              // Update user state to reflect password change
              // setUser({
              //   ...user,
              //   requiresPasswordChange: false,
              //   passwordChangeCount: (user.passwordChangeCount || 0) + 1
              // });
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
