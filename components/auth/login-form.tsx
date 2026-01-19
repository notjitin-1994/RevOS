'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { AlertCircle, User, ArrowRight, Shield, X, Mail, Building2, Phone, Users, Wrench } from 'lucide-react'
import { z } from 'zod'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { loginSchema, type LoginFormValues } from '@/lib/schemas/login'
import { useAuth } from '@/lib/hooks/use-auth'
import { LoginLogo } from './login-logo'
import { PasswordInput } from './password-input'
import { ForgotPasswordModal } from './forgot-password-modal'
import { ForgotLoginIdModal } from './forgot-login-id-modal'

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

// Schema for business inquiry/quotation form
const businessInquirySchema = z.object({
  businessName: z.string().min(2, 'Business name is required'),
  contactPerson: z.string().min(2, 'Contact name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  businessType: z.string().min(1, 'Business type is required'),
  numberOfBays: z.string().min(1, 'Number of bays is required'),
  monthlyVolume: z.string().min(1, 'Monthly volume is required'),
  preferredContact: z.string().min(1, 'Preferred contact method is required'),
  message: z.string().optional(),
})

type BusinessInquiryFormValues = z.infer<typeof businessInquirySchema>

/**
 * Login form component - Revamped with optimal spacing and layout
 *
 * Spacing System (based on 4px grid):
 * - 2xs: 4px   (0.25rem)
 * - xs:  8px   (0.5rem)
 * - sm:  12px  (0.75rem)
 * - md:  16px  (1rem)
 * - lg:  24px  (1.5rem)
 * - xl:  32px  (2rem)
 * - 2xl: 48px  (3rem)
 *
 * Features:
 * - Single parent card with seamless content transitions
 * - Consistent spacing and padding across all states
 * - Industry-standard layout with proper visual hierarchy
 * - Smooth Framer Motion animations
 * - Mobile-optimized with safe area support
 */
export function LoginForm() {
  const { login, verifyPassword, setPassword, isLoading, error: authError, clearError, user, continueToApp } = useAuth()
  const [showWelcome, setShowWelcome] = useState(false)
  const [showContactModal, setShowContactModal] = useState(false)
  const [showBusinessModal, setShowBusinessModal] = useState(false)
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [showForgotLoginId, setShowForgotLoginId] = useState(false)
  const [supportEmail, setSupportEmail] = useState('')
  const [supportMessage, setSupportMessage] = useState('')
  const [emailSent, setEmailSent] = useState(false)
  const [businessInquirySent, setBusinessInquirySent] = useState(false)

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

  const {
    register: registerBusinessInquiry,
    handleSubmit: handleSubmitBusinessInquiry,
    formState: { errors: businessInquiryErrors },
    reset: resetBusinessInquiry,
  } = useForm<BusinessInquiryFormValues>({
    resolver: zodResolver(businessInquirySchema),
    mode: 'onTouched',
  })

  // Watch form values to clear auth error on user input
  watchLogin(() => {
    if (authError) clearError()
  })

  watchPassword(() => {
    if (authError) clearError()
  })

  watchCreatePassword(() => {
    if (authError) clearError()
  })

  const onLoginSubmit = async (data: LoginFormValues) => {
    try {
      await login(data)
      setShowWelcome(true)
    } catch (err) {
      console.error('Login failed:', err)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      await verifyPassword(data.password)
      continueToApp()
    } catch (err) {
      console.error('Password verification failed:', err)
    }
  }

  const onCreatePasswordSubmit = async (data: CreatePasswordFormValues) => {
    try {
      await setPassword(data.newPassword)
      continueToApp()
    } catch (err) {
      console.error('Password creation failed:', err)
    }
  }

  const handleGoBack = () => {
    setShowWelcome(false)
  }

  const handleSendSupportEmail = () => {
    // TODO: Integrate with your email service/API
    console.log('Support email:', supportEmail)
    console.log('Support message:', supportMessage)
    setEmailSent(true)
    setTimeout(() => {
      setShowContactModal(false)
      setEmailSent(false)
      setSupportEmail('')
      setSupportMessage('')
    }, 2000)
  }

  const onBusinessInquirySubmit = async (data: BusinessInquiryFormValues) => {
    try {
      // TODO: Integrate with your backend API
      console.log('Business inquiry:', data)
      setBusinessInquirySent(true)
      setTimeout(() => {
        setShowBusinessModal(false)
        setBusinessInquirySent(false)
        resetBusinessInquiry()
      }, 3000)
    } catch (err) {
      console.error('Business inquiry submission failed:', err)
    }
  }

  // Animation variants for smooth transitions
  const slideTransition = {
    initial: { opacity: 0, x: 50, scale: 0.98 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -50, scale: 0.98 }
  }

  const fadeScale = {
    initial: { opacity: 0, x: 50, scale: 0.97 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -50, scale: 1.03 }
  }

  return (
    <div className="w-full max-w-[462px] mx-auto px-4 h-[100dvh] flex flex-col justify-start overflow-y-auto overflow-x-hidden sm:h-auto sm:min-h-0 sm:justify-start sm:overflow-visible sm:pt-1">
      {/* Single Parent Card */}
      <div className="relative h-[560px] sm:mt-[2px] bg-gradient-to-b from-graphite-800/95 to-graphite-800/90 backdrop-blur-xl border border-[0.5px] border-graphite-600/30 rounded-2xl shadow-[0_0_40px_rgba(100,116,139,0.25),0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
        {/* Ambient background glow effects */}
        <div className="absolute -top-32 -right-32 w-64 h-64 bg-graphite-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-64 h-64 bg-graphite-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-graphite-500/40 to-transparent" />

        {/* Card Content Container - Full height with flex centering */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Main Content Area */}
          <AnimatePresence mode="wait">
            {showWelcome && user ? (
              <motion.div
                key="password-screen"
                variants={fadeScale}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex-1 flex flex-col justify-center px-6 pb-6 relative"
              >
                {/* Background User Image with Blur */}
                <div className="absolute inset-0 opacity-60 overflow-hidden rounded-t-2xl">
                  {user.profileImageUrl ? (
                    <Image
                      src={user.profileImageUrl}
                      alt={`${user.firstName} ${user.lastName}`}
                      fill
                      className="object-cover blur-sm scale-110"
                      sizes="(max-width: 768px) 100vw, 420px"
                      priority
                      quality={75}
                    />
                  ) : (
                    <Image
                      src="https://maas-log-prod.cn-wlcb.ufileos.com/anthropic/6504b85a-95ba-4b37-936f-23e91249e7a0/fbb6c4fec01a1b12177b36cf7ae051f3.jpg?UCloudPublicKey=TOKEN_e15ba47a-d098-4fbd-9afc-a0dcf0e4e621&Expires=1768808995&Signature=jlQehSRAT2yQD4F7hH9e16rwBgk="
                      alt="Password background"
                      fill
                      className="object-cover blur-sm scale-110"
                      sizes="(max-width: 768px) 100vw, 420px"
                      priority
                      quality={75}
                    />
                  )}
                  {/* Brand Accent Overlay - Graphite */}
                  <div className="absolute inset-0 bg-graphite-700/30" />
                </div>

                {/* Content Overlay - Above background */}
                <div className="relative z-10">
                {/* Profile Section */}
                <div className="mb-6 text-center">
                  {/* Profile Picture */}
                  <motion.div
                    className="inline-flex items-center justify-center mb-5"
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.12, type: "spring", stiffness: 200, damping: 20 }}
                  >
                    {user.profileImageUrl ? (
                      <div className="relative w-20 h-20">
                        <div className="absolute inset-0 bg-[#CCFF00]/25 rounded-2xl blur-xl scale-110" />
                        <Image
                          src={user.profileImageUrl}
                          alt={`${user.firstName} ${user.lastName}`}
                          fill
                          className="rounded-2xl object-cover border-2 border-[#CCFF00] shadow-xl shadow-[#CCFF00]/20"
                          sizes="80px"
                          quality={90}
                        />
                      </div>
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#CCFF00] to-[#CCFF00]/70 flex items-center justify-center shadow-xl shadow-[#CCFF00]/20 border-2 border-[#CCFF00]/50">
                        <User className="w-10 h-10 text-graphite-900" strokeWidth={2} />
                      </div>
                    )}
                  </motion.div>

                  {/* Welcome Message */}
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <h1 className="text-[28px] leading-tight font-display font-bold text-white tracking-tight mb-2">
                      Welcome <span className="text-[#CCFF00]">{user.firstName}</span>!
                    </h1>
                  </motion.div>

                  <motion.p
                    className="text-base font-display font-semibold text-[#CCFF00] tracking-wide"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.28 }}
                  >
                    {user.userRole.charAt(0).toUpperCase() + user.userRole.slice(1).toLowerCase()}: {user.garageName}
                  </motion.p>
                </div>

                {/* API Error Banner */}
                {authError && (
                  <motion.div
                    role="alert"
                    className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-status-error/10 border border-status-error/20"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-[18px] h-[18px] text-status-error flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-status-error">Authentication failed</p>
                      <p className="text-xs text-status-error/80 mt-0.5">{authError}</p>
                    </div>
                  </motion.div>
                )}

                {/* Password Forms */}
                {user.hasPassword ? (
                  <motion.form
                    onSubmit={handleSubmitPassword(onPasswordSubmit)}
                    className="space-y-6"
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    {/* Password Section */}
                    <div className="space-y-3">
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
                      <div className="text-right pt-1">
                        <button
                          type="button"
                          onClick={() => setShowForgotPassword(true)}
                          className="text-xs font-medium text-[#CCFF00]/80 hover:text-[#CCFF00] transition-colors duration-200"
                        >
                          Forgot Password?
                        </button>
                      </div>
                    </div>

                    <div className="pt-2">
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className={`
                          w-full flex items-center justify-center gap-2 group
                          px-5 py-3.5 rounded-xl
                          bg-brand hover:bg-brand-hover
                          text-graphite-900 font-bold text-sm
                          shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30
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
                            <span className="text-sm">Verifying...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm">Continue</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Additional Help Links */}
                    <motion.div
                      className="pt-4 flex items-center justify-center gap-3 text-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.45 }}
                    >
                      <button
                        type="button"
                        onClick={handleGoBack}
                        className="text-xs font-semibold text-[#CCFF00]/80 hover:text-[#CCFF00] transition-colors duration-200"
                      >
                        Not {user.firstName}?
                      </button>
                      <span className="text-graphite-600">|</span>
                      <button
                        type="button"
                        onClick={() => setShowContactModal(true)}
                        className="text-xs font-semibold text-[#CCFF00]/80 hover:text-[#CCFF00] transition-colors duration-200"
                      >
                        Contact Support
                      </button>
                    </motion.div>
                  </motion.form>
                ) : (
                  <motion.form
                    onSubmit={handleSubmitCreatePassword(onCreatePasswordSubmit)}
                    className="space-y-6"
                    noValidate
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.35 }}
                  >
                    {/* Create Password Instruction */}
                    <motion.p
                      className="text-xs text-graphite-400 text-center"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4 }}
                    >
                      Create a secure password to continue
                    </motion.p>

                    {/* Password Input Fields */}
                    <div className="space-y-4">
                      <PasswordInput
                        id="newPassword"
                        name="newPassword"
                        label="Create Password"
                        placeholder="Min. 8 characters"
                        error={createPasswordErrors.newPassword?.message}
                        register={registerCreatePassword('newPassword')}
                        autoComplete="new-password"
                        disabled={isLoading}
                      />

                      <PasswordInput
                        id="confirmPassword"
                        name="confirmPassword"
                        label="Confirm Password"
                        placeholder="Re-enter password"
                        error={createPasswordErrors.confirmPassword?.message}
                        register={registerCreatePassword('confirmPassword')}
                        autoComplete="new-password"
                        disabled={isLoading}
                      />
                    </div>

                    {/* Password Requirements */}
                    <div className="text-xs text-graphite-500 space-y-1.5 px-3 py-2.5 rounded-lg bg-graphite-900/50 border border-graphite-700/70">
                      <p className="font-semibold text-graphite-400 text-xs mb-1.5">Password requirements:</p>
                      <ul className="space-y-0.5 ml-3.5 list-disc">
                        <li className="text-xs">Minimum 8 characters</li>
                        <li className="text-xs">Strong and secure combination</li>
                      </ul>
                    </div>

                    <div className="pt-1">
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        className={`
                          w-full flex items-center justify-center gap-2 group
                          px-5 py-3.5 rounded-xl
                          bg-brand hover:bg-brand-hover
                          text-graphite-900 font-bold text-sm
                          shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30
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
                            <span className="text-sm">Creating...</span>
                          </>
                        ) : (
                          <>
                            <span className="text-sm">Continue</span>
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
                          </>
                        )}
                      </motion.button>
                    </div>

                    {/* Additional Help Links */}
                    <motion.div
                      className="pt-4 flex items-center justify-center gap-6 text-xs"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5 }}
                    >
                      <a
                        href="#"
                        className="text-[#CCFF00]/70 hover:text-[#CCFF00] transition-colors duration-200 font-medium"
                      >
                        Password tips
                      </a>
                      <span className="text-[#CCFF00]/30">•</span>
                      <a
                        href="#"
                        className="text-[#CCFF00]/70 hover:text-[#CCFF00] transition-colors duration-200 font-medium"
                      >
                        Need help?
                      </a>
                    </motion.div>
                  </motion.form>
                )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="login-screen"
                variants={slideTransition}
                initial="initial"
                animate="animate"
                exit="exit"
                transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
                className="flex-1 flex flex-col justify-center px-6 pb-6 relative"
              >
                {/* Content Overlay - Above background */}
                <div className="relative z-10">
                {/* Logo Header */}
                <motion.div
                  className="mb-6 text-center"
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 }}
                >
                  <LoginLogo />
                </motion.div>

                {/* API Error Banner */}
                {authError && (
                  <motion.div
                    role="alert"
                    className="mb-5 flex items-start gap-3 px-4 py-3 rounded-xl bg-status-error/10 border border-status-error/20"
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <AlertCircle className="w-[18px] h-[18px] text-status-error flex-shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-status-error">Authentication failed</p>
                      <p className="text-xs text-status-error/80 mt-0.5">{authError}</p>
                    </div>
                  </motion.div>
                )}

                {/* Login Form */}
                <motion.form
                  onSubmit={handleSubmitLogin(onLoginSubmit)}
                  className="space-y-6"
                  noValidate
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.15 }}
                >
                  {/* Login ID Section */}
                  <div className="space-y-3">
                    <label
                      htmlFor="loginId"
                      className="block text-xs font-bold uppercase tracking-widest text-[#CCFF00]/90 flex items-center gap-2"
                    >
                      <Shield className="w-3.5 h-3.5" />
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
                        text-base bg-white text-graphite-900
                        border rounded-lg
                        placeholder:text-graphite-500
                        transition-all duration-200 ease-out
                        disabled:opacity-50 disabled:cursor-not-allowed
                        shadow-sm
                        focus:outline-none
                        focus:ring-2 focus:ring-[#CCFF00]/20 focus:ring-offset-2 focus:ring-offset-white
                        ${
                          loginErrors.loginId
                            ? 'border-status-error'
                            : 'border-gray-300 focus:border-[#CCFF00]'
                        }
                      `}
                      {...registerLogin('loginId')}
                    />

                    {/* Login ID Error */}
                    {loginErrors.loginId && (
                      <motion.div
                        id="loginId-error"
                        role="alert"
                        className="flex items-start gap-2 text-xs text-status-error"
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                      >
                        <svg
                          className="w-3.5 h-3.5 mt-0.5 flex-shrink-0"
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
                        <span className="font-medium">{loginErrors.loginId.message}</span>
                      </motion.div>
                    )}

                    {/* Forgot Login ID Link */}
                    <div className="text-right pt-1">
                      <button
                        type="button"
                        onClick={() => setShowForgotLoginId(true)}
                        className="text-xs font-medium text-[#CCFF00]/80 hover:text-[#CCFF00] transition-colors duration-200"
                      >
                        Forgot your login ID?
                      </button>
                    </div>
                  </div>

                  <div className="pt-1">
                    <motion.button
                      type="submit"
                      disabled={isLoading}
                      className={`
                        w-full flex items-center justify-center gap-2 group
                        px-5 py-3.5 rounded-xl
                        bg-brand hover:bg-brand-hover
                        text-graphite-900 font-bold text-sm
                        shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30
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
                          <span className="text-sm">Initializing...</span>
                          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                        </>
                      ) : (
                        <>
                          <span className="text-sm">Initialize System</span>
                          <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
                        </>
                      )}
                    </motion.button>
                  </div>

                  {/* Contact Us Link - Always visible */}
                  <motion.div
                    className="pt-4 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.25 }}
                  >
                    <button
                      type="button"
                      onClick={() => setShowBusinessModal(true)}
                      className="group inline-flex items-center gap-1.5 text-xs font-semibold text-[#CCFF00]/80 hover:text-[#CCFF00] transition-all duration-200 whitespace-nowrap"
                    >
                      <span>Don't have a login ID?</span>
                      <span className="underline decoration-[#CCFF00]/50 underline-offset-2 group-hover:decoration-[#CCFF00] transition-all">Contact us</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform duration-300" strokeWidth={2.5} />
                    </button>
                  </motion.div>
                </motion.form>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      {/* Footer - Below the card */}
      <div className="mt-5 text-center">
        <div className="flex items-center justify-center gap-2 text-xs text-graphite-500">
          <span className="text-graphite-700">© 2026 </span>
          <span className="text-graphite-800 font-semibold">RevOS</span>
          <span className="text-graphite-600">|</span>
          <span className="font-display font-semibold tracking-wide text-graphite-700">
            POWERED BY{' '}
            <span className="font-manrope">
              <span className="font-bold text-[#FF4F00]">GLITCH</span>
              <span className="font-normal text-graphite-800 drop-shadow-[0_0_8px_rgba(0,0,0,0.1)]">ZERO</span>
            </span>
          </span>
        </div>
      </div>

      {/* Contact Support Modal */}
      <AnimatePresence>
        {showContactModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setShowContactModal(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative w-full max-w-md bg-gradient-to-b from-graphite-800 to-graphite-800/95 border border-brand/30 rounded-2xl shadow-[0_0_40px_rgba(204,255,0,0.2),0_8px_32px_rgba(0,0,0,0.6)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-brand/10">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand/20 flex items-center justify-center">
                      <Mail className="w-5 h-5 text-brand" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-lg font-display font-bold text-white">Contact Support</h2>
                      <p className="text-xs text-graphite-400">We'll help you resolve any issues</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowContactModal(false)}
                    className="w-8 h-8 rounded-lg bg-graphite-900/50 hover:bg-graphite-900 flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-4 h-4 text-graphite-400" strokeWidth={2} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4">
                  {emailSent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-8"
                    >
                      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-brand/20 flex items-center justify-center">
                        <Mail className="w-8 h-8 text-brand" strokeWidth={2} />
                      </div>
                      <h3 className="text-xl font-display font-bold text-white mb-2">Message Sent!</h3>
                      <p className="text-sm text-graphite-400">We'll get back to you as soon as possible.</p>
                    </motion.div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <label htmlFor="support-email" className="block text-xs font-bold uppercase tracking-wider text-brand/90">
                          Your Email
                        </label>
                        <input
                          id="support-email"
                          type="email"
                          placeholder="your.email@example.com"
                          value={supportEmail}
                          onChange={(e) => setSupportEmail(e.target.value)}
                          className="w-full h-11 px-4 text-sm bg-graphite-900/80 text-white border-2 border-graphite-700 rounded-xl placeholder:text-graphite-500 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/60 transition-all duration-300"
                        />
                      </div>

                      <div className="space-y-2">
                        <label htmlFor="support-message" className="block text-xs font-bold uppercase tracking-wider text-brand/90">
                          Message
                        </label>
                        <textarea
                          id="support-message"
                          rows={4}
                          placeholder="Describe the issue you're facing..."
                          value={supportMessage}
                          onChange={(e) => setSupportMessage(e.target.value)}
                          className="w-full px-4 py-3 text-sm bg-graphite-900/80 text-white border-2 border-graphite-700 rounded-xl placeholder:text-graphite-500 focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/60 transition-all duration-300 resize-none"
                        />
                      </div>
                    </>
                  )}
                </div>

                {/* Modal Footer */}
                {!emailSent && (
                  <div className="px-6 py-4 border-t border-brand/10 flex gap-3">
                    <button
                      onClick={() => setShowContactModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-graphite-700 text-graphite-300 font-semibold text-sm hover:bg-graphite-900/50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSendSupportEmail}
                      disabled={!supportEmail || !supportMessage}
                      className="flex-1 px-4 py-3 rounded-xl bg-brand hover:bg-brand-hover text-graphite-900 font-bold text-sm shadow-lg shadow-brand/20 hover:shadow-xl hover:shadow-brand/30 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
                    >
                      Send Message
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Business Inquiry Modal */}
      <AnimatePresence>
        {showBusinessModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50"
              onClick={() => setShowBusinessModal(false)}
            />

            {/* Modal */}
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ duration: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
                className="relative w-full max-w-2xl my-8 bg-white border border-gray-200 rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-graphite-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-graphite-700" strokeWidth={2} />
                    </div>
                    <div>
                      <h2 className="text-lg font-display font-bold text-gray-900">Request a Quote</h2>
                      <p className="text-xs text-gray-500">Get started with RevOS for your business</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBusinessModal(false)}
                    className="w-8 h-8 rounded-lg bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200"
                  >
                    <X className="w-4 h-4 text-gray-600" strokeWidth={2} />
                  </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 max-h-[calc(100vh-240px)] overflow-y-auto bg-gray-50/50">
                  {businessInquirySent ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-center py-12"
                    >
                      <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-graphite-100 flex items-center justify-center">
                        <Building2 className="w-10 h-10 text-graphite-700" strokeWidth={2} />
                      </div>
                      <h3 className="text-2xl font-display font-bold text-gray-900 mb-3">Inquiry Received!</h3>
                      <p className="text-sm text-gray-600 max-w-md mx-auto">Thank you for your interest. Our team will review your information and reach out within 24-48 hours with a customized quote.</p>
                    </motion.div>
                  ) : (
                    <form onSubmit={handleSubmitBusinessInquiry(onBusinessInquirySubmit)} className="space-y-5" noValidate>
                      {/* Business Information Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                          <Building2 className="w-4 h-4 text-graphite-700" strokeWidth={2} />
                          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Business Information</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Business Name */}
                          <div className="space-y-2">
                            <label htmlFor="businessName" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                              Business/Garage Name *
                            </label>
                            <input
                              id="businessName"
                              type="text"
                              placeholder="e.g., AutoCare Garage"
                              {...registerBusinessInquiry('businessName')}
                              className={`w-full h-11 px-4 text-sm bg-white text-gray-900 border-2 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-graphite-100 transition-all duration-300 ${
                                businessInquiryErrors.businessName ? 'border-red-500' : 'border-gray-300 focus:border-graphite-400'
                              }`}
                            />
                            {businessInquiryErrors.businessName && (
                              <p className="text-xs text-red-500 mt-1">{businessInquiryErrors.businessName.message}</p>
                            )}
                          </div>

                          {/* Contact Person */}
                          <div className="space-y-2">
                            <label htmlFor="contactPerson" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                              Contact Person *
                            </label>
                            <input
                              id="contactPerson"
                              type="text"
                              placeholder="Full name"
                              {...registerBusinessInquiry('contactPerson')}
                              className={`w-full h-11 px-4 text-sm bg-white text-gray-900 border-2 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-graphite-100 transition-all duration-300 ${
                                businessInquiryErrors.contactPerson ? 'border-red-500' : 'border-gray-300 focus:border-graphite-400'
                              }`}
                            />
                            {businessInquiryErrors.contactPerson && (
                              <p className="text-xs text-red-500 mt-1">{businessInquiryErrors.contactPerson.message}</p>
                            )}
                          </div>

                          {/* Email */}
                          <div className="space-y-2">
                            <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                              Email Address *
                            </label>
                            <input
                              id="email"
                              type="email"
                              placeholder="business@email.com"
                              {...registerBusinessInquiry('email')}
                              className={`w-full h-11 px-4 text-sm bg-white text-gray-900 border-2 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-graphite-100 transition-all duration-300 ${
                                businessInquiryErrors.email ? 'border-red-500' : 'border-gray-300 focus:border-graphite-400'
                              }`}
                            />
                            {businessInquiryErrors.email && (
                              <p className="text-xs text-red-500 mt-1">{businessInquiryErrors.email.message}</p>
                            )}
                          </div>

                          {/* Phone */}
                          <div className="space-y-2">
                            <label htmlFor="phone" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                              Phone Number *
                            </label>
                            <input
                              id="phone"
                              type="tel"
                              placeholder="+1 (555) 000-0000"
                              {...registerBusinessInquiry('phone')}
                              className={`w-full h-11 px-4 text-sm bg-white text-gray-900 border-2 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-graphite-100 transition-all duration-300 ${
                                businessInquiryErrors.phone ? 'border-red-500' : 'border-gray-300 focus:border-graphite-400'
                              }`}
                            />
                            {businessInquiryErrors.phone && (
                              <p className="text-xs text-red-500 mt-1">{businessInquiryErrors.phone.message}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Operations Section */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                          <Wrench className="w-4 h-4 text-graphite-700" strokeWidth={2} />
                          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Operations</h3>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {/* Business Type */}
                          <div className="space-y-2">
                            <label htmlFor="businessType" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                              Business Type *
                            </label>
                            <select
                              id="businessType"
                              {...registerBusinessInquiry('businessType')}
                              className={`w-full h-11 px-4 text-sm bg-white text-gray-900 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-graphite-100 transition-all duration-300 ${
                                businessInquiryErrors.businessType ? 'border-red-500' : 'border-gray-300 focus:border-graphite-400'
                              }`}
                            >
                              <option value="" className="bg-white">Select type</option>
                              <option value="garage" className="bg-white">Independent Garage</option>
                              <option value="service_center" className="bg-white">Service Center</option>
                              <option value="dealership" className="bg-white">Car Dealership</option>
                              <option value="tire_shop" className="bg-white">Tire Shop</option>
                              <option value="quick_lube" className="bg-white">Quick Lube</option>
                              <option value="collision" className="bg-white">Collision Repair</option>
                              <option value="specialty" className="bg-white">Specialty Shop</option>
                              <option value="other" className="bg-white">Other</option>
                            </select>
                            {businessInquiryErrors.businessType && (
                              <p className="text-xs text-red-500 mt-1">{businessInquiryErrors.businessType.message}</p>
                            )}
                          </div>

                          {/* Number of Bays */}
                          <div className="space-y-2">
                            <label htmlFor="numberOfBays" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                              Number of Service Bays *
                            </label>
                            <select
                              id="numberOfBays"
                              {...registerBusinessInquiry('numberOfBays')}
                              className={`w-full h-11 px-4 text-sm bg-white text-gray-900 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-graphite-100 transition-all duration-300 ${
                                businessInquiryErrors.numberOfBays ? 'border-red-500' : 'border-gray-300 focus:border-graphite-400'
                              }`}
                            >
                              <option value="" className="bg-white">Select count</option>
                              <option value="1-2" className="bg-white">1-2 bays</option>
                              <option value="3-5" className="bg-white">3-5 bays</option>
                              <option value="6-10" className="bg-white">6-10 bays</option>
                              <option value="11-15" className="bg-white">11-15 bays</option>
                              <option value="16+" className="bg-white">16+ bays</option>
                            </select>
                            {businessInquiryErrors.numberOfBays && (
                              <p className="text-xs text-red-500 mt-1">{businessInquiryErrors.numberOfBays.message}</p>
                            )}
                          </div>

                          {/* Monthly Volume */}
                          <div className="space-y-2 sm:col-span-2">
                            <label htmlFor="monthlyVolume" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                              Monthly Service Volume *
                            </label>
                            <select
                              id="monthlyVolume"
                              {...registerBusinessInquiry('monthlyVolume')}
                              className={`w-full h-11 px-4 text-sm bg-white text-gray-900 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-graphite-100 transition-all duration-300 ${
                                businessInquiryErrors.monthlyVolume ? 'border-red-500' : 'border-gray-300 focus:border-graphite-400'
                              }`}
                            >
                              <option value="" className="bg-white">Select volume</option>
                              <option value="0-50" className="bg-white">0-50 vehicles/month</option>
                              <option value="51-100" className="bg-white">51-100 vehicles/month</option>
                              <option value="101-200" className="bg-white">101-200 vehicles/month</option>
                              <option value="201-500" className="bg-white">201-500 vehicles/month</option>
                              <option value="500+" className="bg-white">500+ vehicles/month</option>
                            </select>
                            {businessInquiryErrors.monthlyVolume && (
                              <p className="text-xs text-red-500 mt-1">{businessInquiryErrors.monthlyVolume.message}</p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Contact Preferences */}
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 pb-2 border-b border-gray-200">
                          <Users className="w-4 h-4 text-graphite-700" strokeWidth={2} />
                          <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Contact Preferences</h3>
                        </div>

                        <div className="space-y-2">
                          <label htmlFor="preferredContact" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Preferred Contact Method *
                          </label>
                          <select
                            id="preferredContact"
                            {...registerBusinessInquiry('preferredContact')}
                            className={`w-full h-11 px-4 text-sm bg-white text-gray-900 border-2 rounded-xl focus:outline-none focus:ring-4 focus:ring-brand/10 transition-all duration-300 ${
                              businessInquiryErrors.preferredContact ? 'border-red-500' : 'border-gray-300 focus:border-graphite-400'
                            }`}
                          >
                            <option value="" className="bg-white">Select method</option>
                            <option value="email" className="bg-white">Email</option>
                            <option value="phone" className="bg-white">Phone Call</option>
                            <option value="whatsapp" className="bg-white">WhatsApp</option>
                          </select>
                          {businessInquiryErrors.preferredContact && (
                            <p className="text-xs text-red-500 mt-1">{businessInquiryErrors.preferredContact.message}</p>
                          )}
                        </div>

                        {/* Additional Message */}
                        <div className="space-y-2">
                          <label htmlFor="message" className="block text-xs font-semibold uppercase tracking-wider text-gray-700">
                            Additional Information (Optional)
                          </label>
                          <textarea
                            id="message"
                            rows={3}
                            placeholder="Tell us about your specific needs, current challenges, or any questions you have..."
                            {...registerBusinessInquiry('message')}
                            className="w-full px-4 py-3 text-sm bg-white text-gray-900 border-2 border-gray-300 rounded-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-graphite-100 focus:border-graphite-400 transition-all duration-300 resize-none"
                          />
                        </div>
                      </div>
                    </form>
                  )}
                </div>

                {/* Modal Footer */}
                {!businessInquirySent && (
                  <div className="px-6 py-4 border-t border-gray-200 flex gap-3 bg-white">
                    <button
                      type="button"
                      onClick={() => setShowBusinessModal(false)}
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-all duration-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmitBusinessInquiry(onBusinessInquirySubmit)}
                      className="flex-1 px-4 py-3 rounded-xl bg-graphite-800 hover:bg-graphite-900 text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                      <span>Submit Inquiry</span>
                      <ArrowRight className="w-4 h-4" strokeWidth={2.5} />
                    </button>
                  </div>
                )}
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        initialLoginId={user?.loginId}
      />

      {/* Forgot Login ID Modal */}
      <ForgotLoginIdModal
        isOpen={showForgotLoginId}
        onClose={() => setShowForgotLoginId(false)}
      />
    </div>
  )
}
