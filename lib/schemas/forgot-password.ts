import { z } from 'zod'

/**
 * Forgot Password Flow Validation Schemas
 *
 * Step 1: Request password reset with login ID
 * Step 2: Verify OTP code
 * Step 3: Set new password
 */

/**
 * Step 1: Request Password Reset Schema
 * User enters their login ID to initiate password reset
 */
export const requestResetSchema = z.object({
  loginId: z
    .string()
    .min(1, 'Login ID is required')
    .max(100, 'Login ID must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9_@.-]+$/,
      'Login ID can only contain letters, numbers, hyphens, underscores, and @ symbol'
    ),
})

export type RequestResetFormValues = z.infer<typeof requestResetSchema>

/**
 * Step 2: Verify OTP Schema
 * User enters the 6-digit OTP code sent to their email
 */
export const verifyOtpSchema = z.object({
  otp: z
    .string()
    .min(1, 'OTP is required')
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d+$/, 'OTP must contain only numbers'),
})

export type VerifyOtpFormValues = z.infer<typeof verifyOtpSchema>

/**
 * Step 3: Set New Password Schema
 * User creates and confirms their new password
 */
export const setNewPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(128, 'Password must be less than 128 characters')
      .regex(
        /[A-Z]/,
        'Password must contain at least one uppercase letter'
      )
      .regex(
        /[a-z]/,
        'Password must contain at least one lowercase letter'
      )
      .regex(/[0-9]/, 'Password must contain at least one number')
      .regex(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      ),
    confirmPassword: z.string().min(1, 'Please confirm your password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export type SetNewPasswordFormValues = z.infer<typeof setNewPasswordSchema>

/**
 * Combined type for all steps
 */
export type ForgotPasswordStep = 'request' | 'verify' | 'success'

export interface ForgotPasswordState {
  step: ForgotPasswordStep
  loginId?: string
}
