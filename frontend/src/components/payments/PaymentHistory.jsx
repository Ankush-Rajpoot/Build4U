import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  History,
  TrendingUp,
  Eye
} from 'lucide-react';
import paymentService from '../../services/paymentService.js';

const PaymentHistory = ({ serviceRequestId, userType }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  useEffect(() => {
    loadPaymentHistory();
  }, [serviceRequestId]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      const response = await paymentService.getPaymentHistory(serviceRequestId);
      setPaymentData(response.data);
    } catch (error) {
      setError(error.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await paymentService.respondToPaymentRequest(requestId, 'approve');
      loadPaymentHistory(); // Refresh data
    } catch (error) {
      setError(error.message || 'Failed to approve payment');
    }
  };

  const handleDecline = async (requestId, reason) => {
    try {
      await paymentService.respondToPaymentRequest(requestId, 'decline', reason);
      loadPaymentHistory(); // Refresh data
    } catch (error) {
      setError(error.message || 'Failed to decline payment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
      case 'processed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'declined':
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <button
          onClick={loadPaymentHistory}
          className="mt-2 text-sm text-red-600 dark:text-red-300 hover:text-red-800 dark:hover:text-red-200 underline"
        >
          Try Again
        </button>
      </div>
    );
  }

  const { summary, paymentRequests, transactions } = paymentData || {};

  return (
    <div className="space-y-6">
      {/* Test Mode Indicator */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
              🧪 TEST MODE - All payments are simulated for testing
            </span>
          </div>
        </div>
      )}

      {/* Budget Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-blue-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Budget Overview</h3>
        </div>
        
        {summary && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm text-blue-600 dark:text-blue-400 font-medium">Total Budget</p>
              <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                {paymentService.formatCurrency(summary.totalBudget)}
              </p>
            </div>
            <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
              <p className="text-sm text-green-600 dark:text-green-400 font-medium">Amount Paid</p>
              <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                {paymentService.formatCurrency(summary.amountPaid)}
              </p>
            </div>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-medium">Pending</p>
              <p className="text-2xl font-bold text-yellow-900 dark:text-yellow-100">
                {paymentService.formatCurrency(summary.amountPending)}
              </p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">Remaining</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {paymentService.formatCurrency(summary.remainingBudget)}
              </p>
            </div>
          </div>
        )}

        {summary && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Budget Utilization</span>
              <span>{summary.utilizationPercentage}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${summary.utilizationPercentage}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setSelectedTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'overview'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Payment Requests
          </button>
          <button
            onClick={() => setSelectedTab('transactions')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              selectedTab === 'transactions'
                ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
            }`}
          >
            Transaction History
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {selectedTab === 'overview' && (
        <div className="space-y-4">
          {paymentRequests && paymentRequests.length > 0 ? (
            paymentRequests.map((request) => (
              <PaymentRequestCard
                key={request._id}
                request={request}
                userType={userType}
                onApprove={handleApprove}
                onDecline={handleDecline}
                getStatusIcon={getStatusIcon}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <History className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No payment requests yet</p>
            </div>
          )}
        </div>
      )}

      {selectedTab === 'transactions' && (
        <div className="space-y-4">
          {transactions && transactions.length > 0 ? (
            transactions.map((transaction) => (
              <TransactionCard
                key={transaction._id}
                transaction={transaction}
                getStatusIcon={getStatusIcon}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <DollarSign className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p>No transactions yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// Payment Request Card Component
const PaymentRequestCard = ({ request, userType, onApprove, onDecline, getStatusIcon }) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const handleDeclineSubmit = () => {
    onDecline(request._id, declineReason);
    setShowDeclineModal(false);
    setDeclineReason('');
  };

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {getStatusIcon(request.status)}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">
                {paymentService.formatCurrency(request.amount)}
              </h4>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Requested on {new Date(request.requestedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentService.getStatusColor(request.status)}`}>
            {paymentService.getStatusText(request.status)}
          </span>
        </div>

        <p className="text-gray-700 dark:text-gray-300 mb-4">{request.description}</p>

        {request.status === 'pending' && userType === 'Client' && (
          <div className="flex gap-3">
            <button
              onClick={() => onApprove(request._id)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => setShowDeclineModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
          </div>
        )}

        {request.status === 'declined' && request.declineReason && (
          <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-300">
              <strong>Decline Reason:</strong> {request.declineReason}
            </p>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              Decline Payment Request
            </h3>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleDeclineSubmit}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg"
              >
                Decline
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// Transaction Card Component
const TransactionCard = ({ transaction, getStatusIcon }) => {
  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          {getStatusIcon(transaction.status)}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              {paymentService.formatCurrency(transaction.amount)}
            </h4>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Transaction ID: {transaction.transactionId}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentService.getStatusColor(transaction.status)}`}>
          {paymentService.getStatusText(transaction.status)}
        </span>
      </div>

      {transaction.description && (
        <p className="text-gray-700 dark:text-gray-300 mb-3">{transaction.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600 dark:text-gray-400">Platform Fee:</span>
          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
            {paymentService.formatCurrency(transaction.platformFee)}
          </span>
        </div>
        <div>
          <span className="text-gray-600 dark:text-gray-400">Worker Amount:</span>
          <span className="ml-2 font-medium text-green-600 dark:text-green-400">
            {paymentService.formatCurrency(transaction.workerAmount)}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-600 dark:text-gray-400">Processed:</span>
          <span className="ml-2 font-medium text-gray-900 dark:text-gray-100">
            {new Date(transaction.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentHistory;
