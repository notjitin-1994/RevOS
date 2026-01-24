'use client'

import { useDroppable } from '@dnd-kit/core'
import { AlertCircle, TrendingUp, ChevronDown, ChevronRight } from 'lucide-react'
import { useJobCardStore } from '../../lib/stores/job-card-store'
import { motion, AnimatePresence } from 'framer-motion'
import type { KanbanColumnConfig, JobCardStatus } from '../../types/kanban.types'

interface KanbanColumnProps {
  config: KanbanColumnConfig
  count: number
  isCollapsed: boolean
  onToggleCollapse: () => void
  children: React.ReactNode
}

export function KanbanColumn({
  config,
  count,
  isCollapsed,
  onToggleCollapse,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: config.status,
    data: {
      status: config.status,
    },
  })

  const { showWIPWarnings } = useJobCardStore()
  const isOverLimit = config.wipLimit && count >= config.wipLimit
  const isNearLimit = config.wipLimit && count >= config.wipLimit - 1 && count < config.wipLimit

  // Determine WIP status styles
  const getWIPStatusStyles = () => {
    if (isOverLimit) {
      return {
        containerClass: 'border-red-400 bg-red-50',
        headerClass: 'text-red-700',
        badgeClass: 'bg-red-100 text-red-700',
      }
    }
    if (isNearLimit) {
      return {
        containerClass: 'border-yellow-400 bg-yellow-50',
        headerClass: 'text-yellow-700',
        badgeClass: 'bg-yellow-100 text-yellow-700',
      }
    }
    return {
      containerClass: config.bgColor,
      headerClass: config.color,
      badgeClass: `${config.color} ${config.bgColor.replace('50', '200')}`,
    }
  }

  const wipStyles = getWIPStatusStyles()

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2 }}
      className={`flex-shrink-0 w-80 rounded-xl border-2 p-4 transition-all duration-200 ${
        isOverLimit
          ? 'border-red-400 bg-red-50 shadow-lg'
          : isNearLimit
          ? 'border-yellow-400 bg-yellow-50 hover:border-yellow-500'
          : `${wipStyles.containerClass} hover:border-gray-400`
      } ${
        isOver
          ? 'ring-4 ring-gray-400 ring-opacity-50 scale-[1.02] shadow-xl'
          : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {/* Collapse button */}
          <button
            onClick={onToggleCollapse}
            className="p-1 hover:bg-gray-200 rounded transition-colors flex-shrink-0"
            aria-label={isCollapsed ? `Expand ${config.title} column` : `Collapse ${config.title} column`}
            aria-expanded={!isCollapsed}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4 text-gray-600" />
            ) : (
              <ChevronDown className="h-4 w-4 text-gray-600" />
            )}
          </button>

          {/* Status indicator dot */}
          <div className={`h-3 w-3 rounded-full ${config.color.replace('text-', 'bg-')} flex-shrink-0`} />

          {/* Title */}
          <h3 className={`text-sm font-bold ${wipStyles.headerClass} truncate`}>
            {config.title}
          </h3>

          {/* Card count badge */}
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
              isOverLimit
                ? 'bg-red-100 text-red-700'
                : isNearLimit
                ? 'bg-yellow-100 text-yellow-700'
                : wipStyles.badgeClass
            }`}
          >
            {config.wipLimit ? `${count}/${config.wipLimit}` : count}
          </span>
        </div>

        {/* WIP warning icon */}
        {isOverLimit && (
          <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0" aria-hidden="true" />
        )}
        {isNearLimit && !isOverLimit && (
          <TrendingUp className="h-4 w-4 text-yellow-600 flex-shrink-0" aria-hidden="true" />
        )}
      </div>

      {/* WIP Limit Warning - Over Limit */}
      <AnimatePresence>
        {isOverLimit && showWIPWarnings && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 bg-red-100 border-2 border-red-400 rounded-lg p-3"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-start gap-2">
              <AlertCircle className="h-4 w-4 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <p className="text-xs font-bold text-red-900">
                  WIP Limit Exceeded
                </p>
                <p className="text-xs text-red-700 mt-0.5">
                  {count} jobs (limit: {config.wipLimit})
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WIP Limit Warning - Near Limit */}
      <AnimatePresence>
        {isNearLimit && !isOverLimit && showWIPWarnings && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3 bg-yellow-100 border border-yellow-400 rounded-lg p-2"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center gap-2">
              <TrendingUp className="h-3.5 w-3.5 text-yellow-700 shrink-0" aria-hidden="true" />
              <p className="text-xs font-semibold text-yellow-800">
                Approaching limit ({count}/{config.wipLimit})
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Drop zone indicator */}
      <AnimatePresence>
        {isOver && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="mb-3 bg-gray-100 border-2 border-dashed border-gray-400 rounded-lg p-4 text-center"
          >
            <p className="text-xs font-semibold text-gray-700">Drop to move here</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Column Cards */}
      <AnimatePresence>
        {!isCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state for collapsed column */}
      {isCollapsed && count > 0 && (
        <div className="text-center py-4">
          <p className="text-xs text-gray-500">{count} cards</p>
        </div>
      )}
    </motion.div>
  )
}
