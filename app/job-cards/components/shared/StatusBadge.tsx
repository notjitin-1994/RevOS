import { JobCardStatus } from '@/lib/supabase/job-card-queries'

interface StatusBadgeProps {
  status: JobCardStatus
  size?: 'sm' | 'md'
}

export function StatusBadge({ status, size = 'sm' }: StatusBadgeProps) {
  const config = getStatusConfig(status)
  const sizeClasses = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md font-medium border ${sizeClasses} ${config.classes}`}
    >
      <config.icon />
      {config.label}
    </span>
  )
}

function getStatusConfig(status: JobCardStatus) {
  const configs = {
    draft: {
      label: 'Draft',
      classes: 'bg-gray-50 text-gray-600 border-gray-300',
      icon: DraftIcon,
    },
    queued: {
      label: 'Queued',
      classes: 'bg-gray-100 text-graphite-700 border-gray-300',
      icon: QueuedIcon,
    },
    in_progress: {
      label: 'In Progress',
      classes: 'bg-gray-200 text-graphite-800 border-gray-400',
      icon: InProgressIcon,
    },
    parts_waiting: {
      label: 'Parts Waiting',
      classes: 'bg-gray-300 text-graphite-900 border-gray-500',
      icon: PartsWaitingIcon,
    },
    quality_check: {
      label: 'Quality Check',
      classes: 'bg-gray-100 text-graphite-700 border-gray-400',
      icon: QualityCheckIcon,
    },
    ready: {
      label: 'Ready',
      classes: 'bg-gray-200 text-graphite-800 border-gray-400',
      icon: ReadyIcon,
    },
    delivered: {
      label: 'Delivered',
      classes: 'bg-gray-50 text-gray-600 border-gray-300',
      icon: DeliveredIcon,
    },
    cancelled: {
      label: 'Cancelled',
      classes: 'bg-gray-50 text-gray-500 border-gray-300',
      icon: CancelledIcon,
    },
  }

  return configs[status] || configs.draft
}

// Icon components
function DraftIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  )
}

function QueuedIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  )
}

function InProgressIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  )
}

function PartsWaitingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  )
}

function QualityCheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function ReadyIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 13l4 4L19 7" />
    </svg>
  )
}

function DeliveredIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

function CancelledIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}
