/**
 * useCalendarKeyboard Hook
 *
 * Provides keyboard shortcuts for calendar navigation and interaction
 * Supports both Windows (Ctrl) and Mac (Cmd) key combinations
 */

'use client'

import { useEffect, useCallback, useState } from 'react'
import type { CalendarViewMode } from '../types/calendar.types'

export interface KeyboardShortcut {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  description: string
  action: () => void
}

export interface UseCalendarKeyboardOptions {
  viewMode: CalendarViewMode
  onViewModeChange: (viewMode: CalendarViewMode) => void
  onToday: () => void
  onPrev: () => void
  onNext: () => void
  currentDate: Date
  onDateChange: (date: Date) => void
  enabled?: boolean
}

/**
 * Hook for calendar keyboard navigation
 *
 * Shortcuts:
 * - Ctrl/Cmd + 1: Day view
 * - Ctrl/Cmd + 2: Week view
 * - Ctrl/Cmd + 3: Month view
 * - Arrow keys: Navigate dates
 * - Shift + Arrow keys: Navigate by larger increments
 * - T: Go to today
 * - Escape: Close dialogs/modals
 */
export function useCalendarKeyboard(options: UseCalendarKeyboardOptions) {
  const {
    viewMode,
    onViewModeChange,
    onToday,
    onPrev,
    onNext,
    currentDate,
    onDateChange,
    enabled = true,
  } = options

  /**
   * Handle keyboard shortcuts
   */
  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (!enabled) return

      // Ignore if user is typing in an input
      const target = event.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true' ||
        target.getAttribute('role') === 'textbox'
      ) {
        return
      }

      const isCtrlOrCmd = event.ctrlKey || event.metaKey
      const key = event.key.toLowerCase()

      // View switching shortcuts
      if (isCtrlOrCmd) {
        switch (key) {
          case '1':
            event.preventDefault()
            onViewModeChange('timeGridDay')
            showKeyboardShortcutFeedback('Day View')
            return
          case '2':
            event.preventDefault()
            onViewModeChange('timeGridWeek')
            showKeyboardShortcutFeedback('Week View')
            return
          case '3':
            event.preventDefault()
            onViewModeChange('dayGridMonth')
            showKeyboardShortcutFeedback('Month View')
            return
        }
      }

      // Navigation shortcuts
      switch (key) {
        case 'arrowleft':
          event.preventDefault()
          if (event.shiftKey) {
            // Larger increment: week in day view, month in week view, year in month view
            navigateByLargeIncrement('prev')
          } else {
            onPrev()
          }
          return

        case 'arrowright':
          event.preventDefault()
          if (event.shiftKey) {
            navigateByLargeIncrement('next')
          } else {
            onNext()
          }
          return

        case 'arrowup':
          event.preventDefault()
          if (event.shiftKey) {
            onPrev()
          } else {
            // Same as prev for consistency
            onPrev()
          }
          return

        case 'arrowdown':
          event.preventDefault()
          if (event.shiftKey) {
            onNext()
          } else {
            onNext()
          }
          return

        case 't':
          event.preventDefault()
          onToday()
          showKeyboardShortcutFeedback('Today')
          return

        case 'home':
          event.preventDefault()
          onDateChange(new Date())
          showKeyboardShortcutFeedback('Current Date')
          return

        case 'escape':
          event.preventDefault()
          // Let parent components handle this
          window.dispatchEvent(new CustomEvent('calendar-escape'))
          return
      }
    },
    [enabled, viewMode, onViewModeChange, onPrev, onNext, onToday, onDateChange]
  )

  /**
   * Navigate by larger increments when Shift is held
   */
  const navigateByLargeIncrement = useCallback(
    (direction: 'prev' | 'next') => {
      const newDate = new Date(currentDate)
      const multiplier = direction === 'prev' ? -1 : 1

      switch (viewMode) {
        case 'timeGridDay':
          // Navigate by week
          newDate.setDate(newDate.getDate() + 7 * multiplier)
          break
        case 'timeGridWeek':
          // Navigate by month
          newDate.setMonth(newDate.getMonth() + 1 * multiplier)
          break
        case 'dayGridMonth':
          // Navigate by year
          newDate.setFullYear(newDate.getFullYear() + 1 * multiplier)
          break
      }

      onDateChange(newDate)
    },
    [currentDate, viewMode, onDateChange]
  )

  /**
   * Show visual feedback for keyboard shortcuts
   */
  const showKeyboardShortcutFeedback = useCallback((action: string) => {
    // Dispatch custom event for UI feedback
    window.dispatchEvent(
      new CustomEvent('calendar-keyboard-action', {
        detail: { action },
      })
    )
  }, [])

  /**
   * Register keyboard event listeners
   */
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  /**
   * Get list of available keyboard shortcuts
   */
  const getKeyboardShortcuts = useCallback((): KeyboardShortcut[] => {
    const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
    const modifierKey = isMac ? 'Cmd' : 'Ctrl'

    return [
      {
        key: '1',
        ctrlKey: true,
        description: 'Switch to Day view',
        action: () => onViewModeChange('timeGridDay'),
      },
      {
        key: '2',
        ctrlKey: true,
        description: 'Switch to Week view',
        action: () => onViewModeChange('timeGridWeek'),
      },
      {
        key: '3',
        ctrlKey: true,
        description: 'Switch to Month view',
        action: () => onViewModeChange('dayGridMonth'),
      },
      {
        key: 'T',
        description: 'Go to today',
        action: onToday,
      },
      {
        key: '←',
        description: 'Previous period',
        action: onPrev,
      },
      {
        key: '→',
        description: 'Next period',
        action: onNext,
      },
      {
        key: 'Shift + →',
        description: 'Next large period',
        action: () => navigateByLargeIncrement('next'),
      },
      {
        key: 'Shift + ←',
        description: 'Previous large period',
        action: () => navigateByLargeIncrement('prev'),
      },
      {
        key: 'Home',
        description: 'Go to current date',
        action: () => onDateChange(new Date()),
      },
      {
        key: 'Escape',
        description: 'Close dialogs',
        action: () => window.dispatchEvent(new CustomEvent('calendar-escape')),
      },
    ]
  }, [
    onViewModeChange,
    onToday,
    onPrev,
    onNext,
    navigateByLargeIncrement,
    onDateChange,
  ])

  return {
    keyboardShortcuts: getKeyboardShortcuts(),
    showKeyboardShortcutFeedback,
  }
}

/**
 * Format keyboard shortcut for display
 */
export function formatKeyboardShortcut(shortcut: KeyboardShortcut): string {
  const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform)
  const modifierKey = isMac ? '⌘' : 'Ctrl'

  const parts: string[] = []

  if (shortcut.ctrlKey || shortcut.metaKey) {
    parts.push(modifierKey)
  }

  if (shortcut.shiftKey) {
    parts.push('Shift')
  }

  parts.push(shortcut.key.toUpperCase())

  return parts.join(isMac ? '' : '+')
}

/**
 * Hook for keyboard shortcut feedback
 */
export function useKeyboardShortcutFeedback() {
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    const handleAction = (event: CustomEvent) => {
      setFeedback(event.detail.action)
      setTimeout(() => setFeedback(null), 1000)
    }

    window.addEventListener('calendar-keyboard-action', handleAction as EventListener)

    return () => {
      window.removeEventListener('calendar-keyboard-action', handleAction as EventListener)
    }
  }, [])

  return feedback
}
