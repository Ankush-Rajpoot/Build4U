import Invoice from '../models/Invoice.js';
import invoiceService from '../services/invoiceService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getNotificationService } from '../services/notificationService.js';

// Create invoice from payment request
export const createInvoice = asyncHandler(async (req, res) => {
  const { paymentRequestId } = req.body;
  const { notes } = req.body;

  if (!paymentRequestId) {
    throw new ApiError(400, 'Payment request ID is required');
  }

  const invoice = await invoiceService.createInvoice(paymentRequestId, {
    notes,
    createdBy: req.user._id,
    createdByModel: req.user.constructor.modelName
  });

  // Send notification to client
  const notificationService = getNotificationService();
  await notificationService.createAndEmitNotification({
    recipient: invoice.client,
    recipientModel: 'Client',
    type: 'invoice_generated',
    title: 'Invoice Generated',
    message: `Invoice ${invoice.formattedInvoiceNumber} has been generated for ₹${invoice.totalAmount}`,
    relatedId: invoice._id,
    relatedModel: 'Invoice'
  });

  res.status(201).json(
    new ApiResponse(201, invoice, 'Invoice created successfully')
  );
});

// Get invoice by ID
export const getInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  const invoice = await invoiceService.getInvoice(invoiceId);

  // Check access permissions
  const hasAccess = (userType === 'Client' && invoice.client._id.toString() === userId.toString()) ||
                   (userType === 'Worker' && invoice.worker._id.toString() === userId.toString()) ||
                   (userType === 'Admin');

  if (!hasAccess) {
    throw new ApiError(403, 'Access denied to this invoice');
  }

  // Mark as viewed if client is viewing for the first time
  if (userType === 'Client' && !invoice.viewedAt) {
    invoice.viewedAt = new Date();
    invoice.documentStatus = 'viewed';
    await invoice.save();
  }

  res.json(new ApiResponse(200, invoice, 'Invoice retrieved successfully'));
});

// Get invoices with filters and pagination
export const getInvoices = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  const {
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc',
    paymentStatus,
    financialYear,
    startDate,
    endDate
  } = req.query;

  // Build filters based on user type
  const filters = {};
  if (userType === 'Client') {
    filters.client = userId;
  } else if (userType === 'Worker') {
    filters.worker = userId;
  }

  if (paymentStatus) filters.paymentStatus = paymentStatus;
  if (financialYear) filters.financialYear = financialYear;
  if (startDate && endDate) {
    filters.dateRange = { start: startDate, end: endDate };
  }

  const result = await invoiceService.getInvoices(filters, {
    page: parseInt(page),
    limit: parseInt(limit),
    sortBy,
    sortOrder
  });

  res.json(new ApiResponse(200, result, 'Invoices retrieved successfully'));
});

// Download invoice PDF
export const downloadInvoice = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  const invoice = await invoiceService.getInvoice(invoiceId);

  // Check access permissions
  const hasAccess = (userType === 'Client' && invoice.client._id.toString() === userId.toString()) ||
                   (userType === 'Worker' && invoice.worker._id.toString() === userId.toString()) ||
                   (userType === 'Admin');

  if (!hasAccess) {
    throw new ApiError(403, 'Access denied to this invoice');
  }

  if (!invoice.pdfUrl) {
    throw new ApiError(404, 'Invoice PDF not found');
  }

  // Redirect to PDF URL or serve file
  res.redirect(invoice.pdfUrl);
});

// Mark invoice as paid
export const markInvoiceAsPaid = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const { paymentAmount, paymentDate, paymentMethod, transactionReference } = req.body;
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  const invoice = await invoiceService.getInvoice(invoiceId);

  // Only clients and admins can mark invoice as paid
  if (userType !== 'Client' && userType !== 'Admin') {
    throw new ApiError(403, 'Only clients can mark invoices as paid');
  }

  if (userType === 'Client' && invoice.client._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'Access denied to this invoice');
  }

  const updatedInvoice = await invoiceService.markAsPaid(
    invoiceId,
    paymentAmount,
    paymentDate ? new Date(paymentDate) : new Date()
  );

  // Send notification to worker
  const notificationService = getNotificationService();
  await notificationService.createAndEmitNotification({
    recipient: invoice.worker._id,
    recipientModel: 'Worker',
    type: 'invoice_paid',
    title: 'Invoice Payment Received',
    message: `Payment of ₹${paymentAmount} received for invoice ${invoice.formattedInvoiceNumber}`,
    relatedId: invoice._id,
    relatedModel: 'Invoice'
  });

  res.json(new ApiResponse(200, updatedInvoice, 'Invoice marked as paid successfully'));
});

// Send invoice reminder
export const sendInvoiceReminder = asyncHandler(async (req, res) => {
  const { invoiceId } = req.params;
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  const invoice = await invoiceService.getInvoice(invoiceId);

  // Only workers and admins can send reminders
  if (userType !== 'Worker' && userType !== 'Admin') {
    throw new ApiError(403, 'Only workers can send invoice reminders');
  }

  if (userType === 'Worker' && invoice.worker._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'Access denied to this invoice');
  }

  if (invoice.paymentStatus === 'paid') {
    throw new ApiError(400, 'Cannot send reminder for paid invoice');
  }

  const result = await invoiceService.sendReminder(invoiceId);

  // Send notification to client
  const notificationService = getNotificationService();
  await notificationService.createAndEmitNotification({
    recipient: invoice.client._id,
    recipientModel: 'Client',
    type: 'invoice_reminder',
    title: 'Invoice Payment Reminder',
    message: `Reminder: Payment due for invoice ${invoice.formattedInvoiceNumber} (₹${invoice.balanceAmount})`,
    relatedId: invoice._id,
    relatedModel: 'Invoice'
  });

  res.json(new ApiResponse(200, result, 'Invoice reminder sent successfully'));
});

// Get invoice statistics
export const getInvoiceStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  const matchCondition = {};
  if (userType === 'Client') {
    matchCondition.client = userId;
  } else if (userType === 'Worker') {
    matchCondition.worker = userId;
  }

  const stats = await Invoice.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: null,
        totalInvoices: { $sum: 1 },
        totalAmount: { $sum: '$totalAmount' },
        totalPaid: { $sum: '$paidAmount' },
        totalPending: { $sum: '$balanceAmount' },
        paidInvoices: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
        },
        pendingInvoices: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'pending'] }, 1, 0] }
        },
        overdueInvoices: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'overdue'] }, 1, 0] }
        }
      }
    }
  ]);

  const result = stats[0] || {
    totalInvoices: 0,
    totalAmount: 0,
    totalPaid: 0,
    totalPending: 0,
    paidInvoices: 0,
    pendingInvoices: 0,
    overdueInvoices: 0
  };

  // Calculate percentages
  result.paymentRate = result.totalInvoices > 0 ? 
    (result.paidInvoices / result.totalInvoices) * 100 : 0;

  res.json(new ApiResponse(200, result, 'Invoice statistics retrieved successfully'));
});

// Get monthly invoice trends
export const getInvoiceTrends = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;
  const { months = 12 } = req.query;

  const matchCondition = {};
  if (userType === 'Client') {
    matchCondition.client = userId;
  } else if (userType === 'Worker') {
    matchCondition.worker = userId;
  }

  const startDate = new Date();
  startDate.setMonth(startDate.getMonth() - parseInt(months));

  const trends = await Invoice.aggregate([
    {
      $match: {
        ...matchCondition,
        invoiceDate: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$invoiceDate' },
          month: { $month: '$invoiceDate' }
        },
        totalAmount: { $sum: '$totalAmount' },
        totalInvoices: { $sum: 1 },
        paidAmount: { $sum: '$paidAmount' },
        paidInvoices: {
          $sum: { $cond: [{ $eq: ['$paymentStatus', 'paid'] }, 1, 0] }
        }
      }
    },
    {
      $sort: { '_id.year': 1, '_id.month': 1 }
    }
  ]);

  res.json(new ApiResponse(200, trends, 'Invoice trends retrieved successfully'));
});

// Get overdue invoices
export const getOverdueInvoices = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  const matchCondition = {
    paymentStatus: { $in: ['pending', 'partial', 'overdue'] },
    dueDate: { $lt: new Date() }
  };

  if (userType === 'Client') {
    matchCondition.client = userId;
  } else if (userType === 'Worker') {
    matchCondition.worker = userId;
  }

  const overdueInvoices = await Invoice.find(matchCondition)
    .populate('client', 'name email phone')
    .populate('worker', 'name email phone')
    .populate('serviceRequest', 'title category')
    .sort({ dueDate: 1 });

  res.json(new ApiResponse(200, overdueInvoices, 'Overdue invoices retrieved successfully'));
});

// Bulk operations
export const bulkUpdateInvoices = asyncHandler(async (req, res) => {
  const { invoiceIds, operation, data } = req.body;
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  if (!invoiceIds || !Array.isArray(invoiceIds) || invoiceIds.length === 0) {
    throw new ApiError(400, 'Invoice IDs are required');
  }

  // Verify user has access to all invoices
  const matchCondition = { _id: { $in: invoiceIds } };
  if (userType === 'Client') {
    matchCondition.client = userId;
  } else if (userType === 'Worker') {
    matchCondition.worker = userId;
  }

  const invoices = await Invoice.find(matchCondition);
  
  if (invoices.length !== invoiceIds.length) {
    throw new ApiError(403, 'Access denied to some invoices');
  }

  let updateData = {};
  let result;

  switch (operation) {
    case 'mark_paid':
      updateData = {
        paidAmount: { $expr: '$totalAmount' },
        paymentStatus: 'paid',
        paidAt: new Date()
      };
      break;
    
    case 'send_reminder':
      // This would trigger email reminders
      updateData = {
        'metadata.lastReminderSent': new Date()
      };
      break;
    
    case 'update_due_date':
      if (!data.dueDate) {
        throw new ApiError(400, 'Due date is required');
      }
      updateData = {
        dueDate: new Date(data.dueDate)
      };
      break;
    
    default:
      throw new ApiError(400, 'Invalid operation');
  }

  result = await Invoice.updateMany(matchCondition, updateData);

  res.json(new ApiResponse(200, {
    modified: result.modifiedCount,
    matched: result.matchedCount
  }, `Bulk ${operation} completed successfully`));
});
