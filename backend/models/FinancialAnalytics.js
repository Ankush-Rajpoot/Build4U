import mongoose from 'mongoose';

const financialAnalyticsSchema = new mongoose.Schema({
  // Time Period
  period: {
    type: String,
    required: true,
    enum: ['daily', 'weekly', 'monthly', 'quarterly', 'yearly']
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Entity Information
  entityType: {
    type: String,
    required: true,
    enum: ['client', 'worker', 'platform', 'service_request']
  },
  entityId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'entityModel'
  },
  entityModel: {
    type: String,
    required: true,
    enum: ['Client', 'Worker', 'ServiceRequest']
  },
  
  // Revenue Analytics
  revenue: {
    total: {
      type: Number,
      default: 0
    },
    gross: {
      type: Number,
      default: 0
    },
    net: {
      type: Number,
      default: 0
    },
    recurring: {
      type: Number,
      default: 0
    },
    oneTime: {
      type: Number,
      default: 0
    },
    byCategory: {
      type: Map,
      of: Number,
      default: new Map()
    },
    growth: {
      percentage: Number,
      amount: Number,
      trend: {
        type: String,
        enum: ['increasing', 'decreasing', 'stable']
      }
    }
  },
  
  // Expense Analytics
  expenses: {
    total: {
      type: Number,
      default: 0
    },
    operating: {
      type: Number,
      default: 0
    },
    materials: {
      type: Number,
      default: 0
    },
    equipment: {
      type: Number,
      default: 0
    },
    transportation: {
      type: Number,
      default: 0
    },
    other: {
      type: Number,
      default: 0
    },
    byCategory: {
      type: Map,
      of: Number,
      default: new Map()
    },
    averagePerJob: Number,
    costEfficiencyRatio: Number
  },
  
  // Profit Analytics
  profit: {
    gross: {
      type: Number,
      default: 0
    },
    net: {
      type: Number,
      default: 0
    },
    margin: {
      gross: Number,
      net: Number
    },
    beforeTax: Number,
    afterTax: Number,
    trends: {
      weekOverWeek: Number,
      monthOverMonth: Number,
      yearOverYear: Number
    }
  },
  
  // Tax Analytics
  taxes: {
    total: {
      type: Number,
      default: 0
    },
    cgst: {
      type: Number,
      default: 0
    },
    sgst: {
      type: Number,
      default: 0
    },
    igst: {
      type: Number,
      default: 0
    },
    tds: {
      type: Number,
      default: 0
    },
    cess: {
      type: Number,
      default: 0
    },
    effectiveRate: Number,
    savings: Number,
    compliance: {
      filedReturns: Number,
      pendingReturns: Number,
      overdueReturns: Number
    }
  },
  
  // Platform Analytics (for platform-wide data)
  platform: {
    commissionEarned: {
      type: Number,
      default: 0
    },
    commissionRate: {
      type: Number,
      default: 5
    },
    transactionVolume: {
      type: Number,
      default: 0
    },
    activeUsers: {
      clients: Number,
      workers: Number,
      total: Number
    },
    jobMetrics: {
      completed: Number,
      inProgress: Number,
      cancelled: Number,
      totalValue: Number
    }
  },
  
  // Performance Metrics
  performance: {
    // For Workers
    hourlyRate: {
      average: Number,
      minimum: Number,
      maximum: Number,
      trend: String
    },
    utilization: {
      hoursWorked: Number,
      hoursAvailable: Number,
      utilizationRate: Number
    },
    efficiency: {
      jobsCompleted: Number,
      averageJobDuration: Number,
      customerSatisfaction: Number,
      repeatCustomerRate: Number
    },
    
    // For Clients
    spending: {
      total: Number,
      average: Number,
      frequency: Number,
      categories: Map
    },
    savings: {
      total: Number,
      percentage: Number,
      comparedToMarket: Number
    }
  },
  
  // Cash Flow Analytics
  cashFlow: {
    inflow: {
      total: Number,
      operations: Number,
      investing: Number,
      financing: Number
    },
    outflow: {
      total: Number,
      operations: Number,
      investing: Number,
      financing: Number
    },
    net: Number,
    burnRate: Number,
    runway: Number
  },
  
  // Forecast Data
  forecasts: {
    revenue: {
      nextPeriod: Number,
      confidence: Number,
      factors: [String]
    },
    expenses: {
      nextPeriod: Number,
      confidence: Number,
      factors: [String]
    },
    profit: {
      nextPeriod: Number,
      confidence: Number
    }
  },
  
  // Key Performance Indicators
  kpis: {
    // Financial KPIs
    roi: Number,
    roas: Number,
    ltv: Number,
    cac: Number,
    arpu: Number,
    
    // Operational KPIs
    jobSuccessRate: Number,
    averageJobValue: Number,
    customerRetentionRate: Number,
    workerRetentionRate: Number,
    
    // Quality KPIs
    averageRating: Number,
    nps: Number,
    complaintRate: Number,
    resolutionTime: Number
  },
  
  // Comparison Data
  benchmarks: {
    industry: {
      revenue: Number,
      profit: Number,
      growth: Number
    },
    peers: {
      ranking: Number,
      percentile: Number
    },
    previous: {
      revenue: Number,
      expenses: Number,
      profit: Number,
      growth: Number
    }
  },
  
  // Risk Analytics
  risks: {
    financial: {
      cashFlowRisk: Number,
      creditRisk: Number,
      marketRisk: Number
    },
    operational: {
      workerChurnRisk: Number,
      qualityRisk: Number,
      complianceRisk: Number
    },
    strategic: {
      competitionRisk: Number,
      technologyRisk: Number,
      regulatoryRisk: Number
    }
  },
  
  // Alerts and Insights
  alerts: [{
    type: {
      type: String,
      enum: ['warning', 'critical', 'info', 'success']
    },
    category: {
      type: String,
      enum: ['cash_flow', 'profitability', 'growth', 'compliance', 'performance']
    },
    message: String,
    severity: {
      type: Number,
      min: 1,
      max: 10
    },
    actionRequired: Boolean,
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  insights: [{
    type: {
      type: String,
      enum: ['opportunity', 'optimization', 'trend', 'anomaly']
    },
    title: String,
    description: String,
    impact: {
      type: String,
      enum: ['high', 'medium', 'low']
    },
    confidence: {
      type: Number,
      min: 0,
      max: 100
    },
    recommendations: [String],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Data Quality
  dataQuality: {
    completeness: Number,
    accuracy: Number,
    timeliness: Number,
    consistency: Number,
    lastUpdated: {
      type: Date,
      default: Date.now
    }
  },
  
  // Processing Information
  processing: {
    status: {
      type: String,
      enum: ['pending', 'processing', 'completed', 'failed'],
      default: 'pending'
    },
    startedAt: Date,
    completedAt: Date,
    duration: Number,
    errors: [String],
    version: {
      type: String,
      default: '1.0'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
financialAnalyticsSchema.index({ entityType: 1, entityId: 1, period: 1, startDate: -1 });
financialAnalyticsSchema.index({ period: 1, startDate: -1 });
financialAnalyticsSchema.index({ entityType: 1, startDate: -1 });
financialAnalyticsSchema.index({ 'processing.status': 1 });
financialAnalyticsSchema.index({ createdAt: -1 });

// Compound indexes
financialAnalyticsSchema.index({ entityType: 1, entityId: 1, period: 1 });
financialAnalyticsSchema.index({ startDate: 1, endDate: 1 });

// Virtual fields
financialAnalyticsSchema.virtual('profitMargin').get(function() {
  if (this.revenue.total === 0) return 0;
  return (this.profit.net / this.revenue.total) * 100;
});

financialAnalyticsSchema.virtual('expenseRatio').get(function() {
  if (this.revenue.total === 0) return 0;
  return (this.expenses.total / this.revenue.total) * 100;
});

financialAnalyticsSchema.virtual('taxRate').get(function() {
  if (this.revenue.total === 0) return 0;
  return (this.taxes.total / this.revenue.total) * 100;
});

// Static methods
financialAnalyticsSchema.statics.generateReport = async function(entityType, entityId, period, startDate, endDate) {
  // This method will be implemented in the service layer
  return null;
};

financialAnalyticsSchema.statics.getComparativeAnalysis = function(entityIds, period, startDate, endDate) {
  return this.aggregate([
    {
      $match: {
        entityId: { $in: entityIds },
        period: period,
        startDate: { $gte: startDate },
        endDate: { $lte: endDate }
      }
    },
    {
      $group: {
        _id: '$entityId',
        avgRevenue: { $avg: '$revenue.total' },
        avgExpenses: { $avg: '$expenses.total' },
        avgProfit: { $avg: '$profit.net' },
        totalRevenue: { $sum: '$revenue.total' },
        totalExpenses: { $sum: '$expenses.total' },
        totalProfit: { $sum: '$profit.net' }
      }
    }
  ]);
};

// Instance methods
financialAnalyticsSchema.methods.calculateGrowthRate = function(previousPeriodData) {
  if (!previousPeriodData || previousPeriodData.revenue.total === 0) {
    return 0;
  }
  
  return ((this.revenue.total - previousPeriodData.revenue.total) / previousPeriodData.revenue.total) * 100;
};

financialAnalyticsSchema.methods.generateInsights = function() {
  const insights = [];
  
  // Revenue insights
  if (this.revenue.growth && this.revenue.growth.percentage > 20) {
    insights.push({
      type: 'opportunity',
      title: 'High Revenue Growth',
      description: `Revenue has grown by ${this.revenue.growth.percentage}% compared to the previous period`,
      impact: 'high',
      confidence: 90,
      recommendations: ['Scale marketing efforts', 'Invest in capacity expansion']
    });
  }
  
  // Expense insights
  if (this.expenseRatio > 80) {
    insights.push({
      type: 'optimization',
      title: 'High Expense Ratio',
      description: `Expenses account for ${this.expenseRatio.toFixed(1)}% of revenue`,
      impact: 'high',
      confidence: 95,
      recommendations: ['Review and optimize operational costs', 'Negotiate better supplier rates']
    });
  }
  
  // Profit margin insights
  if (this.profitMargin < 10) {
    insights.push({
      type: 'optimization',
      title: 'Low Profit Margin',
      description: `Profit margin is ${this.profitMargin.toFixed(1)}%, below industry average`,
      impact: 'medium',
      confidence: 85,
      recommendations: ['Increase pricing', 'Reduce operational costs', 'Improve efficiency']
    });
  }
  
  this.insights = insights;
  return insights;
};

export default mongoose.model('FinancialAnalytics', financialAnalyticsSchema);
