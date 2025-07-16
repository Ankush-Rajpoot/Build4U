import api from './api.js';

class InvoiceService {
  // Create invoice from payment request
  async createInvoice(paymentRequestId, notes = '') {
    try {
      const response = await api.post('/invoices', {
        paymentRequestId,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  }

  // Get invoice by ID
  async getInvoice(invoiceId) {
    try {
      const response = await api.get(`/invoices/${invoiceId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      throw error;
    }
  }

  // Get invoices with filters and pagination
  async getInvoices(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          if (key === 'dateRange' && filters[key].start && filters[key].end) {
            params.append('startDate', filters[key].start);
            params.append('endDate', filters[key].end);
          } else {
            params.append(key, filters[key]);
          }
        }
      });

      const response = await api.get(`/invoices?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      throw error;
    }
  }

  // Download invoice PDF
  async downloadInvoice(invoiceId) {
    try {
      const response = await api.get(`/invoices/${invoiceId}/download`, {
        responseType: 'blob'
      });
      
      // Create blob URL and trigger download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      return { success: true };
    } catch (error) {
      console.error('Error downloading invoice:', error);
      throw error;
    }
  }

  // Mark invoice as paid
  async markAsPaid(invoiceId, paymentData) {
    try {
      const response = await api.patch(`/invoices/${invoiceId}/pay`, paymentData);
      return response.data;
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      throw error;
    }
  }

  // Send invoice reminder
  async sendReminder(invoiceId) {
    try {
      const response = await api.post(`/invoices/${invoiceId}/reminder`);
      return response.data;
    } catch (error) {
      console.error('Error sending invoice reminder:', error);
      throw error;
    }
  }

  // Get invoice statistics
  async getInvoiceStats() {
    try {
      const response = await api.get('/invoices/stats');
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      throw error;
    }
  }

  // Get invoice trends
  async getInvoiceTrends(months = 12) {
    try {
      const response = await api.get(`/invoices/trends?months=${months}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching invoice trends:', error);
      throw error;
    }
  }

  // Get overdue invoices
  async getOverdueInvoices() {
    try {
      const response = await api.get('/invoices/overdue');
      return response.data;
    } catch (error) {
      console.error('Error fetching overdue invoices:', error);
      throw error;
    }
  }

  // Bulk update invoices
  async bulkUpdate(invoiceIds, operation, data = {}) {
    try {
      const response = await api.patch('/invoices/bulk', {
        invoiceIds,
        operation,
        data
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk updating invoices:', error);
      throw error;
    }
  }

  // Helper methods for status and formatting
  getInvoiceStatusColor(status) {
    const statusColors = {
      'draft': 'gray',
      'sent': 'blue',
      'viewed': 'yellow',
      'paid': 'green',
      'overdue': 'red',
      'cancelled': 'red'
    };
    return statusColors[status] || 'gray';
  }

  getPaymentStatusColor(status) {
    const statusColors = {
      'pending': 'yellow',
      'partial': 'orange',
      'paid': 'green',
      'overdue': 'red',
      'cancelled': 'gray'
    };
    return statusColors[status] || 'gray';
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatInvoiceNumber(invoice) {
    return `${invoice.series}/${invoice.financialYear}/${invoice.invoiceNumber}`;
  }

  calculateDaysOverdue(dueDate) {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = today - due;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 0;
  }
}

export default new InvoiceService();
