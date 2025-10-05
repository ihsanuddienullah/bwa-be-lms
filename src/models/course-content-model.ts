import mongoose from 'mongoose'

const courseContentModel = new mongoose.Schema(
  {
    course_id: {
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
    youtube_id: String,
    text: String,
  },
  {
    timestamps: true,
  }
)

export default mongoose.model('CourseContent', courseContentModel)
