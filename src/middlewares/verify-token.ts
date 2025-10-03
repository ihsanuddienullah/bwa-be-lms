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

  try {
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
      res.status(401).json({
        message: 'Unauthorized',
      })
    }
  } catch (error) {
    console.log(error)

    if (error instanceof jwt.TokenExpiredError) {
      return res.status(401).json({
        message: 'Token expired or invalid',
      })
    }

    return res.status(500).json({
      message: 'Internal server error',
    })
  }
}

export default verifyToken
