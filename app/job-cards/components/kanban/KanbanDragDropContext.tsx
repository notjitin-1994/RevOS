'use client'

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  MouseSensor,
  useSensor,
  useSensors,
  TouchSensor,
  DragOverlay,
  closestCorners,
} from '@dnd-kit/core'
import { useJobCardStore } from '../../lib/stores/job-card-store'
import { useUpdateJobCardStatus } from '../../hooks/use-job-card-mutations'
import { useState } from 'react'

interface KanbanDragDropContextProps {
  children: React.ReactNode
  garageId: string
  userId: string
}

export function KanbanDragDropContext({
  children,
  garageId,
  userId,
}: KanbanDragDropContextProps) {
  const { setIsDragging, setDraggedCardId } = useJobCardStore()
  const updateStatus = useUpdateJobCardStatus()
  const [activeId, setActiveId] = useState<string | null>(null)
  const [activeData, setActiveData] = useState<any>(null)

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5, // Small movement to start dragging - more responsive
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150, // Faster activation on touch
        tolerance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const active = event.active
    setIsDragging(true)
    setDraggedCardId(active.id as string)
    setActiveId(active.id as string)
    setActiveData(active.data.current)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false)
    setDraggedCardId(null)
    setActiveId(null)
    setActiveData(null)

    const { active, over } = event

    // Check if we dropped on a valid droppable target
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    // Get current status from the active node's data
    const currentStatus = active.data.current?.status

    // Get new status - check if we dropped on a column or another card
    let newStatus = overId

    // If dropped on a card, get the card's column status
    if (over.data.current?.status) {
      newStatus = over.data.current.status
    }

    // Don't update if dropped in the same column
    if (currentStatus === newStatus) {
      return
    }

    // Update via mutation
    updateStatus.mutate({
      jobCardId: activeId,
      newStatus,
      userId,
    })
  }

  const handleDragCancel = () => {
    setIsDragging(false)
    setDraggedCardId(null)
    setActiveId(null)
    setActiveData(null)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      {children}
      <DragOverlay
        dropAnimation={{
          duration: 250,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        {activeId && activeData ? (
          <div className="w-80 bg-white rounded-xl shadow-2xl border-2 border-gray-700 p-4 rotate-2 cursor-grabbing">
            <div className="flex items-start justify-between gap-2 mb-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-mono font-bold text-gray-900 mb-1">
                  {activeData.jobCardNumber || activeId}
                </p>
              </div>
              <span className="px-2 py-0.5 rounded-md text-xs font-medium border bg-status-warning/10 text-status-warning border-status-warning/20">
                {activeData.priority || 'medium'}
              </span>
            </div>
            <div className="bg-gray-50 rounded-lg p-2">
              <p className="text-xs font-medium text-gray-900 truncate">
                {activeData.customerName || 'Customer'}
              </p>
            </div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}
