'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Customer List Skeleton Component
 *
 * Displays a loading state for the customer list with staggered animations.
 * Matches the structure of the customer cards on the management page.
 */

interface CustomerListSkeletonProps {
  count?: number
}

export function CustomerListSkeleton({ count = 10 }: CustomerListSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Mobile Card Layout Skeleton */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: Math.min(count, 10) }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            {/* Card Header - Avatar + Name */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="h-12 w-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />

                {/* Name & Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="h-5 bg-gray-200 rounded animate-pulse w-3/4" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2" />
                </div>
              </div>
            </div>

            {/* Card Body - Details */}
            <div className="p-4 space-y-3">
              {/* Location */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              </div>

              {/* Vehicle Count */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table Layout Skeleton */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Table Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="grid grid-cols-4 gap-4 px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
          </div>
        </div>

        {/* Table Rows */}
        <div className="divide-y divide-gray-100">
          {Array.from({ length: Math.min(count, 10) }).map((_, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              className="grid grid-cols-4 gap-4 px-6 py-4"
            >
              {/* Customer Name & Avatar */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse shrink-0" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-36" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse shrink-0" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center gap-2">
                <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse shrink-0" />
                <div className="h-3 bg-gray-200 rounded animate-pulse w-28" />
              </div>

              {/* Vehicles */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-6" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}
