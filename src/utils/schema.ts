import { z } from 'zod'

export const exampleSchema = z.object({
  name: z.string().min(3, 'Name is required'),
})

export const signUpSchema = z.object({
  name: z.string().min(5, 'Name is required'),
  email: z.email().min(5),
  password: z.string().min(5, 'Password is required'),
})
