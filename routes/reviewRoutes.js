import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  createReview,
  getServiceReviews,
  getProviderReviews,
  getMyReviews,
  deleteReview,
} from '../controllers/reviewController.js';

const router = express.Router();

router.get('/service/:serviceId', getServiceReviews);
router.get('/provider/:providerId', getProviderReviews);

router.post('/:projectId', protect, authorizeRoles('customer'), createReview);

router.get('/my-reviews', protect, authorizeRoles('customer'), getMyReviews);

router.delete('/:reviewId', protect, authorizeRoles('admin'), deleteReview);

export default router;
