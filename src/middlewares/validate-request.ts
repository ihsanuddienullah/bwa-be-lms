import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export const validateRequest = (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
  console.log(req.body)
  try {
    schema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => issue.message)

      return res.status(500).json({ error: 'invalid request', messages: errorMessages })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
}
