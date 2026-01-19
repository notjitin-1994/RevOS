/**
 * CalendarSkeleton Component
 *
 * Skeleton loading state for CalendarView component
 * Features:
 * - Calendar grid skeleton
 * - Month view with day cells
 * - Event placeholder skeletons
 * - Toolbar skeleton
 * - Matches FullCalendar layout
 */

'use client'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function CalendarSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
      {/* Toolbar Skeleton */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Skeleton
            height={36}
            width={36}
            baseColor="#d1d5db"
            highlightColor="#e5e7eb"
            className="rounded-lg"
          />
          <Skeleton
            height={28}
            width={180}
            baseColor="#e5e7eb"
            highlightColor="#f3f4f6"
          />
          <Skeleton
            height={36}
            width={36}
            baseColor="#d1d5db"
            highlightColor="#e5e7eb"
            className="rounded-lg"
          />
          <Skeleton
            height={36}
            width={80}
            baseColor="#e5e7eb"
            highlightColor="#f3f4f6"
            className="rounded-lg"
          />
        </div>
        <Skeleton
          height={36}
          width={120}
          baseColor="#e5e7eb"
          highlightColor="#f3f4f6"
          className="rounded-lg"
        />
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-1 mb-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center py-2 bg-gray-50 rounded-t"
          >
            <Skeleton
              height={14}
              width={30}
              baseColor="#e5e7eb"
              highlightColor="#f3f4f6"
              className="mx-auto"
            />
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {Array.from({ length: 35 }).map((_, i) => {
          // Randomly decide if this day has events (2 out of 7 cells)
          const hasEvents = Math.random() > 0.7
          const eventCount = hasEvents ? Math.floor(Math.random() * 3) + 1 : 0

          return (
            <div
              key={i}
              className="min-h-24 p-2 border border-gray-200 rounded-lg bg-gray-50/30"
            >
              {/* Day Number Skeleton */}
              <Skeleton
                height={14}
                width={16}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
                className="mb-1"
              />

              {/* Event Skeletons */}
              {hasEvents && (
                <div className="space-y-1">
                  {Array.from({ length: eventCount }).map((_, j) => (
                    <Skeleton
                      key={j}
                      height={20}
                      width="100%"
                      baseColor="#9ca3af"
                      highlightColor="#d1d5db"
                      className="rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend Skeleton */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap gap-4 text-sm">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <Skeleton
                height={16}
                width={16}
                baseColor="#9ca3af"
                highlightColor="#d1d5db"
                className="rounded"
              />
              <Skeleton
                height={14}
                width={100}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
