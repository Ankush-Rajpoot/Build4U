import express from 'express';
import {
  registerWorker,
  loginWorker,
  getWorkerProfile,
  updateWorkerProfile,
  getAvailableJobs,
  getWorkerJobs,
  getCompletedJobs,
  verifyWorkerEmail,
  getWorkerStats,
  uploadPortfolio,
  getWorkerPortfolio,
  getCompletedJobsWithoutPortfolio
} from '../controllers/workerController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validateWorkerRegistration, validateLogin } from '../middleware/validation.js';
import parser from '../middleware/uploadMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', validateWorkerRegistration, registerWorker);
router.post('/login', validateLogin, loginWorker);
router.get('/verify', verifyWorkerEmail);

// Public route to get a worker's portfolio
router.get('/:id/portfolio', getWorkerPortfolio);

// Protected routes (Worker only)
router.use(protect);
router.use(restrictTo('worker'));

router.get('/profile', getWorkerProfile);
router.put('/profile', updateWorkerProfile);
router.get('/available-jobs', getAvailableJobs);
router.get('/my-jobs', getWorkerJobs);
router.get('/completed-jobs', getCompletedJobs);
router.get('/completed-jobs-without-portfolio', getCompletedJobsWithoutPortfolio);
router.get('/stats', getWorkerStats);

// Portfolio upload (after job completion)
router.post('/portfolio', parser.array('images', 6), uploadPortfolio);

export default router;