import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import categoryModel from '../models/category-model'
import courseModel from '../models/course-model'
import userModel from '../models/user-model'
import { IRequestUser } from '../utils/global-types'
import { createCourseSchema } from '../utils/schema'

export const getCourses = async (req: Request & { user?: IRequestUser }, res: Response) => {
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
      .lean()

    const thumbnailUrl = process.env.BACKEND_URL + '/uploads/courses/'

    const formattedCourses = courses.map((course) => {
      const category = (course.category as any).name
      return {
        ...course,
        category,
        thumbnail: `${thumbnailUrl}${course.thumbnail}`,
        total_students: course.students.length,
      }
    })

    return res.json({
      message: `Get ${req.user?.name}'s courses success`,
      data: formattedCourses,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const createCourse = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const body = req.body

    const parse = createCourseSchema.safeParse(body)

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((issue) => issue.message)

      if (req?.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      return res.status(500).json({ error: 'invalid request', messages: errorMessages })
    }

    const category = await categoryModel.findById(parse.data.category_id)

    if (!category) {
      return res.status(500).json({
        message: 'Category not found',
      })
    }

    const course = new courseModel({
      title: parse.data.title,
      thumbnail: req.file?.filename,
      category: category._id,
      tagline: parse.data.tagline,
      description: parse.data.description,
      manager: req.user?.id,
    })

    await course.save()

    await categoryModel.findByIdAndUpdate(
      category._id,
      {
        $push: { courses: course._id },
      },
      { new: true }
    )

    await userModel.findByIdAndUpdate(
      req.user?.id,
      {
        $push: { courses: course._id },
      },
      { new: true }
    )

    return res.json({
      message: 'Create course success',
      data: course,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const updateCourse = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const body = req.body
    const courseId = req.params.course_id

    const parse = createCourseSchema.safeParse(body)

    if (!parse.success) {
      const errorMessages = parse.error.issues.map((issue) => issue.message)

      if (req?.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      return res.status(500).json({ error: 'invalid request', messages: errorMessages })
    }

    const category = await categoryModel.findById(parse.data.category_id)
    const oldCourse = await courseModel.findById(courseId)

    if (!category) {
      return res.status(500).json({
        message: 'Category not found',
      })
    }

    if (!oldCourse) {
      return res.status(500).json({
        message: 'Course not found',
      })
    }

    await courseModel.findByIdAndUpdate(courseId, {
      title: parse.data.title,
      thumbnail: req.file?.filename || oldCourse.thumbnail,
      category: category._id,
      tagline: parse.data.tagline,
      description: parse.data.description,
      manager: req.user?.id,
    })

    return res.json({
      message: 'Update course success',
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const deleteCourse = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.course_id

    const course = await courseModel.findById(courseId)

    if (!course) {
      return res.status(500).json({
        message: 'Course not found',
      })
    }

    const dirname = path.resolve()
    const filePath = path.join(dirname, '/public/uploads/courses', course.thumbnail)

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
    }

    await courseModel.findByIdAndDelete(courseId)

    return res.json({
      message: 'Delete course success',
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
