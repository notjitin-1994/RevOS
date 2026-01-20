/**
 * Color Coding System for Calendar Events
 *
 * Provides semantic color system for job card statuses and priorities
 * Follows WCAG AA accessibility standards with proper contrast ratios
 */

export type JobCardStatus =
  | 'draft'
  | 'queued'
  | 'in_progress'
  | 'parts_waiting'
  | 'quality_check'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export type JobCardPriority = 'urgent' | 'high' | 'medium' | 'low'

/**
 * Status color configuration
 * Includes background, border, and text colors with accessibility support
 */
export const STATUS_COLORS: Record<
  JobCardStatus,
  {
    background: string
    backgroundHover: string
    border: string
    text: string
    label: string
    pattern?: 'stripes' | 'solid' | 'dots'
  }
> = {
  draft: {
    background: 'rgba(209, 213, 219, 0.8)', // gray-300
    backgroundHover: 'rgba(209, 213, 219, 1)',
    border: '#9CA3AF', // gray-400
    text: '#1F2937', // gray-800
    label: 'Draft',
    pattern: 'dots',
  },
  queued: {
    background: 'rgba(156, 163, 175, 0.8)', // gray-400
    backgroundHover: 'rgba(156, 163, 175, 1)',
    border: '#6B7280', // gray-500
    text: '#FFFFFF',
    label: 'Queued',
    pattern: 'solid',
  },
  in_progress: {
    background: 'rgba(59, 130, 246, 0.8)', // blue-500
    backgroundHover: 'rgba(59, 130, 246, 1)',
    border: '#2563EB', // blue-600
    text: '#FFFFFF',
    label: 'In Progress',
    pattern: 'solid',
  },
  parts_waiting: {
    background: 'rgba(245, 158, 11, 0.8)', // amber-500
    backgroundHover: 'rgba(245, 158, 11, 1)',
    border: '#D97706', // amber-600
    text: '#FFFFFF',
    label: 'Parts Waiting',
    pattern: 'stripes',
  },
  quality_check: {
    background: 'rgba(139, 92, 246, 0.8)', // violet-500
    backgroundHover: 'rgba(139, 92, 246, 1)',
    border: '#7C3AED', // violet-600
    text: '#FFFFFF',
    label: 'Quality Check',
    pattern: 'solid',
  },
  ready: {
    background: 'rgba(16, 185, 129, 0.8)', // emerald-500
    backgroundHover: 'rgba(16, 185, 129, 1)',
    border: '#059669', // emerald-600
    text: '#FFFFFF',
    label: 'Ready',
    pattern: 'solid',
  },
  delivered: {
    background: 'rgba(16, 185, 129, 0.6)', // emerald-500 lighter
    backgroundHover: 'rgba(16, 185, 129, 0.8)',
    border: '#10B981', // emerald-500
    text: '#FFFFFF',
    label: 'Delivered',
    pattern: 'solid',
  },
  cancelled: {
    background: 'rgba(239, 68, 68, 0.6)', // red-500 lighter
    backgroundHover: 'rgba(239, 68, 68, 0.8)',
    border: '#EF4444', // red-500
    text: '#FFFFFF',
    label: 'Cancelled',
    pattern: 'stripes',
  },
}

/**
 * Priority color configuration
 */
export const PRIORITY_COLORS: Record<
  JobCardPriority,
  {
    background: string
    backgroundHover: string
    border: string
    text: string
    label: string
    level: number
  }
> = {
  urgent: {
    background: 'rgba(239, 68, 68, 0.9)', // red-500
    backgroundHover: 'rgba(239, 68, 68, 1)',
    border: '#DC2626', // red-600
    text: '#FFFFFF',
    label: 'Urgent',
    level: 4,
  },
  high: {
    background: 'rgba(55, 65, 81, 0.9)', // graphite-700
    backgroundHover: 'rgba(55, 65, 81, 1)',
    border: '#374151', // graphite-700
    text: '#FFFFFF',
    label: 'High',
    level: 3,
  },
  medium: {
    background: 'rgba(107, 114, 128, 0.9)', // graphite-500
    backgroundHover: 'rgba(107, 114, 128, 1)',
    border: '#6B7280', // graphite-500
    text: '#FFFFFF',
    label: 'Medium',
    level: 2,
  },
  low: {
    background: 'rgba(156, 163, 175, 0.9)', // graphite-300
    backgroundHover: 'rgba(156, 163, 175, 1)',
    border: '#9CA3AF', // graphite-300
    text: '#FFFFFF',
    label: 'Low',
    level: 1,
  },
}

/**
 * Get color configuration for a status
 */
export function getStatusColor(status: string): typeof STATUS_COLORS[JobCardStatus] {
  return STATUS_COLORS[status as JobCardStatus] || STATUS_COLORS.queued
}

/**
 * Get color configuration for a priority
 */
export function getPriorityColor(priority: string): typeof PRIORITY_COLORS[JobCardPriority] {
  return PRIORITY_COLORS[priority as JobCardPriority] || PRIORITY_COLORS.medium
}

/**
 * Check if a job card is overdue
 */
export function isOverdue(promisedDate: Date | string | null, status: string): boolean {
  if (!promisedDate) return false

  const date = typeof promisedDate === 'string' ? new Date(promisedDate) : promisedDate
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Not overdue if already delivered or cancelled
  if (status === 'delivered' || status === 'cancelled') {
    return false
  }

  return date < today
}

/**
 * Get event colors combining priority and status
 * Priority determines main background, status determines border
 */
export function getEventColors(
  priority: string,
  status: string,
  promisedDate: Date | string | null
): {
  backgroundColor: string
  borderColor: string
  textColor: string
  isOverdue: boolean
} {
  const priorityConfig = getPriorityColor(priority)
  const statusConfig = getStatusColor(status)
  const overdue = isOverdue(promisedDate, status)

  let backgroundColor = priorityConfig.background
  let borderColor = statusConfig.border

  // Add visual indicator for overdue
  if (overdue) {
    borderColor = '#EF4444' // red-500
    backgroundColor = `repeating-linear-gradient(
      45deg,
      ${priorityConfig.background},
      ${priorityConfig.background} 10px,
      ${priorityConfig.background.replace('0.8', '0.6')} 10px,
      ${priorityConfig.background.replace('0.8', '0.6')} 20px
    )`
  }

  return {
    backgroundColor,
    borderColor,
    textColor: priorityConfig.text,
    isOverdue: overdue,
  }
}

/**
 * Generate CSS for visual patterns (stripes, dots)
 */
export function getPatternStyle(
  pattern: 'stripes' | 'solid' | 'dots' | undefined,
  baseColor: string
): React.CSSProperties {
  if (!pattern || pattern === 'solid') {
    return {}
  }

  if (pattern === 'stripes') {
    return {
      backgroundImage: `repeating-linear-gradient(
        45deg,
        ${baseColor},
        ${baseColor} 10px,
        ${baseColor.replace('0.8', '0.5')} 10px,
        ${baseColor.replace('0.8', '0.5')} 20px
      )`,
    }
  }

  if (pattern === 'dots') {
    return {
      backgroundImage: `radial-gradient(circle, ${baseColor.replace('0.8', '1')} 1px, transparent 1px)`,
      backgroundSize: '8px 8px',
    }
  }

  return {}
}

/**
 * Get progress percentage based on status
 */
export function getProgressPercentage(status: string): number {
  const progressMap: Record<string, number> = {
    draft: 0,
    queued: 10,
    in_progress: 50,
    parts_waiting: 60,
    quality_check: 80,
    ready: 95,
    delivered: 100,
    cancelled: 0,
  }

  return progressMap[status] || 0
}

/**
 * Get progress bar color based on percentage
 */
export function getProgressColor(percentage: number): string {
  if (percentage >= 100) return '#10B981' // emerald-500
  if (percentage >= 75) return '#3B82F6' // blue-500
  if (percentage >= 50) return '#8B5CF6' // violet-500
  if (percentage >= 25) return '#F59E0B' // amber-500
  return '#EF4444' // red-500
}

/**
 * Format Tailwind classes for event styling
 */
export function getEventClasses(
  priority: string,
  status: string,
  promisedDate: Date | string | null,
  isHovered = false
): string {
  const colors = getEventColors(priority, status, promisedDate)
  const baseClasses = 'rounded-lg transition-all duration-200'

  if (colors.isOverdue) {
    return `${baseClasses} border-2 border-red-500 shadow-lg`
  }

  return `${baseClasses} border-l-4`
}
