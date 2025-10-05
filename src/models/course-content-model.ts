import mongoose from 'mongoose'

const courseDetailModel = new mongoose.Schema(
  {
    course: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ['video', 'text'],
      default: 'video',
    },
    videoId: String,
    text: String,
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('CourseContent', courseDetailModel)
