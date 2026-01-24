/**
 * ResourceSwimlanes Component
 *
 * Displays resource swimlanes for the Gantt Calendar
 * Shows mechanics as horizontal rows with their tasks
 */

'use client'

import React, { useState } from 'react'
import { User, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react'
import type { ResourceSwimlane as ResourceSwimlaneType, GanttTask, TimelineViewMode } from '../../types/timeline.types'
import { getTimelineColumnWidth } from '../../lib/utils/timeline-utils'

interface ResourceSwimlanesProps {
  swimlanes: ResourceSwimlaneType[]
  viewStartDate: Date
  viewEndDate: Date
  viewMode: TimelineViewMode
  timelineDays?: number // Pre-calculated number of days for consistency
  onTaskClick: (taskId: string) => void
  renderTask: (task: GanttTask, style: React.CSSProperties) => React.ReactNode
}

export function ResourceSwimlanes({
  swimlanes,
  viewStartDate,
  viewEndDate,
  viewMode,
  timelineDays: propTimelineDays,
  onTaskClick,
  renderTask,
}: ResourceSwimlanesProps) {
  const [collapsedSwimlanes, setCollapsedSwimlanes] = useState<Set<string>>(new Set())

  const toggleCollapse = (resourceId: string) => {
    setCollapsedSwimlanes((prev) => {
      const next = new Set(prev)
      if (next.has(resourceId)) {
        next.delete(resourceId)
      } else {
        next.add(resourceId)
      }
      return next
    })
  }

  const columnWidth = getTimelineColumnWidth(viewMode)
  // Use propTimelineDays if provided, otherwise calculate locally using local calendar days
  const timelineDays = propTimelineDays ?? (() => {
    const startLocal = new Date(viewStartDate.getFullYear(), viewStartDate.getMonth(), viewStartDate.getDate())
    const endLocal = new Date(viewEndDate.getFullYear(), viewEndDate.getMonth(), viewEndDate.getDate())
    const diffTime = endLocal.getTime() - startLocal.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    return diffDays + 1
  })()

  console.log('🎨 Rendering ResourceSwimlanes:', {
    swimlaneCount: swimlanes.length,
    timelineDays,
    propTimelineDays,
    columnWidth,
    viewStartDate: viewStartDate.toISOString(),
    viewEndDate: viewEndDate.toISOString(),
  })

  return (
    <div className="border border-gray-300 rounded-lg overflow-hidden bg-white">
      {swimlanes.map((swimlane, index) => {
        const isCollapsed = collapsedSwimlanes.has(swimlane.resource.id)
        const hasTasks = swimlane.tasks.length > 0
        const utilizationColor = getUtilizationColor(swimlane.utilizationPercentage)

        console.log(`📋 Swimlane: ${swimlane.resource.name} - ${swimlane.tasks.length} tasks`)

        return (
          <div
            key={swimlane.resource.id}
            className={`
              border-b border-gray-200 last:border-b-0
              ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}
            `}
          >
            {/* Resource Header */}
            <div
              className={`
                flex items-center justify-between px-4 py-3
                hover:bg-gray-50 transition-colors cursor-pointer
                ${isCollapsed ? 'border-b-0' : 'border-b border-gray-200'}
              `}
              onClick={() => toggleCollapse(swimlane.resource.id)}
            >
              <div className="flex items-center gap-3">
                {/* Resource Icon */}
                <div className="p-2 rounded-lg bg-purple-50">
                  <User className="h-5 w-5 text-purple-600" />
                </div>

                {/* Resource Info */}
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-gray-900">
                      {swimlane.resource.name}
                    </h3>
                    {swimlane.isOverloaded && (
                      <AlertCircle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-600">
                    <span>
                      {swimlane.usedCapacity} / {swimlane.totalCapacity} jobs
                    </span>
                    <span className={`
                      font-medium ${utilizationColor}
                    `}>
                      {swimlane.utilizationPercentage}% utilized
                    </span>
                  </div>
                </div>
              </div>

              {/* Collapse Toggle */}
              <button className="p-1 hover:bg-gray-100 rounded-lg transition-colors">
                {isCollapsed ? (
                  <ChevronDown className="h-5 w-5 text-gray-500" />
                ) : (
                  <ChevronUp className="h-5 w-5 text-gray-500" />
                )}
              </button>
            </div>

            {/* Tasks Container */}
            {!isCollapsed && (
              <div className="relative">
                {/* Time Grid */}
                <div className="flex border-b border-gray-200">
                  {Array.from({ length: timelineDays }).map((_, dayIndex) => {
                    const date = new Date(viewStartDate)
                    date.setDate(date.getDate() + dayIndex)
                    const isToday = date.toDateString() === new Date().toDateString()
                    const isWeekend = date.getDay() === 0 || date.getDay() === 6

                    // Log first and last grid columns
                    if (dayIndex === 0 || dayIndex === timelineDays - 1) {
                      console.log(`📅 Grid column ${dayIndex + 1}/${timelineDays}:`, {
                        date: date.toISOString(),
                        display: date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
                        isToday,
                        isWeekend,
                        columnWidth,
                      })
                    }

                    return (
                      <div
                        key={dayIndex}
                        className={`
                          flex-shrink-0 border-r border-gray-100 last:border-r-0
                          ${isToday ? 'bg-blue-50/50' : ''}
                          ${isWeekend ? 'bg-gray-100/30' : ''}
                        `}
                        style={{ width: `${columnWidth}px` }}
                      >
                        {/* Time slot marker */}
                        {viewMode === 'day' && (
                          <div className="h-8 flex items-center justify-center border-b border-gray-200">
                            <span className="text-xs text-gray-500">
                              {date.toLocaleTimeString('en-US', { hour: 'numeric' })}
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>

                {/* Tasks Area */}
                <div className="relative p-2" style={{ minHeight: hasTasks ? '80px' : '60px' }}>
                  {hasTasks ? (
                    swimlane.tasks.map((task, taskIndex) => {
                      const taskStart = new Date(task.start)
                      const taskEnd = new Date(task.end)

                      // Calculate position and width
                      const daysFromStart = Math.floor((taskStart.getTime() - viewStartDate.getTime()) / (1000 * 60 * 60 * 24))
                      const durationDays = Math.ceil((taskEnd.getTime() - taskStart.getTime()) / (1000 * 60 * 60 * 24))

                      // Ensure minimum duration of 1 day
                      const safeDuration = Math.max(1, durationDays)

                      // Calculate left position (ensure it's not negative)
                      const left = Math.max(0, daysFromStart * columnWidth)

                      // Calculate width
                      const maxWidth = timelineDays * columnWidth - left
                      const width = Math.min(safeDuration * columnWidth, maxWidth)

                      // Stack tasks vertically if there are multiple
                      const taskHeight = 40
                      const verticalSpacing = 8
                      const top = taskIndex * (taskHeight + verticalSpacing) + 8

                      console.log(`🔲 Rendering task ${task.jobCardNumber}:`, {
                        taskStart: taskStart.toISOString(),
                        taskEnd: taskEnd.toISOString(),
                        daysFromStart,
                        durationDays,
                        safeDuration,
                        left,
                        width,
                        top,
                      })

                      return (
                        <div
                          key={task.id}
                          className="absolute rounded-md shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                          style={{
                            left: `${left}px`,
                            width: `${Math.max(width, columnWidth)}px`, // Ensure minimum width
                            top: `${top}px`,
                            height: `${taskHeight}px`,
                          }}
                          onClick={(e) => {
                            e.stopPropagation()
                            console.log('🖱️ Clicked task:', task.jobCardNumber)
                            onTaskClick(task.id)
                          }}
                        >
                          {renderTask(task, { width: '100%', height: '100%' })}
                        </div>
                      )
                    })
                  ) : (
                    <div className="h-full flex items-center justify-center">
                      <p className="text-sm text-gray-400 italic">No jobs assigned</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

function getUtilizationColor(utilization: number): string {
  if (utilization >= 100) return 'text-red-600'
  if (utilization >= 80) return 'text-orange-600'
  if (utilization >= 50) return 'text-yellow-600'
  return 'text-green-600'
}
