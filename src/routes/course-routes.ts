import express from 'express'
import multer from 'multer'
import { createCourse, getCourses } from '../controllers/course-controller'
import verifyToken from '../middlewares/verify-token'
import { fileFilter, fileStorage } from '../utils/multer'

const courseRoutes = express.Router()

const upload = multer({
  storage: fileStorage('courses'),
  fileFilter,
})

courseRoutes.get('/get-courses', verifyToken, getCourses)
courseRoutes.post('/create-course', verifyToken, upload.single('thumbnail'), createCourse)

export default courseRoutes
