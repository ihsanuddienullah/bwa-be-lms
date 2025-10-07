import { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

export const validateRequest = (schema: any) => async (req: Request, res: Response, next: NextFunction) => {
  try {
    schema.parse(req.body)
    next()
  } catch (error) {
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map((issue) => `${issue.path}: ${issue.message}`)

      console.log(errorMessages)
      return res.status(400).json({ error: 'invalid request', message: errorMessages })
    }

    res.status(500).json({ error: 'Internal server error' })
  }
}
