
import express from 'express';
import {
  uploadProfilePictureController,
  uploadPortfolioController,
  deletePortfolioImage
} from '../controllers/uploadController.js';
import {
  setupProfile,
  getProfile,
  updateProfile
} from '../controllers/providerController.js';
import { uploadProfilePicture, uploadPortfolio } from '../config/cloudinary.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import HTTP_STATUS from '../utils/httpStatusCodes.js';

const router = express.Router();

// Provider Profile Routes
router.put('/setup-profile', protect, authorizeRoles('provider'), setupProfile);
router.get('/profile', protect, authorizeRoles('provider'), getProfile);
router.put('/update-profile', protect, authorizeRoles('provider'), updateProfile);


router.post('/upload-profile-picture', protect, authorizeRoles('provider'), (req, res, next) => {
  uploadProfilePicture(req, res, function (err) {
    if (err) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: err.message,
      });
    }
    next();
  });
},
  uploadProfilePictureController
);


router.post('/upload-portfolio', protect, authorizeRoles('provider'), (req, res, next) => {
  uploadPortfolio(req, res, function (err) {
    if (err) {
      // Handle Multer specific errors like file limit
      let message = err.message;
      if (err.code === 'LIMIT_FILE_COUNT') {
        message = 'Maximum 5 portfolio images allowed';
      }
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: message,
      });
    }
    next();
  });
},
  uploadPortfolioController
);


router.delete('/portfolio/:imageUrl', protect, authorizeRoles('provider'), deletePortfolioImage);

export default router;
