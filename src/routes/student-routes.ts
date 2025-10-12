import express from 'express'
import multer from 'multer'
import { createStudent, getStudents, updateStudent } from '../controllers/student-controller'
import verifyToken from '../middlewares/verify-token'
import { fileFilter, fileStorage } from '../utils/multer'

const studentRoutes = express.Router()

const upload = multer({
  storage: fileStorage('students'),
  fileFilter,
})

studentRoutes.get('/students', verifyToken, getStudents)
studentRoutes.post('/students', verifyToken, upload.single('photo'), createStudent)
studentRoutes.put('/students/:student_id', verifyToken, upload.single('photo'), updateStudent)

export default studentRoutes
