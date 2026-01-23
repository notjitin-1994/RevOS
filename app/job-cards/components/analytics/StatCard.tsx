/**
 * StatCard Component
 *
 * Reusable metric card for analytics dashboard
 * Features:
 * - Trend indicators (up/down/neutral)
 * - Icon support
 * - Click handlers for drill-down
 * - Customizable colors
 * - Accessibility support
 */

'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Minus } from 'lucide-react'

export type TrendDirection = 'up' | 'down' | 'neutral'

interface StatCardProps {
  title: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    direction: TrendDirection
    value: string
    label?: string
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'gray'
  onClick?: () => void
  className?: string
}

const colorClasses = {
  blue: {
    bg: 'bg-gray-100',
    border: 'border-graphite-600',
    text: 'text-graphite-900',
    icon: 'text-graphite-700',
  },
  green: {
    bg: 'bg-gray-50',
    border: 'border-graphite-400',
    text: 'text-graphite-900',
    icon: 'text-graphite-600',
  },
  yellow: {
    bg: 'bg-gray-200',
    border: 'border-graphite-700',
    text: 'text-graphite-900',
    icon: 'text-graphite-800',
  },
  red: {
    bg: 'bg-gray-300',
    border: 'border-graphite-800',
    text: 'text-graphite-900',
    icon: 'text-graphite-900',
  },
  gray: {
    bg: 'bg-gray-50',
    border: 'border-graphite-600',
    text: 'text-graphite-800',
    icon: 'text-graphite-700',
  },
}

const trendIcons = {
  up: ArrowUp,
  down: ArrowDown,
  neutral: Minus,
}

export function StatCard({
  title,
  value,
  icon,
  trend,
  color = 'gray',
  onClick,
  className = '',
}: StatCardProps) {
  const colors = colorClasses[color]
  const isClickable = !!onClick

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`${colors.bg} rounded-xl border-2 ${colors.border} p-6 ${
        isClickable ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''
      } ${className}`}
      onClick={onClick}
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
      aria-label={title}
    >
      {/* Header with Icon */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">
            {title}
          </p>
          <p className={`text-3xl font-bold ${colors.text}`}>
            {value}
          </p>
        </div>

        {icon && (
          <div className={`${colors.icon} ${colors.bg} rounded-lg p-2`}>
            {icon}
          </div>
        )}
      </div>

      {/* Trend Indicator */}
      {trend && (
        <div className="flex items-center gap-2">
          <div
            className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
              trend.direction === 'up'
                ? 'bg-gray-100 text-graphite-900'
                : trend.direction === 'down'
                ? 'bg-gray-300 text-graphite-900'
                : 'bg-gray-200 text-graphite-800'
            }`}
          >
            {React.createElement(trendIcons[trend.direction], {
              className: 'h-3 w-3',
              'aria-hidden': 'true',
            })}
            <span>{trend.value}</span>
          </div>

          {trend.label && (
            <span className="text-xs text-graphite-600">{trend.label}</span>
          )}
        </div>
      )}
    </motion.div>
  )
}
