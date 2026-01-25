// ============================================================================
// Component: TemplateCard (Enhanced with Recommendations)
// Description: Displays a single job card template as a card with add button and recommendation badges
// ============================================================================

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Clock, IndianRupee, Layers, Package, Plus, Sparkles, TrendingUp, Check, Link2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JobCardTemplate, TaskCategory, TaskPriority } from '@/lib/types/template.types'

interface TemplateCardProps {
  template: JobCardTemplate
  onAddToChecklist: (template: JobCardTemplate) => void
  isRecommended?: boolean
  recommendationReasons?: string[]
  recommendationScore?: number
  recommendationRank?: number
  className?: string
}

/**
 * Get category icon component
 */
function getCategoryIcon(category: TaskCategory): React.ReactNode {
  const icons = {
    Engine: <Sparkles className="h-4 w-4" />,
    Electrical: <Layers className="h-4 w-4" />,
    Body: <Package className="h-4 w-4" />,
    Maintenance: <Clock className="h-4 w-4" />,
    Diagnostic: <Sparkles className="h-4 w-4" />,
    Custom: <Sparkles className="h-4 w-4" />,
  }
  return icons[category] || <Package className="h-4 w-4" />
}

/**
 * Get priority badge styles
 */
function getPriorityBadge(priority: TaskPriority): { bg: string; text: string } {
  const styles = {
    low: { bg: 'bg-green-100', text: 'text-green-700' },
    medium: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
    high: { bg: 'bg-orange-100', text: 'text-orange-700' },
    urgent: { bg: 'bg-red-100', text: 'text-red-700' },
  }
  return styles[priority]
}

/**
 * Calculate total estimated time for a template
 */
function calculateTemplateTime(template: JobCardTemplate): number {
  const subtaskTime = template.subtasks?.reduce((sum, st) => sum + st.estimated_minutes, 0) || 0
  return subtaskTime > 0 ? subtaskTime : template.estimated_minutes
}

/**
 * Calculate total cost for a template
 */
function calculateTemplateCost(template: JobCardTemplate): number {
  const time = calculateTemplateTime(template)
  const laborCost = Math.round((time / 60) * template.labor_rate)
  const partsCost = template.parts?.reduce((sum, p) => sum + (p.quantity * p.unit_cost), 0) || 0
  return laborCost + partsCost
}

export function TemplateCard({
  template,
  onAddToChecklist,
  isRecommended = false,
  recommendationReasons = [],
  recommendationScore = 0,
  recommendationRank = 0,
  className
}: TemplateCardProps) {
  const [isAdded, setIsAdded] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const priorityBadge = getPriorityBadge(template.priority)
  const estimatedTime = calculateTemplateTime(template)
  const estimatedCost = calculateTemplateCost(template)
  const subtasksCount = template.subtasks?.length || 0
  const partsCount = template.parts?.length || 0

  const handleAddToChecklist = () => {
    // Add to checklist (recording is handled in TemplatesList)
    onAddToChecklist(template)

    // Show success animation
    setIsAdded(true)
    setShowSuccess(true)

    setTimeout(() => {
      setShowSuccess(false)
    }, 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'relative bg-white border-2 rounded-xl p-4 transition-all duration-200 group',
        isRecommended
          ? 'border-brand hover:shadow-glow'
          : 'border-gray-200 hover:border-graphite-700 hover:shadow-lg',
        isAdded && 'ring-2 ring-green-500 ring-offset-2',
        className
      )}
    >
      {/* Recommended Badge */}
      {isRecommended && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="flex items-center gap-1 px-2.5 py-1 bg-brand rounded-full shadow-glow border-2 border-brand">
            <Sparkles className="h-3 w-3 text-graphite-900" />
            <span className="text-xs font-bold text-graphite-900">#{recommendationRank}</span>
          </div>
        </div>
      )}

      {/* Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-green-500/90 rounded-xl flex items-center justify-center z-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
              className="flex items-center gap-2 text-white"
            >
              <Check className="h-6 w-6" />
              <span className="font-semibold">Added!</span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header: Name and Priority Badge */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-bold text-gray-900 truncate">
            {template.name}
          </h3>
          {template.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {template.description}
            </p>
          )}
        </div>
        <span
          className={cn(
            'px-3 py-1 rounded-full text-xs font-semibold uppercase shrink-0',
            priorityBadge.bg,
            priorityBadge.text
          )}
        >
          {template.priority}
        </span>
      </div>

      {/* Category Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-graphite-100 text-graphite-700 rounded-full text-xs font-semibold uppercase">
          {getCategoryIcon(template.category)}
          {template.category}
        </span>
      </div>

      {/* Recommendation Reasons */}
      {isRecommended && recommendationReasons.length > 0 && (
        <div className="mb-3 p-2 bg-brand/20 rounded-lg border border-brand">
          <div className="flex items-center gap-1.5 mb-1.5">
            <TrendingUp className="h-3.5 w-3.5 text-graphite-900" />
            <span className="text-xs font-semibold text-graphite-900">Why recommended</span>
          </div>
          <ul className="space-y-0.5">
            {recommendationReasons.slice(0, 2).map((reason, idx) => (
              <li key={idx} className="text-xs text-graphite-900 flex items-start gap-1.5">
                <span className="text-graphite-700">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Tags */}
      {template.tags && template.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {template.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs"
            >
              {tag}
            </span>
          ))}
          {template.tags.length > 3 && (
            <span className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded text-xs">
              +{template.tags.length - 3}
            </span>
          )}
        </div>
      )}

      {/* Stats Row */}
      <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
        {/* Time */}
        <div className="flex items-center gap-1.5">
          <Clock className="h-4 w-4" />
          <span className="font-medium">{estimatedTime} min</span>
        </div>

        {/* Cost */}
        <div className="flex items-center gap-1.5">
          <IndianRupee className="h-4 w-4" />
          <span className="font-medium">{estimatedCost.toLocaleString()}</span>
        </div>

        {/* Subtasks Count */}
        {subtasksCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Layers className="h-4 w-4" />
            <span className="font-medium">{subtasksCount}</span>
          </div>
        )}

        {/* Parts Count */}
        {partsCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            <span className="font-medium">{partsCount}</span>
          </div>
        )}
      </div>

      {/* Add to Checklist Button */}
      <button
        onClick={handleAddToChecklist}
        disabled={isAdded}
        className={cn(
          'w-full flex items-center justify-center gap-2',
          'px-4 py-2.5 font-semibold rounded-xl',
          'transition-all duration-200',
          isRecommended
            ? 'bg-graphite-900 text-white hover:bg-graphite-800'
            : 'bg-graphite-900 text-white hover:bg-graphite-800',
          isAdded && 'opacity-50 cursor-not-allowed'
        )}
      >
        {isAdded ? (
          <>
            <Check className="h-4 w-4" />
            Added
          </>
        ) : (
          <>
            <Link2 className="h-4 w-4" />
            Connect & Add
          </>
        )}
      </button>

      {/* System Template Badge */}
      {template.is_system_template && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span className="italic">System template</span>
            <span>Used {template.usage_count} times</span>
          </div>
        </div>
      )}

      {/* Recommendation Score (Debug - hidden in production) */}
      {isRecommended && process.env.NODE_ENV === 'development' && (
        <div className="mt-2 pt-2 border-t border-gray-100">
          <span className="text-xs text-gray-400">
            Score: {recommendationScore.toFixed(1)}
          </span>
        </div>
      )}
    </motion.div>
  )
}
