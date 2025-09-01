import { z } from 'zod'

export const exampleSchema = z.object({
  name: z.string().min(3, 'Name is required'),
})

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters long'),
})
