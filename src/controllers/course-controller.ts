import { Request, Response } from 'express'
import fs from 'fs'
import path from 'path'
import categoryModel from '../models/category-model'
import courseContentModel from '../models/course-content-model'
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

export const getCourseById = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.course_id

    const course = await courseModel
      .findById(courseId)
      .populate({
        path: 'category',
        select: 'name',
      })
      .populate('contents')
      .lean()

    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
      })
    }

    const thumbnailUrl = process.env.BACKEND_URL + '/uploads/courses/'

    const formattedCourses = {
      ...course,
      thumbnail: `${thumbnailUrl}${course.thumbnail}`,
      total_students: course.students.length,
    }

    return res.json({
      message: 'Get course success',
      data: formattedCourses,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const getCategories = async (_: Request, res: Response) => {
  try {
    const categories = await categoryModel.find()

    return res.json({
      message: 'Get categories success',
      data: categories,
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
      const errorMessages = parse.error.issues.map((issue) => `${issue.path}: ${issue.message}`)

      if (req?.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      console.log(errorMessages)
      return res.status(500).json({ error: 'invalid request', message: errorMessages })
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
      const errorMessages = parse.error.issues.map((issue) => `${issue.path}: ${issue.message}`)

      if (req?.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path)
      }

      console.log(errorMessages)
      return res.status(500).json({ error: 'invalid request', message: errorMessages })
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
      return res.status(404).json({
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

export const createCourseContent = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const body = req.body

    const newContent = new courseContentModel({
      title: body.title,
      type: body.type,
      youtube_id: body.youtube_id,
      text: body.text,
      course_id: body.course_id,
    })

    await newContent.save()

    await courseModel.findByIdAndUpdate(
      body.course_id,
      {
        $push: { contents: newContent._id },
      },
      { new: true }
    )

    return res.json({
      message: 'Create content success',
      data: newContent,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const updateCourseContent = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const body = req.body
    const contentId = req.params.content_id

    const updatedContent = {
      title: body.title,
      type: body.type,
      youtube_id: body.youtube_id,
      text: body.text,
      course_id: body.course_id,
      is_completed: body.is_completed,
    }

    await courseContentModel.findByIdAndUpdate(contentId, updatedContent)

    return res.json({
      message: 'Create content success',
      data: updatedContent,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const deleteCourseContent = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const contentId = req.params.content_id

    await courseContentModel.findByIdAndDelete(contentId)

    return res.json({
      message: 'Delete content success',
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const getCourseContentById = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const contentId = req.params.content_id

    const content = await courseContentModel.findById(contentId).lean()

    if (!content) {
      return res.status(404).json({
        message: 'Content not found',
      })
    }

    return res.json({
      message: 'Get content success',
      data: content,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const getCourseStudents = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const courseId = req.params.course_id

    const course = await courseModel
      .findById(courseId)
      .select('title')
      .populate({
        path: 'students',
        select: 'name photo',
      })
      .lean()

    if (!course) {
      return res.status(404).json({
        message: 'Course not found',
      })
    }

    return res.json({
      message: 'Get students in course success',
      data: course,
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export const addCourseStudent = async (req: Request & { user?: IRequestUser }, res: Response) => {
  try {
    const body = req.body
    const courseId = req.params.course_id

    await courseModel.findByIdAndUpdate(
      courseId,
      {
        $push: { students: body.student_id },
      },
      { new: true }
    )

    await userModel.findByIdAndUpdate(
      body.student_id,
      {
        $push: { courses: courseId },
      },
      { new: true }
    )

    return res.json({
      message: 'Add student to course success',
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
