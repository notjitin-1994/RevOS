/**
 * Calendar Utility Functions
 *
 * Helper functions for calendar view calculations and transformations
 */

import type { CalendarEvent, CalendarViewMode } from '../../types/calendar.types'
import type { JobCardData } from '@/lib/supabase/job-card-queries'

/**
 * Get calendar view date range
 * Returns the start and end dates for the current calendar view
 */
export function getCalendarViewRange(viewMode: CalendarViewMode, currentDate: Date): { start: Date; end: Date } {
  const start = new Date(currentDate)
  const end = new Date(currentDate)

  switch (viewMode) {
    case 'dayGridMonth':
      // Month view - first day to last day of month
      start.setDate(1)
      start.setHours(0, 0, 0, 0)
      end.setMonth(end.getMonth() + 1)
      end.setDate(0)
      end.setHours(23, 59, 59, 999)
      break

    case 'timeGridWeek':
      // Week view - Monday to Sunday
      const dayOfWeek = start.getDay()
      const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
      start.setDate(diff)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break

    case 'timeGridDay':
      // Day view - single day
      start.setHours(0, 0, 0, 0)
      end.setHours(23, 59, 59, 999)
      break

    case 'listWeek':
      // List week - same as week view
      const listDayOfWeek = start.getDay()
      const listDiff = start.getDate() - listDayOfWeek + (listDayOfWeek === 0 ? -6 : 1)
      start.setDate(listDiff)
      start.setHours(0, 0, 0, 0)
      end.setDate(start.getDate() + 6)
      end.setHours(23, 59, 59, 999)
      break
  }

  return { start, end }
}

/**
 * Check if a date is in the past
 */
export function isPastDate(date: Date): boolean {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return date < today
}

/**
 * Check if a date is today
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
 * Check if a date is in the future
 */
export function isFutureDate(date: Date): boolean {
  const today = new Date()
  today.setHours(23, 59, 59, 999)
  return date > today
}

/**
 * Calculate the number of days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const oneDay = 24 * 60 * 60 * 1000
  const diffDays = Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDay))
  return diffDays
}

/**
 * Add days to a date
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Subtract days from a date
 */
export function subtractDays(date: Date, days: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() - days)
  return result
}

/**
 * Add weeks to a date
 */
export function addWeeks(date: Date, weeks: number): Date {
  const result = new Date(date)
  result.setDate(result.getDate() + weeks * 7)
  return result
}

/**
 * Add months to a date
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Get the week number for a date
 */
export function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1)
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7)
}

/**
 * Get all dates in a week
 */
export function getWeekDates(date: Date): Date[] {
  const dates: Date[] = []
  const start = new Date(date)
  const dayOfWeek = start.getDay()
  const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  start.setDate(diff)

  for (let i = 0; i < 7; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    dates.push(d)
  }

  return dates
}

/**
 * Get all dates in a month
 */
export function getMonthDates(date: Date): Date[] {
  const dates: Date[] = []
  const year = date.getFullYear()
  const month = date.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  for (let day = 1; day <= daysInMonth; day++) {
    dates.push(new Date(year, month, day))
  }

  return dates
}

/**
 * Format date for display
 */
export function formatDate(date: Date, format: 'short' | 'medium' | 'long' = 'medium'): string {
  switch (format) {
    case 'short':
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    case 'medium':
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
    case 'long':
      return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })
  }
}

/**
 * Format time for display
 */
export function formatTime(date: Date): string {
  return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
}

/**
 * Get date range text (e.g., "Jan 1 - Jan 7, 2026")
 */
export function getDateRangeText(startDate: Date, endDate: Date): string {
  const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' })
  const startDay = startDate.getDate()
  const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' })
  const endDay = endDate.getDate()
  const year = startDate.getFullYear()

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`
  }
}

/**
 * Filter job cards by promised date
 */
export function filterJobCardsByDate(jobCards: JobCardData[], startDate: Date, endDate: Date): JobCardData[] {
  return jobCards.filter((jobCard) => {
    const promisedDate = jobCard.promisedDate ? new Date(jobCard.promisedDate) : null

    if (!promisedDate) {
      return false
    }

    return promisedDate >= startDate && promisedDate <= endDate
  })
}

/**
 * Sort job cards by promised date
 */
export function sortJobCardsByDate(jobCards: JobCardData[], order: 'asc' | 'desc' = 'asc'): JobCardData[] {
  return [...jobCards].sort((a, b) => {
    const dateA = a.promisedDate ? new Date(a.promisedDate).getTime() : 0
    const dateB = b.promisedDate ? new Date(b.promisedDate).getTime() : 0

    return order === 'asc' ? dateA - dateB : dateB - dateA
  })
}

/**
 * Get overdue job cards
 */
export function getOverdueJobCards(jobCards: JobCardData[]): JobCardData[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return jobCards.filter((jobCard) => {
    if (!jobCard.promisedDate || jobCard.status === 'delivered' || jobCard.status === 'cancelled') {
      return false
    }

    const promisedDate = new Date(jobCard.promisedDate)
    return promisedDate < today
  })
}

/**
 * Get upcoming job cards (within next N days)
 */
export function getUpcomingJobCards(jobCards: JobCardData[], days: number = 7): JobCardData[] {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const futureDate = new Date(today)
  futureDate.setDate(futureDate.getDate() + days)

  return jobCards.filter((jobCard) => {
    if (!jobCard.promisedDate || jobCard.status === 'delivered' || jobCard.status === 'cancelled') {
      return false
    }

    const promisedDate = new Date(jobCard.promisedDate)
    return promisedDate >= today && promisedDate <= futureDate
  })
}

/**
 * Calculate load for a given day (number of job cards)
 */
export function calculateDayLoad(jobCards: JobCardData[], date: Date): number {
  const dateStr = date.toISOString().split('T')[0]

  return jobCards.filter((jobCard) => {
    if (!jobCard.promisedDate) {
      return false
    }

    const promisedDateStr = new Date(jobCard.promisedDate).toISOString().split('T')[0]
    return promisedDateStr === dateStr
  }).length
}

/**
 * Get calendar statistics
 */
export function getCalendarStats(jobCards: JobCardData[]): {
  total: number
  overdue: number
  upcoming: number
  completed: number
  byPriority: Record<string, number>
  byStatus: Record<string, number>
} {
  const overdue = getOverdueJobCards(jobCards).length
  const upcoming = getUpcomingJobCards(jobCards, 7).length
  const completed = jobCards.filter((jc) => jc.status === 'delivered').length

  const byPriority: Record<string, number> = {}
  const byStatus: Record<string, number> = {}

  jobCards.forEach((jobCard) => {
    // Count by priority
    byPriority[jobCard.priority] = (byPriority[jobCard.priority] || 0) + 1

    // Count by status
    byStatus[jobCard.status] = (byStatus[jobCard.status] || 0) + 1
  })

  return {
    total: jobCards.length,
    overdue,
    upcoming,
    completed,
    byPriority,
    byStatus,
  }
}

/**
 * Check if two dates are the same day
 */
export function isSameDay(date1: Date, date2: Date): boolean {
  return (
    date1.getDate() === date2.getDate() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getFullYear() === date2.getFullYear()
  )
}

/**
 * Get the start of the week for a given date
 */
export function getStartOfWeek(date: Date): Date {
  const start = new Date(date)
  const dayOfWeek = start.getDay()
  const diff = start.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)
  start.setDate(diff)
  start.setHours(0, 0, 0, 0)
  return start
}

/**
 * Get the end of the week for a given date
 */
export function getEndOfWeek(date: Date): Date {
  const end = getStartOfWeek(date)
  end.setDate(end.getDate() + 6)
  end.setHours(23, 59, 59, 999)
  return end
}
