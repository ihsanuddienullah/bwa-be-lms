import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import courseModel from '../models/course-model'
import userModel from '../models/user-model'
import { IRequestUser } from '../utils/global-types'
import { createStudentSchema } from '../utils/schema'

export const getStudents = async (_: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const students = await userModel.find({ role: 'student' }).select('name photo courses').lean()

    const thumbnailUrl = process.env.BACKEND_URL + '/uploads/students/'

    const formattedStudents = students.map((student) => {
      return {
        ...student,
        photo: `${thumbnailUrl}${student.photo}`,
      }
    })

    return res.json({
      message: 'Get students success',
      data: formattedStudents,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const getStudentById = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const studentId = req.params.student_id

    const student = await userModel.findById(studentId).select('name photo email').lean()

    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
      })
    }

    const thumbnailUrl = process.env.BACKEND_URL + '/uploads/students/'

    const formattedStudent = {
      ...student,
      photo: `${thumbnailUrl}${student.photo}`,
    }

    return res.json({
      message: 'Get student success',
      data: formattedStudent,
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

export const updateStudent = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const studentId = req.params.student_id
    const body = req.body

    const parse = createStudentSchema
      .partial({
        password: true,
      })
      .safeParse(body)

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((issue) => `${issue.path}: ${issue.message}`)

      if (req?.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      console.log(errorMessages)
      return res.status(500).json({ error: 'invalid request', message: errorMessages })
    }

    const oldStudent = await userModel.findById(studentId)

    if (!oldStudent) {
      return res.status(404).json({
        message: 'User not found',
      })
    }

    const hashPassword = parse.data.password ? bcrypt.hashSync(parse.data.password, 12) : oldStudent.password

    await userModel.findByIdAndUpdate(studentId, {
      name: parse.data.name,
      email: parse.data.email.toLowerCase(),
      password: hashPassword,
      photo: req.file?.filename || oldStudent.photo,
    })

    return res.json({
      message: 'Update student success',
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const deleteStudent = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const studentId = req.params.student_id

    await courseModel.findOneAndUpdate(
      {
        students: studentId,
      },
      {
        $pull: {
          students: studentId,
        },
      }
    )

    const student = await userModel.findById(studentId)

    if (!student) {
      return res.status(404).json({
        message: 'Student not found',
      })
    }

    const dirname = path.resolve()
    const filePath = path.join(dirname, '/public/uploads/students', student.photo)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await userModel.findByIdAndDelete(studentId)

    return res.json({
      message: 'Delete student success',
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
