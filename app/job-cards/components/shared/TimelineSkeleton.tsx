/**
 * TimelineSkeleton Component
 *
 * Skeleton loading state for TimelineView component
 * Features:
 * - Timeline/Gantt view skeleton layout
 * - Date header skeleton
 * - Task bar skeletons with varying widths
 * - Statistics cards skeleton
 * - Matches TimelineView structure
 */

'use client'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function TimelineSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
      {/* Header Skeleton */}
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
            width={200}
            baseColor="#e5e7eb"
            highlightColor="#f3f4f6"
          />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton
            height={36}
            width={36}
            baseColor="#d1d5db"
            highlightColor="#e5e7eb"
            className="rounded-lg"
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
          <Skeleton
            height={36}
            width={100}
            baseColor="#e5e7eb"
            highlightColor="#f3f4f6"
            className="rounded-lg"
          />
        </div>
      </div>

      {/* Statistics Cards Skeleton */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
            <Skeleton
              height={12}
              width={80}
              baseColor="#e5e7eb"
              highlightColor="#f3f4f6"
              className="mb-2"
            />
            <Skeleton
              height={28}
              width={60}
              baseColor="#d1d5db"
              highlightColor="#e5e7eb"
            />
          </div>
        ))}
      </div>

      {/* Timeline Container Skeleton */}
      <div className="border border-gray-300 rounded-lg overflow-hidden">
        {/* Date Header Skeleton */}
        <div className="bg-gray-50 border-b border-gray-300">
          <div className="flex">
            {Array.from({ length: 14 }).map((_, i) => (
              <div
                key={i}
                className="flex-shrink-0 px-3 py-2 text-center border-r border-gray-200 last:border-r-0"
                style={{ width: '80px' }}
              >
                <Skeleton
                  height={14}
                  width={40}
                  baseColor="#e5e7eb"
                  highlightColor="#f3f4f6"
                  className="mx-auto mb-1"
                />
                <Skeleton
                  height={24}
                  width={24}
                  baseColor="#d1d5db"
                  highlightColor="#e5e7eb"
                  className="mx-auto mb-1"
                />
                <Skeleton
                  height={12}
                  width={36}
                  baseColor="#e5e7eb"
                  highlightColor="#f3f4f6"
                  className="mx-auto"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Task Bars Skeleton */}
        <div className="p-4 space-y-3 max-h-[600px]">
          {Array.from({ length: 8 }).map((_, i) => {
            // Varying widths for realistic appearance
            const width = Math.floor(Math.random() * 400) + 200
            const left = Math.floor(Math.random() * 300)

            return (
              <div key={i} className="relative h-12">
                <Skeleton
                  height={32}
                  width={width}
                  baseColor="#9ca3af"
                  highlightColor="#d1d5db"
                  className="absolute top-2 rounded-md"
                  style={{ left: `${left}px` }}
                />
              </div>
            )
          })}
        </div>
      </div>

      {/* Legend Skeleton */}
      <div className="mt-6 flex flex-wrap gap-4 text-sm">
        {Array.from({ length: 6 }).map((_, i) => (
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
              width={80}
              baseColor="#e5e7eb"
              highlightColor="#f3f4f6"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
