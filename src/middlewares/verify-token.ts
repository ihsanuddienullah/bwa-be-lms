import { NextFunction, Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import userModel from '../models/user-model'
import { IRequestUser } from '../utils/global-types'

interface JwtPayload {
  user_id: string
}

const verifyToken = async (req: Request & { user?: IRequestUser }, res: Response, next: NextFunction) => {
  const secretKey = process.env.JWT_SECRET_KEY as string

  const bearerHeader = req.headers['authorization']

  if (typeof bearerHeader !== 'undefined' && bearerHeader.startsWith('JWT')) {
    const bearerToken = bearerHeader.split(' ')[1]
    const decoded = jwt.verify(bearerToken, secretKey) as JwtPayload

    const user = await userModel.findById(decoded.user_id, '_id name email role')

    if (!user) {
      return res.status(400).json({
        message: 'Token expired or invalid',
      })
    }

    req.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    }

    next()
  } else {
    res.sendStatus(401).json({
      message: 'Unauthorized',
    })
  }
}

export default verifyToken
