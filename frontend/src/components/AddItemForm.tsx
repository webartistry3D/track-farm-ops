import { useState, useEffect, useCallback } from 'react';
import api from '../lib/api';
import { formatCurrency } from '../utils/currency';
import type { InventoryItem } from '../types';
import { 
  X, Plus, Package, AlertCircle, CheckCircle, Loader2, Save, Eye, ChevronDown
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

interface AddItemFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newItem: InventoryItem) => void;
  itemToEdit?: InventoryItem | null;
}

const AddItemForm = ({ isOpen, onClose, onSuccess, itemToEdit }: AddItemFormProps) => {
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    type: 'CONSUMABLES',
    quantity: '',
    unit: 'kg',
    description: '',
    categoryId: '',
    pricePerUnit: '',
    location: '',
    supplier: '',
    purchaseDate: '',
    expiryDate: '',
    minimumStock: '',
    notes: ''
  });

  // Display state for formatted price
  const [displayPricePerUnit, setDisplayPricePerUnit] = useState('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [existingItems, setExistingItems] = useState<any[]>([]);
  const [filteredItems, setFilteredItems] = useState<any[]>([]);
  const [showItemDropdown, setShowItemDropdown] = useState(false);
  const [categories, setCategories] = useState<any[]>([]);
  const [units, setUnits] = useState<string[]>([]);

  // Fetch units from API
  const fetchUnits = useCallback(async () => {
    try {
      const response = await api.get('/inventory/units');
      setUnits(response.data || [
        'kg', 'g', 'liters', 'ml', 'pieces', 'bags', 'boxes', 'crates', 'bottles',
        'tons', 'quintals', 'dozens', 'pairs', 'sets', 'meters', 'cm', 'units'
      ]);
    } catch (error) {
      console.error('Error fetching units:', error);
      // Fallback to default units if API fails
      setUnits([
        'kg', 'g', 'liters', 'ml', 'pieces', 'bags', 'boxes', 'crates', 'bottles',
        'tons', 'quintals', 'dozens', 'pairs', 'sets', 'meters', 'cm', 'units'
      ]);
    }
  }, []);

  // Reset form when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      if (itemToEdit) {
        // Populate form with existing item data for editing
        const priceValue = itemToEdit.pricePerUnit?.toString() || itemToEdit.metadata?.pricePerUnit?.toString() || '';
        setFormData({
          name: itemToEdit.name || '',
          type: itemToEdit.type || 'CONSUMABLES',
          quantity: itemToEdit.quantity?.toString() || '',
          unit: itemToEdit.unit || 'kg',
          description: itemToEdit.description || '',
          categoryId: itemToEdit.categoryId?.toString() || '',
          pricePerUnit: priceValue,
          location: itemToEdit.location || itemToEdit.metadata?.location || '',
          supplier: itemToEdit.supplier || itemToEdit.metadata?.supplier || '',
          purchaseDate: itemToEdit.purchaseDate ? new Date(itemToEdit.purchaseDate).toISOString().split('T')[0] : (itemToEdit.metadata?.purchaseDate || ''),
          expiryDate: itemToEdit.expiryDate ? new Date(itemToEdit.expiryDate).toISOString().split('T')[0] : (itemToEdit.metadata?.expiryDate || ''),
          minimumStock: (itemToEdit.minimumStock || itemToEdit.metadata?.minimumStock)?.toString() || '',
          notes: itemToEdit.metadata?.notes || ''
        });
        // Set formatted display value
        setDisplayPricePerUnit(priceValue ? Number(priceValue).toLocaleString() : '');
      } else {
        // Reset for new item
        setFormData({
          name: '',
          type: 'CONSUMABLES',
          quantity: '',
          unit: 'kg',
          description: '',
          categoryId: '',
          pricePerUnit: '',
          location: '',
          supplier: '',
          purchaseDate: new Date().toISOString().split('T')[0],
          expiryDate: '',
          minimumStock: '',
          notes: ''
        });
        setDisplayPricePerUnit('');
      }
      setErrors({});
      setSuccess('');
      setShowAdvanced(false);
      setPreviewMode(false);
      setShowItemDropdown(false);
      fetchExistingItems();
      fetchCategories();
      fetchUnits();
    }
  }, [isOpen, itemToEdit]);

  const fetchExistingItems = async () => {
    try {
      // Only fetch inventory items, exclude user profiles
      const response = await api.get('/inventory/items?filter=inventory');
      const items = response.data?.items || response.data || [];
      setExistingItems(items);
    } catch (error) {
      console.error('Error fetching existing items:', error);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get('/inventory/categories');
      console.log('Fetched categories:', response.data);
      setCategories(response.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filter items based on selected category
  useEffect(() => {
    if (formData.categoryId) {
      // Filter items that belong to the selected category
      const filtered = existingItems.filter(item => 
        item.categoryId === parseInt(formData.categoryId) && 
        item.name && // Ensure item has a name (filter out user profiles)
        item.quantity !== undefined // Ensure item has quantity (filter out user profiles)
      );
      setFilteredItems(filtered);
      console.log('Filtered items for category', formData.categoryId, ':', filtered);
    } else {
      setFilteredItems([]);
    }
  }, [formData.categoryId, existingItems]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Required fields
    if (!formData.name.trim()) {
      newErrors.name = 'Item name is required';
    }
    if (!formData.quantity) {
      newErrors.quantity = 'Quantity is required';
    } else if (isNaN(Number(formData.quantity)) || Number(formData.quantity) < 0) {
      newErrors.quantity = 'Quantity must be a positive number';
    }
    if (!formData.unit) {
      newErrors.unit = 'Unit is required';
    }

    // Advanced validations
    if (formData.pricePerUnit && (isNaN(Number(formData.pricePerUnit)) || Number(formData.pricePerUnit) < 0)) {
      newErrors.pricePerUnit = 'Price must be a positive number';
    }
    if (formData.minimumStock && (isNaN(Number(formData.minimumStock)) || Number(formData.minimumStock) < 0)) {
      newErrors.minimumStock = 'Minimum stock must be a positive number';
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
        type: formData.type,
        quantity: Number(formData.quantity),
        unit: formData.unit,
        description: formData.description.trim(),
        categoryId: formData.categoryId || null,
        initialQuantity: Number(formData.quantity),
        // Send as direct fields instead of metadata
        location: formData.location.trim() || null,
        supplier: formData.supplier.trim() || null,
        purchaseDate: formData.purchaseDate || null,
        expiryDate: formData.expiryDate || null,
        minimumStock: formData.minimumStock ? Number(formData.minimumStock) : null,
        pricePerUnit: formData.pricePerUnit ? Number(formData.pricePerUnit) : null,
        // Keep remaining data in metadata for flexibility
        metadata: {
          notes: formData.notes.trim() || null
        }
      };

      let response;
      if (itemToEdit) {
        // Update existing item
        response = await api.put(`/inventory/items/${itemToEdit.id}`, payload);
        setSuccess('Item updated successfully!');
      } else {
        // Create new item
        response = await api.post('/inventory/items', payload);
        setSuccess('Item added successfully!');
      }
      
      const updatedItem = response.data;
      
      // Call success callback after a short delay
      setTimeout(() => {
        onSuccess(updatedItem);
        onClose();
      }, 1500);
      
    } catch (err: any) {
      console.error('Error saving item:', err);
      setErrors({
        submit: err.response?.data?.error || `Failed to ${itemToEdit ? 'update' : 'add'} item. Please try again.`
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Special handling for pricePerUnit to format with thousand separators
    if (name === 'pricePerUnit') {
      // Remove all non-numeric characters except decimal point
      const numericValue = value.replace(/[^0-9.]/g, '');
      
      // Update the raw form data for calculations
      setFormData(prev => ({ ...prev, [name]: numericValue }));
      
      // Update the display value with formatting
      if (numericValue) {
        const formattedValue = Number(numericValue).toLocaleString();
        setDisplayPricePerUnit(formattedValue);
      } else {
        setDisplayPricePerUnit('');
      }
    } else {
      // Normal handling for other fields
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const calculateTotalValue = () => {
    const quantity = Number(formData.quantity) || 0;
    const pricePerUnit = Number(formData.pricePerUnit) || 0;
    return quantity * pricePerUnit;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <Plus className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Add New Inventory Item</h2>
                <p className="text-green-100 text-sm">Add a new item to your farm inventory</p>
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
            {/* Basic Information */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Category */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    name="categoryId"
                    value={formData.categoryId}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="">Select a category (optional)</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Item Name with Dropdown */}
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Item Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      onFocus={() => setShowItemDropdown(true)}
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="e.g., Organic Tomatoes, Layer Chickens, Fertilizer NPK"
                    />
                    <button
                      type="button"
                      onClick={() => setShowItemDropdown(!showItemDropdown)}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  {/* Dropdown Menu */}
                  {showItemDropdown && filteredItems.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredItems.slice(0, 10).map((item, index) => (
                        <button
                          key={index}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, name: item.name }));
                            setShowItemDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 border-b border-gray-100 dark:border-gray-700 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-900 dark:text-white">{item.name}</span>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{item.quantity} {item.unit}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    <option value="LIVESTOCK">Livestock</option>
                    <option value="PRODUCE">Produce</option>
                    <option value="CONSUMABLES">Consumables</option>
                    <option value="SEEDS">Seeds</option>
                    <option value="FERTILIZERS">Fertilizers</option>
                    <option value="PESTICIDES">Pesticides</option>
                    <option value="EQUIPMENT">Equipment</option>
                    <option value="SUPPLIES">Supplies</option>
                    <option value="MEDICINE">Medicine</option>
                    <option value="FEED">Feed</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>

                {/* Description */}
                <div className="md:col-span-3">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="Brief description of the item..."
                  />
                </div>
              </div>
            </div>

            {/* Quantity & Unit */}
            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Quantity & Unit
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Quantity */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Initial Quantity <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="quantity"
                    value={formatNumberWithSeparator(formData.quantity)}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.quantity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="0.00"
                  />
                  {errors.quantity && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.quantity}</p>
                  )}
                </div>

                {/* Unit */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Unit <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="unit"
                    value={formData.unit}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.unit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                  >
                    {units.map((unit: string) => (
                      <option key={unit} value={unit}>{unit}</option>
                    ))}
                  </select>
                  {errors.unit && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.unit}</p>
                  )}
                </div>

                {/* Minimum Stock */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Minimum Stock Alert
                  </label>
                  <input
                    type="number"
                    name="minimumStock"
                    value={formData.minimumStock}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                      errors.minimumStock ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="Alert when below this amount"
                  />
                  {errors.minimumStock && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.minimumStock}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Advanced Options Toggle */}
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <Package className="w-5 h-5 mr-2" />
                Advanced Options
              </h3>
              <button
                type="button"
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
              >
                {showAdvanced ? 'Hide' : 'Show'} Advanced
              </button>
            </div>

            {/* Advanced Options */}
            {showAdvanced && (
              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Price Per Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Price Per Unit (₦)
                    </label>
                    <input
                      type="text"
                      name="pricePerUnit"
                      value={displayPricePerUnit}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        errors.pricePerUnit ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      }`}
                      placeholder="0.00"
                    />
                    {errors.pricePerUnit && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.pricePerUnit}</p>
                    )}
                  </div>

                  {/* Location */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Storage Location
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Warehouse A, Cold Storage"
                    />
                  </div>

                  {/* Supplier */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Supplier
                    </label>
                    <input
                      type="text"
                      name="supplier"
                      value={formData.supplier}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Supplier name"
                    />
                  </div>

                  {/* Purchase Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Purchase Date
                    </label>
                    <input
                      type="date"
                      name="purchaseDate"
                      value={formData.purchaseDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>

                  {/* Expiry Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Expiry Date
                    </label>
                    <input
                      type="date"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
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
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      placeholder="Any additional information..."
                    />
                  </div>
                </div>

                {/* Value Calculation */}
                {formData.pricePerUnit && formData.quantity && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-green-700 dark:text-green-300">Estimated Total Value:</span>
                      <span className="text-lg font-bold text-green-900 dark:text-green-100">
                        {formatCurrency(calculateTotalValue())}
                      </span>
                    </div>
                  </div>
                )}
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
                className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 font-medium"
              >
                {previewMode ? 'Hide' : 'Show'} Preview
              </button>
            </div>

            {/* Preview */}
            {previewMode && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3">Item Preview</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Name:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formData.name || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Category:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {categories.find(c => c.id.toString() === formData.categoryId.toString())?.name || 'Not specified'}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Quantity:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formData.quantity || '0'} {formData.unit}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Type:</span>
                    <span className="ml-2 font-medium text-gray-900 dark:text-white">
                      {formData.type}
                    </span>
                  </div>
                  {formData.pricePerUnit && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Unit Price:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {formatCurrency(formData.pricePerUnit)}
                      </span>
                    </div>
                  )}
                  {formData.minimumStock && (
                    <div>
                      <span className="text-gray-600 dark:text-gray-400">Min Stock Alert:</span>
                      <span className="ml-2 font-medium text-gray-900 dark:text-white">
                        {formData.minimumStock} {formData.unit}
                      </span>
                    </div>
                  )}
                </div>
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
                className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{itemToEdit ? 'Updating...' : 'Adding...'}</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>{itemToEdit ? 'Update Item' : 'Add Item'}</span>
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

export default AddItemForm;
