import Review from '../models/Review.js';
import Project from '../models/Project.js';
import Service from '../models/Service.js';
import { createReviewSchema } from '../validators/reviewValidator.js';
import HTTP_STATUS from '../utils/httpStatusCodes.js';

// Helper function to update service rating
const updateServiceRating = async (serviceId) => {
  const reviews = await Review.find({ service: serviceId });
  const totalReviews = reviews.length;
  
  let averageRating = 0;
  if (totalReviews > 0) {
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    averageRating = Math.round((sum / totalReviews) * 10) / 10;
  }

  await Service.findByIdAndUpdate(serviceId, {
    averageRating,
    totalReviews,
  });

  return { averageRating, totalReviews };
};

/**
 * @desc    Create a new review
 * @route   POST /api/reviews/:projectId
 * @access  Protected + Customer
 */
export const createReview = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.customer.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (project.status !== 'delivered') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Cannot review undelivered project",
      });
    }

    const existingReview = await Review.findOne({
      customer: req.user._id,
      project: projectId,
    });

    if (existingReview) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "You have already reviewed this project",
      });
    }

    const parsed = createReviewSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Validation failed",
        errors: parsed.error.issues.map((issue) => ({
          field: issue.path[0],
          message: issue.message,
        })),
      });
    }

    const { rating, comment } = parsed.data;

    const review = await Review.create({
      customer: req.user._id,
      provider: project.provider,
      service: project.service,
      project: projectId,
      rating,
      comment: comment || "",
    });

    const serviceRating = await updateServiceRating(project.service);

    const populatedReview = await Review.findById(review._id)
      .populate('customer', 'name profilePicture')
      .populate('provider', 'name profilePicture')
      .populate('service', 'title category');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Review submitted successfully!",
      review: populatedReview,
      serviceRating,
    });
  } catch (error) {
    console.error(`Error in createReview: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Get all reviews for a service
 * @route   GET /api/reviews/service/:serviceId
 * @access  Public
 */
export const getServiceReviews = async (req, res) => {
  try {
    const { serviceId } = req.params;
    const reviews = await Review.find({ service: serviceId })
      .populate('customer', 'name profilePicture')
      .sort({ createdAt: -1 });

    const service = await Service.findById(serviceId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: reviews.length,
      averageRating: service ? service.averageRating : 0,
      reviews,
    });
  } catch (error) {
    console.error(`Error in getServiceReviews: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Get all reviews for a provider
 * @route   GET /api/reviews/provider/:providerId
 * @access  Public
 */
export const getProviderReviews = async (req, res) => {
  try {
    const { providerId } = req.params;
    const reviews = await Review.find({ provider: providerId })
      .populate('customer', 'name profilePicture')
      .populate('service', 'title category')
      .sort({ createdAt: -1 });

    let averageRating = 0;
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      averageRating = Math.round((sum / reviews.length) * 10) / 10;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: reviews.length,
      averageRating,
      reviews,
    });
  } catch (error) {
    console.error(`Error in getProviderReviews: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Get current customer's reviews
 * @route   GET /api/reviews/my-reviews
 * @access  Protected + Customer
 */
export const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ customer: req.user._id })
      .populate('service', 'title category serviceImage')
      .populate('provider', 'name profilePicture');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: reviews.length,
      reviews,
    });
  } catch (error) {
    console.error(`Error in getMyReviews: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Delete a review
 * @route   DELETE /api/reviews/:reviewId
 * @access  Protected + Admin
 */
export const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId);
    if (!review) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Review not found",
      });
    }

    const serviceId = review.service;
    await Review.findByIdAndDelete(reviewId);
    
    await updateServiceRating(serviceId);

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Review deleted successfully!",
    });
  } catch (error) {
    console.error(`Error in deleteReview: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
