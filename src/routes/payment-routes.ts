import express from 'express'
import { getPaymentStatus, handlePayment } from '../controllers/payment-controller'

const authRouter = express.Router()

authRouter.post('/handle-payment', handlePayment)
authRouter.get('/payment-status/:transaction_id', getPaymentStatus)

export default authRouter
