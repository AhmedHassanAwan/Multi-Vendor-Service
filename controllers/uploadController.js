import { uploadToCloudinary, deleteFromCloudinary } from '../config/cloudinary.js';
import User from '../models/User.js';
import HTTP_STATUS from '../utils/httpStatusCodes.js';


export const uploadProfilePictureController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please select an image to upload',
      });
    }

    
    const result = await uploadToCloudinary(
      req.file.buffer,
      'service-marketplace/profiles'
    );

  
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { profilePicture: result.secure_url },
      { new: true }
    ).select('-password');

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Profile picture uploaded!',
      profilePicture: result.secure_url,
      user,
    });
  } catch (error) {
    console.error(`Upload error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
};

export const uploadPortfolioController = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Please select images to upload',
      });
    }

    const user = await User.findById(req.user.id);
    if (user.portfolio.length + req.files.length > 5) {
      return res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: 'Maximum 5 portfolio images allowed',
      });
    }

    
    const uploadPromises = req.files.map((file) =>
      uploadToCloudinary(file.buffer, 'service-marketplace/portfolio')
    );
    const results = await Promise.all(uploadPromises);
    const newUrls = results.map((r) => r.secure_url);

    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { $push: { portfolio: { $each: newUrls } } },
      { new: true }
    ).select('-password');

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Portfolio images uploaded!',
      portfolio: updatedUser.portfolio,
    });
  } catch (error) {
    console.error(`Portfolio upload error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Upload failed',
      error: error.message,
    });
  }
};

export const deletePortfolioImage = async (req, res) => {
  try {
    const { imageUrl } = req.params;
    await deleteFromCloudinary(decodeURIComponent(imageUrl));

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $pull: { portfolio: decodeURIComponent(imageUrl) } },
      { new: true }
    ).select('-password');

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Portfolio image deleted!',
      portfolio: user.portfolio,
    });
  } catch (error) {
    console.error(`Delete error: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Delete failed',
      error: error.message,
    });
  }
};
