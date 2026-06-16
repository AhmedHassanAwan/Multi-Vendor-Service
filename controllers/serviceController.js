import Service from '../models/Service.js';
import { uploadToCloudinary } from '../config/cloudinary.js';
import { createServiceSchema, updateServiceSchema } from '../validators/serviceValidator.js';
import HTTP_STATUS from '../utils/httpStatusCodes.js';


export const createService = async (req, res) => {
  try {
    const parsed = createServiceSchema.safeParse(req.body);

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

    const { title, description, category, price, deliveryTime } = parsed.data;

    let cloudinaryUrl = '';
    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'service-marketplace/services');
      cloudinaryUrl = result.secure_url;
    }

    const service = await Service.create({
      provider: req.user._id,
      title,
      description,
      category,
      price,
      deliveryTime,
      serviceImage: cloudinaryUrl,
    });

    const populatedService = await Service.findById(service._id).populate('provider', 'name profilePicture');

    res.status(HTTP_STATUS.CREATED).json({
      success: true,
      message: "Service created successfully!",
      service: populatedService,
    });
  } catch (error) {
    console.error(`Error in createService: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getAllServices = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (category) {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    const totalCount = await Service.countDocuments(query);
    const totalPages = Math.ceil(totalCount / limit);
    const skip = (page - 1) * limit;

    const services = await Service.find(query)
      .populate('provider', 'name profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: services.length,
      totalPages,
      currentPage: Number(page),
      services,
    });
  } catch (error) {
    console.error(`Error in getAllServices: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getSingleService = async (req, res) => {
  try {
    const service = await Service.findOne({ _id: req.params.id, isActive: true })
      .populate('provider', 'name profilePicture bio skills averageRating');

    if (!service) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Service not found",
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      service,
    });
  } catch (error) {
    console.error(`Error in getSingleService: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Service not found",
      });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Not authorized to update this service",
      });
    }

    const parsed = updateServiceSchema.safeParse(req.body);

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

    const updateData = { ...parsed.data };

    if (req.file) {
      const result = await uploadToCloudinary(req.file.buffer, 'service-marketplace/services');
      updateData.serviceImage = result.secure_url;
    }

    const updatedService = await Service.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('provider', 'name profilePicture');

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Service updated successfully!",
      service: updatedService,
    });
  } catch (error) {
    console.error(`Error in updateService: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "Service not found",
      });
    }

    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: "Not authorized to delete this service",
      });
    }

    service.isActive = false;
    await service.save();

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Service deleted successfully!",
    });
  } catch (error) {
    console.error(`Error in deleteService: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id })
      .populate('provider', 'name profilePicture')
      .sort({ createdAt: -1 });

    res.status(HTTP_STATUS.OK).json({
      success: true,
      count: services.length,
      services,
    });
  } catch (error) {
    console.error(`Error in getMyServices: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
