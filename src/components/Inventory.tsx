import { useAuth } from '../contexts/AuthContext';
import InventoryModern from './InventoryModern.tsx';
import api from '../lib/api';
import { Shield } from 'lucide-react';

const Inventory = () => {
  const { user } = useAuth();

  const handleDeleteItem = async (item: any) => {
    try {
      await api.delete(`/inventory/items/${item.id}`);
      // Success - the InventoryModern component will handle the notification
      return true;
    } catch (error) {
      throw error; // Let the component handle the error notification
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Authentication Required
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please log in to access inventory management.
          </p>
        </div>
      </div>
    );
  }

  // Only OWNER and MANAGER can access inventory
  const isAuthorized = user.role === 'OWNER' || user.role === 'MANAGER';

  if (!isAuthorized) {
    return (
      <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-yellow-900 mb-2">Access Restricted</h3>
        <p className="text-yellow-700">
          Inventory management is only available to farm owners and managers.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className="w-full">
        <InventoryModern onDeleteClick={handleDeleteItem} />
      </div>
    </div>
  );
};

export default Inventory;
