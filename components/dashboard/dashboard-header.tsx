'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface DashboardHeaderProps {
  statsError?: string | null
  children?: React.ReactNode
}

export function DashboardHeader({ statsError, children }: DashboardHeaderProps) {
  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-6 md:mb-8"
    >
      <div className="flex items-center gap-3">
        <div className="h-10 w-1 bg-graphite-900 rounded-full" />
        <div>
          <h1 className="font-display font-bold text-2xl md:text-3xl text-gray-900 tracking-tight">
            Garage Management Hub
          </h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">
            Welcome back! Quick access to all your garage operations
          </p>
        </div>
      </div>

      {statsError && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">Unable to load statistics: {statsError}</p>
        </div>
      )}

      {children}
    </motion.header>
  )
}
