/**
 * Calendar Types
 *
 * Type definitions for the Calendar view components
 * Integrates with @fullcalendar/react library
 */

import type { JobCardViewData } from './job-card-view.types'

/**
 * Calendar view modes supported
 */
export type CalendarViewMode = 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay' | 'listWeek'

/**
 * FullCalendar event interface
 * Extends the standard FullCalendar EventInput with our custom data
 */
export interface CalendarEvent {
  id: string
  title: string
  start: string | Date
  end?: string | Date
  allDay?: boolean
  backgroundColor?: string
  borderColor?: string
  textColor?: string
  extendedProps: CalendarEventExtendedProps
}

/**
 * Extended properties for calendar events
 */
export interface CalendarEventExtendedProps {
  jobCard: JobCardViewData
  priority: string
  status: string
  customerName: string
  vehicleMake: string
  vehicleModel: string
  vehicleLicensePlate: string
  leadMechanicId: string | null
}

/**
 * Calendar drop event
 * Fired when an event is dropped on a new date
 */
export interface CalendarDropEvent {
  eventId: string
  newStartDate: Date
  newEndDate?: Date
  allDay: boolean
}

/**
 * Calendar resize event
 * Fired when an event is resized
 */
export interface CalendarResizeEvent {
  eventId: string
  newStartDate: Date
  newEndDate: Date
}

/**
 * Date range for calendar queries
 */
export interface DateRange {
  start: Date
  end: Date
}

/**
 * Calendar toolbar props
 */
export interface CalendarToolbarProps {
  viewMode: CalendarViewMode
  onViewModeChange: (viewMode: CalendarViewMode) => void
  currentDate: Date
  onDateChange: (date: Date) => void
  onToday: () => void
  onPrev: () => void
  onNext: () => void
}

/**
 * Transform job card to calendar event
 */
export function jobCardToCalendarEvent(jobCard: JobCardViewData): CalendarEvent {
  // Use promisedDate as the event date, fallback to createdAt
  const eventDate = jobCard.promisedDate || jobCard.createdAt

  // Get colors based on priority and status
  const backgroundColor = getEventBackgroundColor(jobCard.priority)
  const borderColor = getEventBorderColor(jobCard.status)

  return {
    id: jobCard.id,
    title: `${jobCard.jobCardNumber} - ${jobCard.vehicleMake} ${jobCard.vehicleModel}`,
    start: eventDate,
    allDay: true, // Job cards are all-day events
    backgroundColor,
    borderColor,
    textColor: getEventTextColor(jobCard.priority),
    extendedProps: {
      jobCard,
      priority: jobCard.priority,
      status: jobCard.status,
      customerName: jobCard.customerName || 'Unknown',
      vehicleMake: jobCard.vehicleMake,
      vehicleModel: jobCard.vehicleModel,
      vehicleLicensePlate: jobCard.vehicleLicensePlate,
      leadMechanicId: jobCard.leadMechanicId,
    },
  }
}

/**
 * Get event background color based on priority
 */
function getEventBackgroundColor(priority: string): string {
  const colorMap: Record<string, string> = {
    urgent: 'rgba(55, 65, 81, 0.8)', // graphite-700 with opacity
    high: 'rgba(75, 85, 99, 0.8)', // graphite-600 with opacity
    medium: 'rgba(107, 114, 128, 0.8)', // graphite-500 with opacity
    low: 'rgba(156, 163, 175, 0.8)', // graphite-400 with opacity
  }

  return colorMap[priority] || colorMap.medium
}

/**
 * Get event border color based on status
 */
function getEventBorderColor(status: string): string {
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
 * Get event text color (for contrast)
 */
function getEventTextColor(priority: string): string {
  // Use white text for all priority levels for consistency
  return '#FFFFFF'
}

/**
 * Group events by date
 */
export function groupEventsByDate(events: CalendarEvent[]): Map<string, CalendarEvent[]> {
  const grouped = new Map<string, CalendarEvent[]>()

  events.forEach((event) => {
    const date = new Date(event.start)
    const dateKey = date.toISOString().split('T')[0]

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, [])
    }

    grouped.get(dateKey)!.push(event)
  })

  return grouped
}

/**
 * Get events for a specific date range
 */
export function getEventsInRange(events: CalendarEvent[], start: Date, end: Date): CalendarEvent[] {
  return events.filter((event) => {
    const eventStart = new Date(event.start)
    return eventStart >= start && eventStart <= end
  })
}

/**
 * Count events by status
 */
export function countEventsByStatus(events: CalendarEvent[]): Record<string, number> {
  const counts: Record<string, number> = {}

  events.forEach((event) => {
    const status = event.extendedProps.status
    counts[status] = (counts[status] || 0) + 1
  })

  return counts
}

/**
 * Count events by priority
 */
export function countEventsByPriority(events: CalendarEvent[]): Record<string, number> {
  const counts: Record<string, number> = {}

  events.forEach((event) => {
    const priority = event.extendedProps.priority
    counts[priority] = (counts[priority] || 0) + 1
  })

  return counts
}

/**
 * Check if date is today
 */
export function isToday(date: Date): boolean {
  const today = new Date()
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  )
}

/**
 * Format date for calendar display
 */
export function formatCalendarDate(date: Date, format: 'short' | 'long' | 'full' = 'short'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'long':
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
    case 'full':
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }
}

/**
 * Get week start and end dates
 */
export function getWeekRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date)
  const end = new Date(date)

  // Set to Monday (or Sunday if week starts on Sunday)
  const dayOfWeek = start.getDay()
  const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)

  // Set to Sunday
  end.setDate(start.getDate() + 6)
  end.setHours(23, 59, 59, 999)

  return { start, end }
}

/**
 * Get month start and end dates
 */
export function getMonthRange(date: Date): { start: Date; end: Date } {
  const start = new Date(date.getFullYear(), date.getMonth(), 1)
  const end = new Date(date.getFullYear(), date.getMonth() + 1, 0)

  return { start, end }
}
