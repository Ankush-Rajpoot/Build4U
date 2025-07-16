import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  Eye,
  Download,
  Calendar,
  BarChart3,
  PieChart,
  LineChart,
  Wallet,
  Receipt,
  FileText,
  Target,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import financialAnalyticsService from '../../services/financialAnalyticsService.js';
import invoiceService from '../../services/invoiceService.js';
import expenseService from '../../services/expenseService.js';
import FinancialChart from './FinancialChart.jsx';
import InsightsPanel from './InsightsPanel.jsx';
import AlertsPanel from './AlertsPanel.jsx';
import QuickActions from './QuickActions.jsx';

const FinancialDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedPeriod, setSelectedPeriod] = useState('monthly');
  const [selectedDateRange, setSelectedDateRange] = useState(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      start: startOfMonth.toISOString().split('T')[0],
      end: now.toISOString().split('T')[0]
    };
  });

  useEffect(() => {
    fetchDashboardData();
  }, [selectedPeriod, selectedDateRange]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [overview, revenueData, expenseData, insights] = await Promise.all([
        financialAnalyticsService.getDashboardOverview(),
        financialAnalyticsService.getRevenueAnalytics({
          period: selectedPeriod,
          startDate: selectedDateRange.start,
          endDate: selectedDateRange.end
        }),
        financialAnalyticsService.getExpenseAnalytics({
          period: selectedPeriod,
          startDate: selectedDateRange.start,
          endDate: selectedDateRange.end
        }),
        financialAnalyticsService.getInsights()
      ]);

      setDashboardData({
        overview: overview.data,
        revenue: revenueData.data,
        expenses: expenseData.data,
        insights: insights.data
      });
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError(financialAnalyticsService.handleApiError(err));
    } finally {
      setLoading(false);
    }
  };

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
  };

  const handleDateRangeChange = (range) => {
    setSelectedDateRange(range);
  };

  const exportReport = async (format) => {
    try {
      await financialAnalyticsService.exportReport({
        period: selectedPeriod,
        startDate: selectedDateRange.start,
        endDate: selectedDateRange.end,
        format
      });
    } catch (err) {
      console.error('Error exporting report:', err);
      setError('Failed to export report');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="bg-white rounded-lg shadow p-6">
                  <div className="h-4 bg-gray-200 rounded mb-4"></div>
                  <div className="h-8 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="h-6 bg-gray-200 rounded mb-4"></div>
                <div className="h-64 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Dashboard</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <button
              onClick={fetchDashboardData}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const { overview, revenue, expenses, insights } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Financial Dashboard</h1>
              <p className="text-gray-600">Comprehensive overview of your financial performance</p>
            </div>
            
            <div className="mt-4 lg:mt-0 flex flex-col sm:flex-row gap-4">
              {/* Period Selector */}
              <div className="flex bg-white rounded-lg border shadow-sm">
                {['daily', 'weekly', 'monthly', 'quarterly'].map((period) => (
                  <button
                    key={period}
                    onClick={() => handlePeriodChange(period)}
                    className={`px-4 py-2 text-sm font-medium capitalize transition-colors ${
                      selectedPeriod === period
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-700 hover:text-blue-600'
                    }`}
                  >
                    {period}
                  </button>
                ))}
              </div>

              {/* Export Button */}
              <button
                onClick={() => exportReport('csv')}
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                Export
              </button>
            </div>
          </div>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Total Revenue"
            value={financialAnalyticsService.formatCurrency(overview.currentPeriod.revenue)}
            change={overview.growth.revenue}
            icon={DollarSign}
            color="blue"
          />
          <MetricCard
            title="Total Expenses"
            value={financialAnalyticsService.formatCurrency(overview.currentPeriod.expenses)}
            change={overview.growth.expenses}
            icon={Receipt}
            color="red"
          />
          <MetricCard
            title="Net Profit"
            value={financialAnalyticsService.formatCurrency(overview.currentPeriod.profit)}
            change={overview.growth.profit}
            icon={TrendingUp}
            color="green"
          />
          <MetricCard
            title="Profit Margin"
            value={financialAnalyticsService.formatPercentage(overview.currentPeriod.profitMargin)}
            change={overview.growth.profit}
            icon={Target}
            color="purple"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Revenue Trend */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Revenue Trend</h3>
              <LineChart className="h-5 w-5 text-gray-400" />
            </div>
            <FinancialChart
              data={financialAnalyticsService.prepareChartData(overview.trends.revenue, 'line')}
              type="line"
              height={300}
            />
          </div>

          {/* Expense Breakdown */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Expense Breakdown</h3>
              <PieChart className="h-5 w-5 text-gray-400" />
            </div>
            <FinancialChart
              data={financialAnalyticsService.prepareChartData(expenses.byCategory, 'pie')}
              type="pie"
              height={300}
            />
          </div>
        </div>

        {/* Insights and Alerts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <InsightsPanel insights={insights.insights} />
          <AlertsPanel alerts={insights.alerts} />
        </div>

        {/* Quick Actions */}
        <QuickActions />

        {/* Detailed Analytics */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Gross Revenue</span>
                <span className="font-semibold">
                  {financialAnalyticsService.formatCurrency(revenue.total)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recurring Revenue</span>
                <span className="font-semibold">
                  {financialAnalyticsService.formatCurrency(revenue.recurring || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">One-time Revenue</span>
                <span className="font-semibold">
                  {financialAnalyticsService.formatCurrency(revenue.oneTime || revenue.total)}
                </span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Growth Rate</span>
                  <span className={`font-semibold ${financialAnalyticsService.getGrowthColor(revenue.growth?.percentage || 0)}`}>
                    {financialAnalyticsService.formatPercentage(revenue.growth?.percentage || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Expense Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Expense Details</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Operating Expenses</span>
                <span className="font-semibold">
                  {financialAnalyticsService.formatCurrency(expenses.operatingExpenses || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Materials & Equipment</span>
                <span className="font-semibold">
                  {financialAnalyticsService.formatCurrency(expenses.nonOperatingExpenses || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average per Job</span>
                <span className="font-semibold">
                  {financialAnalyticsService.formatCurrency(expenses.averagePerJob || 0)}
                </span>
              </div>
              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Expense Ratio</span>
                  <span className="font-semibold text-gray-900">
                    {financialAnalyticsService.formatPercentage(expenses.efficiency?.expenseRatio || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* KPIs */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Performance Indicators</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">ROI</span>
                <span className="font-semibold">
                  {financialAnalyticsService.formatPercentage(overview.kpis?.roi || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Job Success Rate</span>
                <span className="font-semibold">
                  {financialAnalyticsService.formatPercentage(overview.kpis?.jobSuccessRate || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Average Job Value</span>
                <span className="font-semibold">
                  {financialAnalyticsService.formatCurrency(overview.kpis?.averageJobValue || 0)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Customer Rating</span>
                <span className="font-semibold">
                  {(overview.kpis?.averageRating || 0).toFixed(1)} ⭐
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Metric Card Component
const MetricCard = ({ title, value, change, icon: Icon, color }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-red-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  const isPositive = change >= 0;
  const changeColor = isPositive ? 'text-green-600' : 'text-red-600';
  const ChangeIcon = isPositive ? ArrowUpRight : ArrowDownRight;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div className={`flex items-center text-sm font-medium ${changeColor}`}>
          <ChangeIcon className="h-4 w-4 mr-1" />
          {Math.abs(change).toFixed(1)}%
        </div>
      </div>
      
      <div>
        <p className="text-2xl font-bold text-gray-900 mb-1">{value}</p>
        <p className="text-sm text-gray-600">{title}</p>
      </div>
    </div>
  );
};

export default FinancialDashboard;
