import mongoose from 'mongoose'

const projectSchema = new mongoose.Schema(
  {
    request: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ServiceRequest',
      required: true,
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    provider: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
      required: true,
    },
    status: {
      type: String,
      enum: ['in-progress', 'completed', 'delivered'],
      default: 'in-progress',
    },
    amount: {
      type: Number,
      required: true,
    },
    deadline: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Project = mongoose.model('Project', projectSchema)

export default Project