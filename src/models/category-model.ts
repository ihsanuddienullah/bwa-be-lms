import mongoose from 'mongoose'
import courseModel from './course-model'

const categoryModel = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
      },
    ],
  },
  {
    timestamps: true,
  }
)

categoryModel.post('findOneAndDelete', async function (category) {
  if (category) {
    category.courses.forEach(async (courseId: string) => {
      await courseModel.findByIdAndUpdate(courseId, {
        $pull: { category: category._id },
      })
    })
  }
})

export default mongoose.model('Category', categoryModel)
