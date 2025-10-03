import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
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
      email: body.email.toLowerCase(),
      password: hashPassword,
      photo: 'default.jpg',
      role: 'manager',
    })

    const transaction = new transactionModel({
      user: user._id,
      price: body.price,
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
          finish: `${process.env.FRONTEND_URL}/payment-status`,
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

export const signInAction = async (req: Request, res: Response) => {
  try {
    const body = req.body

    const existingUser = await userModel.findOne().where('email').equals(body.email.toLowerCase())

    if (!existingUser) {
      return res.status(401).json({
        message: 'User not found',
      })
    }

    const isPasswordValid = bcrypt.compareSync(body.password, existingUser.password)

    if (!isPasswordValid) {
      return res.status(401).json({
        message: 'Email or password is incorrect',
      })
    }

    const isTransactionValid = await transactionModel.findOne().where('user').equals(existingUser._id).where('status').equals('success')

    if (existingUser.role === 'manager' && !isTransactionValid) {
      return res.status(403).json({
        message: 'Please complete the payment to access the dashboard',
      })
    }

    const jwtPayload = {
      user_id: existingUser._id,
    }

    const token = jwt.sign(jwtPayload, process.env.JWT_SECRET_KEY as string, { expiresIn: '1d' })

    return res.json({
      message: 'Sign in success',
      data: {
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role,
        photo: existingUser.photo,
        token: token,
      },
    })
  } catch (error) {
    console.log(error)

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
