import express from 'express'
import { signUpAction } from '../controllers/auth-controller'
import { validateRequest } from '../middlewares/validate-request'
import { signUpSchema } from '../utils/schema'

const authRouter = express.Router()

authRouter.post('/sign-up', validateRequest(signUpSchema), signUpAction)

export default authRouter
