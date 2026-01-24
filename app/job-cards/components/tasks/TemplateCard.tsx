// ============================================================================
// Component: TemplateCard
// Description: Displays a single job card template as a card with add button
// ============================================================================

import React from 'react'
import { motion } from 'framer-motion'
import { Clock, IndianRupee, Layers, Package, Plus, Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { JobCardTemplate, TaskCategory, TaskPriority } from '@/lib/types/template.types'

interface TemplateCardProps {
  template: JobCardTemplate
  onAddToChecklist: (template: JobCardTemplate) => void
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

export function TemplateCard({ template, onAddToChecklist, className }: TemplateCardProps) {
  const priorityBadge = getPriorityBadge(template.priority)
  const estimatedTime = calculateTemplateTime(template)
  const estimatedCost = calculateTemplateCost(template)
  const subtasksCount = template.subtasks?.length || 0
  const partsCount = template.parts?.length || 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-graphite-700 hover:shadow-lg transition-all duration-200',
        className
      )}
    >
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
            <span className="font-medium">{subtasksCount} subtasks</span>
          </div>
        )}

        {/* Parts Count */}
        {partsCount > 0 && (
          <div className="flex items-center gap-1.5">
            <Package className="h-4 w-4" />
            <span className="font-medium">{partsCount} parts</span>
          </div>
        )}
      </div>

      {/* Add to Checklist Button */}
      <button
        onClick={() => onAddToChecklist(template)}
        className={cn(
          'w-full flex items-center justify-center gap-2',
          'px-4 py-2.5 bg-graphite-900 text-white font-semibold rounded-xl',
          'hover:bg-graphite-800 active:bg-graphite-900',
          'transition-all duration-200'
        )}
      >
        <Plus className="h-4 w-4" />
        Add to Checklist
      </button>

      {/* System Template Badge */}
      {template.is_system_template && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500 italic">
            System template • Used {template.usage_count} times
          </span>
        </div>
      )}
    </motion.div>
  )
}
