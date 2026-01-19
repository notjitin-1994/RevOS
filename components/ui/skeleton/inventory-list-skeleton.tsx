'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Inventory List Skeleton Component
 *
 * Displays a loading state for the inventory list with staggered animations.
 * Matches the structure of the inventory cards on the management page.
 */

interface InventoryListSkeletonProps {
  count?: number
  view?: 'grid' | 'list'
}

export function InventoryListSkeleton({ count = 9, view = 'grid' }: InventoryListSkeletonProps) {
  if (view === 'list') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-card">
              <div className="flex items-center gap-4">
                {/* Part Number and Name */}
                <div className="flex-1 min-w-0">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-32 mb-2" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48" />
                </div>

                {/* Category Badge */}
                <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse shrink-0" />

                {/* Stock Info */}
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mb-1" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-8" />
                  </div>
                  <div className="text-center">
                    <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mb-1" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-8" />
                  </div>
                </div>

                {/* Status Badge */}
                <div className="h-6 w-20 bg-gray-200 rounded-full animate-pulse shrink-0" />

                {/* Actions */}
                <div className="flex gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    )
  }

  // Grid View
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.08 }}
        >
          <div className="p-6 h-56 bg-white rounded-xl border border-gray-200 shadow-card flex flex-col">
            {/* Header: Part Number */}
            <div className="mb-4">
              <div className="h-5 bg-gray-200 rounded animate-pulse w-28 mb-2" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-full" />
            </div>

            {/* Category Badge */}
            <div className="mb-4">
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
            </div>

            {/* Stock Information */}
            <div className="flex-1 grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-full mb-2" />
                <div className="h-7 bg-gray-200 rounded animate-pulse w-12" />
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="h-3 bg-gray-200 rounded animate-pulse w-full mb-2" />
                <div className="h-7 bg-gray-200 rounded animate-pulse w-12" />
              </div>
            </div>

            {/* Footer: Status + Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="h-6 w-24 bg-gray-200 rounded-full animate-pulse" />
              <div className="flex gap-2">
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  )
}
