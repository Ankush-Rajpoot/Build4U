import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    required: [true, 'Expense title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  
  // Financial Details
  amount: {
    type: Number,
    required: [true, 'Amount is required'],
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    default: 'INR',
    enum: ['INR', 'USD', 'EUR']
  },
  
  // Categorization
  category: {
    type: String,
    required: true,
    enum: [
      'materials',
      'equipment',
      'transportation',
      'accommodation',
      'meals',
      'communication',
      'documentation',
      'permits',
      'insurance',
      'utilities',
      'maintenance',
      'professional_services',
      'office_supplies',
      'marketing',
      'training',
      'other'
    ]
  },
  subcategory: {
    type: String,
    trim: true
  },
  
  // Relationships
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
    ref: 'Client'
  },
  
  // Date Information
  expenseDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  
  // Receipt Management
  receipts: [{
    url: {
      type: String,
      required: true
    },
    filename: String,
    filesize: Number,
    mimetype: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    },
    cloudinaryId: String
  }],
  
  // Vendor Information
  vendor: {
    name: String,
    address: String,
    phone: String,
    email: String,
    gstin: String,
    vendorType: {
      type: String,
      enum: ['supplier', 'contractor', 'service_provider', 'individual', 'other']
    }
  },
  
  // Tax Information
  taxDetails: {
    isTaxable: {
      type: Boolean,
      default: true
    },
    taxRate: {
      type: Number,
      min: 0,
      max: 100,
      default: 18
    },
    taxAmount: {
      type: Number,
      min: 0,
      default: 0
    },
    taxType: {
      type: String,
      enum: ['CGST_SGST', 'IGST', 'EXEMPT', 'NIL_RATED'],
      default: 'CGST_SGST'
    },
    hsnCode: String,
    placeOfSupply: String
  },
  
  // Payment Information
  paymentMethod: {
    type: String,
    enum: ['cash', 'upi', 'bank_transfer', 'card', 'cheque', 'other'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'partially_paid', 'overdue'],
    default: 'paid'
  },
  paymentDate: Date,
  paymentReference: String,
  
  // Approval Workflow
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'requires_review'],
    default: 'pending'
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'approvedByModel'
  },
  approvedByModel: {
    type: String,
    enum: ['Client', 'Worker', 'Admin']
  },
  approvedAt: Date,
  rejectionReason: String,
  
  // Reimbursement
  reimbursementStatus: {
    type: String,
    enum: ['not_applicable', 'pending', 'approved', 'paid', 'rejected'],
    default: 'not_applicable'
  },
  reimbursementAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  reimbursementNotes: String,
  
  // Location Information
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  
  // Tags and Labels
  tags: [String],
  isRecurring: {
    type: Boolean,
    default: false
  },
  recurringPattern: {
    frequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly', 'yearly']
    },
    interval: Number,
    endDate: Date
  },
  
  // Compliance and Audit
  isBusinessExpense: {
    type: Boolean,
    default: true
  },
  deductibleAmount: {
    type: Number,
    min: 0
  },
  auditTrail: [{
    action: String,
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'auditTrail.performedByModel'
    },
    performedByModel: {
      type: String,
      enum: ['Client', 'Worker', 'Admin']
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    details: mongoose.Schema.Types.Mixed
  }],
  
  // Integration Fields
  integrationData: {
    accountingSoftware: String,
    externalId: String,
    syncStatus: {
      type: String,
      enum: ['pending', 'synced', 'failed'],
      default: 'pending'
    },
    lastSyncAt: Date
  },
  
  // Analytics Fields
  analytics: {
    costPerHour: Number,
    costPerDay: Number,
    efficiencyRating: Number,
    benchmarkComparison: Number
  },
  
  // Metadata
  metadata: {
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'import'],
      default: 'web'
    },
    ipAddress: String,
    userAgent: String,
    importBatch: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
expenseSchema.index({ worker: 1, expenseDate: -1 });
expenseSchema.index({ serviceRequest: 1, expenseDate: -1 });
expenseSchema.index({ client: 1, expenseDate: -1 });
expenseSchema.index({ category: 1, expenseDate: -1 });
expenseSchema.index({ approvalStatus: 1 });
expenseSchema.index({ reimbursementStatus: 1 });
expenseSchema.index({ expenseDate: -1 });
expenseSchema.index({ 'tags': 1 });

// Compound indexes
expenseSchema.index({ worker: 1, category: 1, expenseDate: -1 });
expenseSchema.index({ serviceRequest: 1, approvalStatus: 1 });

// Virtual fields
expenseSchema.virtual('totalAmount').get(function() {
  return this.amount + this.taxDetails.taxAmount;
});

expenseSchema.virtual('isOverdue').get(function() {
  if (this.paymentStatus === 'paid') return false;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  return this.expenseDate < thirtyDaysAgo;
});

expenseSchema.virtual('receiptCount').get(function() {
  return this.receipts.length;
});

// Pre-save middleware
expenseSchema.pre('save', function(next) {
  // Calculate tax amount if taxable
  if (this.taxDetails.isTaxable) {
    this.taxDetails.taxAmount = (this.amount * this.taxDetails.taxRate) / 100;
  } else {
    this.taxDetails.taxAmount = 0;
  }
  
  // Set deductible amount if not specified
  if (this.deductibleAmount === undefined) {
    this.deductibleAmount = this.isBusinessExpense ? this.amount : 0;
  }
  
  // Set payment date if status is paid and date not set
  if (this.paymentStatus === 'paid' && !this.paymentDate) {
    this.paymentDate = new Date();
  }
  
  next();
});

// Static methods
expenseSchema.statics.getCategoryTotals = function(workerId, startDate, endDate) {
  const workerObjectId = (typeof workerId === 'string' && mongoose.Types.ObjectId.isValid(workerId))
    ? new mongoose.Types.ObjectId(workerId)
    : workerId;
  return this.aggregate([
    {
      $match: {
        worker: workerObjectId,
        expenseDate: {
          $gte: startDate,
          $lte: endDate
        },
        approvalStatus: 'approved'
      }
    },
    {
      $group: {
        _id: '$category',
        totalAmount: { $sum: '$amount' },
        totalTax: { $sum: '$taxDetails.taxAmount' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' }
      }
    },
    {
      $sort: { totalAmount: -1 }
    }
  ]);
};

expenseSchema.statics.getMonthlyTrends = function(workerId, months = 12) {
  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - months);
  const workerObjectId = (typeof workerId === 'string' && mongoose.Types.ObjectId.isValid(workerId))
    ? new mongoose.Types.ObjectId(workerId)
    : workerId;
  return this.aggregate([
    {
      $match: {
        worker: workerObjectId,
        expenseDate: { $gte: startDate },
        approvalStatus: 'approved'
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$expenseDate' },
          month: { $month: '$expenseDate' }
        },
        totalAmount: { $sum: '$amount' },
        totalTax: { $sum: '$taxDetails.taxAmount' },
        count: { $sum: 1 },
        categories: { $addToSet: '$category' }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);
};

// Instance methods
expenseSchema.methods.approve = function(approvedBy, approvedByModel) {
  this.approvalStatus = 'approved';
  this.approvedBy = approvedBy;
  this.approvedByModel = approvedByModel;
  this.approvedAt = new Date();
  
  // Add to audit trail
  this.auditTrail.push({
    action: 'approved',
    performedBy: approvedBy,
    performedByModel: approvedByModel,
    details: { previousStatus: 'pending' }
  });
  
  return this.save();
};

expenseSchema.methods.reject = function(rejectedBy, rejectedByModel, reason) {
  this.approvalStatus = 'rejected';
  this.rejectionReason = reason;
  
  // Add to audit trail
  this.auditTrail.push({
    action: 'rejected',
    performedBy: rejectedBy,
    performedByModel: rejectedByModel,
    details: { reason, previousStatus: this.approvalStatus }
  });
  
  return this.save();
};

expenseSchema.methods.addReceipt = function(receiptData) {
  this.receipts.push({
    ...receiptData,
    uploadedAt: new Date()
  });
  return this.save();
};

export default mongoose.model('Expense', expenseSchema);
