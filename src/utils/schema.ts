import { z } from 'zod'

export const exampleSchema = z.object({
  name: z.string().min(3, 'Name is required'),
})

export const signUpSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.email('Invalid email address'),
  password: z.string().min(5, 'Password must be at least 5 characters long'),
})

export const signInSchema = signUpSchema.omit({ name: true })

export const createCourseSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  category_id: z.string().min(1, 'Category is required'),
  description: z.string().min(1, 'Description is required'),
  tagline: z.string().min(1, 'Tagline is required'),
})

export const createContentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  type: z.string(),
  youtube_id: z.string(),
  text: z.string(),
  course_id: z.string().min(1, 'Course ID is required'),
})
