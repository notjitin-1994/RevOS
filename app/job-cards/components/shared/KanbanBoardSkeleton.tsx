'use client'

import { motion } from 'framer-motion'

interface KanbanColumnSkeletonProps {
  color: string
  bgColor: string
  borderColor: string
  title: string
  cardCount: number
}

function KanbanColumnSkeleton({ color, bgColor, borderColor, title, cardCount }: KanbanColumnSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className={`flex-shrink-0 w-80 ${bgColor} rounded-xl border-2 ${borderColor} p-4`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          {/* Status dot */}
          <div className={`h-3 w-3 rounded-full ${color.replace('text-', 'bg-')} animate-pulse`} />
          {/* Title skeleton */}
          <div className={`h-4 w-24 ${color} rounded animate-pulse opacity-60`} />
          {/* Count badge skeleton */}
          <div className={`h-5 w-8 rounded-full ${bgColor.replace('50', '100')} animate-pulse opacity-70`} />
        </div>
      </div>

      {/* Skeleton Cards */}
      <div className="space-y-3">
        {Array.from({ length: cardCount }).map((_, i) => (
          <KanbanCardSkeleton key={i} index={i} />
        ))}
      </div>
    </motion.div>
  )
}

interface KanbanCardSkeletonProps {
  index: number
}

function KanbanCardSkeleton({ index }: KanbanCardSkeletonProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: 0.3,
        delay: index * 0.1,
        ease: 'easeOut'
      }}
      className="bg-white rounded-lg border border-gray-200 shadow-sm p-4"
    >
      {/* Job Card Number & Priority Badge */}
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="flex-1 min-w-0">
          {/* Job card number skeleton */}
          <div className="h-3.5 w-20 bg-gray-200 rounded animate-pulse mb-2" />
          {/* Date skeleton */}
          <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
        {/* Priority badge skeleton */}
        <div className="h-5 w-14 bg-gray-100 rounded-md animate-pulse flex-shrink-0" />
      </div>

      {/* Customer Info Section */}
      <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
        {/* User icon skeleton */}
        <div className="h-3.5 w-3.5 bg-gray-200 rounded-full animate-pulse shrink-0" />
        <div className="min-w-0 flex-1">
          {/* Customer name skeleton */}
          <div className="h-3 w-24 bg-gray-200 rounded animate-pulse mb-1" />
          {/* Phone skeleton */}
          <div className="h-2.5 w-20 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Vehicle Info Section */}
      <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
        {/* Wrench icon skeleton */}
        <div className="h-3.5 w-3.5 bg-gray-200 rounded-full animate-pulse shrink-0" />
        <div className="min-w-0 flex-1">
          {/* Vehicle info skeleton */}
          <div className="h-3 w-28 bg-gray-200 rounded animate-pulse mb-1" />
          {/* License plate skeleton */}
          <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>

      {/* Footer Section - Mechanic & Date */}
      <div className="flex items-center justify-between">
        {/* Mechanic skeleton */}
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 bg-gray-200 rounded-full animate-pulse" />
          <div className="h-2.5 w-16 bg-gray-100 rounded animate-pulse" />
        </div>
        {/* Calendar skeleton */}
        <div className="flex items-center gap-1">
          <div className="h-3 w-3 bg-gray-200 rounded animate-pulse" />
          <div className="h-2.5 w-14 bg-gray-100 rounded animate-pulse" />
        </div>
      </div>
    </motion.div>
  )
}

interface KanbanBoardSkeletonProps {
  columnCount?: number
}

export function KanbanBoardSkeleton({ columnCount = 3 }: KanbanBoardSkeletonProps) {
  // Define column styles matching the actual kanban board
  const columns = [
    {
      title: 'Draft',
      color: 'text-graphite-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
    },
    {
      title: 'Queued',
      color: 'text-graphite-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-300',
    },
    {
      title: 'In Progress',
      color: 'text-graphite-800',
      bgColor: 'bg-gray-200',
      borderColor: 'border-gray-400',
    },
    {
      title: 'Parts Waiting',
      color: 'text-graphite-900',
      bgColor: 'bg-gray-300',
      borderColor: 'border-gray-500',
    },
    {
      title: 'Quality Check',
      color: 'text-graphite-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-400',
    },
    {
      title: 'Ready',
      color: 'text-graphite-800',
      bgColor: 'bg-gray-200',
      borderColor: 'border-gray-400',
    },
    {
      title: 'Delivered',
      color: 'text-graphite-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-300',
    },
  ]

  // Generate random card counts for each column (between 1-3 cards)
  const generateRandomCounts = () => {
    return Array.from({ length: columnCount }, () => Math.floor(Math.random() * 3) + 1)
  }

  const cardCounts = generateRandomCounts()

  return (
    <div className="relative">
      {/* Top Scrollbar Skeleton */}
      <div className="mb-3">
        <div className="h-2 bg-gray-200 rounded-full animate-pulse" style={{ width: '100%' }} />
      </div>

      {/* Kanban Board Skeleton */}
      <div className="overflow-x-auto pb-4 scrollbar-hide">
        <div className="flex gap-4 min-w-max pr-4">
          {columns.slice(0, columnCount).map((column, index) => (
            <KanbanColumnSkeleton
              key={index}
              {...column}
              cardCount={cardCounts[index]}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
