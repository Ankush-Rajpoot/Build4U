import express from 'express';
import {
  createReview,
  getWorkerReviews,
  getClientReviews,
  updateReview,
  deleteReview,
  respondToReview,
  getReviewByServiceRequestId
} from '../controllers/reviewController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// Review validation
const validateReview = [
  body('serviceRequestId')
    .isMongoId()
    .withMessage('Valid service request ID is required'),
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('workQuality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Work quality rating must be between 1 and 5'),
  body('communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('timeliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Timeliness rating must be between 1 and 5'),
  body('professionalism')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Professionalism rating must be between 1 and 5')
];

const validateReviewUpdate = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('workQuality')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Work quality rating must be between 1 and 5'),
  body('communication')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Communication rating must be between 1 and 5'),
  body('timeliness')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Timeliness rating must be between 1 and 5'),
  body('professionalism')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Professionalism rating must be between 1 and 5')
];

// Public routes
router.get('/worker/:workerId', getWorkerReviews);
router.get('/by-service-request/:serviceRequestId', getReviewByServiceRequestId);

// Protected routes
router.use(protect);

// Client routes
router.post('/', restrictTo('client'), validateReview, createReview);
router.get('/client', restrictTo('client'), getClientReviews);
router.put('/:id', restrictTo('client'), validateReviewUpdate, updateReview);
router.delete('/:id', restrictTo('client'), deleteReview);

// Worker routes
router.get('/worker', restrictTo('worker'), getWorkerReviews);
router.put('/:id/response', restrictTo('worker'), respondToReview);

export default router;