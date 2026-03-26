import { useState, useEffect, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';
import type { InventoryItem } from '../types';
import { 
  Search, Plus, Edit2, Trash2, AlertTriangle, TrendingUp, Clock, MapPin, User, FileText, CheckCircle, Calendar, 
  Package, Activity, RefreshCw, Grid3X3, List, Check,
  Download, Eye, MinusCircle
} from 'lucide-react';

// Utility functions for number formatting
const formatNumber = (value: string | number | null | undefined): string => {
  if (value === null || value === undefined || value === '') return '';
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(numValue)) return value.toString();
  return numValue.toLocaleString('en-US');
};

interface InventoryListProps {
  onDeleteClick?: (item: InventoryItem) => void;
}

const InventoryModernNew = ({ onDeleteClick }: InventoryListProps) => {
  const { user } = useAuth();
  const location = useLocation();
  
  // Scroll to top when navigating to Inventory page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);
  
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
  const [activeTab, setActiveTab] = useState<'items' | 'categories'>('items');

  // Handle tab changes
  const handleTabChange = (tab: 'items' | 'categories') => {
    setActiveTab(tab);
  };
  
  // Modal states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [showViewItemModal, setShowViewItemModal] = useState(false);
  const [itemToView, setItemToView] = useState<InventoryItem | null>(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [itemToUse, setItemToUse] = useState<InventoryItem | null>(null);
  
  // Form states
  const [newItem, setNewItem] = useState({
    name: '',
    categoryId: '',
    quantity: '',
    unit: 'pieces',
    pricePerUnit: '',
    minimumStock: '',
    notes: ''
  });
  
  // Formatted display states for thousand separators
  const [formattedItem, setFormattedItem] = useState({
    quantity: '',
    pricePerUnit: '',
    minimumStock: ''
  });
  
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    icon: '📦',
    color: 'bg-gray-100 text-gray-700 border-gray-200'
  });
  
  // Usage form state
  const [usageData, setUsageData] = useState({
    quantityChange: '',
    reason: '',
    usageType: 'OTHER',
    relatedEntity: '',
    relatedEntityId: '',
    location: ''
  });
  
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
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
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

  // Add Item Handler
  const handleAddItem = useCallback(async () => {
    try {
      // Determine item type based on category
      const category = categories.find(cat => cat.id === Number(newItem.categoryId));
      const categoryName = category?.name?.toLowerCase() || '';
      
      let itemType = 'SUPPLIES'; // Default to SUPPLIES instead of GENERAL
      if (categoryName.includes('livestock') || categoryName.includes('animal')) {
        itemType = 'LIVESTOCK';
      } else if (categoryName.includes('feed') || categoryName.includes('nutrition')) {
        itemType = 'SUPPLIES';
      } else if (categoryName.includes('medicine') || categoryName.includes('health')) {
        itemType = 'MEDICINE';
      } else if (categoryName.includes('equipment') || categoryName.includes('tool')) {
        itemType = 'EQUIPMENT';
      } else if (categoryName.includes('seed') || categoryName.includes('planting')) {
        itemType = 'SEEDS';
      } else if (categoryName.includes('fertilizer') || categoryName.includes('soil')) {
        itemType = 'FERTILIZERS';
      } else if (categoryName.includes('harvested') || categoryName.includes('produce')) {
        itemType = 'PRODUCE';
      } else if (categoryName.includes('pesticide')) {
        itemType = 'PESTICIDES';
      }

      const itemData = {
        name: newItem.name,
        type: itemType,
        categoryId: Number(newItem.categoryId),
        initialQuantity: Number(newItem.quantity) || 0,
        unit: newItem.unit,
        pricePerUnit: Number(newItem.pricePerUnit) || 0,
        minimumStock: Number(newItem.minimumStock) || 0,
        metadata: {
          notes: newItem.notes,
          purchaseDate: new Date().toISOString(),
          location: null,
          supplier: null,
          expiryDate: null
        }
      };

      const response = await api.post('/inventory/items', itemData);
      
      if (response.data) {
        setItems(prev => [...prev, response.data]);
        setShowAddItemModal(false);
        setNewItem({
          name: '',
          categoryId: '',
          quantity: '',
          unit: 'pieces',
          pricePerUnit: '',
          minimumStock: '',
          notes: ''
        });
        setFormattedItem({
          quantity: '',
          pricePerUnit: '',
          minimumStock: ''
        });
        
        setNotification({
          type: 'success',
          message: 'Item added successfully'
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to add item'
      });
    }
  }, [newItem]);

  // Add Category Handler
  const handleAddCategory = useCallback(async () => {
    try {
      const categoryData = {
        name: newCategory.name,
        description: newCategory.description,
        icon: newCategory.icon,
        color: newCategory.color,
        metadata: {
          keywords: [newCategory.name.toLowerCase()]
        }
      };

      const response = await api.post('/inventory/categories', categoryData);
      
      if (response.data) {
        setCategories(prev => [...prev, response.data]);
        setShowAddCategoryModal(false);
        setNewCategory({
          name: '',
          description: '',
          icon: '📦',
          color: 'bg-gray-100 text-gray-700 border-gray-200'
        });
        
        setNotification({
          type: 'success',
          message: 'Category added successfully'
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to add category'
      });
    }
  }, [newCategory]);

  // Record Usage Handler
  const handleRecordUsage = useCallback(async () => {
    try {
      if (!itemToUse || !usageData.quantityChange || !usageData.reason) {
        setNotification({
          type: 'error',
          message: 'Please fill in all required fields'
        });
        return;
      }

      const quantity = Number(usageData.quantityChange);
      if (isNaN(quantity) || quantity >= 0) {
        setNotification({
          type: 'error',
          message: 'Quantity must be a negative number (e.g., -5)'
        });
        return;
      }

      if (Math.abs(quantity) > Number(itemToUse.quantity)) {
        setNotification({
          type: 'error',
          message: `Insufficient inventory. Available: ${itemToUse.quantity} ${itemToUse.unit || 'pieces'}`
        });
        return;
      }

      const usagePayload = {
        inventoryItemId: itemToUse.id,
        quantityChange: quantity,
        reason: usageData.reason.trim(),
        usageType: usageData.usageType,
        relatedEntity: usageData.relatedEntity || null,
        relatedEntityId: usageData.relatedEntityId || null,
        location: usageData.location || null
      };

      const response = await api.post('/inventory-transactions/usage', usagePayload);
      
      if (response.data) {
        // Update the item quantity locally
        setItems(prev => prev.map(item => 
          item.id === itemToUse.id 
            ? { ...item, quantity: Number(item.quantity) + quantity } // quantity is negative
            : item
        ));
        
        setShowUsageModal(false);
        setItemToUse(null);
        setUsageData({
          quantityChange: '',
          reason: '',
          usageType: 'OTHER',
          relatedEntity: '',
          relatedEntityId: '',
          location: ''
        });
        
        setNotification({
          type: 'success',
          message: response.data.message || 'Usage recorded successfully'
        });
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: err.response?.data?.error || 'Failed to record usage'
      });
    }
  }, [itemToUse, usageData]);

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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Items</p>
                <p className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categories</p>
                <p className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
                  {categories.length}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Package className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Value</p>
                <p className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totals.totalValue)}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-lg">
                <span className="text-2xl font-bold text-green-600 dark:text-green-400">₦</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Low Stock Items</p>
                <p className="text-3xl font-poppins font-bold text-gray-900 dark:text-white">
                  {totals.lowStockItems}
                </p>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
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
            
            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              <button
                onClick={handleRefresh}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Refresh data"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
              
              <button
                onClick={handleExport}
                className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                title="Export to CSV"
              >
                <Download className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setShowAddItemModal(true)}
                className="bg-green-600 text-white px-3 sm:px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-green-700 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Item</span>
              </button>
              
              <button
                onClick={() => setShowAddCategoryModal(true)}
                className="bg-blue-600 text-white px-3 sm:px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors text-sm sm:text-base"
              >
                <Plus className="w-4 h-4" />
                <span>Category</span>
              </button>
            </div>
          </div>

          {/* Additional Filters Row */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
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
              <option value="all">All Stock Status</option>
              <option value="in_stock">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="out">Out of Stock</option>
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
              <div className="flex overflow-x-auto space-x-10">
                {['items', 'categories'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => handleTabChange(tab as any)}
                    className={`py-4 px-4 sm:px-6 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                      activeTab === tab
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
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
                    className={viewMode === 'grid' 
                      ? "bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                      : "hidden" // Hide individual cards in table view
                    }
                  >
                    {viewMode === 'grid' && (
                      // Grid View - Compact
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
                              onClick={() => {
                                setItemToView(item);
                                setShowViewItemModal(true);
                              }}
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
                    )}
                  </div>
                );
              })}
            </div>

            {/* Table View - Only show when in list mode */}
            {viewMode === 'list' && (
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Item Details
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Quantity
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Unit Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Total Value
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Min Stock
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Notes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Location
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Supplier
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Purchase Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Created
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {sortedItems.map((item) => {
                        const status = getStockStatus(item);
                        const value = calculateItemValue(item);
                        
                        return (
                          <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900 dark:text-white">
                                  {item.name}
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  ID: #{item.id}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <Package className="w-4 h-4 mr-2 text-gray-400" />
                                <span className="text-sm text-gray-900 dark:text-white">
                                  {getCategoryName(item.categoryId)}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                <div className="font-medium">{formatNumber(item.quantity)}</div>
                                <div className="text-xs text-gray-500">{item.unit || 'pieces'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                                {formatCurrency(item.pricePerUnit || 0)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-blue-600 dark:text-blue-400">
                                {formatCurrency(value)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-orange-600 dark:text-orange-400">
                                {formatNumber(item.minimumStock || 0)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${status.color}`}>
                                {status.label}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                                {item.metadata?.notes || '-'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                {item.metadata?.location ? (
                                  <>
                                    <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                                    {item.metadata.location}
                                  </>
                                ) : (
                                  '-'
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                {item.metadata?.supplier ? (
                                  <>
                                    <User className="w-4 h-4 mr-1 text-gray-400" />
                                    {item.metadata.supplier}
                                  </>
                                ) : (
                                  '-'
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900 dark:text-white">
                                {item.metadata?.purchaseDate ? (
                                  <>
                                    <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                                    {new Date(item.metadata.purchaseDate).toLocaleDateString()}
                                  </>
                                ) : (
                                  '-'
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900 dark:text-white">
                                <div>{new Date(item.createdAt).toLocaleDateString()}</div>
                                <div className="text-xs text-gray-500">
                                  {new Date(item.createdAt).toLocaleTimeString()}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex items-center space-x-2">
                                <button
                                  onClick={() => {
                                    setItemToUse(item);
                                    setShowUsageModal(true);
                                  }}
                                  className="text-orange-600 hover:text-orange-900 dark:text-orange-400 dark:hover:text-orange-300"
                                  title="Record Usage"
                                >
                                  <MinusCircle className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => {
                                    setItemToView(item);
                                    setShowViewItemModal(true);
                                  }}
                                  className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
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
                      onClick={() => setShowAddItemModal(true)}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-4 h-4 mr-2 inline" />
                      Add First Item
                    </button>
                  </div>
                )}
              </div>
            )}

            {sortedItems.length === 0 && viewMode === 'grid' && (
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
            {/* Categories Grid/List */}
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
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
                      {viewMode === 'grid' ? (
                        // Grid View Layout
                        <>
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
                                <span className="text-sm font-semibold text-gray-900 dark:text-white break-all max-w-[120px]">
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
                        </>
                      ) : (
                        // List View Layout
                        <div className="bg-white dark:bg-gray-800">
                          <div className="p-0">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                                  {category.name}
                                </h3>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {category.description || 'No description'}
                                </p>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                                itemCount > 0 
                                  ? 'bg-green-100 text-green-700 border-green-200'
                                  : 'bg-gray-100 text-gray-700 border-gray-200'
                              }`}>
                                {itemCount > 0 ? 'Active' : 'Empty'}
                              </span>
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Items:</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white">
                                  {itemCount}
                                </span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-sm text-gray-600 dark:text-gray-400">Total Value:</span>
                                <span className="text-sm font-medium text-gray-900 dark:text-white break-all max-w-[120px]">
                                  {formatCurrency(totalValue)}
                                </span>
                              </div>
                            </div>
                            
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                              <div className="flex items-center space-x-1">
                                {itemCount > 0 ? (
                                  <Check className="w-4 h-4 text-green-600" />
                                ) : (
                                  <AlertTriangle className="w-4 h-4 text-gray-400" />
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
                      )}
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

      {/* Add Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Item</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Item Name *
                </label>
                <input
                  type="text"
                  value={newItem.name}
                  onChange={(e) => setNewItem(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter item name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category *
                </label>
                <select
                  value={newItem.categoryId}
                  onChange={(e) => setNewItem(prev => ({ ...prev, categoryId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="">Select a category</option>
                  {categories.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Quantity *
                  </label>
                  <input
                    type="text"
                    value={formattedItem.quantity}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Remove all non-numeric characters and commas
                      const cleanValue = value.replace(/[^0-9]/g, '');
                      // Update stored value (without formatting)
                      setNewItem(prev => ({ ...prev, quantity: cleanValue }));
                      // Update display value (with formatting)
                      const displayValue = cleanValue === '' ? '' : Number(cleanValue).toLocaleString('en-US');
                      setFormattedItem(prev => ({ ...prev, quantity: displayValue }));
                    }}
                    onFocus={() => {
                      // Remove formatting when focused
                      setFormattedItem(prev => ({ ...prev, quantity: newItem.quantity }));
                    }}
                    onBlur={() => {
                      // Add formatting when unfocused
                      const displayValue = newItem.quantity === '' ? '' : Number(newItem.quantity).toLocaleString('en-US');
                      setFormattedItem(prev => ({ ...prev, quantity: displayValue }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Unit *
                  </label>
                  <select
                    value={newItem.unit}
                    onChange={(e) => setNewItem(prev => ({ ...prev, unit: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="pieces">Pieces</option>
                    <option value="kg">Kilograms</option>
                    <option value="liters">Liters</option>
                    <option value="meters">Meters</option>
                    <option value="bags">Bags</option>
                    <option value="bottles">Bottles</option>
                    <option value="boxes">Boxes</option>
                    <option value="crates">Crates</option>
                  </select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Price per Unit (₦)
                  </label>
                  <input
                    type="text"
                    value={formattedItem.pricePerUnit ? `₦${formattedItem.pricePerUnit}` : ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Remove currency symbol and non-numeric characters except decimal point
                      const cleanValue = value.replace(/[^0-9.]/g, '');
                      // Allow only positive numbers with up to 2 decimal places
                      const formattedValue = cleanValue === '' ? '' : cleanValue.replace(/(\..*?)\./g, '$1');
                      // Update stored value (without formatting)
                      setNewItem(prev => ({ ...prev, pricePerUnit: formattedValue }));
                      // Update display value (with formatting)
                      const displayValue = formattedValue === '' ? '' : Number(formattedValue).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                      setFormattedItem(prev => ({ ...prev, pricePerUnit: displayValue }));
                    }}
                    onFocus={() => {
                      // Remove formatting when focused
                      setFormattedItem(prev => ({ ...prev, pricePerUnit: newItem.pricePerUnit }));
                    }}
                    onBlur={() => {
                      // Add formatting when unfocused
                      const displayValue = newItem.pricePerUnit === '' ? '' : Number(newItem.pricePerUnit).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
                      setFormattedItem(prev => ({ ...prev, pricePerUnit: displayValue }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="₦0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Minimum Stock
                  </label>
                  <input
                    type="text"
                    value={formattedItem.minimumStock}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Remove all non-numeric characters and commas
                      const cleanValue = value.replace(/[^0-9]/g, '');
                      // Update stored value (without formatting)
                      setNewItem(prev => ({ ...prev, minimumStock: cleanValue }));
                      // Update display value (with formatting)
                      const displayValue = cleanValue === '' ? '' : Number(cleanValue).toLocaleString('en-US');
                      setFormattedItem(prev => ({ ...prev, minimumStock: displayValue }));
                    }}
                    onFocus={() => {
                      // Remove formatting when focused
                      setFormattedItem(prev => ({ ...prev, minimumStock: newItem.minimumStock }));
                    }}
                    onBlur={() => {
                      // Add formatting when unfocused
                      const displayValue = newItem.minimumStock === '' ? '' : Number(newItem.minimumStock).toLocaleString('en-US');
                      setFormattedItem(prev => ({ ...prev, minimumStock: displayValue }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Notes
                </label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem(prev => ({ ...prev, notes: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Add any additional notes..."
                  rows={1}
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowAddItemModal(false);
                  setNewItem({
                    name: '',
                    categoryId: '',
                    quantity: '',
                    unit: 'pieces',
                    pricePerUnit: '',
                    minimumStock: '',
                    notes: ''
                  });
                  setFormattedItem({
                    quantity: '',
                    pricePerUnit: '',
                    minimumStock: ''
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddItem}
                disabled={!newItem.name || !newItem.categoryId || !newItem.quantity}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Item
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Category Modal */}
      {showAddCategoryModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Category</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category Name *
                </label>
                <input
                  type="text"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter category name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <textarea
                  value={newCategory.description}
                  onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Describe this category..."
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Icon
                </label>
                <div className="grid grid-cols-6 gap-2 max-h-60 overflow-y-auto">
                  {[
                    // Livestock Animals (single representation each)
                    '🐄', '🐷', '🐑', '🐓', '🦆', '🦃', '🐰', '🦌',
                    // Farm Products
                    '🥛', '🧀', '🥚', '🍯', '🥩', '🍖', '🌽', '🍅',
                    // Crops & Plants
                    '🌾', '🌱', '🌿', '🍃', '🌻', '🌷', '🥔', '🥕',
                    // Equipment & Tools
                    '🔧', '🔨', '⚙️', '🛠️', '🚜', '🚲', '⛏️', '🔩',
                    // Storage & Containers
                    '📦', '🗄️', '🪣', '🪠', '🧺', '🛢️', '📊', '📋',
                    // Buildings & Structures
                    '🏠', '🏚️', '🌾', '🏭', '🏪', '🏢', '🏗️', '🚧',
                    // Nature & Environment
                    '🌍', '🌳', '🌲', '🌴', '🌵', '🍂', '🌈', '☀️',
                    // Water & Resources
                    '💧', '💦', '🌊', '⛲', '🚰', '🔥', '⚡', '🌡️',
                    // Food & Processing
                    '🍞', '🥖', '🥐', '🥨', '🧈', '🥗', '🍲', '🍳',
                    // Health & Care
                    '💊', '🩹', '🏥', '🧪', '🔬', '⚗️', '💉', '🩺',
                    // Transportation
                    '🚚', '🚛', '🚐', '🚗', '🛵', '🚲', '🏍️', '✈️',
                    // Miscellaneous Farm Items
                    '📏', '⚖️', '🧤', '👢', '🎒', '🔑', '📱', '💰',
                    // Symbols & Indicators
                    '✅', '❌', '⚠️', 'ℹ️', '📌', '📍', '🎯', '⭐'
                  ].map(icon => (
                    <button
                      key={icon}
                      onClick={() => setNewCategory(prev => ({ ...prev, icon }))}
                      className={`p-2 text-lg rounded-lg border transition-colors ${
                        newCategory.icon === icon
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400'
                      }`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>
              
                          </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAddCategoryModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCategory}
                disabled={!newCategory.name}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Usage Modal */}
      {showUsageModal && itemToUse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center mb-4">
              <MinusCircle className="w-5 h-5 text-orange-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Record Usage - {itemToUse.name}
              </h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Quantity Used *
                </label>
                <input
                  type="number"
                  value={usageData.quantityChange}
                  onChange={(e) => setUsageData(prev => ({ ...prev, quantityChange: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="-5 (negative for usage)"
                  max="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Available: {itemToUse.quantity} {itemToUse.unit || 'pieces'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason for Usage *
                </label>
                <textarea
                  value={usageData.reason}
                  onChange={(e) => setUsageData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="e.g., Packaging for customer order #123"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Usage Type
                </label>
                <select
                  value={usageData.usageType}
                  onChange={(e) => setUsageData(prev => ({ ...prev, usageType: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="INITIAL_STOCK">Initial Stock</option>
                  <option value="RESTOCK">Restock</option>
                  <option value="FEEDING">Feeding</option>
                  <option value="PLANTING">Planting</option>
                  <option value="SALES">Sales</option>
                  <option value="WASTE">Waste</option>
                  <option value="TRANSFER">Transfer</option>
                  <option value="ADJUSTMENT">Adjustment</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Related Entity
                </label>
                <input
                  type="text"
                  value={usageData.relatedEntity}
                  onChange={(e) => setUsageData(prev => ({ ...prev, relatedEntity: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Customer name, field, animal, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reference ID
                </label>
                <input
                  type="text"
                  value={usageData.relatedEntityId}
                  onChange={(e) => setUsageData(prev => ({ ...prev, relatedEntityId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Order #, Job ID, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={usageData.location}
                  onChange={(e) => setUsageData(prev => ({ ...prev, location: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Where the usage occurred"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowUsageModal(false);
                  setItemToUse(null);
                  setUsageData({
                    quantityChange: '',
                    reason: '',
                    usageType: 'OTHER',
                    relatedEntity: '',
                    relatedEntityId: '',
                    location: ''
                  });
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordUsage}
                disabled={!usageData.quantityChange || !usageData.reason}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Record Usage
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

      {/* View Item Modal */}
      {showViewItemModal && itemToView && (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 px-8 py-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-white/20 dark:bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Item Details</h2>
                    <p className="text-blue-100 text-sm">Complete inventory information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowViewItemModal(false)}
                  className="w-10 h-10 bg-white/20 dark:bg-white/10 rounded-lg flex items-center justify-center hover:bg-white/30 dark:hover:bg-white/20 transition-all backdrop-blur-sm group"
                >
                  <svg className="w-5 h-5 text-white group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-8 py-6">
              {/* Item Header Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700/50 dark:to-gray-800/50 rounded-xl p-6 mb-6 border border-gray-200 dark:border-gray-700">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{itemToView.name}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                      <span className="flex items-center">
                        <Package className="w-4 h-4 mr-1" />
                        {getCategoryName(itemToView.categoryId)}
                      </span>
                      <span className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        Created {new Date(itemToView.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full border ${getStockStatus(itemToView).color}`}>
                      {getStockStatus(itemToView).label}
                    </span>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">
                        {formatNumber(itemToView.quantity)}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{itemToView.unit || 'pieces'}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-600 dark:text-green-400">Unit Price</p>
                      <p className="text-xl font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(itemToView.pricePerUnit || 0)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-green-100 dark:bg-green-800/30 rounded-lg flex items-center justify-center">
                      <span className="text-green-600 dark:text-green-400">₦</span>
                    </div>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Total Value</p>
                      <p className="text-xl font-bold text-blue-900 dark:text-blue-100">
                        {formatCurrency(calculateItemValue(itemToView))}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-800/30 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-orange-600 dark:text-orange-400">Min Stock</p>
                      <p className="text-xl font-bold text-orange-900 dark:text-orange-100">
                        {formatNumber(itemToView.minimumStock || 0)}
                      </p>
                    </div>
                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-800/30 rounded-lg flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Metadata Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                      Additional Information
                    </h4>
                  </div>
                  <div className="p-4 space-y-4">
                    {itemToView.metadata?.notes && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Notes</label>
                        <p className="mt-1 text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3 text-sm">
                          {itemToView.metadata.notes}
                        </p>
                      </div>
                    )}
                    {itemToView.metadata?.location && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</label>
                        <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                          <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                          {itemToView.metadata.location}
                        </p>
                      </div>
                    )}
                    {itemToView.metadata?.supplier && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Supplier</label>
                        <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                          <User className="w-4 h-4 mr-2 text-gray-400" />
                          {itemToView.metadata.supplier}
                        </p>
                      </div>
                    )}
                    {itemToView.metadata?.purchaseDate && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Purchase Date</label>
                        <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(itemToView.metadata.purchaseDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                    {itemToView.metadata?.expiryDate && (
                      <div>
                        <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Expiry Date</label>
                        <p className="mt-1 text-gray-900 dark:text-white flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-gray-400" />
                          {new Date(itemToView.metadata.expiryDate).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric' 
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timeline Section */}
                <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                  <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h4 className="font-semibold text-gray-900 dark:text-white flex items-center">
                      <Clock className="w-4 h-4 mr-2 text-gray-600 dark:text-gray-400" />
                      Timeline
                    </h4>
                  </div>
                  <div className="p-4 space-y-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-green-100 dark:bg-green-800/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Created</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(itemToView.createdAt).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-800/30 rounded-full flex items-center justify-center flex-shrink-0">
                        <Edit2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">Last Updated</p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          {new Date(itemToView.updatedAt).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric', 
                            month: 'long', 
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 dark:bg-gray-700/50 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Item ID: #{itemToView.id}
                </p>
                <button
                  onClick={() => setShowViewItemModal(false)}
                  className="px-6 py-2 bg-gray-900 dark:bg-gray-100 text-white dark:text-gray-900 rounded-lg hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryModernNew;
