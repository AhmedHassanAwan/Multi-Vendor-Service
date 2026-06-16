import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  getCustomerDashboard,
  getProviderDashboard,
  getAdminDashboard,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/customer', protect, authorizeRoles('customer'), getCustomerDashboard);

router.get('/provider', protect, authorizeRoles('provider'), getProviderDashboard);

router.get('/admin', protect, authorizeRoles('admin'), getAdminDashboard);

export default router;
