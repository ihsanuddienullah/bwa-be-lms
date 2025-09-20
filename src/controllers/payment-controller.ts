import { Request, Response } from 'express'
import Transaction from '../models/transaction-model'

export const handlePayment = async (req: Request, res: Response) => {
  try {
    const body = req.body

    const orderId = body.order_id

    switch (body.transaction_status) {
      case 'capture':
      case 'settlement':
        await Transaction.findByIdAndUpdate(orderId, { status: 'success' })

        break
      case 'pending':
      case 'deny':
      case 'expire':
      case 'cancel':
      case 'failure':
        await Transaction.findByIdAndUpdate(orderId, { status: 'failed' })

        break
      default:
        break
    }

    return res.json({
      message: 'Payment status updated',
      data: {},
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Internal Server Error',
    })
  }
}

export const getPaymentStatus = async (req: Request, res: Response) => {
  try {
    const transactionId = req.params.transaction_id

    const transaction = await Transaction.findById(transactionId)

    if (!transaction) {
      return res.status(404).json({
        message: 'Transaction not found',
      })
    }

    return res.json({
      message: 'Transaction status retrieved',
      data: {
        transaction_id: transaction._id,
        price: transaction.price,
        status: transaction.status,
      },
    })
  } catch (error) {
    console.error(error)

    return res.status(500).json({
      message: 'Internal Server Error',
    })
  }
}
