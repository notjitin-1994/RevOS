/**
 * LoadingSpinner Component
 *
 * Branded loading spinner component
 * Features:
 * - Different sizes (sm, md, lg)
 * - Optional text message
 * - Smooth rotation animation
 * - Accessibility support
 */

'use client'

import { Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  text?: string
  className?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-8 w-8',
  lg: 'h-12 w-12',
}

const textSizeMap = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-lg',
}

export function LoadingSpinner({
  size = 'md',
  text,
  className = '',
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${className}`}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <Loader2
          className={`${sizeMap[size]} text-graphite-700 animate-spin`}
          aria-hidden="true"
        />
      </motion.div>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className={`${textSizeMap[size]} text-gray-600 font-medium`}
        >
          {text}
        </motion.p>
      )}

      {/* Screen reader only text */}
      <span className="sr-only">Loading</span>
    </div>
  )
}
