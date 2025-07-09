import React, { useState, useEffect } from 'react';
import { X, DollarSign, Send, Clock, CheckCircle, XCircle, AlertCircle, TrendingUp, History, ArrowLeft, UserPlus } from 'lucide-react';
import paymentService from '../../services/paymentService.js';
import { serviceRequestService } from '../../services/serviceRequestService.js';
import { useUser } from '../../context/UserContext.jsx';

const PaymentModal = ({ open, onClose, serviceRequest, onPaymentRequested }) => {
  const { user } = useUser();
  const userType = user?.constructor?.modelName || (user?.skills ? 'Worker' : 'Client');
  const [isFlipped, setIsFlipped] = useState(false);
  
  // Payment Request Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Payment History State
  const [paymentData, setPaymentData] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  useEffect(() => {
    if (open && isFlipped) {
      loadPaymentHistory();
    }
  }, [open, isFlipped]);

  const loadPaymentHistory = async () => {
    try {
      setHistoryLoading(true);
      const response = await paymentService.getPaymentHistory(serviceRequest._id);
      setPaymentData(response.data);
    } catch (error) {
      setError(error.message || 'Failed to load payment history');
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Debug logging
    // console.log('Payment request submission:', {
    //   serviceRequestId: serviceRequest._id,
    //   amount: parseFloat(amount),
    //   description,
    //   serviceRequest: {
    //     title: serviceRequest.title,
    //     status: serviceRequest.status,
    //     worker: serviceRequest.worker
    //   }
    // });

    try {
      const response = await paymentService.createPaymentRequest(
        serviceRequest._id,
        parseFloat(amount),
        description
      );

      if (response.success) {
        setAmount('');
        setDescription('');
        onPaymentRequested && onPaymentRequested(response.data);
        // Flip to show history after successful request
        setIsFlipped(true);
      }
    } catch (error) {
      console.error('Payment request failed:', error);
      setError(error.message || 'Failed to create payment request');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await paymentService.respondToPaymentRequest(requestId, 'approve');
      loadPaymentHistory();
    } catch (error) {
      setError(error.message || 'Failed to approve payment');
    }
  };

  const handleDecline = async (requestId, reason) => {
    try {
      await paymentService.respondToPaymentRequest(requestId, 'decline', reason);
      loadPaymentHistory();
    } catch (error) {
      setError(error.message || 'Failed to decline payment');
    }
  };

  const handleAssignWorker = async () => {
    try {
      setLoading(true);
      await serviceRequestService.assignWorkerForTesting(serviceRequest._id);
      setError('');
      // Show success message
      alert('Worker assigned successfully! You can now create payment requests.');
    } catch (error) {
      setError(error.message || 'Failed to assign worker');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setIsFlipped(false);
    setAmount('');
    setDescription('');
    setError('');
    onClose();
  };

  const isValidAmount = amount && parseFloat(amount) > 0;
  const isValidDescription = description.trim().length >= 5;

  if (!open) return null;

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

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-40 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 h-[600px] perspective-1000">
        <div
          className={`relative w-full h-full transition-transform duration-700 transform-style-preserve-3d ${
            isFlipped ? 'rotate-y-180' : ''
          }`}
        >
          {/* Front: Payment Request Form (Workers) or Payment Requests to Approve (Clients) */}
          <div className="absolute inset-0 w-full h-full backface-hidden">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 h-full overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    {userType === 'Worker' ? 'Request Payment' : 'Payment Requests'}
                  </h2>
                  <p className="text-sm text-gray-600 mt-1">{serviceRequest.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFlipped(true)}
                    className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="View Payment History"
                  >
                    <History className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
                {userType === 'Worker' ? (
                  /* Worker: Payment Request Form */
                  <div>
                    <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h3 className="font-medium text-blue-900">{serviceRequest.title}</h3>
                      <p className="text-sm text-blue-700">
                        Total Budget: {paymentService.formatCurrency(serviceRequest.budget)}
                      </p>
                      <div className="mt-2 text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded inline-block">
                        🧪 TEST MODE - No real payments will be processed
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Amount (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          min="1"
                          max={serviceRequest.budget}
                          step="1"
                          required
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Enter amount"
                        />
                        {amount && (
                          <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded border">
                            <div className="flex justify-between">
                              <span>Platform Fee (5%):</span>
                              <span className="text-red-600">-{paymentService.formatCurrency(paymentService.calculatePlatformFee(parseFloat(amount) || 0))}</span>
                            </div>
                            <div className="flex justify-between font-medium text-green-600 mt-1 pt-1 border-t border-gray-200">
                              <span>You'll receive:</span>
                              <span>{paymentService.formatCurrency(paymentService.calculateWorkerAmount(parseFloat(amount) || 0))}</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                          rows={4}
                          minLength={5}
                          maxLength={200}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                          placeholder="Brief description of work completed (e.g., 'Completed initial design phase')"
                        />
                        <div className="mt-1 text-xs text-gray-500">
                          {description.length}/200 characters (minimum 5)
                        </div>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                          <p className="text-sm text-red-600">{error}</p>
                          {error.includes('not authorized') && userType === 'Worker' && (
                            <div className="mt-3">
                              <p className="text-sm text-gray-600 mb-2">
                                This usually means you're not assigned to this service request yet.
                              </p>
                              <button
                                onClick={handleAssignWorker}
                                disabled={loading}
                                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                              >
                                {loading ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                ) : (
                                  <UserPlus className="h-4 w-4" />
                                )}
                                Assign Myself (Testing)
                              </button>
                            </div>
                          )}
                        </div>
                      )}

                      <div className="flex gap-3 pt-4">
                        <button
                          type="button"
                          onClick={handleClose}
                          className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                          disabled={loading}
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={loading || !isValidAmount || !isValidDescription}
                          className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-4 py-3 rounded-lg transition-colors font-medium"
                        >
                          {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent" />
                          ) : (
                            <>
                              <Send className="h-5 w-5" />
                              Send Payment Request
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Client: Payment Requests to Approve */
                  <ClientPaymentRequests
                    serviceRequest={serviceRequest}
                    onApprove={handleApprove}
                    onDecline={handleDecline}
                    getStatusIcon={getStatusIcon}
                    loading={historyLoading}
                    paymentData={paymentData}
                    loadPaymentHistory={loadPaymentHistory}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Back: Payment History */}
          <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
            <div className="bg-white rounded-xl shadow-2xl border border-gray-200 h-full overflow-hidden">
              <div className="flex justify-between items-center p-6 border-b border-gray-200">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Payment History</h2>
                  <p className="text-sm text-gray-600 mt-1">{serviceRequest.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsFlipped(false)}
                    className="text-blue-600 hover:text-blue-700 p-2 rounded-lg hover:bg-blue-50 transition-colors"
                    title="Back to Payment Request"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={handleClose}
                    className="text-gray-500 hover:text-gray-700 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              <div className="p-6 overflow-y-auto h-[calc(100%-80px)]">
                {historyLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
                  </div>
                ) : paymentData ? (
                  <div className="space-y-6">
                    {/* Budget Overview */}
                    {paymentData.summary && (
                      <div className="bg-gradient-to-r from-blue-50 to-green-50 p-6 rounded-lg border border-blue-200">
                        <div className="flex items-center gap-2 mb-4">
                          <TrendingUp className="h-5 w-5 text-blue-500" />
                          <h3 className="text-lg font-semibold text-gray-900">Budget Overview</h3>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-white p-3 rounded-lg border border-blue-100">
                            <p className="text-sm text-blue-600 font-medium">Total Budget</p>
                            <p className="text-xl font-bold text-blue-900">
                              {paymentService.formatCurrency(paymentData.summary.totalBudget)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-green-100">
                            <p className="text-sm text-green-600 font-medium">Amount Paid</p>
                            <p className="text-xl font-bold text-green-900">
                              {paymentService.formatCurrency(paymentData.summary.amountPaid)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-yellow-100">
                            <p className="text-sm text-yellow-600 font-medium">Pending</p>
                            <p className="text-xl font-bold text-yellow-900">
                              {paymentService.formatCurrency(paymentData.summary.amountPending)}
                            </p>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-gray-100">
                            <p className="text-sm text-gray-600 font-medium">Remaining</p>
                            <p className="text-xl font-bold text-gray-900">
                              {paymentService.formatCurrency(paymentData.summary.remainingBudget)}
                            </p>
                          </div>
                        </div>

                        <div className="bg-white p-3 rounded-lg border border-gray-100">
                          <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                            <span>Budget Utilization</span>
                            <span>{paymentData.summary.utilizationPercentage}%</span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                              style={{ width: `${paymentData.summary.utilizationPercentage}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Payment Requests */}
                    <div>
                      <h4 className="text-lg font-medium text-gray-900 mb-4">Payment Requests</h4>
                      {paymentData.paymentRequests && paymentData.paymentRequests.length > 0 ? (
                        <div className="space-y-3">
                          {paymentData.paymentRequests.map((request) => (
                            <PaymentRequestCard
                              key={request._id}
                              request={request}
                              onApprove={handleApprove}
                              onDecline={handleDecline}
                              getStatusIcon={getStatusIcon}
                            />
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                          <History className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                          <p>No payment requests yet</p>
                          <p className="text-sm mt-1">Create your first payment request using the form</p>
                        </div>
                      )}
                    </div>

                    {/* Transactions */}
                    {paymentData.transactions && paymentData.transactions.length > 0 && (
                      <div>
                        <h4 className="text-lg font-medium text-gray-900 mb-4">Transaction History</h4>
                        <div className="space-y-3">
                          {paymentData.transactions.map((transaction) => (
                            <TransactionCard
                              key={transaction._id}
                              transaction={transaction}
                              getStatusIcon={getStatusIcon}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <p>No payment data available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CSS for 3D flip effect */}
      <style>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
        .rotate-y-180 {
          transform: rotateY(180deg);
        }
      `}</style>
    </div>
  );
};

// Client Payment Requests Component
const ClientPaymentRequests = ({ serviceRequest, onApprove, onDecline, getStatusIcon, loading, paymentData, loadPaymentHistory }) => {
  const [error, setError] = useState('');

  useEffect(() => {
    if (!paymentData) {
      loadPaymentHistory();
    }
  }, [paymentData, loadPaymentHistory]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  const pendingRequests = paymentData?.paymentRequests?.filter(req => req.status === 'pending') || [];

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <div className="text-center">
        <div className="bg-blue-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
          <DollarSign className="h-8 w-8 text-blue-600" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">Payment Requests</h3>
        <p className="text-gray-600">
          Review and approve payment requests from your worker
        </p>
      </div>

      {pendingRequests.length > 0 ? (
        <div className="space-y-4">
          <h4 className="text-lg font-medium text-gray-900">Pending Approval ({pendingRequests.length})</h4>
          {pendingRequests.map((request) => (
            <PaymentRequestCard
              key={request._id}
              request={request}
              onApprove={onApprove}
              onDecline={onDecline}
              getStatusIcon={getStatusIcon}
              showActions={true}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <Clock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">No pending payment requests</p>
          <p className="text-sm mt-1">Payment requests from workers will appear here</p>
        </div>
      )}

      {/* Budget Summary */}
      {paymentData?.summary && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg border border-blue-200">
          <h4 className="text-sm font-medium text-blue-800 mb-3">Budget Summary</h4>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-blue-600">Total Budget:</span>
              <span className="ml-2 font-semibold text-blue-900">
                {paymentService.formatCurrency(paymentData.summary.totalBudget)}
              </span>
            </div>
            <div>
              <span className="text-green-600">Amount Paid:</span>
              <span className="ml-2 font-semibold text-green-900">
                {paymentService.formatCurrency(paymentData.summary.amountPaid)}
              </span>
            </div>
            <div>
              <span className="text-yellow-600">Pending:</span>
              <span className="ml-2 font-semibold text-yellow-900">
                {paymentService.formatCurrency(paymentData.summary.amountPending)}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Remaining:</span>
              <span className="ml-2 font-semibold text-gray-900">
                {paymentService.formatCurrency(paymentData.summary.remainingBudget)}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="pt-4 border-t border-gray-200">
        <p className="text-sm text-gray-500 text-center">
          💡 Tip: Approving payments will trigger automatic payouts to the worker's bank account
        </p>
      </div>
    </div>
  );
};

// Payment Request Card Component
const PaymentRequestCard = ({ request, onApprove, onDecline, getStatusIcon, showActions = false }) => {
  const [showDeclineModal, setShowDeclineModal] = useState(false);
  const [declineReason, setDeclineReason] = useState('');

  const handleDeclineSubmit = () => {
    onDecline(request._id, declineReason);
    setShowDeclineModal(false);
    setDeclineReason('');
  };

  return (
    <>
      <div className="bg-white p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            {getStatusIcon(request.status)}
            <div>
              <h4 className="font-medium text-gray-900">
                {paymentService.formatCurrency(request.amount)}
              </h4>
              <p className="text-sm text-gray-500">
                Requested on {new Date(request.requestedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentService.getStatusColor(request.status)}`}>
            {paymentService.getStatusText(request.status)}
          </span>
        </div>

        <p className="text-gray-700 mb-3">{request.description}</p>

        {request.status === 'pending' && showActions && (
          <div className="flex gap-2">
            <button
              onClick={() => onApprove(request._id)}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <CheckCircle className="h-4 w-4" />
              Approve
            </button>
            <button
              onClick={() => setShowDeclineModal(true)}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg transition-colors text-sm"
            >
              <XCircle className="h-4 w-4" />
              Decline
            </button>
          </div>
        )}

        {request.status === 'declined' && request.declineReason && (
          <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">
              <strong>Decline Reason:</strong> {request.declineReason}
            </p>
          </div>
        )}
      </div>

      {/* Decline Modal */}
      {showDeclineModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Decline Payment Request
            </h3>
            <textarea
              value={declineReason}
              onChange={(e) => setDeclineReason(e.target.value)}
              placeholder="Reason for declining (optional)"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowDeclineModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {getStatusIcon(transaction.status)}
          <div>
            <h4 className="font-medium text-gray-900">
              {paymentService.formatCurrency(transaction.amount)}
            </h4>
            <p className="text-sm text-gray-500">
              Transaction ID: {transaction.transactionId}
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${paymentService.getStatusColor(transaction.status)}`}>
          {paymentService.getStatusText(transaction.status)}
        </span>
      </div>

      {transaction.description && (
        <p className="text-gray-700 mb-3">{transaction.description}</p>
      )}

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-gray-600">Platform Fee:</span>
          <span className="ml-2 font-medium">
            {paymentService.formatCurrency(transaction.platformFee)}
          </span>
        </div>
        <div>
          <span className="text-gray-600">Worker Amount:</span>
          <span className="ml-2 font-medium text-green-600">
            {paymentService.formatCurrency(transaction.workerAmount)}
          </span>
        </div>
        <div className="col-span-2">
          <span className="text-gray-600">Processed:</span>
          <span className="ml-2 font-medium">
            {new Date(transaction.createdAt).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
