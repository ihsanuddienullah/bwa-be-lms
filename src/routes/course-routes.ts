import express from 'express'
import multer from 'multer'
import { createCourse, deleteCourse, getCourses, updateCourse } from '../controllers/course-controller'
import verifyToken from '../middlewares/verify-token'
import { fileFilter, fileStorage } from '../utils/multer'

const courseRoutes = express.Router()

const upload = multer({
  storage: fileStorage('courses'),
  fileFilter,
})

courseRoutes.get('/get-courses', verifyToken, getCourses)
courseRoutes.post('/create-course', verifyToken, upload.single('thumbnail'), createCourse)
courseRoutes.put('/update-course/:course_id', verifyToken, upload.single('thumbnail'), updateCourse)
courseRoutes.delete('/delete-course/:course_id', verifyToken, deleteCourse)

export default courseRoutes
