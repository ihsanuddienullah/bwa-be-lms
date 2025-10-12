import { Request, Response } from 'express'
import userModel from '../models/user-model'
import { IRequestUser } from '../utils/global-types'

export const getStudents = async (_: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const students = await userModel.find({ role: 'student' }).select('-password')

    return res.json({
      message: 'Get students success',
      data: students,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
