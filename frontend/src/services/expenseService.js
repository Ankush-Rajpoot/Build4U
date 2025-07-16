import api from './api.js';

class ExpenseService {
  // Get expense trends analytics
  async getExpenseTrends(filters = {}) {
    try {
      const params = new URLSearchParams();
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });
      const response = await api.get(`/analytics/expenses?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expense trends:', error);
      throw error;
    }
  }
  // Create new expense
  async createExpense(expenseData) {
    try {
      const response = await api.post('/expenses', expenseData);
      return response.data;
    } catch (error) {
      console.error('Error creating expense:', error);
      throw error;
    }
  }

  // Upload expense receipt
  async uploadReceipt(expenseId, receiptFile) {
    try {
      const formData = new FormData();
      formData.append('receipt', receiptFile);

      const response = await api.post(`/expenses/${expenseId}/receipt`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
  }

  // Get expenses with filters
  async getExpenses(filters = {}) {
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

      const response = await api.get(`/expenses?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expenses:', error);
      throw error;
    }
  }

  // Get expense by ID
  async getExpense(expenseId) {
    try {
      const response = await api.get(`/expenses/${expenseId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expense:', error);
      throw error;
    }
  }

  // Update expense
  async updateExpense(expenseId, updateData) {
    try {
      const response = await api.put(`/expenses/${expenseId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating expense:', error);
      throw error;
    }
  }

  // Delete expense
  async deleteExpense(expenseId) {
    try {
      const response = await api.delete(`/expenses/${expenseId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting expense:', error);
      throw error;
    }
  }

  // Approve expense (Client only)
  async approveExpense(expenseId, notes = '') {
    try {
      const response = await api.patch(`/expenses/${expenseId}/approve`, { notes });
      return response.data;
    } catch (error) {
      console.error('Error approving expense:', error);
      throw error;
    }
  }

  // Reject expense (Client only)
  async rejectExpense(expenseId, reason) {
    try {
      const response = await api.patch(`/expenses/${expenseId}/reject`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting expense:', error);
      throw error;
    }
  }

  // Get expense statistics
  async getExpenseStats(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await api.get(`/expenses/stats?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expense stats:', error);
      throw error;
    }
  }

  // Get pending approvals (Client only)
  async getPendingApprovals() {
    try {
      const response = await api.get('/expenses/pending-approvals');
      return response.data;
    } catch (error) {
      console.error('Error fetching pending approvals:', error);
      throw error;
    }
  }

  // Bulk approve expenses
  async bulkApprove(expenseIds, notes = '') {
    try {
      const response = await api.patch('/expenses/bulk/approve', {
        expenseIds,
        notes
      });
      return response.data;
    } catch (error) {
      console.error('Error bulk approving expenses:', error);
      throw error;
    }
  }

  // Export expenses
  async exportExpenses(filters = {}, format = 'csv') {
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
      
      params.append('format', format);

      if (format === 'csv') {
        const response = await api.get(`/expenses/export?${params.toString()}`, {
          responseType: 'blob'
        });
        
        // Create blob URL and trigger download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `expenses_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true };
      } else {
        const response = await api.get(`/expenses/export?${params.toString()}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error exporting expenses:', error);
      throw error;
    }
  }

  // Helper methods
  getExpenseCategories() {
    return [
      { value: 'materials', label: 'Materials', icon: '🔨' },
      { value: 'equipment', label: 'Equipment', icon: '⚙️' },
      { value: 'transportation', label: 'Transportation', icon: '🚗' },
      { value: 'accommodation', label: 'Accommodation', icon: '🏨' },
      { value: 'meals', label: 'Meals', icon: '🍽️' },
      { value: 'communication', label: 'Communication', icon: '📱' },
      { value: 'documentation', label: 'Documentation', icon: '📄' },
      { value: 'permits', label: 'Permits', icon: '📋' },
      { value: 'insurance', label: 'Insurance', icon: '🛡️' },
      { value: 'utilities', label: 'Utilities', icon: '💡' },
      { value: 'maintenance', label: 'Maintenance', icon: '🔧' },
      { value: 'professional_services', label: 'Professional Services', icon: '💼' },
      { value: 'office_supplies', label: 'Office Supplies', icon: '📎' },
      { value: 'marketing', label: 'Marketing', icon: '📢' },
      { value: 'training', label: 'Training', icon: '🎓' },
      { value: 'other', label: 'Other', icon: '📦' }
    ];
  }

  getPaymentMethods() {
    return [
      { value: 'cash', label: 'Cash', icon: '💵' },
      { value: 'upi', label: 'UPI', icon: '📱' },
      { value: 'bank_transfer', label: 'Bank Transfer', icon: '🏦' },
      { value: 'card', label: 'Card', icon: '💳' },
      { value: 'cheque', label: 'Cheque', icon: '📄' },
      { value: 'other', label: 'Other', icon: '💰' }
    ];
  }

  getApprovalStatusColor(status) {
    const statusColors = {
      'pending': 'yellow',
      'approved': 'green',
      'rejected': 'red',
      'requires_review': 'orange'
    };
    return statusColors[status] || 'gray';
  }

  getReimbursementStatusColor(status) {
    const statusColors = {
      'not_applicable': 'gray',
      'pending': 'yellow',
      'approved': 'blue',
      'paid': 'green',
      'rejected': 'red'
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

  calculateTotalAmount(expense) {
    return expense.amount + (expense.taxDetails?.taxAmount || 0);
  }

  isExpenseOverdue(expense) {
    if (expense.paymentStatus === 'paid') return false;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return new Date(expense.expenseDate) < thirtyDaysAgo;
  }

  getCategoryIcon(category) {
    const categories = this.getExpenseCategories();
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.icon : '📦';
  }

  getCategoryLabel(category) {
    const categories = this.getExpenseCategories();
    const categoryObj = categories.find(cat => cat.value === category);
    return categoryObj ? categoryObj.label : 'Other';
  }

  getPaymentMethodIcon(method) {
    const methods = this.getPaymentMethods();
    const methodObj = methods.find(m => m.value === method);
    return methodObj ? methodObj.icon : '💰';
  }

  getPaymentMethodLabel(method) {
    const methods = this.getPaymentMethods();
    const methodObj = methods.find(m => m.value === method);
    return methodObj ? methodObj.label : 'Other';
  }

  // Validation helpers
  validateExpenseData(data) {
    const errors = {};

    if (!data.title?.trim()) {
      errors.title = 'Title is required';
    } else if (data.title.length < 3) {
      errors.title = 'Title must be at least 3 characters';
    }

    if (!data.amount || data.amount <= 0) {
      errors.amount = 'Amount must be greater than 0';
    }

    if (!data.category) {
      errors.category = 'Category is required';
    }

    if (!data.serviceRequestId) {
      errors.serviceRequestId = 'Service request is required';
    }

    if (!data.paymentMethod) {
      errors.paymentMethod = 'Payment method is required';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }
}

export default new ExpenseService();
