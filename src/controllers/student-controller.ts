import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import fs from 'fs'
import userModel from '../models/user-model'
import { IRequestUser } from '../utils/global-types'
import { createStudentSchema } from '../utils/schema'

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

export const createStudent = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const body = req.body

    const parse = createStudentSchema.safeParse(body)

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((issue) => `${issue.path}: ${issue.message}`)

      if (req?.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      console.log(errorMessages)
      return res.status(500).json({ error: 'invalid request', message: errorMessages })
    }

    const hashPassword = bcrypt.hashSync(parse.data.password, 12)

    const user = new userModel({
      name: parse.data.name,
      email: parse.data.email.toLowerCase(),
      password: hashPassword,
      photo: req.file?.filename,
      role: 'student',
      manager: req.user?.id,
    })

    await user.save()

    return res.json({
      message: 'Create student success',
      data: user,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
