import type { JobCardViewData } from '../../types/job-card-view.types'

export type SwimlaneType = 'priority' | 'mechanic' | 'none'
export type Priority = 'urgent' | 'high' | 'medium' | 'low'

/**
 * Groups job cards by priority level
 * Returns a record with priority levels as keys and job cards as values
 */
export function groupJobCardsByPriority(jobCards: JobCardViewData[]): Record<Priority, JobCardViewData[]> {
  const groups: Record<Priority, JobCardViewData[]> = {
    urgent: [],
    high: [],
    medium: [],
    low: [],
  }

  for (const jobCard of jobCards) {
    const priority = (jobCard.priority || 'medium').toLowerCase() as Priority
    if (groups[priority]) {
      groups[priority].push(jobCard)
    } else {
      // Default to medium if invalid priority
      groups.medium.push(jobCard)
    }
  }

  return groups
}

/**
 * Groups job cards by lead mechanic name
 * Returns a record with mechanic names as keys and job cards as values
 */
export function groupJobCardsByMechanic(jobCards: JobCardViewData[]): Record<string, JobCardViewData[]> {
  const groups: Record<string, JobCardViewData[]> = {}

  for (const jobCard of jobCards) {
    // Use mechanic name if available, otherwise use 'Unassigned'
    const mechanicName = jobCard.leadMechanicId || 'Unassigned'

    if (!groups[mechanicName]) {
      groups[mechanicName] = []
    }

    groups[mechanicName].push(jobCard)
  }

  return groups
}

/**
 * Gets the display label for a swimlane group
 */
export function getSwimlaneLabel(type: SwimlaneType, group: string): string {
  if (type === 'priority') {
    const priorityLabels: Record<string, string> = {
      urgent: '🔴 Urgent',
      high: '🟠 High',
      medium: '🟡 Medium',
      low: '🟢 Low',
    }
    return priorityLabels[group] || group
  }

  if (type === 'mechanic') {
    if (group === 'unassigned') {
      return '👤 Unassigned'
    }
    return `👨‍🔧 ${group}`
  }

  return group
}

/**
 * Gets the priority order for sorting swimlanes
 */
export function getSwimlaneOrder(type: SwimlaneType, group: string): number {
  if (type === 'priority') {
    const priorityOrder: Record<string, number> = {
      urgent: 0,
      high: 1,
      medium: 2,
      low: 3,
    }
    return priorityOrder[group] ?? 999
  }

  if (type === 'mechanic') {
    // Unassigned should be last
    return group === 'unassigned' ? 999 : 0
  }

  return 0
}

/**
 * Sorts swimlane groups according to their natural order
 */
export function sortSwimlaneGroups(
  type: SwimlaneType,
  groups: Record<string, JobCardViewData[]>
): Array<{ group: string; cards: JobCardViewData[] }> {
  return Object.entries(groups)
    .map(([group, cards]) => ({ group, cards }))
    .sort((a, b) => {
      const orderA = getSwimlaneOrder(type, a.group)
      const orderB = getSwimlaneOrder(type, b.group)
      return orderA - orderB
    })
}

/**
 * Gets statistics for a swimlane group
 */
export function getSwimlaneStats(cards: JobCardViewData[]): {
  total: number
  inProgress: number
  completed: number
  urgent: number
} {
  return {
    total: cards.length,
    inProgress: cards.filter((c) => c.status === 'in_progress').length,
    completed: cards.filter((c) => ['ready', 'delivered'].includes(c.status)).length,
    urgent: cards.filter((c) => c.priority === 'urgent').length,
  }
}
