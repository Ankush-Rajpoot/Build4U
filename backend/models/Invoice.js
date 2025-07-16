import mongoose from 'mongoose';

const invoiceItemSchema = new mongoose.Schema({
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 200
  },
  quantity: {
    type: Number,
    required: true,
    min: 0.01,
    default: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['labor', 'materials', 'equipment', 'transportation', 'other'],
    default: 'labor'
  },
  taxable: {
    type: Boolean,
    default: true
  }
});

const taxBreakdownSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['CGST', 'SGST', 'IGST', 'CESS', 'TDS'],
    required: true
  },
  rate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: String
});

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  
  // Financial Year and Series
  financialYear: {
    type: String,
    required: true
  },
  series: {
    type: String,
    default: 'B4U'
  },
  
  // Related Documents
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
  transaction: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction'
  },
  
  // Parties
  client: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Client',
    required: true
  },
  worker: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Worker',
    required: true
  },
  
  // Invoice Details
  invoiceDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: true
  },
  
  // Items and Amounts
  items: [invoiceItemSchema],
  
  // Financial Calculations
  subtotal: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Tax Information
  taxBreakdown: [taxBreakdownSchema],
  totalTax: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Platform Fee
  platformFee: {
    amount: {
      type: Number,
      default: 0,
      min: 0
    },
    percentage: {
      type: Number,
      default: 5,
      min: 0,
      max: 100
    }
  },
  
  // Total Amounts
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  
  // Payment Information
  paymentStatus: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  balanceAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  
  // Business Information
  businessDetails: {
    name: {
      type: String,
      default: 'BuildForYou Platform'
    },
    address: {
      type: String,
      default: 'Bangalore, Karnataka, India'
    },
    gstin: {
      type: String,
      default: '29XXXXX1234X1Z5'
    },
    pan: {
      type: String,
      default: 'XXXXX1234X'
    },
    phone: {
      type: String,
      default: '+91-XXXXXXXXXX'
    },
    email: {
      type: String,
      default: 'invoices@buildloryou.com'
    }
  },
  
  // Client Billing Information
  billingAddress: {
    name: String,
    address: String,
    city: String,
    state: String,
    pincode: String,
    gstin: String,
    phone: String,
    email: String
  },
  
  // Additional Information
  notes: String,
  termsAndConditions: {
    type: String,
    default: 'Payment is due within 30 days of invoice date. Late payments may incur additional charges.'
  },
  
  // Document Management
  pdfUrl: String,
  documentStatus: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'cancelled'],
    default: 'draft'
  },
  
  // Compliance
  placeOfSupply: String,
  hsnCode: {
    type: String,
    default: '998314' // Service code for construction services
  },
  
  // Tracking
  sentAt: Date,
  viewedAt: Date,
  paidAt: Date,
  
  // Audit Trail
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'createdByModel'
  },
  createdByModel: {
    type: String,
    enum: ['Client', 'Worker', 'Admin']
  },
  
  // Metadata
  metadata: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'api', 'system'],
      default: 'system'
    }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for performance
invoiceSchema.index({ invoiceNumber: 1 });
invoiceSchema.index({ client: 1, invoiceDate: -1 });
invoiceSchema.index({ worker: 1, invoiceDate: -1 });
invoiceSchema.index({ serviceRequest: 1 });
invoiceSchema.index({ paymentStatus: 1, dueDate: 1 });
invoiceSchema.index({ financialYear: 1, series: 1 });
invoiceSchema.index({ createdAt: -1 });

// Virtual fields
invoiceSchema.virtual('isOverdue').get(function() {
  return this.paymentStatus !== 'paid' && new Date() > this.dueDate;
});

invoiceSchema.virtual('daysOverdue').get(function() {
  if (!this.isOverdue) return 0;
  return Math.floor((new Date() - this.dueDate) / (1000 * 60 * 60 * 24));
});

invoiceSchema.virtual('formattedInvoiceNumber').get(function() {
  return `${this.series}/${this.financialYear}/${this.invoiceNumber}`;
});

// Pre-save middleware
invoiceSchema.pre('save', function(next) {
  // Calculate balance amount
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  // Update payment status based on paid amount
  if (this.paidAmount === 0) {
    this.paymentStatus = 'pending';
  } else if (this.paidAmount >= this.totalAmount) {
    this.paymentStatus = 'paid';
    if (!this.paidAt) this.paidAt = new Date();
  } else {
    this.paymentStatus = 'partial';
  }
  
  // Check if overdue
  if (this.paymentStatus !== 'paid' && new Date() > this.dueDate) {
    this.paymentStatus = 'overdue';
  }
  
  next();
});

// Static methods
invoiceSchema.statics.generateInvoiceNumber = async function(financialYear, series = 'B4U') {
  const lastInvoice = await this.findOne(
    { financialYear, series },
    {},
    { sort: { createdAt: -1 } }
  );
  
  let nextNumber = 1;
  if (lastInvoice) {
    const lastNumber = parseInt(lastInvoice.invoiceNumber.split('/').pop()) || 0;
    nextNumber = lastNumber + 1;
  }
  
  return `${nextNumber.toString().padStart(4, '0')}`;
};

invoiceSchema.statics.getCurrentFinancialYear = function() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // getMonth() returns 0-11
  
  if (month >= 4) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
};

// Instance methods
invoiceSchema.methods.calculateTotals = function() {
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate total tax
  this.totalTax = this.taxBreakdown.reduce((sum, tax) => sum + tax.amount, 0);
  
  // Calculate platform fee
  this.platformFee.amount = (this.subtotal * this.platformFee.percentage) / 100;
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.totalTax;
  
  // Update balance
  this.balanceAmount = this.totalAmount - this.paidAmount;
  
  return this;
};

invoiceSchema.methods.addPayment = function(amount) {
  this.paidAmount += amount;
  if (!this.paidAt && this.paidAmount >= this.totalAmount) {
    this.paidAt = new Date();
  }
  return this.save();
};

export default mongoose.model('Invoice', invoiceSchema);
