'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface StatItem {
  label: string
  value: string
  color: string
  subtext: string
}

interface DashboardOverviewProps {
  stats: StatItem[]
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="mt-8"
    >
      <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Overview</h2>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.5 + index * 0.05 }}
            className={cn(
              'rounded-xl p-4 border border-gray-200',
              stat.color.includes('/') ? stat.color : `${stat.color} text-white`
            )}
          >
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className={cn(
              'text-sm font-medium mb-1 text-gray-900',
              stat.color.includes('/') ? 'bg-white/95 text-status-error' : 'bg-white/95'
            )}>
              {stat.label}
            </p>
            <p className={cn(
              'text-xs text-gray-600',
              stat.color.includes('/') ? 'bg-white/90 text-status-error/70' : 'bg-white/90'
            )}>
              {stat.subtext}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.section>
  )
}
