import express from 'express'
import { signUpAction } from '../controllers/auth-controller'
import { validateRequest } from '../middlewares/validate-request'
import { signUpSchema } from '../utils/schema'

const authRoutes = express.Router()

authRoutes.post('/sign-up', validateRequest(signUpSchema), signUpAction)

export default authRoutes
