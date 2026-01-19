'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Settings Page Skeleton Component
 *
 * Displays a loading state for the settings page with staggered animations.
 * Matches the structure of the settings form sections.
 */

export function SettingsSkeleton() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-card">
          {/* Profile Header */}
          <div className="flex items-center gap-6 mb-8">
            <div className="h-24 w-24 rounded-full bg-gray-200 animate-pulse shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-6 bg-gray-200 rounded animate-pulse w-48" />
              <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
            </div>
            <div className="h-10 w-32 bg-gray-200 rounded-xl animate-pulse" />
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Garage Settings Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-card">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-64" />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse w-32" />
              <div className="h-12 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preferences Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="p-8 bg-white rounded-2xl border border-gray-200 shadow-card">
          <div className="mb-6">
            <div className="h-6 bg-gray-200 rounded animate-pulse w-36 mb-2" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-56" />
          </div>

          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-40 mb-2" />
                  <div className="h-3 bg-gray-200 rounded animate-pulse w-56" />
                </div>
                <div className="h-6 w-12 bg-gray-200 rounded-full animate-pulse shrink-0 ml-4" />
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Save Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="flex justify-end gap-3"
      >
        <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse" />
        <div className="h-12 w-32 bg-gray-200 rounded-xl animate-pulse" />
      </motion.div>
    </div>
  )
}
