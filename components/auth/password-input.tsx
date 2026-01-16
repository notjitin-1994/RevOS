'use client'

import { useState } from 'react'
import { Eye, EyeOff } from 'lucide-react'
import type { UseFormRegisterReturn } from 'react-hook-form'

interface PasswordInputProps {
  id: string
  name: string
  label: string
  placeholder?: string
  error?: string
  register: UseFormRegisterReturn<string>
  autoComplete?: string
  disabled?: boolean
}

/**
 * Reusable password input component with show/hide toggle
 *
 * Features:
 * - Show/hide password toggle with Eye/EyeOff icons
 * - Full accessibility support (ARIA attributes)
 * - Mobile-optimized (text-base font size to prevent iOS zoom)
 * - Error display with alert icon
 * - Minimum touch target of 44x44px for mobile
 */
export function PasswordInput({
  id,
  name,
  label,
  placeholder = 'Enter your password',
  error,
  register,
  autoComplete = 'current-password',
  disabled = false,
}: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false)

  const togglePassword = () => {
    setShowPassword((prev) => !prev)
  }

  return (
    <div className="space-y-2">
      <label
        htmlFor={id}
        className="block text-xs font-medium uppercase tracking-wider text-graphite-400"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={showPassword ? 'text' : 'password'}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full h-12 px-4 pr-14
            text-base bg-graphite-900 text-white
            border rounded-lg
            placeholder:text-graphite-400
            transition-all duration-200 ease-out
            disabled:opacity-50 disabled:cursor-not-allowed
            shadow-sm
            focus:outline-none
            focus:ring-2 focus:ring-brand/20 focus:ring-offset-2 focus:ring-offset-graphite-900
            ${
              error
                ? 'border-status-error'
                : 'border-graphite-600 focus:border-brand/50'
            }
          `}
          {...register}
        />

        {/* Show/Hide Password Button */}
        <button
          type="button"
          onClick={togglePassword}
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          aria-pressed={showPassword}
          disabled={disabled}
          className={`
            absolute right-2 top-1/2 -translate-y-1/2
            flex items-center justify-center
            min-h-[44px] min-w-[44px]
            text-graphite-400 hover:text-graphite-200
            transition-colors duration-200
            disabled:opacity-50 disabled:cursor-not-allowed
            active:scale-[0.98]
          `}
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          ) : (
            <Eye className="w-5 h-5" strokeWidth={2} aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div
          id={`${id}-error`}
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
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}
