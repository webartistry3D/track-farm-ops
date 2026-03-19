import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';

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
  const [error, setError] = useState('');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'customMonth' | 'customYear' | 'allTime'>('month');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Default fallback data for FinancialSummary
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

  const getProfitColor = (profit: number) => {
    return profit >= 0 ? 'text-green-600' : 'text-red-600';
  };

  const getProfitIcon = (profit: number) => {
    return profit >= 0 ? '' : '📉';
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

  const QuickActionsSkeleton = () => (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
      <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-4"></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 border border-gray-300 dark:border-gray-600 rounded-lg text-center">
            <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto mb-2"></div>
            <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
          </div>
        ))}
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
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
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
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
          </div>

          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">Net Profit</h3>
                <p className={`text-3xl font-bold mt-2 ${getProfitColor(financialSummary?.netProfit || 0)}`}>
                  {formatCurrency(financialSummary?.netProfit || 0)} {getProfitIcon(financialSummary?.netProfit || 0)}
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
          </div>
        </div>
      )}

      {/* Date Filter */}
      <div className="flex justify-end items-center">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
              dateFilter === 'today'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('yesterday')}
            className={`px-4 py-2 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
              dateFilter === 'yesterday'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Yesterday
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-4 py-2 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
              dateFilter === 'week'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => setDateFilter('month')}
            className={`px-4 py-2 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
              dateFilter === 'month'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => setDateFilter('allTime')}
            className={`px-4 py-2 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
              dateFilter === 'allTime'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          
          <div className="w-px h-6 bg-gray-300 mx-1"></div>
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-inter font-medium text-gray-700 dark:text-gray-300">Month:</label>
            <select
              value={selectedMonth}
              onChange={(e) => {
                setSelectedMonth(parseInt(e.target.value));
                setDateFilter('customMonth');
              }}
              className="px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
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
          
          <div className="flex items-center gap-2">
            <label className="text-sm font-inter font-medium text-gray-700 dark:text-gray-300">Year:</label>
            <select
              value={selectedYear}
              onChange={(e) => {
                setSelectedYear(parseInt(e.target.value));
                setDateFilter('customYear');
              }}
              className="px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option value="2024">2024</option>
              <option value="2025">2025</option>
              <option value="2026">2022026</option>
              <option value="2027">2027</option>
              <option value="2028">2028</option>
            </select>
          </div>
        </div>
      </div>

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

      {/* Inventory Summary */}
      {inventoryLoading ? (
        <InventorySkeleton />
      ) : (
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Inventory Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
      <QuickActionsSkeleton />
    </div>
  );
};

export default AnalyticsDashboard;
