import { useState, useEffect } from 'react';
import api from '../lib/api';
import { 
  X, Package, Wheat, TreePine, Fish, Apple, Carrot, Beef, Egg, Milk,
  AlertCircle, CheckCircle, Loader2, Save, Eye, FolderOpen, FolderPlus,
  Settings
} from 'lucide-react';

// Format number with thousand separator while typing
const formatNumberWithSeparator = (value: any): string => {
  // Convert to string if not already
  const stringValue = value !== null && value !== undefined ? String(value) : '';
  
  // Return empty string if input is empty
  if (stringValue === '') return '';
  
  // Remove existing separators and non-numeric characters
  const cleanValue = stringValue.replace(/[^0-9.]/g, '');
  
  // Split into integer and decimal parts
  const parts = cleanValue.split('.');
  let integerPart = parts[0] || '';
  const decimalPart = parts[1] || '';
  
  // Add thousand separator to integer part
  integerPart = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  // Return formatted value
  return decimalPart ? `${integerPart}.${decimalPart}` : integerPart;
};

interface AddCategoryFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newCategory: any) => void;
}

// Farm category icons and colors
const CATEGORY_ICONS = [
  { id: 'livestock', name: 'Livestock', icon: '🐄', color: '#3B82F6', component: <Beef className="w-5 h-5" /> },
  { id: 'crops', name: 'Crops (Growing)', icon: '🌾', color: '#10B981', component: <Wheat className="w-5 h-5" /> },
  { id: 'harvested', name: 'Harvested Produce', icon: '🍎', color: '#F97316', component: <Apple className="w-5 h-5" /> },
  { id: 'animal-feed', name: 'Animal Feed', icon: '📦', color: '#8B5CF6', component: <Package className="w-5 h-5" /> },
  { id: 'seeds', name: 'Seeds & Planting Materials', icon: '🌲', color: '#EAB308', component: <TreePine className="w-5 h-5" /> },
  { id: 'fertilizers', name: 'Fertilizers & Soil Inputs', icon: '🥕', color: '#EC4899', component: <Carrot className="w-5 h-5" /> },
  { id: 'agrochemicals', name: 'Agrochemicals', icon: '🥛', color: '#EF4444', component: <Milk className="w-5 h-5" /> },
  { id: 'veterinary', name: 'Veterinary Supplies', icon: '🥚', color: '#6366F1', component: <Egg className="w-5 h-5" /> },
  { id: 'packaging', name: 'Packaging & Storage Materials', icon: '📦', color: '#14B8A6', component: <Package className="w-5 h-5" /> },
  { id: 'consumables', name: 'Consumables', icon: '🐟', color: '#6B7280', component: <Fish className="w-5 h-5" /> },
  { id: 'custom', name: 'Custom', icon: '📋', color: '#64748B', component: <FolderPlus className="w-5 h-5" /> }
];

const PREDEFINED_SUBCATEGORIES = {
  livestock: ['Cattle', 'Goats', 'Sheep', 'Poultry', 'Pigs', 'Fish', 'Ducks', 'Turkeys', 'Rabbits'],
  crops: ['Grains', 'Tubers', 'Legumes', 'Vegetables', 'Fruits', 'Herbs', 'Spices', 'Nuts'],
  harvested: ['Grains', 'Tubers', 'Legumes', 'Vegetables', 'Fruits', 'Processed Goods', 'Dried Products'],
  'animal-feed': ['Poultry Feed', 'Fish Feed', 'Pig Feed', 'Cattle Feed', 'Fodder', 'Supplements'],
  seeds: ['Grain Seeds', 'Vegetable Seeds', 'Legume Seeds', 'Fruit Seeds', 'Tree Seeds', 'Seedlings'],
  fertilizers: ['Organic', 'Inorganic', 'Compost', 'Manure', 'Bio-fertilizers', 'Micronutrients'],
  agrochemicals: ['Herbicides', 'Pesticides', 'Fungicides', 'Growth Regulators', 'Adjuvants', 'Disinfectants'],
  veterinary: ['Vaccines', 'Antibiotics', 'Supplements', 'Equipment', 'Medicines', 'Vitamins'],
  packaging: ['Sacks/Bags', 'Crates', 'Baskets', 'Containers', 'Bottles', 'Jars', 'Boxes'],
  consumables: ['Fuel', 'Lubricants', 'Farm Utilities', 'Water Treatment', 'Disinfectants', 'Cleaning Supplies']
};

const AddCategoryForm = ({ isOpen, onClose, onSuccess }: AddCategoryFormProps) => {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    icon: '',
    color: '#3B82F6',
    parentId: '',
    isSubcategory: false,
    subCategories: [] as string[],
    minStockAlert: '',
    maxStockAlert: '',
    storageRequirements: '',
    handlingInstructions: '',
    notes: ''
  });

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showSubcategoryForm, setShowSubcategoryForm] = useState(false);
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [previewMode, setPreviewMode] = useState(false);
  const [existingCategories, setExistingCategories] = useState<any[]>([]);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: '',
        description: '',
        icon: '',
        color: '#3B82F6',
        parentId: '',
        isSubcategory: false,
        subCategories: [],
        minStockAlert: '',
        maxStockAlert: '',
        storageRequirements: '',
        handlingInstructions: '',
        notes: ''
      });
      setErrors({});
      setSuccess('');
      setShowAdvanced(false);
      setShowSubcategoryForm(false);
      setCustomSubcategory('');
      setPreviewMode(false);
      fetchExistingCategories();
    }
  }, [isOpen]);

  const fetchExistingCategories = async () => {
    try {
      const response = await api.get('/inventory/categories');
      setExistingCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Category name is required';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Category name must be at least 2 characters';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Category name must be less than 50 characters';
    }

    // Check for duplicate category names
    const duplicateName = existingCategories.find(cat => 
      cat.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (duplicateName) {
      newErrors.name = 'A category with this name already exists';
    }

    // Icon validation
    if (!formData.icon && !formData.isSubcategory) {
      newErrors.icon = 'Icon is required for main categories';
    }

    // Subcategory validation
    if (formData.isSubcategory && !formData.parentId) {
      newErrors.parentId = 'Parent category is required for subcategories';
    }

    // Advanced validations
    if (formData.minStockAlert && (isNaN(Number(formData.minStockAlert)) || Number(formData.minStockAlert) < 0)) {
      newErrors.minStockAlert = 'Minimum stock must be a positive number';
    }
    if (formData.maxStockAlert && (isNaN(Number(formData.maxStockAlert)) || Number(formData.maxStockAlert) < 0)) {
      newErrors.maxStockAlert = 'Maximum stock must be a positive number';
    }
    if (formData.minStockAlert && formData.maxStockAlert && Number(formData.minStockAlert) >= Number(formData.maxStockAlert)) {
      newErrors.maxStockAlert = 'Maximum stock must be greater than minimum stock';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSuccess('');

    try {
      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        icon: formData.icon,
        color: formData.color,
        parentId: formData.isSubcategory ? formData.parentId : null,
        isSubcategory: formData.isSubcategory,
        metadata: {
          subCategories: formData.subCategories,
          minStockAlert: formData.minStockAlert ? Number(formData.minStockAlert) : null,
          maxStockAlert: formData.maxStockAlert ? Number(formData.maxStockAlert) : null,
          storageRequirements: formData.storageRequirements.trim() || null,
          handlingInstructions: formData.handlingInstructions.trim() || null,
          notes: formData.notes.trim() || null
        }
      };

      const response = await api.post('/inventory/categories', payload);
      const newCategory = response.data;
      
      setSuccess('Category created successfully!');
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess(newCategory);
        onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error('Error adding category:', err);
      setErrors({
        submit: err.response?.data?.error || 'Failed to add category. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubcategoryToggle = (subcategory: string) => {
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.includes(subcategory)
        ? prev.subCategories.filter(s => s !== subcategory)
        : [...prev.subCategories, subcategory]
    }));
  };

  const addCustomSubcategory = () => {
    if (customSubcategory.trim() && !formData.subCategories.includes(customSubcategory.trim())) {
      setFormData(prev => ({
        ...prev,
        subCategories: [...prev.subCategories, customSubcategory.trim()]
      }));
      setCustomSubcategory('');
    }
  };

  const removeSubcategory = (subcategory: string) => {
    setFormData(prev => ({
      ...prev,
      subCategories: prev.subCategories.filter(s => s !== subcategory)
    }));
  };

  const getSelectedIcon = () => {
    const selectedIcon = CATEGORY_ICONS.find(icon => icon.id === formData.icon);
    return selectedIcon ? selectedIcon.icon : '📋';
  };

  const getParentCategories = () => {
    return existingCategories.filter(cat => !cat.isSubcategory);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <FolderPlus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add New Category</h2>
                <p className="text-blue-100 text-sm">Create a new inventory category or subcategory</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-white/80 hover:text-white transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mx-6 mt-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
              <span className="text-green-700 dark:text-green-300 font-medium">{success}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errors.submit && (
          <div className="mx-6 mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <div className="flex items-center space-x-3">
              <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
              <span className="text-red-700 dark:text-red-300 font-medium">{errors.submit}</span>
            </div>
          </div>
        )}

        {/* Form Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Type Toggle */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                  <FolderPlus className="w-5 h-5 mr-2" />
                  Category Type
                </h3>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isSubcategory"
                      checked={!formData.isSubcategory}
                      onChange={() => setFormData(prev => ({ ...prev, isSubcategory: false }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Main Category</span>
                  </label>
                  <label className="flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="isSubcategory"
                      checked={formData.isSubcategory}
                      onChange={() => setFormData(prev => ({ ...prev, isSubcategory: true }))}
                      className="mr-2"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Subcategory</span>
                  </label>
                </div>
              </div>
            </div>

            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <FolderOpen className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Category Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Organic Vegetables, Poultry Feed, Storage Equipment"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Parent Category (for subcategories) */}
                {formData.isSubcategory && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Parent Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="parentId"
                      value={formData.parentId}
                      onChange={handleChange}
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.parentId ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      <option value="">Select a parent category</option>
                      {getParentCategories().map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                    {errors.parentId && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.parentId}</p>
                    )}
                  </div>
                )}

                {/* Description */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of this category..."
                  />
                </div>
              </div>
            </div>

            {/* Icon and Color */}
            {!formData.isSubcategory && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Icon & Color
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Icon Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Icon <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {CATEGORY_ICONS.map(icon => (
                        <button
                          key={icon.id}
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, icon: icon.id }))}
                          className={`p-3 border rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                            formData.icon === icon.id 
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' 
                              : 'border-gray-300 dark:border-gray-600'
                          }`}
                        >
                          <div className="text-2xl">{icon.icon}</div>
                          <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">{icon.name}</div>
                        </button>
                      ))}
                    </div>
                    {errors.icon && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.icon}</p>
                    )}
                  </div>

                  {/* Color Selection */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Category Color
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-16 h-10 border border-gray-300 dark:border-gray-600 rounded cursor-pointer"
                      />
                      <input
                        type="text"
                        value={formData.color}
                        onChange={handleChange}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="#3B82F6"
                      />
                    </div>
                    <div className="mt-2 flex items-center space-x-2">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Preview:</span>
                      <div 
                        className="w-8 h-8 rounded-lg border border-gray-300 dark:border-gray-600"
                        style={{ backgroundColor: formData.color }}
                      >
                        <div className="w-full h-full flex items-center justify-center text-white text-sm">
                          {getSelectedIcon()}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subcategories */}
            {!formData.isSubcategory && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <FolderOpen className="w-5 h-5 mr-2" />
                    Subcategories
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowSubcategoryForm(!showSubcategoryForm)}
                    className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                  >
                    {showSubcategoryForm ? 'Hide' : 'Show'} Form
                  </button>
                </div>

                {/* Predefined Subcategories */}
                {formData.icon && PREDEFINED_SUBCATEGORIES[formData.icon as keyof typeof PREDEFINED_SUBCATEGORIES] && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Common subcategories for {formData.icon}:</p>
                    <div className="flex flex-wrap gap-2">
                      {PREDEFINED_SUBCATEGORIES[formData.icon as keyof typeof PREDEFINED_SUBCATEGORIES].map(sub => (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => handleSubcategoryToggle(sub)}
                          className={`px-3 py-1 rounded-full text-sm transition-colors ${
                            formData.subCategories.includes(sub)
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}
                        >
                          {sub}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Custom Subcategory Form */}
                {showSubcategoryForm && (
                  <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={customSubcategory}
                        onChange={(e) => setCustomSubcategory(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
                        placeholder="Enter custom subcategory name"
                        onKeyPress={(e) => e.key === 'Enter' && addCustomSubcategory()}
                      />
                      <button
                        type="button"
                        onClick={addCustomSubcategory}
                        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                )}

                {/* Selected Subcategories */}
                {formData.subCategories.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Selected Subcategories:</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.subCategories.map(sub => (
                        <div
                          key={sub}
                          className="flex items-center space-x-1 px-3 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full"
                        >
                          <span className="text-sm">{sub}</span>
                          <button
                            type="button"
                            onClick={() => removeSubcategory(sub)}
                            className="ml-1 text-blue-500 hover:text-blue-700"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Advanced Options Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Settings className="w-5 h-5 mr-2" />
                Advanced Options
              </h3>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Minimum Stock Alert */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Minimum Stock Alert
                    </label>
                    <input
                      type="text"
                      name="minStockAlert"
                      value={formatNumberWithSeparator(formData.minStockAlert)}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.minStockAlert ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Alert when below this amount"
                    />
                    {errors.minStockAlert && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.minStockAlert}</p>
                    )}
                  </div>

                  {/* Maximum Stock Alert */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Maximum Stock Alert
                    </label>
                    <input
                      type="text"
                      name="maxStockAlert"
                      value={formatNumberWithSeparator(formData.maxStockAlert)}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.maxStockAlert ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="Alert when above this amount"
                    />
                    {errors.maxStockAlert && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.maxStockAlert}</p>
                    )}
                  </div>

                  {/* Storage Requirements */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Storage Requirements
                    </label>
                    <textarea
                      name="storageRequirements"
                      value={formData.storageRequirements}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Cool storage, dry place, refrigerated, etc."
                    />
                  </div>

                  {/* Handling Instructions */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Handling Instructions
                    </label>
                    <textarea
                      name="handlingInstructions"
                      value={formData.handlingInstructions}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Special handling instructions for this category"
                    />
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Additional Notes
                    </label>
                    <textarea
                      name="notes"
                      value={formData.notes}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Any additional information..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Preview Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Eye className="w-5 h-5 mr-2" />
                Preview
              </h3>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                {previewMode ? 'Hide' : 'Show'} Preview
              </button>
            </div>

            {/* Preview */}
            {previewMode && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Category Preview</h4>
                <div className="flex items-center space-x-4 mb-4">
                  <div 
                    className="w-12 h-12 rounded-lg flex items-center justify-center text-white text-xl"
                    style={{ backgroundColor: formData.color }}
                  >
                    {getSelectedIcon()}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900 dark:text-white">{formData.name || 'Category Name'}</h5>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formData.isSubcategory ? 'Subcategory' : 'Main Category'}
                    </p>
                    {formData.parentId && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Parent: {getParentCategories().find(c => c.id === formData.parentId)?.name || 'Unknown'}
                      </p>
                    )}
                  </div>
                </div>
                {formData.description && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">{formData.description}</p>
                )}
                {formData.subCategories.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subcategories:</p>
                    <div className="flex flex-wrap gap-1">
                      {formData.subCategories.map(sub => (
                        <span key={sub} className="px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded text-xs">
                          {sub}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Form Actions */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium text-gray-700 dark:text-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Create Category</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddCategoryForm;
