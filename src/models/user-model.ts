import mongoose from 'mongoose'

const userModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ['manager', 'student'],
      default: 'manager',
    },
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('User', userModel)
