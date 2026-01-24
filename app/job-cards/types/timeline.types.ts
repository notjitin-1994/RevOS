/**
 * Timeline/Gantt Chart Types
 *
 * Type definitions for the Timeline/Gantt view components
 * World-class Gantt Calendar with resource swimlanes
 */

import type { JobCardViewData } from './job-card-view.types'

/**
 * Timeline view modes
 */
export type TimelineViewMode = 'day' | 'week' | 'month'

/**
 * Resource types for swimlanes
 */
export type ResourceType = 'bay' | 'mechanic'

/**
 * Gantt task interface
 * Maps job card data to Gantt chart tasks
 */
export interface GanttTask {
  id: string
  name: string
  start: Date
  end: Date
  progress: number
  dependencies: string[] // Array of task IDs this task depends on
  color: string
  disabled?: boolean
  // Resource assignment
  resourceId?: string // Bay ID or Mechanic ID
  resourceType?: ResourceType
  // Additional job card data
  jobCardNumber: string
  priority: string
  status: string
  customerName: string
  vehicleMake: string
  vehicleModel: string
  promisedDate?: string
  estimatedCost: number
  actualCost?: number
  leadMechanicId?: string | null
  bayAssigned?: string | null
}

/**
 * Resource interface for swimlanes
 */
export interface Resource {
  id: string
  name: string
  type: ResourceType
  capacity: number // Maximum concurrent jobs
  utilization: number // Current utilization percentage
  avatarUrl?: string // For mechanics
  order: number // Display order
  isActive: boolean
}

/**
 * Resource swimlane configuration
 */
export interface ResourceSwimlane {
  resource: Resource
  tasks: GanttTask[]
  totalCapacity: number
  usedCapacity: number
  utilizationPercentage: number
  isOverloaded: boolean
}

/**
 * Task dependency relationship
 */
export interface TaskDependency {
  from: string // Task ID
  to: string // Task ID
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish' | 'start-to-finish'
}

/**
 * Timeline update event
 * Fired when a task is dragged or resized in the timeline
 */
export interface TimelineUpdateEvent {
  taskId: string
  startDate: Date
  endDate: Date
  progress?: number
  resourceId?: string
  resourceType?: ResourceType
}

/**
 * Timeline header props
 */
export interface TimelineHeaderProps {
  viewMode: TimelineViewMode
  onViewModeChange: (mode: TimelineViewMode) => void
  currentDate: Date
  onDateChange: (date: Date) => void
  resourceType: ResourceType
  onResourceTypeChange: (type: ResourceType) => void
  onRefresh?: () => void
}

/**
 * KPI metrics for dashboard
 */
export interface TimelineKPIMetrics {
  totalJobs: number
  inProgress: number
  completedToday: number
  overdueJobs: number
  totalRevenue: number
  revenueToday: number
  averageUtilization: number
  overloadedResources: number
  bottlenecks: string[]
}

/**
 * Conflict detection result
 */
export interface TaskConflict {
  taskId: string
  conflictingTaskIds: string[]
  resourceId: string
  reason: 'overlapping' | 'capacity-exceeded' | 'unavailable'
  severity: 'warning' | 'error'
}

/**
 * Capacity prediction
 */
export interface CapacityPrediction {
  resourceId: string
  resourceName: string
  date: string
  predictedUtilization: number
  status: 'available' | 'busy' | 'overloaded'
  recommendations: string[]
}

/**
 * Transform job card to Gantt task
 */
export function jobCardToGanttTask(jobCard: JobCardViewData): GanttTask {
  // Use createdAt as start date for all jobs (more consistent)
  const startDate = new Date(jobCard.createdAt)

  // Use promisedDate as end date, or default to 3 days from start
  let endDate = jobCard.promisedDate
    ? new Date(jobCard.promisedDate)
    : new Date(startDate.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Ensure end date is after start date
  if (endDate <= startDate) {
    endDate = new Date(startDate.getTime() + 1 * 24 * 60 * 60 * 1000) // Minimum 1 day duration
  }

  return {
    id: jobCard.id,
    name: `${jobCard.jobCardNumber} - ${jobCard.vehicleMake} ${jobCard.vehicleModel}`,
    start: startDate,
    end: endDate,
    progress: jobCard.progressPercentage || 0,
    dependencies: [], // Dependencies can be added later based on business logic
    color: getTaskColor(jobCard.status),
    disabled: jobCard.status === 'delivered' || jobCard.status === 'cancelled',
    // Additional data
    jobCardNumber: jobCard.jobCardNumber,
    priority: jobCard.priority,
    status: jobCard.status,
    customerName: jobCard.customerName,
    vehicleMake: jobCard.vehicleMake,
    vehicleModel: jobCard.vehicleModel,
    promisedDate: jobCard.promisedDate || undefined,
    estimatedCost: jobCard.totalCost,
    leadMechanicId: jobCard.leadMechanicId,
    bayAssigned: undefined,
    // Assign to resource - will be overridden by TimelineView logic
    resourceId: jobCard.leadMechanicId || undefined,
    resourceType: 'mechanic',
  }
}

/**
 * Get task color based on job card status
 * Uses graphite color palette (NOT lime)
 */
function getTaskColor(status: string): string {
  const colorMap: Record<string, string> = {
    draft: '#9CA3AF', // gray-400
    queued: '#6B7280', // gray-500 (graphite-500 equivalent)
    in_progress: '#4B5563', // gray-600 (graphite-600)
    parts_waiting: '#374151', // gray-700 (graphite-700)
    quality_check: '#1F2937', // gray-800 (graphite-800)
    ready: '#6B7280', // gray-500 (graphite-500 equivalent)
    delivered: '#9CA3AF', // gray-400
    cancelled: '#D1D5DB', // gray-300
  }

  return colorMap[status] || '#9CA3AF'
}

/**
 * Calculate task duration in days
 */
export function calculateTaskDuration(start: Date, end: Date): number {
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Validate task dates
 */
export function validateTaskDates(start: Date, end: Date): boolean {
  return end > start
}

/**
 * Create default resources for a garage
 * This will be replaced with actual data from the garage table
 */
export function createDefaultResources(numBays: number = 3, mechanics: Array<{ id: string; name: string }> = []): Resource[] {
  const resources: Resource[] = []

  // Create bay resources
  for (let i = 1; i <= numBays; i++) {
    resources.push({
      id: `bay-${i}`,
      name: `Bay ${i}`,
      type: 'bay',
      capacity: 1, // One job at a time per bay
      utilization: 0,
      order: i,
      isActive: true,
    })
  }

  // Create mechanic resources
  mechanics.forEach((mechanic, index) => {
    resources.push({
      id: mechanic.id,
      name: mechanic.name,
      type: 'mechanic',
      capacity: 3, // Can handle up to 3 jobs concurrently
      utilization: 0,
      order: numBays + index + 1,
      isActive: true,
    })
  })

  return resources
}

/**
 * Group tasks by resource
 */
export function groupTasksByResource(tasks: GanttTask[], resources: Resource[]): ResourceSwimlane[] {
  console.log('📊 Grouping tasks by resources:', {
    totalTasks: tasks.length,
    totalResources: resources.length,
    resourceIds: resources.map(r => r.id),
  })

  const swimlanes = resources.map((resource) => {
    const resourceTasks = tasks.filter(
      (task) => task.resourceId === resource.id
    )

    console.log(`Resource "${resource.name}" (${resource.id}):`, {
      tasks: resourceTasks.map(t => t.jobCardNumber),
      count: resourceTasks.length,
    })

    const usedCapacity = resourceTasks.length
    const utilizationPercentage = Math.min(
      100,
      Math.round((usedCapacity / resource.capacity) * 100)
    )
    const isOverloaded = usedCapacity > resource.capacity

    return {
      resource,
      tasks: resourceTasks,
      totalCapacity: resource.capacity,
      usedCapacity,
      utilizationPercentage,
      isOverloaded,
    }
  })

  // Log summary
  const totalTasksAssigned = swimlanes.reduce((sum, s) => sum + s.tasks.length, 0)
  console.log(`✅ Grouped ${totalTasksAssigned}/${tasks.length} tasks into ${swimlanes.length} swimlanes`)

  return swimlanes
}

/**
 * Detect conflicts in task assignments
 */
export function detectTaskConflicts(swimlanes: ResourceSwimlane[]): TaskConflict[] {
  const conflicts: TaskConflict[] = []

  swimlanes.forEach((swimlane) => {
    if (swimlane.isOverloaded) {
      // All tasks in this swimlane have a capacity conflict
      swimlane.tasks.forEach((task) => {
        conflicts.push({
          taskId: task.id,
          conflictingTaskIds: swimlane.tasks
            .filter((t) => t.id !== task.id)
            .map((t) => t.id),
          resourceId: swimlane.resource.id,
          reason: 'capacity-exceeded',
          severity: 'error',
        })
      })
    }

    // Check for overlapping tasks within the same resource
    const tasks = swimlane.tasks
    for (let i = 0; i < tasks.length; i++) {
      for (let j = i + 1; j < tasks.length; j++) {
        const task1 = tasks[i]
        const task2 = tasks[j]

        // Check if tasks overlap in time
        const overlap =
          task1.start < task2.end && task2.start < task1.end

        if (overlap && swimlane.resource.type === 'bay') {
          // Bays cannot have overlapping jobs
          conflicts.push({
            taskId: task1.id,
            conflictingTaskIds: [task2.id],
            resourceId: swimlane.resource.id,
            reason: 'overlapping',
            severity: 'error',
          })
        }
      }
    }
  })

  return conflicts
}

/**
 * Calculate KPI metrics for the timeline
 */
export function calculateTimelineKPIMetrics(
  swimlanes: ResourceSwimlane[],
  tasks: GanttTask[]
): TimelineKPIMetrics {
  const totalJobs = tasks.length
  const inProgress = tasks.filter((t) => t.progress > 0 && t.progress < 100).length
  const completedToday = tasks.filter((t) => {
    const endDate = new Date(t.end)
    const today = new Date()
    return t.progress === 100 && endDate.toDateString() === today.toDateString()
  }).length

  const overdueJobs = tasks.filter((t) => {
    const endDate = new Date(t.end)
    const today = new Date()
    return endDate < today && t.progress < 100
  }).length

  const totalRevenue = tasks.reduce((sum, task) => sum + task.estimatedCost, 0)

  const revenueToday = tasks
    .filter((t) => {
      const endDate = new Date(t.end)
      const today = new Date()
      return endDate.toDateString() === today.toDateString()
    })
    .reduce((sum, task) => sum + task.estimatedCost, 0)

  const averageUtilization =
    swimlanes.length > 0
      ? Math.round(
          swimlanes.reduce((sum, s) => sum + s.utilizationPercentage, 0) /
            swimlanes.length
        )
      : 0

  const overloadedResources = swimlanes.filter((s) => s.isOverloaded).length

  // Identify bottlenecks (resources with high utilization)
  const bottlenecks = swimlanes
    .filter((s) => s.utilizationPercentage >= 80)
    .map((s) => s.resource.name)

  return {
    totalJobs,
    inProgress,
    completedToday,
    overdueJobs,
    totalRevenue,
    revenueToday,
    averageUtilization,
    overloadedResources,
    bottlenecks,
  }
}
