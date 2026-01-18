'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, User, ArrowRight } from 'lucide-react'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import { loginSchema, type LoginFormValues } from '@/lib/schemas/login'
import { useAuth } from '@/lib/hooks/use-auth'
import { LoginLogo } from './login-logo'
import { PasswordInput } from './password-input'

// Schema for password verification on welcome screen
const passwordSchema = z.object({
  password: z.string().min(1, 'Password is required'),
})

type PasswordFormValues = z.infer<typeof passwordSchema>

// Schema for creating a new password
const createPasswordSchema = z.object({
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
})

type CreatePasswordFormValues = z.infer<typeof createPasswordSchema>

/**
 * Login form component
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Two-step flow: Login ID → Welcome screen with password
 * - Displays welcome message with user profile after successful lookup
 * - API error display banner
 * - Loading state with spinner
 * - Full accessibility (ARIA, keyboard navigation)
 * - Mobile-optimized touch targets
 */
export function LoginForm() {
  const { login, verifyPassword, setPassword, isLoading, error: authError, clearError, user, continueToApp } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)
  const [isAnimating, setIsAnimating] = useState(false)

  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    formState: { errors: loginErrors },
    watch: watchLogin,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    watch: watchPassword,
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onTouched',
  })

  const {
    register: registerCreatePassword,
    handleSubmit: handleSubmitCreatePassword,
    formState: { errors: createPasswordErrors },
    watch: watchCreatePassword,
  } = useForm<CreatePasswordFormValues>({
    resolver: zodResolver(createPasswordSchema),
    mode: 'onTouched',
  })

  // Watch form values to clear auth error on user input
  watchLogin(() => {
    if (authError) {
      clearError()
    }
  })

  watchPassword(() => {
    if (authError) {
      clearError()
    }
  })

  watchCreatePassword(() => {
    if (authError) {
      clearError()
    }
  })

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data)
      setShowWelcome(true)
    } catch (err) {
      // Error is already handled by the auth hook
      console.error('Login failed:', err)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      // Verify password before continuing
      await verifyPassword(data.password)
      // On success, navigate to dashboard
      continueToApp()
    } catch (err) {
      // Error is already handled by the auth hook
      console.error('Password verification failed:', err)
    }
  }

  const onCreatePasswordSubmit = async (data: CreatePasswordFormValues) => {
    try {
      // Set the new password
      await setPassword(data.newPassword)
      // On success, navigate to dashboard
      continueToApp()
    } catch (err) {
      // Error is already handled by the auth hook
      console.error('Password creation failed:', err)
    }
  }

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  const fadeOutRight = {
    initial: { opacity: 1, x: 0 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 }
  }

  const crossFade = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
  }

  // Show welcome state if user has been successfully looked up
  return (
    <AnimatePresence mode="wait">
      {showWelcome && user ? (
        <motion.div
          key="password-screen"
          variants={crossFade}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.4, ease: "easeInOut" }}
          className="w-full max-w-[26rem] mx-auto"
        >
          <div className="relative min-h-[580px] bg-graphite-800/90 backdrop-blur-[2px] border border-[0.25px] border-brand/40 rounded-xl p-6 md:p-8 lg:p-10 shadow-[0_0_36px_rgba(204,255,0,0.36)] overflow-hidden flex flex-col">
          {/* Background User Image with Blur */}
          <div className="absolute inset-0 opacity-20">
            {user.profileImageUrl ? (
              <img
                src={user.profileImageUrl}
                alt={`${user.firstName} ${user.lastName}`}
                className="w-full h-full object-cover blur-[7px] scale-110"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-brand/30 to-brand/10 blur-[7px]" />
            )}
          </div>

          {/* Content Overlay */}
          <div className="relative z-10 flex-1 flex flex-col justify-center">
          {/* Profile Section */}
          <div className="mb-6 md:mb-8 text-center">
            {/* Profile Picture or Placeholder Avatar */}
            <div className="inline-flex items-center justify-center mb-6">
              {user.profileImageUrl ? (
                <img
                  src={user.profileImageUrl}
                  alt={`${user.firstName} ${user.lastName}`}
                  className="h-24 w-24 rounded-lg object-cover border-4 border-brand/50 shadow-lg shadow-brand/20"
                />
              ) : (
                <div className="h-24 w-24 rounded-lg bg-gradient-to-br from-brand to-brand/80 flex items-center justify-center shadow-lg shadow-brand/20 border-4 border-brand/50">
                  <User className="w-12 h-12 text-graphite-900" strokeWidth={2.5} />
                </div>
              )}
            </div>

            {/* Welcome Message */}
            <h1 className="text-4xl md:text-5xl font-display font-bold text-white tracking-tight mb-2">
              Welcome {user.firstName} {user.lastName}!
            </h1>

            {/* Additional Info */}
            <p className="text-base font-display text-brand tracking-wide">
              {user.garageName}
            </p>
          </div>

          {/* API Error Banner */}
          {authError && (
            <div
              role="alert"
              className="mb-4 md:mb-6 flex items-start gap-3 p-3 md:p-4 rounded-lg bg-status-error/10 border border-status-error/20"
            >
              <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div className="flex-1">
                <p className="text-xs md:text-sm font-medium text-status-error">
                  Authentication failed
                </p>
                <p className="text-xs md:text-sm text-status-error/80 mt-1">{authError}</p>
              </div>
            </div>
          )}

          {/* Password Verification Form (for users with existing password) */}
          {user.hasPassword ? (
            <form onSubmit={handleSubmitPassword(onPasswordSubmit)} className="space-y-4 md:space-y-6" noValidate>
              {/* Password Input */}
              <div className="space-y-2">
                <PasswordInput
                  id="password"
                  name="password"
                  label="Password"
                  placeholder="Enter your password"
                  error={passwordErrors.password?.message}
                  register={registerPassword('password')}
                  autoComplete="current-password"
                  disabled={isLoading}
                />

                {/* Forgot Password Link */}
                <div className="text-right">
                  <button
                    type="button"
                    onClick={() => {
                      // TODO: Implement forgot password flow
                      console.log('Forgot password clicked')
                    }}
                    className="text-xs font-medium text-brand hover:text-brand-hover transition-colors duration-200"
                  >
                    Forgot Password?
                  </button>
                </div>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full flex items-center justify-center gap-2
                  px-6 py-3 rounded-lg
                  bg-brand hover:bg-brand-hover
                  text-graphite-900 font-semibold
                  shadow-glow
                  transition-all duration-200 ease-out
                  disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[0.98]
                  ${isLoading ? 'cursor-wait' : ''}
                `}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Verifying...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  </>
                )}
              </button>
            </form>
          ) : (
            /* Create Password Form (for users without password) */
            <form onSubmit={handleSubmitCreatePassword(onCreatePasswordSubmit)} className="space-y-4 md:space-y-6" noValidate>
              {/* Instructions */}
              <p className="text-sm text-graphite-400 text-center">
                Please create a password to secure your account
              </p>

              {/* New Password Input */}
              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="Create Password"
                placeholder="Create a password (min. 8 characters)"
                error={createPasswordErrors.newPassword?.message}
                register={registerCreatePassword('newPassword')}
                autoComplete="new-password"
                disabled={isLoading}
              />

              {/* Confirm Password Input */}
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                label="Confirm Password"
                placeholder="Confirm your password"
                error={createPasswordErrors.confirmPassword?.message}
                register={registerCreatePassword('confirmPassword')}
                autoComplete="new-password"
                disabled={isLoading}
              />

              {/* Password Requirements */}
              <div className="text-xs text-graphite-500 space-y-1">
                <p className="font-medium text-graphite-400 mb-2">Password requirements:</p>
                <ul className="space-y-1 ml-4 list-disc">
                  <li>Minimum 8 characters</li>
                  <li>Should be strong and secure</li>
                </ul>
              </div>

              {/* Continue Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`
                  w-full flex items-center justify-center gap-2
                  px-6 py-3 rounded-lg
                  bg-brand hover:bg-brand-hover
                  text-graphite-900 font-semibold
                  shadow-glow
                  transition-all duration-200 ease-out
                  disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[0.98]
                  ${isLoading ? 'cursor-wait' : ''}
                `}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>Creating...</span>
                  </>
                ) : (
                  <>
                    <span>Continue</span>
                    <ArrowRight className="w-5 h-5" strokeWidth={2} />
                  </>
                )}
              </button>
            </form>
          )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-graphite-500">
            <span>© 2026 </span>
            <span className="text-brand font-semibold">RevOS</span>
            <span> | </span>
            <span>Automotive Service Intelligence</span>
          </div>
        </div>
      </motion.div>
      ) : (
        <motion.div
          key="login-screen"
          variants={fadeOutRight}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="w-full max-w-[26rem] mx-auto"
        >
          <div className="relative min-h-[580px] bg-graphite-800/90 backdrop-blur-[2px] border border-[0.25px] border-brand/40 rounded-xl p-6 md:p-8 lg:p-10 shadow-[0_0_36px_rgba(204,255,0,0.36)] flex flex-col">
            {/* Logo Header */}
            <div className="mb-6 md:mb-8">
              <LoginLogo />
            </div>

            {/* Content Area */}
            <div className="flex-1 flex flex-col justify-center">
              {/* API Error Banner */}
              {authError && (
                <div
                  role="alert"
                  className="mb-4 md:mb-6 flex items-start gap-3 p-3 md:p-4 rounded-lg bg-status-error/10 border border-status-error/20"
                >
                  <AlertCircle className="w-5 h-5 text-status-error flex-shrink-0 mt-0.5" aria-hidden="true" />
                  <div className="flex-1">
                    <p className="text-xs md:text-sm font-medium text-status-error">
                      Authentication failed
                    </p>
                    <p className="text-xs md:text-sm text-status-error/80 mt-1">{authError}</p>
                  </div>
                </div>
              )}

              {/* Login Form */}
              <form onSubmit={handleSubmitLogin(onLoginSubmit)} className="space-y-4 md:space-y-6" noValidate>
          {/* Login ID Input */}
          <div className="space-y-2">
            <label
              htmlFor="loginId"
              className="block text-xs font-medium uppercase tracking-wider text-graphite-400"
            >
              Login ID
            </label>

            <input
              id="loginId"
              type="text"
              inputMode="text"
              placeholder="Enter your login ID"
              autoComplete="username"
              disabled={isLoading}
              aria-invalid={loginErrors.loginId ? 'true' : 'false'}
              aria-describedby={loginErrors.loginId ? 'loginId-error' : undefined}
              className={`
                w-full h-12 px-4
                text-base bg-graphite-900 text-white
                border rounded-lg
                placeholder:text-graphite-400
                transition-all duration-200 ease-out
                disabled:opacity-50 disabled:cursor-not-allowed
                shadow-sm
                focus:outline-none
                focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 focus:ring-offset-graphite-900
                ${
                  loginErrors.loginId
                    ? 'border-status-error'
                    : 'border-graphite-600 focus:border-brand/50'
                }
              `}
              {...registerLogin('loginId')}
            />

            {/* Login ID Error */}
            {loginErrors.loginId && (
              <div
                id="loginId-error"
                role="alert"
                className="flex items-start gap-2 text-sm text-status-error"
              >
                <svg
                  className="w-4 h-4 mt-0.5 flex-shrink-0"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>{loginErrors.loginId.message}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className={`
              w-full flex items-center justify-center gap-2
              px-6 py-3 rounded-lg
              bg-brand hover:bg-brand-hover
              text-graphite-900 font-semibold
              shadow-glow
              transition-all duration-200 ease-out
              disabled:opacity-50 disabled:cursor-not-allowed
              active:scale-[0.98]
              ${isLoading ? 'cursor-wait' : ''}
            `}
          >
            {isLoading ? (
              <>
                <span>Initializing...</span>
                <svg
                  className="animate-spin h-5 w-5"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
              </>
            ) : (
              <>
                <span>Initialize System</span>
                <svg
                  className="w-5 h-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                  <polyline points="10 17 15 12 10 7" />
                  <line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              </>
            )}
          </button>

          {/* Mobile CTA Link */}
          <div className="lg:hidden mt-6">
            <a
              href="http://localhost:3000/sign-up"
              className="text-sm font-semibold text-brand hover:text-brand-hover transition-colors duration-200"
            >
              Do not have a login ID? Start using RevOS to manage your Garage now →
            </a>
          </div>
        </form>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <div className="flex items-center justify-center gap-1 text-xs text-graphite-500">
            <span>© 2026 </span>
            <span className="text-brand font-semibold">RevOS</span>
            <span> | </span>
            <span>Automotive Service Intelligence</span>
          </div>
        </div>
      </div>
    </motion.div>
      )}
    </AnimatePresence>
  )
}
