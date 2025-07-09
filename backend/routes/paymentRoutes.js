import express from 'express';
import {
  createPaymentRequest,
  getPaymentRequests,
  respondToPaymentRequest,
  getPaymentHistory,
  getPaymentStats,
  handleCashfreeWebhook
} from '../controllers/paymentController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validatePaymentRequest, validatePaymentResponse } from '../middleware/validation.js';

const router = express.Router();

// Create payment request (Worker only)
router.post('/request', protect, restrictTo('worker'), validatePaymentRequest, createPaymentRequest);

// Get payment requests for a service request
router.get('/requests/:serviceRequestId', protect, getPaymentRequests);

// Approve or decline payment request (Client only)
router.post('/respond/:requestId', protect, restrictTo('client'), validatePaymentResponse, respondToPaymentRequest);

// Get payment history for a service request
router.get('/history/:serviceRequestId', protect, getPaymentHistory);

// Get user's payment statistics
router.get('/stats', protect, getPaymentStats);

// Cashfree webhook (no authentication needed)
router.post('/webhook/cashfree', handleCashfreeWebhook);

export default router;
