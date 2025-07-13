import React, { useState } from 'react';
import { X, IndianRupee, Send, User } from 'lucide-react';
import paymentService from '../../services/paymentService.js';

const PaymentRequestModal = ({ isOpen, onClose, serviceRequest, onPaymentRequested }) => {
  // Payment Request Form State
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const handleCreatePaymentRequest = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setFormError('');

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error('Please enter a valid amount');
      }
      if (!description.trim()) {
        throw new Error('Please provide a description');
      }

      await paymentService.createPaymentRequest(
        serviceRequest._id,
        parseFloat(amount),
        description.trim()
      );

      // Reset form
      setAmount('');
      setDescription('');
      
      // Notify parent component
      if (onPaymentRequested) {
        onPaymentRequested();
      }

      // Close modal
      onClose();
      
    } catch (error) {
      setFormError(error.response?.data?.message || error.message);
    } finally {
      setFormLoading(false);
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

  const handleClose = () => {
    setAmount('');
    setDescription('');
    setFormError('');
    onClose();
  };

  if (!isOpen || !serviceRequest) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity" onClick={handleClose} />
      
      {/* Modal positioned to match RequestCard dimensions */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          {/* Payment Request Form */}
          <div className="bg-white dark:bg-[#0A0A0A] rounded-xl shadow-2xl border border-gray-200 dark:border-[#404040] overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-teal-700 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center mr-3">
                    <IndianRupee className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">Request Payment</h3>
                    <p className="text-emerald-100 text-sm">Submit payment request to client</p>
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {/* Service Request Info */}
            <div className="p-4 bg-gray-50 dark:bg-[#171717] border-b border-gray-200 dark:border-[#404040]">
              <h4 className="font-semibold text-gray-900 dark:text-[#A3A3A3] mb-1">{serviceRequest.title}</h4>
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-[#737373]">
                <span className="bg-gray-200 dark:bg-[#262626] text-gray-700 dark:text-[#A3A3A3] px-2 py-1 rounded">{serviceRequest.category}</span>
                <span>Budget: {formatCurrency(serviceRequest.budget)}</span>
              </div>
              {serviceRequest.client && (
                <div className="flex items-center mt-2 text-sm text-gray-600 dark:text-[#737373]">
                  <User className="h-4 w-4 mr-1" />
                  <span>Client: {serviceRequest.client.name}</span>
                </div>
              )}
            </div>

            {/* Test Mode Indicator */}
            {(process.env.NODE_ENV === 'development' || window.location.hostname === 'localhost') && (
              <div className="mx-4 mt-4 bg-yellow-50 dark:bg-[#171717] border border-yellow-200 dark:border-[#404040] rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
                  <span className="text-sm font-medium text-yellow-800 dark:text-[#A3A3A3]">
                    Test Mode - Payment requests will be created but no real charges will occur
                  </span>
                </div>
              </div>
            )}

            {/* Form */}
            <div className="p-4">
              {formError && (
                <div className="mb-4 bg-red-50 dark:bg-[#171717] border border-red-200 dark:border-[#404040] text-red-700 dark:text-red-400 px-3 py-2 rounded-lg text-sm">
                  {formError}
                </div>
              )}

              <form onSubmit={handleCreatePaymentRequest} className="space-y-4">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                    Amount (USD) *
                  </label>
                  <div className="relative">
                    <IndianRupee className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-[#737373]" />
                    <input
                      type="number"
                      id="amount"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min="0.01"
                      step="0.01"
                      max={serviceRequest.budget}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-[#404040] bg-white dark:bg-[#171717] text-gray-900 dark:text-[#A3A3A3] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-[#525252] mt-1">
                    Maximum: {formatCurrency(serviceRequest.budget)}
                  </p>
                </div>

                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-[#A3A3A3] mb-1">
                    Description *
                  </label>
                  <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-[#404040] bg-white dark:bg-[#171717] text-gray-900 dark:text-[#A3A3A3] rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    placeholder="Describe the work completed or milestone reached..."
                    required
                  />
                </div>

                <div className="flex space-x-3 pt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-[#404040] text-gray-700 dark:text-[#A3A3A3] bg-white dark:bg-[#171717] rounded-lg hover:bg-gray-50 dark:hover:bg-[#262626] transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formLoading}
                    className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 transition-colors flex items-center justify-center"
                  >
                    {formLoading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-2"></div>
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Request
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentRequestModal;
