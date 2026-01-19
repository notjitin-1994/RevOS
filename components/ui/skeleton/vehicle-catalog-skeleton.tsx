'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Vehicle Catalog Skeleton Component
 *
 * Displays a loading state for the vehicle catalog makes list with staggered animations.
 * Matches the structure of the makes cards on the vehicle catalog page.
 */

interface VehicleCatalogSkeletonProps {
  count?: number
}

export function VehicleCatalogSkeleton({ count = 10 }: VehicleCatalogSkeletonProps) {
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
            className="bg-white border border-gray-200 rounded-xl shadow-card overflow-hidden"
          >
            {/* Make Header */}
            <div className="p-5">
              <div className="flex items-center gap-4">
                {/* Make Logo/Icon */}
                <div className="h-14 w-14 rounded-xl bg-gray-200 animate-pulse shrink-0" />

                {/* Make Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-40" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>
            </div>

            {/* Models Preview */}
            <div className="px-5 pb-4 pt-0">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="py-2 px-3 bg-gray-50 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24 mb-1" />
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table Layout Skeleton */}
      <div className="hidden md:block bg-white border border-gray-200 rounded-xl overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-4 gap-4 px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
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
              className="grid grid-cols-4 gap-4 px-6 py-4"
            >
              {/* Make Info */}
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />
                <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
              </div>

              {/* Country */}
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 self-center" />

              {/* Model Count */}
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-20 self-center" />

              {/* Sample Models */}
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-6 bg-gray-50 rounded animate-pulse w-16" />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
