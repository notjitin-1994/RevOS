/**
 * CalendarView Component
 *
 * Main Calendar view using FullCalendar
 * Displays job cards as events with drag-to-reschedule support
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
import type { CalendarViewMode, CalendarEvent } from '../../types/calendar.types'
import { jobCardToCalendarEvent } from '../../types/calendar.types'
import { useCalendarDrag } from '../../hooks/use-calendar-drag'
import { CalendarToolbar } from './CalendarToolbar'

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

  // Transform job cards to calendar events
  const events = useMemo(() => {
    return jobCards
      .filter((jc) => jc.promisedDate) // Only show job cards with promised dates
      .map(jobCardToCalendarEvent)
  }, [jobCards])

  // Handle event click
  const handleEventClick = (info: any) => {
    const jobId = info.event.id
    router.push(`/job-cards/${jobId}`)
  }

  // Handle dates navigation
  const handleDateNavigate = (direction: 'prev' | 'next' | 'today') => {
    const newDate = new Date(currentDate)

    switch (direction) {
      case 'prev':
        if (viewMode === 'timeGridDay') {
          newDate.setDate(newDate.getDate() - 1)
        } else if (viewMode === 'timeGridWeek') {
          newDate.setDate(newDate.getDate() - 7)
        } else {
          newDate.setMonth(newDate.getMonth() - 1)
        }
        break

      case 'next':
        if (viewMode === 'timeGridDay') {
          newDate.setDate(newDate.getDate() + 1)
        } else if (viewMode === 'timeGridWeek') {
          newDate.setDate(newDate.getDate() + 7)
        } else {
          newDate.setMonth(newDate.getMonth() + 1)
        }
        break

      case 'today':
        return setCurrentDate(new Date())
    }

    setCurrentDate(newDate)
  }

  // Custom event render
  const eventContent = (eventInfo: any) => {
    const props = eventInfo.event.extendedProps
    const jobCard = props.jobCard

    return (
      <div className="p-1 text-xs">
        <div className="font-semibold truncate text-[10px] sm:text-xs">{jobCard.jobCardNumber}</div>
        <div className="truncate opacity-90 text-[9px] sm:text-xs hidden sm:block">
          {jobCard.vehicleMake} {jobCard.vehicleModel}
        </div>
      </div>
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
        onToday={() => handleDateNavigate('today')}
        onPrev={() => handleDateNavigate('prev')}
        onNext={() => handleDateNavigate('next')}
      />

      {/* FullCalendar - Mobile Optimized */}
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
        />
      </div>

      {/* Legend - Responsive */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        {/* Mobile: Grid layout */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-graphite-900/80 flex-shrink-0" />
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
            <div className="w-4 h-4 rounded bg-graphite-900/80" />
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
        </div>
      </div>
    </div>
  )
}
