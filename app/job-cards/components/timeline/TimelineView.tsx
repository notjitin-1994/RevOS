/**
 * TimelineView Component - World-Class Gantt Calendar
 *
 * Production-ready Gantt Calendar management dashboard for RevvOS
 * Features:
 * - Resource swimlanes (service bays and mechanics)
 * - KPI dashboard with utilization metrics
 * - Interactive task bars with drag-drop support
 * - Conflict detection and visual indicators
 * - Capacity planning and bottleneck identification
 * - Real-time updates via Supabase subscriptions
 * - Responsive design for mobile and desktop
 */

'use client'

import React, { useState, useMemo, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AlertCircle, Loader2, Calendar, TrendingUp, AlertTriangle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { JobCardViewData } from '../../types/job-card-view.types'
import type {
  TimelineViewMode,
  GanttTask,
  Resource,
  ResourceSwimlane as ResourceSwimlaneType,
  ResourceType,
  TimelineKPIMetrics,
} from '../../types/timeline.types'
import {
  jobCardToGanttTask,
  createDefaultResources,
  groupTasksByResource,
  calculateTimelineKPIMetrics,
  detectTaskConflicts,
} from '../../types/timeline.types'
import { getViewDateRange, getTimelineColumnWidth, calculateTimelineWidth } from '../../lib/utils/timeline-utils'
import { useJobCardsRealtime } from '../../hooks/use-job-cards-realtime'
import { useUpdateJobCard } from '../../hooks/use-job-card-mutations'
import { TimelineHeader } from './TimelineHeader'
import { KPICards } from './KPICards'
import { ResourceSwimlanes } from './ResourceSwimlanes'
import { TaskBar, TaskBarTooltip } from './TaskBar'

interface TimelineViewProps {
  jobCards: JobCardViewData[]
  garageId: string
  isLoading?: boolean
}

interface Employee {
  id: string
  firstName: string
  lastName: string
  email?: string
  role?: string
  status?: string
}

export function TimelineView({ jobCards, garageId, isLoading = false }: TimelineViewProps) {
  const router = useRouter()
  const updateJobCard = useUpdateJobCard()

  // State
  const [viewMode, setViewMode] = useState<TimelineViewMode>('week')
  const [currentDate, setCurrentDate] = useState(new Date())
  const resourceType: ResourceType = 'mechanic' // Always use mechanic grouping
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null)
  const [employees, setEmployees] = useState<Employee[]>([])
  const [loadingEmployees, setLoadingEmployees] = useState(true)

  // Fetch employees data
  useEffect(() => {
    const fetchEmployees = async () => {
      if (!garageId) return

      try {
        setLoadingEmployees(true)
        const response = await fetch(`/api/employees/list?garageId=${garageId}`)
        if (!response.ok) {
          console.error('Failed to fetch employees')
          return
        }
        const result = await response.json()
        if (result.success) {
          setEmployees(result.employees || [])
        }
      } catch (error) {
        console.error('Error fetching employees:', error)
      } finally {
        setLoadingEmployees(false)
      }
    }

    fetchEmployees()
  }, [garageId])

  // Create employee name mapping
  const employeeNameMap = useMemo(() => {
    const map = new Map<string, string>()
    employees.forEach((emp) => {
      const fullName = `${emp.firstName} ${emp.lastName}`.trim()
      map.set(emp.id, fullName)
    })
    return map
  }, [employees])

  // Enable real-time updates
  useJobCardsRealtime({ garageId, enabled: true })

  // Handle task click
  const handleTaskClick = useCallback((taskId: string) => {
    router.push(`/job-cards/${taskId}`)
  }, [router])

  // Handle task date change (drag and drop)
  const handleTaskDateChange = useCallback(async (
    taskId: string,
    newStartDate: Date,
    newEndDate: Date
  ) => {
    try {
      await updateJobCard.mutateAsync({
        jobCardId: taskId,
        updates: {
          promisedDate: newEndDate.toISOString().split('T')[0],
        },
      })
    } catch (error) {
      console.error('Failed to update task date:', error)
    }
  }, [updateJobCard])

  // Handle refresh
  const handleRefresh = useCallback(() => {
    window.location.reload()
  }, [])

  // Transform job cards to Gantt tasks
  const tasks = useMemo(() => {
    console.log('🗂️ Transforming job cards to tasks:', {
      totalCards: jobCards.length,
      employeeMapSize: employeeNameMap.size,
    })

    return jobCards.map((jobCard) => {
      const task = jobCardToGanttTask(jobCard)

      // Assign task to mechanic
      if (task.leadMechanicId && employeeNameMap.has(task.leadMechanicId)) {
        // Valid mechanic assignment
        console.log(`✅ Task ${task.jobCardNumber} assigned to mechanic:`, employeeNameMap.get(task.leadMechanicId))
        return {
          ...task,
          resourceId: task.leadMechanicId,
          resourceType: 'mechanic' as ResourceType,
        }
      } else {
        // Invalid or no mechanic - mark as unassigned
        console.log(`⚠️ Task ${task.jobCardNumber} marked as unassigned (mechanicId: ${task.leadMechanicId})`)
        return {
          ...task,
          resourceId: 'unassigned',
          resourceType: 'mechanic' as ResourceType,
        }
      }
    })
  }, [jobCards, employeeNameMap])

  // Create resources - only mechanics (no bays)
  const resources = useMemo(() => {
    console.log('👷 Creating resources from job cards...')

    // Step 1: Collect all unique mechanic IDs from job cards
    const mechanicIds = new Set<string>()
    jobCards.forEach((card) => {
      if (card.leadMechanicId) {
        mechanicIds.add(card.leadMechanicId)
      }
    })

    console.log('Found mechanic IDs:', Array.from(mechanicIds))

    // Step 2: Build resources map with actual names
    const mechanicMap = new Map<string, { id: string; name: string }>()

    // First, add all valid mechanics (those that exist in employeeNameMap)
    mechanicIds.forEach((mechanicId) => {
      if (employeeNameMap.has(mechanicId)) {
        const mechanicName = employeeNameMap.get(mechanicId)!
        mechanicMap.set(mechanicId, { id: mechanicId, name: mechanicName })
        console.log(`✅ Added mechanic: ${mechanicName} (${mechanicId})`)
      } else {
        console.log(`⚠️ Mechanic ${mechanicId} not found in employeeNameMap`)
      }
    })

    // Step 3: Convert map to array with proper ordering
    const mechanics = Array.from(mechanicMap.values()).map((mechanic, index) => ({
      id: mechanic.id,
      name: mechanic.name,
      type: 'mechanic' as ResourceType,
      capacity: 3, // Can handle up to 3 jobs concurrently
      utilization: 0,
      order: index + 1,
      isActive: true,
    }))

    // Step 4: Add "Unassigned" resource for tasks without valid mechanic assignments
    mechanics.push({
      id: 'unassigned',
      name: 'Unassigned',
      type: 'mechanic' as ResourceType,
      capacity: 999, // No limit
      utilization: 0,
      order: mechanics.length + 1,
      isActive: true,
    })

    console.log(`📋 Created ${mechanics.length} resources (including Unassigned)`)

    return mechanics
  }, [jobCards, employeeNameMap])

  // No filtering needed since we only have mechanics now
  const filteredResources = resources

  // Group tasks by resource
  const swimlanes = useMemo(() => {
    return groupTasksByResource(tasks, filteredResources)
  }, [tasks, filteredResources])

  // Calculate KPI metrics
  const kpiMetrics = useMemo(() => {
    return calculateTimelineKPIMetrics(swimlanes, tasks)
  }, [swimlanes, tasks])

  // Detect conflicts
  const conflicts = useMemo(() => {
    return detectTaskConflicts(swimlanes)
  }, [swimlanes])

  // Get date range for current view
  const { start: viewStartDate, end: viewEndDate } = useMemo(
    () => getViewDateRange(viewMode, currentDate),
    [viewMode, currentDate]
  )

  // Calculate timeline dimensions
  const timelineWidth = useMemo(
    () => calculateTimelineWidth(viewMode, viewStartDate, viewEndDate),
    [viewMode, viewStartDate, viewEndDate]
  )

  // Calculate number of days to render (using local calendar days to avoid timezone issues)
  const timelineDays = useMemo(() => {
    // Use local calendar dates for consistent calculation
    const startLocal = new Date(viewStartDate.getFullYear(), viewStartDate.getMonth(), viewStartDate.getDate())
    const endLocal = new Date(viewEndDate.getFullYear(), viewEndDate.getMonth(), viewEndDate.getDate())

    const diffTime = endLocal.getTime() - startLocal.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    const days = diffDays + 1 // Include both start and end dates

    console.log('📊 Timeline dimensions:', {
      viewMode,
      timelineDays: days,
      viewStartDate: viewStartDate.toISOString(),
      viewEndDate: viewEndDate.toISOString(),
      startLocal: startLocal.toISOString(),
      endLocal: endLocal.toISOString(),
      diffDays,
      timelineWidth,
      columnWidth: getTimelineColumnWidth(viewMode),
    })
    return days
  }, [viewMode, viewStartDate, viewEndDate, timelineWidth])

  // Render task bar
  const renderTask = useCallback(
    (task: GanttTask, style: React.CSSProperties) => (
      <TaskBarTooltip task={task}>
        <TaskBar task={task} style={style} showDetailed={viewMode !== 'day'} />
      </TaskBarTooltip>
    ),
    [viewMode]
  )

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Loader2 className="h-12 w-12 text-gray-400 animate-spin mb-4" />
          <p className="text-gray-600">Loading Gantt Calendar...</p>
        </div>
      </div>
    )
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-12">
        <div className="flex flex-col items-center justify-center">
          <Calendar className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No job cards to display</h3>
          <p className="text-gray-600 mb-4">
            Create some job cards to see them on the Gantt Calendar
          </p>
          <button
            onClick={() => router.push('/job-cards/create')}
            className="px-4 py-2 bg-graphite-900 text-white rounded-lg hover:bg-graphite-800 transition-colors font-medium"
          >
            Create Job Card
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-card p-4 md:p-6">
      {/* Header */}
      <TimelineHeader
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        currentDate={currentDate}
        onDateChange={setCurrentDate}
        resourceType={resourceType}
        onResourceTypeChange={() => {}}
        onRefresh={handleRefresh}
      />

      {/* KPI Dashboard */}
      <KPICards metrics={kpiMetrics} />

      {/* Bottleneck Warnings */}
      <AnimatePresence>
        {(kpiMetrics.bottlenecks.length > 0 || conflicts.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-4"
          >
            <div className="bg-orange-50 border border-orange-300 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-900 mb-1">Capacity Warnings</h4>
                  <ul className="text-sm text-orange-800 space-y-1">
                    {kpiMetrics.bottlenecks.length > 0 && (
                      <li>
                        <strong>High utilization:</strong> {kpiMetrics.bottlenecks.join(', ')}
                      </li>
                    )}
                    {conflicts.length > 0 && (
                      <li>
                        <strong>Scheduling conflicts:</strong> {conflicts.length} conflicting
                        assignment{conflicts.length !== 1 ? 's' : ''} detected
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Timeline Container */}
      <div className="overflow-hidden rounded-lg border border-gray-300">
        {/* Scrollable Timeline */}
        <div className="overflow-x-auto scrollbar-hide touch-pan-x">
          <div style={{ width: `${Math.max(timelineWidth, 1200)}px`, minWidth: '100%' }}>
            {/* Date Header */}
            <div className="bg-gray-50 border-b border-gray-300 sticky top-0 z-10">
              <div className="flex">
                {Array.from({ length: timelineDays }).map((_, index) => {
                  const date = new Date(viewStartDate)
                  date.setDate(date.getDate() + index)
                  const isToday = date.toDateString() === new Date().toDateString()
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6

                  // Log first and last dates being rendered
                  if (index === 0 || index === timelineDays - 1) {
                    console.log(`📅 Rendering date column ${index + 1}/${timelineDays}:`, {
                      date: date.toISOString(),
                      display: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                      isToday,
                      isWeekend,
                    })
                  }

                  return (
                    <div
                      key={index}
                      className={`
                        flex-shrink-0 px-2 md:px-3 py-2 text-center border-r border-gray-200 last:border-r-0
                        ${isToday ? 'bg-blue-100' : ''}
                        ${isWeekend ? 'bg-gray-100/50' : ''}
                      `}
                      style={{ width: `${getTimelineColumnWidth(viewMode)}px` }}
                    >
                      <div className={`text-xs font-medium ${isToday ? 'text-blue-700' : 'text-gray-700'}`}>
                        {date.toLocaleDateString('en-US', { month: 'short' })}
                      </div>
                      <div className={`text-base md:text-lg font-bold ${isToday ? 'text-blue-900' : 'text-gray-900'}`}>
                        {date.getDate()}
                      </div>
                      <div className="text-xs text-gray-500 hidden sm:block">
                        {date.toLocaleDateString('en-US', { weekday: 'short' })}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Resource Swimlanes */}
            <div className="max-h-[600px] overflow-y-auto">
              <ResourceSwimlanes
                swimlanes={swimlanes}
                viewStartDate={viewStartDate}
                viewEndDate={viewEndDate}
                viewMode={viewMode}
                timelineDays={timelineDays}
                onTaskClick={handleTaskClick}
                renderTask={renderTask}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-6">
        {/* Mobile: Grid layout */}
        <div className="grid grid-cols-2 gap-3 md:hidden">
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-400 flex-shrink-0" />
            <span className="text-sm text-gray-700">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Queued</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-600 flex-shrink-0" />
            <span className="text-sm text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-700 flex-shrink-0" />
            <span className="text-sm text-gray-700">Parts Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-800 flex-shrink-0" />
            <span className="text-sm text-gray-700">Quality Check</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 rounded bg-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-700">Ready</span>
          </div>
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-400" />
            <span className="text-gray-700">Draft</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500" />
            <span className="text-gray-700">Queued</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-600" />
            <span className="text-gray-700">In Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-700" />
            <span className="text-gray-700">Parts Waiting</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-800" />
            <span className="text-gray-700">Quality Check</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-500" />
            <span className="text-gray-700">Ready</span>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="text-sm font-semibold text-gray-900">Quick Actions:</h3>
          <button
            onClick={() => router.push('/job-cards/create')}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            + New Job Card
          </button>
          <button
            onClick={() => router.push('/job-cards')}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            View All Cards
          </button>
        </div>
      </div>
    </div>
  )
}
