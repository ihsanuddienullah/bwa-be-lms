import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import transactionModel from '../models/transaction-model'
import userModel from '../models/user-model'

export const signUpAction = async (req: Request, res: Response) => {
  const midtransUrl = process.env.MIDTRANS_URL
  const midtransAuthString = process.env.MIDTRANS_AUTH_STRING

  try {
    const body = req.body

    const hashPassword = bcrypt.hashSync(body.password, 12)

    const user = new userModel({
      name: body.name,
      email: body.email,
      password: hashPassword,
      photo: 'default.jpg',
      role: 'manager',
    })

    const transaction = new transactionModel({
      user: user._id,
      price: 100000,
      status: 'pending',
    })

    const midtrans = await fetch(String(midtransUrl), {
      method: 'POST',
      body: JSON.stringify({
        transaction_details: {
          order_id: String(transaction._id),
          gross_amount: transaction.price,
        },
        customer_details: {
          email: user.email,
        },
        callbacks: {
          finish: `${process.env.FRONTEND_URL}/success-checkout`,
        },
      }),
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Basic ${midtransAuthString}`,
      },
    })

    if (!midtrans.ok) {
      throw new Error(`Midtrans response status: ${midtrans.status}`)
    }

    const midtransResponse = await midtrans.json()

    await user.save()
    await transaction.save()

    return res.json({
      message: 'Sign up success',
      data: {
        midtrans_payment_url: midtransResponse.redirect_url,
      },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
