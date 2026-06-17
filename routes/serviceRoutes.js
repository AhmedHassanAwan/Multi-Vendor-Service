import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { uploadServiceImage } from '../config/cloudinary.js';
import {
  createService,
  getAllServices,
  getSingleService,
  updateService,
  deleteService,
  getMyServices,
} from '../controllers/serviceController.js';

const router = express.Router();


router.get('/', getAllServices);

router.get('/my-services', protect, authorizeRoles('provider'), getMyServices);

router.get('/:id', getSingleService);

router.post('/',protect,authorizeRoles('provider'),(req, res, next) => {
    uploadServiceImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next(); 
    });
  },
  createService
);

router.put('/:id',protect,authorizeRoles('provider'),(req, res, next) => {
    uploadServiceImage(req, res, (err) => {
      if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  },
  updateService
);

router.delete('/:id', protect, authorizeRoles('provider'), deleteService);

export default router;
