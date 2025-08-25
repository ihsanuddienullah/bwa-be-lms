import bcrypt from 'bcrypt'
import { Request, Response } from 'express'
import userModel from '../models/user-model'

export const signUpAction = async (req: Request, res: Response) => {
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

    await user.save()

    return res.json({
      message: 'Sign up success',
      data: {
        midtrans_payment_url: 'https://midtrans.com',
      },
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}
