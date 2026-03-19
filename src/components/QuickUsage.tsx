import { useState } from 'react';
import api from '../lib/api';
import { Package, Sprout, ShoppingCart, Trash2, ArrowRight, Check } from 'lucide-react';
import type { InventoryItem } from '../types';

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

interface QuickUsageProps {
  item: InventoryItem;
  onSuccess: () => void;
}

const QuickUsage = ({ item, onSuccess }: QuickUsageProps) => {
  const [loading, setLoading] = useState(false);
  const [customQuantity, setCustomQuantity] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [selectedUsageType, setSelectedUsageType] = useState<string>('OTHER');
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);

  const usagePatterns = [
    {
      type: 'FEEDING' as const,
      label: 'Used for Feeding',
      icon: <Package className="w-4 h-4" />,
      color: 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300',
      defaultQuantity: 10,
      defaultReason: 'Used for feeding livestock'
    },
    {
      type: 'PLANTING' as const,
      label: 'Used for Planting',
      icon: <Sprout className="w-4 h-4" />,
      color: 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300',
      defaultQuantity: 5,
      defaultReason: 'Used for planting crops'
    },
    {
      type: 'SALES' as const,
      label: 'Sold',
      icon: <ShoppingCart className="w-4 h-4" />,
      color: 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300',
      defaultQuantity: 1,
      defaultReason: 'Sold to customer'
    },
    {
      type: 'WASTE' as const,
      label: 'Waste/Expired',
      icon: <Trash2 className="w-4 h-4" />,
      color: 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300',
      defaultQuantity: 1,
      defaultReason: 'Waste or expired items'
    }
  ];

  const handleQuickUsage = async (pattern: typeof usagePatterns[0]) => {
    if (!item.id) {
      console.error('No item ID provided');
      return;
    }
    
    // Populate custom usage fields with the pattern values
    setCustomQuantity(pattern.defaultQuantity.toString());
    setCustomReason(pattern.defaultReason);
    setSelectedUsageType(pattern.type);
    
    // Scroll to custom usage section for user to confirm/modify
    const customUsageElement = document.getElementById('custom-usage-section');
    if (customUsageElement) {
      customUsageElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const handleCustomUsage = async () => {
    if (!item.id) {
      console.error('No item ID provided');
      return;
    }
    
    if (!customQuantity || !customReason) {
      return;
    }
    
    setLoading(true);
    try {
      const payload = {
        itemId: item.id,
        quantityChange: -parseFloat(customQuantity),
        reason: customReason,
        usageType: selectedUsageType
      };
      
      const response = await api.put(`/inventory/items/${item.id}/quantity`, payload);
      
      // Store transaction data for success modal
      setLastTransaction(response.data.transaction);
      
      // Clear form
      setCustomQuantity('');
      setCustomReason('');
      setSelectedUsageType('OTHER');
      
      // Call success callback
      onSuccess();
      
      // Show success modal
      setShowSuccessModal(true);
      
      // Auto-route to inventory items after 2 seconds
      setTimeout(() => {
        setShowSuccessModal(false);
        // Navigate to inventory items tab
        window.location.hash = '#items';
        // Force a tab change by dispatching a custom event or using the parent's tab change
        const tabChangeEvent = new CustomEvent('changeTab', { detail: 'items' });
        window.dispatchEvent(tabChangeEvent);
      }, 2000);
      
    } catch (error: any) {
      console.error('Custom usage error:', error);
      alert(error.response?.data?.error || 'Failed to record usage');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Quick Usage Buttons */}
      <div className="flex flex-wrap gap-3">
        {usagePatterns.map((pattern) => (
          <button
            key={pattern.type}
            onClick={() => handleQuickUsage(pattern)}
            disabled={loading || Number(item.quantity) < pattern.defaultQuantity}
            className={`flex items-center justify-center space-x-2 p-3 rounded-lg border transition-colors flex-1 min-w-[140px] ${
              pattern.color
            } border-current hover:opacity-80 disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {pattern.icon}
            <span className="text-sm font-medium">{pattern.label}</span>
            <span className="text-xs opacity-75">-{pattern.defaultQuantity} {item.unit}</span>
          </button>
        ))}
      </div>

      {/* Custom Usage */}
      <div id="custom-usage-section" className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Custom Usage</h4>
        <div className="flex items-end space-x-2">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Quantity"
              value={formatNumberWithSeparator(customQuantity)}
              onChange={(e) => setCustomQuantity(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          <span className="flex items-center text-sm text-gray-600 dark:text-gray-400 pb-2">
            {item.unit}
          </span>
          <div className="flex-1">
            <input
              type="text"
              placeholder="Reason for usage"
              value={customReason}
              onChange={(e) => setCustomReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
          <select
            value={selectedUsageType}
            onChange={(e) => setSelectedUsageType(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-sm"
          >
            <option value="FEEDING">Feeding</option>
            <option value="PLANTING">Planting</option>
            <option value="SALES">Sales</option>
            <option value="WASTE">Waste</option>
            <option value="TRANSFER">Transfer</option>
            <option value="ADJUSTMENT">Adjustment</option>
            <option value="OTHER">Other</option>
          </select>
          <button
            onClick={handleCustomUsage}
            disabled={loading || !customQuantity || !customReason}
            className={`flex items-center justify-center space-x-2 px-4 py-2 rounded-lg transition-colors whitespace-nowrap ${
              loading || !customQuantity || !customReason
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed opacity-50'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
          >
            <ArrowRight className="w-4 h-4" />
            <span>{loading ? 'Recording...' : 'Record'}</span>
          </button>
        </div>
      </div>
      
      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-green-500 bg-opacity-75 transition-opacity"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full p-6 transform transition-all">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-full mb-4">
                <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
              
              <h3 className="text-xl font-bold text-center text-gray-900 dark:text-white mb-2">
                Usage Recorded Successfully!
              </h3>
              
              <div className="text-center mb-4">
                <p className="text-gray-600 dark:text-gray-400 mb-2">
                  {lastTransaction?.inventoryItem?.name} usage has been recorded
                </p>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <p>Quantity: {Math.abs(lastTransaction?.quantityChange || 0)} {lastTransaction?.inventoryItem?.unit}</p>
                  <p>Type: {lastTransaction?.usageType?.replace('_', ' ') || 'Other'}</p>
                  <p>Reason: {lastTransaction?.reason}</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center space-x-2 text-sm text-green-600 dark:text-green-400">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600"></div>
                <span>Redirecting to inventory items...</span>
              </div>
              
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  window.location.hash = '#items';
                  const tabChangeEvent = new CustomEvent('changeTab', { detail: 'items' });
                  window.dispatchEvent(tabChangeEvent);
                }}
                className="mt-4 w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
              >
                Go to Inventory Items Now
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickUsage;
