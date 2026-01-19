/**
 * CalendarSection Component
 *
 * Calendar component for dashboard showing scheduled job cards
 * Supports Day/Week/Month views with FullCalendar integration
 */

'use client'

import React, { useState, useMemo } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, Calendar as CalendarIcon } from 'lucide-react'
import type { DashboardCalendarJobCard } from '@/lib/supabase/dashboard-queries'
import type { CalendarViewMode } from '@/app/job-cards/types/calendar.types'

interface CalendarSectionProps {
  jobCards: DashboardCalendarJobCard[]
  isLoading?: boolean
}

export function CalendarSection({ jobCards, isLoading = false }: CalendarSectionProps) {
  const router = useRouter()
  const [viewMode, setViewMode] = useState<CalendarViewMode>('timeGridDay')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Transform job cards to calendar events
  const events = useMemo(() => {
    return jobCards.map((jobCard) => {
      const eventDate = jobCard.promisedDate || jobCard.createdAt
      const backgroundColor = getEventBackgroundColor(jobCard.priority)
      const borderColor = getEventBorderColor(jobCard.status)

      return {
        id: jobCard.id,
        title: `${jobCard.jobCardNumber} - ${jobCard.vehicleMake} ${jobCard.vehicleModel}`,
        start: eventDate,
        allDay: true,
        backgroundColor,
        borderColor,
        textColor: '#FFFFFF',
        extendedProps: {
          jobCard,
          priority: jobCard.priority,
          status: jobCard.status,
          customerName: jobCard.customerName,
          vehicleMake: jobCard.vehicleMake,
          vehicleModel: jobCard.vehicleModel,
          vehicleLicensePlate: jobCard.vehicleLicensePlate,
        },
      }
    })
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

  // Format current date for display
  const formatCurrentDate = () => {
    if (viewMode === 'dayGridMonth') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'timeGridWeek') {
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
      startOfWeek.setDate(diff)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      )}`
    } else if (viewMode === 'timeGridDay') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
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
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No scheduled job cards</h3>
          <p className="text-gray-600">
            Job cards with promised dates will appear here
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-3 md:p-6">
      {/* Toolbar */}
      <div className="mb-6">
        {/* Mobile: Stacked layout */}
        <div className="flex flex-col gap-4 md:hidden">
          {/* Date Display & Navigation - Top Section */}
          <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
            <button
              onClick={() => handleDateNavigate('prev')}
              className="h-11 w-11 flex items-center justify-center rounded-lg active:bg-gray-100 transition-colors"
              aria-label="Previous date"
            >
              <CalendarIcon className="h-5 w-5 text-gray-700 rotate-180" />
            </button>

            <div className="flex-1 text-center px-2">
              <h2 className="text-base font-bold text-gray-900">
                {formatCurrentDate()}
              </h2>
            </div>

            <button
              onClick={() => handleDateNavigate('next')}
              className="h-11 w-11 flex items-center justify-center rounded-lg active:bg-gray-100 transition-colors"
              aria-label="Next date"
            >
              <CalendarIcon className="h-5 w-5 text-gray-700" />
            </button>
          </div>

          {/* Today Button - Full Width */}
          <button
            onClick={() => handleDateNavigate('today')}
            className="h-11 w-full flex items-center justify-center text-base font-medium text-gray-900 bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            Today
          </button>

          {/* View Mode Switcher - Full Width Buttons */}
          <div className="space-y-2">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-600 px-1">
              View Mode
            </p>
            <div className="grid grid-cols-3 gap-2">
              {(['timeGridDay', 'timeGridWeek', 'dayGridMonth'] as const).map((mode) => {
                const label = mode === 'timeGridDay' ? 'Day' : mode === 'timeGridWeek' ? 'Week' : 'Month'

                return (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`h-11 text-sm font-semibold rounded-lg transition-all active:scale-[0.98] ${
                      viewMode === mode
                        ? 'bg-graphite-700 text-white shadow-md'
                        : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                    }`}
                    aria-label={`Switch to ${label.toLowerCase()} view`}
                    aria-pressed={viewMode === mode}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Desktop: Side-by-side layout */}
        <div className="hidden md:flex items-center justify-between">
          {/* Date Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleDateNavigate('prev')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Previous date"
            >
              <CalendarIcon className="h-5 w-5 text-gray-700 rotate-180" />
            </button>

            <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
              {formatCurrentDate()}
            </h2>

            <button
              onClick={() => handleDateNavigate('next')}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Next date"
            >
              <CalendarIcon className="h-5 w-5 text-gray-700" />
            </button>

            <button
              onClick={() => handleDateNavigate('today')}
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ml-2"
            >
              Today
            </button>
          </div>

          {/* View Mode Switcher */}
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded-lg border border-gray-300 p-1">
              {(['timeGridDay', 'timeGridWeek', 'dayGridMonth'] as const).map((mode) => {
                const label = mode === 'timeGridDay' ? 'Day' : mode === 'timeGridWeek' ? 'Week' : 'Month'

                return (
                  <button
                    key={mode}
                    onClick={() => setViewMode(mode)}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${
                      viewMode === mode ? 'bg-graphite-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
                    }`}
                    aria-label={`Switch to ${label.toLowerCase()} view`}
                    aria-pressed={viewMode === mode}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      </div>

      {/* FullCalendar - Mobile Optimized */}
      <div className="min-h-[50vh] md:min-h-[600px]">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView={viewMode}
          headerToolbar={false}
          events={events}
          editable={false}
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
          firstDay={0}
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
