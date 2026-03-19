import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { Plus, Edit2, Trash2, Package, Grid3X3, List } from 'lucide-react';
import ConfirmModal from './ConfirmModal';

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

const InventoryCategories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; categoryId?: number; categoryName?: string }>({ isOpen: false });

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try {
      const response = await api.get('/inventory/categories');
      setCategories(response.data || []);
      setError('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Get category icon
  const getCategoryIcon = useCallback((category: Category) => {
    if (category.icon) {
      return <span className="text-2xl">{category.icon}</span>;
    }
    
    // Default icon if no icon specified
    return <Package className="w-6 h-6" />;
  }, []);

  // Get category color
  const getCategoryColor = useCallback((category: Category) => {
    if (!category.color) return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600';
    
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
  }, []);

  const handleEditCategory = (categoryId: number, categoryName: string) => {
    alert(`Edit category: ${categoryName} (ID: ${categoryId})`);
    // In real implementation, you would open an edit modal or navigate to edit page
  };

  const handleDeleteCategory = (categoryId: number, categoryName: string) => {
    setDeleteModal({ isOpen: true, categoryId, categoryName });
  };

  const confirmDeleteCategory = async () => {
    if (!deleteModal.categoryId || !deleteModal.categoryName) return;
    
    try {
      await api.delete(`/inventory/categories/${deleteModal.categoryId}`);
      setCategories(categories.filter(cat => cat.id !== deleteModal.categoryId));
      setDeleteModal({ isOpen: false });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to delete category');
    }
  };

  const handleAddCategory = () => {
    alert('Add new category');
    // In real implementation, you would open an add category modal
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 border-t-transparent border-r-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 rounded-lg p-6 max-w-md">
          <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Categories</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      {/* Header */}
      <div className="max-w-full mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Inventory Categories</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage your farm inventory categories - {categories.length} categories available
            </p>
          </div>
          
          <div className="flex items-center space-x-3">
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
            </div>
            
            {/* Add Category Button */}
            {user?.role === 'OWNER' || user?.role === 'MANAGER' ? (
              <button
                onClick={handleAddCategory}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Category
              </button>
            ) : (
              <button
                onClick={handleAddCategory}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4 mr-2" />
                Suggest Category
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Categories Grid - 4x4 Layout */}
      <div className="max-w-full mx-auto">
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 items-stretch">
            {categories.map((category) => (
              <div key={category.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-200 group h-full flex flex-col">
                {/* Category Header */}
                <div className="p-6 flex-grow">
                  <div className="flex flex-col items-center text-center mb-4">
                    <div className={`p-4 rounded-lg ${getCategoryColor(category).replace(/text-\w+-\d+/g, '').replace(/border-\w+-\d+/g, '')} mb-3`}>
                      {getCategoryIcon(category)}
                    </div>
                    <div className="min-h-[3.5rem] flex flex-col items-center justify-center">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 leading-6 text-center overflow-hidden" style={{ 
                        display: '-webkit-box', 
                        WebkitLineClamp: 2, 
                        WebkitBoxOrient: 'vertical',
                        textOverflow: 'ellipsis'
                      }}>
                        {category.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {category._count?.items || 0} items
                      </p>
                    </div>
                  </div>
                  
                  {/* Action Buttons */}
                  <div className="flex justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {user?.role === 'OWNER' || user?.role === 'MANAGER' ? (
                      <>
                        <button
                          onClick={() => handleEditCategory(category.id, category.name)}
                          className="p-2 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Edit Category"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id, category.name)}
                          className="p-2 text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAddCategory()}
                        className="p-2 text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                        title="Suggest Category"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                  {/* Category Stats */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {category._count?.items || 0}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Total Items
                      </div>
                    </div>
                    <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="text-lg font-bold text-gray-900 dark:text-white">
                        {category._count?.items && category._count.items > 0 ? 'Active' : 'Empty'}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Status
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category Footer */}
                <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      ID: {category.id}
                    </span>
                    <button className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium">
                      View Items →
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // List View
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Category
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Items
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {categories.map((category) => (
                    <tr key={category.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className={`p-2 rounded-lg ${getCategoryColor(category).replace(/text-\w+-\d+/g, '').replace(/border-\w+-\d+/g, '')} mr-3`}>
                            {getCategoryIcon(category)}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {category.name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {category.id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                          {category.description || 'No description available'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="text-lg font-bold text-gray-900 dark:text-white mr-2">
                            {category._count?.items || 0}
                          </span>
                          <span className="text-sm text-gray-500 dark:text-gray-400">
                            items
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          {user?.role === 'OWNER' || user?.role === 'MANAGER' ? (
                            <>
                              <button
                                onClick={() => handleEditCategory(category.id, category.name)}
                                className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteCategory(category.id, category.name)}
                                className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleAddCategory()}
                              className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {categories.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Categories Found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Start by adding your first inventory category to organize your farm resources.
          </p>
          <button
            onClick={handleAddCategory}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add First Category
          </button>
        </div>
      )}
      
      {/* Delete Category Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false })}
        onConfirm={confirmDeleteCategory}
        title="Delete Category"
        message={`Are you sure you want to delete category "${deleteModal.categoryName}"? This action cannot be undone.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default InventoryCategories;
