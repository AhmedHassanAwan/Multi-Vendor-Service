import User from '../models/User.js';
import Service from '../models/Service.js';
import ServiceRequest from '../models/ServiceRequest.js';
import Project from '../models/Project.js';
import HTTP_STATUS from '../utils/httpStatusCodes.js';

export const getCustomerDashboard = async (req, res) => {
  try {
    const customerId = req.user._id;

    const [activeRequests, completedProjects, totalSpentResult, recentRequests, recentProjects] = await Promise.all([
      ServiceRequest.countDocuments({ customer: customerId, status: "pending" }),
      Project.countDocuments({ customer: customerId, status: "delivered" }),
      Project.aggregate([
        { $match: { customer: customerId, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      ServiceRequest.find({ customer: customerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('service', 'title category serviceImage price')
        .populate('provider', 'name profilePicture'),
      Project.find({ customer: customerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('service', 'title category serviceImage')
        .populate('provider', 'name profilePicture')
    ]);

    const totalSpent = totalSpentResult[0]?.total || 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      dashboard: {
        activeRequests,
        completedProjects,
        totalSpent,
        recentRequests,
        recentProjects,
        hasOrders: recentRequests.length > 0 || recentProjects.length > 0
      }
    });
  } catch (error) {
    console.error(`Error in getCustomerDashboard: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * @desc    Get provider dashboard metrics
 * @route   GET /api/dashboard/provider
 * @access  Protected + Provider
 */
export const getProviderDashboard = async (req, res) => {
  try {
    const providerId = req.user._id;

    const [totalEarningsResult, activeProjects, pendingRequests, completedProjects, services, recentRequests, recentProjects] = await Promise.all([
      Project.aggregate([
        { $match: { provider: providerId, status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Project.countDocuments({ provider: providerId, status: "in-progress" }),
      ServiceRequest.countDocuments({ provider: providerId, status: "pending" }),
      Project.countDocuments({ provider: providerId, status: "delivered" }),
      Service.find({ provider: providerId, isActive: true }),
      ServiceRequest.find({ provider: providerId, status: "pending" })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('service', 'title category serviceImage')
        .populate('customer', 'name profilePicture'),
      Project.find({ provider: providerId })
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('service', 'title category serviceImage')
        .populate('customer', 'name profilePicture')
    ]);

    const totalEarnings = totalEarningsResult[0]?.total || 0;
    
    let averageRating = 0;
    if (services.length > 0) {
      const sum = services.reduce((acc, s) => acc + (s.averageRating || 0), 0);
      averageRating = Math.round((sum / services.length) * 10) / 10;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      dashboard: {
        totalEarnings,
        activeProjects,
        pendingRequests,
        completedProjects,
        averageRating,
        recentRequests,
        recentProjects
      }
    });
  } catch (error) {
    console.error(`Error in getProviderDashboard: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};

/**
 * @desc    Get admin dashboard metrics
 * @route   GET /api/dashboard/admin
 * @access  Protected + Admin
 */
export const getAdminDashboard = async (req, res) => {
  try {
    const [totalUsers, totalProviders, totalServices, totalProjects, totalRevenueResult, projectStats, recentUsers, recentProjects] = await Promise.all([
      User.countDocuments({ role: "customer" }),
      User.countDocuments({ role: "provider" }),
      Service.countDocuments({ isActive: true }),
      Project.countDocuments(),
      Project.aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Promise.all([
        Project.countDocuments({ status: "in-progress" }),
        Project.countDocuments({ status: "completed" }),
        Project.countDocuments({ status: "delivered" })
      ]),
      User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt'),
      Project.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('service', 'title category')
        .populate('customer', 'name')
        .populate('provider', 'name')
    ]);

    const totalRevenue = totalRevenueResult[0]?.total || 0;

    res.status(HTTP_STATUS.OK).json({
      success: true,
      dashboard: {
        totalUsers,
        totalProviders,
        totalServices,
        totalProjects,
        totalRevenue,
        projectStats: {
          inProgress: projectStats[0],
          completed: projectStats[1],
          delivered: projectStats[2]
        },
        recentUsers,
        recentProjects
      }
    });
  } catch (error) {
    console.error(`Error in getAdminDashboard: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error"
    });
  }
};
