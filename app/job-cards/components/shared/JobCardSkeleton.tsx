/**
 * JobCardSkeleton Component
 *
 * Enhanced skeleton loading state for KanbanCard component
 * Features:
 * - Realistic card layout matching KanbanCard dimensions
 * - Smooth shimmer animation effect
 * - Configurable card count
 * - Accessibility support
 */

'use client'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

interface JobCardSkeletonProps {
  count?: number
}

export function JobCardSkeleton({ count = 1 }: JobCardSkeletonProps) {
  return (
    <>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-lg border border-gray-200 p-4"
          role="status"
          aria-label="Loading job card"
        >
          {/* Job Card Number & Priority */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="flex-1">
              <Skeleton
                height={14}
                width={100}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
                className="mb-2"
              />
              <Skeleton
                height={11}
                width={80}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
              />
            </div>
            <Skeleton
              height={20}
              width={50}
              baseColor="#e5e7eb"
              highlightColor="#f3f4f6"
            />
          </div>

          {/* Customer Info */}
          <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
            <Skeleton
              circle
              height={14}
              width={14}
              baseColor="#d1d5db"
              highlightColor="#e5e7eb"
            />
            <div className="flex-1">
              <Skeleton
                height={12}
                width={120}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
                className="mb-1"
              />
              <Skeleton
                height={11}
                width={100}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
              />
            </div>
          </div>

          {/* Vehicle Info */}
          <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
            <Skeleton
              circle
              height={14}
              width={14}
              baseColor="#d1d5db"
              highlightColor="#e5e7eb"
            />
            <div className="flex-1">
              <Skeleton
                height={12}
                width={140}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
                className="mb-1"
              />
              <Skeleton
                height={11}
                width={100}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
              />
            </div>
          </div>

          {/* Mechanic & Promised Date */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Skeleton
                circle
                height={20}
                width={20}
                baseColor="#d1d5db"
                highlightColor="#e5e7eb"
              />
              <Skeleton
                height={12}
                width={80}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
              />
            </div>
            <div className="flex items-center gap-1">
              <Skeleton
                height={12}
                width={12}
                baseColor="#d1d5db"
                highlightColor="#e5e7eb"
              />
              <Skeleton
                height={12}
                width={60}
                baseColor="#e5e7eb"
                highlightColor="#f3f4f6"
              />
            </div>
          </div>
        </div>
      ))}
    </>
  )
}
