import express from 'express'
import { signInAction, signUpAction } from '../controllers/auth-controller'
import { validateRequest } from '../middlewares/validate-request'
import { signInSchema, signUpSchema } from '../utils/schema'

const authRoutes = express.Router()

authRoutes.post('/sign-up', validateRequest(signUpSchema), signUpAction)
authRoutes.post('/sign-in', validateRequest(signInSchema), signInAction)

export default authRoutes
