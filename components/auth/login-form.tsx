'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle } from 'lucide-react'
import { loginSchema, type LoginFormValues } from '@/lib/schemas/login'
import { useAuth } from '@/lib/hooks/use-auth'
import { PasswordInput } from './password-input'
import { LoginLogo } from './login-logo'

/**
 * Login form component
 *
 * Features:
 * - React Hook Form with Zod validation
 * - Login ID input (not email)
 * - Password input with show/hide toggle
 * - API error display banner
 * - Loading state with spinner
 * - Full accessibility (ARIA, keyboard navigation)
 * - Mobile-optimized touch targets
 */
export function LoginForm() {
  const { login, isLoading, error: authError, clearError } = useAuth()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
    watch,
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  })

  // Watch form values to clear auth error on user input
  watch(() => {
    if (authError) {
      clearError()
    }
  })

  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data)
      // On success, navigation will be handled by the auth hook/API
    } catch (err) {
      // Error is already handled by the auth hook
      console.error('Login failed:', err)
    }
  }

  return (
    <div className="w-full max-w-lg mx-auto">
      <div className="bg-graphite-800/90 backdrop-blur-[2px] border border-[0.25px] border-brand/40 rounded-xl p-4 md:p-6 lg:p-8 shadow-[0_0_36px_rgba(204,255,0,0.36)]">
        {/* Logo Header */}
        <div className="mb-6 md:mb-8">
          <LoginLogo />
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

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 md:space-y-6" noValidate>
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
              aria-invalid={errors.loginId ? 'true' : 'false'}
              aria-describedby={errors.loginId ? 'loginId-error' : undefined}
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
                  errors.loginId
                    ? 'border-status-error'
                    : 'border-graphite-600 focus:border-brand/50'
                }
              `}
              {...register('loginId')}
            />

            {/* Login ID Error */}
            {errors.loginId && (
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
                <span>{errors.loginId.message}</span>
              </div>
            )}
          </div>

          {/* Password Input */}
          <PasswordInput
            id="password"
            name="password"
            label="Password"
            placeholder="Enter your password"
            error={errors.password?.message}
            register={register('password')}
            autoComplete="current-password"
            disabled={isLoading}
          />

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
                <span>Initializing...</span>
              </>
            ) : (
              <>
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
                <span>Initialize System</span>
              </>
            )}
          </button>
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
  )
}
