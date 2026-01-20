'use client'

import React from 'react'
import { motion } from 'framer-motion'

/**
 * Settings Page Skeleton Component
 *
 * Displays a loading state for the settings page with staggered animations.
 * Matches the actual structure of the settings page with Profile Hero Card,
 * Tab Navigation, and InfoCard grid layout.
 */

export function SettingsSkeleton() {
  return (
    <div className="flex-1 overflow-y-auto pb-16 md:pb-0" style={{ backgroundColor: '#dfe5ef' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        <div className="space-y-4 md:space-y-6">
          {/* Header */}
          <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6 md:mb-8"
      >
        <div className="flex items-center gap-3">
          <div className="h-10 w-1 bg-gray-700 rounded-full bg-gray-200 animate-pulse" />
          <div className="space-y-2">
            <div className="h-8 md:h-9 bg-gray-200 rounded animate-pulse w-40" />
            <div className="h-4 bg-gray-200 rounded animate-pulse w-56" />
          </div>
        </div>
      </motion.div>

      {/* Profile Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="mb-6 md:mb-8"
      >
        <div className="hidden md:block relative overflow-hidden rounded-2xl bg-white border border-gray-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 animate-pulse" />
          <div className="relative p-4 md:p-8">
            <div className="flex flex-col lg:flex-row lg:items-center gap-4 md:gap-6">
              {/* Avatar */}
              <div className="relative mx-auto lg:mx-0">
                <div className="h-20 w-20 md:h-24 md:w-24 rounded-2xl bg-gray-200 animate-pulse" />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
              </div>

              {/* User Info */}
              <div className="flex-1">
                <div className="space-y-2">
                  <div className="h-6 md:h-7 bg-gray-200 rounded animate-pulse w-48" />
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-56" />
                </div>
              </div>

              {/* Role Badge */}
              <div className="h-11 w-32 bg-gray-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>

        {/* Mobile Profile Card */}
        <div className="md:hidden relative overflow-hidden rounded-2xl bg-white border border-gray-200">
          <div className="absolute top-0 left-0 right-0 h-1 bg-gray-200 animate-pulse" />
          <div className="relative p-4">
            <div className="flex flex-col gap-4">
              {/* Avatar */}
              <div className="relative mx-auto">
                <div className="h-20 w-20 rounded-2xl bg-gray-200 animate-pulse" />
                <div className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-gray-200 animate-pulse" />
              </div>

              {/* User Info */}
              <div className="flex-1 text-center space-y-3">
                <div className="h-6 bg-gray-200 rounded animate-pulse w-40 mx-auto" />
                <div className="h-4 bg-gray-200 rounded animate-pulse w-48 mx-auto" />
                <div className="h-11 w-36 bg-gray-200 rounded-xl animate-pulse mx-auto" />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Tab Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
        className="mb-4 md:mb-6"
      >
        {/* Desktop Tabs */}
        <div className="hidden md:block">
          <div className="border-b border-gray-200">
            <div className="flex gap-1">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Mobile Tabs */}
        <div className="md:hidden">
          <div className="border-b border-gray-200">
            <div className="flex gap-1">
              {Array.from({ length: 2 }).map((_, index) => (
                <div key={index} className="flex-1 px-2 py-3">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-16" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* InfoCard Grid - User Settings Tab */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
          {/* Personal Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="lg:row-span-2"
          >
            <div className="h-full bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden">
              {/* Card Header */}
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gray-200 animate-pulse shrink-0" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-36" />
                </div>
              </div>

              {/* Card Body - Info Items */}
              <div className="p-4 md:p-6 space-y-1">
                {Array.from({ length: 10 }).map((_, index) => (
                  <div key={index} className="flex items-start justify-between py-3 md:py-4 px-3 -mx-3 rounded-xl">
                    <div className="flex items-center gap-2 md:gap-3 flex-1">
                      <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Location Information Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="h-full"
          >
            <div className="h-full bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
              {/* Card Header */}
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gray-200 animate-pulse shrink-0" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-40" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 md:p-6 space-y-1 flex-1">
                {Array.from({ length: 5 }).map((_, index) => (
                  <div key={index} className="flex items-start justify-between py-3 md:py-4 px-3 -mx-3 rounded-xl">
                    <div className="flex items-center gap-2 md:gap-3 flex-1">
                      <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-20" />
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Emergency Contact Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="h-full"
          >
            <div className="h-full bg-white rounded-xl md:rounded-2xl border border-gray-200 overflow-hidden flex flex-col">
              {/* Card Header */}
              <div className="px-4 md:px-6 py-3 md:py-4 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-white shrink-0">
                <div className="flex items-center gap-2 md:gap-3">
                  <div className="h-8 w-8 md:h-10 md:w-10 rounded-lg md:rounded-xl bg-gray-200 animate-pulse shrink-0" />
                  <div className="h-6 bg-gray-200 rounded animate-pulse w-32" />
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 md:p-6 space-y-1 flex-1">
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start justify-between py-3 md:py-4 px-3 -mx-3 rounded-xl">
                    <div className="flex items-center gap-2 md:gap-3 flex-1">
                      <div className="h-8 w-8 rounded-lg bg-gray-200 animate-pulse shrink-0" />
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-28" />
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-4 bg-gray-200 rounded animate-pulse w-24" />
                      <div className="h-4 w-4 bg-gray-200 rounded animate-pulse shrink-0" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
        </div>
      </div>
    </div>
  )
}
