import { Request, Response } from 'express'
import courseModel from '../models/course-model'
import { imageUrl } from '../utils/function'
import { IRequestUser } from '../utils/global-types'

export const getOverviewStatistic = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const totalCourses = await courseModel
      .find({ manager: req.user?.id })
      .populate<{ contents: { _id: string; type: string }[] }>({
        path: 'contents',
        select: 'type',
      })
      .populate<{ students: { name: string; photo: string; courses: string[] }[] }>({
        path: 'students',
        select: 'name photo courses',
      })

    const totalStudents: string[] = []
    const totalVideoContents: string[] = []
    const totalTextContents: string[] = []
    const latestStudents: any[] = []
    totalCourses.forEach((course) => {
      course.students.forEach((student) => {
        if (!totalStudents.includes(student.toString())) {
          totalStudents.push(student.toString())

          const filteredCourses = student.courses.filter(
            (courseId) => courseId.toString() === totalCourses.find((c) => c._id.toString() === courseId.toString())?._id.toString()
          )

          latestStudents.push({
            name: student.name,
            photo: imageUrl('students') + student.photo,
            courses: filteredCourses,
          })
        }
      })

      course.contents.forEach((content) => {
        if (content.type === 'video') totalVideoContents.push(content._id)
        if (content.type === 'text') totalTextContents.push(content._id)
      })
    })

    return res.json({
      message: 'Get overview statistic success',
      data: {
        latest_students: latestStudents,
        total_video_contents: totalVideoContents.length,
        total_text_contents: totalTextContents.length,
        total_students: totalStudents.length,
        total_courses: totalCourses.length,
      },
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
