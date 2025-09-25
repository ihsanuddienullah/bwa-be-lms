import { Request, Response } from 'express'
import courseModel from '../models/course-model'
import { IRequestUser } from '../utils/global-types'

export const getManagerCourses = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const courses = await courseModel
      .find({
        manager: req.user?.id,
      })
      .select('title thumbnail')
      .populate({
        path: 'category',
        select: 'name -_id',
      })
      .populate({
        path: 'students',
        select: 'name',
      })

    return res.json({
      message: 'Get manager courses success',
      data: courses,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
