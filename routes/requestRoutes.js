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

router.post('/:serviceId', protect, authorizeRoles('customer'), createRequest);

router.get('/my-requests', protect, authorizeRoles('customer'), getMyRequestsAsCustomer);

router.get('/provider-requests', protect, authorizeRoles('provider'), getProviderRequests);

router.put('/:requestId/status', protect, authorizeRoles('provider'), updateRequestStatus);
router.get('/:requestId', protect, getSingleRequest);

export default router;
