import { useState, useEffect } from 'react';
import api from '../lib/api';
import { Package, Sprout, ShoppingCart, Trash2, ArrowRight } from 'lucide-react';
import type { InventoryTransaction } from '../types';
import Pagination from './Pagination';
import { formatCurrency } from '../utils/currency';

interface TransactionHistoryProps {
  itemId?: number;
}

const TransactionHistory = ({ itemId }: TransactionHistoryProps) => {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const limit = 10;

  useEffect(() => {
    fetchTransactions();
  }, [itemId, page]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        limit: limit.toString(),
        offset: ((page - 1) * limit).toString(),
        ...(itemId && { itemId: itemId.toString() })
      });
      
      const response = await api.get(`/inventory/transactions?${params}`);
      setTransactions(response.data.transactions);
      setTotal(response.data.total);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const getChangeColor = (change: number) => {
    return change > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getChangeIcon = (change: number) => {
    return change > 0 ? '↑' : '↓';
  };

  const getUsageTypeIcon = (usageType?: string) => {
    switch (usageType) {
      case 'FEEDING':
        return <Package className="w-4 h-4" />;
      case 'PLANTING':
        return <Sprout className="w-4 h-4" />;
      case 'SALES':
        return <ShoppingCart className="w-4 h-4" />;
      case 'WASTE':
        return <Trash2 className="w-4 h-4" />;
      case 'TRANSFER':
        return <ArrowRight className="w-4 h-4" />;
      case 'INITIAL_STOCK':
        return <Package className="w-4 h-4" />;
      default:
        return <ArrowRight className="w-4 h-4" />;
    }
  };

  const getUsageTypeColor = (usageType?: string) => {
    switch (usageType) {
      case 'FEEDING':
        return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900';
      case 'PLANTING':
        return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900';
      case 'SALES':
        return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900';
      case 'WASTE':
        return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900';
      case 'TRANSFER':
        return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900';
      case 'INITIAL_STOCK':
        return 'text-indigo-600 dark:text-indigo-400 bg-indigo-100 dark:bg-indigo-900';
      default:
        return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900';
    }
  };

  const getUserRoleColor = (role?: string) => {
    switch (role) {
      case 'OWNER':
        return 'text-purple-700 dark:text-purple-300 font-semibold';
      case 'MANAGER':
        return 'text-blue-700 dark:text-blue-300 font-medium';
      case 'WORKER':
        return 'text-gray-700 dark:text-gray-300';
      default:
        return 'text-gray-900 dark:text-white';
    }
  };

  const totalPages = Math.ceil(total / limit);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-lg">Loading transactions...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        {/*<h3 className="text-xl font-semibold text-gray-900 dark:text-white">
          {itemName ? `${itemName} - ` : ''}Transaction History
        </h3>*/}
        <div className="text-sm text-gray-500 dark:text-gray-400">
          {total} total transactions
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Item
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Change
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Change By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider" style={{width: '250px', minWidth: '250px', maxWidth: '250px'}}>
                  Reason
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Cost
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((transaction) => (
                <tr key={transaction.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {transaction.inventoryItem.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.inventoryItem.type}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`flex items-center space-x-2 ${getUsageTypeColor(transaction.usageType)}`}>
                      {getUsageTypeIcon(transaction.usageType)}
                      <span className="text-sm font-medium">
                        {transaction.usageType?.replace('_', ' ') || 'OTHER'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getChangeColor(transaction.quantityChange)}`}>
                      {getChangeIcon(transaction.quantityChange)} {Math.abs(transaction.quantityChange)} {transaction.inventoryItem.unit}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getUserRoleColor(transaction.user.role)}`}>
                      {transaction.user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900 dark:text-white" style={{width: '250px', minWidth: '250px', maxWidth: '250px'}}>
                    <div>{transaction.reason}</div>
                    {transaction.relatedEntity && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {transaction.relatedEntity} {transaction.relatedEntityId && `(#${transaction.relatedEntityId})`}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    {transaction.totalCost ? formatCurrency(transaction.totalCost.toString()) : '-'}
                    {transaction.costPerUnit && (
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {formatCurrency(transaction.costPerUnit.toString())}/{transaction.inventoryItem.unit}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className={`text-sm font-medium ${getUserRoleColor(transaction.user.role)}`}>
                      {transaction.user.name}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {transaction.user.email}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {transactions.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 dark:text-gray-400 text-lg">No transactions found</div>
          <p className="text-gray-400 mt-2">
            {itemId ? 'No transactions for this item yet' : 'No inventory transactions recorded yet'}
          </p>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            entriesPerPage={limit}
            totalEntries={total}
          />
        </div>
      )}
    </div>
  );
};

export default TransactionHistory;
