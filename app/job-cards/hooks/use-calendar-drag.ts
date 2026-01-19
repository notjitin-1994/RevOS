/**
 * useCalendarDrag Hook
 *
 * Custom hook for handling drag-and-drop and resize events in the calendar view
 * Integrates with FullCalendar's event handling and updates job cards via mutations
 */

'use client'

import { useCallback } from 'react'
import { useUpdateJobCard } from './use-job-card-mutations'
import type { CalendarDropEvent, CalendarResizeEvent } from '../types/calendar.types'

interface UseCalendarDragOptions {
  onSuccess?: () => void
  onError?: (error: Error) => void
}

interface UseCalendarDragReturn {
  handleEventDrop: (dropEvent: CalendarDropEvent) => Promise<void>
  handleEventResize: (resizeEvent: CalendarResizeEvent) => Promise<void>
  isDragging: boolean
}

/**
 * Hook for handling calendar drag-to-reschedule functionality
 *
 * @param options - Configuration options
 * @returns Event handlers and drag state
 */
export function useCalendarDrag(options: UseCalendarDragOptions = {}): UseCalendarDragReturn {
  const updateJobCard = useUpdateJobCard()
  const { onSuccess, onError } = options

  /**
   * Handle event drop (move event to new date)
   */
  const handleEventDrop = useCallback(
    async (dropEvent: CalendarDropEvent) => {
      const { eventId, newStartDate, newEndDate } = dropEvent

      try {
        console.log(`📅 [Calendar] Moving job card ${eventId} to ${newStartDate.toISOString()}`)

        // Update the job card's promised date
        await updateJobCard.mutateAsync({
          jobCardId: eventId,
          updates: {
            promisedDate: newStartDate.toISOString().split('T')[0],
          },
        })

        console.log(`✅ [Calendar] Job card moved successfully`)
        onSuccess?.()
      } catch (error) {
        console.error(`❌ [Calendar] Failed to move job card:`, error)
        onError?.(error as Error)
      }
    },
    [updateJobCard, onSuccess, onError]
  )

  /**
   * Handle event resize (change event duration)
   */
  const handleEventResize = useCallback(
    async (resizeEvent: CalendarResizeEvent) => {
      const { eventId, newStartDate, newEndDate } = resizeEvent

      try {
        console.log(`📅 [Calendar] Resizing job card ${eventId} from ${newStartDate.toISOString()} to ${newEndDate.toISOString()}`)

        // For job cards, we primarily care about the promised date
        // If the event was resized, update the promised date to the new end date
        await updateJobCard.mutateAsync({
          jobCardId: eventId,
          updates: {
            promisedDate: newEndDate.toISOString().split('T')[0],
          },
        })

        console.log(`✅ [Calendar] Job card resized successfully`)
        onSuccess?.()
      } catch (error) {
        console.error(`❌ [Calendar] Failed to resize job card:`, error)
        onError?.(error as Error)
      }
    },
    [updateJobCard, onSuccess, onError]
  )

  return {
    handleEventDrop,
    handleEventResize,
    isDragging: updateJobCard.isPending,
  }
}

/**
 * Validate event drop
 * Checks if the new date is valid for the job card
 */
export function validateEventDrop(newDate: Date): boolean {
  const now = new Date()

  // Don't allow dropping in the past (optional - remove if past dates should be allowed)
  // if (newDate < now) {
  //   return false
  // }

  // Don't allow dropping too far in the future (optional - adjust as needed)
  const maxFutureDate = new Date()
  maxFutureDate.setFullYear(maxFutureDate.getFullYear() + 1)

  if (newDate > maxFutureDate) {
    return false
  }

  return true
}

/**
 * Format error message for display
 */
export function formatDragErrorMessage(error: Error): string {
  if (error.message.includes('Failed to update')) {
    return 'Failed to update job card. Please try again.'
  }

  if (error.message.includes('not found')) {
    return 'Job card not found. It may have been deleted.'
  }

  if (error.message.includes('permission')) {
    return 'You do not have permission to move this job card.'
  }

  return 'An error occurred while updating the job card.'
}

/**
 * Get confirmation message for moving job cards
 */
export function getMoveConfirmationMessage(oldDate: Date, newDate: Date): string {
  const formatDate = (date: Date) =>
    date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return `Move job card from ${formatDate(oldDate)} to ${formatDate(newDate)}?`
}
