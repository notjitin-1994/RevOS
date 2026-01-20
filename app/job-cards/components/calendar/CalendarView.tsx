/**
 * CalendarView Component
 *
 * Main Calendar view using FullCalendar with enhanced UX
 * Displays job cards as events with:
 * - Context menu for quick actions
 * - Enhanced tooltips with full details
 * - Progress indicators
 * - Keyboard shortcuts
 * - Touch gestures for mobile
 */

'use client'

import React, { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2 } from 'lucide-react'
import type { JobCardViewData } from '../../types/job-card-view.types'
import type { CalendarViewMode } from '../../types/calendar.types'
import { jobCardToCalendarEvent } from '../../types/calendar.types'
import { useCalendarDrag } from '../../hooks/use-calendar-drag'
import { useCalendarTouchGestures } from '../../hooks/use-touch-gestures'
import { CalendarToolbar } from './CalendarToolbar'
import { EventContextMenu } from './EventContextMenu'
import { EnhancedTooltip } from './EnhancedTooltip'
import { EventWithProgress } from './EventWithProgress'

interface CalendarViewProps {
  jobCards: JobCardViewData[]
  garageId: string
  isLoading?: boolean
}

export function CalendarView({ jobCards, garageId, isLoading = false }: CalendarViewProps) {
  const router = useRouter()
  const { handleEventDrop, handleEventResize } = useCalendarDrag({
    onSuccess: () => {
      console.log('✅ Calendar event updated successfully')
    },
    onError: (error) => {
      console.error('❌ Failed to update calendar event:', error)
    },
  })

  // State
  const [viewMode, setViewMode] = useState<CalendarViewMode>('dayGridMonth')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null)

  // Transform job cards to calendar events
  const events = useMemo(() => {
    return jobCards
      .filter((jc) => jc.promisedDate) // Only show job cards with promised dates
      .map(jobCardToCalendarEvent)
  }, [jobCards])

  // Touch gesture support for mobile
  const handlePrev = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'timeGridDay') {
      newDate.setDate(newDate.getDate() - 1)
    } else if (viewMode === 'timeGridWeek') {
      newDate.setDate(newDate.getDate() - 7)
    } else {
      newDate.setMonth(newDate.getMonth() - 1)
    }
    setCurrentDate(newDate)
  }

  const handleNext = () => {
    const newDate = new Date(currentDate)
    if (viewMode === 'timeGridDay') {
      newDate.setDate(newDate.getDate() + 1)
    } else if (viewMode === 'timeGridWeek') {
      newDate.setDate(newDate.getDate() + 7)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  useCalendarTouchGestures(handlePrev, handleNext, true)

  // Handle event click
  const handleEventClick = (info: any) => {
    // Check if this was a Ctrl/Cmd + click (open in new tab)
    if (info.jsEvent.ctrlKey || info.jsEvent.metaKey) {
      const jobId = info.event.id
      window.open(`/job-cards/${jobId}`, '_blank')
      return
    }

    const jobId = info.event.id
    router.push(`/job-cards/${jobId}`)
  }

  // Custom event render with enhanced features
  const eventContent = (eventInfo: any) => {
    const props = eventInfo.event.extendedProps
    const jobCard = props.jobCard
    const isHovered = hoveredEventId === jobCard.id

    return (
      <EventContextMenu
        jobCard={jobCard}
        onStatusChange={(status) => {
          console.log(`📋 Update status: ${jobCard.id} -> ${status}`)
          // TODO: Implement status update mutation
        }}
      >
        <EnhancedTooltip jobCard={jobCard}>
          <div
            onMouseEnter={() => setHoveredEventId(jobCard.id)}
            onMouseLeave={() => setHoveredEventId(null)}
            className="h-full w-full"
          >
            <EventWithProgress
              jobCard={jobCard}
              isHovered={isHovered}
              compact={viewMode === 'dayGridMonth'}
            />
          </div>
        </EnhancedTooltip>
      </EventContextMenu>
    )
  }

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600">Loading calendar...</p>
        </div>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No job cards with promised dates</h3>
          <p className="text-gray-600">
            Add promised dates to job cards to see them on the calendar
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-3 md:p-6">
      {/* Toolbar */}
      <CalendarToolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        onToday={() => setCurrentDate(new Date())}
        onPrev={handlePrev}
        onNext={handleNext}
      />

      {/* FullCalendar - Mobile Optimized with Enhanced Features */}
      <div className="min-h-[50vh] md:min-h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={viewMode}
          headerToolbar={false}
          events={events}
          editable={true}
          droppable={true}
          eventDrop={async (info) => {
            const newStartDate = info.event.start
            const newEndDate = info.event.end || newStartDate

            if (!newStartDate || !newEndDate) {
              info.revert()
              return
            }

            await handleEventDrop({
              eventId: info.event.id,
              newStartDate,
              newEndDate,
              allDay: info.event.allDay || false,
            })

            // Revert if failed (FullCalendar will handle this)
            info.revert()
          }}
          eventResize={async (info) => {
            const newStartDate = info.event.start
            const newEndDate = info.event.end || newStartDate

            if (!newStartDate || !newEndDate) {
              info.revert()
              return
            }

            await handleEventResize({
              eventId: info.event.id,
              newStartDate,
              newEndDate,
            })

            // Revert if failed (FullCalendar will handle this)
            info.revert()
          }}
          eventClick={handleEventClick}
          eventContent={eventContent}
          height="auto"
          dayMaxEvents={2}
          moreLinkClick="popover"
          buttonText={{
            today: 'Today',
            month: 'Month',
            week: 'Week',
            day: 'Day',
            list: 'List',
          }}
          firstDay={0} // Sunday
          fixedWeekCount={false}
          showNonCurrentDates={false}
          aspectRatio={1.35}
          dayHeaderFormat={{ weekday: 'short' }}
          eventMinHeight={36}
          // Accessibility improvements
          eventDidMount={(info) => {
            // Add ARIA labels for screen readers
            const jobCard = info.event.extendedProps.jobCard
            info.el.setAttribute('role', 'button')
            info.el.setAttribute('aria-label', `${jobCard.jobCardNumber} - ${jobCard.vehicleMake} ${jobCard.vehicleModel}, Status: ${jobCard.status}, Priority: ${jobCard.priority}`)
          }}
        />
      </div>

      {/* Legend - Responsive */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        {/* Mobile: Grid layout */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-red-500/80 flex-shrink-0" />
            <span className="text-sm text-gray-700">Urgent</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-graphite-700/80 flex-shrink-0" />
            <span className="text-sm text-gray-700">High</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-graphite-500/80 flex-shrink-0" />
            <span className="text-sm text-gray-700">Medium</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-graphite-300/80 flex-shrink-0" />
            <span className="text-sm text-gray-700">Low</span>
          </div>
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-red-500/80" />
            <span className="text-gray-700">Urgent Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-graphite-700/80" />
            <span className="text-gray-700">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-graphite-500/80" />
            <span className="text-gray-700">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-graphite-300/80" />
            <span className="text-gray-700">Low Priority</span>
          </div>
          <div className="w-px h-4 bg-gray-300 mx-2" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border-2 border-red-500 bg-gray-200" />
            <span className="text-gray-700">Overdue</span>
          </div>
        </div>
      </div>

      {/* Keyboard Shortcuts Hint */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
          Press <kbd className="px-1.5 py-0.5 bg-gray-100 rounded text-gray-700 font-medium">?</kbd> for keyboard shortcuts
        </p>
      </div>
    </div>
  )
}
