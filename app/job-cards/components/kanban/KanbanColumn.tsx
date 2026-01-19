'use client'

import { useDroppable } from '@dnd-kit/core'
import { AlertCircle, TrendingUp } from 'lucide-react'
import { useJobCardStore } from '../../lib/stores/job-card-store'

interface KanbanColumnProps {
  id: string
  title: string
  status: string
  color: string
  bgColor: string
  borderColor: string
  count: number
  wipLimit?: number
  children: React.ReactNode
}

export function KanbanColumn({
  id,
  title,
  status,
  color,
  bgColor,
  borderColor,
  count,
  wipLimit,
  children,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: status,
    data: {
      status,
    },
  })

  const { showWIPWarnings } = useJobCardStore()
  const isOverLimit = wipLimit && count >= wipLimit
  const isNearLimit = wipLimit && count >= wipLimit - 1 && count < wipLimit

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
      containerClass: bgColor,
      headerClass: color,
      badgeClass: `${color} ${bgColor.replace('50', '200')}`,
    }
  }

  const wipStyles = getWIPStatusStyles()

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-80 rounded-xl border-2 p-4 transition-all duration-200 ${
        isOverLimit
          ? 'border-red-400 bg-red-50 shadow-lg'
          : isNearLimit
          ? 'border-yellow-400 bg-yellow-50 hover:border-yellow-500'
          : `${wipStyles.containerClass} hover:border-gray-400`
      } ${
        isOver
          ? 'ring-4 ring-graphite-700 ring-opacity-50 scale-[1.02] shadow-xl'
          : ''
      }`}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <div className={`h-3 w-3 rounded-full ${color.replace('text-', 'bg-')}`} />
          <h3 className={`text-sm font-bold ${wipStyles.headerClass}`}>{title}</h3>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
              isOverLimit
                ? 'bg-red-100 text-red-700'
                : isNearLimit
                ? 'bg-yellow-100 text-yellow-700'
                : wipStyles.badgeClass
            }`}
          >
            {wipLimit ? `${count}/${wipLimit}` : count}
          </span>
        </div>
        {isOverLimit && (
          <AlertCircle className="h-4 w-4 text-red-600" aria-hidden="true" />
        )}
        {isNearLimit && !isOverLimit && (
          <TrendingUp className="h-4 w-4 text-yellow-600" aria-hidden="true" />
        )}
      </div>

      {/* WIP Limit Warning - Over Limit */}
      {isOverLimit && showWIPWarnings && (
        <div
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
                {count} jobs (limit: {wipLimit})
              </p>
            </div>
          </div>
        </div>
      )}

      {/* WIP Limit Warning - Near Limit */}
      {isNearLimit && !isOverLimit && showWIPWarnings && (
        <div
          className="mb-3 bg-yellow-100 border border-yellow-400 rounded-lg p-2"
          role="alert"
          aria-live="polite"
        >
          <div className="flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5 text-yellow-700 shrink-0" aria-hidden="true" />
            <p className="text-xs font-semibold text-yellow-800">
              Approaching limit ({count}/{wipLimit})
            </p>
          </div>
        </div>
      )}

      {/* Drop zone indicator */}
      {isOver && (
        <div className="mb-3 bg-graphite-700/10 border-2 border-dashed border-graphite-700 rounded-lg p-4 text-center">
          <p className="text-xs font-semibold text-graphite-700">Drop to move here</p>
        </div>
      )}

      {/* Column Cards */}
      <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto scrollbar-thin">
        {children}
      </div>
    </div>
  )
}
