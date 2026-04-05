import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import RestrictedPageMessage from './RestrictedPageMessage';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';
import Pagination from './Pagination';
import { X, Download, FileText } from 'lucide-react';
import { 
  ReportsSkeleton
} from './EnhancedSkeletons';

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

const exportToPDF = (data: any[], title: string, type: string) => {
  // Simple PDF export - in a real app, you'd use a library like jsPDF
  const content = data.map(item => {
    if (type === 'all') {
      return `${new Date(item.createdAt).toLocaleDateString()} - ${item.type} - ${item.description || item.category} - ${formatCurrency(item.amount.toString())}`;
    } else {
      return `${new Date(item.createdAt).toLocaleDateString()} - ${item.category || 'General'} - ${item.description || 'No description'} - ${formatCurrency(item.amount.toString())}`;
    }
  }).join('\n');

  const blob = new Blob([`${title}\n\n${content}`], { type: 'text/plain;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${title}.txt`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

const Reports: React.FC = () => {
  const { user } = useAuth();
  const { canAccessFeature } = useSubscriptionRestrictions();

  // Check subscription access first
  if (!canAccessFeature('financialReports')) {
    return (
      <RestrictedPageMessage
        feature="financialReports"
        title="Financial Reports"
        description="Comprehensive financial reporting, transaction history, and exportable data for your farm operations."
        icon="📈"
      />
    );
  }

  console.log('🔍 Reports: Access granted - proceeding with reports');

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

  console.log('🔍 Reports: State initialized, loading =', loading);

  // Define fetchAllTransactions BEFORE useEffect hooks
  const fetchAllTransactions = async () => {
    try {
      console.log('🔍 Reports: Starting fetchAllTransactions');
      console.log('🔍 Reports: Initial loading state:', loading);
      setLoading(true);
      console.log('🔍 Reports: Set loading to true');
      
      const today = new Date();
      let startDate = '';
      let endDate = today.toISOString().split('T')[0];
      
      console.log('🔍 Reports: Date filter:', dateFilter);
      
      // Calculate date range based on filter
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
          // For all time, don't set date limits
          startDate = '';
          endDate = '';
          break;
      }

      console.log('🔍 Reports: Date range:', { startDate, endDate });

      console.log('🔍 Reports: Making API calls...');
      const [incomeResponse, expenseResponse] = await Promise.all([
        api.get(`/finance/income?startDate=${startDate}&endDate=${endDate}`),
        api.get(`/finance/expenses?startDate=${startDate}&endDate=${endDate}`)
      ]);

      console.log('🔍 Reports: API responses:', {
        incomeStatus: incomeResponse.status,
        expenseStatus: expenseResponse.status,
        incomeData: incomeResponse.data,
        expenseData: expenseResponse.data
      });

      const incomeData = incomeResponse.data?.entries || [];
      const expenseData = expenseResponse.data?.entries || [];

      console.log('🔍 Reports: Processed data counts:', {
        incomeCount: incomeData.length,
        expenseCount: expenseData.length
      });

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

      console.log('🔍 Reports: Setting allTransactions:', allData.length);
      setAllTransactions(allData);
    } catch (err: any) {
      console.error('❌ Reports: Error in fetchAllTransactions:', err);
      setError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      console.log('🔍 Reports: Setting loading to false');
      setLoading(false);
      console.log('🔍 Reports: Final loading state:', loading);
    }
  };

  // useEffect hooks AFTER function definition
  useEffect(() => {
    console.log('🔍 Reports: Component mounted, starting initial fetch');
    console.log('🔍 Reports: useEffect triggered, dependencies: []');
    fetchAllTransactions();
  }, []); // Initial fetch on mount

  useEffect(() => {
    console.log('🔍 Reports: Date filter useEffect triggered');
    console.log('🔍 Reports: Dependencies:', [dateFilter, selectedMonth, selectedYear]);
    fetchAllTransactions();
  }, [dateFilter, selectedMonth, selectedYear]);

  // Show skeleton while loading - AFTER useEffect hooks
  if (loading) {
    console.log('🔍 Reports: Rendering skeleton, loading =', loading);
    return <ReportsSkeleton />;
  }

  const isOwner = user?.role === 'OWNER' || user?.role === 'MANAGER';

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

  console.log('🔍 Reports: Rendering main content, loading =', loading);
  console.log('🔍 Reports: allTransactions.length =', allTransactions.length);
  console.log('🔍 Reports: error =', error);

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
    <div className="min-h-screen bg-gray-0 dark:bg-gray-900 py-0">
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0">
        {/* Header */}
        <div className="mb-0">
          {/* Header content commented out */}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Report Tabs */}
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-0 mb-6">
          <div className="overflow-x-auto pb-0">
            <div className="flex items-center justify-between gap-4 min-w-max border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-4">
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
                  Income
                </button>
                <button
                  onClick={() => setReportTab('expenseByCategory')}
                  className={`flex-shrink-0 px-3 py-2 font-inter text-xs sm:text-sm font-medium transition-colors duration-200 border-b-2 ${
                    reportTab === 'expenseByCategory'
                      ? 'text-green-600 border-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
                      : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                  }`}
                >
                  Expense
                </button>
              </div>
              <div className="flex flex-col sm:flex-row sm:gap-2 gap-2 pb-2">
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
          </div>
        </div>

        {/* All Transactions View */}
        {reportTab === 'allTransactions' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-0 mb-6">
            {paginatedTransactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-[800px] divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
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
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-0 mb-6">
            {paginatedIncomeTransactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-[800px] divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
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
                      {paginatedIncomeTransactions.map((transaction) => (
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

        {/* Expense by Category Section */}
        {reportTab === 'expenseByCategory' && (
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-0 mb-6">
            {expenseTransactions.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
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

        {/* Transaction Details Modal */}
        {showDetailsModal && selectedTransaction && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[85vh] overflow-y-auto">
              {/* Header with gradient background */}
              <div className={`relative sticky top-0 ${
                selectedTransaction.type === 'Income' 
                  ? 'bg-gradient-to-r from-green-500 to-green-600' 
                  : 'bg-gradient-to-r from-red-500 to-red-600'
              } p-6 rounded-t-2xl`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl font-bold text-white mb-2">
                      {selectedTransaction.type === 'Income' ? 'Income' : 'Expense'} Details
                    </h3>
                    <p className="text-white/90">
                      {new Date(selectedTransaction.createdAt).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  <button
                    onClick={handleCloseDetailsModal}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Amount Card */}
                <div className={`p-6 rounded-xl ${
                  selectedTransaction.type === 'Income'
                    ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                    : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">Amount</p>
                      <p className={`text-3xl font-bold ${
                        selectedTransaction.type === 'Income'
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      }`}>
                        {formatCurrency(selectedTransaction.amount.toString())}
                      </p>
                    </div>
                    <div className={`p-3 rounded-lg ${
                      selectedTransaction.type === 'Income'
                        ? 'bg-green-100 dark:bg-green-900'
                        : 'bg-red-100 dark:bg-red-900'
                    }`}>
                      <span className="text-2xl">
                        {selectedTransaction.type === 'Income' ? '💰' : '💸'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedTransaction.category || 'General'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {selectedTransaction.description || 'No description provided'}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Recorded By</label>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedTransaction.userName || 'System'}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Email</label>
                      <p className="text-lg text-gray-900 dark:text-white">
                        {selectedTransaction.userEmail || 'system@farmops.com'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Timestamps */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Date</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedTransaction.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Time</p>
                      <p className="font-semibold text-gray-900 dark:text-white">
                        {new Date(selectedTransaction.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Transaction ID</p>
                      <p className="font-mono text-sm font-semibold text-gray-900 dark:text-white break-all">
                        {selectedTransaction.id}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Reports;
