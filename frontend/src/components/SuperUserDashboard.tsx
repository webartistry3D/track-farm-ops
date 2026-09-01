import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import SuperUserPaymentReview from './SuperUserPaymentReview';
import {
  Users, Building, Activity, Database, Settings, Globe, TrendingUp,
  Eye, Lock, Unlock, Search, RefreshCw, BarChart3,
  UserCheck, X, Server, Trash2, Plus, CreditCard, DollarSign, Calendar
} from 'lucide-react';

console.log('🔍 SUPERUSER DASHBOARD - All imports loaded successfully');

interface SuperUserStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  totalOrganizations: number;
  activeOrganizations: number;
  systemHealth: number;
  totalRevenue: number;
  monthlyGrowth: number;
  serverUptime: number;
  storageUsed: number;
  storageTotal: number;
  apiCalls: number;
  errorRate: number;
  // New real system metrics
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  dbConnections: number;
  maxConnections: number;
  queryTime: number;
  cacheHitRate: number;
  storageUsedGB: number;
  responseTime: number;
  netProfit: number;
  totalAssets: number;
  totalInventory: number;
  // Analytics specific fields
  revenueGrowth: number;
  thisMonthUsers: number;
  lastMonthUsers: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: 'active' | 'inactive' | 'suspended';
  organization: string;
  lastLogin: string;
  createdAt: string;
  subscription: string;
  permissions: string[];
  devices: number;
  location: string;
  phone: string;
  avatar?: string;
}

interface Organization {
  id: string;
  name: string;
  type: string;
  status: 'active' | 'inactive' | 'trial';
  users: number;
  revenue: number;
  growth: number;
  plan: string;
  billingCycle: string;
  amount: number;
  expiresAt: string | null;
  createdAt: string;
  location: string;
  admin: string;
  contact: string;
}

interface Subscription {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  plan: string;
  status: 'active' | 'inactive' | 'trial' | 'cancelled' | 'expired';
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly' | 'annual';
  startDate: string;
  endDate: string;
  nextBillingDate: string;
  autoRenew: boolean;
  paymentMethod: string;
  lastPaymentDate: string;
  organization: string;
  features: string[];
}

interface SystemLog {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  severity: 'info' | 'warning' | 'error' | 'debug' | 'critical';
  ip: string;
  action: string;
  userId?: number;
}

interface Activity {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  resource: string;
  details: string;
  ip: string;
  device: string;
  location: string;
}

const SuperUserDashboard = () => {
  console.log('🚀 SUPERUSER DASHBOARD COMPONENT MOUNTING!');
  
  try {
    console.log('🔍 INSIDE TRY BLOCK');
    
    const navigate = useNavigate();
    const { user } = useAuth();
    console.log('🔍 HOOKS CALLED SUCCESSFULLY');
    
    const location = useLocation();

    const getTabFromPathname = (pathname: string): string => {
      const path = pathname.replace('/super-user/', '').replace(/\/$/, '') || 'dashboard';
      const tabMap: Record<string, string> = {
        'dashboard': 'overview',
        'user': 'users',
        'users': 'users',
        'organization': 'organizations',
        'organizations': 'organizations',
        'subscriptions': 'subscriptions',
        'subscription': 'subscriptions',
        'payments': 'payments',
        'payment-review': 'payments',
        'activity': 'activity',
        'activity-monitor': 'activity',
        'system-health': 'system',
        'system': 'system',
        'logs': 'logs',
        'system-logs': 'logs',
        'analytics': 'analytics',
        'settings': 'settings'
      };
      return tabMap[path] || 'overview';
    };

    const [activeTab, setActiveTab] = useState(() => getTabFromPathname(location.pathname));
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    console.log('🔍 STATE INITIALIZED SUCCESSFULLY');

    // Immediate state logging
    console.log('🔍 INITIAL STATE:', {
      user: user,
      userRole: user?.role,
      loading: loading,
      activeTab: activeTab
    });

    // Data states
    const [stats, setStats] = useState<SuperUserStats | null>(null);
    const [users, setUsers] = useState<User[]>([]);
    const [organizations, setOrganizations] = useState<Organization[]>([]);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [systemLogs, setSystemLogs] = useState<SystemLog[]>([]);
    const [activities, setActivities] = useState<Activity[]>([]);
    
    // Modal states
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    
    // Organization modal states
    const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
    const [showOrgModal, setShowOrgModal] = useState(false);
    const [showOrgDeleteModal, setShowOrgDeleteModal] = useState(false);
    const [showOrgSuspendModal, setShowOrgSuspendModal] = useState(false);
    const [orgActionType, setOrgActionType] = useState<'delete' | 'suspend' | 'activate'>('delete');
    
    // Subscription modal states
    const [selectedSub, setSelectedSub] = useState<Subscription | null>(null);
    const [showSubModal, setShowSubModal] = useState(false);
    
    // Settings operation states
    const [maintenanceLoading, setMaintenanceLoading] = useState(false);
    const [backupLoading, setBackupLoading] = useState(false);
    const [cacheLoading, setCacheLoading] = useState(false);
    const [orgActionLoading, setOrgActionLoading] = useState<string | null>(null); // Track which org is being acted upon

    useEffect(() => {
      console.log('🔍 DEBUG: SuperUserDashboard useEffect triggered');
      console.log('🔍 DEBUG: User object:', user);
      console.log('🔍 DEBUG: User role:', user?.role);
      
      if (user?.role !== 'SUPERUSER') {
        console.log('🔍 DEBUG: User is not SUPERUSER, redirecting to login');
        navigate('/login');
        return;
      }
      
      console.log('🔍 DEBUG: User is SUPERUSER, calling fetchDashboardData');
      fetchDashboardData();
    }, [user, navigate]);

    useEffect(() => {
      const tabFromPath = getTabFromPathname(location.pathname);
      setActiveTab(tabFromPath);
    }, [location.pathname]);

    const fetchDashboardData = async () => {
      console.log('🔍 DEBUG: fetchDashboardData called');
      setLoading(true);
      
      // Add a small delay to ensure component is mounted
      await new Promise(resolve => setTimeout(resolve, 100));
      
      try {
        console.log('🔍 DEBUG: Starting API calls...');
        const [statsRes, usersRes, orgsRes, subsRes, logsRes, activityRes] = await Promise.all([
          api.get('/superuser/stats'),
          api.get('/superuser/users'),
          api.get('/superuser/organizations'),
          api.get('/superuser/subscriptions'),
          api.get('/superuser/logs'),
          api.get('/superuser/activity')
        ]);

        console.log('🔍 DEBUG: API Responses received:');
        console.log('  Stats:', statsRes);
        console.log('  Users:', usersRes);
        console.log('  Organizations:', orgsRes);
        console.log('  Subscriptions:', subsRes);
        console.log('  Logs:', logsRes);
        console.log('  Activity:', activityRes);

        // Check if responses are successful
        const statsSuccess = statsRes.status === 200 && statsRes.data;
        const usersSuccess = usersRes.status === 200 && usersRes.data;
        const orgsSuccess = orgsRes.status === 200 && orgsRes.data;
        const subsSuccess = subsRes.status === 200 && subsRes.data;
        
        console.log('🔍 DEBUG: API Success Status:', { statsSuccess, usersSuccess, orgsSuccess, subsSuccess });
        
        if (statsSuccess && usersSuccess && orgsSuccess && subsSuccess) {
          setStats(statsRes.data);
          setUsers(usersRes.data);
          setOrganizations(orgsRes.data);
          setSubscriptions(subsRes.data);
          setSystemLogs(logsRes.data);
          setActivities(activityRes.data);
          
          console.log('🔍 DEBUG: State updated with dashboard data');
        } else {
          console.error('🔍 DEBUG: Some API calls failed', {
            stats: { status: statsRes.status, success: statsSuccess },
            users: { status: usersRes.status, success: usersSuccess },
            orgs: { status: orgsRes.status, success: orgsSuccess }
          });
        }
      } catch (error: any) {
        console.error('❌ DEBUG: Failed to fetch dashboard data:', error);
        console.error('❌ DEBUG: Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      } finally {
        console.log('🔍 DEBUG: Setting loading to false');
        setLoading(false);
      }
    };

    const handleRefresh = async () => {
      setRefreshing(true);
      await fetchDashboardData();
      setRefreshing(false);
    };

    const handleMaintenanceMode = async () => {
    setMaintenanceLoading(true);
    try {
      const response = await api.post('/superuser/maintenance-mode');
      console.log('Maintenance mode response:', response);
      
      // Show success message
      const successMessage = response.data?.message || 'Maintenance mode toggled successfully';
      console.log('✅ Success:', successMessage);
      
      // You could add a toast notification here instead of alert
      if (response.data?.maintenanceMode) {
        alert('✅ Maintenance mode ENABLED - Users will see maintenance page');
      } else {
        alert('✅ Maintenance mode DISABLED - Normal access restored');
      }
      
    } catch (error: any) {
      console.error('❌ Failed to toggle maintenance mode:', error);
      const errorMessage = error.response?.data?.message || 'Failed to toggle maintenance mode';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setMaintenanceLoading(false);
    }
  };

  const handleBackupDatabase = async () => {
    setBackupLoading(true);
    try {
      const response = await api.post('/superuser/backup-database');
      console.log('Backup response:', response);
      
      // Show success message with backup details
      const successMessage = response.data?.message || 'Database backup started successfully';
      const backupInfo = response.data?.backupInfo || {};
      
      console.log('✅ Success:', successMessage);
      alert(`✅ ${successMessage}\n\n📁 Backup File: ${backupInfo.fileName || 'Processing...'}\n📊 Size: ${backupInfo.size || 'Calculating...'}\n⏰ Started: ${new Date().toLocaleString()}`);
      
    } catch (error: any) {
      console.error('❌ Failed to backup database:', error);
      const errorMessage = error.response?.data?.message || 'Failed to backup database';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setBackupLoading(false);
    }
  };

  const handleClearCache = async () => {
    setCacheLoading(true);
    try {
      const response = await api.post('/superuser/clear-cache');
      console.log('Clear cache response:', response);
      
      // Show success message with cache details
      const successMessage = response.data?.message || 'Cache cleared successfully';
      const cacheInfo = response.data?.cacheInfo || {};
      
      console.log('✅ Success:', successMessage);
      alert(`✅ ${successMessage}\n\n🗑️ Cleared: ${cacheInfo.clearedItems || 'All cache entries'}\n📦 Space freed: ${cacheInfo.spaceFreed || 'Calculating...'}\n⚡ Performance improved!`);
      
    } catch (error: any) {
      console.error('❌ Failed to clear cache:', error);
      const errorMessage = error.response?.data?.message || 'Failed to clear cache';
      alert(`❌ Error: ${errorMessage}`);
    } finally {
      setCacheLoading(false);
    }
  };

  const handleUserAction = async (userId: string, action: string) => {
      console.log(`🔍 DEBUG: handleUserAction called with userId: ${userId}, action: ${action}`);
      try {
        console.log(`🔍 DEBUG: Making API call to /superuser/users/${userId}/${action}`);
        const response = await api.post(`/superuser/users/${userId}/${action}`);
        console.log('🔍 DEBUG: User action response:', response);
        await fetchDashboardData();
      } catch (error: any) {
        console.error(`❌ DEBUG: Failed to ${action} user:`, error);
        console.error('❌ DEBUG: Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
    };

    // Handler for viewing user details
    const handleViewUser = (user: User) => {
      setSelectedUser(user);
      setShowUserModal(true);
    };

    // Handler for initiating user deletion
    const handleDeleteUser = (user: User) => {
      setUserToDelete(user);
      setShowDeleteModal(true);
    };

    // Handler for confirming user deletion
    const confirmDeleteUser = async () => {
      if (!userToDelete) return;
      
      try {
        await api.delete(`/superuser/users/${userToDelete.id}`);
        setShowDeleteModal(false);
        setUserToDelete(null);
        await fetchDashboardData();
      } catch (error: any) {
        console.error('Failed to delete user:', error);
      }
    };

    // Handler for canceling delete modal
    const cancelDeleteUser = () => {
      setShowDeleteModal(false);
      setUserToDelete(null);
    };

    // Handler for closing user modal
    const closeUserModal = () => {
      setShowUserModal(false);
      setSelectedUser(null);
    };

    // Handler for viewing organization details
    const handleViewOrg = (org: Organization) => {
      setSelectedOrg(org);
      setShowOrgModal(true);
    };

    // Handler for closing organization modal
    const closeOrgModal = () => {
      setShowOrgModal(false);
      setSelectedOrg(null);
    };

    // Handler for viewing subscription details
    const handleViewSub = (sub: Subscription) => {
      setSelectedSub(sub);
      setShowSubModal(true);
    };

    // Handler for closing subscription modal
    const closeSubModal = () => {
      setShowSubModal(false);
      setSelectedSub(null);
    };

    const handleOrgAction = async (orgId: string, action: string) => {
      console.log(`🔍 DEBUG: handleOrgAction called with orgId: ${orgId}, action: ${action}`);
      
      const org = organizations.find(o => o.id === orgId);
      if (!org) return;
      
      // Set selected organization and action type
      setSelectedOrg(org);
      setOrgActionType(action as 'delete' | 'suspend' | 'activate');
      
      // Open appropriate modal
      if (action === 'delete') {
        setShowOrgDeleteModal(true);
      } else if (action === 'suspend' || action === 'activate') {
        setShowOrgSuspendModal(true);
      }
    };

    // Confirm organization action
    const confirmOrgAction = async () => {
      if (!selectedOrg) return;
      
      try {
        // Set loading state
        setOrgActionLoading(selectedOrg.id);
        
        const action = orgActionType;
        console.log(`🔍 DEBUG: Making API call to /superuser/organizations/${selectedOrg.id}/${action}`);
        
        let response;
        if (action === 'delete') {
          response = await api.delete(`/superuser/organizations/${selectedOrg.id}`);
        } else {
          response = await api.post(`/superuser/organizations/${selectedOrg.id}/${action}`, {});
        }
        
        console.log('🔍 DEBUG: Organization action response:', response);
        
        // Show success message
        const actionText = action === 'delete' ? 'deleted' : 
                          action === 'suspend' ? 'suspended' : 
                          action === 'activate' ? 'activated' : 'updated';
        
        // You could add a toast notification here if you have one
        console.log(`✅ Organization successfully ${actionText}`);
        
        // Close modal
        setShowOrgDeleteModal(false);
        setShowOrgSuspendModal(false);
        setSelectedOrg(null);
        
        await fetchDashboardData();
      } catch (error: any) {
        console.error(`❌ DEBUG: Failed to ${orgActionType} organization:`, error);
        console.error('❌ DEBUG: Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
        
        // Show error message to user
        const errorMessage = error.response?.data?.message || `Failed to ${orgActionType} organization`;
        alert(`Error: ${errorMessage}`);
      } finally {
        // Clear loading state
        setOrgActionLoading(null);
      }
    };

    // Cancel organization action
    const cancelOrgAction = () => {
      setShowOrgDeleteModal(false);
      setShowOrgSuspendModal(false);
      setSelectedOrg(null);
    };

    const handleSubscriptionAction = async (subId: string, action: string) => {
      console.log(`🔍 DEBUG: handleSubscriptionAction called with subId: ${subId}, action: ${action}`);
      try {
        console.log(`🔍 DEBUG: Making API call to /superuser/subscriptions/${subId}/${action}`);
        const response = await api.post(`/superuser/subscriptions/${subId}/${action}`);
        console.log('🔍 DEBUG: Subscription action response:', response);
        await fetchDashboardData();
      } catch (error: any) {
        console.error(`❌ DEBUG: Failed to ${action} subscription:`, error);
        console.error('❌ DEBUG: Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
    };

    const filteredUsers = users.filter(user => {
      const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           user.email.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    const filteredOrgs = organizations.filter(org => {
      const matchesSearch = org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           org.admin.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesFilter = filterStatus === 'all' || org.status === filterStatus;
      return matchesSearch && matchesFilter;
    });

    const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg ">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-xs font-medium">Total Users</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalUsers || 0}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-blue-100 text-xs">
              <TrendingUp className="inline w-3 h-3 mr-1" />
              {stats?.monthlyGrowth || 0}% growth
            </span>
            <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((stats?.monthlyGrowth || 0) * 5, 100)}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg ">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-emerald-100 text-xs font-medium">Active Users</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.activeUsers || 0}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-emerald-100 text-xs">
              {stats?.totalUsers ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total
            </span>
            <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${stats?.totalUsers ? (stats.activeUsers / stats.totalUsers) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg ">
              <Building className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-xs font-medium">Organizations</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.totalOrganizations || 0}</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-purple-100 text-xs">
              {stats?.activeOrganizations || 0} active
            </span>
            <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${stats?.totalOrganizations ? (stats.activeOrganizations / stats.totalOrganizations) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 bg-white/20 rounded-lg ">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-xs font-medium">System Health</p>
              <p className="text-3xl font-bold text-white mt-1">{stats?.systemHealth || 0}%</p>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-orange-100 text-xs">
              <Server className="inline w-3 h-3 mr-1" />
              {stats?.serverUptime || 0}% uptime
            </span>
            <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
              <div className="h-full bg-white rounded-full" style={{ width: `${stats?.systemHealth || 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity & System Status */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
              <Activity className="w-5 h-5 mr-2 text-slate-500" />
              Recent Activity
            </h3>
          </div>
          <div className="p-6 space-y-3 max-h-96 overflow-y-auto">
            {activities.slice(0, 5).map(activity => (
              <div key={activity.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center">
                    <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{activity.user}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{activity.action}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                  {new Date(activity.timestamp).toLocaleTimeString()}
                </span>
              </div>
            ))}
            {activities.length === 0 && (
              <div className="text-center py-8 text-slate-500 dark:text-slate-400">
                <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">No recent activity</p>
              </div>
            )}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700">
          <div className="p-6 border-b border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center">
              <Server className="w-5 h-5 mr-2 text-slate-500" />
              System Status
            </h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">Server Status</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Online</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">Database</span>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-medium rounded-full">Connected</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Database className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">Storage</span>
              </div>
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {stats?.storageUsed || 0}GB / {stats?.storageTotal || 0}GB
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="w-4 h-4 text-slate-500" />
                <span className="text-sm font-medium text-slate-900 dark:text-white">API Calls Today</span>
              </div>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.apiCalls || 0}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${(stats?.errorRate || 0) > 5 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">Error Rate</span>
              </div>
              <span className={`text-sm font-medium ${(stats?.errorRate || 0) > 5 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                {stats?.errorRate || 0}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUsers = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
            </select>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center space-x-2"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-600">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Organization</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-600">
              {filteredUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-900 dark:text-white">
                    {user.organization}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      user.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : user.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        title="View User Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                          title="Suspend User"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Activate User"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteUser(user)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        title="Delete User"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
  

  const renderOrganizations = () => (
    <div className="space-y-6">
      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search organizations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="trial">Trial</option>
          </select>
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Add Organization
          </button>
        </div>
      </div>

      {/* Organizations Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredOrgs.map(org => (
          <div key={org.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                <Building className="w-6 h-6" />
              </div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                org.status === 'active' ? 'bg-green-100 text-green-800' :
                org.status === 'inactive' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {org.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">{org.name}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">{org.type}</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Users:</span>
                <span className="text-gray-900 dark:text-white">{org.users}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Revenue:</span>
                <span className="text-gray-900 dark:text-white">₦{org.revenue.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Plan:</span>
                <span className="text-gray-900 dark:text-white">{org.plan}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Subscription:</span>
                <span className="text-gray-900 dark:text-white capitalize">{org.billingCycle}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Amount:</span>
                <span className="text-gray-900 dark:text-white">₦{org.amount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500 dark:text-gray-400">Expires:</span>
                <span className="text-gray-900 dark:text-white">
                  {org.expiresAt ? new Date(org.expiresAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created {new Date(org.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleViewOrg(org)}
                  className="text-blue-600 hover:text-blue-900"
                  title="View Organization Details"
                  disabled={orgActionLoading === org.id}
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOrgAction(org.id, org.status === 'active' ? 'suspend' : 'activate')}
                  className={org.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                  title={org.status === 'active' ? 'Suspend Organization' : 'Activate Organization'}
                  disabled={orgActionLoading === org.id}
                >
                  {orgActionLoading === org.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    org.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />
                  )}
                </button>
                <button
                  onClick={() => handleOrgAction(org.id, 'delete')}
                  className="text-red-600 hover:text-red-900"
                  title="Delete Organization"
                  disabled={orgActionLoading === org.id}
                >
                  {orgActionLoading === org.id ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSubscriptions = () => {
    // Calculate MRR and other metrics
    const activeSubscriptions = subscriptions.filter(sub => sub.status === 'active');
    
    // Calculate total annual revenue first
    const totalAnnualRevenue = activeSubscriptions.reduce((total, sub) => {
      let annualAmount = 0;
      
      // Apply correct pricing logic based on plan and billing cycle
      if (sub.plan.toLowerCase() === 'growth') {
        if (sub.billingCycle === 'yearly' || sub.billingCycle === 'annual') {
          // Growth plan: ₦39,000 monthly × 12 = ₦468,000 yearly, then 20% off
          annualAmount = 39000 * 12 * 0.8; // ₦374,400
        } else {
          // Growth plan monthly: ₦39,000
          annualAmount = 39000 * 12; // ₦468,000 yearly
        }
      } else {
        // Fallback for other plans - use subscription amount with billing cycle logic
        if (sub.billingCycle === 'monthly') {
          annualAmount = sub.amount * 12;
        } else {
          annualAmount = sub.amount;
        }
      }
      
      console.log(`🔍 DEBUG - Subscription: ${sub.plan}, Cycle: ${sub.billingCycle}, Amount: ₦${sub.amount}, Annual: ₦${annualAmount}`);
      return total + annualAmount;
    }, 0);
    
    // MRR is always the annual amount divided by 12
    const mrr = totalAnnualRevenue / 12;
    
    console.log(`🔍 DEBUG - Total Annual Revenue: ₦${totalAnnualRevenue}, MRR: ₦${mrr}`);
    
    const filteredSubs = subscriptions.filter(sub => 
      sub.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.plan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.organization.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterStatus !== 'all') {
      filteredSubs.filter(sub => sub.status === filterStatus);
    }

    return (
      <div className="space-y-6">
        {/* Subscription Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-100 text-sm font-medium">MRR</p>
                <p className="text-3xl font-bold mt-2">₦{mrr.toLocaleString()}</p>
                <p className="text-emerald-100 text-sm mt-1">From {activeSubscriptions.length} active subscriptions</p>
              </div>
              <TrendingUp className="w-12 h-12 text-emerald-200" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-emerald-100 text-xs">
                <TrendingUp className="inline w-3 h-3 mr-1" />
                {stats?.monthlyGrowth || 0}% growth
              </span>
              <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${Math.min((stats?.monthlyGrowth || 0) * 5, 100)}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Annual Revenue</p>
                <p className="text-3xl font-bold mt-2">₦{totalAnnualRevenue.toLocaleString()}</p>
                <p className="text-blue-100 text-sm mt-1">Yearly value of active subscriptions</p>
              </div>
              <Activity className="w-12 h-12 text-blue-200" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-blue-100 text-xs">
                <Activity className="inline w-3 h-3 mr-1" />
                All billing cycles
              </span>
              <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Active Subscriptions</p>
                <p className="text-3xl font-bold mt-2">{activeSubscriptions.length}</p>
                <p className="text-purple-100 text-sm mt-1">Currently active plans</p>
              </div>
              <CreditCard className="w-12 h-12 text-purple-200" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-purple-100 text-xs">
                <Users className="inline w-3 h-3 mr-1" />
                {subscriptions.length} total subscriptions
              </span>
              <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: `${(activeSubscriptions.length / subscriptions.length) * 100}%` }}></div>
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Avg. Revenue/User</p>
                <p className="text-3xl font-bold mt-2">
                  ₦{activeSubscriptions.length > 0 ? Math.round(mrr / activeSubscriptions.length).toLocaleString() : 0}
                </p>
                <p className="text-orange-100 text-sm mt-1">Per active user</p>
              </div>
              <UserCheck className="w-12 h-12 text-orange-200" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-orange-100 text-xs">
                <BarChart3 className="inline w-3 h-3 mr-1" />
                Monthly average
              </span>
              <div className="w-16 h-1 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full bg-white rounded-full" style={{ width: '60%' }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search subscriptions by user, email, plan, or organization..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="inactive">Inactive</option>
            </select>
            <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              Add Subscription
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">All Subscriptions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Billing</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Next Billing</th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredSubs.map(sub => (
                  <tr key={sub.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">{sub.userName}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{sub.userEmail}</div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">{sub.organization}</div>
                      </div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{sub.plan}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{sub.features.length} features</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">₦{sub.amount.toLocaleString()}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{sub.currency}</div>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sub.billingCycle === 'monthly' 
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300'
                      }`}>
                        {sub.billingCycle}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        sub.status === 'active' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                          : sub.status === 'trial'
                          ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                          : sub.status === 'cancelled'
                          ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                      }`}>
                        {sub.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(sub.nextBillingDate).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center space-x-3">
                        <button 
                          onClick={() => handleViewSub(sub)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="View Subscription Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSubscriptionAction(sub.id, sub.status === 'active' ? 'cancel' : 'activate')}
                          className={sub.status === 'active' ? 'text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300' : 'text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300'}
                          title={sub.status === 'active' ? 'Cancel Subscription' : 'Activate Subscription'}
                        >
                          {sub.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const renderPayments = () => (
    <SuperUserPaymentReview />
  );

  const renderActivityMonitor = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Real-time Activity Monitor</h3>
        <div className="space-y-3">
          {activities.map(activity => (
            <div key={activity.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {activity.user} - {activity.action}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.resource} • {activity.device} • {activity.location}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {new Date(activity.timestamp).toLocaleString()}
                </p>
                <p className="text-xs text-gray-400">{activity.ip}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderSystemHealth = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Server Status</h3>
            <Server className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">CPU Usage</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.cpuUsage || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.cpuUsage || 0}%` }}></div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Memory</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.memoryUsage || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats?.memoryUsage || 0}%` }}></div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Disk Space</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.diskUsage || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats?.diskUsage || 0}%` }}></div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Database</h3>
            <Database className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Connections</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.dbConnections || 0}/{stats?.maxConnections || 100}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Query Time</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.queryTime || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Cache Hit Rate</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.cacheHitRate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Storage</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.storageUsedGB || 0}GB</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">API Performance</h3>
            <Globe className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Requests/min</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.apiCalls || 0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Response Time</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.responseTime || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Error Rate</span>
              <span className={`text-sm font-medium ${(stats?.errorRate || 0) > 5 ? 'text-red-600' : 'text-slate-900 dark:text-white'}`}>
                {stats?.errorRate || 0}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Uptime</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.serverUptime || 0}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSystemLogs = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Logs</h3>
        <div className="space-y-2">
          {systemLogs.map(log => (
            <div key={log.id} className="flex items-start space-x-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className={`w-2 h-2 rounded-full mt-2 ${
                log.severity === 'critical' ? 'bg-red-500' :
                log.severity === 'error' ? 'bg-red-400' :
                log.severity === 'warning' ? 'bg-yellow-500' :
                log.severity === 'debug' ? 'bg-gray-500' :
                'bg-blue-500'
              }`}></div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{log.message}</p>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center space-x-4 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Type: {log.type}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Action: {log.action}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    IP: {log.ip}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderAnalytics = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">User Growth</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Users</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{(stats?.totalUsers || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="text-2xl font-bold text-green-600">{(stats?.activeUsers || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</span>
              <span className={`text-2xl font-bold ${(stats?.monthlyGrowth || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {(stats?.monthlyGrowth || 0) >= 0 ? '+' : ''}{(stats?.monthlyGrowth || 0).toFixed(1)}%
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">This Month</span>
                <span className="font-medium text-gray-900 dark:text-white">{(stats?.thisMonthUsers || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-500 dark:text-gray-400">Last Month</span>
                <span className="font-medium text-gray-900 dark:text-white">{(stats?.lastMonthUsers || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trends</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">₦{Number(stats?.totalRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Growth</span>
              <span className={`text-2xl font-bold ${(stats?.revenueGrowth || 0) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {(stats?.revenueGrowth || 0) >= 0 ? '+' : ''}{(stats?.revenueGrowth || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Net Profit</span>
              <span className={`text-2xl font-bold ${(stats?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₦{Number(stats?.netProfit || 0).toLocaleString()}
              </span>
            </div>
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500 dark:text-gray-400">This Month</span>
                <span className="font-medium text-gray-900 dark:text-white">₦{Number(stats?.thisMonthRevenue || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-sm mt-1">
                <span className="text-gray-500 dark:text-gray-400">Last Month</span>
                <span className="font-medium text-gray-900 dark:text-white">₦{Number(stats?.lastMonthRevenue || 0).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Analytics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Organizations</h4>
            <Building className="w-6 h-6 text-blue-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{(stats?.totalOrganizations || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active</span>
              <span className="text-xl font-bold text-green-600">{(stats?.activeOrganizations || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">Assets</h4>
            <Activity className="w-6 h-6 text-purple-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Assets</span>
              <span className="text-xl font-bold text-gray-900 dark:text-white">{(stats?.totalAssets || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Inventory Items</span>
              <span className="text-xl font-bold text-orange-600">{(stats?.totalInventory || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">System Health</h4>
            <Server className="w-6 h-6 text-green-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Health Score</span>
              <span className={`text-xl font-bold ${(stats?.systemHealth || 0) > 80 ? 'text-green-600' : (stats?.systemHealth || 0) > 60 ? 'text-yellow-600' : 'text-red-600'}`}>
                {(stats?.systemHealth || 0).toFixed(1)}%
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="text-xl font-bold text-blue-600">{(stats?.serverUptime || 0).toFixed(1)}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="space-y-6">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">System Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Maintenance Mode</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Temporarily disable user access</p>
            </div>
            <button 
              onClick={handleMaintenanceMode}
              disabled={maintenanceLoading}
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {maintenanceLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Enabling...
                </>
              ) : (
                <>
                  <Settings className="w-4 h-4" />
                  Toggle Maintenance
                </>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Backup Database</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create system backup</p>
            </div>
            <button 
              onClick={handleBackupDatabase}
              disabled={backupLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {backupLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Backing Up...
                </>
              ) : (
                <>
                  <Database className="w-4 h-4" />
                  Backup Now
                </>
              )}
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Clear Cache</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Clear system cache</p>
            </div>
            <button 
              onClick={handleClearCache}
              disabled={cacheLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {cacheLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Clearing...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  Clear Cache
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );

    const renderContent = () => {
      console.log('🔍 DEBUG: renderContent called');
      console.log('🔍 DEBUG: Current activeTab:', activeTab);
      console.log('🔍 DEBUG: Loading state:', loading);
      console.log('🔍 DEBUG: Stats data:', stats);
      console.log('🔍 DEBUG: Users data:', users);

      // Don't check loading state here - it's handled at component level
      if (!stats) {
        console.log('🔍 DEBUG: No stats data available');
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-lg text-gray-600 dark:text-gray-400">No data available</p>
              <p className="mt-4 text-sm text-gray-500">
                Check browser console for API errors
              </p>
            </div>
          </div>
        );
      }
      switch (activeTab) {
        case 'overview': return renderOverview();
        case 'users': return renderUsers();
        case 'organizations': return renderOrganizations();
        case 'subscriptions': return renderSubscriptions();
        case 'payments': return renderPayments();
        case 'activity': return renderActivityMonitor();
        case 'system': return renderSystemHealth();
        case 'logs': return renderSystemLogs();
        case 'analytics': return renderAnalytics();
        case 'settings': return renderSettings();
        default: return renderOverview();
      }
    };

    if (loading) {
      return (
        <div className="flex-1 flex items-center justify-center py-12">
          <div className="text-center">
            <div className="relative w-16 h-16 mx-auto mb-6">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="text-lg font-medium text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Please wait while we fetch your data</p>
          </div>
        </div>
      );
    }

    return (
      <div className="w-full">
        {/* Page Content */}
        {renderContent()}

        {/* User Details Modal */}
        {showUserModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">User Details</h3>
                <button
                  onClick={closeUserModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {selectedUser.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedUser.email}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Role:</span>
                    <span className="ml-2 font-medium">{selectedUser.role}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Status:</span>
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedUser.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : selectedUser.status === 'inactive'
                        ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                      {selectedUser.status}
                    </span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Organization:</span>
                    <span className="ml-2 font-medium">{selectedUser.organization}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="ml-2 font-medium">{new Date(selectedUser.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete User Confirmation Modal */}
        {showDeleteModal && userToDelete && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Delete User</h3>
                <button
                  onClick={cancelDeleteUser}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mb-6">
                <p className="text-gray-600 dark:text-gray-400">
                  Are you sure you want to delete this user? This action cannot be undone.
                </p>
                <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="font-medium text-red-800 dark:text-red-300">{userToDelete.name}</p>
                  <p className="text-sm text-red-600 dark:text-red-400">{userToDelete.email}</p>
                </div>
              </div>
              
              <div className="flex space-x-3">
                <button
                  onClick={cancelDeleteUser}
                  className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteUser}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete User
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Organization Details Modal */}
        {showOrgModal && selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Organization Details</h3>
                <button
                  onClick={closeOrgModal}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Organization Header */}
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center text-white">
                    <Building className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-xl font-semibold text-gray-900 dark:text-white">{selectedOrg.name}</h4>
                    <p className="text-gray-600 dark:text-gray-400">{selectedOrg.type}</p>
                  </div>
                </div>
                
                {/* Organization Stats */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Users</span>
                      <Users className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">{selectedOrg.users}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Revenue</span>
                      <DollarSign className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">₦{selectedOrg.revenue.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Status</span>
                      <Activity className="w-4 h-4 text-gray-400" />
                    </div>
                    <span className={`inline-block mt-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedOrg.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                      selectedOrg.status === 'inactive' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                      'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300'
                    }`}>
                      {selectedOrg.status}
                    </span>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
                      <CreditCard className="w-4 h-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white mt-2">{selectedOrg.plan}</p>
                  </div>
                </div>
                
                {/* Organization Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Location:</span>
                    <span className="ml-2 font-medium">{selectedOrg.location}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Admin:</span>
                    <span className="ml-2 font-medium">{selectedOrg.admin}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Contact:</span>
                    <span className="ml-2 font-medium">{selectedOrg.contact}</span>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600 dark:text-gray-400">Created:</span>
                    <span className="ml-2 font-medium">{new Date(selectedOrg.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organization Delete Confirmation Modal */}
        {showOrgDeleteModal && selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Trash2 className="w-5 h-5 text-red-600" />
                  Delete Organization
                </h3>
                <button
                  onClick={cancelOrgAction}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
                  <p className="text-red-800 dark:text-red-200 font-medium">
                    ⚠️ This action cannot be undone
                  </p>
                  <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                    Deleting "{selectedOrg.name}" will permanently remove:
                  </p>
                  <ul className="text-red-600 dark:text-red-400 text-sm mt-2 list-disc list-inside space-y-1">
                    <li>All users in this organization</li>
                    <li>All subscriptions and billing data</li>
                    <li>All farm data, inventory, and assets</li>
                    <li>All historical records and reports</li>
                  </ul>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Organization:</span> {selectedOrg.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">ID:</span> {selectedOrg.id}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Users:</span> {selectedOrg.users || 0}
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={cancelOrgAction}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmOrgAction}
                    disabled={orgActionLoading === selectedOrg.id}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {orgActionLoading === selectedOrg.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Organization
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Organization Suspend/Activate Modal */}
        {showOrgSuspendModal && selectedOrg && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  {orgActionType === 'suspend' ? (
                    <>
                      <Lock className="w-5 h-5 text-yellow-600" />
                      Suspend Organization
                    </>
                  ) : (
                    <>
                      <Unlock className="w-5 h-5 text-green-600" />
                      Activate Organization
                    </>
                  )}
                </h3>
                <button
                  onClick={cancelOrgAction}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="space-y-4">
                <div className={`rounded-lg p-4 ${
                  orgActionType === 'suspend' 
                    ? 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800'
                    : 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                }`}>
                  <p className={`font-medium ${
                    orgActionType === 'suspend'
                      ? 'text-yellow-800 dark:text-yellow-200'
                      : 'text-green-800 dark:text-green-200'
                  }`}>
                    {orgActionType === 'suspend' ? '🔒 Suspend Organization' : '🔓 Activate Organization'}
                  </p>
                  <p className={`text-sm mt-1 ${
                    orgActionType === 'suspend'
                      ? 'text-yellow-700 dark:text-yellow-300'
                      : 'text-green-700 dark:text-green-300'
                  }`}>
                    {orgActionType === 'suspend' 
                      ? `Suspending "${selectedOrg.name}" will prevent all users from accessing the system and temporarily disable all services.`
                      : `Activating "${selectedOrg.name}" will restore full access for all users and enable all services.`
                    }
                  </p>
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Organization:</span> {selectedOrg.name}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Current Status:</span> 
                    <span className={`ml-2 px-2 py-1 text-xs font-semibold rounded-full ${
                      selectedOrg.status === 'active' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300'
                        : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'
                    }`}>
                      {selectedOrg.status}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Users:</span> {selectedOrg.users || 0}
                  </p>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={cancelOrgAction}
                    className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmOrgAction}
                    disabled={orgActionLoading === selectedOrg.id}
                    className={`px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${
                      orgActionType === 'suspend'
                        ? 'bg-yellow-600 hover:bg-yellow-700'
                        : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {orgActionLoading === selectedOrg.id ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        {orgActionType === 'suspend' ? 'Suspending...' : 'Activating...'}
                      </>
                    ) : (
                      <>
                        {orgActionType === 'suspend' ? (
                          <>
                            <Lock className="w-4 h-4" />
                            Suspend Organization
                          </>
                        ) : (
                          <>
                            <Unlock className="w-4 h-4" />
                            Activate Organization
                          </>
                        )}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Subscription Details Modal */}
        {showSubModal && selectedSub && (
          <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto z-50">
            <div className="flex min-h-full items-start justify-center py-6 px-4">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 max-w-xl w-full max-h-[80vh] flex flex-col">
                <div className="flex justify-between items-center pb-3 border-b border-gray-200 dark:border-gray-700 flex-shrink-0">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Subscription Details</h3>
                  <button
                    onClick={closeSubModal}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                <div className="overflow-y-auto flex-1 py-3">
                  <div className="space-y-4">
                    {/* Subscription Header */}
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white">
                        <CreditCard className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white capitalize">{selectedSub.plan}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{selectedSub.userName}</p>
                      </div>
                    </div>

                    {/* Subscription Stats */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Amount</span>
                          <DollarSign className="w-3 h-3 text-gray-400" />
                        </div>
                        <p className="text-lg font-bold text-gray-900 dark:text-white mt-1">₦{selectedSub.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">per {selectedSub.billingCycle}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Status</span>
                          <Activity className="w-3 h-3 text-gray-400" />
                        </div>
                        <span className={`inline-block mt-1 px-2 py-1 text-xs font-semibold rounded-full ${
                          selectedSub.status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' :
                          selectedSub.status === 'trial' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300' :
                          selectedSub.status === 'inactive' ? 'bg-gray-100 text-gray-800 dark:bg-gray-900/50 dark:text-gray-300' :
                          selectedSub.status === 'cancelled' ? 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300' :
                          'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300'
                        }`}>
                          {selectedSub.status}
                        </span>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Billing Cycle</span>
                          <Calendar className="w-3 h-3 text-gray-400" />
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1 capitalize">{selectedSub.billingCycle}</p>
                      </div>
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-600 dark:text-gray-400">Auto Renew</span>
                          <RefreshCw className="w-3 h-3 text-gray-400" />
                        </div>
                        <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">
                          {selectedSub.autoRenew ? 'Yes' : 'No'}
                        </p>
                      </div>
                    </div>

                    {/* Subscription Information */}
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">User Email</span>
                          <span className="font-medium text-gray-900 dark:text-white break-all">{selectedSub.userEmail}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Organization</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedSub.organization}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Payment Method</span>
                          <span className="font-medium text-gray-900 dark:text-white capitalize">{selectedSub.paymentMethod || 'N/A'}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Currency</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedSub.currency}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Start Date</span>
                          <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedSub.startDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">End Date</span>
                          <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedSub.endDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Next Billing</span>
                          <span className="font-medium text-gray-900 dark:text-white">{new Date(selectedSub.nextBillingDate).toLocaleDateString()}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs text-gray-500 dark:text-gray-400">Last Payment</span>
                          <span className="font-medium text-gray-900 dark:text-white">{selectedSub.lastPaymentDate ? new Date(selectedSub.lastPaymentDate).toLocaleDateString() : 'N/A'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    {selectedSub.features && selectedSub.features.length > 0 && (
                      <div>
                        <h5 className="text-xs font-medium text-gray-900 dark:text-white mb-2">Features</h5>
                        <div className="flex flex-wrap gap-2">
                          {selectedSub.features.map((feature, index) => (
                            <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 text-xs rounded-full">
                              {feature}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
    
  } catch (error) {
    console.error('❌ SUPERUSER DASHBOARD COMPONENT ERROR:', error);
    return (
      <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-red-600 dark:text-red-400">Dashboard loading failed</p>
          <p className="mt-2 text-sm text-gray-500">Check console for error details</p>
        </div>
      </div>
    );
  }
};

export default SuperUserDashboard;
