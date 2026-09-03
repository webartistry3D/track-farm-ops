import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { formatCurrency, formatCompactCurrency } from '../utils/currency';
import RestrictedPageMessage from './RestrictedPageMessage';
import { useSubscriptionRestrictions } from '../utils/subscriptionRestrictions';
import { Search, Plus, Edit2, Trash2, Wrench, AlertTriangle, TrendingUp, Clock, MapPin, User, QrCode, FileText, BarChart3, CheckCircle } from 'lucide-react';
import api from '../lib/api';
import { 
  AssetsSkeleton
} from './EnhancedSkeletons';

interface Asset {
  id: string;
  name: string;
  description: string;
  category: 'machinery' | 'tools' | 'vehicles' | 'infrastructure' | 'irrigation_power' | 'livestock' | 'land_improvements';
  subcategory: string;
  purchaseDate: string;
  supplier: string;
  cost: number;
  warrantyPeriod: string;
  expectedLifespan: number;
  depreciationMethod: 'straight_line' | 'declining_balance' | 'units_of_production';
  currentCondition: 'excellent' | 'good' | 'fair' | 'poor';
  location: string;
  assignedWorker: string;
  status: 'planned' | 'ordered' | 'received' | 'active' | 'under_maintenance' | 'damaged' | 'stolen' | 'retired' | 'sold';
  model?: string;
  serialNumber?: string;
  powerRating?: string;
  capacity?: string;
  fuelType?: string;
  maintenanceInterval?: string;
}

interface MaintenanceRecord {
  id: string;
  assetId: string;
  serviceDate: string;
  technician: string;
  partsReplaced: string;
  cost: number;
  downtime: number;
  nextDueDate: string;
}

interface IncidentReport {
  id: string;
  assetId: string;
  operator: string;
  time: string;
  description: string;
  photos: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  estimatedRepairCost: number;
}

const Assets = () => {
  const { user } = useAuth();
  const location = useLocation();

  // Scroll to top when navigating to Assets page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  if (!user) {
    return <div>Please log in to access assets.</div>;
  }

  // Check subscription access and role
  const restrictions = useSubscriptionRestrictions();
  const hasSubscriptionAccess = restrictions.canAccessFeature('inventoryTransactions');
  const isOwnerOrManager = user && (user.role === 'OWNER' || user.role === 'MANAGER' || user.role === 'INVENTORY');
  
  if (!hasSubscriptionAccess && !isOwnerOrManager) {
    return (
      <RestrictedPageMessage
        feature="inventoryTransactions"
        title="Asset Management"
        description="Complete asset tracking, maintenance scheduling, and equipment management for your farm operations."
        icon="🚜"
      />
    );
  }

  const isOwner = user.role === 'OWNER' || user.role === 'MANAGER' || user.role === 'ACCOUNTANT' || user.role === 'INVENTORY';

  if (!isOwner) {
    return (
      <div className="bg-yellow-50 dark:bg-gray-800 border border-yellow-200 dark:border-yellow-700 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
        <p className="text-yellow-700">
          Asset management is only available to farm owners, managers, accountants, and inventory managers.
        </p>
      </div>
    );
  }

  // State for real data integration
  const [assets, setAssets] = useState<Asset[]>([]);
  const [filteredAssets, setFilteredAssets] = useState<Asset[]>([]);
  const [maintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [incidentReports] = useState<IncidentReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showScheduleMaintenanceModal, setShowScheduleMaintenanceModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'downtime' | 'incidents' | 'analytics'>('overview');
  const [_error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<Asset>>({
    name: '',
    description: '',
    category: 'machinery',
    location: '',
    cost: 0,
    purchaseDate: '',
    supplier: '',
    status: 'planned'
  });

  // Helper function to format cost input with thousand separators
  const formatCostInput = (value: number): string => {
    if (isNaN(value) || value === 0) return '';
    return value.toLocaleString('en-US');
  };

  // Helper function to parse formatted cost input back to number
  const parseCostInput = (value: string): number => {
    // Remove all non-numeric characters except decimal point and minus sign
    const cleanValue = value.replace(/[^\d.-]/g, '');
    const parsed = parseFloat(cleanValue);
    return isNaN(parsed) ? 0 : parsed;
  };

  // CRUD Operations
  const handleCreateAsset = async (assetData: Partial<Asset>) => {
    try {
      setIsSubmitting(true);
      
      // Check subscription limits for asset creation
      if (!restrictions.canCreateMoreAssets(assets.length)) {
        setError(`You've reached your limit of ${restrictions.getAssetItemCreateLimit()} assets. Upgrade your plan to create more assets.`);
        setIsSubmitting(false);
        return;
      }

      // Prepare complete asset data with default values for missing fields
      const completeAssetData = {
        ...assetData,
        subcategory: assetData.subcategory || 'general',
        purchaseDate: assetData.purchaseDate || new Date().toISOString().split('T')[0],
        supplier: assetData.supplier || 'Unknown',
        warrantyPeriod: assetData.warrantyPeriod || '1 year',
        expectedLifespan: assetData.expectedLifespan || 5,
        depreciationMethod: assetData.depreciationMethod || 'straight_line',
        currentCondition: assetData.currentCondition || 'good',
        assignedWorker: assetData.assignedWorker || 'Unassigned',
        status: assetData.status || 'planned'
      };

      console.log('Creating asset with data:', completeAssetData);
      
      const response = await api.post('/assets', completeAssetData);
      const newAsset = response.data;
      
      console.log('Asset created successfully:', newAsset);
      
      // Refetch assets to ensure we have the latest data
      await refetchAssets();
      
      setShowAddModal(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'machinery',
        location: '',
        cost: 0,
        purchaseDate: '',
        supplier: '',
        status: 'planned'
      });
      
      setError(null);
      
      // Show success modal
      setSuccessMessage('Asset created successfully!');
      setShowSuccessModal(true);
      
    } catch (err: any) {
      console.error('Error creating asset:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to create asset';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name?.trim()) {
      alert('Please enter an asset name');
      return;
    }
    
    if (!formData.location?.trim()) {
      alert('Please enter a location');
      return;
    }
    
    if (!formData.cost || formData.cost <= 0) {
      alert('Please enter a valid cost');
      return;
    }
    
    handleCreateAsset(formData);
  };

  const handleInputChange = (field: keyof Asset, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleUpdateAsset = async (assetData: Partial<Asset>) => {
    if (!selectedAsset) return;
    
    try {
      setIsSubmitting(true);
      
      // Prepare complete asset data with default values for missing fields
      const completeAssetData = {
        ...assetData,
        subcategory: assetData.subcategory || 'general',
        purchaseDate: assetData.purchaseDate || new Date().toISOString().split('T')[0],
        supplier: assetData.supplier || 'Unknown',
        warrantyPeriod: assetData.warrantyPeriod || '1 year',
        expectedLifespan: assetData.expectedLifespan || 5,
        depreciationMethod: assetData.depreciationMethod || 'straight_line',
        currentCondition: assetData.currentCondition || 'good',
        assignedWorker: assetData.assignedWorker || 'Unassigned',
        status: assetData.status || 'planned'
      };

      console.log('Updating asset with data:', completeAssetData);
      
      const response = await api.put(`/assets/${selectedAsset.id}`, completeAssetData);
      const updatedAsset = response.data;
      
      console.log('Asset updated successfully:', updatedAsset);
      
      // Update the asset in the local state
      setAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id ? { ...asset, ...updatedAsset } : asset
      ));
      setFilteredAssets(prev => prev.map(asset => 
        asset.id === selectedAsset.id ? { ...asset, ...updatedAsset } : asset
      ));
      
      setShowEditModal(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        category: 'machinery',
        location: '',
        cost: 0,
        purchaseDate: '',
        supplier: '',
        status: 'planned'
      });
      
      setError(null);
      
      // Show success modal
      setSuccessMessage('Asset updated successfully!');
      setShowSuccessModal(true);
      
    } catch (err: any) {
      console.error('Error updating asset:', err);
      const errorMessage = err.response?.data?.error || err.message || 'Failed to update asset';
      setError(errorMessage);
      alert(`Error: ${errorMessage}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setFormData(asset);
    setShowEditModal(true);
    setShowDetailsModal(false);
  };

  const handleDeleteAsset = async (asset: Asset) => {
    setSelectedAsset(asset);
    setShowDeleteModal(true);
  };

  const confirmDeleteAsset = async () => {
    if (!selectedAsset) return;
    
    try {
      await api.delete(`/assets/${selectedAsset.id}`);
      setAssets(prev => prev.filter(asset => asset.id !== selectedAsset.id));
      setFilteredAssets(prev => prev.filter(asset => asset.id !== selectedAsset.id));
      setShowDetailsModal(false);
      setShowDeleteModal(false);
      setError(null);
    } catch (err: any) {
      console.error('Error deleting asset:', err);
      setError(err.response?.data?.error || 'Failed to delete asset');
    }
  };

  // Initialize with empty data - ready for API integration
  useEffect(() => {
    const fetchAssets = async () => {
      try {
        setLoading(true);
        
        // DATABASE-ONLY APPROACH: Get assets from database
        const response = await api.get('/assets');
        const assetsData = response.data || [];
        
        console.log('🏗 Assets loaded from database:', assetsData);
        
        setAssets(assetsData);
        setFilteredAssets(assetsData);
      } catch (error) {
        console.error('Failed to fetch assets:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchAssets();
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  // Refetch assets function
  const refetchAssets = async () => {
    try {
      setLoading(true);
      const response = await api.get('/assets');
      const data = response.data;
      setAssets(data);
      setFilteredAssets(data);
      console.log('Assets refetched successfully:', data);
    } catch (err: any) {
      console.error('Error refetching assets:', err);
      setError(err.response?.data?.error || 'Failed to fetch assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = assets;

    if (searchTerm) {
      filtered = filtered.filter(asset =>
        asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        asset.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(asset => asset.category === selectedCategory);
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(asset => asset.status === selectedStatus);
    }

    setFilteredAssets(filtered);
  }, [assets, searchTerm, selectedCategory, selectedStatus]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned': return 'bg-purple-100 text-purple-800';
      case 'ordered': return 'bg-indigo-100 text-indigo-800';
      case 'received': return 'bg-teal-100 text-teal-800';
      case 'active': return 'bg-emerald-100 text-emerald-800';
      case 'under_maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'damaged': return 'bg-red-100 text-red-800';
      case 'stolen': return 'bg-red-200 text-red-900';
      case 'retired': return 'bg-gray-100 dark:bg-gray-700  border border-gray-200/60 dark:border-gray-600/30 text-gray-800';
      case 'sold': return 'bg-orange-100 text-orange-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'machinery': return '🚜';
      case 'tools': return '🔧';
      case 'vehicles': return '🚚';
      case 'infrastructure': return '🏗️';
      case 'irrigation_power': return '⚡';
      case 'livestock': return '🐄';
      case 'land_improvements': return '🌾';
      default: return '📦';
    }
  };

  // Show comprehensive skeleton while loading
  if (loading) {
    return <AssetsSkeleton />;
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      {/*<div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center py-4 space-y-4 sm:space-y-0">
            <div className="text-center sm:text-left">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">Asset Manager</h1>
              <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your farm's long-term resources and equipment</p>
            </div>
          </div>
        </div>
      </div>*/}

      {/* Stats Cards */}
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-0">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6 lg:mb-4">
          <div 
            onClick={() => {
              // Navigate to all assets view
              console.log('Total Assets clicked');
            }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 lg:p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="p-2 lg:p-3 bg-blue-100 dark:bg-blue-900/20  rounded-full">
                <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Total Assets</p>
                <p className="text-3xl font-jetbrains-mono font-bold text-gray-900 dark:text-white">{assets.length}</p>
              </div>
            </div>
          </div>
          
          <div 
            onClick={() => {
              // Navigate to active assets
              console.log('Active Assets clicked');
            }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 lg:p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="p-2 lg:p-3 bg-emerald-100 dark:bg-emerald-900/20  rounded-full">
                <Wrench className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Active</p>
                <p className="text-3xl font-jetbrains-mono font-bold text-gray-900 dark:text-white">
                  {assets.filter(a => a.status === 'active').length}
                </p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => {
              // Navigate to maintenance assets
              console.log('Maintenance Assets clicked');
            }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 lg:p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="p-2 lg:p-3 bg-yellow-100 dark:bg-yellow-900/20  rounded-full">
                <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Maintenance</p>
                <p className="text-3xl font-jetbrains-mono font-bold text-gray-900 dark:text-white">
                  {assets.filter(a => a.status === 'under_maintenance').length}
                </p>
              </div>
            </div>
          </div>

          <div 
            onClick={() => {
              // Navigate to assets with issues
              console.log('Asset Issues clicked');
            }}
            className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 lg:p-6 rounded-lg shadow-lg cursor-pointer hover:shadow-xl transition-all duration-300"
          >
            <div className="flex items-center">
              <div className="p-2 lg:p-3 bg-red-100 dark:bg-red-900/20  rounded-full">
                <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
              </div>
              <div className="ml-3 lg:ml-4">
                <p className="text-xs lg:text-sm text-gray-500 dark:text-gray-400">Issues</p>
                <p className="text-3xl font-jetbrains-mono font-bold text-gray-900 dark:text-white">
                  {assets.filter(a => a.status === 'damaged').length}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col space-y-4 sm:space-y-0 sm:flex-row sm:flex-wrap sm:gap-4 sm:items-center">
            <div className="w-full sm:flex-1 sm:min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search assets..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:gap-4 space-y-2 sm:space-y-0 w-full sm:w-auto">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Categories</option>
                <option value="machinery">Machinery & Equipment</option>
                <option value="tools">Tools</option>
                <option value="vehicles">Vehicles</option>
                <option value="infrastructure">Infrastructure</option>
                <option value="irrigation_power">Irrigation & Power</option>
                <option value="livestock">Livestock Assets</option>
                <option value="land_improvements">Land & Improvements</option>
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="w-full sm:w-auto px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="planned">Planned</option>
                <option value="ordered">Ordered</option>
                <option value="received">Received</option>
                <option value="active">Active</option>
                <option value="under_maintenance">Under Maintenance</option>
                <option value="damaged">Damaged</option>
                <option value="stolen">Stolen</option>
                <option value="retired">Retired</option>
                <option value="sold">Sold</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-2 mb-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex overflow-x-auto justify-between">
            <div className="flex overflow-x-auto space-x-2">
              {['overview', 'downtime', 'incidents', 'analytics'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as any)}
                  className={`py-2 px-4 rounded-lg font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 transition-all duration-200 ${
                    activeTab === tab
                      ? 'bg-emerald-500 text-white  shadow-sm'
                      : 'bg-white dark:bg-gray-800  text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white px-3 sm:px-4 py-1 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors text-sm sm:text-base ml-4 flex-shrink-0 h-full mt-3"
            >
              <Plus className="w-4 h-4" />
              <span>Asset</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-0 sm:px-0 lg:px-0 py-6">
        {activeTab === 'overview' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6">
            {/* Assets Grid */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[700px] w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-white dark:bg-gray-800 ">
                    <tr>
                      <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                      <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Category</th>
                      <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Location</th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Created By</th>
                      <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="hidden lg:table-cell px-3 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Last Update</th>
                      <th className="px-2 sm:px-3 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredAssets.map((asset) => (
                      <tr 
                        key={asset.id}
                        onClick={() => {
                          // Handle asset click - could open details modal or navigate to asset details
                          console.log('Asset clicked:', asset.name);
                        }}
                        className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer"
                      >
                        <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg sm:text-xl mr-2 sm:mr-3">{getCategoryIcon(asset.category)}</span>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-medium text-gray-900 dark:text-white truncate">{asset.name}</div>
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">{asset.model}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                          <span className="text-xs sm:text-sm text-gray-900 dark:text-white">{asset.subcategory.replace('_', ' ')}</span>
                        </td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <span className="font-medium text-xs sm:text-sm">{formatCurrency(asset.cost)}</span>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            {/*<MapPin className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />*/}
                            {asset.location}
                          </div>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            {/*<User className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />*/}
                            {user?.name || user?.email || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            {/*<Calendar className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />*/}
                            <span className="text-xs sm:text-sm">{asset.purchaseDate ? new Date(asset.purchaseDate).toLocaleDateString() : 'N/A'}</span>
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(asset.status)}`}>
                            {asset.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="hidden lg:table-cell px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                          <div className="flex items-center">
                            {/*<Edit2 className="w-4 h-4 mr-1 text-gray-400 dark:text-gray-500" />*/}
                            {user?.name || user?.email || 'Unknown'}
                          </div>
                        </td>
                        <td className="px-2 sm:px-3 py-3 sm:py-4 whitespace-nowrap text-sm font-medium text-left">
                          <div className="flex space-x-1 sm:space-x-2">
                            <button
                              onClick={() => {
                                setSelectedAsset(asset);
                                setShowDetailsModal(true);
                              }}
                              className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 p-1"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleEditAsset(asset)}
                              className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 p-1"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={() => handleDeleteAsset(asset)}
                              className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'downtime' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 space-y-6">
            

            {/* Maintenance Schedule */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance Schedule</h3>
              {assets.filter(a => a.status === 'active').length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No active assets scheduled for maintenance</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {assets.filter(a => a.status === 'active').map((asset) => (
                    <div key={asset.id} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 space-y-2 sm:space-y-0">
                        <h4 className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">{asset.name}</h4>
                        <span className="text-sm text-emerald-600 dark:text-emerald-400 font-medium whitespace-nowrap">Schedule</span>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                        <div className="flex justify-between">
                          <span className="text-xs">Last Service:</span>
                          <span className="text-xs">--</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Interval:</span>
                          <span className="text-xs truncate">{asset.maintenanceInterval || 'Not set'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-xs">Technician:</span>
                          <span className="text-xs truncate">{asset.assignedWorker || 'Not assigned'}</span>
                        </div>
                      </div>
                      <div className="mt-3">
                        <button className="w-full bg-emerald-600 text-white py-2 rounded hover:bg-emerald-700 transition-colors text-sm">
                          Schedule Maintenance
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Maintenance Header with Action Button */}
            <div className="flex justify-end">
              <button 
                onClick={() => setShowScheduleMaintenanceModal(true)}
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-emerald-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Schedule Maintenance
              </button>
            </div>

            {/* Recent Maintenance Records */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Maintenance Records</h3>
              {maintenanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No maintenance records found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-white dark:bg-gray-800 ">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Technician</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Cost</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Next Due</th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                      {maintenanceRecords.map((record) => {
                        const asset = assets.find(a => a.id === record.assetId);
                        return (
                          <tr key={record.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">{asset ? getCategoryIcon(asset.category) : '📦'}</span>
                                {asset?.name || 'Unknown Asset'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{record.serviceDate}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{record.technician}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600 dark:text-emerald-400">{formatCurrency(record.cost)}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{record.nextDueDate}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'incidents' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 space-y-6">
            {/* Incident Reporting Form */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Report New Incident</h3>
              <div className="space-y-6">
                {/* Row 1: Asset, Severity, Date, Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asset *</label>
                    <select className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      <option value="">Select Asset</option>
                      {assets.filter(a => a.status === 'active' || a.status === 'damaged').map((asset) => (
                        <option key={asset.id} value={asset.id}>{asset.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Severity *</label>
                    <select className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      <option value="">Select severity...</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                      <option value="critical">Critical</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Incident Date *</label>
                    <input
                      type="date"
                      className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Incident Time *</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Row 2: Operator, Location, Repair Cost, Priority */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Operator *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter operator name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Incident location"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Est. Repair Cost (₦)</label>
                    <input
                      type="number"
                      className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="₦0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority</label>
                    <select className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      <option value="">Select priority...</option>
                      <option value="low">Low</option>
                      <option value="medium" selected>Medium</option>
                      <option value="high">High</option>
                      <option value="urgent">Urgent</option>
                    </select>
                  </div>
                </div>

                {/* Row 3: Description and Actions Taken (2 columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Incident Description *</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Describe the incident in detail..."
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Actions Taken</label>
                    <textarea
                      rows={4}
                      className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Immediate actions taken..."
                    ></textarea>
                  </div>
                </div>

                {/* Row 4: Witnesses and Follow-up (2 columns) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Witnesses</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                      placeholder="Names of witnesses (if any)"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Follow-up Required</label>
                    <select className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white">
                      <option value="">Select follow-up...</option>
                      <option value="immediate">Immediate</option>
                      <option value="within_24h">Within 24 hours</option>
                      <option value="within_48h">Within 48 hours</option>
                      <option value="within_week">Within 1 week</option>
                      <option value="no_followup">No follow-up needed</option>
                    </select>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900">
                  Cancel
                </button>
                <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                  Report Incident
                </button>
              </div>
            </div>

            {/* Recent Incidents */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Incidents</h3>
              {incidentReports.length === 0 ? (
                <div className="text-center py-8">
                  <AlertTriangle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No incident reports found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-white dark:bg-gray-800 ">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Operator</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Est. Cost</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                      {incidentReports.map((incident) => {
                        const asset = assets.find(a => a.id === incident.assetId);
                        return (
                          <tr key={incident.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className="text-2xl mr-3">{asset ? getCategoryIcon(asset.category) : '�'}</span>
                                {asset?.name || 'Unknown Asset'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{incident.operator}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{incident.time}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{incident.description}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                incident.severity === 'critical' ? 'bg-red-100 text-red-800' :
                                incident.severity === 'high' ? 'bg-red-100 text-red-800' :
                                incident.severity === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-emerald-100 text-emerald-800'
                              }`}>
                                {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-red-600 dark:text-red-400">{formatCurrency(incident.estimatedRepairCost)}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                Open
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 space-y-6">
            {/* Key Performance Indicators */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 lg:p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="p-2 lg:p-3 bg-blue-100 dark:bg-blue-900">
                    <TrendingUp className="w-5 h-5 lg:w-6 lg:h-6 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Asset Utilization</p>
                    <p className="hidden sm:block"><br></br></p>
                    <p className="text-3xl font-jetbrains-mono font-bold text-gray-900 dark:text-white">--</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 lg:p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="p-2 lg:p-3 bg-emerald-100 dark:bg-emerald-900">
                    <BarChart3 className="w-5 h-5 lg:w-6 lg:h-6 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Cost Ops. / Hour</p>
                    <p className="hidden sm:block"><br></br></p>
                    <p className="text-3xl font-jetbrains-mono font-bold text-gray-900 dark:text-white">--</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 lg:p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="p-2 lg:p-3 bg-yellow-100 dark:bg-yellow-900">
                    <Clock className="w-5 h-5 lg:w-6 lg:h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Downtime</p>
                    <p className="hidden sm:block"><br></br></p>
                    <p className="text-3xl font-jetbrains-mono font-bold text-gray-900 dark:text-white">--</p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 p-4 lg:p-6 rounded-lg shadow-lg">
                <div className="flex items-center">
                  <div className="p-2 lg:p-3 bg-red-100 dark:bg-red-900">
                    <AlertTriangle className="w-5 h-5 lg:w-6 lg:h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="ml-3 lg:ml-4">
                    <p className="text-xs lg:text-sm font-medium text-gray-600 dark:text-gray-400">Maintenance</p>
                    <p className="hidden sm:block"><br></br></p>
                    <p className="text-3xl font-jetbrains-mono font-bold text-emerald-600 dark:text-emerald-400">--</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Asset Utilization Chart */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset Utilization by Category</h3>
              {assets.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No assets available for analysis</p>
                </div>
              ) : (
                <div className="h-64">
                  <div className="h-full flex items-end space-x-2">
                    {(() => {
                      // Calculate asset utilization by category
                      const categoryData = [
                        { name: 'Machinery', color: 'blue', assets: assets.filter(a => a.category === 'machinery') },
                        { name: 'Vehicles', color: 'green', assets: assets.filter(a => a.category === 'vehicles') },
                        { name: 'Infrastructure', color: 'yellow', assets: assets.filter(a => a.category === 'infrastructure') },
                        { name: 'Tools', color: 'purple', assets: assets.filter(a => a.category === 'tools') },
                        { name: 'Irrigation', color: 'indigo', assets: assets.filter(a => a.category === 'irrigation_power') },
                        { name: 'Livestock', color: 'orange', assets: assets.filter(a => a.category === 'livestock') }
                      ].filter(cat => cat.assets.length > 0);

                      // Calculate utilization percentage for each category
                      const maxUtilization = Math.max(...categoryData.map(cat => cat.assets.length));
                      
                      return categoryData.map((category) => {
                        const utilization = maxUtilization > 0 ? (category.assets.length / maxUtilization) * 100 : 0;
                        const heightPercent = Math.max(utilization, 10); // Minimum 10% height for visibility
                        
                        return (
                          <div key={category.name} className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-t-lg relative">
                            <div className="absolute bottom-0 left-0 right-0 p-2 text-center text-xs text-gray-600 dark:text-gray-400 font-medium">
                              {category.name}
                            </div>
                            <div 
                              className={`bg-${category.color}-500 dark:bg-${category.color}-600 h-48 rounded-t-lg transition-all duration-500 ease-out`}
                              style={{ height: `${heightPercent}%` }}
                            >
                              <div className="absolute top-2 left-0 right-0 text-center">
                                <span className="text-xs font-bold text-white">
                                  {category.assets.length}
                                </span>
                              </div>
                            </div>
                            <div className="absolute -bottom-6 left-0 right-0 text-center">
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {utilization.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-8 flex flex-wrap justify-center gap-4">
                    {[
                      { name: 'Machinery', color: 'bg-blue-500' },
                      { name: 'Vehicles', color: 'bg-emerald-500' },
                      { name: 'Infrastructure', color: 'bg-yellow-500' },
                      { name: 'Tools', color: 'bg-purple-500' },
                      { name: 'Irrigation', color: 'bg-indigo-500' },
                      { name: 'Livestock', color: 'bg-orange-500' }
                    ].map((item) => (
                      <div key={item.name} className="flex items-center space-x-2">
                        <div className={`w-3 h-3 ${item.color} rounded-full`}></div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">{item.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Maintenance Cost Trends */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Maintenance Cost Trends (Last 12 Months)</h3>
              {(
                <div className="h-64">
                  <div className="h-full flex items-end space-x-1">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month) => (
                      <div key={month} className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-2">{month}</div>
                        <div className="flex-1 bg-gray-200 rounded relative">
                          <div 
                            className="bg-emerald-500 rounded-t" 
                            style={{height: '0%'}}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Top Assets by Cost */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Assets by Maintenance Cost</h3>
              {assets.length === 0 ? (
                <div className="text-center py-8">
                  <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No assets available for ranking</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {assets.slice(0, 4).map((asset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800  border border-gray-200 dark:border-gray-700 rounded-lg">
                      <div className="flex items-center">
                        <span className="text-lg font-medium text-gray-900 dark:text-white">{index + 1}. {asset.name}</span>
                        <span className="ml-2 text-sm text-gray-600 dark:text-gray-400">({asset.category})</span>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCompactCurrency(asset.cost)}</p>
                        <div className="w-24 bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-emerald-500 h-2 rounded-full" 
                            style={{width: '0%'}}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Asset ROI Analysis */}
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Asset ROI Analysis</h3>
              {assets.length === 0 ? (
                <div className="text-center py-8">
                  <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No assets available for ROI analysis</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-white dark:bg-gray-800 ">
                      <tr>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Asset</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Acquisition Cost</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Total Maintenance</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Operating Revenue</th>
                        <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-200 dark:divide-gray-700">
                      {assets.slice(0, 2).map((asset) => (
                        <tr key={asset.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{asset.name}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{formatCurrency(asset.cost)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">--</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">--</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-white dark:bg-gray-800  border border-gray-200 dark:border-gray-700 text-gray-800">
                              Calculating...
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Add New Asset</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-400"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleFormSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asset Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter asset name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                <select 
                  required
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="machinery">Machinery & Equipment</option>
                  <option value="tools">Tools</option>
                  <option value="vehicles">Vehicles</option>
                  <option value="infrastructure">Infrastructure</option>
                  <option value="irrigation_power">Irrigation & Power</option>
                  <option value="livestock">Livestock</option>
                  <option value="land_improvements">Land Improvements</option>
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter asset description"
                  rows={3}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter location"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost</label>
                <input
                  type="text"
                  value={formatCostInput(formData.cost || 0)}
                  onChange={(e) => handleInputChange('cost', parseCostInput(e.target.value))}
                  className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="0.00"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  {formData.cost ? `Value: ${formatCurrency(formData.cost.toString())}` : 'Enter cost amount'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purchase Date</label>
                <input
                  type="date"
                  value={formData.purchaseDate || ''}
                  onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                  className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supplier</label>
                <input
                  type="text"
                  value={formData.supplier || ''}
                  onChange={(e) => handleInputChange('supplier', e.target.value)}
                  className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Enter supplier name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select 
                  value={formData.status}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                >
                  <option value="planned">Planned</option>
                  <option value="ordered">Ordered</option>
                  <option value="received">Received</option>
                  <option value="active">Active</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="damaged">Damaged</option>
                  <option value="stolen">Stolen</option>
                  <option value="retired">Retired</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
            
            <div className="mt-6 flex justify-end space-x-3 md:col-span-2">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Adding Asset...
                  </>
                ) : (
                  'Add Asset'
                )}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset Details Modal */}
      {showDetailsModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-5xl w-full mx-4 max-h-screen overflow-y-auto">
            {/* Header */}
            <div className="bg-emerald-500/80 dark:bg-emerald-600/80 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-white/20  rounded-full flex items-center justify-center">
                    <span className="text-2xl">{getCategoryIcon(selectedAsset.category)}</span>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white">Asset Details</h2>
                    <p className="text-emerald-100 text-sm">Complete asset information and management</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Asset Overview Card */}
              <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-white dark:bg-gray-900 rounded-xl shadow-lg flex items-center justify-center">
                      <span className="text-3xl">{getCategoryIcon(selectedAsset.category)}</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{selectedAsset.name}</h3>
                      <p className="text-gray-600 dark:text-gray-400 mt-1">{selectedAsset.description}</p>
                      <div className="flex items-center space-x-3 mt-2">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedAsset.status)}`}>
                          {selectedAsset.status.replace('_', ' ')}
                        </span>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {selectedAsset.category.replace('_', ' ').charAt(0).toUpperCase() + selectedAsset.category.slice(1).replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-2">
                    <div className="text-right">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Asset Value</p>
                      <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(selectedAsset.cost.toString(), { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Information Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Basic Information Card */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="bg-white dark:bg-gray-800  px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <FileText className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        Basic Information
                      </h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Asset ID</label>
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedAsset.id}</p>
                            <QrCode className="w-4 h-4 text-gray-400 cursor-pointer hover:text-emerald-600 dark:text-gray-500 hover:text-emerald-400 transition-colors" />
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Location</label>
                          <div className="flex items-center space-x-2">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.location}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Assigned Worker</label>
                          <div className="flex items-center space-x-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.assignedWorker}</p>
                          </div>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Condition</label>
                          <p className="text-sm text-gray-900 dark:text-white capitalize">{selectedAsset.currentCondition?.replace('_', ' ')}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Technical Details Card */}
                  {(selectedAsset.model || selectedAsset.serialNumber || selectedAsset.powerRating || selectedAsset.capacity) && (
                    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                      <div className="bg-white dark:bg-gray-800  px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                          <Wrench className="w-5 h-5 mr-2 text-blue-600 dark:text-blue-400" />
                          Technical Details
                        </h4>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedAsset.model && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Model</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.model}</p>
                            </div>
                          )}
                          {selectedAsset.serialNumber && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Serial Number</label>
                              <p className="text-sm font-mono text-gray-900 dark:text-white">{selectedAsset.serialNumber}</p>
                            </div>
                          )}
                          {selectedAsset.powerRating && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Power Rating</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.powerRating}</p>
                            </div>
                          )}
                          {selectedAsset.capacity && (
                            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                              <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Capacity</label>
                              <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.capacity}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Financial Information Card */}
                <div className="space-y-4">
                  <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden">
                    <div className="bg-white dark:bg-gray-800  px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                        Financial Information
                      </h4>
                    </div>
                    <div className="p-4 space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-200 dark:border-emerald-800">
                          <label className="block text-xs font-medium text-emerald-600 dark:text-emerald-400 mb-1">Purchase Cost</label>
                          <p className="text-2xl font-bold text-emerald-700 dark:text-emerald-300">{formatCurrency(selectedAsset.cost.toString(), { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Purchase Date</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.purchaseDate}</p>
                        </div>
                      </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Supplier</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.supplier}</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Warranty Period</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.warrantyPeriod}</p>
                        </div>
                        
                        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3">
                          <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Expected Lifespan</label>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedAsset.expectedLifespan} years</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="bg-gray-50 dark:bg-gray-900 px-6 py-4 rounded-b-xl border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
                <button 
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
                >
                  Close
                </button>
                <button 
                  onClick={() => handleEditAsset(selectedAsset)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Asset
                </button>
                {user?.role !== 'WORKER' && (
                  <button
                    onClick={() => selectedAsset && handleDeleteAsset(selectedAsset)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Asset
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Maintenance Modal */}
      {showScheduleMaintenanceModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4 sm:p-6 max-w-6xl w-full max-h-screen overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white">Schedule Maintenance</h2>
              <button
                onClick={() => setShowScheduleMaintenanceModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:text-gray-400 text-2xl sm:text-xl"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Row 1: Asset Selection, Maintenance Type, Date, Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Select Asset *</label>
                  <select className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base">
                    <option value="">Choose an asset...</option>
                    {assets.filter(a => a.status === 'active').map((asset) => (
                      <option key={asset.id} value={asset.id}>
                        {asset.name} - {asset.category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maintenance Type *</label>
                  <select className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base">
                    <option value="">Select maintenance type...</option>
                    <option value="routine">Routine Maintenance</option>
                    <option value="preventive">Preventive Maintenance</option>
                    <option value="corrective">Corrective Maintenance</option>
                    <option value="emergency">Emergency Repair</option>
                    <option value="inspection">Inspection</option>
                    <option value="upgrade">Upgrade/Modification</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scheduled Date *</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Scheduled Time *</label>
                  <input
                    type="time"
                    className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                  />
                </div>
              </div>

              {/* Row 2: Duration, Technician, Cost, Priority */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Duration (hours) *</label>
                  <select className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base">
                    <option value="">Select duration...</option>
                    <option value="1">1 hour</option>
                    <option value="2">2 hours</option>
                    <option value="4">4 hours</option>
                    <option value="8">8 hours (Full day)</option>
                    <option value="16">16 hours (2 days)</option>
                    <option value="24">24+ hours (Multiple days)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Assigned Technician</label>
                  <select className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base">
                    <option value="">Select technician...</option>
                    <option value="internal">Internal Maintenance Team</option>
                    <option value="external">External Service Provider</option>
                    <option value="vendor">Authorized Vendor</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Estimated Cost (₦)</label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Priority Level</label>
                  <select className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base">
                    <option value="">Select priority...</option>
                    <option value="low">Low</option>
                    <option value="medium" selected>Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>
              </div>

              {/* Description and Materials */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Maintenance Description</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    placeholder="Describe the maintenance work to be performed..."
                  ></textarea>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Required Parts/Materials</label>
                  <textarea
                    rows={4}
                    className="w-full px-3 py-2 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white text-sm sm:text-base"
                    placeholder="List any parts, tools, or materials needed..."
                  ></textarea>
                </div>
              </div>

              {/* Notifications */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Notification Settings</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Email notification to asset operator</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    <span className="text-sm text-gray-700 dark:text-gray-300">SMS reminder 24 hours before</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Notify farm manager</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row sm:justify-end sm:space-x-3 space-y-2 sm:space-y-0">
              <button
                onClick={() => setShowScheduleMaintenanceModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900 w-full sm:w-auto order-2 sm:order-1"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowScheduleMaintenanceModal(false)}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 w-full sm:w-auto order-1 sm:order-2"
              >
                Schedule Maintenance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/20  rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{successMessage || 'Success!'}</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                {successMessage === 'Asset created successfully!' 
                  ? 'Your new asset has been added to the system and is ready to use.'
                  : 'The asset has been updated successfully in the system.'
                }
              </p>
              <button
                onClick={() => setShowSuccessModal(false)}
                className="w-full bg-emerald-600 text-white px-4 py-2 rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-md w-full mx-4">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 bg-red-100 dark:bg-red-900/20  rounded-full mx-auto mb-4">
                <Trash2 className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white text-center mb-2">Delete Asset</h3>
              <p className="text-gray-600 dark:text-gray-400 text-center mb-6">
                Are you sure you want to delete <span className="font-semibold">{selectedAsset.name}</span>? This action cannot be undone.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="flex-1 px-4 py-2 bg-white dark:bg-gray-800  border border-gray-200 dark:border-gray-700 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeleteAsset}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete Asset
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Asset Modal */}
      {showEditModal && selectedAsset && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-screen overflow-y-auto">
            <div className="bg-blue-500/80 dark:bg-blue-600/80 px-6 py-4 rounded-t-xl">
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-white/20  rounded-full flex items-center justify-center">
                    <Edit2 className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Edit Asset</h2>
                    <p className="text-blue-100 text-sm">Update asset information</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-white/80 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            <form onSubmit={(e) => { e.preventDefault(); handleUpdateAsset(formData); }} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Asset Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Category *</label>
                  <select
                    required
                    value={formData.category || 'machinery'}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="machinery">Machinery & Equipment</option>
                    <option value="tools">Tools</option>
                    <option value="vehicles">Vehicles</option>
                    <option value="infrastructure">Infrastructure</option>
                    <option value="irrigation_power">Irrigation & Power</option>
                    <option value="livestock">Livestock Assets</option>
                    <option value="land_improvements">Land & Improvements</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Location *</label>
                  <input
                    type="text"
                    required
                    value={formData.location || ''}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Cost (₦) *</label>
                  <input
                    type="text"
                    required
                    value={formatCostInput(formData.cost || 0)}
                    onChange={(e) => handleInputChange('cost', parseCostInput(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="₦0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={formData.purchaseDate || ''}
                    onChange={(e) => handleInputChange('purchaseDate', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Supplier</label>
                  <input
                    type="text"
                    value={formData.supplier || ''}
                    onChange={(e) => handleInputChange('supplier', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                <textarea
                  rows={3}
                  value={formData.description || ''}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  placeholder="Enter asset description..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Status</label>
                <select
                  value={formData.status || 'planned'}
                  onChange={(e) => handleInputChange('status', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                >
                  <option value="planned">Planned</option>
                  <option value="ordered">Ordered</option>
                  <option value="received">Received</option>
                  <option value="active">Active</option>
                  <option value="under_maintenance">Under Maintenance</option>
                  <option value="damaged">Damaged</option>
                  <option value="stolen">Stolen</option>
                  <option value="retired">Retired</option>
                  <option value="sold">Sold</option>
                </select>
              </div>
              
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Updating Asset...
                    </>
                  ) : (
                    'Update Asset'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Assets;
