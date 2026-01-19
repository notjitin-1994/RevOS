'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Employee List Skeleton Component
 *
 * Displays a loading state for the employee list with staggered animations.
 * Matches the actual structure of the employee cards/table on the management page.
 */

interface EmployeeListSkeletonProps {
  count?: number
}

export function EmployeeListSkeleton({ count = 10 }: EmployeeListSkeletonProps) {
  return (
    <div className="space-y-4">
      {/* Mobile Card Layout Skeleton */}
      <div className="md:hidden space-y-3">
        {Array.from({ length: Math.min(count, 10) }).map((_, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
          >
            {/* Card Header - Avatar, Name, Status & Actions */}
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="h-12 w-12 rounded-xl bg-gray-200 animate-pulse shrink-0" />

                {/* Name & Info */}
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-28" />
                    <div className="h-5 bg-gray-200 rounded-full animate-pulse w-16" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-8 w-8 bg-gray-200 rounded-lg animate-pulse" />
                </div>
              </div>
            </div>

            {/* Card Body - Role, Location, Contact */}
            <div className="p-4 space-y-3">
              {/* Role Badge */}
              <div className="h-7 bg-gray-200 rounded-lg animate-pulse w-20" />

              {/* Location */}
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              </div>

              {/* Contact Info */}
              <div className="space-y-2 pt-2 border-t border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse flex-1" />
                </div>
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Desktop Table Layout Skeleton */}
      <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="border-b border-gray-200">
          <div className="grid grid-cols-6 gap-4 px-6 py-4">
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-12" />
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
              transition={{ duration: 0.3, delay: index * 0.04 }}
              className="grid grid-cols-6 gap-4 px-6 py-4 items-center"
            >
              {/* Employee Name & Avatar */}
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-20" />
                </div>
              </div>

              {/* Employee ID */}
              <div className="h-4 bg-gray-200 rounded animate-pulse w-20 font-mono" />

              {/* Role Badge */}
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-16" />

              {/* Contact */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse shrink-0" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-32" />
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3.5 w-3.5 bg-gray-200 rounded animate-pulse shrink-0" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-24" />
                </div>
              </div>

              {/* Status Badge */}
              <div className="h-6 bg-gray-200 rounded-lg animate-pulse w-20" />

              {/* Actions */}
              <div className="flex items-center justify-end gap-1">
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
