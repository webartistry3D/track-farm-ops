import { useState, useEffect } from 'react';
import { X, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import api from '../lib/api';

interface BankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  planId: string;
  planName: string;
  amount: number;
  billingCycle: string;
  onSubmitted: () => void;
}

interface BankDetails {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface PaymentRequestData {
  paymentRequest: {
    id: number;
    paymentReference: string;
    status: string;
    paymentRequestExpiresAt: string;
  };
  bankDetails: BankDetails;
}

const BankTransferModal = ({
  isOpen,
  onClose,
  planId,
  planName,
  amount,
  billingCycle,
  onSubmitted
}: BankTransferModalProps) => {
  const [step, setStep] = useState<'details' | 'confirmation' | 'submitting' | 'success' | 'error'>('details');
  const [paymentData, setPaymentData] = useState<PaymentRequestData | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && !paymentData && step === 'details') {
      initiatePayment();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(value);
  };

  const initiatePayment = async () => {
    try {
      setStep('submitting');
      setError('');
      const response = await api.post('/payments/manual/initiate', {
        planId,
        billingCycle
      });
      setPaymentData(response.data);
      setStep('details');
    } catch (err: any) {
      console.error('Initiate payment error:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
      setStep('error');
    }
  };

  const submitPayment = async () => {
    if (!paymentData?.paymentRequest?.id) return;

    try {
      setIsSubmitting(true);
      setError('');
      await api.post('/payments/manual/submit', {
        paymentRequestId: paymentData.paymentRequest.id
      });
      setStep('success');
      onSubmitted();
    } catch (err: any) {
      console.error('Submit payment error:', err);
      setError(err.response?.data?.error || 'Failed to submit payment. Please try again.');
      setIsSubmitting(false);
    }
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    });
  };

  const handleClose = () => {
    setStep('details');
    setPaymentData(null);
    setError('');
    setIsSubmitting(false);
    onClose();
  };

  const renderContent = () => {
    if (step === 'error') {
      return (
        <div className="text-center py-6">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Payment Error</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={initiatePayment}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }

    if (step === 'success') {
      return (
        <div className="text-center py-6">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Payment Submitted</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Your payment is now under review. You will be notified once verified by our team.
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Done
          </button>
        </div>
      );
    }

    if (!paymentData) {
      return (
        <div className="text-center py-6">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-sm text-gray-600 dark:text-gray-400">Preparing your payment details...</p>
        </div>
      );
    }

    const { bankDetails, paymentRequest } = paymentData;

    return (
      <div className="space-y-4">
        {/* Plan Summary */}
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Plan</span>
            <span className="font-semibold text-gray-900 dark:text-white">{planName}</span>
          </div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">Billing</span>
            <span className="font-semibold text-gray-900 dark:text-white capitalize">{billingCycle}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 dark:text-gray-400">Amount</span>
            <span className="font-bold text-lg text-green-600 dark:text-green-400">{formatCurrency(amount)}</span>
          </div>
        </div>

        {/* Bank Details */}
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center">
            <span className="mr-2">🏦</span> Bank Transfer Details
          </h4>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">Bank Name</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">{bankDetails.bankName}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.bankName, 'bank')}
                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
              >
                {copiedField === 'bank' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">Account Name</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100">{bankDetails.accountName}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.accountName, 'name')}
                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
              >
                {copiedField === 'name' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            <div className="flex justify-between items-center">
              <div>
                <p className="text-xs text-blue-600 dark:text-blue-400 uppercase tracking-wide">Account Number</p>
                <p className="font-semibold text-blue-900 dark:text-blue-100 text-lg">{bankDetails.accountNumber}</p>
              </div>
              <button
                onClick={() => copyToClipboard(bankDetails.accountNumber, 'number')}
                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-800 rounded transition-colors"
              >
                {copiedField === 'number' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* Reference */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs text-yellow-700 dark:text-yellow-400 uppercase tracking-wide mb-1">
                <Clock className="w-3 h-3 inline mr-1" />
                Payment Reference (must include in transfer description)
              </p>
              <p className="font-mono font-bold text-lg text-yellow-900 dark:text-yellow-100">
                {paymentRequest.paymentReference}
              </p>
            </div>
            <button
              onClick={() => copyToClipboard(paymentRequest.paymentReference, 'reference')}
              className="p-2 text-yellow-700 hover:bg-yellow-100 dark:hover:bg-yellow-800 rounded transition-colors"
            >
              {copiedField === 'reference' ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-2">
            Use this exact reference when making the transfer. Payments without this reference may be delayed.
          </p>
          {paymentRequest.paymentRequestExpiresAt && (
            <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
              Expires: {new Date(paymentRequest.paymentRequestExpiresAt).toLocaleString()}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="text-sm text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
          <p className="mb-1"><strong>Steps:</strong></p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Transfer {formatCurrency(amount)} to the account above</li>
            <li>Use reference: <strong>{paymentRequest.paymentReference}</strong></li>
            <li>Click "I've Sent the Money" below</li>
            <li>Wait for verification (usually within 24 hours)</li>
          </ol>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-3 py-2 rounded-md text-sm">
            {error}
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={submitPayment}
            disabled={isSubmitting}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {isSubmitting ? 'Submitting...' : "I've Sent the Money"}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-md w-full max-h-[75vh] flex flex-col">
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 flex items-center justify-between flex-shrink-0">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {step === 'success' ? 'Payment Submitted' : 'Pay via Bank Transfer'}
          </h3>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-y-auto flex-1">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default BankTransferModal;
