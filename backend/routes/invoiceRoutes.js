import express from 'express';
import {
  createInvoice,
  getInvoice,
  getInvoices,
  downloadInvoice,
  markInvoiceAsPaid,
  sendInvoiceReminder,
  getInvoiceStats,
  getInvoiceTrends,
  getOverdueInvoices,
  bulkUpdateInvoices
} from '../controllers/invoiceController.js';
import { protect } from '../middleware/auth.js';
import { validateInvoiceCreation, validateInvoicePayment } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Invoice CRUD operations
router.post('/', validateInvoiceCreation, createInvoice);
router.get('/stats', getInvoiceStats);
router.get('/trends', getInvoiceTrends);
router.get('/overdue', getOverdueInvoices);
router.get('/', getInvoices);
router.get('/:invoiceId', getInvoice);
router.get('/:invoiceId/download', downloadInvoice);

// Invoice payment operations
router.patch('/:invoiceId/pay', validateInvoicePayment, markInvoiceAsPaid);
router.post('/:invoiceId/reminder', sendInvoiceReminder);

// Bulk operations
router.patch('/bulk', bulkUpdateInvoices);

export default router;
