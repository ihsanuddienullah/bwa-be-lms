import express from 'express'
import multer from 'multer'
import { createCourse, deleteCourse, getCategories, getCourseById, getCourses, updateCourse } from '../controllers/course-controller'
import verifyToken from '../middlewares/verify-token'
import { fileFilter, fileStorage } from '../utils/multer'

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

export default courseRoutes
