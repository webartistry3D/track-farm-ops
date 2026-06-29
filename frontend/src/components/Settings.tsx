import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import UserManagement from './UserManagement';
import { formatCurrency } from '../utils/currency';
import ConfirmModal from './ConfirmModal';

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
      try {
        const response = await api.get('/notifications/preferences');
        setNotifications(response.data.preferences);
      } catch (err: any) {
        console.error('Failed to load notification preferences:', err);
        // Keep default values if API fails
      }
    };

    if (activeTab === 'notifications') {
      loadNotificationPreferences();
    }
  }, [activeTab]);
  const [subscriptionData, setSubscriptionData] = useState<any>(null);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [paystackScriptLoaded, setPaystackScriptLoaded] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const plans: SubscriptionPlan[] = [
    {
      id: 'freemium',
      name: 'Freemium',
      price: 0,
      features: [
        '1 farm location',
        '1 Farm Owner',
        '1 Farm Manager',
        '1 Farm Worker',
        'Limited Income & Expense tracking',
        'Limited inventory transactions',
        'Limited Assets management',
        'Financial Reports management',
        'Basic Analytics & trends',
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
        '1 farm location',
        '1 Farm Owner',
        '1 Farm Manager',
        'Up to 3 Farm Workers',
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
        '1 farm location',
        '1 Farm Owner',
        'Up to 2 Farm Managers',
        'Up to 18 Farm workers',
        'Full Income & Expense tracking',
        'Full Inventory transactions',
        'Full Assets management',
        'Financial Reports management',
        'Data export (CSV / Excel)',
        'Advanced analytics & trends',
        'Priority support'
      ],
      emoji: '🌾',
      description: 'Everything in Free, plus...'
    },
    {
      id: 'pro',
      name: 'Mega',
      price: 99000,
      features: [
        '3 farm locations',
        'Up to 6 Farm managers',
        'Up to 75 workers',
        'Priority support'
      ],
      emoji: '🚜',
      description: 'Everything in Growth, plus...'
    }
  ];

  useEffect(() => {
    // Load Paystack script
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => setPaystackScriptLoaded(true);
    document.body.appendChild(script);

    // Fetch current subscription
    fetchSubscriptionData();

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handleRefreshSubscription = async () => {
    await fetchSubscriptionData();
    
    // Refresh subscription restrictions to update access controls
    const { SubscriptionRestrictions } = await import('../utils/subscriptionRestrictions');
    await SubscriptionRestrictions.refresh();
    console.log('✅ Subscription data and restrictions refreshed');
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

  const handleSubscriptionPayment = (planId: string) => {
    if (!paystackScriptLoaded) {
      setError('Payment system is loading. Please try again in a moment.');
      return;
    }

    const plan = plans.find(p => p.id === planId);
    if (!plan) {
      setError('Invalid plan selected.');
      return;
    }

    const price = billingCycle === 'annual' ? plan.price * 12 * 0.8 : plan.price; // 20% discount for annual
    
    // Validate email
    if (!user?.email) {
      setError('User email is required for payment.');
      return;
    }
    
    console.log('Initiating payment:', {
      planId,
      planName: plan.name,
      price,
      billingCycle,
      email: user.email
    });
    
    // Use test keys from environment
    const publicKey = 'pk_test_12c94edc534339c597d502b912719c26f857a92a';
    
    try {
      const handler = (window as any).PaystackPop.setup({
        key: publicKey,
        email: user.email,
        amount: price * 100, // Paystack expects amount in kobo (cents)
        currency: 'NGN',
        ref: `FARMOPS_${user.id}_${Date.now()}`,
        callback: function(response: any) {
          console.log('Payment successful:', response);
          verifyPayment(response.reference, planId, billingCycle, price);
        },
        onClose: function() {
          console.log('Payment window closed');
          setError('Payment was cancelled. Please try again.');
        },
        onError: function(error: any) {
          console.error('Payment error:', error);
          setError('Payment failed. Please try again.');
        }
      });

      handler.openIframe();
    } catch (error) {
      console.error('Paystack setup error:', error);
      setError('Failed to initialize payment. Please try again.');
    }
  };

  const verifyPayment = async (reference: string, planId: string, cycle: string, amount: number) => {
    try {
      setLoading(true);
      await api.post('/subscription/verify', {
        reference,
        planId,
        billingCycle: cycle,
        amount
      });
      
      setMessage('Subscription activated successfully! 🎉');
      
      // Add delay and retry mechanism to fetch subscription data
      const fetchWithRetry = async (retries = 3) => {
        for (let i = 0; i < retries; i++) {
          try {
            await fetchSubscriptionData();
            console.log('✅ Subscription data fetched successfully');
            
            // Refresh subscription restrictions to update access controls
            const { SubscriptionRestrictions } = await import('../utils/subscriptionRestrictions');
            await SubscriptionRestrictions.refresh();
            console.log('✅ Subscription restrictions refreshed');
            
            return; // Success, exit the retry loop
          } catch (err: any) {
            console.log(`⚠️ Attempt ${i + 1} failed:`, err.response?.status || err.message);
            if (i === retries - 1) {
              // Last attempt failed, don't show error to user, just log it
              console.log('❌ All retry attempts failed, but payment was successful');
              return;
            }
            // Wait before retry (exponential backoff)
            await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
          }
        }
      };
      
      // Start fetching after 2 seconds to ensure payment is fully processed
      setTimeout(() => {
        fetchWithRetry();
      }, 2000);
    } catch (err: any) {
      console.error('Payment verification error:', err);
      if (err.code === 'ERR_CONNECTION_REFUSED' || err.code === 'ECONNREFUSED') {
        setError('Backend server is temporarily unavailable. Please refresh and try again.');
      } else {
        setError('Payment verification failed. Please contact support.');
      }
    } finally {
      setLoading(false);
    }
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
      <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
        <nav className="-mb-px flex overflow-x-auto space-x-4 sm:space-x-8 scrollbar-hide">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Profile
          </button>
          {/*{user?.role === 'OWNER' && (
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'notifications'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Notifications
            </button>
          )}*/}
          {user?.role === 'OWNER' && (
            <button
              onClick={() => setActiveTab('workers')}
              className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'workers'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Manage Worker
            </button>
          )}
          {user?.role === 'OWNER' && (
            <button
              onClick={() => setActiveTab('subscription')}
              className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'subscription'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              Subscription
            </button>
          )}
          <button
            onClick={() => setActiveTab('system')}
            className={`py-2 px-3 sm:px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
              activeTab === 'system'
                ? 'border-green-500 text-green-600 dark:text-green-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            System
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 sm:p-6">
        {message && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-3 sm:px-4 py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 sm:px-4 py-2 sm:py-3 rounded-md mb-3 sm:mb-4 text-sm sm:text-base">
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
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
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'notifications' && (
          <form onSubmit={handleNotificationSubmit} className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Notification Preferences</h3>
            
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
                    notifications.emailNotifications ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Low Stock Alerts</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Get notified when inventory items are running low</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('lowStockAlerts')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.lowStockAlerts ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.lowStockAlerts ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Daily Reports</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Receive daily summary of farm operations</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('dailyReports')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.dailyReports ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.dailyReports ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex-1 pr-4">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">Weekly Reports</div>
                  <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Receive weekly comprehensive reports</div>
                </div>
                <button
                  type="button"
                  onClick={() => handleNotificationChange('weeklyReports')}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    notifications.weeklyReports ? 'bg-green-600' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      notifications.weeklyReports ? 'translate-x-5' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
              >
                {loading ? 'Saving...' : 'Save Preferences'}
              </button>
            </div>
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
                className="px-3 sm:px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-xs sm:text-sm font-medium"
              >
                🔄 Refresh Status
              </button>
            </div>
            
            {/* Current Subscription Status */}
            {subscriptionData && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg p-4 sm:p-6 border border-green-200 dark:border-green-800">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 gap-3">
                  <div>
                    <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      Current Plan: <span className="text-green-600 dark:text-green-400 capitalize">{subscriptionData.plan}</span>
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
                    className="w-full sm:w-auto px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base"
                  >
                    {loading ? 'Processing...' : 'Cancel Subscription'}
                  </button>
                )}
              </div>
            )}

            {/* Billing Cycle Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex items-center bg-gray-100 dark:bg-gray-700 rounded-full p-1">
                <button
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 sm:px-6 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 relative ${
                    billingCycle === 'annual'
                      ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  Annual
                  <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                    Save 20%
                  </span>
                </button>
              </div>
            </div>

            {/* Available Plans */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
              {plans.map((plan) => {
                const isCurrentPlan = subscriptionData?.plan === plan.id;
                const price = billingCycle === 'annual' ? plan.price * 12 * 0.8 : plan.price;
                const savings = billingCycle === 'annual' ? plan.price * 12 * 0.2 : 0;
                
                return (
                  <div
                    key={plan.id}
                    className={`bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 sm:p-6 border-2 ${
                      isCurrentPlan
                        ? 'border-green-500 dark:border-green-400'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <div className="text-center mb-3 sm:mb-4">
                      <div className="text-2xl sm:text-3xl mb-2">{plan.emoji}</div>
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1">{plan.name}</h4>
                      <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">{plan.description}</p>
                      <div className="mb-1 sm:mb-2">
                        <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(price.toString())}
                        </span>
                        <span className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          /{billingCycle === 'monthly' ? 'month' : 'year'}
                        </span>
                      </div>
                      {savings > 0 && (
                        <div className="text-xs sm:text-sm text-green-600 dark:text-green-400 font-medium">
                          Save {formatCurrency(savings.toString())}
                        </div>
                      )}
                    </div>
                    
                    <ul className="space-y-1 sm:space-y-2 mb-3 sm:mb-4 text-xs sm:text-sm">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-3 sm:w-4 h-3 sm:h-4 text-green-500 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-700 dark:text-gray-300">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handleSubscriptionPayment(plan.id)}
                      disabled={isCurrentPlan || loading || (!paystackScriptLoaded && !subscriptionData)}
                      className={`w-full py-2 px-3 sm:px-4 rounded-lg font-medium transition-all duration-200 text-xs sm:text-sm ${
                        isCurrentPlan
                          ? 'bg-gray-300 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                          : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed'
                      }`}
                    >
                      {isCurrentPlan ? 'Current Plan' : loading ? 'Processing...' : (!paystackScriptLoaded && !subscriptionData) ? 'Loading Payment...' : `Upgrade to ${plan.name}`}
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Payment Info */}
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
              <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">💳 Payment Information</h4>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                • All payments are processed securely through Paystack
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                • You can pay with Naira debit cards or bank transfer
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                • Your subscription will auto-renew at the end of each billing period
              </p>
            </div>
          </div>
        )}

        {activeTab === 'system' && (
          <div className="space-y-4 sm:space-y-6">
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">System Information</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Application Version</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">TrackFarmOps v1.0.0</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">User Role</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">{user.role}</div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Account Created</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  {new Date(user.createdAt).toLocaleDateString()}
                </div>
              </div>
              
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 sm:p-4">
                <div className="text-xs sm:text-sm font-medium text-gray-500 dark:text-gray-400">Last Login</div>
                <div className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">Today</div>
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 sm:pt-6">
              <h4 className="text-sm sm:text-md font-medium text-gray-900 dark:text-white mb-3 sm:mb-4">Data Management</h4>
              <div className="space-y-2 sm:space-y-3">
                <button className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto text-xs sm:text-sm">
                  📥 Export Data
                </button>
                <button className="px-3 sm:px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors w-full sm:w-auto ml-0 sm:ml-3 text-xs sm:text-sm">
                  📊 Generate Report
                </button>
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
    </div>
  );
};

export default Settings;
