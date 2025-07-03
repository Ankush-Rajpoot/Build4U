import express from 'express';
import {
  getMessages,
  sendMessage,
  markMessagesAsRead,
  getUnreadCount
} from '../controllers/messageController.js';
import { protect } from '../middleware/auth.js';
import { body } from 'express-validator';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Message validation
const validateMessage = [
  body('serviceRequestId')
    .isMongoId()
    .withMessage('Valid service request ID is required'),
  body('message')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
  body('recipientId')
    .isMongoId()
    .withMessage('Valid recipient ID is required')
];

router.get('/unread-count', getUnreadCount);
router.get('/:requestId', getMessages);
router.post('/', validateMessage, sendMessage);
router.put('/:requestId/read', markMessagesAsRead);

export default router;