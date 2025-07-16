import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Save, 
  X, 
  Calendar, 
  User, 
  FileText, 
  DollarSign, 
  Tag,
  AlertCircle,
  Plus,
  Trash2,
  Calculator
} from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import { serviceRequestService } from '../../services/serviceRequestService';

const InvoiceForm = ({ isOpen, onClose, invoice = null, onSuccess }) => {
  const [formData, setFormData] = useState({
    serviceRequestId: '',
    clientId: '',
    dueDate: '',
    items: [{ description: '', quantity: 1, rate: 0, amount: 0 }],
    taxRate: 18, // Default GST rate in India
    notes: '',
    termsAndConditions: 'Payment due within 30 days of invoice date.'
  });
  const [serviceRequests, setServiceRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (isOpen) {
      fetchServiceRequests();
      if (invoice) {
        setFormData({
          serviceRequestId: invoice.serviceRequestId || '',
          clientId: invoice.clientId || '',
          dueDate: invoice.dueDate ? new Date(invoice.dueDate).toISOString().split('T')[0] : '',
          items: invoice.items || [{ description: '', quantity: 1, rate: 0, amount: 0 }],
          taxRate: invoice.taxRate || 18,
          notes: invoice.notes || '',
          termsAndConditions: invoice.termsAndConditions || 'Payment due within 30 days of invoice date.'
        });
      }
    }
  }, [isOpen, invoice]);

  const fetchServiceRequests = async () => {
    try {
      const response = await serviceRequestService.getWorkerJobs();
      const completedRequests = response.data.serviceRequests?.filter(
        req => req.status === 'completed'
      ) || [];
      setServiceRequests(completedRequests);
    } catch (error) {
      console.error('Error fetching service requests:', error);
    }
  };

  const calculateItemAmount = (quantity, rate) => {
    return quantity * rate;
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    
    if (field === 'quantity' || field === 'rate') {
      newItems[index].amount = calculateItemAmount(
        newItems[index].quantity,
        newItems[index].rate
      );
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, rate: 0, amount: 0 }]
    });
  };

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index);
      setFormData({ ...formData, items: newItems });
    }
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + item.amount, 0);
    const taxAmount = (subtotal * formData.taxRate) / 100;
    const total = subtotal + taxAmount;
    
    return { subtotal, taxAmount, total };
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.serviceRequestId) {
      newErrors.serviceRequestId = 'Service request is required';
    }
    
    if (!formData.dueDate) {
      newErrors.dueDate = 'Due date is required';
    }
    
    if (formData.items.some(item => !item.description || item.quantity <= 0 || item.rate <= 0)) {
      newErrors.items = 'All items must have description, valid quantity and rate';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const { subtotal, taxAmount, total } = calculateTotals();
      
      const invoiceData = {
        ...formData,
        subtotal,
        taxAmount,
        totalAmount: total
      };
      
      if (invoice) {
        await invoiceService.updateInvoice(invoice._id, invoiceData);
      } else {
        await invoiceService.createInvoice(invoiceData);
      }
      
      onSuccess && onSuccess();
      onClose();
    } catch (error) {
      console.error('Error saving invoice:', error);
      setErrors({ submit: 'Failed to save invoice. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const { subtotal, taxAmount, total } = calculateTotals();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white dark:bg-dark-surface rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
      >
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-border">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-dark-text">
            {invoice ? 'Edit Invoice' : 'Create New Invoice'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-6 space-y-6">
            {/* Service Request & Due Date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Service Request *
                </label>
                <select
                  value={formData.serviceRequestId}
                  onChange={(e) => {
                    const selectedRequest = serviceRequests.find(req => req._id === e.target.value);
                    setFormData({
                      ...formData,
                      serviceRequestId: e.target.value,
                      clientId: selectedRequest?.clientId || ''
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  required
                >
                  <option value="">Select a completed job</option>
                  {serviceRequests.map((request) => (
                    <option key={request._id} value={request._id}>
                      {request.title} - {request.clientName}
                    </option>
                  ))}
                </select>
                {errors.serviceRequestId && (
                  <p className="mt-1 text-sm text-red-600">{errors.serviceRequestId}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Due Date *
                </label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  required
                  min={new Date().toISOString().split('T')[0]}
                />
                {errors.dueDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.dueDate}</p>
                )}
              </div>
            </div>

            {/* Invoice Items */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">Invoice Items</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-4 p-4 border border-gray-200 dark:border-dark-border rounded-lg">
                    <div className="md:col-span-5">
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                        placeholder="Item description"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                        Rate (₹)
                      </label>
                      <input
                        type="number"
                        value={item.rate}
                        onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                    
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                        Amount (₹)
                      </label>
                      <input
                        type="number"
                        value={item.amount.toFixed(2)}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md bg-gray-50 dark:bg-dark-surface-secondary text-gray-700 dark:text-dark-text"
                      />
                    </div>
                    
                    <div className="md:col-span-1 flex items-end">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        disabled={formData.items.length === 1}
                        className="w-full p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {errors.items && (
                <p className="mt-2 text-sm text-red-600">{errors.items}</p>
              )}
            </div>

            {/* Tax Rate */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.taxRate}
                  onChange={(e) => setFormData({ ...formData, taxRate: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  min="0"
                  max="100"
                  step="0.01"
                />
              </div>

              {/* Totals Summary */}
              <div className="bg-gray-50 dark:bg-dark-surface-secondary p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 dark:text-dark-text mb-3">Invoice Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Subtotal:</span>
                    <span className="font-medium text-gray-900 dark:text-dark-text">₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-dark-text-secondary">Tax ({formData.taxRate}%):</span>
                    <span className="font-medium text-gray-900 dark:text-dark-text">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-gray-200 dark:border-dark-border">
                    <span className="font-semibold text-gray-900 dark:text-dark-text">Total:</span>
                    <span className="font-semibold text-lg text-gray-900 dark:text-dark-text">₹{total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  placeholder="Additional notes..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-2">
                  Terms and Conditions
                </label>
                <textarea
                  value={formData.termsAndConditions}
                  onChange={(e) => setFormData({ ...formData, termsAndConditions: e.target.value })}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                  placeholder="Terms and conditions..."
                />
              </div>
            </div>

            {errors.submit && (
              <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-surface-secondary">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Saving...' : (invoice ? 'Update Invoice' : 'Create Invoice')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default InvoiceForm;
