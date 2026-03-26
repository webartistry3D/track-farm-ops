import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';
import { TrendingUp, FileText } from 'lucide-react';

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netProfit: number;
  incomeByCategory: { category: string; amount: number }[];
  expensesByCategory: { category: string; amount: number }[];
}

interface InventoryItem {
  id: number;
  name: string;
  type: string;
  quantity: number;
  unit: string;
  pricePerUnit?: number;
  category?: string;
  location?: string;
  supplier?: string;
  purchaseDate?: string;
  expiryDate?: string;
  minimumStock?: number;
}

interface InventorySummary {
  totalItems: number;
  livestock: number;
  produce: number;
  consumables: number;
  totalTransactions: number;
  itemsByType: {
    LIVESTOCK: InventoryItem[];
    PRODUCE: InventoryItem[];
    CONSUMABLES: InventoryItem[];
  };
}

const AnalyticsDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Scroll to top when navigating to Analytics page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  // Check if user has appropriate role
  if (!user) {
    return <div>Please log in to view analytics.</div>;
  }

  const isOwner = user.role === 'OWNER' || user.role === 'MANAGER';

  if (!isOwner) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
        <p className="text-yellow-700">
          Analytics is only available to farm owners and managers.
        </p>
      </div>
    );
  }

  const [financialSummary, setFinancialSummary] = useState<FinancialSummary | null>(null);
  const [inventorySummary, setInventorySummary] = useState<InventorySummary | null>(null);
  const [financialLoading, setFinancialLoading] = useState(true);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [, setError] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'customMonth' | 'customYear' | 'allTime'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Calculate performance metrics from real data
  const calculateRevenueGrowth = (current: FinancialSummary | null, previous: FinancialSummary | null): string => {
    if (!current || !previous || previous.totalIncome === 0) {
      return (current?.totalIncome && current.totalIncome > 0) ? '+100.0%' : '0.0%';
    }
    const growth = ((current.totalIncome - previous.totalIncome) / previous.totalIncome) * 100;
    return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
  };

  const calculateCostEfficiency = (financial: FinancialSummary | null): string => {
    if (!financial || financial.totalIncome === 0) {
      return '0.0%';
    }
    const efficiency = ((financial.totalIncome - financial.totalExpenses) / financial.totalIncome) * 100;
    return `${Math.max(0, efficiency).toFixed(1)}%`;
  };

  const calculateInventoryHealth = (inventory: InventorySummary | null): string => {
    if (!inventory) {
      return '0.0%';
    }
    // Calculate health based on total items and distribution
    const totalItems = inventory.totalItems || 0;
    const idealDistribution = totalItems / 3; // Equal distribution across 3 categories
    const livestockRatio = (inventory.livestock || 0) / idealDistribution;
    const produceRatio = (inventory.produce || 0) / idealDistribution;
    const consumablesRatio = (inventory.consumables || 0) / idealDistribution;
    
    // Calculate variance from ideal distribution (lower is better)
    const variance = Math.abs(1 - livestockRatio) + Math.abs(1 - produceRatio) + Math.abs(1 - consumablesRatio);
    const healthScore = Math.max(0, 100 - (variance * 20)); // Scale variance to health score
    
    return `${healthScore.toFixed(1)}%`;
  };

  // Get previous period data for comparison
  const [previousFinancialSummary, setPreviousFinancialSummary] = useState<FinancialSummary | null>(null);

  // Fetch previous period data
  useEffect(() => {
    const fetchPreviousPeriodData = async () => {
      try {
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 1); // Previous month
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        console.log(`📈 Fetching previous period data: ${startDateStr} to ${endDateStr}`);
        const response = await api.get(`/finance/summary?startDate=${startDateStr}&endDate=${endDateStr}`);
        const data = validateFinancialSummary(response.data);
        setPreviousFinancialSummary(data);
      } catch (err: any) {
        console.error('Failed to fetch previous period data:', err);
        setPreviousFinancialSummary(null);
      }
    };

    if (user) {
      fetchPreviousPeriodData();
    }
  }, [user]);

  // Calculate real metrics
  const revenueGrowth = calculateRevenueGrowth(financialSummary, previousFinancialSummary);
  const costEfficiency = calculateCostEfficiency(financialSummary);
  const inventoryHealth = calculateInventoryHealth(inventorySummary);
  const getDefaultFinancialSummary = (): FinancialSummary => ({
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    incomeByCategory: [
      { category: 'Crop Sales', amount: 0 },
      { category: 'Livestock Sales', amount: 0 },
      { category: 'Services', amount: 0 },
      { category: 'Other Income', amount: 0 }
    ],
    expensesByCategory: [
      { category: 'Feed', amount: 0 },
      { category: 'Equipment', amount: 0 },
      { category: 'Labor', amount: 0 },
      { category: 'Supplies', amount: 0 },
      { category: 'Other Expenses', amount: 0 }
    ]
  });

  // Default fallback data for InventorySummary
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

  // Validation functions
  const validateFinancialSummary = (data: any): FinancialSummary => {
    const defaultSummary = getDefaultFinancialSummary();
    return {
      totalIncome: typeof data.totalIncome === 'number' ? data.totalIncome : defaultSummary.totalIncome,
      totalExpenses: typeof data.totalExpenses === 'number' ? data.totalExpenses : defaultSummary.totalExpenses,
      netProfit: typeof data.netProfit === 'number' ? data.netProfit : defaultSummary.netProfit,
      incomeByCategory: Array.isArray(data.incomeByCategory) ? data.incomeByCategory : defaultSummary.incomeByCategory,
      expensesByCategory: Array.isArray(data.expensesByCategory) ? data.expensesByCategory : defaultSummary.expensesByCategory
    };
  };

  const validateInventorySummary = (data: any): InventorySummary => {
    const defaultSummary = getDefaultInventorySummary();
    return {
      totalItems: typeof data.totalItems === 'number' ? data.totalItems : defaultSummary.totalItems,
      livestock: typeof data.livestock === 'number' ? data.livestock : defaultSummary.livestock,
      produce: typeof data.produce === 'number' ? data.produce : defaultSummary.produce,
      consumables: typeof data.consumables === 'number' ? data.consumables : defaultSummary.consumables,
      totalTransactions: typeof data.totalTransactions === 'number' ? data.totalTransactions : defaultSummary.totalTransactions,
      itemsByType: data.itemsByType && typeof data.itemsByType === 'object' ? data.itemsByType : defaultSummary.itemsByType
    };
  };

  useEffect(() => {
    fetchAnalytics();
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [dateFilter, selectedMonth, selectedYear]);

  const fetchAnalytics = async () => {
    try {
      setFinancialLoading(true);
      setInventoryLoading(true);
      setError('');
      
      // Calculate date range based on filter
      let startDate = '';
      let endDate = '';
      const today = new Date();
      
      switch (dateFilter) {
        case 'today':
          startDate = today.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date(today);
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = yesterday.toISOString().split('T')[0];
          endDate = yesterday.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          startDate = monthAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'customMonth':
          const firstDayOfCustomMonth = new Date(selectedYear, selectedMonth, 1);
          const lastDayOfCustomMonth = new Date(selectedYear, selectedMonth + 1, 0);
          startDate = firstDayOfCustomMonth.toISOString().split('T')[0];
          endDate = lastDayOfCustomMonth.toISOString().split('T')[0];
          break;
        case 'customYear':
          const firstDayOfCustomYear = new Date(selectedYear, 0, 1);
          const lastDayOfCustomYear = new Date(selectedYear, 11, 31);
          startDate = firstDayOfCustomYear.toISOString().split('T')[0];
          endDate = lastDayOfCustomYear.toISOString().split('T')[0];
          break;
        case 'allTime':
          // For all time, don't set date limits - fetch all records
          startDate = '';
          endDate = '';
          break;
      }
      
      // Fetch financial summary with date range and graceful fallback
      let financialData = getDefaultFinancialSummary();
      try {
        console.log(`📊 Fetching financial data for date range: ${startDate} to ${endDate}`);
        const financialResponse = await api.get(`/finance/summary?startDate=${startDate}&endDate=${endDate}`);
        console.log('📊 Financial API response:', financialResponse.data);
        financialData = validateFinancialSummary(financialResponse.data);
        console.log('📊 Validated financial data:', financialData);
      } catch (financialError: any) {
        console.error('Financial API error:', financialError);
        financialData = getDefaultFinancialSummary();
      }
      
      // Fetch inventory summary with graceful fallback
      let inventoryData = getDefaultInventorySummary();
      try {
        console.log('📦 Fetching inventory data...');
        const inventoryResponse = await api.get('/inventory/summary');
        console.log('📦 Inventory API response:', inventoryResponse.data);
        inventoryData = validateInventorySummary(inventoryResponse.data);
        console.log('📦 Validated inventory data:', inventoryData);
      } catch (inventoryError: any) {
        console.error('Inventory API error:', inventoryError);
        inventoryData = getDefaultInventorySummary();
      }
      
      // Set the validated data
      setFinancialSummary(financialData);
      setInventorySummary(inventoryData);
      
    } catch (err: any) {
      console.error('Unexpected error in fetchAnalytics:', err);
      // Set fallback data instead of showing error
      setFinancialSummary(getDefaultFinancialSummary());
      setInventorySummary(getDefaultInventorySummary());
      setError(''); // Clear error to prevent error message display
    } finally {
      setFinancialLoading(false);
      setInventoryLoading(false);
    }
  };

  
  // Skeleton components for individual sections
  const FinancialOverviewSkeleton = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {[...Array(3)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
              <div className="h-8 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-1"></div>
              <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </div>
            <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
          </div>
        </div>
      ))}
    </div>
  );

  const ChartsSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <div key={i} className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
          <div className="space-y-3">
            {[...Array(4)].map((_, j) => (
              <div key={j} className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-gray-300 h-2 rounded-full w-3/4 animate-pulse"></div>
                  </div>
                </div>
                <div className="ml-4 h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );

  const InventorySkeleton = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
            <div className="h-8 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-1"></div>
            <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
          </div>
        ))}
      </div>
      <div className="mt-6 text-center">
        <div className="h-5 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Financial Overview */}
      {financialLoading ? (
        <FinancialOverviewSkeleton />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/*<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Income</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">
                  {formatCurrency(financialSummary?.totalIncome || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {dateFilter === 'today' ? 'Today' : 
                   dateFilter === 'yesterday' ? 'Yesterday' :
                   dateFilter === 'week' ? 'Last 7 Days' : 
                   dateFilter === 'month' ? 'Last 30 Days' :
                   dateFilter === 'allTime' ? 'All Time' :
                   dateFilter === 'customMonth' ? new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
                   selectedYear.toString()}
                </p>
              </div>
              <div className="text-4xl">💰</div>
            </div>
          </div>*/}

          {/*<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Expenses</h3>
                <p className="text-3xl font-bold text-red-600 mt-2">
                  {formatCurrency(financialSummary?.totalExpenses || 0)}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {dateFilter === 'today' ? 'Today' : 
                   dateFilter === 'yesterday' ? 'Yesterday' :
                   dateFilter === 'week' ? 'Last 7 Days' : 
                   dateFilter === 'month' ? 'Last 30 Days' :
                   dateFilter === 'allTime' ? 'All Time' :
                   dateFilter === 'customMonth' ? new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
                   selectedYear.toString()}
                </p>
              </div>
              <div className="text-4xl">💸</div>
            </div>
          </div>*/}

          {/*<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Net Profit</h3>
                <p className={`text-3xl font-bold mt-2 ${(financialSummary?.netProfit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(financialSummary?.netProfit || 0)} {(financialSummary?.netProfit || 0) >= 0 ? '' : '📉'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  {dateFilter === 'today' ? 'Today' : 
                   dateFilter === 'yesterday' ? 'Yesterday' :
                   dateFilter === 'week' ? 'Last 7 Days' : 
                   dateFilter === 'month' ? 'Last 30 Days' :
                   dateFilter === 'allTime' ? 'All Time' :
                   dateFilter === 'customMonth' ? new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) :
                   selectedYear.toString()}
                </p>
              </div>
              <div className="text-4xl">📊</div>
            </div>
          </div>*/}
        </div>
      )}

      {/* Charts Section */}
      {financialLoading ? (
        <ChartsSkeleton />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Income by Category */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Income by Category</h3>
            <div className="space-y-3">
              {financialSummary?.incomeByCategory.map((item, index) => {
                const totalIncome = financialSummary.incomeByCategory.reduce((sum, cat) => sum + cat.amount, 0);
                const percentage = totalIncome > 0 ? (item.amount / totalIncome) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
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
          </div>

          {/* Expenses by Category */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Expenses by Category</h3>
            <div className="space-y-3">
              {financialSummary?.expensesByCategory.map((item, index) => {
                const totalExpenses = financialSummary.expensesByCategory.reduce((sum, cat) => sum + cat.amount, 0);
                const percentage = totalExpenses > 0 ? (item.amount / totalExpenses) * 100 : 0;
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{item.category}</span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">{formatCurrency(item.amount)}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
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
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
        <div className="flex flex-col gap-4">
          <div className="overflow-x-auto pb-2">
            <div className="flex items-center gap-2 min-w-max">
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
                onClick={() => setDateFilter('week')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  dateFilter === 'week'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                Last 7 Days
              </button>
              <button
                onClick={() => setDateFilter('month')}
                className={`flex-shrink-0 px-3 py-2 rounded-lg font-inter text-xs sm:text-sm font-medium transition-colors duration-200 ${
                  dateFilter === 'month'
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
                    setDateFilter('customMonth');
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
                    setDateFilter('customYear');
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

      {/* Inventory Summary */}
      {inventoryLoading ? (
        <InventorySkeleton />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Inventory Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{inventorySummary?.totalItems || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Total Items</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{inventorySummary?.livestock || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Livestock</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{inventorySummary?.produce || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Produce</div>
            </div>
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-900/20 rounded-lg">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">{inventorySummary?.consumables || 0}</div>
              <div className="text-sm text-gray-500 dark:text-gray-400">Consumables</div>
            </div>
          </div>
          <div className="mt-6 text-center">
            <button 
              onClick={() => navigate('/inventory')}
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
            >
              View All Inventory →
            </button>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-poppins font-semibold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link to="/income" className="font-inter btn btn-primary text-center">
              Record Income
            </Link>
            <Link to="/expenses" className="font-inter btn btn-secondary text-center">
              Record Expense
            </Link>
            {isOwner && (
              <>
                <Link to="/reports" className="font-inter btn btn-secondary text-center">
                  View Reports
                </Link>
                <Link to="/inventory" className="font-inter btn btn-secondary text-center">
                  Manage Inventory
                </Link>
              </>
            )}
          </div>
          
          {/* Quick Stats */}
          <div className="mt-6">
            <h3 className="text-lg font-poppins font-semibold mb-4">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-9 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform">
                <div className="text-xl mb-1">📊</div>
                <div className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                  {financialLoading ? '...' : financialSummary?.totalIncome || 0}
                </div>
                <div className="text-sm font-inter text-gray-500 dark:text-gray-400">Total Income</div>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-9 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform">
                <div className="text-xl mb-1">💸</div>
                <div className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                  {financialLoading ? '...' : financialSummary?.totalExpenses || 0}
                </div>
                <div className="text-sm font-inter text-gray-500 dark:text-gray-400">Total Expenses</div>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-9 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform">
                <div className="text-xl mb-1">📦</div>
                <div className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                  {inventoryLoading ? '...' : inventorySummary?.totalItems || 0}
                </div>
                <div className="text-sm font-inter text-gray-500 dark:text-gray-400">Inventory Items</div>
              </div>
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-9 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform">
                <div className="text-xl mb-1">💰</div>
                <div className="text-xl font-poppins font-semibold text-gray-900 dark:text-white">
                  {financialLoading ? '...' : (financialSummary?.netProfit || 0)}
                </div>
                <div className="text-sm font-inter text-gray-500 dark:text-gray-400">Net Profit</div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Business Update */}
        <div>
          <h2 className="text-xl font-poppins font-semibold mb-4">Business Update</h2>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center mb-4">
              <div className="p-3 bg-blue-600 dark:bg-blue-700 rounded-lg shadow-lg">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-poppins font-semibold text-gray-900 dark:text-white">Performance Overview</h3>
                <p className="text-sm font-inter text-gray-600 dark:text-gray-300">Your farm's key metrics at a glance</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-inter text-gray-600 dark:text-gray-400">Revenue Growth</span>
                <span className="text-sm font-poppins font-semibold text-green-600 dark:text-green-400">
                  {financialLoading || !previousFinancialSummary ? '...' : revenueGrowth}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-inter text-gray-600 dark:text-gray-400">Cost Efficiency</span>
                <span className="text-sm font-poppins font-semibold text-blue-600 dark:text-blue-400">
                  {financialLoading ? '...' : costEfficiency}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-white dark:bg-gray-800 rounded-lg">
                <span className="text-sm font-inter text-gray-600 dark:text-gray-400">Inventory Health</span>
                <span className="text-sm font-poppins font-semibold text-purple-600 dark:text-purple-400">
                  {inventoryLoading ? '...' : inventoryHealth}
                </span>
              </div>
            </div>
            
            <div className="mt-6 text-center">
              <Link 
                to="/reports" 
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-poppins font-medium rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <FileText className="h-4 w-4 mr-2" />
                View Detailed Reports
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
