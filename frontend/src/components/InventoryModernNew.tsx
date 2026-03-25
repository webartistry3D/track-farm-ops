import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';
import type { InventoryItem } from '../types';
import { 
  Search, Plus, Package, BarChart3, Activity, AlertTriangle, 
  RefreshCw, Grid3X3, List, Check,
  DollarSign, Download, Trash2, Eye
} from 'lucide-react';

interface InventoryListProps {
  onDeleteClick?: (item: InventoryItem) => void;
}

const InventoryModernNew = ({ onDeleteClick }: InventoryListProps) => {
  const { user } = useAuth();
  
  // State management
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [stockStatusFilter, setStockStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  // Tab state management
  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'transactions' | 'analytics'>('items');

  // Handle tab changes
  const handleTabChange = (tab: 'items' | 'categories' | 'transactions' | 'analytics') => {
    setActiveTab(tab);
  };
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  
  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Settings
  const [inventorySettings] = useState({
    lowStockThreshold: 10,
    mediumStockThreshold: 50,
    currency: 'USD'
  });

  // Utility functions
  const calculateItemValue = useCallback((item: InventoryItem) => {
    const quantity = Number(item.quantity) || 0;
    const price = Number(item.pricePerUnit) || 0;
    return quantity * price;
  }, []);

  const getStockStatus = useCallback((item: InventoryItem) => {
    const quantity = Number(item.quantity) || 0;
    const lowThreshold = inventorySettings.lowStockThreshold;
    const mediumThreshold = inventorySettings.mediumStockThreshold;

    if (quantity === 0) {
      return { 
        label: 'Out of Stock', 
        color: 'bg-red-100 text-red-700 border-red-200', 
        icon: <AlertTriangle className="w-4 h-4" /> 
      };
    } else if (quantity <= lowThreshold) {
      return { 
        label: 'Low Stock', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: <AlertTriangle className="w-4 h-4" /> 
      };
    } else if (quantity <= mediumThreshold) {
      return { 
        label: 'Medium Stock', 
        color: 'bg-blue-100 text-blue-700 border-blue-200', 
        icon: <Activity className="w-4 h-4" /> 
      };
    } else {
      return { 
        label: 'In Stock', 
        color: 'bg-green-100 text-green-700 border-green-200', 
        icon: <Check className="w-4 h-4" /> 
      };
    }
  }, [inventorySettings]);

  const getCategoryName = useCallback((categoryId: number | undefined) => {
    if (categoryId === undefined) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  }, [categories]);

  // Data fetching
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/inventory/categories');
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
      setError('Failed to load categories');
    }
  }, []);

  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/inventory/items');
      setItems(response.data || []);
      setError('');
    } catch (err: any) {
      console.error('Failed to fetch inventory:', err);
      setError(err.response?.data?.error || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initialize data
  useEffect(() => {
    fetchCategories();
    fetchInventory();
  }, [fetchCategories, fetchInventory]);

  // Filter and sort items
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch = 
          item.name.toLowerCase().includes(searchLower) ||
          getCategoryName(item.categoryId).toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Category filter
      if (selectedCategory !== 'all' && item.categoryId !== undefined && item.categoryId !== Number(selectedCategory)) {
        return false;
      }

      // Stock status filter
      if (stockStatusFilter !== 'all') {
        const status = getStockStatus(item);
        switch (stockStatusFilter) {
          case 'low':
            return status.label === 'Low Stock';
          case 'out':
            return status.label === 'Out of Stock';
          case 'need_restocking':
            return status.label === 'Low Stock' || status.label === 'Out of Stock';
          case 'in':
            return status.label === 'In Stock';
          default:
            return true;
        }
      }

      return true;
    });
  }, [items, searchTerm, selectedCategory, stockStatusFilter, getStockStatus, getCategoryName]);

  const sortedItems = useMemo(() => {
    return [...filteredItems].sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'quantity':
          comparison = Number(a.quantity) - Number(b.quantity);
          break;
        case 'value':
          comparison = calculateItemValue(a) - calculateItemValue(b);
          break;
        case 'date':
          comparison = new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
          break;
        case 'status':
          comparison = getStockStatus(a).label.localeCompare(getStockStatus(b).label);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [filteredItems, sortBy, sortOrder, calculateItemValue, getStockStatus]);

  // Calculate totals
  const totals = useMemo(() => {
    const totalValue = sortedItems.reduce((sum, item) => {
      return sum + calculateItemValue(item);
    }, 0);
    const totalItems = sortedItems.length;
    const lowStockItems = sortedItems.filter(item => {
      const status = getStockStatus(item);
      return status.label === 'Low Stock' || status.label === 'Out of Stock';
    }).length;
    
    return {
      totalItems,
      totalValue,
      lowStockItems,
      averageValue: totalItems > 0 ? totalValue / totalItems : 0
    };
  }, [sortedItems, calculateItemValue, getStockStatus]);

  // Event handlers
  const handleRefresh = useCallback(() => {
    fetchInventory();
    fetchCategories();
  }, [fetchInventory, fetchCategories]);

  const handleDeleteClick = useCallback((item: InventoryItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    
    try {
      await api.delete(`/inventory/items/${itemToDelete.id}`);
      setItems(items.filter(item => item.id !== itemToDelete.id));
      setShowDeleteModal(false);
      setItemToDelete(null);
      
      if (onDeleteClick) {
        onDeleteClick(itemToDelete);
      }
      
      setNotification({
        type: 'success',
        message: 'Item deleted successfully'
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to delete item'
      });
    }
  }, [itemToDelete, onDeleteClick, items]);

  const handleExport = useCallback(() => {
    const csvContent = [
      ['Name', 'Category', 'Quantity', 'Unit', 'Value', 'Status'],
      ...sortedItems.map(item => [
        item.name,
        getCategoryName(item.categoryId),
        item.quantity,
        item.unit || 'pcs',
        formatCurrency(calculateItemValue(item)),
        getStockStatus(item).label
      ])
    ].map(row => row.join(',')).join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inventory.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  }, [sortedItems, getCategoryName, calculateItemValue, getStockStatus]);

  // Show notification and auto-hide
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  if (!user) {
    return <div>Please log in to access this feature.</div>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white-50 dark:bg-gray-900">
        <div className="w-full px-4 sm:px-0 lg:px-0 py-6">
          {/* Stats Overview Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                </div>
              </div>
            ))}
          </div>

          {/* Tab Navigation Skeleton */}
          <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mb-6">
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="flex overflow-x-auto justify-between">
                <div className="flex overflow-x-auto">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-12 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mr-2"></div>
                  ))}
                </div>
                <div className="flex items-center space-x-2 ml-4 flex-shrink-0 h-full mt-3">
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                  <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters Skeleton */}
          <div className="bg-white dark:bg-gray-800 shadow-lg p-6 mb-0">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="h-10 w-full bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
                <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse"></div>
              </div>
            </div>
          </div>

          {/* Items Grid Skeleton */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2"></div>
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                  <div className="flex justify-between">
                    <div className="h-4 w-12 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="h-4 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                    <div className="w-6 h-6 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Header */}
      {/*<div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="w-full px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Inventory Management</h1>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {totals.totalItems} items
              </span>
            </div>
            
            <div className="flex items-center space-x-3">
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>*/}
      
      <div className="w-full px-4 sm:px-0 lg:px-0 py-6">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totals.totalItems.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totals.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totals.lowStockItems}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totals.averageValue)}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters and Controls */}
        <div className="bg-white dark:bg-gray-800 shadow-lg p-6 mb-0">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {/* Stock Status Filter */}
            <select
              value={stockStatusFilter}
              onChange={(e) => setStockStatusFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="in">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
              <option value="need_restocking">Need Restocking</option>
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="quantity">Sort by Quantity</option>
              <option value="value">Sort by Value</option>
              <option value="date">Sort by Date</option>
              <option value="status">Sort by Status</option>
            </select>

            {/* Sort Order Toggle */}
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              title={`Currently: ${sortOrder === 'asc' ? 'Ascending' : 'Descending'} (Click to reverse)`}
            >
              {sortOrder === 'asc' ? (
                <div className="flex items-center space-x-1">
                  <span className="text-xs">A-Z</span>
                  <span className="text-xs">↑</span>
                </div>
              ) : (
                <div className="flex items-center space-x-1">
                  <span className="text-xs">Z-A</span>
                  <span className="text-xs">↓</span>
                </div>
              )}
            </button>

            {/* View Mode */}
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'grid'
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded-lg transition-colors ${
                  viewMode === 'list'
                    ? 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-gray-100 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 mb-6">
          <div className="w-full px-4 sm:px-6 lg:px-8">
            <div className="flex overflow-x-auto justify-between">
              <div className="flex overflow-x-auto">
                {['items', 'categories', 'transactions', 'analytics'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab as any)}
                    className={`py-4 px-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </div>
              <div className="flex items-center space-x-2 ml-4 flex-shrink-0 h-full mt-3">
                <button
                  onClick={handleRefresh}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <RefreshCw className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleExport}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => console.log('Add item modal not implemented')}
                  className="bg-green-600 text-white px-3 sm:px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4" />
                  <span>Item</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'items' && (
          <div>
            {/* Items Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {sortedItems.map((item) => {
                const status = getStockStatus(item);
                const value = calculateItemValue(item);
                
                return (
                  <div
                    key={item.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {item.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {getCategoryName(item.categoryId)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full border ${status.color}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Quantity:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {item.quantity} {item.unit || 'pcs'}
                          </span>
                        </div>
                        
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Value:</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(value)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-1">
                          {status.icon}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => console.log('View item details not implemented')}
                            className="p-1 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(item)}
                            className="p-1 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {sortedItems.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No items found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  {searchTerm || selectedCategory !== 'all' || stockStatusFilter !== 'all'
                    ? 'Try adjusting your filters'
                    : 'Get started by adding your first inventory item'}
                </p>
                <button
                  onClick={() => console.log('Add item modal not implemented')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add First Item
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div>
            {/* Categories Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => {
                const itemCount = items.filter(item => item.categoryId === category.id).length;
                const totalValue = items
                  .filter(item => item.categoryId === category.id)
                  .reduce((sum, item) => sum + calculateItemValue(item), 0);
                
                return (
                  <div
                    key={category.id}
                    className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                  >
                    <div className="p-6">
                      <div className="flex flex-col items-center text-center mb-6">
                        <div className="w-20 h-20 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-2xl flex items-center justify-center text-4xl mb-4 shadow-lg">
                          {category.icon || '📦'}
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                            {category.description || 'No description'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Items:</span>
                            <span className={`px-3 py-1 text-sm font-medium rounded-full border ${
                              itemCount > 0 
                                ? 'bg-green-100 text-green-700 border-green-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'
                            }`}>
                              {itemCount}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">
                              {formatCurrency(totalValue)}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          {itemCount > 0 ? (
                            <div className="flex items-center space-x-1">
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-xs text-green-600 font-medium">Active</span>
                            </div>
                          ) : (
                            <div className="flex items-center space-x-1">
                              <AlertTriangle className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-400 font-medium">Empty</span>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => console.log('View category details not implemented')}
                            className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => console.log('Edit category not implemented')}
                            className="p-2 text-gray-400 hover:text-yellow-600 dark:hover:text-yellow-400 transition-colors rounded-lg hover:bg-yellow-50 dark:hover:bg-yellow-900/20"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {categories.length === 0 && (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  No categories found
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Get started by adding your first category
                </p>
                <button
                  onClick={() => console.log('Add category modal not implemented')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2 inline" />
                  Add First Category
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transactions' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Transaction Tracking
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Transaction tracking features coming soon
              </p>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📈</span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Inventory Analytics
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Analytics features coming soon
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Item
              </h3>
            </div>
            
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete "{itemToDelete.name}"? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
          notification.type === 'success'
            ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border border-green-200 dark:border-green-700'
            : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border border-red-200 dark:border-red-700'
        }`}>
          <div className="flex items-center">
            {notification.type === 'success' ? (
              <Check className="w-5 h-5 mr-2" />
            ) : (
              <AlertTriangle className="w-5 h-5 mr-2" />
            )}
            <span className="font-medium">{notification.message}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryModernNew;
