'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Vehicle Registry Skeleton Component
 *
 * Displays a loading state for the vehicle registry list with staggered animations.
 * Matches the structure of the vehicle cards on the registry page.
 */

interface VehicleRegistrySkeletonProps {
  count?: number
}

export function VehicleRegistrySkeleton({ count = 10 }: VehicleRegistrySkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Mobile Card Layout Skeleton */}
      <div className="md:hidden space-y-4">
        {Array.from({ length: Math.min(count, 10) }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden"
          >
            <div className="p-5">
              <div className="flex flex-col gap-4">
                {/* Vehicle Icon & Basic Info */}
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-xl bg-gray-200 animate-pulse shrink-0" />

                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-40" />
                    <div className="flex items-center gap-2">
                      <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse shrink-0" />
                      <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                    </div>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-12" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
                  </div>
                </div>

                {/* License Plate */}
                <div className="flex items-start gap-3 bg-gray-50 rounded-lg p-3">
                  <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 mt-4 pt-4 border-t border-gray-200">
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table Layout Skeleton */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-5 gap-4 px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-12 self-end justify-self-end" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-200">
          {Array.from({ length: Math.min(count, 10) }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="grid grid-cols-5 gap-4 px-6 py-4"
            >
              {/* Vehicle Info */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-28" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="flex items-center gap-1">
                    <div className="h-3 w-3 bg-gray-200 rounded animate-pulse" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-10" />
                  </div>
                </div>
              </div>

              {/* Owner Info */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>

              {/* License Plate */}
              <div className="flex items-center">
                <div className="h-7 px-3 py-1.5 bg-gray-100 rounded-lg">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>

              {/* Category */}
              <div className="flex items-center">
                <div className="h-6 px-3 py-1 bg-gray-100 rounded-full w-16" />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
