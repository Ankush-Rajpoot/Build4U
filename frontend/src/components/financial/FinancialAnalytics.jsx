import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Target,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  RefreshCw,
  Download,
  Filter,
  Info,
  CheckCircle,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { financialAnalyticsService } from '../../services/financialAnalyticsService';
import FinancialChart from './FinancialChart';
import InsightsPanel from './InsightsPanel';
import AlertsPanel from './AlertsPanel';

const FinancialAnalytics = ({ userRole = 'worker' }) => {
  const [analytics, setAnalytics] = useState({});
  const [trends, setTrends] = useState([]);
  const [insights, setInsights] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [dateRange, setDateRange] = useState('thisYear');
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    fetchAnalytics();
    fetchTrends();
    fetchInsights();
    fetchAlerts();
  }, [selectedPeriod, dateRange, userRole]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const response = await financialAnalyticsService.getAnalytics({
        period: selectedPeriod,
        dateRange,
        userRole
      });
      setAnalytics(response.data || {});
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrends = async () => {
    try {
      const response = await financialAnalyticsService.getTrends({
        period: selectedPeriod,
        months: 12
      });
      setTrends(response.data.trends || []);
    } catch (error) {
      console.error('Error fetching trends:', error);
    }
  };

  const fetchInsights = async () => {
    try {
      const response = await financialAnalyticsService.getInsights({
        userRole,
        period: selectedPeriod
      });
      setInsights(response.data.insights || []);
    } catch (error) {
      console.error('Error fetching insights:', error);
    }
  };

  const fetchAlerts = async () => {
    try {
      const response = await financialAnalyticsService.getAlerts();
      setAlerts(response.data.alerts || []);
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };

  const handleExportReport = async () => {
    try {
      const response = await financialAnalyticsService.exportReport({
        period: selectedPeriod,
        dateRange,
        format: 'pdf'
      });
      
      // Handle PDF download
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `financial_report_${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value > 0 ? '+' : ''}${value.toFixed(1)}%`;
  };

  const kpiCards = [
    {
      title: 'Total Revenue',
      value: formatCurrency(analytics.totalRevenue || 0),
      change: analytics.revenueChange || 0,
      icon: <DollarSign className="h-6 w-6" />,
      color: 'bg-green-500',
      trend: analytics.revenueChange > 0 ? 'up' : 'down'
    },
    {
      title: userRole === 'worker' ? 'Net Profit' : 'Total Paid',
      value: formatCurrency(analytics.netProfit || analytics.totalPaid || 0),
      change: analytics.profitChange || analytics.paidChange || 0,
      icon: <TrendingUp className="h-6 w-6" />,
      color: 'bg-blue-500',
      trend: (analytics.profitChange || analytics.paidChange || 0) > 0 ? 'up' : 'down'
    },
    {
      title: userRole === 'worker' ? 'Total Expenses' : 'Outstanding',
      value: formatCurrency(analytics.totalExpenses || analytics.outstanding || 0),
      change: analytics.expenseChange || analytics.outstandingChange || 0,
      icon: userRole === 'worker' ? <BarChart3 className="h-6 w-6" /> : <Clock className="h-6 w-6" />,
      color: userRole === 'worker' ? 'bg-red-500' : 'bg-orange-500',
      trend: (analytics.expenseChange || analytics.outstandingChange || 0) > 0 ? 'up' : 'down'
    },
    {
      title: 'Active Projects',
      value: analytics.activeProjects || 0,
      change: analytics.projectChange || 0,
      icon: <Activity className="h-6 w-6" />,
      color: 'bg-purple-500',
      trend: (analytics.projectChange || 0) > 0 ? 'up' : 'down'
    }
  ];

  const tabOptions = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="h-4 w-4" /> },
    { id: 'revenue', label: 'Revenue Analysis', icon: <TrendingUp className="h-4 w-4" /> },
    { id: 'expenses', label: 'Expense Breakdown', icon: <PieChart className="h-4 w-4" /> },
    { id: 'forecasting', label: 'Forecasting', icon: <Target className="h-4 w-4" /> },
    { id: 'insights', label: 'AI Insights', icon: <Zap className="h-4 w-4" /> }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-text">Financial Analytics</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-dark-text-secondary">
            Comprehensive financial insights and performance metrics
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <div className="flex items-center gap-2">
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="yearly">Yearly</option>
            </select>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 text-sm border border-gray-300 dark:border-dark-border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-dark-surface dark:text-dark-text"
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisQuarter">This Quarter</option>
              <option value="thisYear">This Year</option>
              <option value="lastYear">Last Year</option>
            </select>
          </div>
          <button
            onClick={handleExportReport}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 dark:text-dark-text bg-white dark:bg-dark-surface border border-gray-300 dark:border-dark-border rounded-md hover:bg-gray-50 dark:hover:bg-dark-surface-secondary transition-colors"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button
            onClick={() => {
              fetchAnalytics();
              fetchTrends();
              fetchInsights();
              fetchAlerts();
            }}
            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <AlertsPanel alerts={alerts} />
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpiCards.map((kpi, index) => (
          <motion.div
            key={kpi.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
                  {kpi.title}
                </p>
                <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text mt-1">
                  {kpi.value}
                </p>
                <div className={`flex items-center mt-2 ${
                  kpi.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {kpi.trend === 'up' ? (
                    <ArrowUpRight className="h-4 w-4 mr-1" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4 mr-1" />
                  )}
                  <span className="text-sm font-medium">
                    {formatPercentage(kpi.change)}
                  </span>
                  <span className="text-xs text-gray-500 dark:text-dark-text-secondary ml-1">
                    vs last period
                  </span>
                </div>
              </div>
              <div className={`${kpi.color} p-3 rounded-lg text-white`}>
                {kpi.icon}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-dark-border">
        <nav className="-mb-px flex space-x-8">
          {tabOptions.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-dark-text-secondary hover:text-gray-700 dark:hover:text-dark-text hover:border-gray-300'
              }`}
            >
              {tab.icon}
              <span className="ml-2">{tab.label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'overview' && (
          <>
            {/* Revenue vs Expenses Chart */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                  Revenue vs Expenses
                </h3>
                {trends.length > 0 && (
                  <FinancialChart
                    type="line"
                    data={trends}
                    xKey="period"
                    yKeys={['revenue', 'expenses']}
                    height={300}
                    colors={['#10B981', '#EF4444']}
                  />
                )}
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                  Monthly Growth
                </h3>
                {trends.length > 0 && (
                  <FinancialChart
                    type="bar"
                    data={trends}
                    xKey="period"
                    yKey="growth"
                    height={300}
                    color="#3B82F6"
                  />
                )}
              </div>
            </div>

            {/* Profit Margin and Cash Flow */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                  Profit Margin Trend
                </h3>
                {trends.length > 0 && (
                  <FinancialChart
                    type="area"
                    data={trends}
                    xKey="period"
                    yKey="profitMargin"
                    height={300}
                    color="#8B5CF6"
                  />
                )}
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                  Cash Flow Analysis
                </h3>
                {trends.length > 0 && (
                  <FinancialChart
                    type="line"
                    data={trends}
                    xKey="period"
                    yKeys={['cashIn', 'cashOut']}
                    height={300}
                    colors={['#10B981', '#F59E0B']}
                  />
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'revenue' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                Revenue by Source
              </h3>
              {analytics.revenueBySource && (
                <FinancialChart
                  type="pie"
                  data={analytics.revenueBySource}
                  height={300}
                />
              )}
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                Revenue Forecast
              </h3>
              {analytics.revenueForecast && (
                <FinancialChart
                  type="line"
                  data={analytics.revenueForecast}
                  xKey="period"
                  yKeys={['actual', 'forecast']}
                  height={300}
                  colors={['#10B981', '#6B7280']}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'expenses' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                Expense Categories
              </h3>
              {analytics.expensesByCategory && (
                <FinancialChart
                  type="pie"
                  data={analytics.expensesByCategory}
                  height={300}
                />
              )}
            </div>

            <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                Monthly Expense Trend
              </h3>
              {trends.length > 0 && (
                <FinancialChart
                  type="bar"
                  data={trends}
                  xKey="period"
                  yKey="expenses"
                  height={300}
                  color="#EF4444"
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'forecasting' && (
          <div className="space-y-6">
            <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
              <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
                Financial Forecast
              </h3>
              {analytics.financialForecast && (
                <FinancialChart
                  type="line"
                  data={analytics.financialForecast}
                  xKey="period"
                  yKeys={['revenue', 'expenses', 'profit']}
                  height={400}
                  colors={['#10B981', '#EF4444', '#3B82F6']}
                />
              )}
            </div>

            {/* Key Metrics Forecast */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center">
                  <Target className="h-8 w-8 text-blue-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
                      Projected Revenue
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
                      {formatCurrency(analytics.projectedRevenue || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center">
                  <TrendingUp className="h-8 w-8 text-green-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
                      Growth Rate
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
                      {formatPercentage(analytics.projectedGrowthRate || 0)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
                <div className="flex items-center">
                  <AlertTriangle className="h-8 w-8 text-orange-500" />
                  <div className="ml-4">
                    <p className="text-sm font-medium text-gray-500 dark:text-dark-text-secondary">
                      Risk Score
                    </p>
                    <p className="text-2xl font-semibold text-gray-900 dark:text-dark-text">
                      {analytics.riskScore || 'Low'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'insights' && (
          <InsightsPanel insights={insights} />
        )}
      </div>

      {/* Performance Summary */}
      <div className="bg-white dark:bg-dark-surface rounded-lg border border-gray-200 dark:border-dark-border p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-dark-text mb-4">
          Performance Summary
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600">
              {analytics.performanceScore || 85}%
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
              Overall Score
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600">
              {analytics.efficiency || 92}%
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
              Efficiency
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600">
              {analytics.growth || 15}%
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
              Growth Rate
            </div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600">
              {analytics.profitability || 68}%
            </div>
            <div className="text-sm text-gray-500 dark:text-dark-text-secondary mt-1">
              Profitability
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FinancialAnalytics;
