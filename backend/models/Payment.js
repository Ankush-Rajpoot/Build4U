import mongoose from 'mongoose';

const paymentRequestSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [1, 'Amount must be at least ₹1']
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
    trim: true,
    maxlength: [200, 'Description cannot exceed 200 characters']
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'declined', 'processed', 'failed'],
    default: 'pending'
  },
  declineReason: {
    type: String,
    maxlength: [300, 'Decline reason cannot exceed 300 characters']
  },
  paymentGatewayData: {
    orderId: String,
    paymentId: String,
    transferId: String,
    payoutId: String,
    gatewayResponse: mongoose.Schema.Types.Mixed
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: Date,
  processedAt: Date
}, {
  timestamps: true
});

const transactionSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true
  },
  paymentRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PaymentRequest',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  
  // Enhanced Amount Fields
  amount: {
    type: Number,
    required: true
  },
  baseAmount: {
    type: Number,
    required: true
  },
  
  // Tax Information
  taxDetails: {
    isApplicable: {
      type: Boolean,
      default: true
    },
    taxRate: {
      type: Number,
      default: 18,
      min: 0,
      max: 100
    },
    cgst: {
      rate: Number,
      amount: Number
    },
    sgst: {
      rate: Number,
      amount: Number
    },
    igst: {
      rate: Number,
      amount: Number
    },
    tds: {
      rate: Number,
      amount: Number,
      applicable: Boolean
    },
    totalTaxAmount: {
      type: Number,
      default: 0
    },
    placeOfSupply: String,
    hsnCode: {
      type: String,
      default: '998314'
    }
  },
  
  // Fee Structure
  platformFee: {
    percentage: {
      type: Number,
      default: 5,
      min: 0,
      max: 100
    },
    amount: {
      type: Number,
      required: true,
      default: 0
    },
    taxOnFee: {
      type: Number,
      default: 0
    }
  },
  
  workerAmount: {
    type: Number,
    required: true
  },
  
  // Financial Year and Compliance
  financialYear: {
    type: String,
    required: true
  },
  quarter: {
    type: String,
    enum: ['Q1', 'Q2', 'Q3', 'Q4'],
    required: true
  },
  
  transactionId: {
    type: String,
    required: true,
    unique: true
  },
  paymentGateway: {
    type: String,
    enum: ['cashfree'],
    default: 'cashfree'
  },
  gatewayTransactionId: String,
  status: {
    type: String,
    enum: ['pending', 'success', 'failed', 'refunded'],
    default: 'pending'
  },
  type: {
    type: String,
    enum: ['payment', 'refund'],
    default: 'payment'
  },
  description: String,
  gatewayResponse: mongoose.Schema.Types.Mixed
}, {
  timestamps: true
});

const budgetTrackingSchema = new mongoose.Schema({
  serviceRequest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ServiceRequest',
    required: true,
    unique: true
  },
  totalBudget: {
    type: Number,
    required: true
  },
  amountPaid: {
    type: Number,
    default: 0
  },
  amountPending: {
    type: Number,
    default: 0
  },
  remainingBudget: {
    type: Number,
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better performance
paymentRequestSchema.index({ serviceRequest: 1, status: 1 });
paymentRequestSchema.index({ worker: 1, status: 1 });
paymentRequestSchema.index({ client: 1, status: 1 });
paymentRequestSchema.index({ createdAt: -1 });

transactionSchema.index({ serviceRequest: 1 });
transactionSchema.index({ worker: 1 });
transactionSchema.index({ client: 1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ createdAt: -1 });

budgetTrackingSchema.index({ serviceRequest: 1 });

// Virtual for remaining budget calculation
budgetTrackingSchema.virtual('budgetUtilizationPercentage').get(function() {
  return ((this.amountPaid / this.totalBudget) * 100).toFixed(2);
});

export const PaymentRequest = mongoose.model('PaymentRequest', paymentRequestSchema);
export const Transaction = mongoose.model('Transaction', transactionSchema);
export const BudgetTracking = mongoose.model('BudgetTracking', budgetTrackingSchema);
