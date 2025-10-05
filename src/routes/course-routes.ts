import express from 'express'
import multer from 'multer'
import {
  createCourse,
  createCourseContent,
  deleteCourse,
  getCategories,
  getCourseById,
  getCourses,
  updateCourse,
  updateCourseContent,
} from '../controllers/course-controller'
import { validateRequest } from '../middlewares/validate-request'
import verifyToken from '../middlewares/verify-token'
import { fileFilter, fileStorage } from '../utils/multer'
import { createContentSchema } from '../utils/schema'

const courseRoutes = express.Router()

const upload = multer({
  storage: fileStorage('courses'),
  fileFilter,
})

courseRoutes.get('/courses', verifyToken, getCourses)
courseRoutes.get('/courses/:course_id', verifyToken, getCourseById)
courseRoutes.get('/categories', verifyToken, getCategories)
courseRoutes.post('/courses', verifyToken, upload.single('thumbnail'), createCourse)
courseRoutes.put('/courses/:course_id', verifyToken, upload.single('thumbnail'), updateCourse)
courseRoutes.delete('/courses/:course_id', verifyToken, deleteCourse)

courseRoutes.post('/courses/contents', verifyToken, validateRequest(createContentSchema), createCourseContent)
courseRoutes.put('/courses/contents/:content_id', verifyToken, validateRequest(createContentSchema), updateCourseContent)

export default courseRoutes
