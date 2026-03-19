import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../lib/api';
import type { IncomeEntry } from '../types';
import { formatCurrency, parseCurrency, validateCurrencyInput } from '../utils/currency';

const IncomeForm = () => {
  const [formData, setFormData] = useState({
    amount: '',
    category: '',
    paymentMethod: 'CASH' as 'CASH' | 'TRANSFER',
    date: new Date().toISOString().split('T')[0]
  });
  const [displayAmount, setDisplayAmount] = useState('');
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
      // Parse the display amount to get the numeric value
      const numericAmount = parseCurrency(displayAmount);
      
      await api.post<IncomeEntry>('/finance/income', {
        ...formData,
        amount: numericAmount.toString()
      });
      setSuccess('Income entry recorded successfully!');
      setFormData({
        amount: '',
        category: '',
        paymentMethod: 'CASH',
        date: new Date().toISOString().split('T')[0]
      });
      setDisplayAmount('');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to record income');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value;
    
    // Remove commas and other non-digit characters for processing
    const cleanValue = inputValue.replace(/[^\d.]/g, '');
    
    // Validate input - allow only numbers and decimal point
    if (!validateCurrencyInput(cleanValue)) {
      return;
    }
    
    // Format for display
    const formatted = formatCurrency(cleanValue);
    setDisplayAmount(formatted);
    
    // Update form data with numeric value
    const numericValue = parseCurrency(cleanValue);
    setFormData({
      ...formData,
      amount: numericValue.toString()
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  if (!user) {
    return <div>Please log in to access this feature.</div>;
  }

  return (
    <div className="card">
      {/* <h2 className="text-xl font-semibold mb-4">Record Income</h2> */}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Amount (₦)
          </label>
          <input
            type="text"
            id="amount"
            name="amount"
            required
            className="form-input"
            placeholder="0.00"
            value={displayAmount}
            onChange={handleAmountChange}
          />
          {/*<div className="text-xs text-gray-500 mt-1">
            {displayAmount ? `₦${displayAmount}` : '₦0.00'}
          </div>*/}
        </div>

        <div>
          <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Category
          </label>
          <select
            id="category"
            name="category"
            required
            className="form-input"
            value={formData.category}
            onChange={handleChange}
          >
            <option value="">Select category</option>
            <option value="Egg Sales">Egg Sales</option>
            <option value="Chicken Sales">Chicken Sales</option>
            <option value="Crop Sales">Crop Sales</option>
            <option value="Other Sales">Other Sales</option>
          </select>
        </div>

        <div>
          <label htmlFor="paymentMethod" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Payment Method
          </label>
          <select
            id="paymentMethod"
            name="paymentMethod"
            required
            className="form-input"
            value={formData.paymentMethod}
            onChange={handleChange}
          >
            <option value="CASH">Cash</option>
            <option value="TRANSFER">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Date
          </label>
          <input
            type="date"
            id="date"
            name="date"
            required
            className="form-input"
            value={formData.date}
            onChange={handleChange}
          />
        </div>

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

        <button
          type="submit"
          disabled={isLoading}
          className="btn btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Recording...' : 'Record Income'}
        </button>
      </form>
    </div>
  );
};

export default IncomeForm;
