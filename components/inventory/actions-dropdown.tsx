'use client'

import React, { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import {
  MoreVertical,
  MoreHorizontal,
  Phone,
  Mail,
  Edit,
  ScrollText,
  Trash2,
  Loader2,
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/lib/utils'

/**
 * Actions Dropdown Component
 *
 * Responsive dropdown menu for part actions with:
 * - Phone vendor (prominent on mobile)
 * - Email vendor (prominent on desktop)
 * - Edit part
 * - Log order
 * - Delete part (destructive)
 */

interface Action {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  onClick: () => void
  variant?: 'default' | 'destructive' | 'primary-mobile' | 'primary-desktop'
  disabled?: boolean
}

interface ActionsDropdownProps {
  onCallVendor: () => void
  onEmailVendor: () => void
  onEdit: () => void
  onLogOrder: () => void
  onDelete: () => void
  partName?: string
  className?: string
}

export function ActionsDropdown({
  onCallVendor,
  onEmailVendor,
  onEdit,
  onLogOrder,
  onDelete,
  partName = 'Part',
  className,
}: ActionsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isPerformingAction, setIsPerformingAction] = useState<string | null>(null)
  const [menuPosition, setMenuPosition] = useState<{ top: number; left: number } | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close dropdown on escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false)
        setMenuPosition(null)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [])

  // Update menu position when dropdown opens
  const updateMenuPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const menuWidth = 224 // w-56 = 14rem = 224px
      const menuHeight = 300 // approximate max height

      // Calculate position: align right edge with button right edge
      let left = rect.right - menuWidth
      let top = rect.bottom + 8 // mt-2 = 8px

      // Ensure menu doesn't go off the right edge
      if (left + menuWidth > window.innerWidth - 16) {
        left = window.innerWidth - menuWidth - 16
      }

      // Ensure menu doesn't go off the left edge
      if (left < 16) {
        left = 16
      }

      // Ensure menu doesn't go off the bottom edge
      if (top + menuHeight > window.innerHeight - 16) {
        // Show menu above the button instead
        top = rect.top - menuHeight - 8
      }

      setMenuPosition({ top, left })
    }
  }

  const handleToggleDropdown = () => {
    if (!isOpen) {
      updateMenuPosition()
      setIsOpen(true)
    } else {
      setIsOpen(false)
      setMenuPosition(null)
    }
  }

  const actions: Action[] = [
    {
      id: 'call',
      label: 'Call Vendor',
      icon: Phone,
      onClick: onCallVendor,
      variant: 'primary-mobile',
    },
    {
      id: 'email',
      label: 'Email Vendor',
      icon: Mail,
      onClick: onEmailVendor,
      variant: 'primary-desktop',
    },
    {
      id: 'edit',
      label: 'Edit Part',
      icon: Edit,
      onClick: onEdit,
    },
    {
      id: 'log-order',
      label: 'Log Order',
      icon: ScrollText,
      onClick: onLogOrder,
    },
    {
      id: 'delete',
      label: 'Delete Part',
      icon: Trash2,
      onClick: onDelete,
      variant: 'destructive',
    },
  ]

  const handleActionClick = async (action: Action) => {
    setIsPerformingAction(action.id)
    setIsOpen(false)
    setMenuPosition(null)

    try {
      await action.onClick()
    } catch (error) {
      console.error(`Error performing action ${action.id}:`, error)
    } finally {
      setIsPerformingAction(null)
    }
  }

  const isActionLoading = (actionId: string) => isPerformingAction === actionId

  return (
    <div className={cn('relative', className)}>
      {/* Trigger Button */}
      <motion.button
        ref={buttonRef}
        onClick={handleToggleDropdown}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          'flex items-center gap-2 px-4 py-2.5 rounded-xl',
          'bg-white border border-gray-200 hover:border-gray-300',
          'text-gray-700 hover:text-gray-900',
          'transition-all duration-200 ease-out',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2',
          'shadow-card hover:shadow-lg',
          isOpen && 'ring-2 ring-brand ring-offset-2'
        )}
        aria-label="Actions"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        {/* Desktop icon */}
        <MoreVertical className="h-5 w-5 hidden sm:block" aria-hidden="true" />
        {/* Mobile icon */}
        <MoreHorizontal className="h-5 w-5 sm:hidden" aria-hidden="true" />
        <span className="text-sm font-medium">Actions</span>
      </motion.button>

      {/* Dropdown Menu - Rendered via Portal to avoid clipping */}
      {isOpen &&
        createPortal(
          <AnimatePresence>
            <>
              {/* Backdrop */}
              <div
                className="fixed inset-0 bg-black/10 backdrop-blur-[2px] z-40"
                aria-hidden="true"
                onClick={() => {
                  setIsOpen(false)
                  setMenuPosition(null)
                }}
              />

              {/* Menu */}
              {menuPosition && (
                <motion.div
                  ref={dropdownRef}
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{
                    duration: 0.2,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  style={{
                    position: 'fixed',
                    top: menuPosition.top,
                    left: menuPosition.left,
                    zIndex: 50,
                  }}
                  className={cn(
                    'w-56 min-w-[200px]',
                    'bg-white rounded-xl shadow-xl border border-gray-200',
                    'overflow-hidden'
                  )}
                  role="menu"
                  aria-orientation="vertical"
                  aria-labelledby="actions-button"
                >
              <div className="py-1">
                {actions.map((action) => {
                  const Icon = action.icon
                  const isLoading = isActionLoading(action.id)

                  // Handle responsive visibility
                  const isPrimaryMobile = action.variant === 'primary-mobile'
                  const isPrimaryDesktop = action.variant === 'primary-desktop'

                  return (
                    <motion.button
                      key={action.id}
                      onClick={() => handleActionClick(action)}
                      disabled={isLoading}
                      whileHover={{ scale: 1.01 }}
                      whileTap={{ scale: 0.99 }}
                      className={cn(
                        'w-full flex items-center gap-3 px-4 py-3',
                        'text-sm font-medium transition-colors duration-150',
                        'disabled:opacity-50 disabled:cursor-not-allowed',
                        // Visibility classes
                        isPrimaryMobile && 'sm:hidden',
                        isPrimaryDesktop && 'hidden sm:flex',
                        (!isPrimaryMobile && !isPrimaryDesktop) && 'flex',
                        // Color variants
                        action.variant === 'destructive'
                          ? 'text-red-600 hover:bg-red-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      )}
                      role="menuitem"
                      tabIndex={-1}
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Icon className="h-4 w-4" />
                      )}
                      <span>{action.label}</span>
                    </motion.button>
                  )
                })}
              </div>

              {/* Footer with part name */}
              <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                <p className="text-xs text-gray-500 truncate" aria-hidden="true">
                  {partName}
                </p>
              </div>
            </motion.div>
              )}
            </>
          </AnimatePresence>,
          document.body
        )}
    </div>
  )
}
