/**
 * ErrorState Component
 *
 * Reusable error state component
 * Features:
 * - Different error types (network, permissions, not found)
 * - Retry mechanism
 * - Contact support option
 * - Customizable messaging
 * - Accessibility support
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  RefreshCw,
  WifiOff,
  Lock,
  SearchX,
  Mail,
  Bug,
} from 'lucide-react'

type ErrorType = 'network' | 'permission' | 'notFound' | 'generic' | 'timeout'

interface ErrorStateProps {
  type?: ErrorType
  title?: string
  message?: string
  onRetry?: () => void
  showContactSupport?: boolean
  className?: string
}

const errorConfig = {
  network: {
    icon: WifiOff,
    defaultTitle: 'Network Error',
    defaultMessage: 'Unable to connect to the server. Please check your internet connection.',
  },
  permission: {
    icon: Lock,
    defaultTitle: 'Permission Denied',
    defaultMessage: "You don't have permission to access this resource.",
  },
  notFound: {
    icon: SearchX,
    defaultTitle: 'Not Found',
    defaultMessage: 'The requested resource could not be found.',
  },
  timeout: {
    icon: AlertCircle,
    defaultTitle: 'Request Timeout',
    defaultMessage: 'The request took too long to complete. Please try again.',
  },
  generic: {
    icon: AlertCircle,
    defaultTitle: 'Something went wrong',
    defaultMessage: 'An unexpected error occurred. Please try again.',
  },
}

export function ErrorState({
  type = 'generic',
  title,
  message,
  onRetry,
  showContactSupport = true,
  className = '',
}: ErrorStateProps) {
  const config = errorConfig[type]
  const Icon = config.icon
  const displayTitle = title || config.defaultTitle
  const displayMessage = message || config.defaultMessage

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-xl border-2 border-red-200 shadow-lg p-8 ${className}`}
      role="alert"
      aria-live="assertive"
    >
      {/* Error Icon */}
      <div className="flex items-center justify-center mb-6">
        <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
          <Icon className="h-10 w-10 text-red-600" aria-hidden="true" />
        </div>
      </div>

      {/* Error Message */}
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-2">{displayTitle}</h2>
        <p className="text-gray-600">{displayMessage}</p>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-center gap-3">
        {onRetry && (
          <button
            onClick={onRetry}
            className="flex items-center gap-2 px-6 py-3 bg-graphite-700 text-white font-semibold rounded-xl hover:bg-graphite-600 transition-all duration-200 shadow-lg"
            aria-label="Retry the failed action"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
            Try Again
          </button>
        )}

        {showContactSupport && (
          <button
            onClick={() => {
              window.location.href = 'mailto:support@revos.io'
            }}
            className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
            aria-label="Contact support"
          >
            <Mail className="h-4 w-4" aria-hidden="true" />
            Contact Support
          </button>
        )}
      </div>

      {/* Additional Info (Generic Error) */}
      {type === 'generic' && process.env.NODE_ENV === 'development' && (
        <details className="mt-6 bg-gray-50 rounded-lg p-4 border border-gray-200">
          <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700 mb-3">
            <Bug className="h-4 w-4" aria-hidden="true" />
            Debug Information
          </summary>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              <strong>Error Type:</strong> {type}
            </p>
            <p>
              <strong>Timestamp:</strong> {new Date().toISOString()}
            </p>
            <p>
              <strong>User Agent:</strong> {navigator.userAgent}
            </p>
          </div>
        </details>
      )}
    </motion.div>
  )
}

/**
 * Network Error State
 */
export function NetworkErrorState(props: Omit<ErrorStateProps, 'type'>) {
  return <ErrorState type="network" {...props} />
}

/**
 * Permission Error State
 */
export function PermissionErrorState(props: Omit<ErrorStateProps, 'type'>) {
  return <ErrorState type="permission" {...props} />
}

/**
 * Not Found Error State
 */
export function NotFoundErrorState(props: Omit<ErrorStateProps, 'type'>) {
  return <ErrorState type="notFound" {...props} />
}

/**
 * Timeout Error State
 */
export function TimeoutErrorState(props: Omit<ErrorStateProps, 'type'>) {
  return <ErrorState type="timeout" {...props} />
}
