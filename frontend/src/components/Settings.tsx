import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import UserManagement from './UserManagement';
import { formatCurrency } from '../utils/currency';
import ConfirmModal from './ConfirmModal';
import BankTransferModal from './BankTransferModal';
import { requestPushPermission, unsubscribePush } from '../lib/pushNotifications';

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  features: string[];
  emoji: string;
  description: string;
}

const Settings = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'notifications' | 'workers' | 'subscription' | 'system'>('profile');
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [notifications, setNotifications] = useState({
    emailNotifications: false,
    lowStockAlerts: false,
    dailyReports: false,
    weeklyReports: false
  });
  const [pushEnabled, setPushEnabled] = useState(false);
  const [pushError, setPushError] = useState('');
  const [preferencesLoading, setPreferencesLoading] = useState(false);

  const togglePush = async () => {
    setPushError('');
    if (pushEnabled) {
      await unsubscribePush();
      setPushEnabled(false);
    } else {
      const enabled = await requestPushPermission();
      setPushEnabled(enabled);
      if (!enabled) {
        setPushError('Push notifications were blocked. Enable them in your browser settings to receive alerts.');
      }
    }
  };
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Auto-dismiss messages after 3 seconds
  useEffect(() => {
    if (message) {
      const timer = setTimeout(() => setMessage(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Load notification preferences on component mount
  useEffect(() => {
    const loadNotificationPreferences = async () => {
      setPreferencesLoading(true);
      try {
        const response = await api.get('/notifications/preferences');
        setNotifications(response.data.preferences);
      } catch (err: any) {
        console.error('Failed to load notification preferences:', err);
        // Keep default values if API fails
      } finally {
        setPreferencesLoading(false);
      }
    };

    if (activeTab === 'notifications') {
      loadNotificationPreferences();
    }
  }, [activeTab]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showBankTransferModal, setShowBankTransferModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [currentPaymentRequest, setCurrentPaymentRequest] = useState<any>(null);

  const plans: SubscriptionPlan[] = [
    {
      id: 'freemium',
      name: 'Freemium',
      price: 0,
      features: [
        '1 Farm, 1 Owner, 1 Manager, 1 Worker',
        'Limited Income & Expense tracking',
        'Limited inventory transactions',
        'Limited Assets management',
        'Limited Financial Reports & Analytics',
        'Email support'
      ],
      emoji: '🆓',
      description: 'Perfect for trying out FarmOps'
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 10000,
      features: [
        'Full Income & Expense tracking',
        'Full Inventory transactions',
        'Full Assets management',
        'Financial Reports management',
        'Data export (CSV / Excel)',
        'Priority email support'
      ],
      emoji: '🌱',
      description: 'Everything in Freemium, plus...'
    },
    {
      id: 'growth',
      name: 'Growth',
      price: 39000,
      features: [
        '1 Farm location',
        'Up to 18 Farm managers & workers',
        'Priority support'
      ],
      emoji: '🌾',
      description: 'Everything in Starter, plus...'
    },
    {
      id: 'pro',
      name: 'Mega',
      price: 99000,
      features: [
        '3 Farm locations',
        'Up to 75 Farm workers',
        'Priority support'
      ],
      emoji: '🚜',
      description: 'Everything in Growth, plus...'
    }
  ];

  useEffect(() => {
    // Fetch current subscription and payment request
    fetchSubscriptionData();
    fetchCurrentPaymentRequest();
  }, []);

  const handleRefreshSubscription = async () => {
    await fetchSubscriptionData();
    await fetchCurrentPaymentRequest();
    
    // Refresh subscription restrictions to update access controls
    const { SubscriptionRestrictions } = await import('../utils/subscriptionRestrictions');
    await SubscriptionRestrictions.refresh();
    console.log('✅ Subscription data and restrictions refreshed');
  };

  const fetchCurrentPaymentRequest = async () => {
    try {
      const response = await api.get('/payments/current');
      setCurrentPaymentRequest(response.data.paymentRequest);
    } catch (err: any) {
      console.log('No current payment request:', err);
      setCurrentPaymentRequest(null);
    }
  };

  const fetchSubscriptionData = async () => {
    try {
      const response = await api.get('/subscription/current');
      // API returns data nested in subscription object
      setSubscriptionData(response.data.subscription || response.data);
    } catch (err: any) {
      console.log('No active subscription or error fetching subscription:', err);
      
      // Handle rate limiting specifically
      if (err.response?.status === 429) {
        console.log('Rate limited, using fallback subscription data');
        // Don't show error to user for rate limiting, just use fallback
      } else if (err.response?.status === 401) {
        // Handle auth errors
        console.log('Auth error fetching subscription');
        return;
      }
      
      // Set default subscription data
      setSubscriptionData({
        plan: 'freemium',
        status: 'trial',
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        billingCycle: 'monthly'
      });
    }
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
        setError('New passwords do not match');
        return;
      }

      // Real profile update
      await api.put('/auth/profile', {
        name: formData.name,
        email: formData.email,
        ...(formData.currentPassword && { 
          currentPassword: formData.currentPassword,
          newPassword: formData.newPassword 
        })
      });
      
      setMessage('Profile updated successfully!');
      
      // Reset password fields
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationChange = (key: keyof typeof notifications) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setError('');

    try {
      // Real notification settings update
      await api.put('/notifications/preferences', notifications);
      setMessage('Notification preferences updated successfully!');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update notification settings');
    } finally {
      setLoading(false);
    }
  };

  const handleBankTransfer = (planId: string) => {
    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      setError('Invalid plan selected.');
      return;
    }
    setSelectedPlan(plan);
    setShowBankTransferModal(true);
  };

  const handleCancelSubscription = async () => {
    setShowCancelModal(true);
  };

  const confirmCancelSubscription = async () => {
    setShowCancelModal(false);
    
    try {
      setLoading(true);
      await api.post('/subscription/cancel');
      setMessage('Subscription cancelled. You can continue using premium features until the end of your billing period.');
      await fetchSubscriptionData();
    } catch (err: any) {
      setError('Failed to cancel subscription. Please contact support.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div>Please log in to access settings.</div>;
  }

  return (
    <div className="max-w-4xl mx-auto px-0 sm:px-6 lg:px-8">
      {/*<div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Manage your account and application preferences</p>
      </div>*/}

      {/* Tabs */}
      <div className="bg-white/50 dark:bg-gray-800/40 backdrop-blur-md border border-white/40 dark:border-gray-600/30 rounded-lg p-2 mb-6">
        <nav className="flex space-x-2 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 rounded-lg font-medium text-sm whitespace-nowrap ${
              activeTab === 'profile'
                ? 'bg-emerald-500/80 text-white backdrop-blur-sm shadow-sm'
                : 'bg-white/30 dark:bg-gray-700/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 border border-white/30 dark:border-gray-600/30 hover:bg-white/50 dark:hover:bg-gray-600/40'
            }`}
          >
            Profile
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`py-2 px-3 rounded-lg font-medium text-sm whitespace-nowrap ${
              activeTab === 'notifications'
                ? 'bg-emerald-500/80 text-white backdrop-blur-sm shadow-sm'
                : 'bg-white/30 dark:bg-gray-700/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 border border-white/30 dark:border-gray-600/30 hover:bg-white/50 dark:hover:bg-gray-600/40'
            }`}
          >
            Notifications
          </button>
          {user?.role === 'OWNER' && (
            <button
              onClick={() => setActiveTab('workers')}
              className={`py-2 px-3 rounded-lg font-medium text-sm whitespace-nowrap ${
                activeTab === 'workers'
                  ? 'bg-emerald-500/80 text-white backdrop-blur-sm shadow-sm'
                  : 'bg-white/30 dark:bg-gray-700/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 border border-white/30 dark:border-gray-600/30 hover:bg-white/50 dark:hover:bg-gray-600/40'
              }`}
            >
              Manage Worker
            </button>
          )}
          {user?.role === 'OWNER' && (
            <button
              onClick={() => setActiveTab('subscription')}
              className={`py-2 px-3 rounded-lg font-medium text-sm whitespace-nowrap ${
                activeTab === 'subscription'
                  ? 'bg-emerald-500/80 text-white backdrop-blur-sm shadow-sm'
                  : 'bg-white/30 dark:bg-gray-700/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 border border-white/30 dark:border-gray-600/30 hover:bg-white/50 dark:hover:bg-gray-600/40'
              }`}
            >
              Subscription
            </button>
          )}
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-3 rounded-lg font-medium text-sm whitespace-nowrap ${
              activeTab === 'system'
                ? 'bg-emerald-500/80 text-white backdrop-blur-sm shadow-sm'
                : 'bg-white/30 dark:bg-gray-700/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 border border-white/30 dark:border-gray-600/30 hover:bg-white/50 dark:hover:bg-gray-600/40'
            }`}
          >
            System
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white/50 dark:bg-gray-700/40 backdrop-blur-md border border-white/40 dark:border-gray-600/30 shadow rounded-lg p-4 sm:p-6">
        {message && (
          <div className="bg-emerald-50/60 dark:bg-emerald-900/30 border border-emerald-200/60 dark:border-emerald-700/50 text-emerald-600 dark:text-emerald-400 px-3 sm:px-4 py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base backdrop-blur-sm">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50/60 dark:bg-red-900/30 border border-red-200/60 dark:border-red-700/50 text-red-600 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base backdrop-blur-sm">
            {error}
          </div>
        )}

        {activeTab === 'profile' && (
          <form onSubmit={handleProfileSubmit} className="space-y-4 sm:space-y-6">
            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Profile Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Full Name
                  </label>
                  <input
                    disabled
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email Address
                  </label>
                  <input
                    disabled
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    required
                  />
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Change Password</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div>
                  <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Password
                  </label>
                  <input
                    disabled
                    type="password"
                    id="currentPassword"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    New Password
                  </label>
                  <input
                    disabled
                    type="password"
                    id="newPassword"
                    value={formData.newPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Confirm New Password
                  </label>
                  <input
                    disabled
                    type="password"
                    id="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-700/90 backdrop-blur-sm border border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'notifications' && (
          <form onSubmit={handleNotificationSubmit} className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Notification Preferences</h3>

            {preferencesLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
              </div>
            ) : (
            <>
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Email Notifications</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Receive important updates via email</div>
                </div>
                  <button
                  type="button"
                  onClick={() => handleNotificationChange('emailNotifications')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.emailNotifications ? 'bg-emerald-500/80 backdrop-blur-sm' : 'bg-gray-300/60 dark:bg-gray-700/60 backdrop-blur-sm'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white/90 shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              {/* <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Low Stock Alerts</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Get notified when inventory items are running low</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('lowStockAlerts')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.lowStockAlerts ? 'bg-emerald-500/80 backdrop-blur-sm' : 'bg-gray-300/60 dark:bg-gray-700/60 backdrop-blur-sm'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white/90 shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.lowStockAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div> */}

              {/* <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Daily Reports</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Receive daily summary of farm operations</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('dailyReports')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.dailyReports ? 'bg-emerald-500/80 backdrop-blur-sm' : 'bg-gray-300/60 dark:bg-gray-700/60 backdrop-blur-sm'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white/90 shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.dailyReports ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div> */}

              {/* <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Weekly Reports</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Receive weekly comprehensive reports</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('weeklyReports')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.weeklyReports ? 'bg-emerald-500/80 backdrop-blur-sm' : 'bg-gray-300/60 dark:bg-gray-700/60 backdrop-blur-sm'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white/90 shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.weeklyReports ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div> */}

              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Push Notifications</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Receive notifications on your device even when the app is closed</div>
                </div>
                <button
                  type="button"
                  onClick={togglePush}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    pushEnabled ? 'bg-emerald-500/80 backdrop-blur-sm' : 'bg-gray-300/60 dark:bg-gray-700/60 backdrop-blur-sm'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white/90 shadow ring-0 transition duration-200 ease-in-out ${
                      pushEnabled ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
              {pushError && (
                <div className="text-xs text-red-600 dark:text-red-400 mt-2">{pushError}</div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-emerald-600/80 text-white rounded-lg hover:bg-emerald-700/90 backdrop-blur-sm border border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
            </>
            )}
          </form>
        )}

        {activeTab === 'workers' && user?.role === 'OWNER' && (
          <UserManagement />
        )}

        {activeTab === 'subscription' && (
          <div className="space-y-4 sm:space-y-1">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Subscription Management</h3>
            
            {/* Manual Refresh Button */}
            <div className="flex justify-end mb-3 sm:mb-4">
              <button
                onClick={handleRefreshSubscription}
                className="px-3 sm:px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/90 backdrop-blur-sm border border-blue-500/40 transition-colors duration-200 text-xs sm:text-sm font-medium"
              >
                🔄 Refresh Status
              </button>
            </div>
            
            {/* Pending Payment Alert */}
            {currentPaymentRequest && (
              <div className="bg-yellow-50/60 dark:bg-yellow-900/30 border border-yellow-200/60 dark:border-yellow-700/50 rounded-lg p-4 sm:p-6 backdrop-blur-md mb-4">
                <div className="flex items-start gap-3">
                  <div className="text-2xl">⏳</div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      Payment Awaiting Verification
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-2">
                      Reference: <strong>{currentPaymentRequest.paymentReference}</strong>
                    </p>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400">
                      Status: <span className="capitalize font-medium">{currentPaymentRequest.status.toLowerCase().replace('_', ' ')}</span>
                    </p>
                    {currentPaymentRequest.paymentRequestExpiresAt && (
                      <p className="text-xs text-yellow-600 dark:text-yellow-500 mt-1">
                        Expires: {new Date(currentPaymentRequest.paymentRequestExpiresAt).toLocaleString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Current Subscription Status */}
            {subscriptionData && (
              <div className="bg-emerald-50/60 dark:bg-emerald-900/30 backdrop-blur-md border border-emerald-200/60 dark:border-emerald-700/50 rounded-lg p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Current Plan: <span className="text-emerald-600 dark:text-emerald-400 capitalize">{subscriptionData.plan}</span>
                    </h4>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      Status: <span className="font-medium capitalize">{subscriptionData.status}</span>
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                      {subscriptionData.expiresAt ? `Expires: ${new Date(subscriptionData.expiresAt).toLocaleDateString()}` : 'No expiration date'}
                    </p>
                  </div>
                  <div className="text-3xl sm:text-4xl text-center sm:text-right">
                    {plans.find(p => p.id === subscriptionData.plan)?.emoji || '📦'}
                  </div>
                </div>
                
                {subscriptionData.status === 'active' && (
                  <button
                    onClick={handleCancelSubscription}
                    disabled={loading}
                    className="w-full sm:w-auto px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/90 backdrop-blur-sm border border-red-500/40 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  >
                    {loading ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            )}

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-white/50 dark:bg-gray-700/40 backdrop-blur-md border border-white/40 dark:border-gray-600/30 rounded-full p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    billingCycle === 'monthly'
                      ? 'bg-emerald-500/80 text-white backdrop-blur-sm shadow-sm'
                      : 'bg-white/30 dark:bg-gray-700/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/40'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                    billingCycle === 'annual'
                      ? 'bg-emerald-500/80 text-white backdrop-blur-sm shadow-sm'
                      : 'bg-white/30 dark:bg-gray-700/40 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white/50 dark:hover:bg-gray-600/40'
                  }`}
                >
                  Annual
                  <span className="absolute -top-2 -right-2 bg-emerald-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-emerald-400/40">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Available Plans */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = subscriptionData?.plan === plan.id;
                const price = billingCycle === 'annual' ? plan.price * 12 * 0.8 : plan.price;
                const savings = billingCycle === 'annual' ? plan.price * 12 * 0.2 : 0;
                
                return (
                  <div
                    key={plan.id}
                    className={`bg-white/50 dark:bg-gray-700/40 backdrop-blur-md rounded-lg shadow-lg p-4 sm:p-6 border-2 ${
                      isCurrentPlan
                        ? 'border-emerald-500 dark:border-emerald-400'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-center mb-3 sm:mb-4">
                      <div className="text-2xl sm:text-3xl mb-2">{plan.emoji}</div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">{plan.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">{plan.description}</p>
                    </div>

                    <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-3 sm:w-4 h-3 sm:h-4 text-emerald-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="text-center mb-3 sm:mb-4">
                      <div className="mb-1 sm:mb-2">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(price.toString())}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      {savings > 0 && (
                        <div className="text-xs sm:text-sm text-emerald-600 dark:text-emerald-400 font-medium">
                          Save {formatCurrency(savings.toString())}
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleBankTransfer(plan.id)}
                        disabled={isCurrentPlan || loading || currentPaymentRequest !== null}
                        className={`w-full py-2 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                          isCurrentPlan
                            ? 'bg-gray-300/60 dark:bg-gray-600/60 text-gray-600 dark:text-gray-400 cursor-not-allowed backdrop-blur-sm'
                            : 'bg-emerald-600/80 text-white hover:bg-emerald-700/90 backdrop-blur-sm border border-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isCurrentPlan ? 'Current Plan' : loading ? 'Processing...' : currentPaymentRequest ? 'Payment Pending' : `Pay via Bank Transfer`}
                      </button>
                      {/* Instant Payment button commented out */}
                      {/* <button
                        onClick={() => handleSubscriptionPayment(plan.id)}
                        disabled={isCurrentPlan || loading || currentPaymentRequest !== null || !paystackScriptLoaded}
                        className={`w-full py-2 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm border ${
                          isCurrentPlan
                            ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed border-transparent'
                            : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed'
                        }`}
                      >
                        {isCurrentPlan ? 'Current Plan' : loading ? 'Processing...' : currentPaymentRequest ? 'Payment Pending' : 'Instant Payment (Paystack)'}
                      </button> */}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50/60 dark:bg-blue-900/30 border border-blue-200/60 dark:border-blue-700/50 rounded-lg p-4 backdrop-blur-md">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💳 Payment Information</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                • Recommended: Pay via Bank Transfer (manual verification within 24 hours)
              </p>
              {/* <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                • Instant: Pay with Paystack (Naira debit cards)
              </p> */}
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                • Use the exact payment reference when making bank transfers
              </p>
              {/* <p className="text-sm text-blue-800 dark:text-blue-200">
                • Your subscription will auto-renew at the end of each billing period
              </p> */}
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">System Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-white/50 dark:bg-gray-700/40 backdrop-blur-md border border-white/40 dark:border-gray-600/30 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Application Version</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">TrackFarmOps v1.0.0</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-700/40 backdrop-blur-md border border-white/40 dark:border-gray-600/30 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">User Role</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{user.role}</div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-700/40 backdrop-blur-md border border-white/40 dark:border-gray-600/30 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-white/50 dark:bg-gray-700/40 backdrop-blur-md border border-white/40 dark:border-gray-600/30 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Today</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Subscription Cancellation Modal */}
      <ConfirmModal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={confirmCancelSubscription}
        title="Cancel Subscription"
        message="Are you sure you want to cancel your subscription? You will lose access to premium features at the end of your billing period."
        confirmText="Cancel Subscription"
        cancelText="Keep Subscription"
        type="danger"
      />

      {/* Bank Transfer Modal */}
      {selectedPlan && (
        <BankTransferModal
          isOpen={showBankTransferModal}
          onClose={() => {
            setShowBankTransferModal(false);
            setSelectedPlan(null);
          }}
          planId={selectedPlan.id}
          planName={selectedPlan.name}
          amount={billingCycle === 'annual' ? selectedPlan.price * 12 * 0.8 : selectedPlan.price}
          billingCycle={billingCycle}
          onSubmitted={async () => {
            await fetchCurrentPaymentRequest();
            await fetchSubscriptionData();
            setShowBankTransferModal(false);
            setSelectedPlan(null);
            setMessage('Payment submitted for verification. You will be notified once reviewed.');
          }}
        />
      )}
    </div>
  );
};

export default Settings;
