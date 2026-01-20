'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  Mail,
  ArrowRight,
  User,
  CheckCircle2,
  AlertCircle,
  Shield,
} from 'lucide-react'
import { forgotLoginIdSchema, type ForgotLoginIdFormValues } from '@/lib/schemas/forgot-login-id'

interface ForgotLoginIdModalProps {
  isOpen: boolean
  onClose: () => void
}

/**
 * Forgot Login ID Modal - Email-based login ID retrieval
 *
 * Features:
 * - Single-step email input flow
 * - Real-time email validation
 * - Success confirmation with animation
 * - Resend option after countdown
 * - Clear error handling
 * - Mobile-optimized with safe area support
 */
export function ForgotLoginIdModal({ isOpen, onClose }: ForgotLoginIdModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [countdown, setCountdown] = useState(60)
  const [canResend, setCanResend] = useState(false)
  const [emailAddress, setEmailAddress] = useState('')

  // Form handler
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<ForgotLoginIdFormValues>({
    resolver: zodResolver(forgotLoginIdSchema),
    mode: 'onTouched',
  })

  // Watch email to clear errors on input
  watch(() => {
    if (error) setError(null)
  })

  // Countdown timer for resend
  useState(() => {
    if (showSuccess && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else if (countdown === 0 && !canResend) {
      setCanResend(true)
    }
  })

  /**
   * Submit email to retrieve login ID
   */
  const onSubmit = async (data: ForgotLoginIdFormValues) => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Integrate with backend API
      // POST /api/auth/forgot-login-id/request
      const response = await fetch('/api/auth/forgot-login-id/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to retrieve login ID')
      }

      setEmailAddress(data.email)
      setShowSuccess(true)
      setCountdown(60)
      setCanResend(false)

      // Auto-close after 5 seconds
      setTimeout(() => {
        handleClose()
      }, 5000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to retrieve login ID')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Resend email with login ID
   */
  const handleResend = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // TODO: Integrate with backend API
      // POST /api/auth/forgot-login-id/resend
      const response = await fetch('/api/auth/forgot-login-id/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailAddress }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to resend email')
      }

      setCountdown(60)
      setCanResend(false)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend email')
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Handle modal close with state reset
   */
  const handleClose = () => {
    setShowSuccess(false)
    setEmailAddress('')
    setError(null)
    setCountdown(60)
    setCanResend(false)
    onClose()
  }

  // Format countdown time
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
        onClick={handleClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative w-full max-w-md bg-white border rounded-2xl shadow-[0_0_40px_rgba(204,255,0,0.06),0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
          style={{ borderColor: 'rgba(204, 255, 0, 0.2)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Modal Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b rounded-t-2xl" style={{ borderColor: 'rgba(204, 255, 0, 0.15)' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-graphite-100 flex items-center justify-center">
                <User className="w-5 h-5 text-graphite-700" strokeWidth={2} />
              </div>
              <div>
                <h2 className="text-lg font-display font-bold text-gray-900">
                  {showSuccess ? 'Email Sent' : 'Forgot Login ID?'}
                </h2>
                <p className="text-xs text-gray-500">
                  {showSuccess ? 'Check your inbox' : 'Retrieve your login credentials'}
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
              aria-label="Close modal"
            >
              <X className="w-4 h-4 text-gray-600" strokeWidth={2} />
            </button>
          </div>

          {/* Modal Body */}
          <div className="p-6 bg-white">
            <AnimatePresence mode="wait">
              {!showSuccess ? (
                // Email Input Form
                <motion.div
                  key="input"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  {/* Error Banner */}
                  {error && (
                    <motion.div
                      role="alert"
                      className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-status-error/10 border border-status-error/20"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      <AlertCircle className="w-[18px] h-[18px] text-status-error flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-sm font-semibold text-status-error">Request failed</p>
                        <p className="text-xs text-status-error/80 mt-0.5">{error}</p>
                      </div>
                    </motion.div>
                  )}

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                    {/* Instructions */}
                    <div className="text-center mb-4">
                      <p className="text-sm text-gray-600">
                        Enter the email address associated with your account and we'll send you your login ID.
                      </p>
                    </div>

                    {/* Email Input */}
                    <div className="space-y-3">
                      <label
                        htmlFor="email"
                        className="block text-xs font-bold uppercase tracking-widest text-gray-700 flex items-center gap-2"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        Email Address
                      </label>

                      <input
                        id="email"
                        type="email"
                        inputMode="email"
                        placeholder="your.email@example.com"
                        autoComplete="email"
                        disabled={isLoading}
                        aria-invalid={errors.email ? 'true' : 'false'}
                        aria-describedby={errors.email ? 'email-error' : undefined}
                        className={`
                          w-full h-12 px-4
                          text-base bg-white text-gray-900
                          border-2 rounded-lg
                          placeholder:text-gray-400
                          transition-all duration-200 ease-out
                          disabled:opacity-50 disabled:cursor-not-allowed
                          shadow-sm
                          focus:outline-none
                          focus:ring-4 focus:ring-graphite-100
                          ${
                            errors.email
                              ? 'border-status-error'
                              : 'border-gray-300 focus:border-gray-400'
                          }
                        `}
                        {...register('email')}
                      />

                      {errors.email && (
                        <div
                          id="email-error"
                          role="alert"
                          className="flex items-start gap-2 text-xs text-status-error"
                        >
                          <svg
                            className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                              clipRule="evenodd"
                            />
                          </svg>
                          <span className="font-medium">{errors.email.message}</span>
                        </div>
                      )}
                    </div>

                    {/* Submit Button */}
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className={`
                        w-full flex items-center justify-center gap-2 group
                        px-5 py-3.5 rounded-xl
                        bg-graphite-800 hover:bg-graphite-900
                        text-white font-bold text-sm
                        shadow-lg
                        transition-all duration-300 ease-out
                        disabled:opacity-50 disabled:cursor-not-allowed
                        active:scale-[0.98]
                        ${isLoading ? 'cursor-wait' : ''}
                      `}
                      whileHover={!isLoading ? { scale: 1.01 } : {}}
                      whileTap={!isLoading ? { scale: 0.99 } : {}}
                    >
                      {isLoading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          <span className="text-sm">Sending...</span>
                        </>
                      ) : (
                        <>
                          <span className="text-sm">Send Login ID</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
                        </>
                      )}
                    </motion.button>

                    {/* Additional Help */}
                    <div className="pt-2 text-center">
                      <p className="text-xs text-gray-500">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => {
                            handleClose()
                            // Trigger business inquiry modal if needed
                            const businessModalEvent = new CustomEvent('open-business-inquiry')
                            window.dispatchEvent(businessModalEvent)
                          }}
                          className="text-gray-700 hover:text-gray-900 font-semibold transition-colors duration-200"
                        >
                          Contact us
                        </button>
                      </p>
                    </div>
                  </form>
                </motion.div>
              ) : (
                // Success Screen
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
                  className="text-center py-4"
                >
                  {/* Success Icon */}
                  <motion.div
                    className="w-20 h-20 mx-auto mb-5 rounded-full bg-graphite-100 flex items-center justify-center"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 15 }}
                  >
                    <CheckCircle2 className="w-10 h-10 text-graphite-700" strokeWidth={2.5} />
                  </motion.div>

                  {/* Success Message */}
                  <motion.h3
                    className="text-2xl font-display font-bold text-gray-900 mb-2"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Email Sent Successfully!
                  </motion.h3>

                  <motion.p
                    className="text-sm text-gray-600 mb-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    We've sent your login ID to <span className="font-semibold text-gray-900">{emailAddress}</span>
                  </motion.p>

                  {/* Additional Info */}
                  <motion.div
                    className="bg-gray-50 rounded-xl px-4 py-3 mb-5 border border-gray-200"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <Shield className="w-3.5 h-3.5 inline-block mr-1.5 align-middle" />
                      If you don't see the email within a few minutes, check your spam folder or
                      <span className="text-gray-900 font-semibold"> request a resend</span>.
                    </p>
                  </motion.div>

                  {/* Resend Button or Countdown */}
                  <motion.div
                    className="space-y-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                  >
                    {!canResend ? (
                      <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span>
                          Resend available in <span className="font-mono font-semibold text-gray-900">{formatTime(countdown)}</span>
                        </span>
                      </div>
                    ) : (
                      <button
                        onClick={handleResend}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-gray-100 hover:bg-gray-200 border border-gray-300 text-gray-900 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        {isLoading ? 'Sending...' : 'Resend Email'}
                      </button>
                    )}

                    {/* Close Button */}
                    <button
                      onClick={handleClose}
                      className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-graphite-800 hover:bg-graphite-900 text-white font-bold text-sm shadow-lg transition-all duration-300 ease-out active:scale-[0.98]"
                    >
                      <span>Back to Login</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </motion.div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </>
  )
}
