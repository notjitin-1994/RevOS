'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

interface ShortcutConfig {
  key: string
  ctrlKey?: boolean
  metaKey?: boolean
  shiftKey?: boolean
  action: () => void
  description: string
  global?: boolean // If true, works even when typing in inputs
}

interface KeyboardShortcutsOptions {
  shortcuts: ShortcutConfig[]
  isEnabled?: boolean
}

/**
 * Custom hook for managing keyboard shortcuts
 * Provides global and contextual keyboard navigation
 *
 * @param options - Configuration object with shortcuts array and enabled flag
 *
 * @example
 * ```tsx
 * useKeyboardShortcuts({
 *   shortcuts: [
 *     {
 *       key: 'k',
 *       action: () => setViewMode('kanban'),
 *       description: 'Switch to Kanban view'
 *     },
 *     {
 *       key: 'n',
 *       ctrlKey: true,
 *       action: () => router.push('/job-cards/create'),
 *       description: 'Create new job card'
 *     }
 *   ]
 * })
 * ```
 */
export function useKeyboardShortcuts({ shortcuts, isEnabled = true }: KeyboardShortcutsOptions) {
  const router = useRouter()
  const shortcutsRef = useRef(shortcuts)

  // Keep ref in sync with shortcuts
  useEffect(() => {
    shortcutsRef.current = shortcuts
  }, [shortcuts])

  useEffect(() => {
    if (!isEnabled) return

    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input (unless global shortcut)
      const target = e.target as HTMLElement
      const isTyping =
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.tagName === 'SELECT' ||
        target.contentEditable === 'true' ||
        target.getAttribute('role') === 'textbox'

      // Find matching shortcut
      const matchingShortcut = shortcutsRef.current.find((shortcut) => {
        // Check modifier keys
        const ctrlMatches = shortcut.ctrlKey ? e.ctrlKey || e.metaKey : !e.ctrlKey && !e.metaKey
        const shiftMatches = shortcut.shiftKey ? e.shiftKey : !e.shiftKey
        const keyMatches = e.key.toLowerCase() === shortcut.key.toLowerCase()

        return ctrlMatches && shiftMatches && keyMatches
      })

      if (matchingShortcut) {
        // Skip if typing and not a global shortcut
        if (isTyping && !matchingShortcut.global) {
          return
        }

        e.preventDefault()
        matchingShortcut.action()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isEnabled])
}

/**
 * Predefined job card shortcuts configuration
 */
export function useJobCardShortcuts({
  onViewModeChange,
  onCreateNew,
  onSearchFocus,
  onFilterToggle,
  onZoomIn,
  onZoomOut,
  onResetZoom,
}: {
  onViewModeChange: (mode: 'kanban' | 'timeline' | 'analytics') => void
  onCreateNew: () => void
  onSearchFocus: () => void
  onFilterToggle: () => void
  onZoomIn?: () => void
  onZoomOut?: () => void
  onResetZoom?: () => void
}) {
  const shortcuts: ShortcutConfig[] = [
    // View mode shortcuts
    {
      key: 'k',
      action: () => onViewModeChange('kanban'),
      description: 'Switch to Kanban view',
    },
    {
      key: 't',
      action: () => onViewModeChange('timeline'),
      description: 'Switch to Timeline/Gantt view',
    },
    {
      key: 'a',
      action: () => onViewModeChange('analytics'),
      description: 'Switch to Analytics view',
    },

    // Actions
    {
      key: 'n',
      action: onCreateNew,
      description: 'Create new job card',
    },
    {
      key: '/',
      global: true,
      action: onSearchFocus,
      description: 'Focus search box',
    },
    {
      key: 'f',
      action: onFilterToggle,
      description: 'Open filter panel',
    },
    {
      key: 'Escape',
      global: true,
      action: () => {
        // Close modals/dropdowns - delegate to parent
        document.dispatchEvent(new CustomEvent('close-modals'))
      },
      description: 'Close modals/dropdowns',
    },

    // Modifier shortcuts
    {
      key: 'k',
      ctrlKey: true,
      action: onSearchFocus,
      description: 'Quick search',
    },
    {
      key: 'n',
      ctrlKey: true,
      action: onCreateNew,
      description: 'New job card',
    },

    // Zoom shortcuts (desktop only)
    ...(onZoomIn ? [{
      key: '=',
      ctrlKey: true,
      action: onZoomIn,
      description: 'Zoom in',
    }] : []),
    ...(onZoomIn ? [{
      key: '+',
      ctrlKey: true,
      action: onZoomIn,
      description: 'Zoom in',
    }] : []),
    ...(onZoomOut ? [{
      key: '-',
      ctrlKey: true,
      action: onZoomOut,
      description: 'Zoom out',
    }] : []),
    ...(onZoomOut ? [{
      key: '_',
      ctrlKey: true,
      action: onZoomOut,
      description: 'Zoom out',
    }] : []),
    ...(onResetZoom ? [{
      key: '0',
      ctrlKey: true,
      action: onResetZoom,
      description: 'Reset zoom',
    }] : []),
  ]

  return { shortcuts }
}

/**
 * Hook for card navigation shortcuts
 */
export function useCardNavigationShortcuts({
  cards,
  onSelectCard,
  onViewDetails,
}: {
  cards: Array<{ id: string }>
  onSelectCard: (id: string) => void
  onViewDetails: (id: string) => void
}) {
  const selectedIndexRef = useRef(0)

  const shortcuts: ShortcutConfig[] = [
    {
      key: 'ArrowDown',
      action: () => {
        if (selectedIndexRef.current < cards.length - 1) {
          selectedIndexRef.current++
          onSelectCard(cards[selectedIndexRef.current].id)
        }
      },
      description: 'Navigate to next card',
    },
    {
      key: 'ArrowUp',
      action: () => {
        if (selectedIndexRef.current > 0) {
          selectedIndexRef.current--
          onSelectCard(cards[selectedIndexRef.current].id)
        }
      },
      description: 'Navigate to previous card',
    },
    {
      key: 'Enter',
      action: () => {
        if (cards[selectedIndexRef.current]) {
          onViewDetails(cards[selectedIndexRef.current].id)
        }
      },
      description: 'View selected card details',
    },
    {
      key: ' ',
      ctrlKey: true,
      action: () => {
        if (cards[selectedIndexRef.current]) {
          onSelectCard(cards[selectedIndexRef.current].id)
        }
      },
      description: 'Select card',
    },
  ]

  useEffect(() => {
    selectedIndexRef.current = 0
  }, [cards])

  return { shortcuts, selectedIndex: selectedIndexRef.current }
}

/**
 * Helper to display keyboard shortcut hints
 */
export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = []

  if (shortcut.ctrlKey) {
    parts.push('Ctrl')
  }
  if (shortcut.metaKey) {
    parts.push('Cmd')
  }
  if (shortcut.shiftKey) {
    parts.push('Shift')
  }

  parts.push(shortcut.key.charAt(0).toUpperCase() + shortcut.key.slice(1))

  return parts.join('+')
}

/**
 * Get all available shortcuts for display in help modal
 */
export function getShortcutHelp(shortcuts: ShortcutConfig[]): Array<{
  keys: string
  description: string
}> {
  return shortcuts.map((shortcut) => ({
    keys: formatShortcut(shortcut),
    description: shortcut.description,
  }))
}
