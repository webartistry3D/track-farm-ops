import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, RefreshCw, Search, Calendar } from 'lucide-react';
import api from '../lib/api';
import ConfirmModal from './ConfirmModal';

interface PaymentRequest {
  id: number;
  paymentReference: string;
  amount: number;
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED';
  planId: string;
  billingCycle: string;
  submittedAt: string;
  paymentRequestExpiresAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
  organization: {
    id: number;
    name: string;
  };
}

const SuperUserPaymentReview = () => {
  const [payments, setPayments] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'EXPIRED'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [selectedPayment, setSelectedPayment] = useState<PaymentRequest | null>(null);
  const [confirmModal, setConfirmModal] = useState<{ isOpen: boolean; paymentId: number | null }>({ isOpen: false, paymentId: null });

  const fetchPayments = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await api.get('/superuser/payments');
      setPayments(response.data.paymentRequests || []);
    } catch (err: any) {
      console.error('Fetch payments error:', err);
      setError(err.response?.data?.error || 'Failed to fetch payment requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleApprove = async (paymentId: number) => {
    setConfirmModal({ isOpen: true, paymentId });
  };

  const confirmApprove = async () => {
    if (confirmModal.paymentId === null) return;

    try {
      setActionLoading(confirmModal.paymentId);
      await api.patch(`/superuser/payments/${confirmModal.paymentId}/approve`, {
        note: reviewNote
      });
      setReviewNote('');
      setSelectedPayment(null);
      await fetchPayments();
    } catch (err: any) {
      console.error('Approve payment error:', err);
      setError(err.response?.data?.error || 'Failed to approve payment');
    } finally {
      setActionLoading(null);
      setConfirmModal({ isOpen: false, paymentId: null });
    }
  };

  const handleReject = async (paymentId: number) => {
    if (!reviewNote.trim()) {
      setError('Please provide a rejection reason');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this payment?')) return;

    try {
      setActionLoading(paymentId);
      await api.patch(`/superuser/payments/${paymentId}/reject`, {
        note: reviewNote
      });
      setReviewNote('');
      setSelectedPayment(null);
      await fetchPayments();
    } catch (err: any) {
      console.error('Reject payment error:', err);
      setError(err.response?.data?.error || 'Failed to reject payment');
    } finally {
      setActionLoading(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const formatStatus = (status: string) => {
    return status.toLowerCase().replace('_', ' ');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'REJECTED':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'UNDER_REVIEW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'EXPIRED':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  const filteredPayments = payments.filter((payment) => {
    const matchesFilter = filter === 'all' || payment.status === filter;
    const searchLower = searchTerm.toLowerCase();
    const matchesSearch =
      payment.paymentReference.toLowerCase().includes(searchLower) ||
      payment.user.name.toLowerCase().includes(searchLower) ||
      payment.user.email.toLowerCase().includes(searchLower) ||
      payment.organization.name.toLowerCase().includes(searchLower);
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Payment Review</h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Review and approve manual bank transfer payments
          </p>
        </div>
        <button
          onClick={fetchPayments}
          disabled={loading}
          className="flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
          <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by reference, user, or organization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="UNDER_REVIEW">Under Review</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="EXPIRED">Expired</option>
        </select>
      </div>

      {/* Payment List */}
      {filteredPayments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="text-4xl mb-3">💳</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            No payment requests found
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            {filter === 'all'
              ? 'There are no manual bank transfer payments to review.'
              : `No ${formatStatus(filter)} payments found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredPayments.map((payment) => (
            <div
              key={payment.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(
                          payment.status
                        )}`}
                      >
                        {formatStatus(payment.status)}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3 inline mr-1" />
                        {new Date(payment.submittedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {formatCurrency(payment.amount)}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                      Reference: <strong className="font-mono">{payment.paymentReference}</strong>
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Plan: <strong className="capitalize">{payment.planId}</strong> ({payment.billingCycle})
                    </p>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    <p>
                      <strong>User:</strong> {payment.user.name}
                    </p>
                    <p>{payment.user.email}</p>
                    <p className="mt-1">
                      <strong>Organization:</strong> {payment.organization.name}
                    </p>
                  </div>
                </div>

                {payment.status === 'PENDING' || payment.status === 'UNDER_REVIEW' ? (
                  <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                    {selectedPayment?.id === payment.id ? (
                      <div className="space-y-3">
                        <textarea
                          value={reviewNote}
                          onChange={(e) => setReviewNote(e.target.value)}
                          placeholder="Add review note (required for rejection)..."
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 dark:bg-gray-700 dark:text-white text-sm"
                          rows={3}
                        />
                        <div className="flex gap-3">
                          <button
                            onClick={() => handleApprove(payment.id)}
                            disabled={actionLoading === payment.id}
                            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === payment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <CheckCircle className="w-4 h-4 mr-2" />
                            )}
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(payment.id)}
                            disabled={actionLoading === payment.id}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                          >
                            {actionLoading === payment.id ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                            ) : (
                              <XCircle className="w-4 h-4 mr-2" />
                            )}
                            Reject
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPayment(null);
                              setReviewNote('');
                            }}
                            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setSelectedPayment(payment)}
                        className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                      >
                        Review Payment
                      </button>
                    )}
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, paymentId: null })}
        onConfirm={confirmApprove}
        title="Confirm Approval"
        message="Are you sure you want to approve this payment?"
        confirmText="Approve"
        cancelText="Cancel"
        type="info"
      />
    </div>
  );
};

export default SuperUserPaymentReview;
