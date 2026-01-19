/**
 * Analytics Utilities
 *
 * Calculate metrics and statistics for job card analytics dashboard
 * - Completion rates
 * - Average cycle time
 * - Group by mechanic/status/priority
 * - Generate chart data
 */

import type { JobCardViewData } from '../../types/job-card-view.types'

/**
 * Calculate job completion rate
 */
export function calculateCompletionRate(jobCards: JobCardViewData[]): number {
  if (jobCards.length === 0) return 0

  const completedJobs = jobCards.filter(
    (jc) => jc.status === 'delivered' || jc.progressPercentage === 100
  ).length

  return Math.round((completedJobs / jobCards.length) * 100)
}

/**
 * Calculate average cycle time (in days)
 */
export function calculateAverageCycleTime(jobCards: JobCardViewData[]): number {
  const completedJobs = jobCards.filter((jc) => {
    return jc.status === 'delivered' && jc.createdAt && jc.actualCompletionDate
  })

  if (completedJobs.length === 0) return 0

  const totalDays = completedJobs.reduce((sum, job) => {
    const start = new Date(job.createdAt).getTime()
    const end = new Date(job.actualCompletionDate!).getTime()
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24))
    return sum + days
  }, 0)

  return Math.round(totalDays / completedJobs.length)
}

/**
 * Group job cards by status
 */
export function groupByStatus(jobCards: JobCardViewData[]): Record<string, number> {
  return jobCards.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * Group job cards by priority
 */
export function groupByPriority(jobCards: JobCardViewData[]): Record<string, number> {
  return jobCards.reduce((acc, job) => {
    acc[job.priority] = (acc[job.priority] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * Group job cards by mechanic
 */
export function groupByMechanic(jobCards: JobCardViewData[]): Record<string, number> {
  return jobCards.reduce((acc, job) => {
    const mechanicId = job.leadMechanicId || 'Unassigned'
    acc[mechanicId] = (acc[mechanicId] || 0) + 1
    return acc
  }, {} as Record<string, number>)
}

/**
 * Calculate mechanic performance metrics
 */
export function calculateMechanicPerformance(jobCards: JobCardViewData[]) {
  const grouped = groupByMechanic(jobCards)

  return Object.entries(grouped).map(([mechanicId, count]) => {
    const mechanicJobs = jobCards.filter(
      (jc) => jc.leadMechanicId === mechanicId
    )

    const completed = mechanicJobs.filter(
      (jc) => jc.status === 'delivered'
    ).length

    const avgProgress =
      mechanicJobs.reduce((sum, job) => sum + job.progressPercentage, 0) /
      mechanicJobs.length

    return {
      mechanicId,
      totalJobs: count,
      completed,
      inProgress: count - completed,
      avgProgress: Math.round(avgProgress),
      completionRate: Math.round((completed / count) * 100),
    }
  })
}

/**
 * Calculate status distribution for chart
 */
export function calculateStatusDistribution(jobCards: JobCardViewData[]) {
  const statusCounts = groupByStatus(jobCards)
  const total = jobCards.length

  return Object.entries(statusCounts)
    .map(([status, count]) => ({
      status,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => b.count - a.count)
}

/**
 * Calculate priority distribution for chart
 */
export function calculatePriorityDistribution(jobCards: JobCardViewData[]) {
  const priorityCounts = groupByPriority(jobCards)
  const total = jobCards.length

  return Object.entries(priorityCounts)
    .map(([priority, count]) => ({
      priority,
      count,
      percentage: Math.round((count / total) * 100),
    }))
    .sort((a, b) => {
      const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
      return priorityOrder[a.priority as keyof typeof priorityOrder] -
             priorityOrder[b.priority as keyof typeof priorityOrder]
    })
}

/**
 * Calculate jobs due soon (within 3 days)
 */
export function getJobsDueSoon(jobCards: JobCardViewData[]): JobCardViewData[] {
  const now = new Date()
  const threeDaysFromNow = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  return jobCards.filter((jc) => {
    if (!jc.promisedDate || jc.status === 'delivered') return false

    const promisedDate = new Date(jc.promisedDate)
    return promisedDate <= threeDaysFromNow && promisedDate >= now
  })
}

/**
 * Calculate overdue jobs
 */
export function getOverdueJobs(jobCards: JobCardViewData[]): JobCardViewData[] {
  const now = new Date()

  return jobCards.filter((jc) => {
    if (!jc.promisedDate || jc.status === 'delivered') return false

    const promisedDate = new Date(jc.promisedDate)
    return promisedDate < now
  })
}

/**
 * Calculate total revenue by status
 */
export function calculateRevenueByStatus(jobCards: JobCardViewData[]) {
  return jobCards.reduce((acc, job) => {
    acc[job.status] = (acc[job.status] || 0) + job.totalCost
    return acc
  }, {} as Record<string, number>)
}

/**
 * Generate analytics summary
 */
export function generateAnalyticsSummary(jobCards: JobCardViewData[]) {
  const totalJobs = jobCards.length
  const completionRate = calculateCompletionRate(jobCards)
  const avgCycleTime = calculateAverageCycleTime(jobCards)
  const dueSoon = getJobsDueSoon(jobCards).length
  const overdue = getOverdueJobs(jobCards).length
  const inProgress = jobCards.filter((jc) => jc.status === 'in_progress').length

  return {
    totalJobs,
    completionRate,
    avgCycleTime,
    dueSoon,
    overdue,
    inProgress,
  }
}

/**
 * Generate chart data for completion trends
 */
export function generateCompletionTrendData(
  jobCards: JobCardViewData[]
): Array<{ date: string; completed: number }> {
  // Group by completion date
  const completedByDate = jobCards
    .filter((jc) => jc.actualCompletionDate)
    .reduce((acc, job) => {
      const date = new Date(job.actualCompletionDate!)
        .toISOString()
        .split('T')[0]
      acc[date] = (acc[date] || 0) + 1
      return acc
    }, {} as Record<string, number>)

  // Convert to array and sort by date
  return Object.entries(completedByDate)
    .map(([date, completed]) => ({ date, completed }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Generate chart data for revenue trends
 */
export function generateRevenueTrendData(
  jobCards: JobCardViewData[]
): Array<{ date: string; revenue: number }> {
  // Group by completion date
  const revenueByDate = jobCards
    .filter((jc) => jc.actualCompletionDate)
    .reduce((acc, job) => {
      const date = new Date(job.actualCompletionDate!)
        .toISOString()
        .split('T')[0]
      acc[date] = (acc[date] || 0) + job.totalCost
      return acc
    }, {} as Record<string, number>)

  // Convert to array and sort by date
  return Object.entries(revenueByDate)
    .map(([date, revenue]) => ({ date, revenue }))
    .sort((a, b) => a.date.localeCompare(b.date))
}
