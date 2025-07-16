import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  DollarSign,
  TrendingUp,
  TrendingDown,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  Users,
  FileText,
  AlertTriangle,
  Target,
  BarChart3,
  Activity
} from 'lucide-react';
import expenseService from '../../services/expenseService';
import ExpenseForm from './ExpenseForm';
import FinancialChart from './FinancialChart';

const ExpenseManagement = () => {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState({});
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [filters, setFilters] = useState({
    category: '',
    dateRange: 'thisMonth',
    startDate: '',
    endDate: '',
    minAmount: '',
    maxAmount: ''
  });

  useEffect(() => {
    fetchExpenses();
    fetchStats();
    fetchTrends();
  }, [filters]);

  const fetchExpenses = async () => {
    try {
      setLoading(true);
      const response = await expenseService.getExpenses(filters);
      setExpenses(response.data.expenses || []);
    } catch (error) {
      console.error('Error fetching expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await expenseService.getExpenseStats(filters);
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching expense stats:', error);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await expenseService.getExpenseTrends({
        period: 'monthly',
        months: 6
      });
      setTrends(response.data.trends || []);
    } catch (error) {
      console.error('Error fetching expense trends:', error);
    }
  };

  const handleCreateExpense = () => {
    setEditingExpense(null);
    setShowExpenseForm(true);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowExpenseForm(true);
  };

  const handleDeleteExpense = async (expenseId) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await expenseService.deleteExpense(expenseId);
        fetchExpenses();
        fetchStats();
        fetchTrends();
      } catch (error) {
        console.error('Error deleting expense:', error);
      }
    }
  };

  const handleExportExpenses = async () => {
    try {
      const response = await expenseService.exportExpenses(filters);
      // Handle CSV download
      const blob = new Blob([response.data], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `expenses_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting expenses:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getDateRangeLabel = (range) => {
    const labels = {
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      thisQuarter: 'This Quarter',
      thisYear: 'This Year',
      custom: 'Custom Range'
    };
    return labels[range] || 'All Time';
  };

  const statCards = [
    {
      title: 'Total Expenses',
      value: formatCurrency(stats.totalExpenses || 0),
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-red-500',
      change: stats.expenseChange,
      changeType: stats.expenseChange > 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Average Monthly',
      value: formatCurrency(stats.averageMonthly || 0),
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-blue-500',
      change: stats.monthlyChange,
      changeType: stats.monthlyChange > 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Categories',
      value: stats.categoriesCount || 0,
      icon: <BarChart3 className="h-6 w-6" />,
      color: 'bg-purple-500'
    },
    {
      title: 'This Month',
      value: formatCurrency(stats.thisMonth || 0),
      icon: <Calendar className="h-6 w-6" />,
      color: 'bg-green-500',
      change: stats.monthOverMonthChange,
      changeType: stats.monthOverMonthChange > 0 ? 'increase' : 'decrease'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Expense Management</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
            Track and manage your business expenses
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex gap-3">
          <button
            onClick={handleExportExpenses}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export
          </button>
          <button
            onClick={handleCreateExpense}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <DollarSign className="h-4 w-4 mr-2" />
            Add Expense
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg text-white`}>
                {stat.icon}
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
                  {stat.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
                  {stat.value}
                </p>
                {stat.change !== undefined && (
                  <div className={`flex items-center mt-1 ${
                    stat.changeType === 'increase' ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {stat.changeType === 'increase' ? (
                      <TrendingUp className="h-4 w-4 mr-1" />
                    ) : (
                      <TrendingDown className="h-4 w-4 mr-1" />
                    )}
                    <span className="text-sm">{Math.abs(stat.change)}%</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
            >
              <option value="">All Categories</option>
              <option value="Business Operations">Business Operations</option>
              <option value="Travel & Transportation">Travel & Transportation</option>
              <option value="Marketing & Advertising">Marketing & Advertising</option>
              <option value="Education & Training">Education & Training</option>
              <option value="Taxes & Compliance">Taxes & Compliance</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Date Range
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => setFilters({ ...filters, dateRange: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </select>
          </div>
          
          {filters.dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Charts */}
      {trends.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
              Expense Trends
            </h3>
            <FinancialChart
              type="line"
              data={trends}
              xKey="month"
              yKey="totalAmount"
              height={300}
            />
          </div>
          
          <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
              Category Breakdown
            </h3>
            <FinancialChart
              type="pie"
              data={stats.categoryBreakdown || []}
              height={300}
            />
          </div>
        </div>
      )}

      {/* Expense Table */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">
            Recent Expenses
          </h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-text-secondary">Loading expenses...</p>
          </div>
        ) : expenses.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-text-secondary">No expenses found</p>
            <button
              onClick={handleCreateExpense}
              className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Add Your First Expense
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-surface-secondary">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Vendor
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
                {expenses.map((expense) => (
                  <tr key={expense._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface-secondary">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                      {new Date(expense.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 dark:text-dark-text">
                      <div className="max-w-xs truncate">{expense.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      <div>
                        <div className="font-medium text-gray-900 dark:text-dark-text">{expense.category}</div>
                        <div className="text-xs">{expense.subcategory}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                      {formatCurrency(expense.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      {expense.vendor || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEditExpense(expense)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteExpense(expense._id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={showExpenseForm}
        onClose={() => {
          setShowExpenseForm(false);
          setEditingExpense(null);
        }}
        expense={editingExpense}
        onSuccess={() => {
          fetchExpenses();
          fetchStats();
          fetchTrends();
        }}
      />
    </div>
  );
};

export default ExpenseManagement;
