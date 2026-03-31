import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import { processReceiptImage } from '../lib/ocrService';
import type { ExpenseEntry } from '../types';
import { formatCurrency, parseCurrency, validateCurrencyInput } from '../utils/currency';
import { Camera, Upload, Scan, CheckCircle, X } from 'lucide-react';

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
  rawText?: string;
}

const expenseCategories = [
  "Feed", "Transport", "Labor", "Veterinary", "Fuel", "Equipment", "Other"
];

const ExpenseForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    note: '',
    date: new Date().toISOString().split('T')[0],
    merchant: ''
  });
  const [displayAmount, setDisplayAmount] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [ocrResult, setOcrResult] = useState<OCRResult | null>(null);
  const [showOCRResults, setShowOCRResults] = useState(false);
  
  const { user } = useAuth();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      
      const result = await processReceiptImage(file);
      
      if (result.success && result.data) {
        console.log(`✅ OCR Success: ${result.data.ocrSource}, Confidence: ${result.data.confidence}%`);
        
        setOcrResult(result.data);
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
        
        setSuccess(`Receipt processed successfully with ${result.data.confidence}% confidence`);
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
      await processReceiptFile(file);
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
        ocrConfidence: ocrResult?.confidence,
        ocrSource: ocrResult?.ocrSource
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
    <div className="max-w-2xl mx-auto p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
            Record Farm Expense
          </h2>

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
            <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Receipt Scanned Successfully
                </h3>
                <button
                  onClick={() => setShowOCRResults(false)}
                  className="text-green-600 hover:text-green-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Merchant:</span>
                  <p className="text-green-900 dark:text-green-100">{ocrResult.merchant || 'Not detected'}</p>
                </div>
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Amount:</span>
                  <p className="text-green-900 dark:text-green-100 font-mono">
                    {formatCurrency(ocrResult.amount || 0)}
                  </p>
                </div>
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Confidence:</span>
                  <p className="text-green-900 dark:text-green-100">{ocrResult.confidence}%</p>
                </div>
                <div>
                  <span className="font-medium text-green-700 dark:text-green-300">Source:</span>
                  <p className="text-green-900 dark:text-green-100 capitalize">{ocrResult.ocrSource}</p>
                </div>
              </div>
              
              {ocrResult.items && ocrResult.items.length > 0 && (
                <div className="mt-3">
                  <span className="font-medium text-green-700 dark:text-green-300 block mb-1">Detected Items:</span>
                  <ul className="list-disc list-inside text-green-900 dark:text-green-100 text-sm">
                    {ocrResult.items.map((item, i) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div className="mt-3 pt-3 border-t border-green-200 dark:border-green-700">
                <p className="text-xs text-green-600 dark:text-green-400">
                  Please review and edit the extracted information below before saving
                </p>
              </div>
            </div>
          )}

          {/* Manual Entry Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Merchant Field */}
            <div>
              <label htmlFor="merchant" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Merchant/Supplier
              </label>
              <input
                type="text"
                id="merchant"
                name="merchant"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="0.00"
                value={displayAmount}
                onChange={handleAmountChange}
              />
            </div>

            {/* Category Field */}
            <div>
              <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category *
              </label>
              <select
                id="category"
                name="category"
                required
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                value={formData.date}
                onChange={handleChange}
              />
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
      </div>
    </div>
  );
};

export default ExpenseForm;
