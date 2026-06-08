import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';
import { TrendingUp, TrendingDown, ShoppingCart, Calculator } from 'lucide-react';
import { 
  DashboardSkeleton
} from './EnhancedSkeletons';

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [incomeEntries, setIncomeEntries] = useState<any[]>([]);
  const [expenseEntries, setExpenseEntries] = useState<any[]>([]);
  const [inventoryItems, setInventoryItems] = useState<any[]>([]);
  const [todayIncome, setTodayIncome] = useState(0);
  const [todayExpenses, setTodayExpenses] = useState(0);
  const [todayVAT, setTodayVAT] = useState(0);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('');
  const [modalData, setModalData] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [assets, setAssets] = useState<any[]>([]);
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'week' | 'month' | 'thisMonth' | 'thisYear' | 'customMonth' | 'customYear' | 'allTime'>('allTime');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 0 && hour < 12) return 'Good morning,';
    if (hour >= 12 && hour < 17) return 'Good afternoon,';
    return 'Good evening,';
  };

  useEffect(() => {
    fetchDashboardData();
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [dateFilter, selectedMonth, selectedYear]);

  // Scroll to top when location changes (navigation)
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Calculate date range based on filter
      const today = new Date();
      let startDate: string | undefined;
      let endDate: string | undefined;
      
      switch (dateFilter) {
        case 'today':
          startDate = endDate = today.toISOString().split('T')[0];
          break;
        case 'yesterday':
          const yesterday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
          startDate = endDate = yesterday.toISOString().split('T')[0];
          break;
        case 'week':
          const weekAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'month':
          const monthAgo = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 30);
          startDate = monthAgo.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'thisMonth':
          const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          startDate = firstDayOfMonth.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'thisYear':
          const firstDayOfYear = new Date(today.getFullYear(), 0, 1);
          startDate = firstDayOfYear.toISOString().split('T')[0];
          endDate = today.toISOString().split('T')[0];
          break;
        case 'allTime':
          // For all time, don't set date filters
          startDate = undefined;
          endDate = undefined;
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
        default:
          startDate = endDate = today.toISOString().split('T')[0];
      }
      
      const [incomeResponse, expenseResponse, inventoryResponse, assetsResponse] = await Promise.all([
        api.get(`/finance/income${startDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`),
        api.get(`/finance/expenses${startDate ? `?startDate=${startDate}&endDate=${endDate}` : ''}`),
        api.get('/inventory/items'),
        api.get('/assets')
      ]);
      
      const incomeData = incomeResponse.data?.entries || [];
      const expenseData = expenseResponse.data?.entries || [];
      const inventoryData = inventoryResponse.data || [];
      const assetsData = assetsResponse.data || [];
      
      // Process data to include user information
      const processedIncome = incomeData.map((entry: any) => ({
        ...entry,
        userName: entry.createdByUser?.name || entry.user?.name || 'System',
        userEmail: entry.createdByUser?.email || entry.user?.email || 'system@trackfarmops.com'
      }));
      
      const processedExpenses = expenseData.map((entry: any) => ({
        ...entry,
        userName: entry.createdByUser?.name || entry.user?.name || 'System',
        userEmail: entry.createdByUser?.email || entry.user?.email || 'system@trackfarmops.com'
      }));
      
      const processedInventory = inventoryData.map((item: any) => ({
        ...item,
        userName: item.createdByUser?.name || item.user?.name || 'System',
        userEmail: item.createdByUser?.email || item.user?.email || 'system@trackfarmops.com'
      }));
      
      const processedAssets = assetsData.map((asset: any) => ({
        ...asset,
        userName: asset.createdByUser?.name || asset.user?.name || 'System',
        userEmail: asset.createdByUser?.email || asset.user?.email || 'system@trackfarmops.com'
      }));
      
      setIncomeEntries(processedIncome);
      setExpenseEntries(processedExpenses);
      setInventoryItems(processedInventory);
      setAssets(processedAssets);
      
      // Calculate totals - ensure amounts are treated as numbers
      const incomeTotal = incomeData.reduce((sum: number, entry: any) => {
        const amount = typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount;
        return sum + (amount || 0);
      }, 0);
      const expenseTotal = expenseData.reduce((sum: number, entry: any) => {
        const amount = typeof entry.amount === 'string' ? parseFloat(entry.amount) : entry.amount;
        return sum + (amount || 0);
      }, 0);
      
      // Calculate VAT total from income entries that have invoiceVat
      const vatTotal = incomeData.reduce((sum: number, entry: any) => {
        if (entry.invoiceVat) {
          const vatAmount = typeof entry.invoiceVat === 'string' ? parseFloat(entry.invoiceVat) : entry.invoiceVat;
          return sum + (vatAmount || 0);
        }
        return sum;
      }, 0);
      
      setTodayIncome(incomeTotal);
      setTodayExpenses(expenseTotal);
      setTodayVAT(vatTotal);
      
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (type: string) => {
    let data = [];
    
    switch(type) {
      case 'income':
        data = incomeEntries.map(entry => ({
          ...entry,
          type: 'Income'
        }));
        break;
      case 'expenses':
        data = expenseEntries.map(entry => ({
          ...entry,
          type: 'Expense'
        }));
        break;
      case 'inventory':
        data = inventoryItems.map(item => ({
          ...item,
          type: 'Inventory'
        }));
        break;
      case 'assets':
        data = assets.map(asset => ({
          ...asset,
          type: 'Asset'
        }));
        break;
      case 'transactions':
        const allTransactions = [
          ...incomeEntries.map(entry => ({ ...entry, type: 'Income' })),
          ...expenseEntries.map(entry => ({ ...entry, type: 'Expense' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        data = allTransactions;
        break;
    }
    
    setModalType(type);
    setModalData(data);
    setCurrentPage(1); // Reset to first page
    setModalOpen(true);
  };

  if (!user) {
    return <div>Please log in to view the dashboard.</div>;
  }

  const isOwner = user.role === 'OWNER' || user.role === 'ACCOUNTANT' || user.role === 'VETERINARIAN';
  const canViewFinancials = user.role === 'OWNER' || user.role === 'ACCOUNTANT';
  const netProfit = todayIncome - todayExpenses;

  // INVENTORY role restriction - no access to Dashboard
  if (user.role === 'INVENTORY') {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
        <p className="text-yellow-700">
          Dashboard access is not available for your role. Please use the navigation menu to access your assigned features.
        </p>
      </div>
    );
  }

  // Show skeleton while loading
  if (loading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="rounded-lg p-0">
        <h1 className="text-xl font-jetbrains-mono font-regular text-gray-900 dark:text-white mb-0">
          {getGreeting()} {user.name?.split(' ')[0]}! 
        </h1>
        <p className="font-inter text-gray-600 text-sm mt-0">
          Here's your business update..
        </p>
      </div>

      {canViewFinancials && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
          <div 
            onClick={() => navigate('/income')}
            className="group bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-3 dark:border-green-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col space-y-1">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {dateFilter === 'today' ? "Today's Income" : 
                   dateFilter === 'yesterday' ? "Yesterday's Income" :
                   dateFilter === 'week' ? "This Week's Income" : 
                   dateFilter === 'month' ? "This Month's Income" :
                   dateFilter === 'thisMonth' ? "This Month's Income" :
                   dateFilter === 'thisYear' ? "This Year's Income" :
                   dateFilter === 'allTime' ? "All Time Income" :
                   dateFilter === 'customMonth' ? `${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Income` :
                   `${selectedYear} Income`}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {incomeEntries.length > 0 ? `${incomeEntries.length} transaction${incomeEntries.length !== 1 ? 's' : ''}` : 'No income recorded'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="p-2 bg-gradient-to-br from-green-500 to-green-600 dark:from-green-600 dark:to-green-700 rounded-lg shadow-lg">
                  <TrendingUp className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <p className="text-3xl font-bold font-jetbrains-mono text-green-600 dark:text-green-400">
                {/*{formatCompactCurrency(todayIncome.toString(), { includeSymbol: true })}*/}
                {formatCompactCurrency(todayIncome)}
              </p>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/expenses')}
            className="group bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 rounded-xl p-3 dark:border-red-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col space-y-1">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {dateFilter === 'today' ? "Today's Expenses" : 
                   dateFilter === 'yesterday' ? "Yesterday's Expenses" :
                   dateFilter === 'week' ? "This Week's Expenses" : 
                   dateFilter === 'month' ? "This Month's Expenses" :
                   dateFilter === 'thisMonth' ? "This Month's Expenses" :
                   dateFilter === 'thisYear' ? "This Year's Expenses" :
                   dateFilter === 'allTime' ? "All Time Expenses" :
                   dateFilter === 'customMonth' ? `${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Expenses` :
                   `${selectedYear} Expenses`}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {expenseEntries.length > 0 ? `${expenseEntries.length} transaction${expenseEntries.length !== 1 ? 's' : ''}` : 'No expenses recorded'}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="p-2 bg-gradient-to-br from-red-500 to-red-600 dark:from-red-600 dark:to-red-700 rounded-lg shadow-lg">
                  <ShoppingCart className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <p className="text-3xl font-bold font-jetbrains-mono text-red-600 dark:text-red-400">
                {/*{formatCompactCurrency(todayExpenses.toString(), { includeSymbol: true })}*/}
                {formatCompactCurrency(todayExpenses)}
              </p>
            </div>
          </div>
          
          <div 
            onClick={() => navigate('/vat')}
            className="group bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 dark:border-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col space-y-1">
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  {dateFilter === 'today' ? "Today's VAT" : 
                   dateFilter === 'yesterday' ? "Yesterday's VAT" :
                   dateFilter === 'week' ? "This Week's VAT" : 
                   dateFilter === 'month' ? "This Month's VAT" :
                   dateFilter === 'thisMonth' ? "This Month's VAT" :
                   dateFilter === 'thisYear' ? "This Year's VAT" :
                   dateFilter === 'allTime' ? "All Time VATax" :
                   dateFilter === 'customMonth' ? `${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} VAT` :
                   `${selectedYear} VAT`}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    Total VAT collected
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-purple-600 dark:from-purple-600 dark:to-purple-700 rounded-lg shadow-lg">
                  <Calculator className="h-4 w-4 text-white" />
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <p className="text-3xl font-bold font-jetbrains-mono text-purple-600 dark:text-purple-400">
                {/*{formatCompactCurrency(todayVAT.toString(), { includeSymbol: true })}*/}
                {formatCompactCurrency(todayVAT)}
              </p>
            </div>
          </div>
          
          <div 
            onClick={() => dateFilter === 'allTime' ? navigate('/analytics') : navigate('/income?filter=' + dateFilter)}
            className={`group bg-gradient-to-br ${
              dateFilter === 'allTime' ? 
                'from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 dark:border-blue-700' :
                netProfit >= 0 ? 'from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-700' : 
                'from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 dark:border-red-700'
            } rounded-xl p-3 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 cursor-pointer`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex flex-col space-y-1">
                <h3 className={`text-sm font-semibold text-gray-700 dark:text-gray-300`}>
                  {dateFilter === 'today' ? "Today's Net Profit" : 
                   dateFilter === 'yesterday' ? "Yesterday's Net Profit" :
                   dateFilter === 'week' ? "This Week's Net Profit" : 
                   dateFilter === 'month' ? "This Month's Net Profit" :
                   dateFilter === 'thisMonth' ? "This Month's Net Profit" :
                   dateFilter === 'thisYear' ? "This Year's Net Profit" :
                   dateFilter === 'allTime' ? "All Time Net Profit" :
                   dateFilter === 'customMonth' ? `${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Net Profit` :
                   `${selectedYear} Net Profit`}
                </h3>
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {dateFilter === 'today' ? "Today's profit/loss" : 
                     dateFilter === 'yesterday' ? "Yesterday's profit/loss" :
                     dateFilter === 'week' ? "Last 7 days profit/loss" :
                     dateFilter === 'month' ? "Last 30 days profit/loss" :
                     dateFilter === 'thisMonth' ? "This month's profit/loss" :
                     dateFilter === 'thisYear' ? "This year's profit/loss" :
                     dateFilter === 'allTime' ? "All time profit/loss" :
                     dateFilter === 'customMonth' ? `${new Date(selectedYear, selectedMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} profit/loss` :
                     `${selectedYear} profit/loss`}
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`p-2 bg-gradient-to-br ${
                  dateFilter === 'allTime' ? 
                    'from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700' :
                    netProfit >= 0 ? 'from-green-500 to-green-600 dark:from-green-600 dark:to-green-700' : 
                    'from-red-500 to-red-600 dark:from-red-600 dark:to-red-700'
                } rounded-lg shadow-lg`}>
                  {netProfit >= 0 ? <TrendingUp className="h-4 w-4 text-white" /> : <TrendingDown className="h-4 w-4 text-white" />}
                </div>
              </div>
            </div>
            <div className="flex items-center">
              <p className={`text-3xl font-bold font-jetbrains-mono ${
                dateFilter === 'allTime' ? 
                  'text-blue-600 dark:text-blue-400' :
                  netProfit >= 0 ? 'text-green-600 dark:text-green-400' : 
                  'text-red-600 dark:text-red-400'
              }`}>
                {/*{formatCompactCurrency(netProfit.toString(), { includeSymbol: true })}*/}
                {formatCompactCurrency(netProfit)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Financial Overview */}
      {/* Date Filter */}
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg px-2 py-2 mb-6">
        <div className="flex flex-col gap-4">
          {/*<h3 className="text-lg font-jetbrains-mono font-medium text-gray-900 dark:text-white">
            Financial Overview
          </h3>*/}
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
                  <option value={0}>January</option>
                  <option value={1}>February</option>
                  <option value={2}>March</option>
                  <option value={3}>April</option>
                  <option value={4}>May</option>
                  <option value={5}>June</option>
                  <option value={6}>July</option>
                  <option value={7}>August</option>
                  <option value={8}>September</option>
                  <option value={9}>October</option>
                  <option value={10}>November</option>
                  <option value={11}>December</option>
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

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h2 className="text-xl font-jetbrains-mono font-semibold mb-4 dark:text-white">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
            <h3 className="text-lg font-jetbrains-mono font-semibold mb-4 dark:text-white">Quick Stats</h3>
            <div className="grid grid-cols-2 gap-3">
              <div 
                onClick={() => handleCardClick('income')}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-9 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform"
              >
                <div className="text-xl mb-1">📊</div>
                <div className="text-xl font-jetbrains-mono font-semibold text-gray-900 dark:text-white">
                  {incomeEntries.length}
                </div>
                <div className="text-sm font-inter text-gray-500 dark:text-gray-400">Income Entries</div>
              </div>
              <div 
                onClick={() => handleCardClick('expenses')}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-9 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform"
              >
                <div className="text-xl mb-1">💸</div>
                <div className="text-xl font-jetbrains-mono font-semibold text-gray-900 dark:text-white">
                  {expenseEntries.length}
                </div>
                <div className="text-sm font-inter text-gray-500 dark:text-gray-400">Expense Entries</div>
              </div>
              <div 
                onClick={() => handleCardClick('inventory')}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-9 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform"
              >
                <div className="text-xl mb-1">📦</div>
                <div className="text-xl font-jetbrains-mono font-semibold text-gray-900 dark:text-white">
                  {inventoryItems.length}
                </div>
                <div className="text-sm font-inter text-gray-500 dark:text-gray-400">Inventory Items</div>
              </div>
              <div 
                onClick={() => handleCardClick('assets')}
                className="bg-white dark:bg-gray-800 shadow rounded-lg p-9 text-center cursor-pointer hover:shadow-lg transition-shadow duration-200 hover:scale-105 transform"
              >
                <div className="text-xl mb-1">🏗️</div>
                <div className="text-xl font-jetbrains-mono font-semibold text-gray-900 dark:text-white">
                  {assets.length}
                </div>
                <div className="text-sm font-inter text-gray-500 dark:text-gray-400">Assets</div>
              </div>
            </div>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-jetbrains-mono font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-0">
            {incomeEntries.length > 0 || expenseEntries.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {/* Combine income and expense entries, sort by newest first, and limit to 10 entries */}
                {[...incomeEntries.map(entry => ({ ...entry, type: 'Income' })), 
                  ...expenseEntries.map(entry => ({ ...entry, type: 'Expense' }))]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 10) // Limit to 10 newest entries
                  .map((entry, index) => (
                    <Link 
                      key={index} 
                      to={`/reports?transactionId=${entry.id}&type=${entry.type.toLowerCase()}`}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200 block"
                    >
                      <div className="flex items-center space-x-3">
                        <div className={`w-2 h-2 rounded-full ${
                          entry.type === 'Income' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className={`font-inter font-medium text-sm ${
                              entry.type === 'Income' ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
                            }`}>
                              {entry.type === 'Income' ? 'Income' : 'Expense'}
                            </span>
                            <span className="font-jetbrains-mono text-gray-900 dark:text-white font-medium">
                              {formatCurrency(entry.amount.toString())}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-inter text-xs text-gray-600 dark:text-gray-300">
                              {entry.description || entry.category || 'No description'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="font-inter text-xs text-gray-500 dark:text-gray-400">
                              by {entry.userName || entry.user?.name || 'Unknown'}
                            </span>
                            <span className="font-inter text-xs text-gray-400 dark:text-gray-500">
                              ({entry.userEmail || entry.user?.email || 'unknown@trackfarmops.com'})
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-inter text-xs text-gray-500 dark:text-gray-400">
                          {new Date(entry.createdAt).toLocaleDateString()}
                        </div>
                        <div className="font-inter text-xs text-gray-400 dark:text-gray-500">
                          {new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </div>
                    </Link>
                  ))}
                {(assets.length) > 10 && (
                  <div className="text-center pt-2">
                    <button 
                      onClick={() => handleCardClick('assets')}
                      className="font-inter text-sm text-green-600 hover:text-green-700 font-medium"
                    >
                      View all {assets.length} assets
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                <p className="font-inter">No recent activity to display</p>
                <p className="text-sm font-inter mt-2">Start by recording income or expenses</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Worker View Notice */}
      {/*{!isOwner && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-jetbrains-mono font-medium text-blue-900 mb-2">Worker View</h3>
          <p className="font-inter text-blue-700">
            As a worker, you can record income and expenses. For detailed reports and analytics, 
            please contact the farm owner.
          </p>
        </div>
      )}*/}

      {/* Detail Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto m-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-jetbrains-mono font-bold text-gray-900 dark:text-white">
                {modalType === 'income' && 'Income Entries'}
                {modalType === 'expenses' && 'Expense Entries'}
                {modalType === 'inventory' && 'Inventory Items'}
                {modalType === 'assets' && 'Assets Overview'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                ✕
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {modalData
                    .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                    .map((item, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {new Date(item.createdAt || item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                        {item.description || item.name || item.category || 'No description'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.amount ? formatCurrency(item.amount.toString()) : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        {item.userName || 'Unknown User'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.type === 'Income' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          item.type === 'Expense' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' : 
                          item.type === 'Asset' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                          'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {item.type}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              
              {modalData.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No data available
                </div>
              )}
            </div>
            
            {/* Pagination Controls */}
            <div className="mt-4 flex items-center justify-between border-t pt-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
                {Math.min(currentPage * itemsPerPage, modalData.length)} of{' '}
                {modalData.length} results
                {modalData.length <= itemsPerPage && (
                  <span className="ml-2 text-gray-500 dark:text-gray-400"></span>
                )}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  Previous
                </button>
                
                {Array.from({ length: Math.max(1, Math.ceil(modalData.length / itemsPerPage)) }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 text-sm rounded-md ${
                      currentPage === page
                        ? 'bg-green-600 text-white'
                        : 'bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, Math.max(1, Math.ceil(modalData.length / itemsPerPage))))}
                  disabled={currentPage === Math.ceil(modalData.length / itemsPerPage) || modalData.length === 0}
                  className="px-3 py-1 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
