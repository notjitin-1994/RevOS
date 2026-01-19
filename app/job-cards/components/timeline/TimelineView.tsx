/**
 * TimelineView Component
 *
 * Main Timeline/Gantt view for job cards
 * Displays job cards as tasks on a timeline with drag-and-drop support
 */

'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { JobCardViewData } from '../../types/job-card-view.types'
import type { TimelineViewMode, GanttTask } from '../../types/timeline.types'
import { jobCardToGanttTask, calculateTaskDuration, validateTaskDates } from '../../types/timeline.types'
import { getViewDateRange, getTimelineColumnWidth, calculateTimelineWidth, sortTasksByPriority, isTaskOverdue, getTasksDueSoon } from '../../lib/utils/timeline-utils'
import { TimelineHeader } from './TimelineHeader'
import { TaskBar, TaskBarTooltip } from './TaskBar'
import { useUpdateJobCard } from '../../hooks/use-job-card-mutations'

interface TimelineViewProps {
  jobCards: JobCardViewData[]
  garageId: string
  isLoading?: boolean
}

export function TimelineView({ jobCards, garageId, isLoading = false }: TimelineViewProps) {
  const router = useRouter()
  const updateJobCard = useUpdateJobCard()

  // State
  const [viewMode, setViewMode] = useState<TimelineViewMode>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Transform job cards to Gantt tasks
  const tasks = useMemo(() => {
    return jobCards.map(jobCardToGanttTask)
  }, [jobCards])

  // Get date range for current view
  const { start: viewStartDate, end: viewEndDate } = useMemo(
    () => getViewDateRange(viewMode, currentDate),
    [viewMode, currentDate]
  )

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    const sorted = sortTasksByPriority(tasks)
    return sorted
  }, [tasks])

  // Calculate timeline dimensions
  const columnWidth = getTimelineColumnWidth(viewMode)
  const timelineWidth = useMemo(
    () => calculateTimelineWidth(viewMode, viewStartDate, viewEndDate),
    [viewMode, viewStartDate, viewEndDate]
  )

  // Statistics
  const stats = useMemo(() => {
    const overdue = filteredTasks.filter(isTaskOverdue).length
    const dueSoon = getTasksDueSoon(filteredTasks).length
    const completed = filteredTasks.filter((t) => t.progress === 100).length

    return {
      total: filteredTasks.length,
      overdue,
      dueSoon,
      completed,
    }
  }, [filteredTasks])

  // Handle task click
  const handleTaskClick = (taskId: string) => {
    router.push(`/job-cards/${taskId}`)
  }

  // Handle task drag (simplified - just updates date)
  const handleTaskDateChange = async (taskId: string, newStartDate: Date, newEndDate: Date) => {
    if (!validateTaskDates(newStartDate, newEndDate)) {
      console.error('Invalid task dates')
      return
    }

    try {
      await updateJobCard.mutateAsync({
        jobCardId: taskId,
        updates: {
          promisedDate: newEndDate.toISOString().split('T')[0],
        },
      })
    } catch (error) {
      console.error('Failed to update task date:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600">Loading timeline...</p>
        </div>
      </div>
    )
  }

  if (filteredTasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No job cards to display</h3>
          <p className="text-gray-600">
            Create some job cards to see them on the timeline
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-4 md:p-6">
      {/* Header */}
      <TimelineHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
      />

      {/* Statistics - Responsive Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 md:gap-4 mb-6">
        <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
          <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Total Jobs</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>

        <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
          <p className="text-xs font-medium uppercase tracking-wider text-graphite-700 mb-1">Due Soon</p>
          <p className="text-2xl font-bold text-graphite-700">{stats.dueSoon}</p>
        </div>

        <div className="bg-gray-300 rounded-lg p-3 border border-gray-400">
          <p className="text-xs font-medium uppercase tracking-wider text-graphite-900 mb-1">Overdue</p>
          <p className="text-2xl font-bold text-graphite-900">{stats.overdue}</p>
        </div>

        <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
          <p className="text-xs font-medium uppercase tracking-wider text-graphite-700 mb-1">Completed</p>
          <p className="text-2xl font-bold text-graphite-700">{stats.completed}</p>
        </div>
      </div>

      {/* Timeline - Mobile and Desktop Optimized */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Scrollable Container for Header and Tasks */}
        <div className="overflow-x-auto scrollbar-hide md:overflow-x-scroll touch-pan-x">
          <div style={{ width: `${timelineWidth}px`, minWidth: '100%' }}>
            {/* Date Header */}
            <div className="bg-gray-50 border-b border-gray-300">
              <div className="flex">
                {Array.from({ length: Math.ceil((viewEndDate.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24)) + 1 }).map((_, index) => {
                  const date = new Date(viewStartDate)
                  date.setDate(date.getDate() + index)

                  return (
                    <div
                      key={index}
                      className="flex-shrink-0 px-2 md:px-3 py-2 text-center border-r border-gray-200 last:border-r-0"
                      style={{ width: `${columnWidth}px` }}
                    >
                      <div className="text-xs font-medium text-gray-700">
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className="text-base md:text-lg font-bold text-gray-900">{date.getDate()}</div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Tasks - Vertically Scrollable */}
            <div className="p-2 md:p-4 space-y-2 md:space-y-3 max-h-[50vh] md:max-h-[600px] overflow-y-auto">
              {filteredTasks.map((task, index) => {
                const taskStart = new Date(task.start)
                const daysFromStart = Math.floor((taskStart.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24))
                const duration = calculateTaskDuration(task.start, task.end)
                const left = Math.max(0, daysFromStart * columnWidth)
                const width = duration * columnWidth

                return (
                  <div key={task.id} className="relative h-10 md:h-12">
                    <TaskBarTooltip task={task}>
                      <TaskBar
                        task={task}
                        style={{
                          left: `${left}px`,
                          width: `${Math.min(width, timelineWidth - left)}px`,
                        }}
                        onClick={handleTaskClick}
                      />
                    </TaskBarTooltip>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Legend - Responsive */}
      <div className="mt-6">
        {/* Mobile: Grid layout */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-graphite-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Queued</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-graphite-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-graphite-700 flex-shrink-0" />
            <span className="text-sm text-gray-700">Parts Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-graphite-800 flex-shrink-0" />
            <span className="text-sm text-gray-700">Quality Check</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-graphite-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">Ready</span>
          </div>
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span className="text-gray-700">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-graphite-500" />
            <span className="text-gray-700">Queued</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-graphite-600" />
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-graphite-700" />
            <span className="text-gray-700">Parts Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-graphite-800" />
            <span className="text-gray-700">Quality Check</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-graphite-600" />
            <span className="text-gray-700">Ready</span>
          </div>
        </div>
      </div>
    </div>
  )
}
