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

router.get('/stats', protect, authorizeRoles('admin'), getProjectStats);

router.get('/my-projects', protect, authorizeRoles('customer'), getMyProjectsAsCustomer);

router.get('/provider-projects', protect, authorizeRoles('provider'), getMyProjectsAsProvider);

router.put('/:projectId/status', protect, authorizeRoles('provider'), updateProjectStatus);

router.get('/:projectId', protect, getSingleProject);

export default router;
