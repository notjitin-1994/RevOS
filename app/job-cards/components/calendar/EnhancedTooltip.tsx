/**
 * EnhancedTooltip Component
 *
 * Rich tooltip with detailed event information
 * Shows status, progress, customer info, and quick actions
 */

'use client'

import React, { useState } from 'react'
import * as Popover from '@radix-ui/react-popover'
import { format } from 'date-fns'
import {
  Calendar,
  User,
  Car,
  AlertTriangle,
  CheckCircle2,
  Clock,
  MoreVertical,
  ExternalLink,
} from 'lucide-react'
import { StatusBadge } from '../shared/StatusBadge'
import { PriorityBadge } from '../shared/PriorityBadge'
import { getProgressPercentage, getProgressColor, isOverdue } from '../../lib/utils/color-coding'
import type { JobCardViewData } from '../../types/job-card-view.types'

interface EnhancedTooltipProps {
  children: React.ReactNode
  jobCard: JobCardViewData
  onEdit?: () => void
  onStatusChange?: (status: string) => void
}

/**
 * Enhanced tooltip with comprehensive job card information
 */
export function EnhancedTooltip({
  children,
  jobCard,
  onEdit,
  onStatusChange,
}: EnhancedTooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const progress = getProgressPercentage(jobCard.status)
  const progressColor = getProgressColor(progress)
  const overdue = isOverdue(jobCard.promisedDate, jobCard.status)

  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-80 bg-white rounded-xl shadow-xl border border-gray-200 p-4 animate-in fade-in-0 zoom-in-95 duration-200"
          sideOffset={8}
          align="start"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-gray-900 truncate">
                {jobCard.jobCardNumber}
              </h3>
              <p className="text-xs text-gray-500 truncate mt-0.5">
                {jobCard.vehicleMake} {jobCard.vehicleModel}
              </p>
            </div>
            <button
              onClick={() => window.open(`/job-cards/${jobCard.id}`, '_blank')}
              className="ml-2 p-1 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Open in new tab"
            >
              <ExternalLink className="h-4 w-4 text-gray-500" />
            </button>
          </div>

          {/* Status and Priority Badges */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <StatusBadge status={jobCard.status as any} size="sm" />
            <PriorityBadge priority={jobCard.priority as any} size="sm" />
            {overdue && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-red-600 bg-red-50 rounded-full border border-red-200">
                <AlertTriangle className="h-3 w-3" />
                Overdue
              </span>
            )}
          </div>

          {/* Progress Bar */}
          {progress > 0 && progress < 100 && (
            <div className="mb-3">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-medium text-gray-700">Progress</span>
                <span className="text-xs font-semibold text-gray-900">{progress}%</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full transition-all duration-500 ease-out"
                  style={{
                    width: `${progress}%`,
                    backgroundColor: progressColor,
                  }}
                />
              </div>
            </div>
          )}

          {/* Details */}
          <div className="space-y-2 mb-4">
            {/* Customer */}
            {jobCard.customerName && (
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700 font-medium truncate">
                  {jobCard.customerName}
                </span>
              </div>
            )}

            {/* Vehicle */}
            {(jobCard.vehicleLicensePlate || jobCard.vehicleMake) && (
              <div className="flex items-center gap-2 text-xs">
                <Car className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">
                  {jobCard.vehicleMake} {jobCard.vehicleModel}
                  {jobCard.vehicleLicensePlate && ` (${jobCard.vehicleLicensePlate})`}
                </span>
              </div>
            )}

            {/* Promised Date */}
            {jobCard.promisedDate && (
              <div className="flex items-center gap-2 text-xs">
                <Calendar className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className={`font-medium ${overdue ? 'text-red-600' : 'text-gray-700'}`}>
                  {format(new Date(jobCard.promisedDate), 'MMM d, yyyy')}
                  {overdue && ' (Overdue)'}
                </span>
              </div>
            )}

            {/* Lead Mechanic */}
            {(jobCard as any).leadMechanicName && (
              <div className="flex items-center gap-2 text-xs">
                <User className="h-3.5 w-3.5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">{(jobCard as any).leadMechanicName}</span>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            <button
              onClick={() => {
                onEdit?.()
                setIsOpen(false)
              }}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              View Details
            </button>

            {onStatusChange && jobCard.status !== 'delivered' && (
              <button
                onClick={() => {
                  onStatusChange('delivered')
                  setIsOpen(false)
                }}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-green-500 hover:bg-green-600 rounded-lg transition-colors"
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                Complete
              </button>
            )}
          </div>

          {/* Arrow */}
          <Popover.Arrow className="fill-white border border-gray-200" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

/**
 * Compact tooltip version for smaller screens
 */
interface CompactTooltipProps {
  children: React.ReactNode
  jobCard: JobCardViewData
}

export function CompactTooltip({ children, jobCard }: CompactTooltipProps) {
  const overdue = isOverdue(jobCard.promisedDate, jobCard.status)

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 w-64 bg-white rounded-lg shadow-lg border border-gray-200 p-3 animate-in fade-in-0 zoom-in-95 duration-150"
          sideOffset={5}
        >
          <div className="flex items-start gap-2 mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-xs font-bold text-gray-900 truncate">
                {jobCard.jobCardNumber}
              </h4>
              <p className="text-xs text-gray-600 truncate">
                {jobCard.vehicleMake} {jobCard.vehicleModel}
              </p>
            </div>
            {overdue && (
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
            )}
          </div>

          <div className="flex items-center gap-1.5 flex-wrap">
            <StatusBadge status={jobCard.status as any} size="sm" />
            <PriorityBadge priority={jobCard.priority as any} size="sm" />
          </div>

          <Popover.Arrow className="fill-white" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}

/**
 * Status indicator tooltip
 */
interface StatusTooltipProps {
  children: React.ReactNode
  status: string
  promisedDate: Date | string | null
}

export function StatusTooltip({ children, status, promisedDate }: StatusTooltipProps) {
  const overdue = isOverdue(promisedDate, status)

  return (
    <Popover.Root>
      <Popover.Trigger asChild>{children}</Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="z-50 bg-gray-900 text-white px-2.5 py-1.5 rounded-md text-xs shadow-lg animate-in fade-in-0 zoom-in-95 duration-150"
          sideOffset={5}
        >
          <div className="flex items-center gap-1.5">
            {overdue && <AlertTriangle className="h-3.5 w-3.5 text-red-400" />}
            <span className="font-medium">
              {status.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
            </span>
            {overdue && <span className="text-red-400">- Overdue</span>}
          </div>
          <Popover.Arrow className="fill-gray-900" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  )
}
