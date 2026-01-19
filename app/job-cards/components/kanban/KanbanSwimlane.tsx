'use client'

import React, { useMemo } from 'react'
import { motion } from 'framer-motion'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { useJobCardStore } from '../../lib/stores/job-card-store'
import { groupJobCardsByPriority, groupJobCardsByMechanic, getSwimlaneLabel, sortSwimlaneGroups, getSwimlaneStats } from '../../lib/utils/swimlane-utils'
import type { JobCardViewData } from '../../types/job-card-view.types'

interface KanbanSwimlaneProps {
  jobCards: JobCardViewData[]
  columns: Array<{
    id: string
    title: string
    status: string
    color: string
    bgColor: string
    borderColor: string
  }>
}

export function KanbanSwimlane({ jobCards, columns }: KanbanSwimlaneProps) {
  const { swimlaneType } = useJobCardStore()

  // Group job cards by swimlane type
  const groupedSwimlanes = useMemo(() => {
    if (swimlaneType === 'none') {
      return null
    }

    if (swimlaneType === 'priority') {
      const groups = groupJobCardsByPriority(jobCards)
      return sortSwimlaneGroups('priority', groups)
    }

    if (swimlaneType === 'mechanic') {
      const groups = groupJobCardsByMechanic(jobCards)
      return sortSwimlaneGroups('mechanic', groups)
    }

    return null
  }, [jobCards, swimlaneType])

  // If no swimlane, render standard kanban board
  if (swimlaneType === 'none' || !groupedSwimlanes) {
    return (
      <div className="flex gap-4 min-w-max pr-4">
        {columns.map((column) => {
          const columnCards = jobCards.filter((jc) => jc.status === column.status)

          return (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              status={column.status}
              color={column.color}
              bgColor={column.bgColor}
              borderColor={column.borderColor}
              count={columnCards.length}
              wipLimit={column.status === 'in_progress' ? 5 : column.status === 'parts_waiting' || column.status === 'quality_check' ? 3 : undefined}
            >
              {columnCards.map((jobCard) => (
                <KanbanCard
                  key={jobCard.id}
                  id={jobCard.id}
                  jobCardNumber={jobCard.jobCardNumber}
                  status={jobCard.status}
                  priority={jobCard.priority}
                  createdAt={jobCard.createdAt}
                  customerName={jobCard.customerName}
                  customerPhone={jobCard.customerPhone}
                  vehicleMake={jobCard.vehicleMake}
                  vehicleModel={jobCard.vehicleModel}
                  vehicleYear={jobCard.vehicleYear}
                  vehicleLicensePlate={jobCard.vehicleLicensePlate}
                  leadMechanicId={jobCard.leadMechanicId}
                  promisedDate={jobCard.promisedDate}
                />
              ))}
            </KanbanColumn>
          )
        })}
      </div>
    )
  }

  // Render swimlanes
  return (
    <div className="space-y-6">
      {groupedSwimlanes.map(({ group, cards }, swimlaneIndex) => {
        const label = getSwimlaneLabel(swimlaneType, group)
        const stats = getSwimlaneStats(cards)

        return (
          <motion.div
            key={group}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: swimlaneIndex * 0.1 }}
            className="bg-white rounded-xl border border-gray-200 p-4 shadow-card"
          >
            {/* Swimlane Header */}
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-bold text-gray-900">{label}</h3>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-md">
                    {stats.total} jobs
                  </span>
                  {stats.inProgress > 0 && (
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-md">
                      {stats.inProgress} in progress
                    </span>
                  )}
                  {stats.urgent > 0 && (
                    <span className="px-2 py-1 bg-red-100 text-red-700 text-xs font-semibold rounded-md">
                      {stats.urgent} urgent
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Kanban Board for this swimlane */}
            <div className="overflow-x-auto pb-4 scrollbar-hide">
              <div className="flex gap-4 min-w-max pr-4">
                {columns.map((column) => {
                  const columnCards = cards.filter((jc) => jc.status === column.status)

                  return (
                    <KanbanColumn
                      key={`${group}-${column.id}`}
                      id={column.id}
                      title={column.title}
                      status={column.status}
                      color={column.color}
                      bgColor={column.bgColor}
                      borderColor={column.borderColor}
                      count={columnCards.length}
                      wipLimit={column.status === 'in_progress' ? 5 : column.status === 'parts_waiting' || column.status === 'quality_check' ? 3 : undefined}
                    >
                      {columnCards.map((jobCard) => (
                        <KanbanCard
                          key={jobCard.id}
                          id={jobCard.id}
                          jobCardNumber={jobCard.jobCardNumber}
                          status={jobCard.status}
                          priority={jobCard.priority}
                          createdAt={jobCard.createdAt}
                          customerName={jobCard.customerName}
                          customerPhone={jobCard.customerPhone}
                          vehicleMake={jobCard.vehicleMake}
                          vehicleModel={jobCard.vehicleModel}
                          vehicleYear={jobCard.vehicleYear}
                          vehicleLicensePlate={jobCard.vehicleLicensePlate}
                          leadMechanicId={jobCard.leadMechanicId}
                          promisedDate={jobCard.promisedDate}
                        />
                      ))}
                    </KanbanColumn>
                  )
                })}
              </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
