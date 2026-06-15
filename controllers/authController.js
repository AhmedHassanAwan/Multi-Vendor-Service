import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { registerSchema, loginSchema } from '../validators/authValidator.js';
import HTTP_STATUS from '../utils/httpStatusCodes.js';


const generateToken = (userId, role) => {
  return jwt.sign({ userId, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};


export const register = async (req, res) => {
 
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(issue => ({
      field: issue.path[0],
      message: issue.message
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      errors: errors
    });
  }

  const { name, email, password, role } = parsed.data;

  try {

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(HTTP_STATUS.CONFLICT).json({
        success: false,
        message: 'User already exists with this email',
      });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
    });

    if (user) {
      const token = generateToken(user._id, user.role);

      return res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          isProfileComplete: user.isProfileComplete,
        },
      });
    }
  } catch (error) {
    console.error(`Error in register: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server Error during registration',
    });
  }
};

export const login = async (req, res) => {
  
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    const errors = parsed.error.issues.map(issue => ({
      field: issue.path[0],
      message: issue.message
    }));

    return res.status(HTTP_STATUS.BAD_REQUEST).json({
      success: false,
      message: "Validation failed",
      errors: errors
    });
  }

  const { email, password } = parsed.data;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Email ya password galat hai',
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: 'Email ya password galat hai',
      });
    }


    const token = generateToken(user._id, user.role);

    return res.status(HTTP_STATUS.OK).json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isProfileComplete: user.isProfileComplete,
      },
    });
  } catch (error) {
    console.error(`Error in login: ${error.message}`);
    return res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: 'Server Error during login',
    });
  }
};
