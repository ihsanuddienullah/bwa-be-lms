import express from 'express'
import { getStudents } from '../controllers/student-controller'
import verifyToken from '../middlewares/verify-token'

const studentRoutes = express.Router()

studentRoutes.get('/students', verifyToken, getStudents)

export default studentRoutes
