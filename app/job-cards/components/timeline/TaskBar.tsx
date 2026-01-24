/**
 * TaskBar Component
 *
 * Enhanced individual task bar for the Gantt chart
 * Displays job card information, progress, and quick actions
 */

'use client'

import React, { memo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, User, Wrench, DollarSign, AlertTriangle } from 'lucide-react'
import type { GanttTask } from '../../types/timeline.types'

interface TaskBarProps {
  task: GanttTask
  style?: React.CSSProperties
  onClick?: (taskId: string) => void
  showDetailed?: boolean
}

function TaskBarComponent({ task, style, onClick, showDetailed = false }: TaskBarProps) {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const handleClick = () => {
    if (onClick) {
      onClick(task.id)
    } else {
      router.push(`/job-cards/${task.id}`)
    }
  }

  const isOverdue = new Date(task.end) < new Date() && task.progress < 100
  const isCompleted = task.progress === 100
  const isHighPriority = task.priority === 'urgent' || task.priority === 'high'

  console.log('📦 Rendering TaskBar:', {
    jobCardNumber: task.jobCardNumber,
    vehicle: `${task.vehicleMake} ${task.vehicleModel}`,
    customer: task.customerName,
    priority: task.priority,
    status: task.status,
    progress: task.progress,
  })

  return (
    <div
      className={`
        relative rounded-lg shadow-sm cursor-pointer
        transition-all duration-200 overflow-hidden
        hover:shadow-md hover:scale-[1.02] active:scale-[0.98]
        ${task.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isOverdue && !isCompleted ? 'ring-2 ring-red-500' : ''}
      `}
      style={{
        ...style,
        backgroundColor: task.color,
        minHeight: '40px',
      }}
      onClick={task.disabled ? undefined : handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      role="button"
      tabIndex={0}
      aria-label={`View job card ${task.jobCardNumber}`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick()
        }
      }}
    >
      {/* Background Progress Bar */}
      {task.progress > 0 && (
        <div
          className="absolute top-0 left-0 h-full bg-white/20 transition-all duration-300"
          style={{ width: `${task.progress}%` }}
        />
      )}

      {/* Task Content */}
      <div className="absolute inset-0 flex items-center px-2 md:px-3 gap-2">
        {/* Priority Indicator */}
        {isHighPriority && (
          <div className="flex-shrink-0">
            <AlertTriangle className="h-3.5 w-3.5 md:h-4 md:w-4 text-yellow-300" fill="currentColor" />
          </div>
        )}

        {/* Task Info */}
        <div className="flex-1 min-w-0">
          {/* Job Card Number & Vehicle */}
          <div className="flex items-center gap-1.5 md:gap-2">
            <span className="text-xs font-bold text-white truncate" title={task.jobCardNumber}>
              {task.jobCardNumber}
            </span>
            {showDetailed && (
              <>
                <span className="hidden sm:inline text-xs text-white/90 truncate">
                  {task.vehicleMake} {task.vehicleModel}
                </span>
              </>
            )}
          </div>

          {/* Customer Name - Always show on desktop, conditionally on mobile */}
          <div className={`${showDetailed ? 'block' : 'hidden md:block'} text-xs text-white/80 truncate`}>
            {task.customerName}
          </div>
        </div>

        {/* Progress & Status */}
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          {/* Progress */}
          {task.progress > 0 && (
            <div className="flex items-center gap-1 text-white text-xs font-medium">
              <Clock className="h-3 w-3" />
              <span className="hidden sm:inline">{task.progress}%</span>
            </div>
          )}

          {/* Cost - Desktop only */}
          {showDetailed && task.estimatedCost > 0 && (
            <div className="hidden lg:flex items-center gap-1 text-white text-xs">
              <DollarSign className="h-3 w-3" />
              <span>
                {new Intl.NumberFormat('en-IN', {
                  style: 'currency',
                  currency: 'INR',
                  maximumFractionDigits: 0,
                }).format(task.estimatedCost)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Overdue Badge */}
      {isOverdue && !isCompleted && (
        <div className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center animate-pulse">
          <AlertTriangle className="h-2.5 w-2.5 text-white" fill="currentColor" />
        </div>
      )}

      {/* Hover Overlay */}
      {isHovered && !task.disabled && (
        <div className="absolute inset-0 bg-white/10 transition-opacity duration-200" />
      )}
    </div>
  )
}

/**
 * Memoized TaskBar component
 * Only re-renders when task.id or progress changes
 */
export const TaskBar = memo(TaskBarComponent, (prevProps, nextProps) => {
  return (
    prevProps.task.id === nextProps.task.id &&
    prevProps.task.progress === nextProps.task.progress &&
    prevProps.showDetailed === nextProps.showDetailed
  )
})

TaskBar.displayName = 'TaskBar'

/**
 * TaskBarTooltip Component
 *
 * Enhanced tooltip showing detailed task information
 */
interface TaskBarTooltipProps {
  task: GanttTask
  children: React.ReactNode
}

function TaskBarTooltipComponent({ task, children }: TaskBarTooltipProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setPosition({
      x: rect.left,
      y: rect.bottom + 8,
    })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const duration = Math.ceil(
    (new Date(task.end).getTime() - new Date(task.start).getTime()) / (1000 * 60 * 60 * 24)
  )

  const isOverdue = new Date(task.end) < new Date() && task.progress < 100

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          className="fixed z-50 bg-gray-900 text-white rounded-lg shadow-xl max-w-sm overflow-hidden"
          style={{ left: `${Math.min(position.x, window.innerWidth - 350)}px`, top: `${position.y}px` }}
        >
          {/* Header */}
          <div className="px-4 py-3 border-b border-gray-700">
            <div className="font-semibold text-sm mb-1">{task.jobCardNumber}</div>
            <div className="text-xs text-gray-300">{task.vehicleMake} {task.vehicleModel}</div>
          </div>

          {/* Details */}
          <div className="p-4 space-y-2">
            {/* Customer */}
            <div className="flex items-center gap-2 text-sm">
              <User className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="text-gray-300">{task.customerName}</span>
            </div>

            {/* Dates */}
            <div className="space-y-1 text-xs text-gray-300">
              <div className="flex justify-between">
                <span className="text-gray-400">Start:</span>
                <span>{new Date(task.start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Due:</span>
                <span className={isOverdue ? 'text-red-400 font-medium' : ''}>
                  {new Date(task.end).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Duration:</span>
                <span>{duration} day{duration !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-400">Progress</span>
                <span className="font-medium">{task.progress}%</span>
              </div>
              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-gray-500 to-gray-400 transition-all duration-300"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center justify-between pt-2 border-t border-gray-700">
              <div className="flex items-center gap-1.5 text-xs">
                <span className={`px-2 py-0.5 rounded-md font-medium border ${getStatusStyles(task.status)}`}>
                  {task.status.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                <span className={`px-2 py-0.5 rounded-md font-medium border ${getPriorityStyles(task.priority)}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
              </div>
            </div>
          </div>

          {/* Footer with cost */}
          {task.estimatedCost > 0 && (
            <div className="px-4 py-2 bg-gray-800 border-t border-gray-700">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-400">Estimated:</span>
                <span className="font-medium text-white">
                  {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0,
                  }).format(task.estimatedCost)}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function getStatusStyles(status: string): string {
  const styles: Record<string, string> = {
    draft: 'bg-gray-600 text-gray-200 border-gray-500',
    queued: 'bg-gray-500 text-gray-200 border-gray-400',
    in_progress: 'bg-blue-600 text-blue-100 border-blue-500',
    parts_waiting: 'bg-yellow-600 text-yellow-100 border-yellow-500',
    quality_check: 'bg-purple-600 text-purple-100 border-purple-500',
    ready: 'bg-green-600 text-green-100 border-green-500',
    delivered: 'bg-gray-500 text-gray-200 border-gray-400',
    cancelled: 'bg-red-600 text-red-100 border-red-500',
  }
  return styles[status] || styles.draft
}

function getPriorityStyles(priority: string): string {
  const styles: Record<string, string> = {
    urgent: 'bg-red-600 text-red-100 border-red-500',
    high: 'bg-orange-600 text-orange-100 border-orange-500',
    medium: 'bg-yellow-600 text-yellow-100 border-yellow-500',
    low: 'bg-gray-500 text-gray-200 border-gray-400',
  }
  return styles[priority] || styles.medium
}

/**
 * Memoized TaskBarTooltip component
 */
export const TaskBarTooltip = memo(TaskBarTooltipComponent)

TaskBarTooltip.displayName = 'TaskBarTooltip'
