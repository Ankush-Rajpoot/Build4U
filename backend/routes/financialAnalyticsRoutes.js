import express from 'express';
import {
  getAnalytics,
  getDashboardOverview,
  getRevenueAnalytics,
  getExpenseAnalytics,
  getProfitAnalytics,
  getTaxAnalytics,
  getComparativeAnalytics,
  getForecasts,
  getInsights,
  exportReport
} from '../controllers/financialAnalyticsController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Main analytics endpoints
router.get('/', getAnalytics);
router.get('/dashboard', getDashboardOverview);

// Specific analytics endpoints
router.get('/revenue', getRevenueAnalytics);
router.get('/expenses', getExpenseAnalytics);
router.get('/profit', getProfitAnalytics);
router.get('/tax', getTaxAnalytics);

// Advanced analytics
router.get('/comparative', getComparativeAnalytics);
router.get('/forecasts', getForecasts);
router.get('/insights', getInsights);

// Reports and exports
router.get('/export', exportReport);

export default router;
