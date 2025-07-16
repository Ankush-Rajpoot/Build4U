import financialAnalyticsService from '../services/financialAnalyticsService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';

// Get financial analytics for user
export const getAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName.toLowerCase();
  
  const {
    period = 'monthly',
    startDate,
    endDate,
    refresh = false
  } = req.query;

  const analytics = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    {
      period,
      startDate,
      endDate,
      refresh: refresh === 'true'
    }
  );

  res.json(new ApiResponse(200, analytics, 'Financial analytics retrieved successfully'));
});

// Get dashboard overview
export const getDashboardOverview = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName.toLowerCase();

  // Get current month analytics
  const currentMonth = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    { period: 'monthly' }
  );

  // Get previous month for comparison
  const now = new Date();
  const prevMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
  const prevMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  const previousMonth = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    {
      period: 'monthly',
      startDate: prevMonthStart.toISOString(),
      endDate: prevMonthEnd.toISOString()
    }
  );

  // Calculate growth rates
  const revenueGrowth = calculateGrowthRate(
    currentMonth.revenue.total,
    previousMonth.revenue.total
  );

  const expenseGrowth = calculateGrowthRate(
    currentMonth.expenses.total,
    previousMonth.expenses.total
  );

  const profitGrowth = calculateGrowthRate(
    currentMonth.profit.net,
    previousMonth.profit.net
  );

  // Get trends for last 6 months
  const trends = await financialAnalyticsService.getTrendAnalysis(
    userType,
    userId,
    6
  );

  const overview = {
    currentPeriod: {
      revenue: currentMonth.revenue.total,
      expenses: currentMonth.expenses.total,
      profit: currentMonth.profit.net,
      profitMargin: currentMonth.profitMargin
    },
    growth: {
      revenue: revenueGrowth,
      expenses: expenseGrowth,
      profit: profitGrowth
    },
    trends,
    kpis: currentMonth.kpis,
    alerts: currentMonth.alerts,
    insights: currentMonth.insights.slice(0, 3) // Top 3 insights
  };

  res.json(new ApiResponse(200, overview, 'Dashboard overview retrieved successfully'));
});

// Get revenue analytics
export const getRevenueAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName.toLowerCase();
  
  const {
    period = 'monthly',
    startDate,
    endDate,
    groupBy = 'category'
  } = req.query;

  const analytics = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    { period, startDate, endDate }
  );

  // Get detailed revenue breakdown
  const revenueBreakdown = {
    total: analytics.revenue.total,
    byCategory: analytics.revenue.byCategory,
    trends: await financialAnalyticsService.getTrendAnalysis(userType, userId, 12),
    forecasts: analytics.forecasts.revenue,
    growth: analytics.revenue.growth
  };

  res.json(new ApiResponse(200, revenueBreakdown, 'Revenue analytics retrieved successfully'));
});

// Get expense analytics
export const getExpenseAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName.toLowerCase();
  
  const {
    period = 'monthly',
    startDate,
    endDate
  } = req.query;

  const analytics = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    { period, startDate, endDate }
  );

  const expenseBreakdown = {
    total: analytics.expenses.total,
    byCategory: analytics.expenses.byCategory,
    operatingExpenses: analytics.expenses.operating,
    nonOperatingExpenses: analytics.expenses.total - analytics.expenses.operating,
    averagePerJob: analytics.expenses.averagePerJob,
    trends: (await financialAnalyticsService.getTrendAnalysis(userType, userId, 12)).expenses,
    forecasts: analytics.forecasts.expenses,
    efficiency: {
      costPerRevenue: analytics.expenses.total / Math.max(analytics.revenue.total, 1),
      expenseRatio: analytics.expenseRatio
    }
  };

  res.json(new ApiResponse(200, expenseBreakdown, 'Expense analytics retrieved successfully'));
});

// Get profit analytics
export const getProfitAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName.toLowerCase();
  
  const {
    period = 'monthly',
    startDate,
    endDate
  } = req.query;

  const analytics = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    { period, startDate, endDate }
  );

  const profitAnalysis = {
    gross: analytics.profit.gross,
    net: analytics.profit.net,
    margins: analytics.profit.margin,
    beforeTax: analytics.profit.beforeTax,
    afterTax: analytics.profit.afterTax,
    trends: analytics.profit.trends,
    forecasts: analytics.forecasts.profit,
    breakdown: {
      revenue: analytics.revenue.total,
      directCosts: analytics.expenses.materials + analytics.expenses.equipment,
      operatingExpenses: analytics.expenses.operating,
      taxes: analytics.taxes.total
    }
  };

  res.json(new ApiResponse(200, profitAnalysis, 'Profit analytics retrieved successfully'));
});

// Get tax analytics
export const getTaxAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName.toLowerCase();
  
  const {
    financialYear,
    quarter
  } = req.query;

  let startDate, endDate;

  if (financialYear) {
    // Financial year in India: April 1 to March 31
    const [startYear, endYear] = financialYear.split('-');
    startDate = new Date(`20${startYear}-04-01`);
    endDate = new Date(`20${endYear}-03-31`);
  } else {
    // Current financial year
    const now = new Date();
    const currentYear = now.getFullYear();
    const isBeforeApril = now.getMonth() < 3; // April is month 3 (0-indexed)
    
    if (isBeforeApril) {
      startDate = new Date(currentYear - 1, 3, 1); // April 1 of previous year
      endDate = new Date(currentYear, 2, 31); // March 31 of current year
    } else {
      startDate = new Date(currentYear, 3, 1); // April 1 of current year
      endDate = new Date(currentYear + 1, 2, 31); // March 31 of next year
    }
  }

  const analytics = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    {
      period: 'yearly',
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    }
  );

  const taxAnalysis = {
    totalTax: analytics.taxes.total,
    breakdown: {
      cgst: analytics.taxes.cgst,
      sgst: analytics.taxes.sgst,
      igst: analytics.taxes.igst,
      tds: analytics.taxes.tds,
      cess: analytics.taxes.cess
    },
    effectiveRate: analytics.taxes.effectiveRate,
    compliance: analytics.taxes.compliance,
    savings: analytics.taxes.savings,
    quarterlyBreakdown: await getQuarterlyTaxBreakdown(userId, userType, startDate, endDate),
    recommendations: getTaxOptimizationRecommendations(analytics)
  };

  res.json(new ApiResponse(200, taxAnalysis, 'Tax analytics retrieved successfully'));
});

// Get comparative analytics
export const getComparativeAnalytics = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;
  
  const {
    compareWith = 'previous_period',
    period = 'monthly',
    startDate,
    endDate
  } = req.query;

  const currentAnalytics = await financialAnalyticsService.getAnalytics(
    userType.toLowerCase(),
    userId,
    { period, startDate, endDate }
  );

  let comparisonData;

  if (compareWith === 'previous_period') {
    // Get previous period data
    const periodDays = {
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 90,
      yearly: 365
    };

    const days = periodDays[period] || 30;
    const prevEndDate = new Date(startDate || Date.now());
    const prevStartDate = new Date(prevEndDate);
    prevStartDate.setDate(prevStartDate.getDate() - days);

    comparisonData = await financialAnalyticsService.getAnalytics(
      userType.toLowerCase(),
      userId,
      {
        period,
        startDate: prevStartDate.toISOString(),
        endDate: prevEndDate.toISOString()
      }
    );
  }

  const comparison = {
    current: {
      revenue: currentAnalytics.revenue.total,
      expenses: currentAnalytics.expenses.total,
      profit: currentAnalytics.profit.net,
      profitMargin: currentAnalytics.profitMargin
    },
    previous: comparisonData ? {
      revenue: comparisonData.revenue.total,
      expenses: comparisonData.expenses.total,
      profit: comparisonData.profit.net,
      profitMargin: comparisonData.profitMargin
    } : null,
    changes: comparisonData ? {
      revenue: calculateGrowthRate(currentAnalytics.revenue.total, comparisonData.revenue.total),
      expenses: calculateGrowthRate(currentAnalytics.expenses.total, comparisonData.expenses.total),
      profit: calculateGrowthRate(currentAnalytics.profit.net, comparisonData.profit.net),
      profitMargin: currentAnalytics.profitMargin - comparisonData.profitMargin
    } : null
  };

  res.json(new ApiResponse(200, comparison, 'Comparative analytics retrieved successfully'));
});

// Get financial forecasts
export const getForecasts = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName.toLowerCase();
  
  const {
    horizon = 3, // months
    confidence = 'medium'
  } = req.query;

  const analytics = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    { period: 'monthly' }
  );

  // Get historical data for better forecasting
  const trends = await financialAnalyticsService.getTrendAnalysis(
    userType,
    userId,
    12
  );

  const forecasts = {
    revenue: generateDetailedForecast(trends.revenue, parseInt(horizon)),
    expenses: generateDetailedForecast(trends.expenses, parseInt(horizon)),
    profit: generateDetailedForecast(trends.profit, parseInt(horizon)),
    confidence: getConfidenceLevel(confidence),
    assumptions: [
      'Historical trend continues',
      'No major market disruptions',
      'Current business model remains stable',
      'Seasonal patterns repeat'
    ],
    scenarios: {
      optimistic: generateScenarioForecast(trends, horizon, 1.2),
      realistic: generateScenarioForecast(trends, horizon, 1.0),
      pessimistic: generateScenarioForecast(trends, horizon, 0.8)
    }
  };

  res.json(new ApiResponse(200, forecasts, 'Financial forecasts retrieved successfully'));
});

// Get insights and recommendations
export const getInsights = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName.toLowerCase();

  const analytics = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    { period: 'monthly' }
  );

  const insights = {
    alerts: analytics.alerts,
    insights: analytics.insights,
    recommendations: generateActionableRecommendations(analytics),
    opportunities: identifyOpportunities(analytics),
    risks: identifyRisks(analytics)
  };

  res.json(new ApiResponse(200, insights, 'Financial insights retrieved successfully'));
});

// Export financial report
export const exportReport = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName.toLowerCase();
  
  const {
    period = 'monthly',
    startDate,
    endDate,
    format = 'pdf',
    sections = 'all'
  } = req.query;

  const analytics = await financialAnalyticsService.getAnalytics(
    userType,
    userId,
    { period, startDate, endDate }
  );

  if (format === 'json') {
    res.json(new ApiResponse(200, analytics, 'Financial report exported successfully'));
  } else if (format === 'csv') {
    const csvData = generateCSVReport(analytics);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=financial_report_${Date.now()}.csv`);
    res.send(csvData);
  } else {
    // PDF format would require additional implementation
    res.json(new ApiResponse(200, analytics, 'PDF export not yet implemented'));
  }
});

// Helper functions
function calculateGrowthRate(current, previous) {
  if (!previous || previous === 0) return 0;
  return ((current - previous) / previous) * 100;
}

async function getQuarterlyTaxBreakdown(userId, userType, startDate, endDate) {
  const quarters = [
    { name: 'Q1', start: new Date(startDate.getFullYear(), 3, 1), end: new Date(startDate.getFullYear(), 5, 30) },
    { name: 'Q2', start: new Date(startDate.getFullYear(), 6, 1), end: new Date(startDate.getFullYear(), 8, 30) },
    { name: 'Q3', start: new Date(startDate.getFullYear(), 9, 1), end: new Date(startDate.getFullYear(), 11, 31) },
    { name: 'Q4', start: new Date(startDate.getFullYear() + 1, 0, 1), end: new Date(startDate.getFullYear() + 1, 2, 31) }
  ];

  const quarterlyData = [];
  
  for (const quarter of quarters) {
    const analytics = await financialAnalyticsService.getAnalytics(
      userType,
      userId,
      {
        period: 'quarterly',
        startDate: quarter.start.toISOString(),
        endDate: quarter.end.toISOString()
      }
    );
    
    quarterlyData.push({
      quarter: quarter.name,
      totalTax: analytics.taxes.total,
      revenue: analytics.revenue.total,
      taxRate: analytics.taxes.effectiveRate
    });
  }

  return quarterlyData;
}

function getTaxOptimizationRecommendations(analytics) {
  const recommendations = [];
  
  if (analytics.taxes.effectiveRate > 20) {
    recommendations.push('Consider expense optimization to reduce taxable income');
  }
  
  if (analytics.expenses.equipment < analytics.revenue.total * 0.1) {
    recommendations.push('Explore equipment purchases for tax deductions');
  }
  
  recommendations.push('Maintain proper documentation for all business expenses');
  recommendations.push('Consider quarterly tax planning sessions');
  
  return recommendations;
}

function generateDetailedForecast(historicalData, horizon) {
  const forecasts = [];
  const trend = calculateTrendFromData(historicalData);
  
  let lastValue = historicalData[historicalData.length - 1]?.value || 0;
  
  for (let i = 1; i <= horizon; i++) {
    lastValue = lastValue * (1 + trend);
    forecasts.push({
      period: i,
      value: Math.max(0, lastValue),
      confidence: Math.max(50, 90 - (i * 10)) // Decreasing confidence over time
    });
  }
  
  return forecasts;
}

function calculateTrendFromData(data) {
  if (data.length < 2) return 0;
  
  const values = data.map(d => d.value);
  const n = values.length;
  const sumX = n * (n - 1) / 2;
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = values.reduce((sum, y, x) => sum + x * y, 0);
  const sumXX = n * (n - 1) * (2 * n - 1) / 6;
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const avgY = sumY / n;
  
  return avgY > 0 ? slope / avgY : 0;
}

function generateScenarioForecast(trends, horizon, factor) {
  return {
    revenue: generateDetailedForecast(trends.revenue, horizon).map(f => ({
      ...f,
      value: f.value * factor
    })),
    expenses: generateDetailedForecast(trends.expenses, horizon).map(f => ({
      ...f,
      value: f.value * factor
    })),
    profit: generateDetailedForecast(trends.profit, horizon).map(f => ({
      ...f,
      value: f.value * factor
    }))
  };
}

function getConfidenceLevel(level) {
  const levels = {
    low: 60,
    medium: 75,
    high: 90
  };
  return levels[level] || 75;
}

function generateActionableRecommendations(analytics) {
  const recommendations = [];
  
  if (analytics.profitMargin < 15) {
    recommendations.push({
      category: 'profitability',
      title: 'Improve Profit Margins',
      description: 'Focus on high-margin services and optimize pricing',
      priority: 'high',
      expectedImpact: 'Increase profit margin by 5-10%'
    });
  }
  
  if (analytics.expenseRatio > 70) {
    recommendations.push({
      category: 'costs',
      title: 'Reduce Operating Costs',
      description: 'Review and optimize operational expenses',
      priority: 'medium',
      expectedImpact: 'Reduce costs by 10-15%'
    });
  }
  
  return recommendations;
}

function identifyOpportunities(analytics) {
  const opportunities = [];
  
  if (analytics.revenue.growth && analytics.revenue.growth.percentage > 15) {
    opportunities.push({
      type: 'growth',
      title: 'Scale Operations',
      description: 'Strong revenue growth indicates opportunity to scale',
      potential: 'High'
    });
  }
  
  return opportunities;
}

function identifyRisks(analytics) {
  const risks = [];
  
  if (analytics.cashFlow.net < 0) {
    risks.push({
      type: 'cash_flow',
      title: 'Negative Cash Flow',
      description: 'Immediate attention required for cash flow management',
      severity: 'High'
    });
  }
  
  return risks;
}

function generateCSVReport(analytics) {
  const headers = [
    'Metric',
    'Current Period',
    'Previous Period',
    'Change (%)',
    'Trend'
  ].join(',');
  
  const rows = [
    ['Revenue', analytics.revenue.total, '', '', ''].join(','),
    ['Expenses', analytics.expenses.total, '', '', ''].join(','),
    ['Profit', analytics.profit.net, '', '', ''].join(','),
    ['Profit Margin (%)', analytics.profitMargin, '', '', ''].join(',')
  ];
  
  return [headers, ...rows].join('\n');
}
