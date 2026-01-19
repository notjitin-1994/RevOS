/**
 * CalendarToolbar Component
 *
 * Toolbar component for the Calendar view
 * Mobile-first responsive design with stack-to-grid pattern
 */

'use client'

import React from 'react'
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, List } from 'lucide-react'
import type { CalendarToolbarProps } from '../../types/calendar.types'

export function CalendarToolbar({
  viewMode,
  onViewModeChange,
  currentDate,
  onDateChange,
  onToday,
  onPrev,
  onNext,
}: CalendarToolbarProps) {
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

  return (
    <div className="mb-6">
      {/* Mobile: Stacked layout */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* Date Display & Navigation - Top Section */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <button
            onClick={onPrev}
            className="h-11 w-11 flex items-center justify-center rounded-lg active:bg-gray-100 transition-colors"
            aria-label="Previous date"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <div className="flex-1 text-center px-2">
            <h2 className="text-base font-bold text-gray-900">
              {formatCurrentDate()}
            </h2>
          </div>

          <button
            onClick={onNext}
            className="h-11 w-11 flex items-center justify-center rounded-lg active:bg-gray-100 transition-colors"
            aria-label="Next date"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Today Button - Full Width */}
        <button
          onClick={onToday}
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
            {(['dayGridMonth', 'timeGridWeek', 'timeGridDay'] as const).map((mode) => {
              const label = mode === 'dayGridMonth' ? 'Month' : mode === 'timeGridWeek' ? 'Week' : 'Day'

              return (
                <button
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
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
            onClick={onPrev}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous date"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
            {formatCurrentDate()}
          </h2>

          <button
            onClick={onNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next date"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={onToday}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors ml-2"
          >
            Today
          </button>
        </div>

        {/* View Mode Switcher */}
        <div className="flex items-center gap-2">
          <CalendarIcon className="h-5 w-5 text-gray-500 mr-2" />

          <div className="inline-flex rounded-lg border border-gray-300 p-1">
            {(['dayGridMonth', 'timeGridWeek', 'timeGridDay'] as const).map((mode) => {
              const label = mode === 'dayGridMonth' ? 'Month' : mode === 'timeGridWeek' ? 'Week' : 'Day'

              return (
                <button
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
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
  )
}
