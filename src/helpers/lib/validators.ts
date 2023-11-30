import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().trim().email('Email is required'),
  password: z.string().trim().min(1, 'Password is required')
})
export type TSignInSchema = z.infer<typeof signInSchema>

export const signUpSchema = z
  .object({
    email: z.string().trim().email('Email is required'),
    password: z.string().trim().min(8, 'Password must be at least 8 characters long'),
    confirmPassword: z.string().trim().min(1, { message: 'Confirm Password is required' })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords must match',
    path: ['confirmPassword']
  })
export type TSignUpSchema = z.infer<typeof signUpSchema>
