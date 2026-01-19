/**
 * Timeline/Gantt Chart Types
 *
 * Type definitions for the Timeline/Gantt view components
 * Integrates with react-modern-gantt library
 */

import type { JobCardViewData } from './job-card-view.types'

/**
 * Timeline view modes
 */
export type TimelineViewMode = 'day' | 'week' | 'month'

/**
 * Gantt task interface
 * Maps job card data to Gantt chart tasks
 */
export interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  dependencies: string[] // Array of task IDs this task depends on
  color: string
  disabled?: boolean
}

/**
 * Task dependency relationship
 */
export interface TaskDependency {
  from: string // Task ID
  to: string // Task ID
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
}

/**
 * Timeline update event
 * Fired when a task is dragged or resized in the timeline
 */
export interface TimelineUpdateEvent {
  taskId: string
  startDate: Date
  endDate: Date
  progress?: number
}

/**
 * Timeline column definition
 */
export interface TimelineColumn {
  id: string
  title: string
  width: number
}

/**
 * Timeline header props
 */
export interface TimelineHeaderProps {
  viewMode: TimelineViewMode
  onViewModeChange: (mode: TimelineViewMode) => void
  currentDate: Date
  onDateChange: (date: Date) => void
}

/**
 * Transform job card to Gantt task
 */
export function jobCardToGanttTask(jobCard: JobCardViewData): GanttTask {
  const startDate = new Date(jobCard.createdAt)
  const endDate = jobCard.promisedDate
    ? new Date(jobCard.promisedDate)
    : new Date(jobCard.createdAt)

  // Ensure end date is after start date
  if (endDate <= startDate) {
    endDate.setDate(endDate.getDate() + 1) // Default to 1 day duration
  }

  return {
    id: jobCard.id,
    name: `${jobCard.jobCardNumber} - ${jobCard.vehicleMake} ${jobCard.vehicleModel}`,
    start: startDate,
    end: endDate,
    progress: jobCard.progressPercentage || 0,
    dependencies: [], // Dependencies can be added later based on business logic
    color: getTaskColor(jobCard.status),
    disabled: jobCard.status === 'delivered' || jobCard.status === 'cancelled',
  }
}

/**
 * Get task color based on job card status
 */
function getTaskColor(status: string): string {
  const colorMap: Record<string, string> = {
    draft: '#9CA3AF', // gray-400
    queued: '#6B7280', // gray-500 (graphite-500 equivalent)
    in_progress: '#4B5563', // gray-600 (graphite-600)
    parts_waiting: '#374151', // gray-700 (graphite-700)
    quality_check: '#4B5563', // gray-600 (graphite-600)
    ready: '#6B7280', // gray-500 (graphite-500 equivalent)
    delivered: '#9CA3AF', // gray-400
    cancelled: '#D1D5DB', // gray-300
  }

  return colorMap[status] || '#9CA3AF'
}

/**
 * Calculate task duration in days
 */
export function calculateTaskDuration(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Validate task dates
 */
export function validateTaskDates(start: Date, end: Date): boolean {
  return end > start
}
