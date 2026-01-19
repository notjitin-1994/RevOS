/**
 * TaskBar Component
 *
 * Individual task bar in the Gantt chart
 * Displays job card information and progress
 */

'use client'

import React, { memo } from 'react'
import { useRouter } from 'next/navigation'
import { Clock, User } from 'lucide-react'
import type { GanttTask } from '../../types/timeline.types'

interface TaskBarProps {
  task: GanttTask
  style: React.CSSProperties
  onClick?: (taskId: string) => void
}

function TaskBarComponent({ task, style, onClick }: TaskBarProps) {
  const router = useRouter()

  const handleClick = () => {
    if (onClick) {
      onClick(task.id)
    } else {
      router.push(`/job-cards/${task.id}`)
    }
  }

  const isOverdue = new Date(task.end) < new Date() && task.progress < 100
  const isCompleted = task.progress === 100

  return (
    <div
      className={`
        absolute top-1.5 md:top-2 h-9 md:h-8 rounded-md shadow-sm cursor-pointer
        transition-all duration-200
        hover:shadow-md hover:scale-105
        active:scale-[0.98]
        flex items-center px-2 md:px-3 gap-1.5 md:gap-2 overflow-hidden
        ${task.disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${isOverdue && !isCompleted ? 'ring-2 ring-graphite-900' : ''}
      `}
      style={{
        ...style,
        backgroundColor: task.color,
      }}
      onClick={task.disabled ? undefined : handleClick}
      role="button"
      tabIndex={0}
      aria-label={`View job card ${task.name}`}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          handleClick()
        }
      }}
    >
      {/* Task Name */}
      <span className="text-xs font-medium text-white truncate flex-1" title={task.name}>
        {task.name}
      </span>

      {/* Progress Bar Overlay */}
      {task.progress > 0 && (
        <div
          className="absolute top-0 left-0 h-full bg-white/20"
          style={{ width: `${task.progress}%` }}
        />
      )}

      {/* Progress Indicator - Hide on very small screens */}
      {task.progress > 0 && (
        <div className="flex items-center gap-0.5 md:gap-1 text-white text-xs font-medium">
          <Clock className="h-2.5 w-2.5 md:h-3 md:w-3" />
          <span className="hidden sm:inline">{task.progress}%</span>
        </div>
      )}

      {/* Overdue Warning */}
      {isOverdue && !isCompleted && (
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-graphite-900 rounded-full animate-pulse" />
      )}
    </div>
  )
}

/**
 * Memoized TaskBar component
 * Only re-renders when task.id changes
 */
export const TaskBar = memo(TaskBarComponent, (prevProps, nextProps) => {
  return prevProps.task.id === nextProps.task.id
})

TaskBar.displayName = 'TaskBar'

/**
 * TaskBarTooltip Component
 *
 * Tooltip showing detailed task information
 */
interface TaskBarTooltipProps {
  task: GanttTask
  children: React.ReactNode
}

function TaskBarTooltipComponent({ task, children }: TaskBarTooltipProps) {
  const [isVisible, setIsVisible] = React.useState(false)
  const [position, setPosition] = React.useState({ x: 0, y: 0 })

  const handleMouseEnter = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setPosition({ x: rect.left, y: rect.bottom + 8 })
    setIsVisible(true)
  }

  const handleMouseLeave = () => {
    setIsVisible(false)
  }

  const duration = Math.ceil(
    (new Date(task.end).getTime() - new Date(task.start).getTime()) / (1000 * 60 * 60 * 24)
  )

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {children}

      {isVisible && (
        <div
          className="fixed z-50 bg-gray-900 text-white text-sm rounded-lg px-4 py-3 shadow-xl max-w-xs"
          style={{ left: `${position.x}px`, top: `${position.y}px` }}
        >
          <div className="font-semibold mb-2">{task.name}</div>

          <div className="space-y-1 text-xs text-gray-300">
            <div>
              <span className="font-medium">Start:</span>{' '}
              {new Date(task.start).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>

            <div>
              <span className="font-medium">End:</span>{' '}
              {new Date(task.end).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>

            <div>
              <span className="font-medium">Duration:</span> {duration} day
              {duration !== 1 ? 's' : ''}
            </div>

            <div>
              <span className="font-medium">Progress:</span> {task.progress}%
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-3 h-2 bg-gray-700 rounded-full overflow-hidden">
            <div
              className="h-full bg-graphite-400 transition-all"
              style={{ width: `${task.progress}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Memoized TaskBarTooltip component
 */
export const TaskBarTooltip = memo(TaskBarTooltipComponent)

TaskBarTooltip.displayName = 'TaskBarTooltip'
