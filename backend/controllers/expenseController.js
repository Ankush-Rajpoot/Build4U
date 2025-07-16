import Expense from '../models/Expense.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getNotificationService } from '../services/notificationService.js';
import cloudinary from '../config/cloudinary.js';

// Create new expense
export const createExpense = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    amount,
    category,
    subcategory,
    serviceRequestId,
    expenseDate,
    vendor,
    paymentMethod,
    paymentStatus,
    paymentReference,
    tags,
    location
  } = req.body;

  const workerId = req.user._id;

  // Validate required fields
  if (!title || !amount || !category || !serviceRequestId) {
    throw new ApiError(400, 'Title, amount, category, and service request are required');
  }

  // Verify worker has access to the service request
  const ServiceRequest = (await import('../models/ServiceRequest.js')).default;
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  
  if (!serviceRequest) {
    throw new ApiError(404, 'Service request not found');
  }

  if (serviceRequest.worker.toString() !== workerId.toString()) {
    throw new ApiError(403, 'Access denied to this service request');
  }

  // Create expense
  const expense = new Expense({
    title,
    description,
    amount,
    category,
    subcategory,
    serviceRequest: serviceRequestId,
    worker: workerId,
    client: serviceRequest.client,
    expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
    vendor,
    paymentMethod,
    paymentStatus: paymentStatus || 'paid',
    paymentReference,
    tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
    location,
    approvalStatus: amount > 5000 ? 'pending' : 'approved' // Auto-approve small expenses
  });

  await expense.save();

  // Send notification to client if approval is required
  if (expense.approvalStatus === 'pending') {
    const notificationService = getNotificationService();
    await notificationService.createAndEmitNotification({
      recipient: serviceRequest.client,
      recipientModel: 'Client',
      type: 'expense_approval_required',
      title: 'Expense Approval Required',
      message: `${req.user.name} submitted an expense of ₹${amount} for approval`,
      relatedId: expense._id,
      relatedModel: 'Expense'
    });
  }

  const populatedExpense = await Expense.findById(expense._id)
    .populate('worker', 'name email')
    .populate('client', 'name email')
    .populate('serviceRequest', 'title category');

  res.status(201).json(
    new ApiResponse(201, populatedExpense, 'Expense created successfully')
  );
});

// Upload expense receipt
export const uploadReceipt = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const workerId = req.user._id;

  if (!req.file) {
    throw new ApiError(400, 'Receipt file is required');
  }

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  if (expense.worker.toString() !== workerId.toString()) {
    throw new ApiError(403, 'Access denied to this expense');
  }

  // Upload to Cloudinary
  const uploadResult = await cloudinary.uploader.upload(req.file.path, {
    folder: 'expenses/receipts',
    resource_type: 'auto',
    public_id: `receipt_${expenseId}_${Date.now()}`
  });

  // Add receipt to expense
  await expense.addReceipt({
    url: uploadResult.secure_url,
    filename: req.file.originalname,
    filesize: req.file.size,
    mimetype: req.file.mimetype,
    cloudinaryId: uploadResult.public_id
  });

  res.json(new ApiResponse(200, {
    receiptUrl: uploadResult.secure_url,
    receiptCount: expense.receipts.length
  }, 'Receipt uploaded successfully'));
});

// Get expenses with filters
export const getExpenses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  const {
    page = 1,
    limit = 20,
    sortBy = 'expenseDate',
    sortOrder = 'desc',
    category,
    approvalStatus,
    serviceRequestId,
    startDate,
    endDate,
    search
  } = req.query;

  // Build query based on user type
  const query = {};
  if (userType === 'Worker') {
    query.worker = userId;
  } else if (userType === 'Client') {
    query.client = userId;
  }

  if (category) query.category = category;
  if (approvalStatus) query.approvalStatus = approvalStatus;
  if (serviceRequestId) query.serviceRequest = serviceRequestId;

  if (startDate && endDate) {
    query.expenseDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  if (search) {
    query.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } },
      { 'vendor.name': { $regex: search, $options: 'i' } }
    ];
  }

  const expenses = await Expense.find(query)
    .populate('worker', 'name email')
    .populate('client', 'name email')
    .populate('serviceRequest', 'title category')
    .sort({ [sortBy]: sortOrder === 'desc' ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const total = await Expense.countDocuments(query);

  res.json(new ApiResponse(200, {
    expenses,
    pagination: {
      current: parseInt(page),
      pages: Math.ceil(total / limit),
      total,
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  }, 'Expenses retrieved successfully'));
});

// Get expense by ID
export const getExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  const expense = await Expense.findById(expenseId)
    .populate('worker', 'name email phone')
    .populate('client', 'name email phone')
    .populate('serviceRequest', 'title category description');

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  // Check access permissions
  const hasAccess = (userType === 'Worker' && expense.worker._id.toString() === userId.toString()) ||
                   (userType === 'Client' && expense.client._id.toString() === userId.toString()) ||
                   (userType === 'Admin');

  if (!hasAccess) {
    throw new ApiError(403, 'Access denied to this expense');
  }

  res.json(new ApiResponse(200, expense, 'Expense retrieved successfully'));
});

// Update expense
export const updateExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const workerId = req.user._id;
  const updateData = req.body;

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  if (expense.worker.toString() !== workerId.toString()) {
    throw new ApiError(403, 'Access denied to this expense');
  }

  if (expense.approvalStatus === 'approved') {
    throw new ApiError(400, 'Cannot update approved expense');
  }

  // Remove restricted fields
  delete updateData.approvalStatus;
  delete updateData.approvedBy;
  delete updateData.approvedAt;
  delete updateData.worker;
  delete updateData.client;

  // Parse tags if provided
  if (updateData.tags && typeof updateData.tags === 'string') {
    updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
  }

  Object.assign(expense, updateData);
  await expense.save();

  const updatedExpense = await Expense.findById(expenseId)
    .populate('worker', 'name email')
    .populate('client', 'name email')
    .populate('serviceRequest', 'title category');

  res.json(new ApiResponse(200, updatedExpense, 'Expense updated successfully'));
});

// Delete expense
export const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const workerId = req.user._id;

  const expense = await Expense.findById(expenseId);
  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  if (expense.worker.toString() !== workerId.toString()) {
    throw new ApiError(403, 'Access denied to this expense');
  }

  if (expense.approvalStatus === 'approved') {
    throw new ApiError(400, 'Cannot delete approved expense');
  }

  // Delete receipt files from Cloudinary
  for (const receipt of expense.receipts) {
    if (receipt.cloudinaryId) {
      await cloudinary.uploader.destroy(receipt.cloudinaryId);
    }
  }

  await Expense.findByIdAndDelete(expenseId);

  res.json(new ApiResponse(200, {}, 'Expense deleted successfully'));
});

// Approve expense (Client only)
export const approveExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const clientId = req.user._id;
  const { notes } = req.body;

  const expense = await Expense.findById(expenseId)
    .populate('worker', 'name email')
    .populate('serviceRequest', 'title');

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  if (expense.client.toString() !== clientId.toString()) {
    throw new ApiError(403, 'Access denied to this expense');
  }

  if (expense.approvalStatus !== 'pending') {
    throw new ApiError(400, 'Expense is not pending approval');
  }

  await expense.approve(clientId, 'Client');

  if (notes) {
    expense.approvalNotes = notes;
    await expense.save();
  }

  // Send notification to worker
  const notificationService = getNotificationService();
  await notificationService.createAndEmitNotification({
    recipient: expense.worker._id,
    recipientModel: 'Worker',
    type: 'expense_approved',
    title: 'Expense Approved',
    message: `Your expense of ₹${expense.amount} has been approved by ${req.user.name}`,
    relatedId: expense._id,
    relatedModel: 'Expense'
  });

  res.json(new ApiResponse(200, expense, 'Expense approved successfully'));
});

// Reject expense (Client only)
export const rejectExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const clientId = req.user._id;
  const { reason } = req.body;

  if (!reason) {
    throw new ApiError(400, 'Rejection reason is required');
  }

  const expense = await Expense.findById(expenseId)
    .populate('worker', 'name email')
    .populate('serviceRequest', 'title');

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  if (expense.client.toString() !== clientId.toString()) {
    throw new ApiError(403, 'Access denied to this expense');
  }

  if (expense.approvalStatus !== 'pending') {
    throw new ApiError(400, 'Expense is not pending approval');
  }

  await expense.reject(clientId, 'Client', reason);

  // Send notification to worker
  const notificationService = getNotificationService();
  await notificationService.createAndEmitNotification({
    recipient: expense.worker._id,
    recipientModel: 'Worker',
    type: 'expense_rejected',
    title: 'Expense Rejected',
    message: `Your expense of ₹${expense.amount} was rejected. Reason: ${reason}`,
    relatedId: expense._id,
    relatedModel: 'Expense'
  });

  res.json(new ApiResponse(200, expense, 'Expense rejected successfully'));
});

// Get expense statistics
export const getExpenseStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;
  const { period = 'monthly', startDate, endDate } = req.query;

  const matchCondition = {};
  if (userType === 'Worker') {
    matchCondition.worker = userId;
  } else if (userType === 'Client') {
    matchCondition.client = userId;
  }

  // Add date filter
  if (startDate && endDate) {
    matchCondition.expenseDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else {
    // Default to current month
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    matchCondition.expenseDate = { $gte: startOfMonth, $lte: endOfMonth };
  }

  const stats = await Expense.aggregate([
    { $match: { ...matchCondition, approvalStatus: 'approved' } },
    {
      $group: {
        _id: null,
        totalExpenses: { $sum: 1 },
        totalAmount: { $sum: '$amount' },
        totalTax: { $sum: '$taxDetails.taxAmount' },
        avgExpense: { $avg: '$amount' },
        categories: {
          $push: {
            category: '$category',
            amount: '$amount'
          }
        }
      }
    }
  ]);

  // Get category breakdown
  const categoryStats = await Expense.getCategoryTotals(
    userId,
    matchCondition.expenseDate.$gte,
    matchCondition.expenseDate.$lte
  );

  // Get monthly trends
  const trends = await Expense.getMonthlyTrends(userId, 12);

  const result = {
    summary: stats[0] || {
      totalExpenses: 0,
      totalAmount: 0,
      totalTax: 0,
      avgExpense: 0
    },
    categoryBreakdown: categoryStats,
    monthlyTrends: trends
  };

  res.json(new ApiResponse(200, result, 'Expense statistics retrieved successfully'));
});

// Get pending approvals (Client only)
export const getPendingApprovals = asyncHandler(async (req, res) => {
  const clientId = req.user._id;

  const pendingExpenses = await Expense.find({
    client: clientId,
    approvalStatus: 'pending'
  })
    .populate('worker', 'name email phone')
    .populate('serviceRequest', 'title category')
    .sort({ expenseDate: -1 });

  res.json(new ApiResponse(200, pendingExpenses, 'Pending expense approvals retrieved successfully'));
});

// Bulk approve expenses
export const bulkApproveExpenses = asyncHandler(async (req, res) => {
  const { expenseIds, notes } = req.body;
  const clientId = req.user._id;

  if (!expenseIds || !Array.isArray(expenseIds) || expenseIds.length === 0) {
    throw new ApiError(400, 'Expense IDs are required');
  }

  // Verify all expenses belong to this client and are pending
  const expenses = await Expense.find({
    _id: { $in: expenseIds },
    client: clientId,
    approvalStatus: 'pending'
  });

  if (expenses.length !== expenseIds.length) {
    throw new ApiError(400, 'Some expenses are not eligible for approval');
  }

  // Approve all expenses
  const approvalPromises = expenses.map(expense => 
    expense.approve(clientId, 'Client')
  );

  await Promise.all(approvalPromises);

  // Send bulk notification to workers
  const notificationService = getNotificationService();
  const workerIds = [...new Set(expenses.map(e => e.worker.toString()))];
  
  for (const workerId of workerIds) {
    const workerExpenses = expenses.filter(e => e.worker.toString() === workerId);
    const totalAmount = workerExpenses.reduce((sum, e) => sum + e.amount, 0);
    
    await notificationService.createAndEmitNotification({
      recipient: workerId,
      recipientModel: 'Worker',
      type: 'expenses_bulk_approved',
      title: 'Expenses Approved',
      message: `${workerExpenses.length} expenses totaling ₹${totalAmount} have been approved`,
      relatedId: expenses[0]._id,
      relatedModel: 'Expense'
    });
  }

  res.json(new ApiResponse(200, {
    approvedCount: expenses.length,
    totalAmount: expenses.reduce((sum, e) => sum + e.amount, 0)
  }, 'Expenses approved successfully'));
});

// Export expenses to CSV
export const exportExpenses = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;
  const { startDate, endDate, format = 'csv' } = req.query;

  const query = {};
  if (userType === 'Worker') {
    query.worker = userId;
  } else if (userType === 'Client') {
    query.client = userId;
  }

  if (startDate && endDate) {
    query.expenseDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  }

  const expenses = await Expense.find(query)
    .populate('worker', 'name email')
    .populate('client', 'name email')
    .populate('serviceRequest', 'title category')
    .sort({ expenseDate: -1 });

  if (format === 'csv') {
    // Generate CSV
    const csvHeader = 'Date,Title,Category,Amount,Tax,Total,Status,Worker,Client,Service\n';
    const csvRows = expenses.map(expense => {
      const totalAmount = expense.amount + expense.taxDetails.taxAmount;
      return [
        expense.expenseDate.toISOString().split('T')[0],
        `"${expense.title}"`,
        expense.category,
        expense.amount,
        expense.taxDetails.taxAmount,
        totalAmount,
        expense.approvalStatus,
        `"${expense.worker?.name || ''}"`,
        `"${expense.client?.name || ''}"`,
        `"${expense.serviceRequest?.title || ''}"`
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=expenses_${Date.now()}.csv`);
    res.send(csvContent);
  } else {
    res.json(new ApiResponse(200, expenses, 'Expenses exported successfully'));
  }
});
