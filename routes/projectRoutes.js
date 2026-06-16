import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getMyProjectsAsCustomer,
  getMyProjectsAsProvider,
  getSingleProject,
  updateProjectStatus,
  getProjectStats,
} from '../controllers/projectController.js';

const router = express.Router();

// Stats route — admin only
router.get('/stats', protect, authorizeRoles('admin'), getProjectStats);

// Customer routes
router.get('/my-projects', protect, authorizeRoles('customer'), getMyProjectsAsCustomer);

// Provider routes
router.get('/provider-projects', protect, authorizeRoles('provider'), getMyProjectsAsProvider);

router.put('/:projectId/status', protect, authorizeRoles('provider'), updateProjectStatus);

// Both customer and provider
router.get('/:projectId', protect, getSingleProject);

export default router;
