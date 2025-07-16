import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText,
  Plus,
  Download,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown
} from 'lucide-react';
import { invoiceService } from '../../services/invoiceService';
import InvoiceForm from './InvoiceForm';

const InvoiceManagement = ({ userRole = 'worker' }) => {
  const [invoices, setInvoices] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [selectedInvoices, setSelectedInvoices] = useState([]);
  const [filters, setFilters] = useState({
    status: '',
    dateRange: 'thisMonth',
    searchTerm: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchInvoices();
    fetchStats();
  }, [filters, userRole]);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const response = userRole === 'worker' 
        ? await invoiceService.getWorkerInvoices(filters)
        : await invoiceService.getClientInvoices(filters);
      setInvoices(response.data.invoices || []);
    } catch (error) {
      console.error('Error fetching invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await invoiceService.getInvoiceStats(filters);
      setStats(response.data || {});
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
    }
  };

  const handleCreateInvoice = () => {
    setEditingInvoice(null);
    setShowInvoiceForm(true);
  };

  const handleEditInvoice = (invoice) => {
    setEditingInvoice(invoice);
    setShowInvoiceForm(true);
  };

  const handleDeleteInvoice = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        await invoiceService.deleteInvoice(invoiceId);
        fetchInvoices();
        fetchStats();
      } catch (error) {
        console.error('Error deleting invoice:', error);
      }
    }
  };

  const handleDownloadInvoice = async (invoiceId) => {
    try {
      const response = await invoiceService.downloadInvoice(invoiceId);
      // Handle PDF download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice_${invoiceId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading invoice:', error);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedInvoices.length === 0) return;

    if (action === 'delete') {
      if (window.confirm(`Are you sure you want to delete ${selectedInvoices.length} invoice(s)?`)) {
        try {
          await Promise.all(selectedInvoices.map(id => invoiceService.deleteInvoice(id)));
          setSelectedInvoices([]);
          fetchInvoices();
          fetchStats();
        } catch (error) {
          console.error('Error deleting invoices:', error);
        }
      }
    } else if (action === 'send') {
      try {
        await invoiceService.sendInvoices({ invoiceIds: selectedInvoices });
        setSelectedInvoices([]);
        fetchInvoices();
      } catch (error) {
        console.error('Error sending invoices:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'draft':
        return <Edit className="h-4 w-4 text-gray-500" />;
      case 'sent':
        return <Clock className="h-4 w-4 text-blue-500" />;
      case 'paid':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'overdue':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status) => {
    const statusStyles = {
      draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
      sent: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200',
      paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200',
      overdue: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusStyles[status] || statusStyles.draft}`}>
        {getStatusIcon(status)}
        <span className="ml-1 capitalize">{status}</span>
      </span>
    );
  };

  const statCards = [
    {
      title: 'Total Amount',
      value: formatCurrency(stats.totalAmount || 0),
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-blue-500',
      change: stats.amountChange,
      changeType: stats.amountChange > 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Paid Invoices',
      value: stats.paidCount || 0,
      icon: <CheckCircle className="h-6 w-6" />,
      color: 'bg-green-500',
      change: stats.paidChange,
      changeType: stats.paidChange > 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Pending Amount',
      value: formatCurrency(stats.pendingAmount || 0),
      icon: <Clock className="h-6 w-6" />,
      color: 'bg-orange-500',
      change: stats.pendingChange,
      changeType: stats.pendingChange > 0 ? 'increase' : 'decrease'
    },
    {
      title: 'Overdue',
      value: stats.overdueCount || 0,
      icon: <AlertCircle className="h-6 w-6" />,
      color: 'bg-red-500',
      change: stats.overdueChange,
      changeType: stats.overdueChange > 0 ? 'increase' : 'decrease'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">
            {userRole === 'worker' ? 'My Invoices' : 'Received Invoices'}
          </h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
            {userRole === 'worker' 
              ? 'Create and manage invoices for your completed work'
              : 'Track invoices from workers for your projects'
            }
          </p>
        </div>
        {userRole === 'worker' && (
          <div className="mt-4 sm:mt-0 flex gap-3">
            <button
              onClick={handleCreateInvoice}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Invoice
            </button>
          </div>
        )}
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
                    stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
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

      {/* Filters and Search */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-5 w-5 text-gray-500" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
                placeholder="Search invoices..."
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-text mb-1">
              Status
            </label>
            <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
            >
              <option value="">All Status</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
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

          {selectedInvoices.length > 0 && (
            <div className="flex gap-2">
              <button
                onClick={() => handleBulkAction('send')}
                className="flex-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Send Selected
              </button>
              <button
                onClick={() => handleBulkAction('delete')}
                className="flex-1 px-3 py-2 text-sm bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-dark-border">
          <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text">
            Invoices
          </h3>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <RefreshCw className="h-6 w-6 animate-spin mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-text-secondary">Loading invoices...</p>
          </div>
        ) : invoices.length === 0 ? (
          <div className="p-6 text-center">
            <FileText className="h-12 w-12 mx-auto text-gray-400" />
            <p className="mt-2 text-sm text-gray-500 dark:text-dark-text-secondary">No invoices found</p>
            {userRole === 'worker' && (
              <button
                onClick={handleCreateInvoice}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Create Your First Invoice
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-dark-border">
              <thead className="bg-gray-50 dark:bg-dark-surface-secondary">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedInvoices.length === invoices.length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedInvoices(invoices.map(inv => inv._id));
                        } else {
                          setSelectedInvoices([]);
                        }
                      }}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Invoice #
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    {userRole === 'worker' ? 'Client' : 'Worker'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-dark-text-secondary uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-dark-surface divide-y divide-gray-200 dark:divide-dark-border">
                {invoices.map((invoice) => (
                  <tr key={invoice._id} className="hover:bg-gray-50 dark:hover:bg-dark-surface-secondary">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedInvoices.includes(invoice._id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedInvoices([...selectedInvoices, invoice._id]);
                          } else {
                            setSelectedInvoices(selectedInvoices.filter(id => id !== invoice._id));
                          }
                        }}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                      {invoice.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-dark-text">
                      {userRole === 'worker' ? invoice.clientName : invoice.workerName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      {new Date(invoice.issueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-dark-text-secondary">
                      {new Date(invoice.dueDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-dark-text">
                      {formatCurrency(invoice.totalAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(invoice.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleDownloadInvoice(invoice._id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Download PDF"
                        >
                          <Download className="h-4 w-4" />
                        </button>
                        {userRole === 'worker' && (
                          <>
                            <button
                              onClick={() => handleEditInvoice(invoice)}
                              className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                              title="Edit Invoice"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteInvoice(invoice._id)}
                              className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              title="Delete Invoice"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invoice Form Modal */}
      {userRole === 'worker' && (
        <InvoiceForm
          isOpen={showInvoiceForm}
          onClose={() => {
            setShowInvoiceForm(false);
            setEditingInvoice(null);
          }}
          invoice={editingInvoice}
          onSuccess={() => {
            fetchInvoices();
            fetchStats();
          }}
        />
      )}
    </div>
  );
};

export default InvoiceManagement;
