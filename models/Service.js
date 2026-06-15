import mongoose from 'mongoose'

const serviceSchema = new mongoose.Schema(
  {
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ['web-dev', 'logo-design', 'content-writing', 'social-media'],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    deliveryTime: {
      type: Number, // din mein
      required: true,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    totalReviews: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
)

const Service = mongoose.model('Service', serviceSchema)

export default Service