import api from './api.js';

class PaymentService {
  // Create a payment request (Worker)
  async createPaymentRequest(serviceRequestId, amount, description) {
    try {
      const response = await api.post('/payments/request', {
        serviceRequestId,
        amount,
        description
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get payment requests for a service request
  async getPaymentRequests(serviceRequestId) {
    try {
      const response = await api.get(`/payments/requests/${serviceRequestId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Approve or decline payment request (Client)
  async respondToPaymentRequest(requestId, action, declineReason = '') {
    try {
      const response = await api.post(`/payments/respond/${requestId}`, {
        action,
        declineReason
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get payment history for a service request
  async getPaymentHistory(serviceRequestId) {
    try {
      const response = await api.get(`/payments/history/${serviceRequestId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Get user's payment statistics
  async getPaymentStats() {
    try {
      const response = await api.get('/payments/stats');
      return response.data;
    } catch (error) {
      throw error.response?.data || error.message;
    }
  }

  // Format currency
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  // Calculate platform fee (5%)
  calculatePlatformFee(amount) {
    return Math.round((amount * 5) / 100);
  }

  // Calculate worker amount after platform fee
  calculateWorkerAmount(amount) {
    const platformFee = this.calculatePlatformFee(amount);
    return amount - platformFee;
  }

  // Get payment status color
  getStatusColor(status) {
    const statusColors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-blue-100 text-blue-800',
      declined: 'bg-red-100 text-red-800',
      processed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  }

  // Get payment status text
  getStatusText(status) {
    const statusTexts = {
      pending: 'Pending Approval',
      approved: 'Approved',
      declined: 'Declined',
      processed: 'Processed',
      failed: 'Failed'
    };
    return statusTexts[status] || status;
  }
}

export default new PaymentService();
