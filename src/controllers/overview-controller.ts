import { Request, Response } from 'express'
import courseModel from '../models/course-model'
import { IRequestUser } from '../utils/global-types'

export const getOverviewStatistic = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const totalCourses = await courseModel.find({ manager: req.user?.id }).populate<{ contents: { _id: string; type: string }[] }>({
      path: 'contents',
      select: 'type',
    })

    const totalStudents: string[] = []
    const totalVideoContents: string[] = []
    const totalTextContents: string[] = []
    totalCourses.forEach((course) => {
      course.students.forEach((student) => {
        if (!totalStudents.includes(student.toString())) totalStudents.push(student.toString())
      })

      course.contents.forEach((content) => {
        if (content.type === 'video') totalVideoContents.push(content._id)
        if (content.type === 'text') totalTextContents.push(content._id)
      })
    })

    return res.json({
      message: 'Get overview statistic success',
      data: {
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
