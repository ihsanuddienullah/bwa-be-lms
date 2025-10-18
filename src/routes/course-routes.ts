import express from 'express'
import multer from 'multer'
import {
  addCourseStudent,
  createCourse,
  createCourseContent,
  deleteCourse,
  deleteCourseContent,
  getCategories,
  getCourseById,
  getCourseContentById,
  getCourses,
  getCourseStudents,
  updateCourse,
  updateCourseContent,
} from '../controllers/course-controller'
import { validateRequest } from '../middlewares/validate-request'
import verifyToken from '../middlewares/verify-token'
import { fileFilter, fileStorage } from '../utils/multer'
import { addCourseStudentSchema, createCourseContentSchema } from '../utils/schema'

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

courseRoutes.get('/courses/contents/:content_id', verifyToken, getCourseContentById)
courseRoutes.post('/courses/contents', verifyToken, validateRequest(createCourseContentSchema), createCourseContent)
courseRoutes.put('/courses/contents/:content_id', verifyToken, validateRequest(createCourseContentSchema), updateCourseContent)
courseRoutes.delete('/courses/contents/:content_id', verifyToken, deleteCourseContent)

courseRoutes.get('/courses/students/:course_id', verifyToken, getCourseStudents)
courseRoutes.post('/courses/students/:course_id', verifyToken, validateRequest(addCourseStudentSchema), addCourseStudent)

export default courseRoutes
