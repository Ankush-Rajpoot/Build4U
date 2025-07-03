import express from 'express';
import {
  createServiceRequest,
  getServiceRequests,
  getServiceRequest,
  updateServiceRequest,
  acceptServiceRequest,
  startWork,
  completeServiceRequest,
  cancelServiceRequest,
  submitProposal,
  selectWorkerFromProposals,
  sendRequest,
  getWorkerRequests,
  getMatchingWorkers,
  debugWorkers
} from '../controllers/serviceRequestController.js';
import { protect, restrictTo } from '../middleware/auth.js';
import { validateServiceRequest } from '../middleware/validation.js';

const router = express.Router();

// Debug route (temporary - no auth)
router.get('/debug/workers', debugWorkers);

// All other routes require authentication
router.use(protect);

// Routes accessible by both clients and workers
router.get('/', getServiceRequests);
router.get('/:id', getServiceRequest);
router.get('/:id/matching-workers', getMatchingWorkers);

// Client-only routes
router.post('/', restrictTo('client'), validateServiceRequest, createServiceRequest);
router.put('/:id', restrictTo('client'), validateServiceRequest, updateServiceRequest);
router.put('/:id/cancel', restrictTo('client'), cancelServiceRequest);
router.put('/:id/select-worker', restrictTo('client'), selectWorkerFromProposals);
router.get('/:id/worker-requests', restrictTo('client'), getWorkerRequests);

// Worker-only routes
router.put('/:id/accept', restrictTo('worker'), acceptServiceRequest);
router.put('/:id/start', restrictTo('worker'), startWork);
router.put('/:id/complete', restrictTo('worker'), completeServiceRequest);
router.post('/:id/proposals', restrictTo('worker'), submitProposal);
router.post('/:id/send-request', restrictTo('worker'), sendRequest);

export default router;