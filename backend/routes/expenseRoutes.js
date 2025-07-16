import express from 'express';
import {
  createExpense,
  uploadReceipt,
  getExpenses,
  getExpense,
  updateExpense,
  deleteExpense,
  approveExpense,
  rejectExpense,
  getExpenseStats,
  getPendingApprovals,
  bulkApproveExpenses,
  exportExpenses
} from '../controllers/expenseController.js';
import { protect } from '../middleware/auth.js';
import parser from '../middleware/uploadMiddleware.js';
import { validateExpenseCreation, validateExpenseApproval } from '../middleware/validation.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Expense CRUD operations
router.post('/', validateExpenseCreation, createExpense);
router.get('/stats', getExpenseStats);
router.get('/pending-approvals', getPendingApprovals);
router.get('/export', exportExpenses);
router.get('/', getExpenses);
router.get('/:expenseId', getExpense);
router.put('/:expenseId', updateExpense);
router.delete('/:expenseId', deleteExpense);

// Receipt upload
router.post('/:expenseId/receipt', parser.single('receipt'), uploadReceipt);

// Approval operations (Client only)
router.patch('/:expenseId/approve', validateExpenseApproval, approveExpense);
router.patch('/:expenseId/reject', validateExpenseApproval, rejectExpense);
router.patch('/bulk/approve', bulkApproveExpenses);

export default router;
