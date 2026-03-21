import { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';
import AddItemForm from './AddItemForm';
import AddCategoryForm from './AddCategoryForm';
import TransactionHistory from './TransactionHistory';
import QuickUsage from './QuickUsage';
import InventoryCategories from './InventoryCategories';
import RestrictedPageMessage from './RestrictedPageMessage';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import type { InventoryItem } from '../types';
import { 
  Search, Plus, Edit2, Package, BarChart3, Activity, AlertTriangle, 
  RefreshCw, Grid3X3, List, Clock, X, Check,
  DollarSign, Download, Upload, Trash2, Eye
} from 'lucide-react';

interface InventoryListProps {
  onDeleteClick?: (item: InventoryItem) => void;
}

interface Category {
  id: number;
  name: string;
  description?: string;
  icon?: string;
  color?: string;
  _count?: {
    items: number;
  };
}

const InventoryModern = ({ onDeleteClick }: InventoryListProps) => {
  const { user } = useAuth();
  const { canAccessFeature } = useSubscriptionRestrictions();
  
  // Check if user has access to inventory features
  if (!canAccessFeature('inventoryTransactions')) {
    return (
      <RestrictedPageMessage
        feature="inventoryTransactions"
        title="Inventory Management"
        description="Complete inventory tracking, transactions, and stock management for your farm operations."
        icon="📦"
      />
    );
  }

  // Check if user has appropriate role
  if (!user) {
    return <div>Please log in to access inventory.</div>;
  }
  
  const isOwner = user.role === 'OWNER' || user.role === 'MANAGER';
  
  if (!isOwner) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
        <p className="text-yellow-700">
          Inventory management is only available to farm owners and managers.
        </p>
      </div>
    );
  }
  
  // Tab state
  const [activeTab, setActiveTab] = useState<'items' | 'categories' | 'history' | 'usage'>('items');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  
  // Core state
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | 'all'>('all');
  
  // Advanced state
  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'analytics'>('grid');
  const [sortBy, setSortBy] = useState<'name' | 'quantity' | 'value' | 'date' | 'status'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<Set<number>>(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showViewDetailsModal, setShowViewDetailsModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Modal states for export/import functionality
  const [showExportModal, setShowExportModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Filter states (essential filters only)
  const [stockStatusFilter, setStockStatusFilter] = useState<string>('all');
  
  // Inventory settings state
  const [inventorySettings, setInventorySettings] = useState({
    lowStockThreshold: 0,
    mediumStockThreshold: 0,
    pricingEnabled: false
  });

  // Fetch inventory settings from API
  const fetchInventorySettings = useCallback(async () => {
    try {
      const response = await api.get('/inventory/settings');
      const settings = response.data || {
        lowStockThreshold: 10,
        mediumStockThreshold: 50,
        pricingEnabled: false
      };
      
      setInventorySettings(settings);
      return settings;
    } catch (error) {
      // Use minimal defaults if API fails - no hardcoded business logic
      const fallbackSettings = {
        lowStockThreshold: 5,
        mediumStockThreshold: 25,
        pricingEnabled: false
      };
      setInventorySettings(fallbackSettings);
      return fallbackSettings;
    }
  }, []);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/inventory/categories');
      setCategories(response.data || []);
    } catch (err: any) {
      // Error fetching categories - continue without categories
    }
  }, []);

  // Fetch inventory from API
  const fetchInventory = useCallback(async () => {
    try {
      setLoading(true);
      setRefreshing(true);
      
      const params = new URLSearchParams();
      if (selectedCategory !== 'all') params.append('categoryId', selectedCategory.toString());
      if (searchTerm) params.append('search', searchTerm);
      
      const response = await api.get(`/inventory/items?${params.toString()}`);
      
      setItems(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch inventory');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedCategory, searchTerm]);

  // Initial data fetch
  useEffect(() => {
    fetchInventorySettings();
    fetchCategories();
    fetchInventory();
  }, [fetchInventory, fetchCategories]);

  // Calculate item value from direct fields or metadata (for backward compatibility)
  const calculateItemValue = useCallback((item?: InventoryItem) => {
    if (!item) return 0;
    
    // Try to get price from direct field first (new schema)
    let pricePerUnit = item.pricePerUnit;
    
    // Fall back to metadata for backward compatibility
    if (!pricePerUnit && item.metadata?.pricePerUnit) {
      pricePerUnit = Number(item.metadata.pricePerUnit);
    }
    
    if (!pricePerUnit) return 0;
    
    const quantity = Number(item.quantity) || 0;
    const value = quantity * Number(pricePerUnit);
    // Ensure we return a valid number
    return isNaN(value) ? 0 : value;
  }, []);

  // Get stock status from API configuration
  const getStockStatus = useCallback((item: InventoryItem) => {
    const quantity = Number(item.quantity);
    
    // Use fetched settings or defaults
    const lowStockThreshold = inventorySettings.lowStockThreshold;
    const mediumStockThreshold = inventorySettings.mediumStockThreshold;
    
    if (quantity === 0) {
      return { 
        label: 'Out of Stock', 
        color: 'bg-red-100 text-red-700 border-red-200', 
        icon: <AlertTriangle className="w-4 h-4" /> 
      };
    } else if (quantity < lowStockThreshold) {
      return { 
        label: 'Low Stock', 
        color: 'bg-yellow-100 text-yellow-700 border-yellow-200', 
        icon: <AlertTriangle className="w-4 h-4" /> 
      };
    } else if (quantity < mediumStockThreshold) {
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

  // Format item value
  const formatItemValue = useCallback((value: number) => {
    if (value === 0) {
      return '₦0.00';
    }
    return formatCurrency(value);
  }, []);

  // Get category icon
  const getCategoryIcon = useCallback((categoryId: number | undefined) => {
    if (categoryId === undefined) return <Package className="w-5 h-5" />;
    const category = categories.find(cat => cat.id === categoryId);
    return category?.icon ? (
      <span className="text-lg">{category.icon}</span>
    ) : <Package className="w-5 h-5" />;
  }, [categories]);

  // Get category color
  const getCategoryColor = useCallback((categoryId: number | undefined) => {
    if (categoryId === undefined) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    const category = categories.find(cat => cat.id === categoryId);
    if (!category?.color) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    
    // Convert light mode colors to dark mode variants
    const colorMap: { [key: string]: string } = {
      'bg-orange-100 text-orange-700 border-orange-200': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-700',
      'bg-green-100 text-green-700 border-green-200': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border-green-200 dark:border-green-700',
      'bg-red-100 text-red-700 border-red-200': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border-red-200 dark:border-red-700',
      'bg-blue-100 text-blue-700 border-blue-200': 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700',
      'bg-emerald-100 text-emerald-700 border-emerald-200': 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700',
      'bg-yellow-100 text-yellow-700 border-yellow-200': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-700',
      'bg-purple-100 text-purple-700 border-purple-200': 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-700',
      'bg-amber-100 text-amber-700 border-amber-200': 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-700',
      'bg-cyan-100 text-cyan-700 border-cyan-200': 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-700 dark:text-cyan-300 border-cyan-200 dark:border-cyan-700',
      'bg-gray-100 text-gray-700 border-gray-200': 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600'
    };
    
    return colorMap[category.color] || category.color;
  }, [categories]);

  // Get category name
  const getCategoryName = useCallback((categoryId: number | undefined) => {
    if (categoryId === undefined) return 'Uncategorized';
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  }, [categories]);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    let filtered = items.filter(item => {
      // Search term filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        return (
          item.name.toLowerCase().includes(searchLower) ||
          item.category?.name?.toLowerCase().includes(searchLower) ||
          getCategoryName(item.categoryId).toLowerCase().includes(searchLower)
        );
      }
      return true;
    });

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.categoryId === selectedCategory);
    }

    // Stock status filter
    if (stockStatusFilter !== 'all') {
      filtered = filtered.filter(item => {
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
      });
    }

    return filtered;
  }, [items, searchTerm, selectedCategory, stockStatusFilter, getStockStatus, getCategoryName]);

  // Sort items
  const sortedItems = useMemo(() => {
    const sorted = [...filteredItems].sort((a, b) => {
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
    
    return sorted;
  }, [filteredItems, sortBy, sortOrder, calculateItemValue, getStockStatus]);

  // Calculate category statistics
  const categoryStats = useMemo(() => {
    const stats: Record<string, any> = {};
    
    // Initialize stats for all categories
    categories.forEach(category => {
      stats[category.id] = {
        ...category,
        totalValue: 0,
        itemCount: 0,
        lowStockCount: 0
      };
    });
    
    // Calculate stats from items
    items.forEach(item => {
      if (item.categoryId && stats[item.categoryId]) {
        stats[item.categoryId].itemCount++;
        stats[item.categoryId].totalValue += calculateItemValue(item);
        
        const stockStatus = getStockStatus(item);
        if (stockStatus.label === 'Low Stock' || stockStatus.label === 'Out of Stock') {
          stats[item.categoryId].lowStockCount++;
        }
      }
    });
    
    return stats;
  }, [items, categories, calculateItemValue, getStockStatus]);

  const handleClearSelection = useCallback(() => {
    setSelectedItems(new Set());
    setShowBulkActions(false);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    fetchInventorySettings();
    fetchInventory();
    fetchCategories();
  }, [fetchInventory, fetchCategories]);

  // Handle export
  const handleExport = useCallback(() => {
    // Simple CSV export functionality
    const csvContent = [
      ['Name', 'Category', 'Quantity', 'Unit', 'Value', 'Status', 'Updated'],
      ...sortedItems.map(item => [
        item.name,
        getCategoryName(item.categoryId),
        item.quantity,
        item.unit,
        formatItemValue(calculateItemValue(item)),
        getStockStatus(item).label,
        new Date(item.updatedAt).toLocaleDateString()
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, [sortedItems, getCategoryName, calculateItemValue, getStockStatus, formatItemValue]);

  // Handle import
  const handleImport = useCallback(() => {
    // Create file input element
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.csv,.xlsx';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // Here you would implement actual file parsing and upload logic
        alert(`Import functionality for ${file.name} will be implemented soon!`);
      }
    };
    input.click();
  }, []);

  // Handle tab changes
  const handleTabChange = useCallback((tab: 'items' | 'categories' | 'history' | 'usage') => {
    setActiveTab(tab);
  }, []);

  // Listen for custom tab change events from QuickUsage component
  useEffect(() => {
    const handleTabChangeEvent = (event: any) => {
      if (event.detail === 'items') {
        setActiveTab('items');
        setSelectedItem(null); // Clear selected item when going back to items
      }
    };

    window.addEventListener('changeTab', handleTabChangeEvent);
    return () => window.removeEventListener('changeTab', handleTabChangeEvent);
  }, []);

  const handleUpdateClick = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setShowAddItemModal(true);
  }, []);

  const handleHistoryClick = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setActiveTab('history');
  }, []);

  const handleQuickUsageClick = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setActiveTab('usage');
  }, []);

  const handleViewDetailsClick = useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setShowViewDetailsModal(true);
  }, []);

  const handleDeleteClick = useCallback((item: InventoryItem) => {
    setItemToDelete(item);
    setShowDeleteModal(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!itemToDelete) return;
    
    try {
      await onDeleteClick?.(itemToDelete);
      setShowDeleteModal(false);
      setItemToDelete(null);
      setNotification({
        type: 'success',
        message: `"${itemToDelete.name}" has been deleted successfully.`
      });
      
      // Refresh the inventory data to show updated list
      await fetchInventory();
      
      // Hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to delete item. Please try again.'
      });
      
      // Hide notification after 3 seconds
      setTimeout(() => setNotification(null), 3000);
    }
  }, [itemToDelete, onDeleteClick, fetchInventory]);

  const handleCancelDelete = useCallback(() => {
    setShowDeleteModal(false);
    setItemToDelete(null);
  }, []);

  // Calculate totals
  const totals = useMemo(() => {
    const totalValue = sortedItems.reduce((sum, item) => {
      const value = calculateItemValue(item);
      // Ensure we're working with numbers
      return sum + (typeof value === 'number' ? value : 0);
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

  // Calculate out of stock items
  const outOfStockItems = useMemo(() => {
    return sortedItems.filter(item => {
      const status = getStockStatus(item);
      return status.label === 'Out of Stock';
    }).length;
  }, [sortedItems, getStockStatus]);

  // Card click handlers
  const handleTotalItemsClick = useCallback(() => {
    // Open a modal showing all items summary or navigate to items page
    // For now, let's show a notification with the breakdown
    setNotification({
      type: 'success',
      message: `Total Items: ${totals.totalItems} items across ${categories.length} categories`
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  }, [totals.totalItems, categories.length]);

  const handleTotalValueClick = useCallback(() => {
    // Open a modal showing value breakdown or navigate to analytics
    // For now, let's show a notification with value details
    setNotification({
      type: 'success',
      message: `Total Inventory Value: ${formatItemValue(totals.totalValue)} (Average: ${formatItemValue(totals.averageValue)} per item)`
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  }, [totals.totalValue, totals.averageValue]);

  const handleLowStockClick = useCallback(() => {
    // Show information about low stock items without resetting filters
    setNotification({
      type: 'success',
      message: `${totals.lowStockItems} items need restocking. Select "Need Restocking" from the status filter to see them.`
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  }, [totals.lowStockItems]);

  const handleOutOfStockClick = useCallback(() => {
    // Show information about out of stock items without resetting filters
    setNotification({
      type: 'success',
      message: `${outOfStockItems} items are completely out of stock. Select "Out of Stock Only" from the status filter to see them.`
    });
    
    // Hide notification after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  }, [outOfStockItems]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          {/*<h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Error Loading Inventory</h2>*/}
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
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
                className={`p-2 rounded-lg transition-colors ${
                  refreshing 
                    ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' 
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
                disabled={refreshing}
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleImport}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                <Upload className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowAddItemModal(true)}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Item
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <button
            onClick={handleTotalItemsClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Total Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  {totals.totalItems.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-lg group-hover:bg-blue-200 dark:group-hover:bg-blue-800 transition-colors">
                <Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </button>
          
          <button
            onClick={handleTotalValueClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Total Value</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-green-600 dark:group-hover:text-green-400 transition-colors">
                  {formatItemValue(totals.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg group-hover:bg-green-200 dark:group-hover:bg-green-800 transition-colors">
                <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </button>
          
          <button
            onClick={handleLowStockClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Low Stock Items</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-yellow-600 dark:group-hover:text-yellow-400 transition-colors">
                  {totals.lowStockItems}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg group-hover:bg-yellow-200 dark:group-hover:bg-yellow-800 transition-colors">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </button>
          
          <button
            onClick={handleOutOfStockClick}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-all duration-200 hover:scale-105 cursor-pointer text-left group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">Out of Stock</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {outOfStockItems}
                </p>
              </div>
              <div className="p-3 bg-red-100 dark:bg-red-900 rounded-lg group-hover:bg-red-200 dark:group-hover:bg-red-800 transition-colors">
                <X className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
            </div>
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => handleTabChange('items')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'items'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Package className="w-4 h-4" />
                Inventory Items
              </button>
              <button
                onClick={() => handleTabChange('categories')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'categories'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Categories
              </button>
              <button
                onClick={() => handleTabChange('usage')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'usage'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Package className="w-4 h-4" />
                Quick Usage
              </button>
              <button
                onClick={() => handleTabChange('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 whitespace-nowrap ${
                  activeTab === 'history'
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Clock className="w-4 h-4" />
                Transaction History
              </button>
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'items' && (
          <div>
            {/* Filters and Controls */}
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
          <div className="flex flex-col gap-4">
            {/* Primary Controls Row */}
            <div className="flex flex-col lg:flex-row lg:items-center gap-4">
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
                onChange={(e) => {
                  const value = e.target.value;
                  setSelectedCategory(value === 'all' ? 'all' : parseInt(value));
                }}
                className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.name}
                  </option>
                ))}
              </select>

              {/* Stock Status Filter */}
              <select
                value={stockStatusFilter}
                onChange={(e) => setStockStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
              >
                <option value="all">All Status</option>
                <option value="need_restocking">Need Restocking</option>
                <option value="low">Low Stock Only</option>
                <option value="out">Out of Stock Only</option>
                <option value="in">In Stock</option>
              </select>
            </div>

            {/* Secondary Controls Row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              {/* View Mode and Sort Controls */}
              <div className="flex items-center space-x-4">
                {/* View Mode Toggle */}
                <div className="flex items-center bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <Grid3X3 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'list'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('analytics')}
                    className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                      viewMode === 'analytics'
                        ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                        : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <BarChart3 className="w-4 h-4" />
                  </button>
                </div>

                {/* Sort Controls */}
                <div className="flex items-center space-x-2">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
                  >
                    <option value="name">Name</option>
                    <option value="quantity">Quantity</option>
                    <option value="value">Value</option>
                    <option value="date">Date</option>
                    <option value="status">Status</option>
                  </select>
                  <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 text-sm"
                  >
                    {sortOrder === 'asc' ? '↑' : '↓'}
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={handleRefresh}
                  className={`p-2 rounded-lg transition-colors ${
                    refreshing 
                      ? 'bg-gray-100 dark:bg-gray-700 text-gray-400' 
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                  disabled={refreshing}
                >
                  <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
                </button>
                
                <button
                  onClick={handleExport}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Download className="w-5 h-5" />
                </button>
                
                <button
                  onClick={handleImport}
                  className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <Upload className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => setShowAddItemModal(true)}
                  className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Items Display */}
        {sortedItems.length === 0 ? (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No items found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              {selectedCategory === 'all' 
                ? 'Start by adding your first inventory item to begin tracking your farm resources.' 
                : `No items found in ${getCategoryName(selectedCategory as number)}. Try changing category or search term.`}
            </p>
          </div>
        ) : (
          <>
            {/* Grid View */}
            {viewMode === 'grid' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {sortedItems.map((item) => {
                  const isSelected = selectedItems.has(item.id);
                  const itemValue = calculateItemValue(item);
                  
                  return (
                    <div key={item.id} className={`bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
                      {/* Item Header */}
                      <div className="p-6">
                        {/* Item Name */}
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 text-center">
                          {item.name}
                        </h3>

                        {/* Category */}
                        <div className="flex items-center justify-center space-x-2 mb-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getCategoryColor(item.categoryId)}`}>
                            {getCategoryIcon(item.categoryId)}
                            <span className="ml-1 text-gray-900 dark:text-white">{getCategoryName(item.categoryId)}</span>
                          </span>
                        </div>

                        {/* Quantity and Value */}
                        <div className="space-y-3">
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {Number(item.quantity).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              {item.unit}
                            </div>
                          </div>
                          <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                            <div className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatItemValue(itemValue)}
                            </div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              Value
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Item Actions */}
                      <div className="flex justify-between px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                          <button 
                            onClick={() => handleUpdateClick(item)}
                            className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            title="Edit Item"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleQuickUsageClick(item)}
                            className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                            title="Quick Usage"
                          >
                            <Package className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleHistoryClick(item)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="View History"
                          >
                            <Clock className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleViewDetailsClick(item)}
                            className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteClick(item)}
                            className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                            title="Delete Item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* List View */}
            {viewMode === 'list' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Item
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Unit
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Updated
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedItems.map((item) => {
                        const itemValue = calculateItemValue(item);
                        
                        return (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900 dark:text-white">{item.name}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-500 dark:text-gray-400">{item.unit}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full`}>
                                {getCategoryName(item.categoryId)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {Number(item.quantity).toLocaleString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-semibold text-gray-900 dark:text-white">
                                {formatItemValue(itemValue)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                              {new Date(item.updatedAt).toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex justify-center space-x-2">
                                <button 
                                  onClick={() => handleUpdateClick(item)}
                                  className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                  title="Edit Item"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleQuickUsageClick(item)}
                                  className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                  title="Quick Usage"
                                >
                                  <Package className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleHistoryClick(item)}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                                  title="View History"
                                >
                                  <Clock className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleViewDetailsClick(item)}
                                  className="text-purple-600 hover:text-purple-900 dark:text-purple-400 dark:hover:text-purple-300"
                                  title="View Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDeleteClick(item)}
                                  className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                                  title="Delete Item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Analytics View */}
            {viewMode === 'analytics' && (
              <div className="space-y-6">
                {/* Category Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {categories.map(category => {
                    const stats = categoryStats[category.id];
                    if (!stats) return null;
                    
                    return (
                      <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 relative">
                        <div className="absolute top-6 left-1/2 transform -translate-x-1/2">
                          <div className="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg">
                            {getCategoryIcon(category.id)}
                          </div>
                        </div>
                        <div className="flex flex-col items-center text-center mt-16 pt-12">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                            {category.name}
                          </h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {category.description}
                          </p>
                        </div>
                        
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Items</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {stats.itemCount}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Total Value</span>
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {formatItemValue(stats.totalValue)}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600 dark:text-gray-400">Low Stock</span>
                            <span className={`text-lg font-bold ${stats.lowStockCount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {stats.lowStockCount}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Bulk Actions */}
        {showBulkActions && selectedItems.size > 0 && (
          <div className="fixed bottom-6 right-6 bg-white dark:bg-gray-800 rounded-lg shadow-xl p-4 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {selectedItems.size} items selected
              </span>
              <button
                onClick={handleClearSelection}
                className="px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Clear Selection
              </button>
              <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700">
                Bulk Actions
              </button>
            </div>
          </div>
        )}
        </div>
        )}

        {/* Categories Tab */}
        {activeTab === 'categories' && (
          <div>
            <InventoryCategories />
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div>
            <TransactionHistory 
              itemId={selectedItem?.id}
            />
          </div>
        )}

        {/* Usage Tab */}
        {activeTab === 'usage' && (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {selectedItem ? (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    Quick Usage - {selectedItem.name}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Current stock: {Number(selectedItem.quantity).toLocaleString()} {selectedItem.unit}
                  </p>
                  <button
                    onClick={() => setSelectedItem(null)}
                    className="mt-2 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    ← Back to item selection
                  </button>
                </div>
                <QuickUsage 
                  item={selectedItem}
                  onSuccess={() => {
                    fetchInventory();
                    // Keep the usage tab open to allow multiple usage entries
                  }}
                />
              </>
            ) : (
              <div className="text-center py-12">
                <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  Quick Usage
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Select an item from the inventory to record usage
                </p>
                <button
                  onClick={() => setActiveTab('items')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Go to Inventory Items
                </button>
              </div>
            )}
          </div>
        )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Inventory</h2>
                <button
                  onClick={() => setShowExportModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Export functionality will allow you to download your inventory data as CSV or Excel files.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowExportModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    Export CSV
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Import Inventory</h2>
                <button
                  onClick={() => setShowImportModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                <p className="text-gray-600 dark:text-gray-400">
                  Import functionality will allow you to upload CSV or Excel files to update your inventory.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowImportModal(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Choose File
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {selectedItem ? 'Edit Item' : 'Add New Item'}
                </h2>
                <button
                  onClick={() => {
                    setShowAddItemModal(false);
                    setSelectedItem(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6">
                <AddItemForm
                  isOpen={showAddItemModal}
                  itemToEdit={selectedItem}
                  onClose={() => {
                    setShowAddItemModal(false);
                    setSelectedItem(null);
                  }}
                  onSuccess={() => {
                    setShowAddItemModal(false);
                    setSelectedItem(null);
                    fetchInventory();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Category</h2>
                <button
                  onClick={() => setShowAddCategoryModal(false)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="p-6">
                <AddCategoryForm
                  isOpen={showAddCategoryModal}
                  onClose={() => setShowAddCategoryModal(false)}
                  onSuccess={() => {
                    setShowAddCategoryModal(false);
                    fetchCategories();
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && itemToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">Delete Item</h2>
                <button
                  onClick={handleCancelDelete}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="mb-6">
                <div className="flex items-center justify-center w-12 h-12 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full">
                  <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white text-center mb-2">
                  Delete "{itemToDelete.name}"?
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-center">
                  This action cannot be undone. This will permanently delete the item and all its transaction history.
                </p>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  onClick={handleCancelDelete}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                  Delete Item
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* View Details Modal */}
      {showViewDetailsModal && selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Eye className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Item Details</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{selectedItem.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowViewDetailsModal(false);
                    setSelectedItem(null);
                  }}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Information</h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="space-y-3">
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Item Name</label>
                          <p className="text-gray-900 dark:text-white font-medium">{selectedItem.name}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Type</label>
                          <p className="text-gray-900 dark:text-white font-medium">{selectedItem.type}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Category</label>
                          <p className="text-gray-900 dark:text-white font-medium">{getCategoryName(selectedItem.categoryId)}</p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Description</label>
                          <p className="text-gray-900 dark:text-white">{selectedItem.description || 'No description available'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quantity & Value */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quantity & Value</h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Quantity</label>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {Number(selectedItem.quantity).toLocaleString()} {selectedItem.unit}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</label>
                            <p className="text-2xl font-bold text-gray-900 dark:text-white">
                              {formatItemValue(calculateItemValue(selectedItem))}
                            </p>
                          </div>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Minimum Stock Alert</label>
                          <p className="text-gray-900 dark:text-white font-medium">
                            {selectedItem.minimumStock ? `${selectedItem.minimumStock} ${selectedItem.unit}` : 'Not set'}
                          </p>
                        </div>
                        
                        <div>
                          <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Stock Status</label>
                          <div className="flex items-center space-x-2">
                            {getStockStatus(selectedItem).icon}
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStockStatus(selectedItem).color}`}>
                              {getStockStatus(selectedItem).label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Additional Details */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Additional Details</h3>
                    
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                      <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Price Per Unit</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {selectedItem.pricePerUnit ? formatCurrency(selectedItem.pricePerUnit) : 'Not set'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Location</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {selectedItem.location || 'Not specified'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Supplier</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {selectedItem.supplier || 'Not specified'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Initial Quantity</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {selectedItem.initialQuantity ? `${selectedItem.initialQuantity} ${selectedItem.unit}` : 'Not recorded'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Purchase Date</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {selectedItem.purchaseDate ? new Date(selectedItem.purchaseDate).toLocaleDateString() : 'Not recorded'}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Expiry Date</label>
                            <p className="text-gray-900 dark:text-white font-medium">
                              {selectedItem.expiryDate ? new Date(selectedItem.expiryDate).toLocaleDateString() : 'Not set'}
                            </p>
                          </div>
                        </div>
                        
                        {selectedItem.metadata?.notes && (
                          <div>
                            <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Additional Notes</label>
                            <p className="text-gray-900 dark:text-white font-medium">{selectedItem.metadata.notes}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Timestamps */}
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Created</label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedItem.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600 dark:text-gray-400">Last Updated</label>
                      <p className="text-gray-900 dark:text-white">
                        {new Date(selectedItem.updatedAt).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
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
    </div>
  );
};

export default InventoryModern;
