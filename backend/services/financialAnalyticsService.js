import FinancialAnalytics from '../models/FinancialAnalytics.js';
import { Transaction } from '../models/Payment.js';
import Expense from '../models/Expense.js';
import Invoice from '../models/Invoice.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Worker from '../models/Worker.js';
import Client from '../models/Client.js';
import { ApiError } from '../utils/ApiError.js';

class FinancialAnalyticsService {
  constructor() {
    this.periods = {
      daily: { days: 1, format: 'YYYY-MM-DD' },
      weekly: { days: 7, format: 'YYYY-[W]WW' },
      monthly: { days: 30, format: 'YYYY-MM' },
      quarterly: { days: 90, format: 'YYYY-[Q]Q' },
      yearly: { days: 365, format: 'YYYY' }
    };
  }

  // Generate comprehensive financial analytics
  async generateAnalytics(entityType, entityId, period = 'monthly', startDate = null, endDate = null) {
    try {
      // Set default date range if not provided
      if (!startDate || !endDate) {
        const now = new Date();
        endDate = new Date(now);
        startDate = new Date(now);
        startDate.setDate(now.getDate() - this.periods[period].days);
      }

      // Check if analytics already exist for this period
      const existingAnalytics = await FinancialAnalytics.findOne({
        entityType,
        entityId,
        period,
        startDate: { $gte: startDate },
        endDate: { $lte: endDate }
      }).sort({ createdAt: -1 });

      // If recent analytics exist (within last hour), return them
      if (existingAnalytics && 
          (new Date() - existingAnalytics.updatedAt) < 3600000) {
        return existingAnalytics;
      }

      // Generate new analytics
      const analytics = await this.calculateAnalytics(entityType, entityId, period, startDate, endDate);
      
      // Save analytics
      const savedAnalytics = await FinancialAnalytics.create(analytics);
      
      return savedAnalytics;
    } catch (error) {
      console.error('Error generating financial analytics:', error);
      throw new ApiError(500, `Failed to generate analytics: ${error.message}`);
    }
  }

  // Core analytics calculation
  async calculateAnalytics(entityType, entityId, period, startDate, endDate) {
    const baseQuery = this.buildBaseQuery(entityType, entityId, startDate, endDate);
    
    // Parallel execution of all analytics calculations
    const [
      revenueData,
      expenseData,
      transactionData,
      invoiceData,
      performanceData,
      previousPeriodData
    ] = await Promise.all([
      this.calculateRevenueAnalytics(baseQuery),
      this.calculateExpenseAnalytics(baseQuery),
      this.calculateTransactionAnalytics(baseQuery),
      this.calculateInvoiceAnalytics(baseQuery),
      this.calculatePerformanceMetrics(entityType, entityId, startDate, endDate),
      this.getPreviousPeriodData(entityType, entityId, period, startDate, endDate)
    ]);

    // Calculate derived metrics
    const profit = this.calculateProfitMetrics(revenueData, expenseData);
    const kpis = this.calculateKPIs(revenueData, expenseData, profit, performanceData);
    const forecasts = await this.generateForecasts(entityType, entityId, revenueData, expenseData);
    const insights = this.generateInsights(revenueData, expenseData, profit, kpis);
    const alerts = this.generateAlerts(revenueData, expenseData, profit, kpis);

    return {
      period,
      startDate,
      endDate,
      entityType,
      entityId,
      entityModel: this.getEntityModel(entityType),
      revenue: revenueData,
      expenses: expenseData,
      profit,
      taxes: this.calculateTaxAnalytics(transactionData, invoiceData),
      performance: performanceData,
      cashFlow: this.calculateCashFlow(revenueData, expenseData),
      forecasts,
      kpis,
      insights,
      alerts,
      benchmarks: await this.calculateBenchmarks(entityType, entityId, revenueData, expenseData),
      processing: {
        status: 'completed',
        startedAt: new Date(),
        completedAt: new Date(),
        duration: 0,
        version: '1.0'
      }
    };
  }

  // Build base MongoDB query
  buildBaseQuery(entityType, entityId, startDate, endDate) {
    const query = {
      createdAt: { $gte: startDate, $lte: endDate }
    };

    switch (entityType) {
      case 'worker':
        query.worker = entityId;
        break;
      case 'client':
        query.client = entityId;
        break;
      case 'service_request':
        query.serviceRequest = entityId;
        break;
    }

    return query;
  }

  // Calculate revenue analytics
  async calculateRevenueAnalytics(baseQuery) {
    const transactions = await Transaction.find({
      ...baseQuery,
      status: 'success'
    }).populate('serviceRequest');

    const invoices = await Invoice.find({
      ...baseQuery,
      paymentStatus: { $in: ['paid', 'partial'] }
    });

    let total = 0;
    let gross = 0;
    let net = 0;
    const byCategory = new Map();

    // Process transactions
    transactions.forEach(transaction => {
      total += transaction.amount;
      gross += transaction.amount;
      net += transaction.workerAmount;

      const category = transaction.serviceRequest?.category || 'other';
      byCategory.set(category, (byCategory.get(category) || 0) + transaction.amount);
    });

    // Process invoices
    invoices.forEach(invoice => {
      const paidAmount = invoice.paidAmount || 0;
      if (!transactions.find(t => t.transaction === invoice.transaction)) {
        total += paidAmount;
        gross += paidAmount;
      }
    });

    return {
      total,
      gross,
      net,
      recurring: 0, // Calculate based on repeat customers
      oneTime: total,
      byCategory: Object.fromEntries(byCategory),
      growth: {
        percentage: 0, // Will be calculated with previous period data
        amount: 0,
        trend: 'stable'
      }
    };
  }

  // Calculate expense analytics
  async calculateExpenseAnalytics(baseQuery) {
    const expenses = await Expense.find({
      ...baseQuery,
      approvalStatus: 'approved'
    });

    let total = 0;
    let operating = 0;
    let materials = 0;
    let equipment = 0;
    let transportation = 0;
    let other = 0;
    const byCategory = new Map();

    expenses.forEach(expense => {
      const amount = expense.amount + expense.taxDetails.taxAmount;
      total += amount;

      switch (expense.category) {
        case 'materials':
          materials += amount;
          break;
        case 'equipment':
          equipment += amount;
          break;
        case 'transportation':
          transportation += amount;
          break;
        default:
          other += amount;
      }

      byCategory.set(expense.category, (byCategory.get(expense.category) || 0) + amount);
    });

    operating = total - materials - equipment;

    return {
      total,
      operating,
      materials,
      equipment,
      transportation,
      other,
      byCategory: Object.fromEntries(byCategory),
      averagePerJob: expenses.length > 0 ? total / expenses.length : 0,
      costEfficiencyRatio: 0 // Will be calculated with revenue data
    };
  }

  // Calculate transaction analytics
  async calculateTransactionAnalytics(baseQuery) {
    return await Transaction.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalFees: { $sum: '$platformFee.amount' },
          totalTax: { $sum: '$taxDetails.totalTaxAmount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      }
    ]);
  }

  // Calculate invoice analytics
  async calculateInvoiceAnalytics(baseQuery) {
    return await Invoice.aggregate([
      { $match: baseQuery },
      {
        $group: {
          _id: '$paymentStatus',
          totalAmount: { $sum: '$totalAmount' },
          totalTax: { $sum: '$totalTax' },
          count: { $sum: 1 }
        }
      }
    ]);
  }

  // Calculate performance metrics
  async calculatePerformanceMetrics(entityType, entityId, startDate, endDate) {
    const performance = {};

    if (entityType === 'worker') {
      const worker = await Worker.findById(entityId);
      const serviceRequests = await ServiceRequest.find({
        worker: entityId,
        createdAt: { $gte: startDate, $lte: endDate }
      });

      performance.hourlyRate = {
        average: worker?.hourlyRate || 0,
        minimum: worker?.hourlyRate || 0,
        maximum: worker?.hourlyRate || 0,
        trend: 'stable'
      };

      performance.efficiency = {
        jobsCompleted: serviceRequests.filter(sr => sr.status === 'completed').length,
        averageJobDuration: this.calculateAverageJobDuration(serviceRequests),
        customerSatisfaction: worker?.rating?.average || 0,
        repeatCustomerRate: await this.calculateRepeatCustomerRate(entityId, startDate, endDate)
      };
    } else if (entityType === 'client') {
      const serviceRequests = await ServiceRequest.find({
        client: entityId,
        createdAt: { $gte: startDate, $lte: endDate }
      });

      const totalSpent = serviceRequests.reduce((sum, sr) => sum + (sr.budget || 0), 0);

      performance.spending = {
        total: totalSpent,
        average: serviceRequests.length > 0 ? totalSpent / serviceRequests.length : 0,
        frequency: serviceRequests.length,
        categories: new Map()
      };
    }

    return performance;
  }

  // Calculate profit metrics
  calculateProfitMetrics(revenueData, expenseData) {
    const gross = revenueData.total - expenseData.operating;
    const net = revenueData.total - expenseData.total;

    return {
      gross,
      net,
      margin: {
        gross: revenueData.total > 0 ? (gross / revenueData.total) * 100 : 0,
        net: revenueData.total > 0 ? (net / revenueData.total) * 100 : 0
      },
      beforeTax: net,
      afterTax: net * 0.7, // Assuming 30% tax rate
      trends: {
        weekOverWeek: 0,
        monthOverMonth: 0,
        yearOverYear: 0
      }
    };
  }

  // Calculate tax analytics
  calculateTaxAnalytics(transactionData, invoiceData) {
    let total = 0;
    let cgst = 0;
    let sgst = 0;
    let igst = 0;
    let tds = 0;

    // Process transaction data
    if (transactionData && transactionData.length > 0) {
      const txData = transactionData[0];
      total = txData.totalTax || 0;
    }

    return {
      total,
      cgst,
      sgst,
      igst,
      tds,
      cess: 0,
      effectiveRate: 18, // Standard GST rate
      savings: 0,
      compliance: {
        filedReturns: 0,
        pendingReturns: 0,
        overdueReturns: 0
      }
    };
  }

  // Calculate cash flow
  calculateCashFlow(revenueData, expenseData) {
    const inflow = {
      total: revenueData.total,
      operations: revenueData.total,
      investing: 0,
      financing: 0
    };

    const outflow = {
      total: expenseData.total,
      operations: expenseData.operating,
      investing: expenseData.equipment,
      financing: 0
    };

    return {
      inflow,
      outflow,
      net: inflow.total - outflow.total,
      burnRate: expenseData.total / 30, // Daily burn rate
      runway: inflow.total > 0 ? inflow.total / (expenseData.total / 30) : 0
    };
  }

  // Calculate KPIs
  calculateKPIs(revenueData, expenseData, profit, performanceData) {
    return {
      roi: revenueData.total > 0 ? (profit.net / revenueData.total) * 100 : 0,
      roas: revenueData.total > 0 ? revenueData.total / expenseData.total : 0,
      ltv: 0, // Customer lifetime value
      cac: 0, // Customer acquisition cost
      arpu: 0, // Average revenue per user
      jobSuccessRate: performanceData.efficiency?.jobsCompleted ? 
        (performanceData.efficiency.jobsCompleted / (performanceData.efficiency.jobsCompleted + 1)) * 100 : 0,
      averageJobValue: revenueData.total / Math.max(performanceData.efficiency?.jobsCompleted || 1, 1),
      customerRetentionRate: 85, // Default value, calculate based on actual data
      workerRetentionRate: 90, // Default value
      averageRating: performanceData.efficiency?.customerSatisfaction || 0,
      nps: 0, // Net Promoter Score
      complaintRate: 0,
      resolutionTime: 0
    };
  }

  // Generate forecasts using simple trend analysis
  async generateForecasts(entityType, entityId, revenueData, expenseData) {
    // Get historical data for trend analysis
    const historicalData = await this.getHistoricalData(entityType, entityId, 6); // Last 6 months

    const revenueTrend = this.calculateTrend(historicalData.map(d => d.revenue?.total || 0));
    const expenseTrend = this.calculateTrend(historicalData.map(d => d.expenses?.total || 0));

    return {
      revenue: {
        nextPeriod: revenueData.total * (1 + revenueTrend),
        confidence: 75,
        factors: ['Historical growth', 'Market conditions', 'Seasonal patterns']
      },
      expenses: {
        nextPeriod: expenseData.total * (1 + expenseTrend),
        confidence: 80,
        factors: ['Cost inflation', 'Operational efficiency', 'Scale effects']
      },
      profit: {
        nextPeriod: (revenueData.total * (1 + revenueTrend)) - (expenseData.total * (1 + expenseTrend)),
        confidence: 70
      }
    };
  }

  // Generate insights
  generateInsights(revenueData, expenseData, profit, kpis) {
    const insights = [];

    // Revenue insights
    if (revenueData.growth && revenueData.growth.percentage > 20) {
      insights.push({
        type: 'opportunity',
        title: 'Strong Revenue Growth',
        description: `Revenue has increased by ${revenueData.growth.percentage.toFixed(1)}%`,
        impact: 'high',
        confidence: 90,
        recommendations: ['Scale operations', 'Invest in marketing', 'Expand service offerings']
      });
    }

    // Expense insights
    const expenseRatio = revenueData.total > 0 ? (expenseData.total / revenueData.total) * 100 : 0;
    if (expenseRatio > 70) {
      insights.push({
        type: 'optimization',
        title: 'High Expense Ratio',
        description: `Expenses are ${expenseRatio.toFixed(1)}% of revenue`,
        impact: 'medium',
        confidence: 85,
        recommendations: ['Review operational costs', 'Negotiate supplier rates', 'Improve efficiency']
      });
    }

    // Profitability insights
    if (profit.margin.net < 10) {
      insights.push({
        type: 'optimization',
        title: 'Low Profit Margin',
        description: `Net profit margin is ${profit.margin.net.toFixed(1)}%`,
        impact: 'high',
        confidence: 95,
        recommendations: ['Increase pricing', 'Reduce costs', 'Focus on high-margin services']
      });
    }

    return insights;
  }

  // Generate alerts
  generateAlerts(revenueData, expenseData, profit, kpis) {
    const alerts = [];

    // Cash flow alert
    if (profit.net < 0) {
      alerts.push({
        type: 'critical',
        category: 'cash_flow',
        message: 'Negative cash flow detected',
        severity: 9,
        actionRequired: true
      });
    }

    // Low profitability alert
    if (profit.margin.net < 5) {
      alerts.push({
        type: 'warning',
        category: 'profitability',
        message: 'Profit margin below 5%',
        severity: 7,
        actionRequired: true
      });
    }

    // High expense alert
    const expenseRatio = revenueData.total > 0 ? (expenseData.total / revenueData.total) * 100 : 0;
    if (expenseRatio > 80) {
      alerts.push({
        type: 'warning',
        category: 'performance',
        message: 'Expense ratio exceeds 80%',
        severity: 6,
        actionRequired: true
      });
    }

    return alerts;
  }

  // Calculate benchmarks
  async calculateBenchmarks(entityType, entityId, revenueData, expenseData) {
    // Industry benchmarks (these would typically come from external data)
    const industryBenchmarks = {
      revenue: 100000, // Industry average
      profit: 15000,   // Industry average
      growth: 10       // Industry average growth rate
    };

    return {
      industry: industryBenchmarks,
      peers: {
        ranking: 0,
        percentile: 0
      },
      previous: {
        revenue: 0,
        expenses: 0,
        profit: 0,
        growth: 0
      }
    };
  }

  // Helper methods
  calculateTrend(values) {
    if (values.length < 2) return 0;
    
    const n = values.length;
    const sumX = n * (n - 1) / 2;
    const sumY = values.reduce((a, b) => a + b, 0);
    const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
    const sumXX = n * (n - 1) * (2 * n - 1) / 6;
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const avgY = sumY / n;
    
    return avgY > 0 ? slope / avgY : 0;
  }

  calculateAverageJobDuration(serviceRequests) {
    const completedJobs = serviceRequests.filter(sr => 
      sr.status === 'completed' && sr.completionDate && sr.createdAt
    );
    
    if (completedJobs.length === 0) return 0;
    
    const totalDuration = completedJobs.reduce((sum, job) => {
      const duration = job.completionDate - job.createdAt;
      return sum + duration;
    }, 0);
    
    return totalDuration / completedJobs.length / (1000 * 60 * 60 * 24); // Days
  }

  async calculateRepeatCustomerRate(workerId, startDate, endDate) {
    const uniqueClients = await ServiceRequest.distinct('client', {
      worker: workerId,
      createdAt: { $gte: startDate, $lte: endDate }
    });
    
    const repeatClients = await ServiceRequest.aggregate([
      {
        $match: {
          worker: workerId,
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: '$client',
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]);
    
    return uniqueClients.length > 0 ? (repeatClients.length / uniqueClients.length) * 100 : 0;
  }

  async getHistoricalData(entityType, entityId, months) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);
    
    return await FinancialAnalytics.find({
      entityType,
      entityId,
      period: 'monthly',
      startDate: { $gte: startDate }
    }).sort({ startDate: 1 });
  }

  async getPreviousPeriodData(entityType, entityId, period, startDate, endDate) {
    const periodDays = this.periods[period].days;
    const prevEndDate = new Date(startDate);
    const prevStartDate = new Date(startDate);
    prevStartDate.setDate(prevStartDate.getDate() - periodDays);
    
    return await FinancialAnalytics.findOne({
      entityType,
      entityId,
      period,
      startDate: { $gte: prevStartDate },
      endDate: { $lte: prevEndDate }
    });
  }

  getEntityModel(entityType) {
    const modelMap = {
      worker: 'Worker',
      client: 'Client',
      service_request: 'ServiceRequest'
    };
    return modelMap[entityType] || 'Worker';
  }

  // Public API methods
  async getAnalytics(entityType, entityId, options = {}) {
    const {
      period = 'monthly',
      startDate = null,
      endDate = null,
      refresh = false
    } = options;

    if (refresh) {
      // Delete existing analytics to force regeneration
      await FinancialAnalytics.deleteMany({
        entityType,
        entityId,
        period,
        ...(startDate && endDate && {
          startDate: { $gte: new Date(startDate) },
          endDate: { $lte: new Date(endDate) }
        })
      });
    }

    return await this.generateAnalytics(
      entityType,
      entityId,
      period,
      startDate ? new Date(startDate) : null,
      endDate ? new Date(endDate) : null
    );
  }

  async getComparativeAnalytics(entityIds, period = 'monthly', startDate = null, endDate = null) {
    const now = new Date();
    const defaultEndDate = endDate ? new Date(endDate) : now;
    const defaultStartDate = startDate ? new Date(startDate) : 
      new Date(now.getTime() - this.periods[period].days * 24 * 60 * 60 * 1000);

    return await FinancialAnalytics.getComparativeAnalysis(
      entityIds,
      period,
      defaultStartDate,
      defaultEndDate
    );
  }

  async getTrendAnalysis(entityType, entityId, months = 12) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - months);

    const analytics = await FinancialAnalytics.find({
      entityType,
      entityId,
      period: 'monthly',
      startDate: { $gte: startDate }
    }).sort({ startDate: 1 });

    return {
      revenue: analytics.map(a => ({
        period: a.startDate,
        value: a.revenue.total
      })),
      expenses: analytics.map(a => ({
        period: a.startDate,
        value: a.expenses.total
      })),
      profit: analytics.map(a => ({
        period: a.startDate,
        value: a.profit.net
      }))
    };
  }
}

export default new FinancialAnalyticsService();
