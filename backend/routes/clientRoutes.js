import express from 'express';
import {
  registerClient,
  loginClient,
  getClientProfile,
  updateClientProfile,
  getClientServiceRequests,
  verifyClientEmail,
  getClientStats
} from '../controllers/clientController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validateClientRegistration, validateLogin } from '../middleware/validation.js';

const router = express.Router();

// Public routes
router.post('/register', validateClientRegistration, registerClient);
router.post('/login', validateLogin, loginClient);
router.get('/verify', verifyClientEmail);

// Protected routes (Client only)
router.use(protect);
router.use(restrictTo('client'));

router.get('/profile', getClientProfile);
router.put('/profile', updateClientProfile);
router.get('/service-requests', getClientServiceRequests);
router.get('/stats', getClientStats);

export default router;