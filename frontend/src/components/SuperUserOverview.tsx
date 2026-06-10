import { useState, useEffect } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import api from '../lib/api';
import {
  Users, Building, Activity, Server, Database, Globe, TrendingUp,
  UserCheck, RefreshCw
} from 'lucide-react';

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
  revenueGrowth: number;
  thisMonthUsers: number;
  lastMonthUsers: number;
  thisMonthRevenue: number;
  lastMonthRevenue: number;
}

interface Activity {
  id: string;
  user: string;
  action: string;
  timestamp: string;
}

const SuperUserOverview = () => {
  const { isDark, toggleTheme } = useTheme();
  const [stats, setStats] = useState<SuperUserStats | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, activityRes] = await Promise.all([
        api.get('/superuser/stats'),
        api.get('/superuser/activity')
      ]);

      setStats(statsRes.data);
      setActivities(activityRes.data || []);
    } catch (error) {
      console.error('Error fetching superuser data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
            <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
          </div>
          <p className="mt-6 text-lg font-medium text-gray-600 dark:text-gray-400">Loading overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-6 pb-24">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Overview</h1>
            <p className="text-sm text-slate-600 dark:text-slate-400">Complete system oversight and control</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? '☀️' : '🌙'}
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

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg hover:shadow-xl transition-shadow duration-300">
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
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
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
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
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
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
              <div className="p-3 bg-white/20 rounded-lg backdrop-blur-sm">
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
    </div>
  );
};

export default SuperUserOverview;
