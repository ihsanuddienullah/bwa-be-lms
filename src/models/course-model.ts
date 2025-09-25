import mongoose from 'mongoose'

const courseModel = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
    },
    tagline: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    manager: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    details: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseDetail',
      },
    ],
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('Course', courseModel)
