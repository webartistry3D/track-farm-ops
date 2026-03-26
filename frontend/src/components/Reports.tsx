import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RestrictedPageMessage from './RestrictedPageMessage';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';
import Pagination from './Pagination';
import { X, Download, FileText } from 'lucide-react';

// Export utility functions
const exportToCSV = (data: any[], filename: string, type: string) => {
  const headers = type === 'all' 
    ? ['Date', 'Type', 'Description', 'Amount', 'Recorded By', 'Email']
    : ['Date', 'Category', 'Description', 'Amount', 'Recorded By', 'Email', 'Time'];
  
  const csvContent = [
    headers.join(','),
    ...data.map(item => {
      if (type === 'all') {
        return [
          new Date(item.createdAt).toLocaleDateString(),
          item.type,
          `"${(item.description || item.category || 'No description').replace(/"/g, '""')}"`,
          item.amount,
          `"${(item.userName || item.user?.name || 'Unknown').replace(/"/g, '""')}"`,
          `"${(item.userEmail || item.user?.email || 'unknown@farmops.com').replace(/"/g, '""')}"`
        ].join(',');
      } else {
        return [
          new Date(item.createdAt).toLocaleDateString(),
          `"${(item.category || 'General').replace(/"/g, '""')}"`,
          `"${(item.description || 'No description').replace(/"/g, '""')}"`,
          item.amount,
          `"${(item.userName || item.user?.name || 'Unknown').replace(/"/g, '""')}"`,
          `"${(item.userEmail || item.user?.email || 'unknown@farmops.com').replace(/"/g, '""')}"`,
          new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        ].join(',');
      }
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const exportToPDF = async (data: any[], filename: string, type: string) => {
  // Simple PDF export using window.print for now
  // In a real implementation, you'd use a library like jsPDF
  const printContent = document.createElement('div');
  printContent.innerHTML = `
    <style>
      body { font-family: Arial, sans-serif; margin: 20px; }
      h1 { color: #333; }
      table { width: 100%; border-collapse: collapse; margin: 20px 0; }
      th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
      th { background-color: #f2f2f2; }
      .income { color: green; }
      .expense { color: red; }
      @media print { body { margin: 0; } }
    </style>
    <h1>${filename}</h1>
    <table>
      <thead>
        <tr>
          ${type === 'all' 
            ? '<th>Date</th><th>Type</th><th>Description</th><th>Amount</th><th>Recorded By</th><th>Email</th>'
            : '<th>Date</th><th>Category</th><th>Description</th><th>Amount</th><th>Recorded By</th><th>Email</th><th>Time</th>'
          }
        </tr>
      </thead>
      <tbody>
        ${data.map(item => `
          <tr>
            <td>${new Date(item.createdAt).toLocaleDateString()}</td>
            ${type === 'all' 
              ? `<td class="${item.type.toLowerCase()}">${item.type}</td>`
              : `<td>${item.category || 'General'}</td>`
            }
            <td>${item.description || item.category || 'No description'}</td>
            <td class="${item.type.toLowerCase()}">${formatCurrency(item.amount.toString())}</td>
            <td>${item.userName || item.user?.name || 'Unknown'}</td>
            <td>${item.userEmail || item.user?.email || 'unknown@farmops.com'}</td>
            ${type !== 'all' ? `<td>${new Date(item.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>` : ''}
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent.innerHTML);
    printWindow.document.close();
    printWindow.print();
  }
};

const Reports = () => {
  const { user } = useAuth();
  const location = useLocation();
  const { canAccessFeature, getCurrentPlan } = useSubscriptionRestrictions();

  // Debug: Log current subscription status
  console.log('Reports page - Current plan:', getCurrentPlan());
  console.log('Reports page - Can access financialReports:', canAccessFeature('financialReports'));

  if (!user) {
    return <div>Please log in to access reports.</div>;
  }

  // Check subscription access first
  if (!canAccessFeature('financialReports')) {
    console.log('Reports page - Showing upgrade message for financialReports');
    return (
      <RestrictedPageMessage
        feature="financialReports"
        title="Financial Reports"
        description="Comprehensive financial reporting, transaction history, and exportable data for your farm operations."
        icon="📈"
      />
    );
  }

  console.log('Reports page - Proceeding with reports access');
  const isOwner = user.role === 'OWNER' || user.role === 'MANAGER';

  if (!isOwner) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
        <p className="text-yellow-700">
          Reports are only available to farm owners and managers.
        </p>
      </div>
    );
  }
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [allTransactions, setAllTransactions] = useState<any[]>([]);
  const [reportTab, setReportTab] = useState<'allTransactions' | 'incomeByCategory' | 'expenseByCategory'>('allTransactions');
  const [filterType] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFilter, setDateFilter] = useState<'today' | 'yesterday' | 'last7days' | 'last30days' | 'custom' | 'allTime'>('last30days');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  
  // Pagination state for each section
  const [allTransactionsPage, setAllTransactionsPage] = useState(1);
  const [incomeCategoryPage, setIncomeCategoryPage] = useState(1);
  const [expenseCategoryPage, setExpenseCategoryPage] = useState(1);
  const entriesPerPage = 10;
  
  // Modal state for transaction details
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const transactionId = searchParams.get('transactionId');
    const type = searchParams.get('type');
    
    if (transactionId && type) {
      // Find and show the specific transaction
      const transaction = allTransactions.find(t => 
        t.id === transactionId && t.type.toLowerCase() === type.toLowerCase()
      );
      
      if (transaction) {
        setSelectedTransaction(transaction);
        setShowDetailsModal(true);
      }
    }
    
    // Scroll to top on page load and navigation
    window.scrollTo(0, 0);
  }, [location]);

  // Refetch data when date filter changes
  useEffect(() => {
    fetchAllTransactions();
  }, [dateFilter, selectedMonth, selectedYear]);

  const fetchAllTransactions = async () => {
    try {
      setLoading(true);
      const today = new Date().toISOString().split('T')[0];
      let startDate = '';
      let endDate = today;
      
      // Calculate date range based on filter
      switch (dateFilter) {
        case 'today':
          startDate = today;
          endDate = today;
          break;
        case 'yesterday':
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          startDate = yesterday.toISOString().split('T')[0];
          endDate = yesterday.toISOString().split('T')[0];
          break;
        case 'last7days':
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          startDate = weekAgo.toISOString().split('T')[0];
          endDate = today;
          break;
        case 'last30days':
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          startDate = thirtyDaysAgo.toISOString().split('T')[0];
          endDate = today;
          break;
        case 'custom':
          const customDate = new Date(selectedYear, selectedMonth, 1);
          const lastDayOfCustomMonth = new Date(selectedYear, selectedMonth + 1, 0);
          startDate = customDate.toISOString().split('T')[0];
          endDate = lastDayOfCustomMonth.toISOString().split('T')[0];
          break;
        case 'allTime':
          // For all time, don't set date limits
          startDate = '';
          endDate = '';
          break;
      }

      const [incomeResponse, expenseResponse] = await Promise.all([
        api.get(`/finance/income?startDate=${startDate}&endDate=${endDate}`),
        api.get(`/finance/expenses?startDate=${startDate}&endDate=${endDate}`)
      ]);

      const incomeData = incomeResponse.data?.entries || [];
      const expenseData = expenseResponse.data?.entries || [];

      const processedIncome = incomeData.map((entry: any) => ({
        ...entry,
        type: 'Income',
        userName: entry.createdByUser?.name || entry.user?.name || 'System',
        userEmail: entry.createdByUser?.email || entry.user?.email || 'system@farmops.com'
      }));

      const processedExpenses = expenseData.map((entry: any) => ({
        ...entry,
        type: 'Expense',
        userName: entry.createdByUser?.name || entry.user?.name || 'System',
        userEmail: entry.createdByUser?.email || entry.user?.email || 'system@farmops.com'
      }));

      const allData = [...processedIncome, ...processedExpenses].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      setAllTransactions(allData);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = allTransactions.filter(transaction => {
    if (filterType === 'all') return true;
    return transaction.type.toLowerCase() === filterType;
  });

  const paginatedTransactions = filteredTransactions.slice(
    (allTransactionsPage - 1) * entriesPerPage,
    allTransactionsPage * entriesPerPage
  );

  // Income transactions pagination
  const incomeTransactions = allTransactions.filter(t => t.type === 'Income');
  const paginatedIncomeTransactions = incomeTransactions.slice(
    (incomeCategoryPage - 1) * entriesPerPage,
    incomeCategoryPage * entriesPerPage
  );

  // Expense transactions pagination
  const expenseTransactions = allTransactions.filter(t => t.type === 'Expense');
  const paginatedExpenseTransactions = expenseTransactions.slice(
    (expenseCategoryPage - 1) * entriesPerPage,
    expenseCategoryPage * entriesPerPage
  );

  const handleTransactionClick = (transaction: any) => {
    setSelectedTransaction(transaction);
    setShowDetailsModal(true);
  };

  const handleCloseDetailsModal = () => {
    setSelectedTransaction(null);
    setShowDetailsModal(false);
  };

  if (!user) {
    return <div>Please log in to view reports.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-4">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-0">
        {/* Header */}
        <div className="mb-2">
          {/* <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">Reports</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">Financial reports and transaction details</p>
            </div>
            <Link 
              to="/dashboard"
              className="btn btn-secondary"
            >
              Back to Dashboard
            </Link>
          </div> */}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading reports...</p>
          </div>
        ) : (
          <>
            {/* View Mode Toggle */}
            {/*<div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('all')}
                    className={`px-4 py-2 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
                      viewMode === 'all'
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    All Transactions
                  </button>
                  {transaction && (
                    <button
                      onClick={() => setViewMode('single')}
                      className={`px-4 py-2 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
                        viewMode === 'single'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                    >
                      Transaction Details
                    </button>
                  )}
                </div>

                {viewMode === 'all' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`px-3 py-1 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
                        filterType === 'all'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => setFilterType('income')}
                      className={`px-3 py-1 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
                        filterType === 'income'
                          ? 'bg-green-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                    >
                      Income
                    </button>
                    <button
                      onClick={() => setFilterType('expense')}
                      className={`px-3 py-1 rounded-lg font-inter text-sm font-medium transition-colors duration-200 ${
                        filterType === 'expense'
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                    >
                      Expenses
                    </button>
                  </div>
                )}
              </div>
            </div>*/}

            {/* Date Filter Controls */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
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

            {/* Report Tabs */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4 mb-6">
              <div className="overflow-x-auto pb-2">
                <div className="flex items-center gap-2 min-w-max border-b border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => setReportTab('allTransactions')}
                    className={`flex-shrink-0 px-3 py-2 font-inter text-xs sm:text-sm font-medium transition-colors duration-200 border-b-2 ${
                      reportTab === 'allTransactions'
                        ? 'text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    All Transactions
                  </button>
                  <button
                    onClick={() => setReportTab('incomeByCategory')}
                    className={`flex-shrink-0 px-3 py-2 font-inter text-xs sm:text-sm font-medium transition-colors duration-200 border-b-2 ${
                      reportTab === 'incomeByCategory'
                        ? 'text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Income by Category
                  </button>
                  <button
                    onClick={() => setReportTab('expenseByCategory')}
                    className={`flex-shrink-0 px-3 py-2 font-inter text-xs sm:text-sm font-medium transition-colors duration-200 border-b-2 ${
                      reportTab === 'expenseByCategory'
                        ? 'text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    Expense by Category
                  </button>
                </div>
              </div>
            </div>

            {/* All Transactions View */}
            {reportTab === 'allTransactions' && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                      All Transactions
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Showing {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-2 gap-2">
                    <button
                      onClick={() => exportToCSV(filteredTransactions, 'all-transactions', 'all')}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                    <button
                      onClick={() => exportToPDF(filteredTransactions, 'All Transactions Report', 'all')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>

                {paginatedTransactions.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-[800px] divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-20">
                              Type
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[300px]">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                              Recorded by
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {paginatedTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  transaction.type === 'Income' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {transaction.type}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                <div className="max-w-md break-words">
                                  {transaction.description || transaction.category || 'No description'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                                {formatCurrency(transaction.amount.toString())}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div>
                                  <div>{transaction.userName}</div>
                                  <div className="text-xs text-gray-400">{transaction.userEmail}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleTransactionClick(transaction)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Pagination Component */}
                    <Pagination
                      currentPage={allTransactionsPage}
                      totalPages={Math.ceil(filteredTransactions.length / entriesPerPage)}
                      onPageChange={setAllTransactionsPage}
                      entriesPerPage={entriesPerPage}
                      totalEntries={filteredTransactions.length}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No transactions found</p>
                  </div>
                )}
              </div>
            )}

            {/* Income by Category Section */}
            {reportTab === 'incomeByCategory' && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                      Income by Category
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Showing {allTransactions.filter(t => t.type === 'Income').length} income transaction{allTransactions.filter(t => t.type === 'Income').length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-2 gap-2">
                    <button
                      onClick={() => exportToCSV(incomeTransactions, 'income-transactions', 'income')}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                    <button
                      onClick={() => exportToPDF(incomeTransactions, 'Income by Category Report', 'income')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>

                {incomeTransactions.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-[900px] divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[300px]">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                              Recorded by
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                              Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {paginatedIncomeTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                  {transaction.category || 'General'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                <div className="max-w-md break-words">
                                  {transaction.description || 'No description'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600">
                                {formatCurrency(transaction.amount.toString())}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div>
                                  <div>{transaction.userName}</div>
                                  <div className="text-xs text-gray-400">{transaction.userEmail}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleTransactionClick(transaction)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Income Pagination Component */}
                    <Pagination
                      currentPage={incomeCategoryPage}
                      totalPages={Math.ceil(incomeTransactions.length / entriesPerPage)}
                      onPageChange={setIncomeCategoryPage}
                      entriesPerPage={entriesPerPage}
                      totalEntries={incomeTransactions.length}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No income transactions found</p>
                  </div>
                )}
              </div>
            )}

            {/* Expenses by Category Section */}
            {reportTab === 'expenseByCategory' && (
              <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-poppins font-bold text-gray-900 dark:text-white">
                      Expenses by Category
                    </h2>
                    <p className="mt-2 text-gray-600 dark:text-gray-400">
                      Showing {allTransactions.filter(t => t.type === 'Expense').length} expense transaction{allTransactions.filter(t => t.type === 'Expense').length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:gap-2 gap-2">
                    <button
                      onClick={() => exportToCSV(expenseTransactions, 'expense-transactions', 'expense')}
                      className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <Download className="w-4 h-4" />
                      CSV
                    </button>
                    <button
                      onClick={() => exportToPDF(expenseTransactions, 'Expenses by Category Report', 'expense')}
                      className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors duration-200"
                    >
                      <FileText className="w-4 h-4" />
                      PDF
                    </button>
                  </div>
                </div>

                {expenseTransactions.length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-[900px] divide-y divide-gray-200 dark:divide-gray-700">
                        <thead className="bg-gray-50 dark:bg-gray-900">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                              Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                              Category
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider min-w-[300px]">
                              Description
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-28">
                              Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-32">
                              Recorded by
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                              Time
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider w-24">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                          {paginatedExpenseTransactions.map((transaction) => (
                            <tr key={transaction.id} className="hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-700">
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                                {new Date(transaction.createdAt).toLocaleDateString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                                  {transaction.category || 'General'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                                <div className="max-w-md break-words">
                                  {transaction.description || 'No description'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600">
                                {formatCurrency(transaction.amount.toString())}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                <div>
                                  <div>{transaction.userName}</div>
                                  <div className="text-xs text-gray-400">{transaction.userEmail}</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                                {new Date(transaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => handleTransactionClick(transaction)}
                                  className="text-green-600 hover:text-green-900"
                                >
                                  View Details
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Expenses Pagination Component */}
                    <Pagination
                      currentPage={expenseCategoryPage}
                      totalPages={Math.ceil(expenseTransactions.length / entriesPerPage)}
                      onPageChange={setExpenseCategoryPage}
                      entriesPerPage={entriesPerPage}
                      totalEntries={expenseTransactions.length}
                    />
                  </>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-gray-500 dark:text-gray-400">No expense transactions found</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {/* Transaction Details Modal */}
      {showDetailsModal && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
            {/* Header with gradient background */}
            <div className={`relative sticky top-0 ${
              selectedTransaction.type === 'Income' 
                ? 'bg-gradient-to-r from-green-500 to-green-600' 
                : 'bg-gradient-to-r from-red-500 to-red-600'
            } p-6`}>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white mb-1">Transaction Details</h2>
                  <p className="text-green-100 text-sm">
                    {selectedTransaction.type === 'Income' ? 'Income Transaction' : 'Expense Transaction'}
                  </p>
                </div>
                <button
                  onClick={handleCloseDetailsModal}
                  className="p-2 rounded-lg text-white hover:bg-white hover:bg-opacity-20 transition-all duration-200 transform hover:scale-110"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Amount display with emphasis */}
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                <p className={`text-3xl font-bold ${
                  selectedTransaction.type === 'Income' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                }`}>
                  {formatCurrency(selectedTransaction.amount.toString())}
                </p>
                <div className="mt-2">
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    selectedTransaction.type === 'Income' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                  }`}>
                    {selectedTransaction.type}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Details grid */}
            <div className="p-4 pb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Transaction Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                    Transaction Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Description
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium break-words text-sm">
                        {selectedTransaction.description || selectedTransaction.category || 'No description'}
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Date
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium text-sm">
                          {new Date(selectedTransaction.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                        <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                          Time
                        </label>
                        <p className="text-gray-900 dark:text-white font-medium text-sm">
                          {new Date(selectedTransaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* User Information */}
                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white flex items-center">
                    <span className="w-2 h-2 bg-purple-500 rounded-full mr-2"></span>
                    User Information
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Recorded by
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium break-words text-sm">
                        {selectedTransaction.userName || selectedTransaction.user?.name || 'Unknown'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Email
                      </label>
                      <p className="text-gray-900 dark:text-white font-medium text-xs break-all">
                        {selectedTransaction.userEmail || selectedTransaction.user?.email || 'unknown@farmops.com'}
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                      <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        Transaction ID
                      </label>
                      <p className="text-gray-900 dark:text-white font-mono text-xs break-all">
                        {selectedTransaction.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
