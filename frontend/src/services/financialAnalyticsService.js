import api from './api.js';

class FinancialAnalyticsService {
  // Get financial analytics for user
  async getAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== '') {
          params.append(key, options[key]);
        }
      });

      const response = await api.get(`/analytics?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching financial analytics:', error);
      throw error;
    }
  }

  // Get dashboard overview
  async getDashboardOverview() {
    try {
      const response = await api.get('/analytics/dashboard');
      return response.data;
    } catch (error) {
      console.error('Error fetching dashboard overview:', error);
      throw error;
    }
  }

  // Get revenue analytics
  async getRevenueAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== '') {
          params.append(key, options[key]);
        }
      });

      const response = await api.get(`/analytics/revenue?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching revenue analytics:', error);
      throw error;
    }
  }

  // Get expense analytics
  async getExpenseAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== '') {
          params.append(key, options[key]);
        }
      });

      const response = await api.get(`/analytics/expenses?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching expense analytics:', error);
      throw error;
    }
  }

  // Get profit analytics
  async getProfitAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== '') {
          params.append(key, options[key]);
        }
      });

      const response = await api.get(`/analytics/profit?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching profit analytics:', error);
      throw error;
    }
  }

  // Get tax analytics
  async getTaxAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== '') {
          params.append(key, options[key]);
        }
      });

      const response = await api.get(`/analytics/tax?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching tax analytics:', error);
      throw error;
    }
  }

  // Get comparative analytics
  async getComparativeAnalytics(options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== '') {
          params.append(key, options[key]);
        }
      });

      const response = await api.get(`/analytics/comparative?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching comparative analytics:', error);
      throw error;
    }
  }

  // Get financial forecasts
  async getForecasts(options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== '') {
          params.append(key, options[key]);
        }
      });

      const response = await api.get(`/analytics/forecasts?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching forecasts:', error);
      throw error;
    }
  }

  // Get insights and recommendations
  async getInsights() {
    try {
      const response = await api.get('/analytics/insights');
      return response.data;
    } catch (error) {
      console.error('Error fetching insights:', error);
      throw error;
    }
  }

  // Export financial report
  async exportReport(options = {}) {
    try {
      const params = new URLSearchParams();
      
      Object.keys(options).forEach(key => {
        if (options[key] !== undefined && options[key] !== '') {
          params.append(key, options[key]);
        }
      });

      if (options.format === 'csv') {
        const response = await api.get(`/analytics/export?${params.toString()}`, {
          responseType: 'blob'
        });
        
        // Create blob URL and trigger download
        const blob = new Blob([response.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `financial_report_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        return { success: true };
      } else {
        const response = await api.get(`/analytics/export?${params.toString()}`);
        return response.data;
      }
    } catch (error) {
      console.error('Error exporting report:', error);
      throw error;
    }
  }

  // Helper methods for data processing and formatting
  formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2
    }).format(amount);
  }

  formatPercentage(value, decimals = 1) {
    return `${value.toFixed(decimals)}%`;
  }

  formatNumber(value, decimals = 0) {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  getGrowthColor(percentage) {
    if (percentage > 0) return 'text-green-600';
    if (percentage < 0) return 'text-red-600';
    return 'text-gray-600';
  }

  getGrowthIcon(percentage) {
    if (percentage > 0) return '📈';
    if (percentage < 0) return '📉';
    return '➡️';
  }

  getAlertColor(type) {
    const colors = {
      'warning': 'yellow',
      'critical': 'red',
      'info': 'blue',
      'success': 'green'
    };
    return colors[type] || 'gray';
  }

  getInsightImpactColor(impact) {
    const colors = {
      'high': 'red',
      'medium': 'yellow',
      'low': 'green'
    };
    return colors[impact] || 'gray';
  }

  // Chart data preparation helpers
  prepareChartData(data, type = 'line') {
    switch (type) {
      case 'line':
        return {
          labels: data.map(item => this.formatDate(item.period)),
          datasets: [{
            data: data.map(item => item.value),
            borderColor: '#3B82F6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.1
          }]
        };
      
      case 'pie':
        return {
          labels: Object.keys(data),
          datasets: [{
            data: Object.values(data),
            backgroundColor: [
              '#FF6384',
              '#36A2EB',
              '#FFCE56',
              '#4BC0C0',
              '#9966FF',
              '#FF9F40',
              '#FF6384',
              '#C9CBCF'
            ]
          }]
        };
      
      case 'bar':
        return {
          labels: data.map(item => item.category),
          datasets: [{
            data: data.map(item => item.value),
            backgroundColor: '#3B82F6',
            borderColor: '#1D4ED8',
            borderWidth: 1
          }]
        };
      
      default:
        return data;
    }
  }

  formatDate(dateString, format = 'short') {
    const date = new Date(dateString);
    
    switch (format) {
      case 'short':
        return date.toLocaleDateString('en-IN', { 
          month: 'short', 
          year: 'numeric' 
        });
      
      case 'long':
        return date.toLocaleDateString('en-IN', { 
          month: 'long', 
          year: 'numeric',
          day: 'numeric'
        });
      
      case 'month':
        return date.toLocaleDateString('en-IN', { 
          month: 'long'
        });
      
      default:
        return date.toLocaleDateString('en-IN');
    }
  }

  // Time period helpers
  getTimePeriods() {
    return [
      { value: 'daily', label: 'Daily' },
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'quarterly', label: 'Quarterly' },
      { value: 'yearly', label: 'Yearly' }
    ];
  }

  getDateRangePresets() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    return [
      {
        label: 'Today',
        start: today,
        end: today
      },
      {
        label: 'This Week',
        start: new Date(today.getTime() - (today.getDay() * 24 * 60 * 60 * 1000)),
        end: today
      },
      {
        label: 'This Month',
        start: new Date(now.getFullYear(), now.getMonth(), 1),
        end: today
      },
      {
        label: 'Last Month',
        start: new Date(now.getFullYear(), now.getMonth() - 1, 1),
        end: new Date(now.getFullYear(), now.getMonth(), 0)
      },
      {
        label: 'This Quarter',
        start: new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1),
        end: today
      },
      {
        label: 'This Year',
        start: new Date(now.getFullYear(), 0, 1),
        end: today
      },
      {
        label: 'Last Year',
        start: new Date(now.getFullYear() - 1, 0, 1),
        end: new Date(now.getFullYear() - 1, 11, 31)
      }
    ];
  }

  // Financial calculations
  calculateGrowthRate(current, previous) {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / Math.abs(previous)) * 100;
  }

  calculateProfitMargin(profit, revenue) {
    if (!revenue || revenue === 0) return 0;
    return (profit / revenue) * 100;
  }

  calculateROI(profit, investment) {
    if (!investment || investment === 0) return 0;
    return (profit / investment) * 100;
  }

  calculateExpenseRatio(expenses, revenue) {
    if (!revenue || revenue === 0) return 0;
    return (expenses / revenue) * 100;
  }

  // Data validation and error handling
  validateDateRange(startDate, endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    if (start > end) {
      throw new Error('Start date cannot be after end date');
    }
    
    if (start > new Date()) {
      throw new Error('Start date cannot be in the future');
    }
    
    const daysDiff = (end - start) / (1000 * 60 * 60 * 24);
    if (daysDiff > 365) {
      throw new Error('Date range cannot exceed 365 days');
    }
    
    return true;
  }

  handleApiError(error) {
    if (error.response) {
      // API returned an error response
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          return 'Unauthorized access. Please log in again.';
        case 403:
          return 'Access denied. You do not have permission to view this data.';
        case 404:
          return 'Data not found.';
        case 429:
          return 'Too many requests. Please try again later.';
        case 500:
          return 'Server error. Please try again later.';
        default:
          return data?.message || 'An error occurred while fetching data.';
      }
    } else if (error.request) {
      // Network error
      return 'Network error. Please check your connection and try again.';
    } else {
      // Other error
      return error.message || 'An unexpected error occurred.';
    }
  }

  // Cache management for performance
  cache = new Map();
  cacheTimeout = 5 * 60 * 1000; // 5 minutes

  getCachedData(key) {
    const cached = this.cache.get(key);
    if (cached && (Date.now() - cached.timestamp) < this.cacheTimeout) {
      return cached.data;
    }
    return null;
  }

  setCachedData(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  clearCache() {
    this.cache.clear();
  }
}

export default new FinancialAnalyticsService();
