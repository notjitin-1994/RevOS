import { z } from 'zod'

/**
 * Forgot Login ID Validation Schema
 *
 * User enters their email address to retrieve their login ID
 */
export const forgotLoginIdSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .toLowerCase(),
})

export type ForgotLoginIdFormValues = z.infer<typeof forgotLoginIdSchema>
