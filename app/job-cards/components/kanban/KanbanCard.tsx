'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { User, Wrench, Calendar, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo } from 'react'

interface KanbanCardProps {
  id: string
  jobCardNumber: string
  status: string
  priority: string
  createdAt: string
  customerName: string
  customerPhone: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleLicensePlate: string
  leadMechanicId?: string | null
  promisedDate?: string | null
}

function KanbanCardComponent({
  id,
  jobCardNumber,
  status,
  priority,
  createdAt,
  customerName,
  customerPhone,
  vehicleMake,
  vehicleModel,
  vehicleYear,
  vehicleLicensePlate,
  leadMechanicId,
  promisedDate,
}: KanbanCardProps) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    data: {
      status,
      jobCardNumber,
      priority,
      customerName,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleLicensePlate,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-graphite-900 bg-gray-300 border-gray-500'
      case 'high':
        return 'text-graphite-800 bg-gray-200 border-gray-400'
      case 'medium':
        return 'text-graphite-700 bg-gray-100 border-gray-300'
      case 'low':
        return 'text-graphite-600 bg-gray-50 border-gray-300'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-300'
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-grab active:cursor-grabbing group"
      role="button"
      tabIndex={0}
      aria-label={`Job card ${jobCardNumber}, ${priority} priority`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push(`/job-cards/${id}`)
        }
      }}
    >
      <div className="p-4">
        {/* Job Card Number & Priority */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-mono font-bold text-gray-900 mb-1 truncate">
              {jobCardNumber}
            </p>
            <p className="text-xs text-gray-500">
              {new Date(createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0 ${getPriorityColor(priority)}`}
          >
            {priority}
          </span>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
          <User className="h-3.5 w-3.5 text-gray-700 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-900 truncate">
              {customerName}
            </p>
            <p className="text-xs text-gray-500 truncate">{customerPhone}</p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
          <Wrench className="h-3.5 w-3.5 text-gray-700 shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-gray-900 truncate">
              {vehicleYear} {vehicleMake} {vehicleModel}
            </p>
            <p className="text-xs text-gray-500 truncate">{vehicleLicensePlate}</p>
          </div>
        </div>

        {/* Mechanic & Promised Date */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-gray-700">
            {leadMechanicId ? (
              <>
                <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                  <span className="text-xs font-semibold text-gray-700">M</span>
                </div>
                <span className="truncate">Assigned</span>
              </>
            ) : (
              <span className="text-gray-400">Unassigned</span>
            )}
          </div>
          {promisedDate && (
            <div className="flex items-center gap-1 text-gray-600">
              <Calendar className="h-3 w-3" />
              <span>{new Date(promisedDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>

        {/* View Action */}
        <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              router.push(`/job-cards/${id}`)
            }}
            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
            title="View Details"
            aria-label="View job card details"
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

/**
 * Memoized KanbanCard component
 * Only re-renders when jobCard.id changes
 */
export const KanbanCard = memo(KanbanCardComponent, (prevProps, nextProps) => {
  return prevProps.id === nextProps.id
})

KanbanCard.displayName = 'KanbanCard'
