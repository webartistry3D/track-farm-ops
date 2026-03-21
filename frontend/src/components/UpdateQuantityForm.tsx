import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
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

interface UpdateQuantityFormProps {
  item: InventoryItem;
  onUpdate: () => void;
  onClose: () => void;
}

const UpdateQuantityForm = ({ item, onUpdate, onClose }: UpdateQuantityFormProps) => {
  const [formData, setFormData] = useState({
    quantityChange: '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      await api.put(`/inventory/items/${item.id}/quantity`, {
        quantityChange: parseFloat(formData.quantityChange),
        reason: formData.reason
      });

      setSuccess('Inventory updated successfully!');
      onUpdate();
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to update inventory');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return <div>Please log in to access this feature.</div>;
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Update {item.name}
          </h3>
          
          <div className="mb-4 p-3 bg-gray-50 rounded-md">
            <div className="text-sm text-gray-600">Current quantity:</div>
            <div className="text-xl font-semibold">{item.quantity} {item.unit}</div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="quantityChange" className="block text-sm font-medium text-gray-700 mb-1">
                Quantity Change (+ or -)
              </label>
              <input
                type="text"
                id="quantityChange"
                name="quantityChange"
                step="0.01"
                required
                className="form-input"
                placeholder="Enter positive to add, negative to remove"
                value={formatNumberWithSeparator(formData.quantityChange)}
                onChange={handleChange}
              />
              <p className="text-xs text-gray-500 mt-1">
                New quantity will be: {item.quantity + (parseFloat(formData.quantityChange) || 0)} {item.unit}
              </p>
            </div>

            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <textarea
                id="reason"
                name="reason"
                rows={3}
                required
                className="form-input"
                placeholder="e.g., New purchase, sale, spoilage, death, etc."
                value={formData.reason}
                onChange={handleChange}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md text-sm">
                {error}
              </div>
            )}

            {success && (
              <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-md text-sm">
                {success}
              </div>
            )}

            <div className="flex space-x-3">
              <button
                type="submit"
                disabled={isLoading}
                className="btn btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Updating...' : 'Update'}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="btn btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default UpdateQuantityForm;
