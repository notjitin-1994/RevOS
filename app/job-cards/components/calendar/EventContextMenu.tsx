/**
 * EventContextMenu Component
 *
 * Right-click context menu for calendar events
 * Provides quick actions for job cards
 */

'use client'

import React, { useState, useCallback } from 'react'
import * as ContextMenu from '@radix-ui/react-context-menu'
import { useRouter } from 'next/navigation'
import {
  Eye,
  Edit,
  Calendar,
  User,
  CheckCircle,
  AlertCircle,
  Copy,
  Trash2,
  MoreHorizontal,
} from 'lucide-react'
import type { JobCardViewData } from '../../types/job-card-view.types'

interface EventContextMenuProps {
  children: React.ReactNode
  jobCard: any // Using any to support both JobCardViewData and DashboardCalendarJobCard
  onEdit?: (jobCardId: string) => void
  onAssignMechanic?: (jobCardId: string) => void
  onUpdateStatus?: (jobCardId: string, status: string) => void
  onUpdatePriority?: (jobCardId: string, priority: string) => void
  onDuplicate?: (jobCardId: string) => void
  onDelete?: (jobCardId: string) => void
  onStatusChange?: (status: string) => void // Simplified API
}

/**
 * Context menu with quick actions for job cards
 */
export function EventContextMenu({
  children,
  jobCard,
  onEdit,
  onAssignMechanic,
  onUpdateStatus,
  onUpdatePriority,
  onDuplicate,
  onDelete,
  onStatusChange,
}: EventContextMenuProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleViewDetails = useCallback(() => {
    router.push(`/job-cards/${jobCard.id}`)
  }, [router, jobCard.id])

  const handleEdit = useCallback(() => {
    if (onEdit) {
      onEdit(jobCard.id)
    } else {
      router.push(`/job-cards/${jobCard.id}/edit`)
    }
  }, [onEdit, router, jobCard.id])

  const handleAssignMechanic = useCallback(() => {
    onAssignMechanic?.(jobCard.id)
  }, [onAssignMechanic, jobCard.id])

  const handleMarkComplete = useCallback(() => {
    onUpdateStatus?.(jobCard.id, 'delivered')
    onStatusChange?.('delivered')
  }, [onUpdateStatus, onStatusChange, jobCard.id])

  const handleMarkInProgress = useCallback(() => {
    onUpdateStatus?.(jobCard.id, 'in_progress')
    onStatusChange?.('in_progress')
  }, [onUpdateStatus, onStatusChange, jobCard.id])

  const handleMarkUrgent = useCallback(() => {
    onUpdatePriority?.(jobCard.id, 'urgent')
  }, [onUpdatePriority, jobCard.id])

  const handleDuplicate = useCallback(() => {
    onDuplicate?.(jobCard.id)
  }, [onDuplicate, jobCard.id])

  const handleDelete = useCallback(() => {
    onDelete?.(jobCard.id)
  }, [onDelete, jobCard.id])

  const isCompleted = jobCard.status === 'delivered' || jobCard.status === 'ready'

  return (
    <ContextMenu.Root onOpenChange={setIsOpen}>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {/* Header with job card number */}
          <ContextMenu.Label className="px-3 py-2 text-sm font-semibold text-gray-900 border-b border-gray-100">
            {jobCard.jobCardNumber}
          </ContextMenu.Label>

          {/* View Details */}
          <ContextMenu.Item
            className="group flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
            onSelect={handleViewDetails}
          >
            <Eye className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            <span>View Details</span>
            <div className="ml-auto text-xs text-gray-400">⌘+Click</div>
          </ContextMenu.Item>

          {/* Edit */}
          <ContextMenu.Item
            className="group flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
            onSelect={handleEdit}
          >
            <Edit className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            <span>Edit Job Card</span>
            <div className="ml-auto text-xs text-gray-400">⌘E</div>
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px bg-gray-100 my-1" />

          {/* Change Date */}
          <ContextMenu.Item
            className="group flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
            onSelect={() => {
              // Focus on the calendar date picker
              window.dispatchEvent(new CustomEvent('calendar-change-date', { detail: { jobCardId: jobCard.id } }))
            }}
          >
            <Calendar className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            <span>Change Date</span>
          </ContextMenu.Item>

          {/* Assign Mechanic */}
          <ContextMenu.Item
            className="group flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
            onSelect={handleAssignMechanic}
          >
            <User className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            <span>Assign Mechanic</span>
          </ContextMenu.Item>

          <ContextMenu.Separator className="h-px bg-gray-100 my-1" />

          {/* Status Actions */}
          {!isCompleted && (
            <>
              <ContextMenu.Item
                className="group flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-green-50 hover:text-green-700 cursor-pointer outline-none"
                onSelect={handleMarkComplete}
              >
                <CheckCircle className="h-4 w-4 text-gray-500 group-hover:text-green-600" />
                <span>Mark Complete</span>
              </ContextMenu.Item>

              <ContextMenu.Item
                className="group flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 cursor-pointer outline-none"
                onSelect={handleMarkInProgress}
              >
                <MoreHorizontal className="h-4 w-4 text-gray-500 group-hover:text-blue-600" />
                <span>Mark In Progress</span>
              </ContextMenu.Item>
            </>
          )}

          {/* Mark Urgent */}
          {jobCard.priority !== 'urgent' && (
            <ContextMenu.Item
              className="group flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-700 cursor-pointer outline-none"
              onSelect={handleMarkUrgent}
            >
              <AlertCircle className="h-4 w-4 text-gray-500 group-hover:text-red-600" />
              <span>Mark Urgent</span>
            </ContextMenu.Item>
          )}

          <ContextMenu.Separator className="h-px bg-gray-100 my-1" />

          {/* Duplicate */}
          <ContextMenu.Item
            className="group flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 cursor-pointer outline-none"
            onSelect={handleDuplicate}
          >
            <Copy className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
            <span>Duplicate</span>
            <div className="ml-auto text-xs text-gray-400">⌘D</div>
          </ContextMenu.Item>

          {/* Delete */}
          <ContextMenu.Item
            className="group flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 cursor-pointer outline-none"
            onSelect={handleDelete}
          >
            <Trash2 className="h-4 w-4 text-red-500 group-hover:text-red-600" />
            <span>Delete</span>
            <div className="ml-auto text-xs text-gray-400 group-hover:text-red-400">⌫</div>
          </ContextMenu.Item>
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}

/**
 * Context menu item component for custom actions
 */
export interface ContextMenuItem {
  label: string
  icon?: React.ReactNode
  shortcut?: string
  dangerous?: boolean
  divider?: boolean
  action: () => void
}

interface CustomContextMenuProps {
  items: ContextMenuItem[]
  children: React.ReactNode
}

/**
 * Custom context menu with configurable items
 */
export function CustomContextMenu({ items, children }: CustomContextMenuProps) {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger asChild>{children}</ContextMenu.Trigger>

      <ContextMenu.Portal>
        <ContextMenu.Content
          className="min-w-[200px] bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 animate-in fade-in-0 zoom-in-95 duration-200"
        >
          {items.map((item, index) => (
            <React.Fragment key={index}>
              {item.divider && <ContextMenu.Separator className="h-px bg-gray-100 my-1" />}

              <ContextMenu.Item
                className={`group flex items-center gap-2 px-3 py-2 text-sm cursor-pointer outline-none transition-colors ${
                  item.dangerous
                    ? 'text-red-600 hover:bg-red-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
                onSelect={item.action}
              >
                {item.icon && <span className="text-gray-500 group-hover:text-gray-700">{item.icon}</span>}
                <span>{item.label}</span>
                {item.shortcut && (
                  <div className="ml-auto text-xs text-gray-400">{item.shortcut}</div>
                )}
              </ContextMenu.Item>
            </React.Fragment>
          ))}
        </ContextMenu.Content>
      </ContextMenu.Portal>
    </ContextMenu.Root>
  )
}
