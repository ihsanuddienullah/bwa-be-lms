import { Request, Response } from 'express'

export const helloWorld = async (_: Request, res: Response) => {
  return res.json({
    message: 'Hello World',
  })
}
