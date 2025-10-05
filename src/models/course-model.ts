import mongoose from 'mongoose'
import categoryModel from './category-model'
import courseContentModel from './course-content-model'
import userModel from './user-model'

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
    contents: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CourseContent',
      },
    ],
  },
  {
    timestamps: true,
  }
)

courseModel.post('findOneAndDelete', async function (course) {
  if (course) {
    await categoryModel.findByIdAndUpdate(course.category, {
      $pull: { courses: course._id },
    })

    await courseContentModel.deleteMany({ course: course._id })

    course.students.forEach(async (studentId: string) => {
      await userModel.findByIdAndUpdate(studentId, {
        $pull: { courses: course._id },
      })
    })

    await userModel.findByIdAndUpdate(course.manager, {
      $pull: { courses: course._id },
    })
  }
})

export default mongoose.model('Course', courseModel)
