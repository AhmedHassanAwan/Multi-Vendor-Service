import { z } from 'zod';
import User from '../models/User.js';
import HTTP_STATUS from '../utils/httpStatusCodes.js';

const profileSchema = z.object({
  bio: z.string({ required_error: "Bio is required" }).min(20, "Bio must be at least 20 characters"),
  skills: z.array(z.string()).min(1, "At least one skill is required"),
  experience: z.string({ required_error: "Experience is required" }).min(5, "Experience must be at least 5 characters"),
});


export const setupProfile = async (req, res) => {
  try {
    const parsed = profileSchema.safeParse(req.body);

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

    const { bio, skills, experience } = parsed.data;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        bio,
        skills,
        experience,
        isProfileComplete: true,
      },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Profile setup complete!",
      user,
    });
  } catch (error) {
    console.error(`Error in setupProfile: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};


export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error(`Error in getProfile: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const parsed = profileSchema.safeParse(req.body);

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

    const { bio, skills, experience } = parsed.data;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { bio, skills, experience },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: "Profile updated successfully!",
      user,
    });
  } catch (error) {
    console.error(`Error in updateProfile: ${error.message}`);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
