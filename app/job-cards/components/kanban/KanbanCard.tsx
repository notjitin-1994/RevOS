'use client'

import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import {
  User,
  Wrench,
  Calendar,
  Eye,
  FileEdit,
  AlertCircle,
  Paperclip,
  MessageCircle,
  Clock,
  IndianRupee,
  CheckCircle2,
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { memo } from 'react'
import { motion } from 'framer-motion'
import type { KanbanJobCard } from '../../types/kanban.types'
import { getPriorityBadgeStyles, isOverdue, formatCurrency } from '../../types/kanban.types'

interface KanbanCardProps {
  card: KanbanJobCard
}

function KanbanCardComponent({ card }: KanbanCardProps) {
  const router = useRouter()
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: card.id,
    data: {
      status: card.status,
      jobCardNumber: card.jobCardNumber,
      priority: card.priority,
      customerName: card.customerName,
      vehicleMake: card.vehicleMake,
      vehicleModel: card.vehicleModel,
      vehicleYear: card.vehicleYear,
      vehicleLicensePlate: card.vehicleLicensePlate,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityStyles = getPriorityBadgeStyles(card.priority)
  const isCardOverdue = card.promisedDate && isOverdue(card.promisedDate)
  const totalCost = card.estimatedLaborCost + card.estimatedPartsCost

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`bg-white rounded-xl border-2 shadow-sm hover:shadow-lg transition-all duration-200 cursor-grab active:cursor-grabbing group relative ${
        isCardOverdue ? 'border-red-300 hover:border-red-400' : 'border-gray-200 hover:border-gray-300'
      }`}
      role="button"
      tabIndex={0}
      aria-label={`Job card ${card.jobCardNumber}, ${card.priority} priority, ${card.status}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          router.push(`/job-cards/${card.id}`)
        }
      }}
    >
      {/* Overdue indicator bar */}
      {isCardOverdue && (
        <div className="h-1 bg-red-500 rounded-t-xl" role="presentation" />
      )}

      <div className="p-4">
        {/* Top Row: Job Card Number, Priority Badge, and Quick Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono font-bold text-gray-900 truncate">
                {card.jobCardNumber}
              </p>
              {card.qualityChecked && (
                <CheckCircle2 className="h-3 w-3 text-status-success flex-shrink-0" aria-label="Quality checked" />
              )}
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              {new Date(card.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span
            className={`px-2 py-0.5 rounded-md text-xs font-semibold border flex-shrink-0 ${priorityStyles.bgColor} ${priorityStyles.textColor} ${priorityStyles.borderColor}`}
          >
            {card.priority}
          </span>
        </div>

        {/* Customer Info */}
        <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
          <User className="h-3.5 w-3.5 text-gray-700 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {card.customerName}
            </p>
            <p className="text-xs text-gray-500 truncate">{card.customerPhone}</p>
          </div>
        </div>

        {/* Vehicle Info */}
        <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
          <Wrench className="h-3.5 w-3.5 text-gray-700 shrink-0" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-gray-900 truncate">
              {card.vehicleYear} {card.vehicleMake} {card.vehicleModel}
            </p>
            <p className="text-xs text-gray-500 truncate">{card.vehicleLicensePlate}</p>
          </div>
        </div>

        {/* Customer Complaint (truncated) */}
        {card.customerComplaint && (
          <div className="mb-3">
            <p className="text-xs text-gray-700 line-clamp-2" title={card.customerComplaint}>
              {card.customerComplaint}
            </p>
          </div>
        )}

        {/* Progress Bar - if has checklist items */}
        {card.totalChecklistItems !== undefined && card.totalChecklistItems > 0 && (
          <div className="mb-3">
            <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
              <span>Progress</span>
              <span className="font-semibold">{card.progressPercentage}%</span>
            </div>
            <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-status-success transition-all duration-300"
                style={{ width: `${card.progressPercentage}%` }}
                role="progressbar"
                aria-valuenow={card.progressPercentage}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        )}

        {/* Bottom Row: Assignee, Due Date, and Indicators */}
        <div className="flex items-center justify-between text-xs mb-3">
          {/* Assignee */}
          <div className="flex items-center gap-1.5 text-gray-700">
            {card.leadMechanicId ? (
              <div className="flex items-center gap-1">
                <div className="h-6 w-6 rounded-full bg-graphite-700 flex items-center justify-center" title={card.leadMechanicName || 'Assigned'}>
              <span className="text-xs font-semibold text-white">
                    {getInitials(card.leadMechanicName || 'M')}
                  </span>
                </div>
                <span className="truncate max-w-[80px]">{card.leadMechanicName || 'Assigned'}</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <div className="h-6 w-6 rounded-full bg-gray-300 flex items-center justify-center">
                  <User className="h-3 w-3 text-gray-600" />
                </div>
                <span className="text-gray-400">Unassigned</span>
              </div>
            )}
          </div>

          {/* Due Date */}
          {card.promisedDate && (
            <div
              className={`flex items-center gap-1 ${
                isCardOverdue ? 'text-red-600 font-semibold' : 'text-gray-600'
              }`}
            >
              <Calendar className="h-3 w-3" aria-hidden="true" />
              <span>{new Date(card.promisedDate).toLocaleDateString()}</span>
              {card.promisedTime && <span className="text-gray-400">• {card.promisedTime}</span>}
            </div>
          )}
        </div>

        {/* Cost Estimate and Indicators */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200">
          {/* Cost */}
          <div className="flex items-center gap-1 text-xs">
            <IndianRupee className="h-3 w-3 text-gray-600" aria-hidden="true" />
            <span className="font-semibold text-gray-900">{formatCurrency(totalCost)}</span>
            <span className="text-gray-500">est.</span>
          </div>

          {/* Indicators: Attachments, Comments */}
          <div className="flex items-center gap-3 text-gray-500">
            {card.attachmentsCount !== undefined && card.attachmentsCount > 0 && (
              <div className="flex items-center gap-1" title={`${card.attachmentsCount} attachment${card.attachmentsCount > 1 ? 's' : ''}`}>
                <Paperclip className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{card.attachmentsCount}</span>
              </div>
            )}
            {card.commentsCount !== undefined && card.commentsCount > 0 && (
              <div className="flex items-center gap-1" title={`${card.commentsCount} comment${card.commentsCount > 1 ? 's' : ''}`}>
                <MessageCircle className="h-3.5 w-3.5" />
                <span className="text-xs font-medium">{card.commentsCount}</span>
              </div>
            )}
          </div>
        </div>

        {/* Continue Draft Button - Only for draft status */}
        {card.status === 'draft' && (
          <div className="mt-3">
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/job-cards/create?editJobCardId=${card.id}`)
              }}
              className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-graphite-700 text-white text-xs font-semibold rounded-lg hover:bg-graphite-600 transition-all duration-200 shadow-sm hover:shadow"
              title="Continue working on this draft"
            >
              <FileEdit className="h-3.5 w-3.5" aria-hidden="true" />
              Continue Draft
            </button>
          </div>
        )}

        {/* Quick Actions - Hide for draft status (has Continue button instead) */}
        {card.status !== 'draft' && (
          <div className="flex items-center justify-end gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => {
                e.stopPropagation()
                router.push(`/job-cards/${card.id}`)
              }}
              className="p-1.5 text-gray-400 hover:text-graphite-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
              title="View Details"
              aria-label="View job card details"
            >
              <Eye className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Overdue Warning Badge */}
        {isCardOverdue && (
          <div className="absolute top-2 right-2">
            <div
              className="flex items-center gap-1 px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-semibold border border-red-300"
              role="alert"
              aria-live="polite"
            >
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              <span>Overdue</span>
            </div>
          </div>
        )}
      </div>

      {/* Drag handle indicator */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-gray-300 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.div>
  )
}

/**
 * Memoized KanbanCard component
 * Only re-renders when card.id changes
 */
export const KanbanCard = memo(KanbanCardComponent, (prevProps, nextProps) => {
  return prevProps.card.id === nextProps.card.id &&
         prevProps.card.updatedAt === nextProps.card.updatedAt &&
         prevProps.card.status === nextProps.card.status
})

KanbanCard.displayName = 'KanbanCard'
