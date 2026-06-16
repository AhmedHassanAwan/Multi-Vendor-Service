// models/User.js
import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['customer', 'provider', 'admin'],
      required: true,
    },

    // ── Provider only fields ──
    profilePicture: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: '',
    },
    skills: {
      type: [String],
      default: [],
    },
    experience: {
      type: String,
      default: '',
    },
    portfolio: {
      type: [String],
      default: [],
    },
    isProfileComplete: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);
const User = mongoose.model('User', userSchema)

export default User