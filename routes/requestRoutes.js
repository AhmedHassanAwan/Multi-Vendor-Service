import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createRequest,
  getMyRequestsAsCustomer,
  getProviderRequests,
  updateRequestStatus,
  getSingleRequest,
} from '../controllers/requestController.js';

const router = express.Router();

// Customer routes
router.post('/:serviceId', protect, authorizeRoles('customer'), createRequest);

router.get('/my-requests', protect, authorizeRoles('customer'), getMyRequestsAsCustomer);

// Provider routes
router.get('/provider-requests', protect, authorizeRoles('provider'), getProviderRequests);

router.put('/:requestId/status', protect, authorizeRoles('provider'), updateRequestStatus);

// Both customer and provider
router.get('/:requestId', protect, getSingleRequest);

export default router;
