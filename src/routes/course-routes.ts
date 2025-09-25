import express from 'express'
import { getManagerCourses } from '../controllers/course-controller'
import verifyToken from '../middlewares/verify-token'

const courseRoutes = express.Router()

courseRoutes.get('/manager-courses', verifyToken, getManagerCourses)

export default courseRoutes
