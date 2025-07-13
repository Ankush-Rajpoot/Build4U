import React, { useState, useEffect } from 'react';
import { 
  X, 
  ArrowLeft, 
  IndianRupee, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  History,
  TrendingUp,
  Eye,
  CreditCard,
  Receipt,
  User,
  Users
} from 'lucide-react';
import paymentService from '../../services/paymentService.js';
import { PaymentHistorySkeleton } from '../shared/skeletons';

const PaymentCenterModal = ({ isOpen = true, onClose, serviceRequestId, userType, request, embedded = false }) => {
  const [paymentData, setPaymentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showDetails, setShowDetails] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  


  useEffect(() => {
    if ((isOpen || embedded) && serviceRequestId) {
      // console.log('PaymentCenterModal props:', { userType, serviceRequestId, embedded });
      loadPaymentHistory();
    }
  }, [isOpen, embedded, serviceRequestId]);

  const loadPaymentHistory = async () => {
    try {
      setLoading(true);
      setError('');
      // console.log('Loading payment history for service request:', serviceRequestId);
      const response = await paymentService.getPaymentHistory(serviceRequestId);
      // console.log('Payment history response:', response);
      setPaymentData(response.data);
    } catch (error) {
      // console.error('Error loading payment history:', error);
      setError(error.message || 'Failed to load payment history');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      // console.log('Approving payment request:', requestId);
      await paymentService.respondToPaymentRequest(requestId, 'approve');
      // console.log('Payment request approved, refreshing data');
      await loadPaymentHistory(); // Refresh data
    } catch (error) {
      // console.error('Error approving payment:', error);
      setError(error.message || 'Failed to approve payment');
    }
  };

  const handleDecline = async (requestId, reason) => {
    try {
      // console.log('Declining payment request:', requestId, 'with reason:', reason);
      await paymentService.respondToPaymentRequest(requestId, 'decline', reason);
      // console.log('Payment request declined, refreshing data');
      await loadPaymentHistory(); // Refresh data
    } catch (error) {
      // console.error('Error declining payment:', error);
      setError(error.message || 'Failed to decline payment');
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-amber-600" />;
      case 'approved':
      case 'processed':
      case 'success':
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />;
      case 'declined':
        return <XCircle className="h-4 w-4 text-orange-500" />;
      case 'failed':
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />;
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleBack = () => {
    setShowDetails(false);
    setSelectedItem(null);
    setActiveTab('overview');
  };

  const handleViewDetails = (item) => {
    setSelectedItem(item);
    setShowDetails(true);
  };

  if (!isOpen && !embedded) return null;

  const { summary, paymentRequests, transactions } = paymentData || {};

  // Embedded version for use inside tabs
  if (embedded) {
    return (
      <div className="h-full">
        {/* Test Mode Indicator */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mb-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                Test Mode - No real payments will be processed
              </span>
            </div>
          </div>
        )}

        {loading ? (
          <PaymentHistorySkeleton />
        ) : error ? (
          <div className="p-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg text-center">
            <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
            <p className="text-red-600 dark:text-red-300 font-medium mb-2">Failed to load payment data</p>
            <p className="text-red-500 dark:text-red-400 text-sm mb-4">{error}</p>
            <button
              onClick={loadPaymentHistory}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : (
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {/* Summary Cards */}
            {summary && (
              <div className="grid grid-cols-3 gap-2 sm:gap-3 lg:gap-4 mb-4 sm:mb-6">
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 border border-emerald-200 dark:border-emerald-700 rounded-lg p-2 sm:p-3 hover:from-emerald-100 hover:to-emerald-150 dark:hover:from-emerald-800/30 dark:hover:to-emerald-700/30 transition-all duration-200 shadow-sm">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-emerald-500 rounded-full flex items-center justify-center mr-1 sm:mr-2 shadow-md flex-shrink-0">
                      <IndianRupee className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-emerald-800 dark:text-emerald-300 leading-tight">
                      {(userType === 'worker' || userType === 'Worker') ? 'Earned' : 'Paid'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-emerald-900 dark:text-emerald-200">
                    {formatCurrency(summary.amountPaid || 0)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20 border border-amber-200 dark:border-amber-700 rounded-lg p-2 sm:p-3 hover:from-amber-100 hover:to-amber-150 dark:hover:from-amber-800/30 dark:hover:to-amber-700/30 transition-all duration-200 shadow-sm">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-amber-500 rounded-full flex items-center justify-center mr-1 sm:mr-2 shadow-md flex-shrink-0">
                      <Clock className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-amber-800 dark:text-amber-300 leading-tight">Pending</span>
                  </div>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-amber-900 dark:text-amber-200">
                    {formatCurrency(summary.amountPending || 0)}
                  </p>
                </div>
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border border-blue-200 dark:border-blue-700 rounded-lg p-2 sm:p-3 hover:from-blue-100 hover:to-blue-150 dark:hover:from-blue-800/30 dark:hover:to-blue-700/30 transition-all duration-200 shadow-sm">
                  <div className="flex items-center mb-1 sm:mb-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 bg-blue-500 rounded-full flex items-center justify-center mr-1 sm:mr-2 shadow-md flex-shrink-0">
                      <Receipt className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-white" />
                    </div>
                    <span className="text-xs sm:text-sm font-semibold text-blue-800 dark:text-blue-300 leading-tight">
                      {(userType === 'worker' || userType === 'Worker') ? 'Budget Left' : 'Remaining'}
                    </span>
                  </div>
                  <p className="text-sm sm:text-lg lg:text-xl font-bold text-blue-900 dark:text-blue-200">
                    {formatCurrency(summary.remainingBudget || 0)}
                  </p>
                </div>
              </div>
            )}

            {/* Payment Requests */}
            {paymentRequests && paymentRequests.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-[#A3A3A3] mb-4 flex items-center">
                  <div className="w-2 h-6 bg-emerald-500 rounded-full mr-3"></div>
                  Payment Requests
                </h3>
                <div className="space-y-3">
                  {paymentRequests.map((request, index) => (
                    <div
                      key={request._id || index}
                      className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#404040] rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-[#171717] hover:border-slate-300 dark:hover:border-[#525252] transition-all duration-200 shadow-sm hover:shadow-md payment-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(request.status)}
                          <div className="ml-3">
                            <p className="font-medium text-gray-900 dark:text-[#A3A3A3]">{formatCurrency(request.amount)}</p>
                            <p className="text-sm text-gray-500 dark:text-[#737373]">{formatDate(request.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            request.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            (request.status === 'approved' || request.status === 'success' || request.status === 'completed') ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            request.status === 'declined' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            (request.status === 'failed' || request.status === 'error') ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {request.status}
                          </span>
                        </div>
                      </div>
                      {request.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{request.description}</p>
                      )}
                      
                      {/* Action buttons for clients */}
                      {(userType === 'client' || userType === 'Client') && request.status === 'pending' && (
                        <div className="flex space-x-3 mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                          <button
                            onClick={() => handleApprove(request._id)}
                            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all duration-200 text-sm font-semibold shadow-md hover:shadow-lg"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => {
                              const reason = prompt('Please provide a reason for declining:');
                              if (reason) handleDecline(request._id, reason);
                            }}
                            className="flex-1 px-4 py-2.5 bg-slate-200 dark:bg-slate-600 text-slate-700 dark:text-slate-200 rounded-lg hover:bg-slate-300 dark:hover:bg-slate-500 hover:text-slate-800 dark:hover:text-slate-100 transition-all duration-200 text-sm font-semibold border border-slate-300 dark:border-slate-500"
                          >
                            Decline
                          </button>
                        </div>
                      )}

                      {request.status === 'declined' && request.declineReason && (
                        <div className="mt-3 p-3 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded-lg text-xs text-orange-800 dark:text-orange-300">
                          <strong>Declined:</strong> {request.declineReason}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions */}
            {transactions && transactions.length > 0 && (
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-[#A3A3A3] mb-4 flex items-center">
                  <div className="w-2 h-6 bg-blue-500 rounded-full mr-3"></div>
                  Transactions
                </h3>
                <div className="space-y-3">
                  {transactions.map((transaction, index) => (
                    <div
                      key={transaction._id || index}
                      className="bg-white dark:bg-[#0A0A0A] border border-slate-200 dark:border-[#404040] rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-[#171717] hover:border-slate-300 dark:hover:border-[#525252] transition-all duration-200 shadow-sm hover:shadow-md payment-card"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          {getStatusIcon(transaction.status)}
                          <div className="ml-3">
                            <p className="font-medium text-gray-900 dark:text-[#A3A3A3]">{formatCurrency(transaction.amount)}</p>
                            <p className="text-sm text-gray-500 dark:text-[#737373]">{formatDate(transaction.createdAt)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            transaction.status === 'pending' ? 'bg-amber-100 text-amber-700 border border-amber-200' :
                            (transaction.status === 'processed' || transaction.status === 'success' || transaction.status === 'completed' || transaction.status === 'approved') ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                            transaction.status === 'declined' ? 'bg-orange-100 text-orange-700 border border-orange-200' :
                            (transaction.status === 'failed' || transaction.status === 'error') ? 'bg-red-100 text-red-700 border border-red-200' :
                            'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}>
                            {transaction.status}
                          </span>
                        </div>
                      </div>
                      {transaction.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">{transaction.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {(!paymentRequests || paymentRequests.length === 0) && (!transactions || transactions.length === 0) && (
              <div className="text-center py-8">
                <IndianRupee className="h-12 w-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400 font-medium">No payment activity yet</p>
                <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                  {(userType === 'worker' || userType === 'Worker')
                    ? 'You can request payment when work is in progress'
                    : 'Payment requests will appear here'
                  }
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // Full modal version (if needed for standalone use)
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={onClose} />
      
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-4xl bg-white dark:bg-[#0A0A0A] rounded-xl shadow-2xl border border-gray-200 dark:border-[#404040] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {showDetails && (
                  <button
                    onClick={handleBack}
                    className="mr-3 p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                  >
                    <ArrowLeft className="h-5 w-5 text-white" />
                  </button>
                )}
                <div className="w-10 h-10 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {showDetails ? 'Payment Details' : 'Payment Center'}
                  </h3>
                  <p className="text-indigo-100 text-sm">
                    {showDetails ? 'View detailed information' : 'Manage your payments and requests'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="p-6">
            {loading ? (
              <PaymentHistorySkeleton />
            ) : error ? (
              <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
                <XCircle className="h-8 w-8 text-red-500 mx-auto mb-3" />
                <p className="text-red-600 font-medium mb-2">Failed to load payment data</p>
                <p className="text-red-500 text-sm mb-4">{error}</p>
                <button
                  onClick={loadPaymentHistory}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Try Again
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Summary and content would go here for full modal */}
                <p className="text-gray-600 dark:text-gray-300">Full modal view - implement as needed</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentCenterModal;
