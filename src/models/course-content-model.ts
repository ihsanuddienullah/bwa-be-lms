import mongoose from 'mongoose'
import courseModel from './course-model'

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

courseContentModel.post('findOneAndDelete', async (doc) => {
  if (doc) {
    await courseModel.findByIdAndUpdate(doc.course_id, {
      $pull: { contents: doc._id },
    })
  }
})

export default mongoose.model('CourseContent', courseContentModel)
