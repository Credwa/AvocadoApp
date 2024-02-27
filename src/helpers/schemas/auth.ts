import { z } from 'zod'

export const signInSchema = z.object({
  email: z.string().trim().email('Email is required'),
  password: z.string().trim().min(1, 'Password is required')
})
export type TSignInSchema = z.infer<typeof signInSchema>

export const signUpSchema = z.object({
  email: z.string().trim().email('Email is required'),
  password: z.string().trim().min(8, 'Password must be at least 8 characters long')
})

export type TSignUpSchema = z.infer<typeof signUpSchema>

export const verifyOTPSchema = z.object({
  email: z.string().trim().email('Email is required')
})

export type TVerifyOTPSchema = z.infer<typeof verifyOTPSchema>

export const confirmCodeSchema = z.object({
  code: z.string().trim().min(6, 'Code must be 6 characters long').max(6, 'Code must be 6 characters long')
})

export type TConfirmCodeSchema = z.infer<typeof confirmCodeSchema>

export const passwordResetSchema = z.object({
  password: z.string().trim().min(8, 'Password must be at least 8 characters long')
})

export type TPasswordResetSchema = z.infer<typeof passwordResetSchema>
