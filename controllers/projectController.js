import Project from '../models/Project.js';
import HTTP_STATUS from '../utils/httpStatusCodes.js';

/**
 * @desc    Get customer's projects
 * @route   GET /api/projects/my-projects
 * @access  Protected + Customer
 */
export const getMyProjectsAsCustomer = async (req, res) => {
  try {
    const projects = await Project.find({ customer: req.user._id })
      .populate('service', 'title category serviceImage price')
      .populate('provider', 'name profilePicture')
      .populate('request', 'requirements budget deadline')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(`Error in getMyProjectsAsCustomer: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Get provider's projects
 * @route   GET /api/projects/provider-projects
 * @access  Protected + Provider
 */
export const getMyProjectsAsProvider = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { provider: req.user._id };
    if (status) query.status = status;

    const projects = await Project.find(query)
      .populate('service', 'title category serviceImage')
      .populate('customer', 'name profilePicture')
      .populate('request', 'requirements budget deadline')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error(`Error in getMyProjectsAsProvider: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Get single project details
 * @route   GET /api/projects/:projectId
 * @access  Protected (Customer or Provider)
 */
export const getSingleProject = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId)
      .populate('service', 'title category serviceImage price')
      .populate('customer', 'name profilePicture email')
      .populate('provider', 'name profilePicture bio skills')
      .populate('request', 'requirements budget deadline status');

    if (!project) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Project not found",
      });
    }

    if (
      project.customer._id.toString() !== req.user._id.toString() &&
      project.provider._id.toString() !== req.user._id.toString()
    ) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      project,
    });
  } catch (error) {
    console.error(`Error in getSingleProject: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Update project status (Strict order)
 * @route   PUT /api/projects/:projectId/status
 * @access  Protected + Provider
 */
export const updateProjectStatus = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { status } = req.body;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Project not found",
      });
    }

    if (project.provider.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Not authorized",
      });
    }

    const currentStatus = project.status;

    if (currentStatus === 'delivered') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Project already delivered",
      });
    }

    if (currentStatus === 'in-progress' && status !== 'completed') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid status transition. Current status is in-progress, can only move to completed`,
      });
    }

    if (currentStatus === 'completed' && status !== 'delivered') {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: `Invalid status transition. Current status is completed, can only move to delivered`,
      });
    }

    project.status = status;
    await project.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: `Project status updated to ${status}!`,
      project,
    });
  } catch (error) {
    console.error(`Error in updateProjectStatus: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Get project statistics
 * @route   GET /api/projects/stats
 * @access  Protected + Admin
 */
export const getProjectStats = async (req, res) => {
  try {
    const totalCount = await Project.countDocuments();
    const inProgressCount = await Project.countDocuments({ status: 'in-progress' });
    const completedCount = await Project.countDocuments({ status: 'completed' });
    const deliveredCount = await Project.countDocuments({ status: 'delivered' });

    const earningsResult = await Project.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, totalEarnings: { $sum: '$amount' } } },
    ]);

    const totalEarnings = earningsResult.length > 0 ? earningsResult[0].totalEarnings : 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      stats: {
        total: totalCount,
        inProgress: inProgressCount,
        completed: completedCount,
        delivered: deliveredCount,
        totalEarnings,
      },
    });
  } catch (error) {
    console.error(`Error in getProjectStats: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
