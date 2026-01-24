/**
 * Timeline Utility Functions
 *
 * Helper functions for Gantt chart calculations and transformations
 */

import type { GanttTask, TimelineViewMode } from '../../types/timeline.types'

// Basic JobCardData type definition
type JobCardStatus = 'draft' | 'queued' | 'in_progress' | 'parts_waiting' | 'quality_check' | 'ready' | 'delivered' | 'cancelled'

type JobCardData = {
  id: string
  jobType: string
  priority: string
  status: JobCardStatus
  promisedDate?: string
  promisedTime?: string
  createdAt: string
  updatedAt: string
  [key: string]: any // Allow other properties
}

/**
 * Get date range for a given view mode
 */
export function getViewDateRange(viewMode: TimelineViewMode, currentDate: Date): { start: Date; end: Date } {
  const start = new Date(currentDate)
  const end = new Date(currentDate)

  switch (viewMode) {
    case 'day':
      // Single day view
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break

    case 'week':
      // Week view (Monday to Sunday)
      const dayOfWeek = start.getDay()
      const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break

    case 'month':
      // Full month view - from 1st to last day of month
      const originalMonth = currentDate.getMonth()
      const originalYear = currentDate.getFullYear()

      start.setDate(1)
      start.setHours(0, 0, 0, 0)

      // Move to next month and set to 0 to get last day of current month
      end.setMonth(end.getMonth() + 1)
      end.setDate(0) // Last day of current month
      end.setHours(23, 59, 59, 999)

      // Verify calculation
      const endMonth = end.getMonth()
      const calculatedLastDay = end.getDate()

      console.log('📅 Month view date range:', {
        viewMode,
        originalInput: currentDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        originalMonth,
        originalYear,
        start: start.toISOString(),
        startDisplay: start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        end: end.toISOString(),
        endDisplay: end.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        endMonth,
        calculatedLastDay,
        totalDays: Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1,
      })
      break
  }

  return { start, end }
}

/**
 * Filter tasks by date range
 */
export function filterTasksByDateRange(tasks: GanttTask[], startDate: Date, endDate: Date): GanttTask[] {
  return tasks.filter((task) => {
    const taskStart = new Date(task.start)
    const taskEnd = new Date(task.end)

    // Task overlaps with date range if:
    // - Task starts before or within range AND
    // - Task ends after or within range
    return taskStart <= endDate && taskEnd >= startDate
  })
}

/**
 * Group tasks by date (for calendar-like views)
 */
export function groupTasksByDate(tasks: GanttTask[]): Map<string, GanttTask[]> {
  const grouped = new Map<string, GanttTask[]>()

  tasks.forEach((task) => {
    const taskStart = new Date(task.start)
    const dateKey = taskStart.toISOString().split('T')[0]

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }

    grouped.get(dateKey)!.push(task)
  })

  return grouped
}

/**
 * Calculate timeline column width based on view mode
 */
export function getTimelineColumnWidth(viewMode: TimelineViewMode): number {
  switch (viewMode) {
    case 'day':
      return 40 // Pixels per hour
    case 'week':
      return 150 // Pixels per day
    case 'month':
      return 50 // Pixels per day
    default:
      return 100
  }
}

/**
 * Calculate total timeline width
 * Uses local calendar days, not UTC days, to avoid timezone issues
 */
export function calculateTimelineWidth(viewMode: TimelineViewMode, startDate: Date, endDate: Date): number {
  const columnWidth = getTimelineColumnWidth(viewMode)

  // Calculate using local calendar dates to avoid timezone offset issues
  const startLocal = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate())
  const endLocal = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate())

  // Calculate the difference in whole local days
  const diffTime = endLocal.getTime() - startLocal.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))

  // Add 1 to include both start and end dates
  const totalDays = diffDays + 1

  console.log('📐 Timeline width calculation:', {
    viewMode,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    startLocal: startLocal.toISOString(),
    endLocal: endLocal.toISOString(),
    diffDays,
    totalDays,
    columnWidth,
    calculatedWidth: totalDays * columnWidth,
  })

  return totalDays * columnWidth
}

/**
 * Check if task is overdue
 */
export function isTaskOverdue(task: GanttTask): boolean {
  const now = new Date()
  const endDate = new Date(task.end)

  return endDate < now && task.progress < 100
}

/**
 * Get tasks that are due soon (within next 3 days)
 */
export function getTasksDueSoon(tasks: GanttTask[]): GanttTask[] {
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  return tasks.filter((task) => {
    const endDate = new Date(task.end)
    return endDate > now && endDate <= threeDaysFromNow && task.progress < 100
  })
}

/**
 * Calculate task progress statistics
 */
export function calculateProgressStats(tasks: GanttTask[]): {
  total: number
  completed: number
  inProgress: number
  notStarted: number
  averageProgress: number
} {
  const completed = tasks.filter((t) => t.progress === 100).length
  const inProgress = tasks.filter((t) => t.progress > 0 && t.progress < 100).length
  const notStarted = tasks.filter((t) => t.progress === 0).length

  const totalProgress = tasks.reduce((sum, task) => sum + task.progress, 0)
  const averageProgress = tasks.length > 0 ? totalProgress / tasks.length : 0

  return {
    total: tasks.length,
    completed,
    inProgress,
    notStarted,
    averageProgress: Math.round(averageProgress),
  }
}

/**
 * Sort tasks by priority and status
 */
export function sortTasksByPriority(tasks: GanttTask[]): GanttTask[] {
  const priorityOrder: Record<string, number> = {
    urgent: 0,
    high: 1,
    medium: 2,
    low: 3,
  }

  return [...tasks].sort((a, b) => {
    // Extract priority from task metadata (assuming it's encoded in the task)
    const aPriority = extractTaskPriority(a)
    const bPriority = extractTaskPriority(b)

    const priorityDiff = priorityOrder[aPriority] - priorityOrder[bPriority]
    if (priorityDiff !== 0) return priorityDiff

    // If same priority, sort by end date
    return new Date(a.end).getTime() - new Date(b.end).getTime()
  })
}

/**
 * Extract priority from task (helper function)
 * This would need to be enhanced if priority is stored elsewhere
 */
function extractTaskPriority(task: GanttTask): string {
  // For now, try to extract from task name or color
  // In a real implementation, this would come from the job card data
  if (task.color === '#EF4444') return 'urgent' // red
  if (task.color === '#F59E0B') return 'high' // amber
  if (task.color === '#3B82F6') return 'medium' // blue
  return 'low'
}

/**
 * Format date for display
 */
export function formatTimelineDate(date: Date, viewMode: TimelineViewMode): string {
  let options: Intl.DateTimeFormatOptions

  switch (viewMode) {
    case 'day':
      options = { hour: 'numeric', hour12: true }
      break
    case 'week':
      options = { weekday: 'short', month: 'short', day: 'numeric' }
      break
    case 'month':
      options = { month: 'short', day: 'numeric' }
      break
    default:
      options = { month: 'short', day: 'numeric' }
  }

  return date.toLocaleDateString('en-US', options)
}

/**
 * Calculate task position and width for rendering
 */
export function calculateTaskGeometry(
  task: GanttTask,
  viewStartDate: Date,
  columnWidth: number
): { left: number; width: number } {
  const taskStart = new Date(task.start)
  const taskEnd = new Date(task.end)

  const daysFromStart = Math.floor((taskStart.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24))
  const durationDays = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))

  return {
    left: daysFromStart * columnWidth,
    width: durationDays * columnWidth,
  }
}
