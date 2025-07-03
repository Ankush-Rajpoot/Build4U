import express from 'express';
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markMultipleAsRead,
  deleteNotification,
  deleteMultipleNotifications,
  createNotification
} from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation for creating notifications
const validateNotification = [
  body('recipientId')
    .isMongoId()
    .withMessage('Valid recipient ID is required'),
  body('recipientModel')
    .isIn(['Client', 'Worker'])
    .withMessage('Recipient model must be Client or Worker'),
  body('type')
    .isIn([
      'message',
      'status_update',
      'new_job',
      'job_accepted',
      'job_started',
      'job_completed',
      'job_cancelled',
      'payment_received',
      'review_received',
      'system_announcement'
    ])
    .withMessage('Invalid notification type'),
  body('title')
    .trim()
    .isLength({ min: 1, max: 200 })
    .withMessage('Title must be between 1 and 200 characters'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters')
];

// Validation for marking multiple as read
const validateMarkMultiple = [
  body('notificationIds')
    .optional()
    .isArray()
    .withMessage('Notification IDs must be an array'),
  body('notificationIds.*')
    .optional()
    .isMongoId()
    .withMessage('Each notification ID must be valid')
];

// Routes
router.get('/', getNotifications);
router.get('/unread-count', getUnreadCount);
router.put('/:id/read', markAsRead);
router.put('/mark-read', validateMarkMultiple, markMultipleAsRead);
router.delete('/:id', deleteNotification);
router.delete('/', deleteMultipleNotifications);
router.post('/', validateNotification, createNotification);

export default router;