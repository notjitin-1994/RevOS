import { Priority } from '@/lib/supabase/job-card-queries'
import { AlertCircle } from 'lucide-react'

interface PriorityBadgeProps {
  priority: Priority
  size?: 'sm' | 'md'
}

export function PriorityBadge({ priority, size = 'sm' }: PriorityBadgeProps) {
  const config = getPriorityConfig(priority)
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${sizeClasses} ${config.classes}`}>
      <config.icon />
      {config.label}
    </span>
  )
}

function getPriorityConfig(priority: Priority) {
  const configs = {
    urgent: {
      label: 'Urgent',
      classes: 'bg-gray-300 text-graphite-900 border-gray-500',
      icon: () => <AlertCircle className="h-3 w-3" />,
    },
    high: {
      label: 'High',
      classes: 'bg-gray-200 text-graphite-800 border-gray-400',
      icon: () => <AlertCircle className="h-3 w-3" />,
    },
    medium: {
      label: 'Medium',
      classes: 'bg-gray-100 text-graphite-700 border-gray-300',
      icon: () => <AlertCircle className="h-3 w-3" />,
    },
    low: {
      label: 'Low',
      classes: 'bg-gray-50 text-graphite-600 border-gray-300',
      icon: () => <AlertCircle className="h-3 w-3" />,
    },
  }

  return configs[priority] || configs.medium
}
