import ServiceRequest from '../models/ServiceRequest.js';
import Service from '../models/Service.js';
import Project from '../models/Project.js';
import { createRequestSchema } from '../validators/requestValidator.js';
import HTTP_STATUS from '../utils/httpStatusCodes.js';

/**
 * @desc    Create a new service request
 * @route   POST /api/requests/:serviceId
 * @access  Protected + Customer
 */
export const createRequest = async (req, res) => {
  try {
    const { serviceId } = req.params;

    // Check if service exists and is active
    const service = await Service.findOne({ _id: serviceId, isActive: true });
    if (!service) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Service not found",
      });
    }

    // Customer cannot request their own service
    if (service.provider.toString() === req.user._id.toString()) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "You cannot request your own service",
      });
    }

    const parsed = createRequestSchema.safeParse(req.body);
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

    // Check for existing pending request
    const existingRequest = await ServiceRequest.findOne({
      customer: req.user._id,
      service: serviceId,
      status: 'pending',
    });

    if (existingRequest) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "You already have a pending request for this service",
      });
    }

    const { requirements, budget, deadline } = parsed.data;

    const request = await ServiceRequest.create({
      customer: req.user._id,
      provider: service.provider,
      service: serviceId,
      requirements,
      budget: Number(budget),
      deadline: new Date(deadline),
    });

    const populatedRequest = await ServiceRequest.findById(request._id)
      .populate('customer', 'name email')
      .populate('provider', 'name email')
      .populate('service', 'title price category');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Request submitted successfully!",
      request: populatedRequest,
    });
  } catch (error) {
    console.error(`Error in createRequest: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Get current customer's requests
 * @route   GET /api/requests/my-requests
 * @access  Protected + Customer
 */
export const getMyRequestsAsCustomer = async (req, res) => {
  try {
    const requests = await ServiceRequest.find({ customer: req.user._id })
      .populate('service', 'title price category serviceImage')
      .populate('provider', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(`Error in getMyRequestsAsCustomer: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Get requests received by provider
 * @route   GET /api/requests/provider-requests
 * @access  Protected + Provider
 */
export const getProviderRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const query = { provider: req.user._id };
    if (status) query.status = status;

    const requests = await ServiceRequest.find(query)
      .populate('service', 'title price category serviceImage')
      .populate('customer', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: requests.length,
      requests,
    });
  } catch (error) {
    console.error(`Error in getProviderRequests: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Update request status (Accept/Reject)
 * @route   PUT /api/requests/:requestId/status
 * @access  Protected + Provider
 */
export const updateRequestStatus = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { status } = req.body;

    const request = await ServiceRequest.findById(requestId);
    if (!request) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Request not found",
      });
    }

    if (request.provider.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Not authorized",
      });
    }

    if (!['accepted', 'rejected'].includes(status)) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "Invalid status",
      });
    }

    request.status = status;
    await request.save();

    let project = null;
    if (status === 'accepted') {
      project = await Project.create({
        request: request._id,
        customer: request.customer,
        provider: request.provider,
        service: request.service,
        status: 'in-progress',
        amount: request.budget,
        deadline: request.deadline,
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: status === 'accepted' ? "Request accepted! Project started." : "Request rejected.",
      request,
      ...(project && { project }),
    });
  } catch (error) {
    console.error(`Error in updateRequestStatus: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

/**
 * @desc    Get single request details
 * @route   GET /api/requests/:requestId
 * @access  Protected (Customer or Provider)
 */
export const getSingleRequest = async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = await ServiceRequest.findById(requestId)
      .populate('customer', 'name email profilePicture')
      .populate('provider', 'name email profilePicture')
      .populate('service', 'title price category serviceImage');

    if (!request) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Request not found",
      });
    }

    if (
      request.customer._id.toString() !== req.user._id.toString() &&
      request.provider._id.toString() !== req.user._id.toString()
    ) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Not authorized",
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      request,
    });
  } catch (error) {
    console.error(`Error in getSingleRequest: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
