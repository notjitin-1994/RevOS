/**
 * ErrorBoundary Component
 *
 * React error boundary for graceful error handling
 * Features:
 * - Catches JavaScript errors in component tree
 * - Fallback UI with retry option
 * - Error details in development mode
 * - Error logging integration
 * - Accessibility support
 */

'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertCircle, RefreshCw, Home, Bug } from 'lucide-react'
import { motion } from 'framer-motion'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  showDetails?: boolean
}

interface ErrorBoundaryState {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ ErrorBoundary caught an error:', error)
      console.error('Error Info:', errorInfo)
    }

    // Store error info in state
    this.setState({
      errorInfo,
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // Log to error reporting service (e.g., Sentry, LogRocket)
    // Example: logErrorToService(error, errorInfo)
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  handleGoHome = () => {
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      // Use custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      const { error, errorInfo } = this.state
      const isDev = process.env.NODE_ENV === 'development'
      const showDetails = this.props.showDetails ?? isDev

      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="min-h-[400px] flex items-center justify-center p-6"
        >
          <div className="max-w-2xl w-full bg-white rounded-xl border-2 border-red-200 shadow-lg p-8">
            {/* Error Icon */}
            <div className="flex items-center justify-center mb-6">
              <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center">
                <AlertCircle className="h-10 w-10 text-red-600" />
              </div>
            </div>

            {/* Error Message */}
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600">
                We encountered an unexpected error. Don't worry, your work is safe.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <button
                onClick={this.handleRetry}
                className="flex items-center gap-2 px-6 py-3 bg-graphite-700 text-white font-semibold rounded-xl hover:bg-graphite-600 transition-all duration-200 shadow-lg"
              >
                <RefreshCw className="h-4 w-4" />
                Try Again
              </button>
              <button
                onClick={this.handleGoHome}
                className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all duration-200"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>

            {/* Error Details (Development Only) */}
            {showDetails && error && (
              <details className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-700 mb-3">
                  <Bug className="h-4 w-4" />
                  Error Details (Development)
                </summary>

                <div className="space-y-3 text-sm">
                  {/* Error Message */}
                  <div>
                    <p className="font-semibold text-gray-700 mb-1">Error Message:</p>
                    <pre className="bg-white p-3 rounded border border-gray-200 overflow-x-auto text-red-600">
                      {error.message}
                    </pre>
                  </div>

                  {/* Stack Trace */}
                  {error.stack && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Stack Trace:</p>
                      <pre className="bg-white p-3 rounded border border-gray-200 overflow-x-auto text-xs text-gray-600 max-h-40 overflow-y-auto">
                        {error.stack}
                      </pre>
                    </div>
                  )}

                  {/* Component Stack */}
                  {errorInfo && errorInfo.componentStack && (
                    <div>
                      <p className="font-semibold text-gray-700 mb-1">Component Stack:</p>
                      <pre className="bg-white p-3 rounded border border-gray-200 overflow-x-auto text-xs text-gray-600 max-h-40 overflow-y-auto">
                        {errorInfo.componentStack}
                      </pre>
                    </div>
                  )}
                </div>
              </details>
            )}

            {/* Support Message */}
            <p className="text-center text-sm text-gray-500 mt-6">
              If this problem persists, please contact support
            </p>
          </div>
        </motion.div>
      )
    }

    return this.props.children
  }
}

/**
 * Higher-order component version of ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`

  return WrappedComponent
}
