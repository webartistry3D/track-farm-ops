import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';
import {
  Users, Building, Activity, Database, Settings, Globe, TrendingUp, TrendingDown,
  Eye, Lock, Unlock, Search, RefreshCw, BarChart3, LineChart,
  UserCheck, LogOut, Bell, Menu, X, Server, FileText, Trash2, Plus, CreditCard, DollarSign
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
  createdAt: string;
  subscription: string;
  location: string;
  admin: string;
  contact: string;
  plan: string;
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
  billingCycle: 'monthly' | 'yearly';
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
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  user?: string;
  ip: string;
  action: string;
  details: any;
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
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    console.log('🔍 HOOKS CALLED SUCCESSFULLY');

    const handleLogout = () => {
      try {
        console.log('🚪 [SuperUserDashboard] Starting logout...');
        
        // Call the logout function from AuthContext
        logout();
        
        // Navigate to login page
        navigate('/login');
        
        console.log('✅ [SuperUserDashboard] Logout initiated successfully');
      } catch (error) {
        console.error('❌ [SuperUserDashboard] Logout error:', error);
        // Fallback navigation
        window.location.href = '/login';
      }
    };
    
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');
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

    const menuItems = [
      { id: 'overview', label: 'Overview', icon: BarChart3 },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'organizations', label: 'Organizations', icon: Building },
      { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
      { id: 'activity', label: 'Activity Monitor', icon: Activity },
      { id: 'system', label: 'System Health', icon: Server },
      { id: 'logs', label: 'System Logs', icon: FileText },
      { id: 'analytics', label: 'Analytics', icon: LineChart },
      { id: 'settings', label: 'Settings', icon: Settings }
    ];

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
    try {
      await api.post('/superuser/maintenance-mode');
      alert('Maintenance mode toggled successfully');
    } catch (error) {
      console.error('Failed to toggle maintenance mode:', error);
      alert('Failed to toggle maintenance mode');
    }
  };

  const handleBackupDatabase = async () => {
    try {
      const response = await api.post('/superuser/backup-database');
      alert('Database backup started successfully');
      console.log('Backup response:', response);
    } catch (error) {
      console.error('Failed to backup database:', error);
      alert('Failed to backup database');
    }
  };

  const handleClearCache = async () => {
    try {
      await api.post('/superuser/clear-cache');
      alert('Cache cleared successfully');
    } catch (error) {
      console.error('Failed to clear cache:', error);
      alert('Failed to clear cache');
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

    const handleOrgAction = async (orgId: string, action: string) => {
      console.log(`🔍 DEBUG: handleOrgAction called with orgId: ${orgId}, action: ${action}`);
      try {
        console.log(`🔍 DEBUG: Making API call to /superuser/organizations/${orgId}/${action}`);
        const response = await api.post(`/superuser/organizations/${orgId}/${action}`);
        console.log('🔍 DEBUG: Organization action response:', response);
        await fetchDashboardData();
      } catch (error: any) {
        console.error(`❌ DEBUG: Failed to ${action} organization:`, error);
        console.error('❌ DEBUG: Error details:', {
          message: error.message,
          status: error.response?.status,
          data: error.response?.data
        });
      }
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
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Users className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-blue-100 text-xs font-medium">Total Users</p>
              <p className="text-3xl font-bold mt-1">{stats?.totalUsers || 0}</p>
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
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-emerald-100 text-xs font-medium">Active Users</p>
              <p className="text-3xl font-bold mt-1">{stats?.activeUsers || 0}</p>
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
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Building className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-purple-100 text-xs font-medium">Organizations</p>
              <p className="text-3xl font-bold mt-1">{stats?.totalOrganizations || 0}</p>
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
            <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
              <Activity className="w-6 h-6" />
            </div>
            <div className="text-right">
              <p className="text-orange-100 text-xs font-medium">System Health</p>
              <p className="text-3xl font-bold mt-1">{stats?.systemHealth || 0}%</p>
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
                    <div className="flex space-x-1">
                      {user.status === 'active' ? (
                        <button
                          onClick={() => handleUserAction(user.id, 'suspend')}
                          className="text-amber-600 hover:text-amber-900 dark:text-amber-400 dark:hover:text-amber-300"
                        >
                          <Lock className="w-4 h-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUserAction(user.id, 'activate')}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          <Unlock className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleUserAction(user.id, 'delete')}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
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
            </div>
            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Created {new Date(org.createdAt).toLocaleDateString()}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  className="text-blue-600 hover:text-blue-900"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleOrgAction(org.id, org.status === 'active' ? 'suspend' : 'activate')}
                  className={org.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
                >
                  {org.status === 'active' ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
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
    const mrr = activeSubscriptions.reduce((total, sub) => {
      const monthlyAmount = sub.billingCycle === 'yearly' ? sub.amount / 12 : sub.amount;
      return total + monthlyAmount;
    }, 0);
    
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
                <p className="text-emerald-100 text-sm font-medium">Monthly Recurring Revenue</p>
                <p className="text-3xl font-bold mt-2">₦{mrr.toLocaleString()}</p>
                <p className="text-emerald-100 text-sm mt-1">From {activeSubscriptions.length} active subscriptions</p>
              </div>
              <TrendingUp className="w-12 h-12 text-emerald-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Total Subscriptions</p>
                <p className="text-3xl font-bold mt-2">{subscriptions.length}</p>
                <p className="text-blue-100 text-sm mt-1">{activeSubscriptions.length} active</p>
              </div>
              <CreditCard className="w-12 h-12 text-blue-200" />
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Churn Rate</p>
                <p className="text-3xl font-bold mt-2">
                  {subscriptions.length > 0 ? Math.round((subscriptions.filter(s => s.status === 'cancelled' || s.status === 'expired').length / subscriptions.length) * 100) : 0}%
                </p>
                <p className="text-purple-100 text-sm mt-1">This month</p>
              </div>
              <TrendingDown className="w-12 h-12 text-purple-200" />
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
              <DollarSign className="w-12 h-12 text-orange-200" />
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
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-1">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleSubscriptionAction(sub.id, sub.status === 'active' ? 'cancel' : 'activate')}
                          className={sub.status === 'active' ? 'text-yellow-600 hover:text-yellow-900' : 'text-green-600 hover:text-green-900'}
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
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.systemHealth || 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-green-500 h-2 rounded-full" style={{ width: `${stats?.systemHealth || 0}%` }}></div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Memory</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.storageUsed ? Math.round((stats.storageUsed / stats.storageTotal) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-yellow-500 h-2 rounded-full" style={{ width: `${stats?.storageUsed ? Math.round((stats.storageUsed / stats.storageTotal) * 100) : 0}%` }}></div>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Disk Space</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.storageUsed ? Math.round((stats.storageUsed / stats.storageTotal) * 100) : 0}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats?.storageUsed ? Math.round((stats.storageUsed / stats.storageTotal) * 100) : 0}%` }}></div>
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
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.totalUsers || 0}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Query Time</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.serverUptime || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Cache Hit Rate</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{100 - (stats?.errorRate || 0)}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Storage</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{((stats?.storageUsed || 0) / 1024).toFixed(1)}GB</span>
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
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.serverUptime || 0}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">Error Rate</span>
              <span className="text-sm font-medium text-slate-900 dark:text-white">{stats?.errorRate || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Uptime</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">99.9%</span>
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
                log.level === 'critical' ? 'bg-red-500' :
                log.level === 'error' ? 'bg-red-400' :
                log.level === 'warning' ? 'bg-yellow-500' :
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
                    {log.user ? `User: ${log.user}` : 'System'}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    IP: {log.ip}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    Action: {log.action}
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
              <span className="text-2xl font-bold text-gray-900 dark:text-white">{stats?.totalUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Active Users</span>
              <span className="text-2xl font-bold text-green-600">{stats?.activeUsers || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Growth Rate</span>
              <span className="text-2xl font-bold text-emerald-600">+{stats?.monthlyGrowth || 0}%</span>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Revenue Trends</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Revenue</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-white">₦{(stats?.totalRevenue || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 dark:text-gray-400">Monthly Growth</span>
              <span className="text-2xl font-bold text-emerald-600">+{stats?.monthlyGrowth || 0}%</span>
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
              className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
            >
              {loading ? 'Enabling...' : 'Enable Maintenance'}
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Backup Database</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Create system backup</p>
            </div>
            <button 
              onClick={handleBackupDatabase}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Backing Up...' : 'Backup Now'}
            </button>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Clear Cache</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Clear system cache</p>
            </div>
            <button 
              onClick={handleClearCache}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Clearing...' : 'Clear Cache'}
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
      console.log('🔍 DEBUG: Sidebar open:', sidebarOpen);

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
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
              <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400">Loading dashboard...</p>
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-500">Please wait while we fetch your data</p>
          </div>
        </div>
      );
    }

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
          <div className="flex items-center justify-between p-3">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <Menu className="w-5 h-5 text-slate-600 dark:text-slate-300" />
              </button>
              <h1 className="text-base font-semibold text-slate-900 dark:text-white">Superuser Panel</h1>
            </div>
            <div className="flex items-center space-x-1">
              {/* Theme Toggle */}
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
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex">
          {/* Sidebar - Desktop: Fixed, Mobile: Overlay */}
          <div className={`
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
            lg:translate-x-0 fixed lg:static inset-y-0 left-0 z-30
            w-56 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700
            transition-transform duration-300 ease-in-out
            lg:border-r lg:border-slate-200 lg:dark:border-slate-700
          `}>
            <div className="flex flex-col h-full">
              {/* Sidebar Header */}
              <div className="p-4 border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <h1 className="text-lg font-bold text-slate-900 dark:text-white">Superuser Panel</h1>
                  <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="lg:hidden p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    <X className="w-5 h-5 text-slate-500" />
                  </button>
                </div>
              </div>
              
              {/* Navigation */}
              <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                {menuItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      if (window.innerWidth < 1024) {
                        setSidebarOpen(false);
                      }
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      activeTab === item.id
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 shadow-sm'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700/50'
                    }`}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </nav>
              
              {/* User Profile */}
              <div className="p-3 border-t border-slate-200 dark:border-slate-700">
                <div className="flex items-center space-x-3 p-2 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-semibold shadow-sm text-xs">
                    {user?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Superuser</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full mt-2 flex items-center justify-center space-x-2 px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-200 text-sm font-medium"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div 
              className="lg:hidden fixed inset-0 bg-black/50 z-20"
              onClick={() => setSidebarOpen(false)}
            />
          )}

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            {/* Desktop Header */}
            <div className="hidden lg:block bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
              <div className="px-6 py-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">
                      {activeTab.replace('-', ' ')}
                    </h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      Complete system oversight and control
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Theme Toggle */}
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
                    <button
                      onClick={handleRefresh}
                      disabled={refreshing}
                      className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <RefreshCw className={`w-5 h-5 text-slate-600 dark:text-slate-300 ${refreshing ? 'animate-spin' : ''}`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Page Content */}
            <main className="p-4 lg:p-6 max-w-7xl mx-auto">
              {renderContent()}
            </main>
          </div>
        </div>
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
