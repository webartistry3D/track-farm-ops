import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';
import { 
  AnalyticsSkeleton
} from './EnhancedSkeletons';
import { 
  TrendingUp, 
  ShoppingCart, 
  Calendar,
  PieChart,
  Package,
  Heart,
  Apple,
  Box
} from 'lucide-react';

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeByCategory: { category: string; amount: number }[];
  expensesByCategory: { category: string; amount: number }[];
}

interface InventorySummary {
  totalItems: number;
  livestock: number;
  produce: number;
  consumables: number;
  totalTransactions: number;
  itemsByType: {
    LIVESTOCK: any[];
    PRODUCE: any[];
    CONSUMABLES: any[];
  };
}

const Analytics = () => {
  const { user } = useAuth();

  // Check if user has appropriate role
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="text-gray-500 dark:text-gray-400">Please log in to view analytics.</div>
        </div>
      </div>
    );
  }

  const isOwner = user.role === 'OWNER' || user.role === 'MANAGER';

  if (!isOwner) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 text-center">
          <div className="w-16 h-16 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-100 mb-2">Access Restricted</h3>
          <p className="text-yellow-700 dark:text-yellow-300">
            Analytics is only available to farm owners and managers.
          </p>
        </div>
      </div>
    );
  }

  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom' | 'allTime'>('allTime');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const getDefaultFinancialSummary = (): FinancialSummary => ({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeByCategory: [],
    expensesByCategory: []
  });

  const getDefaultInventorySummary = (): InventorySummary => ({
    totalItems: 0,
    livestock: 0,
    produce: 0,
    consumables: 0,
    totalTransactions: 0,
    itemsByType: {
      LIVESTOCK: [],
      PRODUCE: [],
      CONSUMABLES: []
    }
  });

  useEffect(() => {
    console.log('🔄 useEffect triggered - dateFilter changed to:', dateFilter);
    fetchAnalytics();
  }, [dateFilter, selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    console.log('🔄 fetchAnalytics triggered - dateFilter:', dateFilter);
    setFinancialLoading(true);
    setInventoryLoading(true);

    try {
      // Calculate date range based on filter
      const today = new Date();
      let startDate = '';
      let endDate = '';

      switch (dateFilter) {
        case 'today':
          startDate = today.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
          startDate = yesterday.toISOString().split('T')[0];
          endDate = yesterday.toISOString().split('T')[0];
          break;
        case 'last7days':
          const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'last30days':
          const thirtyDaysAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
          startDate = thirtyDaysAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'custom':
          const customDate = new Date(selectedYear, selectedMonth, 1);
          const lastDayOfCustomMonth = new Date(selectedYear, selectedMonth + 1, 0);
          startDate = customDate.toISOString().split('T')[0];
          endDate = lastDayOfCustomMonth.toISOString().split('T')[0];
          break;
        case 'allTime':
          // For allTime, don't set date filters to get all data
          startDate = '';
          endDate = '';
          break;
      }

      console.log(`📅 Date range: ${startDate} to ${endDate}`);

      let financialData = getDefaultFinancialSummary();
      try {
        console.log('📊 Making API calls to /finance/income and /finance/expenses');
        const [incomeResponse, expenseResponse] = await Promise.all([
          api.get(`/finance/income${startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`),
          api.get(`/finance/expenses${startDate && endDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`)
        ]);

        console.log('📥 Raw API responses:', {
          incomeResponse: incomeResponse.data,
          expenseResponse: expenseResponse.data,
          incomeResponseStatus: incomeResponse.status,
          expenseResponseStatus: expenseResponse.status
        });

        const incomeData = incomeResponse.data?.entries || [];
        const expenseData = expenseResponse.data?.entries || [];

        console.log('📊 Extracted data arrays:', {
          incomeData: incomeData.length,
          expenseData: expenseData.length,
          incomeDataSample: incomeData.slice(0, 2),
          expenseDataSample: expenseData.slice(0, 2)
        });

        console.log('🔍 Checking API response structure:', {
          hasIncomeTotal: 'totalIncome' in incomeResponse.data,
          hasExpenseTotal: 'totalExpenses' in expenseResponse.data,
          incomeTotalValue: incomeResponse.data?.totalIncome,
          expenseTotalValue: expenseResponse.data?.totalExpenses,
          incomeTotalType: typeof incomeResponse.data?.totalIncome,
          expenseTotalType: typeof expenseResponse.data?.totalExpenses
        });

        // Check if API is returning pre-calculated totals instead of entries
        if (typeof incomeResponse.data?.totalIncome === 'string' || typeof expenseResponse.data?.totalExpenses === 'string') {
          console.log('⚠️ API is returning pre-calculated totals as strings!');
          const apiTotalIncome = Number(incomeResponse.data?.totalIncome) || 0;
          const apiTotalExpenses = Number(expenseResponse.data?.totalExpenses) || 0;

          console.log('🔧 Converted API totals:', {
            totalIncome: apiTotalIncome,
            totalExpenses: apiTotalExpenses,
            netProfit: apiTotalIncome - apiTotalExpenses
          });

          financialData = {
            totalIncome: apiTotalIncome,
            totalExpenses: apiTotalExpenses,
            netProfit: apiTotalIncome - apiTotalExpenses,
            incomeByCategory: incomeResponse.data?.incomeByCategory || [],
            expensesByCategory: expenseResponse.data?.expensesByCategory || []
          };
        } else if (incomeData.length > 0 || expenseData.length > 0) {
          // Calculate from individual entries
          console.log('📊 Calculating from individual entries...');

          // Calculate totals from the actual transaction data
          console.log('🔍 Income data analysis:', {
            totalEntries: incomeData.length,
            sampleEntries: incomeData.slice(0, 5),
            allAmounts: incomeData.map((entry: { amount: string | number }) => entry.amount)
          });
          
          const totalIncome = incomeData.reduce((sum: number, entry: { amount: string | number }) => {
            const amount = parseFloat(String(entry.amount)) || 0;
            console.log('🔍 Income entry amount:', entry.amount, 'parsed to:', amount, 'running sum:', sum + amount);
            return sum + amount;
          }, 0);
          const totalExpenses = expenseData.reduce((sum: number, entry: { amount: string | number }) => {
            const amount = parseFloat(String(entry.amount)) || 0;
            console.log('🔍 Expense entry amount:', entry.amount, 'parsed to:', amount);
            return sum + amount;
          }, 0);

          console.log('💰 Calculated totals:', {
            totalIncome,
            totalExpenses,
            netProfit: totalIncome - totalExpenses,
            incomeEntries: incomeData.length,
            expenseEntries: expenseData.length
          });

          // Group by category
          const incomeByCategory = incomeData.reduce((acc: any[], entry: any) => {
            const category = entry.category || 'General';
            const amount = parseFloat(entry.amount) || 0;
            const existing = acc.find(item => item.category === category);
            if (existing) {
              existing.amount += amount;
            } else {
              acc.push({ category, amount });
            }
            return acc;
          }, []);

          const expensesByCategory = expenseData.reduce((acc: any[], entry: any) => {
            const category = entry.category || 'General';
            const amount = parseFloat(entry.amount) || 0;
            const existing = acc.find(item => item.category === category);
            if (existing) {
              existing.amount += amount;
            } else {
              acc.push({ category, amount });
            }
            return acc;
          }, []);

          financialData = {
            totalIncome: Number(totalIncome) || 0,
            totalExpenses: Number(totalExpenses) || 0,
            netProfit: Number(totalIncome) - Number(totalExpenses),
            incomeByCategory,
            expensesByCategory
          };
        } else {
          console.log('📊 No data available - using default values');
        }

        console.log('📊 Processed financial data:', financialData);
        
        // FINAL SAFETY NET: Ensure all values are numbers regardless of source
        const safeFinancialData = {
          totalIncome: Number(financialData.totalIncome) || 0,
          totalExpenses: Number(financialData.totalExpenses) || 0,
          netProfit: Number(financialData.netProfit) || 0,
          incomeByCategory: financialData.incomeByCategory || [],
          expensesByCategory: financialData.expensesByCategory || []
        };
        
        console.log('🛡️ Final safe financial data:', safeFinancialData);
        console.log('🔍 Data types:', {
          totalIncome: typeof safeFinancialData.totalIncome,
          totalExpenses: typeof safeFinancialData.totalExpenses,
          netProfit: typeof safeFinancialData.netProfit
        });
        
        // Replace the financial data with the safe version
        financialData = safeFinancialData;
        
        // ADDITIONAL SAFETY: Force string to number conversion at the point of use
        if (typeof financialData.totalIncome === 'string') {
          console.warn('⚠️ FORCING string to number conversion for totalIncome');
          financialData.totalIncome = Number(financialData.totalIncome) || 0;
        }
        if (typeof financialData.totalExpenses === 'string') {
          console.warn('⚠️ FORCING string to number conversion for totalExpenses');
          financialData.totalExpenses = Number(financialData.totalExpenses) || 0;
        }
        if (typeof financialData.netProfit === 'string') {
          console.warn('⚠️ FORCING string to number conversion for netProfit');
          financialData.netProfit = Number(financialData.netProfit) || 0;
        }
      } catch (error) {
        console.error('❌ Financial API error:', error);
      }

      let inventoryData = getDefaultInventorySummary();
      try {
        const inventoryResponse = await api.get('/inventory/summary');
        inventoryData = {
          totalItems: typeof inventoryResponse.data.totalItems === 'number' ? inventoryResponse.data.totalItems : 0,
          livestock: typeof inventoryResponse.data.livestock === 'number' ? inventoryResponse.data.livestock : 0,
          produce: typeof inventoryResponse.data.produce === 'number' ? inventoryResponse.data.produce : 0,
          consumables: typeof inventoryResponse.data.consumables === 'number' ? inventoryResponse.data.consumables : 0,
          totalTransactions: typeof inventoryResponse.data.totalTransactions === 'number' ? inventoryResponse.data.totalTransactions : 0,
          itemsByType: inventoryResponse.data.itemsByType && typeof inventoryResponse.data.itemsByType === 'object' ? inventoryResponse.data.itemsByType : { LIVESTOCK: [], PRODUCE: [], CONSUMABLES: [] }
        };
      } catch (error) {
        console.error('❌ Inventory API error:', error);
      }

      setFinancialSummary(financialData);
      setInventorySummary(inventoryData);
    } catch (error) {
      console.error('❌ Unexpected error in fetchAnalytics:', error);
      setFinancialSummary(getDefaultFinancialSummary());
      setInventorySummary(getDefaultInventorySummary());
    } finally {
      setFinancialLoading(false);
      setInventoryLoading(false);
    }
  };

  const getDateFilterLabel = () => {
    switch (dateFilter) {
      case 'today': return 'Today';
      case 'yesterday': return 'Yesterday';
      case 'last7days': return 'Last 7 Days';
      case 'last30days': return 'Last 30 Days';
      case 'custom': return 'Custom';
      case 'allTime': return 'All Time';
      default: return 'Custom';
    }
  };

  const StatCard = ({ title, value, icon, color }: {
    title: string;
    value: string;
    icon: React.ReactNode;
    color: string;
  }) => {
    const getGradientColor = () => {
      if (color === "bg-green-500") return "from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700";
      if (color === "bg-red-500") return "from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700";
      if (color === "bg-blue-500") return "from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 dark:border-blue-700";
      if (color === "bg-orange-500") return "from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 dark:border-orange-700";
      if (color === "bg-indigo-500") return "from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 dark:border-indigo-700";
      return "from-gray-50 to-slate-50 dark:from-gray-900/20 dark:to-slate-900/20 dark:border-gray-700";
    };

    const getIconGradientColor = () => {
      if (color === "bg-green-500") return "from-green-500 to-green-600 dark:from-green-600 dark:to-green-700";
      if (color === "bg-red-500") return "from-red-500 to-red-600 dark:from-red-600 dark:to-red-700";
      if (color === "bg-blue-500") return "from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700";
      if (color === "bg-orange-500") return "from-orange-500 to-orange-600 dark:from-orange-600 dark:to-orange-700";
      if (color === "bg-indigo-500") return "from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-700";
      return "from-gray-500 to-gray-600 dark:from-gray-600 dark:to-gray-700";
    };

    const getTextColor = () => {
      if (color === "bg-green-500") return "text-green-600 dark:text-green-400";
      if (color === "bg-red-500") return "text-red-600 dark:text-red-400";
      if (color === "bg-blue-500") return "text-blue-600 dark:text-blue-400";
      if (color === "bg-orange-500") return "text-orange-600 dark:text-orange-400";
      if (color === "bg-indigo-500") return "text-indigo-600 dark:text-indigo-400";
      return "text-gray-600 dark:text-gray-400";
    };

  // Show skeleton while loading
  if (financialLoading || inventoryLoading) {
    return <AnalyticsSkeleton />;
  }

    return (
      <div 
        onClick={() => {
          // Handle card click - could navigate to detailed view or filter
          console.log('Analytics card clicked:', title);
        }}
        className={`group bg-gradient-to-br ${getGradientColor()} rounded-xl p-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer`}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="flex flex-col space-y-1">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{title}</h3>
            <div className="flex items-center space-x-2">
              <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                {getDateFilterLabel()}
              </span>
            </div>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <div className={`p-2 bg-gradient-to-br ${getIconGradientColor()} rounded-lg shadow-lg`}>
              {icon}
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <p className={`text-3xl font-bold ${getTextColor()}`}>
            {value}
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-0 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-900 dark:border-gray-900">
        <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-0">
          {/*<div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics Dashboard</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Comprehensive overview of your farm's performance
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={fetchAnalytics}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </div>*/}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-0 sm:px-6 lg:px-0 py-0">
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Financial Overview</h2>
          {financialLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <StatCard
                title="Total Income"
                value={formatCurrency(Number(financialSummary?.totalIncome) || 0)}
                icon={<TrendingUp className="h-4 w-4 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title="Total Expenses"
                value={formatCurrency(Number(financialSummary?.totalExpenses) || 0)}
                icon={<ShoppingCart className="h-4 w-4 text-white" />}
                color="bg-red-500"
              />
              <StatCard
                title="Net Profit"
                value={formatCurrency(Number(financialSummary?.netProfit) || 0)}
                icon={<TrendingUp className="h-4 w-4 text-white" />}
                color={(Number(financialSummary?.netProfit) || 0) >= 0 ? "bg-blue-500" : "bg-orange-500"}
              />
            </div>
          )}
        </div>

        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-8">
          <div className="flex flex-col gap-4">
            <div className="overflow-x-auto pb-2">
              <div className="flex items-center gap-2 min-w-max">
                {/* Quick Date Buttons */}
                <button
                  onClick={() => setDateFilter('today')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'today'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Today
                </button>
                <button
                  onClick={() => setDateFilter('yesterday')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'yesterday'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Yesterday
                </button>
                <button
                  onClick={() => setDateFilter('last7days')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'last7days'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Last 7 Days
                </button>
                <button
                  onClick={() => setDateFilter('last30days')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'last30days'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Last 30 Days
                </button>
                <button
                  onClick={() => setDateFilter('allTime')}
                  className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                    dateFilter === 'allTime'
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  All Time
                </button>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="text-xs sm:text-sm font-inter font-medium text-gray-700 dark:text-gray-300">Month:</label>
                  <select
                    value={selectedMonth}
                    onChange={(e) => {
                      setSelectedMonth(parseInt(e.target.value));
                      setDateFilter('custom');
                    }}
                    className="px-2 py-1 text-xs sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg font-inter text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:text-white"
                  >
                    <option value="0">January</option>
                    <option value="1">February</option>
                    <option value="2">March</option>
                    <option value="3">April</option>
                    <option value="4">May</option>
                    <option value="5">June</option>
                    <option value="6">July</option>
                    <option value="7">August</option>
                    <option value="8">September</option>
                    <option value="9">October</option>
                    <option value="10">November</option>
                    <option value="11">December</option>
                  </select>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <label className="text-xs sm:text-sm font-inter font-medium text-gray-700 dark:text-gray-300">Year:</label>
                  <select
                    value={selectedYear}
                    onChange={(e) => {
                      setSelectedYear(parseInt(e.target.value));
                      setDateFilter('custom');
                    }}
                    className="px-2 py-1 text-xs sm:px-3 sm:py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-lg font-inter text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:text-white"
                  >
                    {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
              Income by Category
            </h2>
            {financialLoading ? (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
                <div className="space-y-3">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                          <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-gray-300 dark:bg-gray-600 h-2 rounded-full w-3/4 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="ml-4 h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                {!financialSummary?.expensesByCategory || financialSummary.expensesByCategory.length === 0 ? (
                  <div className="text-center py-8">
                    <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm">No expense data available</p>
                    <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">Create expense entries to see category breakdowns</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {financialSummary.expensesByCategory.map((item, index) => {
                      const totalExpenses = financialSummary.expensesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
                      const percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
                      return (
                        <div key={index} className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatCurrency(item.amount)}
                              </span>
                            </div>
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                              <div
                                className="bg-red-500 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                          <div className="ml-4 text-sm text-gray-500 dark:text-gray-400 w-12 text-right">
                            {percentage.toFixed(1)}%
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <Package className="w-5 h-5 mr-2 text-blue-500" />
            Inventory Overview
          </h2>
          {inventoryLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                  <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                  <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard
                title="Total Items"
                value={inventorySummary?.totalItems?.toString() || '0'}
                icon={<Package className="w-6 h-6 text-white" />}
                color="bg-blue-500"
              />
              <StatCard
                title="Livestock"
                value={inventorySummary?.livestock?.toString() || '0'}
                icon={<Heart className="w-6 h-6 text-white" />}
                color="bg-indigo-500"
              />
              <StatCard
                title="Produce"
                value={inventorySummary?.produce?.toString() || '0'}
                icon={<Apple className="w-6 h-6 text-white" />}
                color="bg-green-500"
              />
              <StatCard
                title="Consumables"
                value={inventorySummary?.consumables?.toString() || '0'}
                icon={<Box className="w-6 h-6 text-white" />}
                color="bg-orange-500"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

        export default Analytics;
