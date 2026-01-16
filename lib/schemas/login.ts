import { z } from 'zod'

/**
 * Login form validation schema
 *
 * Requirements:
 * - loginId: Alphanumeric string with @ symbol, 1-100 characters (not email validation)
 * - password: Minimum 8 characters, maximum 128 characters
 */
export const loginSchema = z.object({
  loginId: z
    .string()
    .min(1, 'Login ID is required')
    .max(100, 'Login ID must be less than 100 characters')
    .regex(
      /^[a-zA-Z0-9_@.-]+$/,
      'Login ID can only contain letters, numbers, hyphens, underscores, and @ symbol'
    ),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(128, 'Password must be less than 128 characters'),
})

/**
 * Type inference from the login schema
 */
export type LoginFormValues = z.infer<typeof loginSchema>
