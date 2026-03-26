import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { processReceiptImage } from '../lib/ocrService';
import { StorageService } from '../services/storageService';
import type { ExpenseEntry } from '../types';
import { formatCurrency, parseCurrency, validateCurrencyInput } from '../utils/currency';
import { Camera, Upload, Scan, CheckCircle, X, Table, Plus, Eye, Trash2 } from 'lucide-react';
import Pagination from './Pagination';
import ConfirmModal from './ConfirmModal';
import { 
  TableSkeleton
} from './SkeletonComponents';

// Add global error handler for unhandled promise rejections
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason);
    // Prevent the error from showing in browser console
    event.preventDefault();
  });
}

interface OCRResult {
  merchant?: string;
  amount?: number;
  date?: string;
  items?: string[];
  category?: string;
  confidence?: number;
  notes?: string;
  ocrSource?: 'paddleocr' | 'tesseract';
  processingTime?: number;
  receiptImageUrl?: string;
  fallbackImageUrl?: string; // Add fallback image URL
  rawText?: string;
}

const expenseCategories = [
  "Feed", "Transport", "Labor", "Veterinary", "Fuel", "Equipment", "Other"
];

const EnhancedExpensePage = () => {
  const [activeTab, setActiveTab] = useState<'record' | 'records'>('record');
  const location = useLocation();

  // Scroll to top when navigating to Expenses page
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location]);

  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    merchant: ''
  });
  const [displayAmount, setDisplayAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState<string | React.ReactNode>('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [showOCRResults, setShowOCRResults] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [expenses, setExpenses] = useState<ExpenseEntry[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [expensesLoading, setExpensesLoading] = useState(false);
  const [entriesPerPage] = useState(10);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [selectedExpense, setSelectedExpense] = useState<ExpenseEntry | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<ExpenseEntry | null>(null);
  
  // Initialize storage service
  const storageService = new StorageService();
  
  const { user } = useAuth();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch expenses on component mount
  useEffect(() => {
    console.log('🔄 useEffect triggered:', { user: !!user, activeTab });
    if (user && activeTab === 'records') {
      console.log('📄 Fetching expenses on mount/tab change');
      fetchExpenses(1);
    }
    
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, [user, activeTab]);

  // Auto-clear success message after 3 seconds
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        setSuccess('');
      }, 3000); // 3 seconds

      return () => clearTimeout(timer);
    }
  }, [success]);

  // Fetch expenses when records tab is active
  const fetchExpenses = async (page: number = 1) => {
    if (!user) return;
    
    setExpensesLoading(true);
    try {
      const offset = (page - 1) * entriesPerPage;
      console.log(`📄 Fetching expenses: page=${page}, limit=${entriesPerPage}, offset=${offset}`);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 10000);
      });
      
      const response = await Promise.race([
        api.get<{ entries: ExpenseEntry[], total: number }>('/finance/expenses', {
          params: {
            limit: entriesPerPage,
            offset: offset
          }
        }),
        timeoutPromise
      ]) as any;
      
      console.log('📊 API Response:', response.data);
      
      setExpenses(response.data.entries || []);
      setTotalExpenses(response.data.total || 0);
      setTotalPages(Math.ceil((response.data.total || 0) / entriesPerPage));
      setCurrentPage(page);
      
      console.log('📈 Pagination state:', {
        entries: response.data.entries?.length || 0,
        total: response.data.total || 0,
        totalPages: Math.ceil((response.data.total || 0) / entriesPerPage),
        currentPage: page
      });
    } catch (err: any) {
      console.error('Failed to fetch expenses:', err);
      if (err.message === 'Request timeout') {
        setError('Request timed out. Please check your connection and try again.');
      } else {
        setError('Failed to load expense records');
      }
    } finally {
      setExpensesLoading(false);
    }
  };

  // Fetch expenses when switching to records tab
  const handleTabChange = (tab: 'record' | 'records') => {
    setActiveTab(tab);
    if (tab === 'records') {
      fetchExpenses(1); // Reset to first page when switching tabs
    }
  };

  // Handle page changes
  const handlePageChange = (page: number) => {
    fetchExpenses(page);
  };

  const handleCameraCapture = () => {
    cameraInputRef.current?.click();
  };

  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };

  const processReceiptFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    setIsScanning(true);
    setError('');
    
    try {
      console.log(`📸 Processing receipt: ${file.name}`);
      
      // Create object URL for the receipt image to display in toast
      const receiptImageUrl = URL.createObjectURL(file);
      
      const result = await processReceiptImage(file);
      
      if (result.success && result.data) {
        console.log(`✅ OCR Success: ${result.data.ocrSource}, Confidence: ${result.data.confidence}%`);
        
        // Save receipt image to storage
        const imageUploadResult = await storageService.uploadFile(file, 'receipts', file.name);
        
        console.log('📸 Storage upload result:', imageUploadResult);
        
        if (imageUploadResult.success) {
          console.log('✅ Receipt image saved to storage:', imageUploadResult.url);
        } else {
          console.error('❌ Failed to save receipt image:', imageUploadResult.error);
          console.log('🔄 Using local object URL as fallback');
        }
        
        // Include receipt image URL in the OCR result
        const ocrResultWithImage = {
          ...result.data,
          receiptImageUrl: imageUploadResult.url || receiptImageUrl,
          fallbackImageUrl: receiptImageUrl // Keep the original blob URL as fallback
        };
        
        console.log('📋 OCR Result with image URL:', {
          hasReceiptImageUrl: !!ocrResultWithImage.receiptImageUrl,
          imageUrl: ocrResultWithImage.receiptImageUrl,
          storageUrl: imageUploadResult.url,
          fallbackUrl: receiptImageUrl
        });
        
        setOcrResult(ocrResultWithImage);
        setShowOCRResults(true);
        
        // Format date properly for HTML date input
        let formattedDate = result.data.date || new Date().toISOString().split('T')[0];
        if (result.data.date && !result.data.date.match(/^\d{4}-\d{2}-\d{2}$/)) {
          // Try to parse and reformat the date
          const parsedDate = new Date(result.data.date);
          if (!isNaN(parsedDate.getTime())) {
            formattedDate = parsedDate.toISOString().split('T')[0];
          } else {
            formattedDate = new Date().toISOString().split('T')[0];
          }
        }
        
        // Auto-fill form with OCR data
        setFormData({
          amount: result.data.amount?.toString() || '',
          category: result.data.category || 'Other',
          note: result.data.items?.join(', ') || result.data.notes || '',
          date: formattedDate,
          merchant: result.data.merchant || ''
        });
        
        // Update display amount
        if (result.data.amount) {
          setDisplayAmount(formatCurrency(result.data.amount.toString()));
        }
        
        // Show success toast with receipt image
        const successContent = (
          <div className="flex items-center justify-between gap-4">
            {/* Left side - Text content (50% width) */}
            <div className="flex-1">
              <div className="font-medium text-green-800 dark:text-green-200">
                Receipt processed successfully!
              </div>
              <div className="text-sm text-green-600 dark:text-green-400">
                {result.data.confidence}% confidence
              </div>
            </div>
            
            {/* Right side - Duplicate receipt image */}
            <img 
              src={receiptImageUrl} 
              alt="Receipt" 
              className="w-16 h-16 object-cover rounded-lg border border-gray-200 dark:border-gray-600"
            />
          </div>
        );
        setSuccess(successContent);
      } else {
        throw new Error(result.error || 'OCR processing failed');
      }
    } catch (err: any) {
      console.error('❌ OCR Error:', err);
      setError(err.message || 'Failed to process receipt. Please try manual entry.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        await processReceiptFile(file);
      } catch (error) {
        console.error('❌ File processing error:', error);
        setError('Failed to process file. Please try again.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
      const numericAmount = parseCurrency(displayAmount);
      
      const expenseData = {
        ...formData,
        amount: numericAmount.toString(),
        merchant: formData.merchant || 'Manual Entry',
        hasReceipt: !!ocrResult,
        receiptImageUrl: ocrResult?.receiptImageUrl,
        ocrConfidence: ocrResult?.confidence,
        ocrSource: ocrResult?.ocrSource,
        rawText: ocrResult?.rawText
      };
      
      console.log('📤 Sending expense data:', JSON.stringify(expenseData, null, 2));
      
      await api.post<ExpenseEntry>('/finance/expenses', expenseData);
      
      setSuccess('Expense entry recorded successfully!');
      resetForm();
    } catch (err: any) {
      console.error('❌ Submit error:', err);
      console.error('❌ Error response:', err.response?.data);
      setError(err.response?.data?.error || err.response?.data?.details || 'Failed to record expense');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      category: '',
      note: '',
      date: new Date().toISOString().split('T')[0],
      merchant: ''
    });
    setDisplayAmount('');
    setOcrResult(null);
    setShowOCRResults(false);
  };

  const handleViewReceipt = (expense: ExpenseEntry) => {
    console.log('📄 View receipt for expense:', expense);
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleDeleteExpense = (expense: ExpenseEntry) => {
    console.log('🗑️ Opening delete modal for expense:', expense);
    setExpenseToDelete(expense);
    setShowDeleteModal(true);
  };

  const cancelDeleteExpense = () => {
    setShowDeleteModal(false);
    setExpenseToDelete(null);
  };

  const confirmDeleteExpense = async () => {
    if (!expenseToDelete) return;

    try {
      console.log('🗑️ Confirming delete for expense:', expenseToDelete);
      await api.delete(`/finance/expenses/${expenseToDelete.id}`);
      
      // Refresh expenses list
      await fetchExpenses(currentPage);
      
      // Reset state
      setShowDeleteModal(false);
      setExpenseToDelete(null);
      
      // Show success message
      setSuccess('Expense entry deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      
    } catch (err: any) {
      console.error('❌ Delete error:', err);
      setError(err.response?.data?.error || 'Failed to delete expense entry');
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    if (!validateCurrencyInput(inputValue.replace(/[^\d.]/g, ''))) {
      return;
    }
    
    const formatted = formatCurrency(inputValue.replace(/[^\d.]/g, ''));
    setDisplayAmount(formatted);
    
    const numericValue = parseCurrency(inputValue.replace(/[^\d.]/g, ''));
    setFormData({
      ...formData,
      amount: numericValue.toString()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return <div>Please log in to access this feature.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-0">
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-2">
        <div className="p-0">
          {/*<h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Farm Expenses
          </h2>*/}

          {/* Tab Navigation */}
          <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
            <nav className="-mb-px flex space-x-4">
              <button
                onClick={() => handleTabChange('record')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'record'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Plus className="h-4 w-4" />
                Record Farm Expense
              </button>
              <button
                onClick={() => handleTabChange('records')}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                  activeTab === 'records'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                <Table className="h-4 w-4" />
                Table Records
              </button>
            </nav>
          </div>

          {/* Record Expense Tab */}
          {activeTab === 'record' && (
            <div>
              {/* OCR Section */}
              {!ocrResult && (
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
                    <Scan className="h-5 w-5" />
                    Quick Receipt Scan
                  </h3>
                  <p className="text-blue-700 dark:text-blue-300 mb-4 text-sm">
                    Take a photo or upload a receipt to automatically extract expense details
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <button
                      onClick={handleCameraCapture}
                      disabled={isScanning}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Camera className="h-5 w-5" />
                      {isScanning ? 'Processing...' : 'Take Photo'}
                    </button>
                    <button
                      onClick={handleFileUpload}
                      disabled={isScanning}
                      className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Upload className="h-5 w-5" />
                      {isScanning ? 'Processing...' : 'Upload Image'}
                    </button>
                  </div>
                  
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    onChange={handleFileChange}
                    ref={cameraInputRef}
                    className="hidden"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    ref={fileInputRef}
                    className="hidden"
                  />
                </div>
              )}

              {/* OCR Results */}
              {showOCRResults && ocrResult && (
                <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800 max-w-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2 max-w-[50%]">
                      <CheckCircle className="h-5 w-5" />
                      <h3 className="text-lg font-semibold text-green-900 dark:text-green-100">
                        Receipt Scanned Successfully
                      </h3>
                    </div>
                    <button
                      onClick={() => setShowOCRResults(false)}
                      className="text-green-600 hover:text-green-800 flex-shrink-0"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    {/* Left Side - OCR Info */}
                    <div className="space-y-3">
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-300 block">Merchant:</span>
                        <p className="text-green-900 dark:text-green-100">{ocrResult.merchant || 'Not detected'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-300 block">Amount:</span>
                        <p className="text-green-900 dark:text-green-100 font-mono">
                          {formatCurrency(ocrResult.amount || 0)}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-300 block">Confidence:</span>
                        <p className="text-green-900 dark:text-green-100">{ocrResult.confidence}%</p>
                      </div>
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-300 block">Source:</span>
                        <p className="text-green-900 dark:text-green-100 capitalize">{ocrResult.ocrSource}</p>
                      </div>
                      
                      {/* Detected Items */}
                      {ocrResult.items && ocrResult.items.length > 0 && (
                        <div>
                          <span className="font-medium text-green-700 dark:text-green-300 block mb-1">Detected Items:</span>
                          <ul className="list-disc list-inside text-green-900 dark:text-green-100 text-sm">
                            {ocrResult.items.map((item, i) => (
                              <li key={`${item}-${i}`}>{item}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                    
                    {/* Right Side - Image Only */}
                    <div className="space-y-4">
                      {/* Scanned Receipt Image */}
                      <div className="bg-gray-100 dark:bg-gray-600 rounded-lg p-4">
                        <span className="font-medium text-green-700 dark:text-green-300 block mb-2">Scanned Receipt:</span>
                        {(() => {
                          console.log('🖼️ Rendering receipt image:', {
                            hasOcrResult: !!ocrResult,
                            hasReceiptImageUrl: !!ocrResult?.receiptImageUrl,
                            imageUrl: ocrResult?.receiptImageUrl
                          });
                          return ocrResult?.receiptImageUrl ? (
                            <div className="flex justify-center">
                              <img 
                                src={ocrResult.receiptImageUrl} 
                                alt="Scanned Receipt" 
                                className="max-w-full h-auto max-h-64 rounded-lg border border-green-200 dark:border-green-600 object-contain"
                                onLoad={() => console.log('✅ Receipt image loaded successfully')}
                                onError={(e) => {
                                  console.error('❌ Storage URL failed to load, trying fallback:', e);
                                  // Try to use the original blob URL as fallback
                                  const fallbackUrl = ocrResult?.fallbackImageUrl;
                                  if (fallbackUrl) {
                                    console.log('🔄 Using blob URL fallback:', fallbackUrl);
                                    e.currentTarget.src = fallbackUrl;
                                  } else {
                                    console.error('❌ No fallback URL available');
                                  }
                                }}
                              />
                            </div>
                          ) : (
                            <div className="text-center">
                              <Eye className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                              <p className="text-sm text-gray-600 dark:text-gray-400">
                                Receipt image not available
                              </p>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Please review and edit the extracted information below before saving
                    </p>
                  </div>
                </div>
              )}

              {/* Manual Entry Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First Row: Merchant/Supplier and Amount */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Merchant Field */}
                  <div>
                    <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Merchant/Supplier
                    </label>
                    <input
                      type="text"
                      id="merchant"
                      name="merchant"
                      className="w-full px-3 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="e.g., Feed Store, Veterinary Clinic"
                      value={formData.merchant}
                      onChange={handleChange}
                    />
                  </div>

                  {/* Amount Field */}
                  <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Amount (₦) *
                    </label>
                    <input
                      type="text"
                      id="amount"
                      name="amount"
                      required
                      className="w-full px-3 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="0.00"
                      value={displayAmount}
                      onChange={handleAmountChange}
                    />
                  </div>
                </div>

                {/* Second Row: Category and Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Category Field */}
                  <div>
                    <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Category *
                    </label>
                    <select
                      id="category"
                      name="category"
                      required
                      className="w-full px-3 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={formData.category}
                      onChange={handleChange}
                    >
                      <option value="">Select category</option>
                      {expenseCategories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Date Field */}
                  <div>
                    <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Date *
                    </label>
                    <input
                      type="date"
                      id="date"
                      name="date"
                      required
                      className="w-full px-3 py-2 h-10 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      value={formData.date}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                {/* Notes Field */}
                <div>
                  <label htmlFor="note" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notes / Items Purchased
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="List items purchased or add additional notes..."
                    value={formData.note}
                    onChange={handleChange}
                  />
                </div>

                {/* Error/Success Messages */}
                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-600 dark:text-green-400 px-4 py-3 rounded-md text-sm">
                    {success}
                  </div>
                )}

                {/* Submit Buttons */}
                <div className="flex gap-3 pt-4">
                  {ocrResult && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Scan Another Receipt
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isLoading ? 'Recording...' : 'Record Expense'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Table Records Tab */}
          {activeTab === 'records' && (
            <div>
              {expensesLoading ? (
                <TableSkeleton rows={8} columns={5} />
              ) : expenses.length === 0 ? (
                <div className="text-center py-8">
                  <Table className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No expense records</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">
                    Start by recording your first farm expense.
                  </p>
                  <button
                    onClick={() => handleTabChange('record')}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Record First Expense
                  </button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Date
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Merchant
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Category
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Amount
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Notes
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Recorded by
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                      {expenses.map((expense) => (
                        <tr key={expense.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {new Date(expense.date).toLocaleDateString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            {expense.merchant || 'Manual Entry'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-800 dark:text-blue-100">
                              {expense.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900 dark:text-white">
                            <div className="max-w-xs truncate" title={expense.note || '-'}>
                              {expense.note || '-'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center">
                              <div className="h-2 w-2 bg-blue-400 rounded-full mr-2"></div>
                              {expense.user?.name || 'Unknown'}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                            <div className="flex items-center space-x-4">
                              {expense.hasReceipt ? (
                                <button
                                  onClick={() => handleViewReceipt(expense)}
                                  className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                                  title="View Receipt"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              ) : (
                                <span className="text-gray-400 dark:text-gray-500" title="No Receipt Available">
                                  <Eye className="h-4 w-4" />
                                </span>
                              )}
                              <button
                                onClick={() => handleDeleteExpense(expense)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                title="Delete Expense"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              
              {/* Pagination Component - show when there are expenses and data is loaded */}
              {!expensesLoading && expenses.length > 0 && (
                <>
                  {console.log('🔍 Rendering pagination:', {
                    expensesLoading,
                    expensesLength: expenses.length,
                    totalExpenses,
                    totalPages,
                    currentPage
                  })}
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    entriesPerPage={entriesPerPage}
                    totalEntries={totalExpenses}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Receipt Modal */}
      {showEditModal && selectedExpense && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full h-[90vh] flex flex-col">
            <div className="p-4 flex-shrink-0">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Receipt - {selectedExpense.category}
                </h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>
            </div>

            {/* Receipt Image - Full Focus */}
            <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto">
              {selectedExpense.receiptImageUrl ? (
                <div className="w-full">
                  <img 
                    src={selectedExpense.receiptImageUrl}
                    alt="Receipt for expense"
                    className="w-full h-auto object-contain rounded-lg border border-gray-200 dark:border-gray-600"
                    onError={(e) => {
                      console.error('❌ Failed to load receipt image:', selectedExpense.receiptImageUrl);
                      // Fallback to placeholder
                      e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEyIDlWMTNNMTIgMTdWOU0xMiA5QzEyIDkgMTIgOSAxMiA5SDEyQzEyIDkgMTIgOSAxMiA5WiIgZmlsbD0iI0ZGNkI2QiIvPgo8L3N2Zz4K';
                    }}
                  />
                </div>
              ) : (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-8 text-center">
                  <Eye className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-lg text-gray-600 dark:text-gray-400">
                    Receipt image not available
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500 mt-2">
                    This expense was recorded without a receipt image
                  </p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 flex-shrink-0 border-t border-gray-200 dark:border-gray-700">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Close
                </button>
                {selectedExpense.hasReceipt && selectedExpense.receiptImageUrl && (
                  <button
                    onClick={async () => {
                      try {
                        console.log('📥 Starting receipt download for expense:', selectedExpense.id);
                        
                        // Fetch the image as a blob
                        const response = await fetch(selectedExpense.receiptImageUrl!);
                        if (!response.ok) {
                          throw new Error(`HTTP error! status: ${response.status}`);
                        }
                        const blob = await response.blob();
                        
                        // Create a blob URL
                        const blobUrl = window.URL.createObjectURL(blob);
                        
                        // Create download link
                        const link = document.createElement('a');
                        link.href = blobUrl;
                        link.download = `receipt_${selectedExpense.category}_${selectedExpense.id}.jpg`;
                        link.style.display = 'none';
                        
                        // Trigger download
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        
                        // Clean up blob URL
                        window.URL.revokeObjectURL(blobUrl);
                        
                        console.log('✅ Receipt download completed successfully');
                      } catch (error) {
                        console.error('❌ Download failed:', error);
                        // Fallback to direct link
                        try {
                          const link = document.createElement('a');
                          link.href = selectedExpense.receiptImageUrl!;
                          link.download = `receipt_${selectedExpense.category}_${selectedExpense.id}.jpg`;
                          link.target = '_blank';
                          link.click();
                          console.log('🔄 Fallback download attempted');
                        } catch (fallbackError) {
                          console.error('❌ Fallback download also failed:', fallbackError);
                          setError('Failed to download receipt. Please try again later.');
                        }
                      }
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download Receipt
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={showDeleteModal && !!expenseToDelete}
        onClose={cancelDeleteExpense}
        onConfirm={confirmDeleteExpense}
        title="Delete Expense Entry"
        message={`Are you sure you want to delete this expense entry? This action cannot be undone.\n\nCategory: ${expenseToDelete?.category}\nAmount: ${expenseToDelete ? formatCurrency(expenseToDelete.amount) : ''}\nDate: ${expenseToDelete ? new Date(expenseToDelete.date).toLocaleDateString() : ''}\nMerchant: ${expenseToDelete?.merchant || 'Manual Entry'}${expenseToDelete?.note ? `\nNotes: ${expenseToDelete.note}` : ''}`}
        confirmText="Delete Expense"
        cancelText="Cancel"
        type="danger"
      />
    </div>
  );
};

export default EnhancedExpensePage;
