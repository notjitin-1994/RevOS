'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Detail View Skeleton Component
 *
 * Generic loading skeleton for detail pages with tabbed content.
 * Matches the structure of employee detail and inventory detail pages.
 */

interface DetailViewSkeletonProps {
  tabCount?: number
  hasSidebar?: boolean
}

export function DetailViewSkeleton({ tabCount = 3, hasSidebar = true }: DetailViewSkeletonProps) {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
      {/* Header Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <div className="flex items-start gap-4 mb-6">
          {/* Icon/Avatar */}
          <div className="h-20 w-20 rounded-2xl bg-gray-200 animate-pulse shrink-0" />

          {/* Title and Info */}
          <div className="flex-1 min-w-0 space-y-3">
            <div className="h-8 bg-gray-200 rounded animate-pulse w-3/4 max-w-md" />
            <div className="h-5 bg-gray-200 rounded animate-pulse w-1/2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-2/3" />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 shrink-0">
            <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse" />
            <div className="h-10 w-10 bg-gray-200 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 mb-6">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
          <div className="h-4 w-4 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex gap-1">
            {Array.from({ length: tabCount }).map((_, index) => (
              <div
                key={index}
                className={cn(
                  'h-12 bg-gray-200 rounded-t-lg animate-pulse',
                  index === 0 ? 'w-32' : 'w-24'
                )}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Tab Content */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2, delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-6">
          {/* Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-40" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                    <div className="h-5 bg-gray-200 rounded animate-pulse w-32" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Stats/Details Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
            className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-36" />
            </div>
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                    <div className="h-8 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar */}
        {hasSidebar && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl shadow-card border border-gray-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
              </div>
              <div className="p-4 space-y-2">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="h-12 bg-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  )
}
