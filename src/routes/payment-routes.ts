import express from 'express'
import { handlePayment } from '../controllers/payment-controller'

const authRouter = express.Router()

authRouter.post('/handle-payment', handlePayment)

export default authRouter
