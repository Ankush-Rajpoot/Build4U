import { PaymentRequest, Transaction, BudgetTracking } from '../models/Payment.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Worker from '../models/Worker.js';
import Client from '../models/Client.js';
import cashfreeService from '../services/cashfreeService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { getNotificationService } from '../services/notificationService.js';

// Create payment request by worker
export const createPaymentRequest = asyncHandler(async (req, res) => {
  const { serviceRequestId, amount, description } = req.body;
  const workerId = req.user._id;

  // console.log('Payment request attempt:', {
  //   workerId,
  //   userRole: req.userRole,
  //   serviceRequestId,
  //   amount,
  //   user: req.user.name
  // });

  // Validate service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId)
    .populate('client')
    .populate('worker');

  if (!serviceRequest) {
    throw new ApiError(404, 'Service request not found');
  }

  // console.log('Service request found:', {
  //   assignedWorker: serviceRequest.worker?._id?.toString() || serviceRequest.worker?.toString(),
  //   requestingWorker: workerId.toString(),
  //   status: serviceRequest.status,
  //   hasWorker: !!serviceRequest.worker,
  //   workerType: typeof serviceRequest.worker
  // });

  // Check if service request has a worker assigned
  if (!serviceRequest.worker) {
    throw new ApiError(400, 'No worker assigned to this service request');
  }

  // Compare worker IDs - handle both ObjectId and string formats
  const assignedWorkerId = serviceRequest.worker._id ? 
    serviceRequest.worker._id.toString() : 
    serviceRequest.worker.toString();

  if (assignedWorkerId !== workerId.toString()) {
    throw new ApiError(403, 'You are not authorized to request payment for this service');
  }

  if (serviceRequest.status !== 'in-progress' && serviceRequest.status !== 'completed') {
    throw new ApiError(400, 'Payment can only be requested for in-progress or completed services');
  }

  // Check budget tracking
  let budgetTracking = await BudgetTracking.findOne({ serviceRequest: serviceRequestId });
  
  if (!budgetTracking) {
    // Initialize budget tracking if not exists
    budgetTracking = new BudgetTracking({
      serviceRequest: serviceRequestId,
      totalBudget: serviceRequest.budget,
      remainingBudget: serviceRequest.budget
    });
    await budgetTracking.save();
  }

  // Check if requested amount exceeds remaining budget
  if (amount > budgetTracking.remainingBudget) {
    throw new ApiError(400, `Requested amount (₹${amount}) exceeds remaining budget (₹${budgetTracking.remainingBudget})`);
  }

  // Create payment request
  const paymentRequest = new PaymentRequest({
    serviceRequest: serviceRequestId,
    worker: workerId,
    client: serviceRequest.client._id,
    amount,
    description
  });

  await paymentRequest.save();

  // Update pending amount in budget tracking
  budgetTracking.amountPending += amount;
  budgetTracking.remainingBudget -= amount;
  budgetTracking.lastUpdated = new Date();
  await budgetTracking.save();

  // Send notification to client
  const notificationService = getNotificationService();
  await notificationService.createAndEmitNotification({
    recipient: serviceRequest.client._id,
    recipientModel: 'Client',
    type: 'payment_request',
    title: 'New Payment Request',
    message: `${serviceRequest.worker.name} has requested ₹${amount} for: ${description}`,
    relatedId: paymentRequest._id,
    relatedModel: 'PaymentRequest'
  });

  const populatedRequest = await PaymentRequest.findById(paymentRequest._id)
    .populate('worker', 'name email')
    .populate('client', 'name email')
    .populate('serviceRequest', 'title');

  res.status(201).json(
    new ApiResponse(201, populatedRequest, 'Payment request created successfully')
  );
});

// Get payment requests for a service request
export const getPaymentRequests = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  // Verify user has access to this service request
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, 'Service request not found');
  }

  const hasAccess = (userType === 'Client' && serviceRequest.client.toString() === userId.toString()) ||
                   (userType === 'Worker' && serviceRequest.worker?.toString() === userId.toString());

  if (!hasAccess) {
    throw new ApiError(403, 'Access denied');
  }

  const paymentRequests = await PaymentRequest.find({ serviceRequest: serviceRequestId })
    .populate('worker', 'name email')
    .populate('client', 'name email')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, paymentRequests, 'Payment requests retrieved successfully'));
});

// Approve or decline payment request (Client only)
export const respondToPaymentRequest = asyncHandler(async (req, res) => {
  const { requestId } = req.params;
  const { action, declineReason } = req.body; // action: 'approve' or 'decline'
  const clientId = req.user._id;

  const paymentRequest = await PaymentRequest.findById(requestId)
    .populate('serviceRequest')
    .populate('worker')
    .populate('client');

  if (!paymentRequest) {
    throw new ApiError(404, 'Payment request not found');
  }

  if (paymentRequest.client._id.toString() !== clientId.toString()) {
    throw new ApiError(403, 'You are not authorized to respond to this payment request');
  }

  if (paymentRequest.status !== 'pending') {
    throw new ApiError(400, 'This payment request has already been responded to');
  }

  if (action === 'decline') {
    paymentRequest.status = 'declined';
    paymentRequest.declineReason = declineReason;
    paymentRequest.respondedAt = new Date();
    await paymentRequest.save();

    // Update budget tracking - restore pending amount to remaining budget
    const budgetTracking = await BudgetTracking.findOne({ 
      serviceRequest: paymentRequest.serviceRequest._id 
    });
    budgetTracking.amountPending -= paymentRequest.amount;
    budgetTracking.remainingBudget += paymentRequest.amount;
    budgetTracking.lastUpdated = new Date();
    await budgetTracking.save();

    // Notify worker
    const notificationService = getNotificationService();
    await notificationService.createAndEmitNotification({
      recipient: paymentRequest.worker._id,
      recipientModel: 'Worker',
      type: 'payment_declined',
      title: 'Payment Request Declined',
      message: `Your payment request for ₹${paymentRequest.amount} was declined. Reason: ${declineReason || 'No reason provided'}`,
      relatedId: paymentRequest._id,
      relatedModel: 'PaymentRequest'
    });

    res.json(new ApiResponse(200, paymentRequest, 'Payment request declined'));
  } else if (action === 'approve') {
    // Process payment
    const result = await processPayment(paymentRequest);
    res.json(new ApiResponse(200, result, 'Payment processed successfully'));
  } else {
    throw new ApiError(400, 'Invalid action. Use "approve" or "decline"');
  }
});

// Process payment using Cashfree
const processPayment = async (paymentRequest) => {
  try {
    paymentRequest.status = 'approved';
    paymentRequest.respondedAt = new Date();
    await paymentRequest.save();

    // Calculate platform fee and worker amount
    const platformFee = cashfreeService.calculatePlatformFee(paymentRequest.amount);
    const workerAmount = paymentRequest.amount - platformFee;

    // Generate unique transaction ID
    const transactionId = cashfreeService.generateTransferId();

    // Create transaction record
    const transaction = new Transaction({
      serviceRequest: paymentRequest.serviceRequest,
      paymentRequest: paymentRequest._id,
      worker: paymentRequest.worker,
      client: paymentRequest.client,
      amount: paymentRequest.amount,
      platformFee,
      workerAmount,
      transactionId,
      description: paymentRequest.description
    });

    // Get worker bank details
    const worker = await Worker.findById(paymentRequest.worker);
    
    // In test mode, use mock bank details if worker doesn't have them
    let workerBankDetails;
    const isTestMode = process.env.NODE_ENV !== 'production' || process.env.CASHFREE_ENVIRONMENT !== 'production';
    
    if (isTestMode && (!worker.bankDetails || !worker.bankDetails.accountNumber)) {
      console.log('[Payment Test] Using mock bank details for testing');
      workerBankDetails = {
        beneId: worker._id.toString(),
        name: worker.name,
        email: worker.email,
        phone: worker.phone || '9999999999',
        address: worker.address || 'Test Address',
        accountNumber: '1234567890',
        ifsc: 'TEST0000001'
      };
    } else if (worker.bankDetails && worker.bankDetails.accountNumber) {
      workerBankDetails = {
        beneId: worker._id.toString(),
        name: worker.name,
        email: worker.email,
        phone: worker.phone,
        address: worker.address || 'Not provided',
        accountNumber: worker.bankDetails.accountNumber,
        ifsc: worker.bankDetails.ifsc
      };
    } else {
      throw new ApiError(400, 'Worker bank details not found. Please update bank details first.');
    }

    // Create payout to worker
    const payoutResult = await cashfreeService.createPayout({
      transferId: transactionId,
      amount: workerAmount,
      workerBankDetails
    });

    if (payoutResult.success) {
      transaction.status = 'success';
      transaction.gatewayTransactionId = payoutResult.data.transfer_id;
      transaction.gatewayResponse = payoutResult.data;
      
      paymentRequest.status = 'processed';
      paymentRequest.processedAt = new Date();
      paymentRequest.paymentGatewayData = {
        transferId: payoutResult.data.transfer_id,
        gatewayResponse: payoutResult.data
      };
    } else {
      transaction.status = 'failed';
      transaction.gatewayResponse = payoutResult.error;
      paymentRequest.status = 'failed';
    }

    await transaction.save();
    await paymentRequest.save();

    // Update budget tracking
    const budgetTracking = await BudgetTracking.findOne({ 
      serviceRequest: paymentRequest.serviceRequest 
    });
    
    if (payoutResult.success) {
      budgetTracking.amountPaid += paymentRequest.amount;
      budgetTracking.amountPending -= paymentRequest.amount;
    } else {
      // Restore to remaining budget if payment failed
      budgetTracking.amountPending -= paymentRequest.amount;
      budgetTracking.remainingBudget += paymentRequest.amount;
    }
    
    budgetTracking.lastUpdated = new Date();
    await budgetTracking.save();

    // Send notifications
    const notificationTitle = payoutResult.success ? 'Payment Processed' : 'Payment Failed';
    const notificationMessage = payoutResult.success 
      ? `Payment of ₹${workerAmount} has been transferred to your account`
      : `Payment processing failed. Please contact support.`;

    const notificationService = getNotificationService();
    await notificationService.createAndEmitNotification({
      recipient: paymentRequest.worker,
      recipientModel: 'Worker',
      type: payoutResult.success ? 'payment_processed' : 'payment_failed',
      title: notificationTitle,
      message: notificationMessage,
      relatedId: transaction._id,
      relatedModel: 'Transaction'
    });

    return {
      paymentRequest,
      transaction,
      success: payoutResult.success
    };

  } catch (error) {
    console.error('Payment processing error:', error);
    paymentRequest.status = 'failed';
    await paymentRequest.save();
    throw error;
  }
};

// Get payment history for a service request
export const getPaymentHistory = asyncHandler(async (req, res) => {
  const { serviceRequestId } = req.params;
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  // Verify access
  const serviceRequest = await ServiceRequest.findById(serviceRequestId);
  if (!serviceRequest) {
    throw new ApiError(404, 'Service request not found');
  }

  const hasAccess = (userType === 'Client' && serviceRequest.client.toString() === userId.toString()) ||
                   (userType === 'Worker' && serviceRequest.worker?.toString() === userId.toString());

  if (!hasAccess) {
    throw new ApiError(403, 'Access denied');
  }

  // Get budget tracking
  const budgetTracking = await BudgetTracking.findOne({ serviceRequest: serviceRequestId });

  // Get all transactions
  const transactions = await Transaction.find({ serviceRequest: serviceRequestId })
    .populate('paymentRequest')
    .sort({ createdAt: -1 });

  // Get all payment requests
  const paymentRequests = await PaymentRequest.find({ serviceRequest: serviceRequestId })
    .populate('worker', 'name')
    .sort({ createdAt: -1 });

  res.json(new ApiResponse(200, {
    budgetTracking,
    transactions,
    paymentRequests,
    summary: {
      totalBudget: budgetTracking?.totalBudget || serviceRequest.budget,
      amountPaid: budgetTracking?.amountPaid || 0,
      amountPending: budgetTracking?.amountPending || 0,
      remainingBudget: budgetTracking?.remainingBudget || serviceRequest.budget,
      utilizationPercentage: budgetTracking?.budgetUtilizationPercentage || '0.00'
    }
  }, 'Payment history retrieved successfully'));
});

// Get user's overall payment statistics
export const getPaymentStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userType = req.user.constructor.modelName;

  let stats = {};

  if (userType === 'Worker') {
    // Worker statistics
    const totalEarnings = await Transaction.aggregate([
      { $match: { worker: userId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$workerAmount' } } }
    ]);

    const pendingPayments = await PaymentRequest.aggregate([
      { $match: { worker: userId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    stats = {
      totalEarnings: totalEarnings[0]?.total || 0,
      pendingPayments: pendingPayments[0]?.total || 0,
      totalTransactions: await Transaction.countDocuments({ worker: userId, status: 'success' }),
      pendingRequests: await PaymentRequest.countDocuments({ worker: userId, status: 'pending' })
    };
  } else if (userType === 'Client') {
    // Client statistics
    const totalSpent = await Transaction.aggregate([
      { $match: { client: userId, status: 'success' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    const pendingApprovals = await PaymentRequest.aggregate([
      { $match: { client: userId, status: 'pending' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    stats = {
      totalSpent: totalSpent[0]?.total || 0,
      pendingApprovals: pendingApprovals[0]?.total || 0,
      totalTransactions: await Transaction.countDocuments({ client: userId, status: 'success' }),
      pendingRequests: await PaymentRequest.countDocuments({ client: userId, status: 'pending' })
    };
  }

  res.json(new ApiResponse(200, stats, 'Payment statistics retrieved successfully'));
});

// Cashfree webhook handler
export const handleCashfreeWebhook = asyncHandler(async (req, res) => {
  const signature = req.headers['x-cashfree-signature'];
  const timestamp = req.headers['x-cashfree-timestamp'];
  const rawBody = JSON.stringify(req.body);

  // Verify webhook signature
  if (!cashfreeService.verifyWebhookSignature(rawBody, signature, timestamp)) {
    throw new ApiError(401, 'Invalid webhook signature');
  }

  const { event_type, data } = req.body;

  if (event_type === 'TRANSFER_SUCCESS' || event_type === 'TRANSFER_FAILED') {
    const transferId = data.transfer_id;
    const transaction = await Transaction.findOne({ transactionId: transferId });

    if (transaction) {
      transaction.status = event_type === 'TRANSFER_SUCCESS' ? 'success' : 'failed';
      transaction.gatewayResponse = data;
      await transaction.save();

      // Update payment request status
      const paymentRequest = await PaymentRequest.findById(transaction.paymentRequest);
      if (paymentRequest) {
        paymentRequest.status = event_type === 'TRANSFER_SUCCESS' ? 'processed' : 'failed';
        await paymentRequest.save();
      }
    }
  }

  res.json({ received: true });
});
