/**
 * EventWithProgress Component
 *
 * Calendar event with progress indicator and enhanced visuals
 * Supports animations and interactive elements
 */

'use client'

import React, { useMemo } from 'react'
import { getEventColors, getProgressPercentage, getProgressColor } from '../../lib/utils/color-coding'
import type { JobCardViewData } from '../../types/job-card-view.types'

interface EventWithProgressProps {
  jobCard: JobCardViewData
  isHovered?: boolean
  showProgress?: boolean
  compact?: boolean
}

/**
 * Calendar event component with progress bar and visual indicators
 */
export function EventWithProgress({
  jobCard,
  isHovered = false,
  showProgress = true,
  compact = false,
}: EventWithProgressProps) {
  const colors = useMemo(
    () => getEventColors(jobCard.priority, jobCard.status, jobCard.promisedDate),
    [jobCard.priority, jobCard.status, jobCard.promisedDate]
  )

  const progress = useMemo(() => getProgressPercentage(jobCard.status), [jobCard.status])
  const progressColor = useMemo(() => getProgressColor(progress), [progress])

  const eventStyle: React.CSSProperties = {
    backgroundColor: colors.backgroundColor,
    borderLeftColor: colors.borderColor,
    borderLeftWidth: colors.isOverdue ? '4px' : '3px',
  }

  if (compact) {
    return (
      <div
        className="relative h-full w-full p-1 text-xs rounded-md overflow-hidden transition-all duration-200"
        style={eventStyle}
      >
        {/* Progress Bar Overlay (subtle) */}
        {showProgress && progress > 0 && progress < 100 && (
          <div
            className="absolute inset-0 opacity-20 transition-all duration-500"
            style={{
              width: `${progress}%`,
              backgroundColor: progressColor,
            }}
          />
        )}

        {/* Content */}
        <div className="relative z-10">
          <div className="font-semibold truncate text-[10px] sm:text-xs leading-tight">
            {jobCard.jobCardNumber}
          </div>
          <div className="truncate opacity-90 text-[9px] sm:text-[10px] leading-tight hidden sm:block">
            {jobCard.vehicleMake} {jobCard.vehicleModel}
          </div>
        </div>

        {/* Overdue indicator */}
        {colors.isOverdue && (
          <div className="absolute top-0.5 right-0.5">
            <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
          </div>
        )}
      </div>
    )
  }

  return (
    <div
      className={`relative h-full w-full p-1.5 text-xs rounded-lg overflow-hidden transition-all duration-200 ${
        isHovered ? 'shadow-md transform scale-[1.02]' : ''
      }`}
      style={eventStyle}
    >
      {/* Progress Bar (background) */}
      {showProgress && progress > 0 && progress < 100 && (
        <div
          className="absolute bottom-0 left-0 right-0 h-1 transition-all duration-500 ease-out"
          style={{
            width: `${progress}%`,
            backgroundColor: progressColor,
          }}
        />
      )}

      {/* Animated stripes for overdue */}
      {colors.isOverdue && (
        <div className="absolute inset-0 opacity-10 pointer-events-none bg-gradient-to-r from-red-500 via-transparent to-red-500 bg-[length:200%_100%] animate-shimmer" />
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between gap-1 mb-0.5">
          <div className="font-semibold truncate text-[10px] sm:text-xs leading-tight flex-1">
            {jobCard.jobCardNumber}
          </div>
          {colors.isOverdue && (
            <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse flex-shrink-0 mt-0.5" />
          )}
        </div>

        {/* Vehicle info */}
        <div className="truncate opacity-90 text-[9px] sm:text-[10px] leading-tight mb-0.5">
          {jobCard.vehicleMake} {jobCard.vehicleModel}
        </div>

        {/* Progress indicator */}
        {showProgress && progress > 0 && (
          <div className="flex items-center gap-1 mt-1">
            <div className="flex-1 h-1 bg-gray-300/30 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-500 ease-out"
                style={{
                  width: `${progress}%`,
                  backgroundColor: progressColor,
                }}
              />
            </div>
            <span className="text-[9px] font-medium opacity-90">{progress}%</span>
          </div>
        )}

        {/* Customer name (on larger screens) */}
        {jobCard.customerName && (
          <div className="truncate opacity-75 text-[9px] mt-0.5 hidden md:block">
            {jobCard.customerName}
          </div>
        )}
      </div>

      {/* Priority indicator (top-right) */}
      {jobCard.priority === 'urgent' && !colors.isOverdue && (
        <div className="absolute top-1 right-1">
          <div className="h-1.5 w-1.5 rounded-full bg-red-400 animate-pulse" />
        </div>
      )}
    </div>
  )
}

/**
 * Small event variant for month view
 */
export function EventSmall({ jobCard }: { jobCard: JobCardViewData }) {
  const colors = getEventColors(jobCard.priority, jobCard.status, jobCard.promisedDate)

  return (
    <div
      className="relative h-full w-full p-1 text-xs rounded overflow-hidden"
      style={{
        backgroundColor: colors.backgroundColor,
        borderLeft: `2px solid ${colors.borderColor}`,
      }}
    >
      <div className="truncate font-medium text-[9px] sm:text-[10px] leading-tight">
        {jobCard.jobCardNumber}
      </div>

      {colors.isOverdue && (
        <div className="absolute top-0.5 right-0.5 h-1 w-1 rounded-full bg-red-500" />
      )}
    </div>
  )
}

/**
 * List view event variant
 */
export function EventList({ jobCard }: { jobCard: JobCardViewData }) {
  const colors = getEventColors(jobCard.priority, jobCard.status, jobCard.promisedDate)
  const progress = getProgressPercentage(jobCard.status)

  return (
    <div className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
      {/* Color indicator */}
      <div
        className="w-1 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: colors.borderColor }}
      />

      {/* Date */}
      {jobCard.promisedDate && (
        <div className="text-sm font-medium text-gray-900 w-20 flex-shrink-0">
          {new Date(jobCard.promisedDate).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
          })}
        </div>
      )}

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="font-semibold text-sm text-gray-900 truncate">
          {jobCard.jobCardNumber}
        </div>
        <div className="text-xs text-gray-600 truncate">
          {jobCard.vehicleMake} {jobCard.vehicleModel}
        </div>
      </div>

      {/* Progress */}
      {progress > 0 && (
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: getProgressColor(progress),
              }}
            />
          </div>
          <span className="text-xs font-medium text-gray-700 w-8">{progress}%</span>
        </div>
      )}

      {/* Overdue indicator */}
      {colors.isOverdue && (
        <div className="flex-shrink-0">
          <div className="px-2 py-1 bg-red-100 text-red-700 text-xs font-medium rounded-full">
            Overdue
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Add custom animation to Tailwind config
 * This should be added to tailwind.config.ts
 */
export const customAnimations = {
  shimmer: {
    '0%': { backgroundPosition: '-200% 0' },
    '100%': { backgroundPosition: '200% 0' },
  },
}
