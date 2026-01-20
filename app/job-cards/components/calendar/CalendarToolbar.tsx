/**
 * CalendarToolbar Component
 *
 * Enhanced toolbar with keyboard shortcuts, quick-jump presets, and help
 * Mobile-first responsive design with stack-to-grid pattern
 */

'use client'

import React, { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  List,
  Keyboard,
  X,
  Home,
} from 'lucide-react'
import * as Popover from '@radix-ui/react-popover'
import type { CalendarToolbarProps } from '../../types/calendar.types'
import { useCalendarKeyboard, formatKeyboardShortcut, useKeyboardShortcutFeedback } from '../../hooks/use-calendar-keyboard'
import { isToday } from '../../types/calendar.types'

export function CalendarToolbar({
  viewMode,
  onViewModeChange,
  currentDate,
  onDateChange,
  onToday,
  onPrev,
  onNext,
}: CalendarToolbarProps) {
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false)
  const keyboardFeedback = useKeyboardShortcutFeedback()

  // Initialize keyboard shortcuts
  const { keyboardShortcuts } = useCalendarKeyboard({
    viewMode,
    onViewModeChange,
    onToday,
    onPrev,
    onNext,
    currentDate,
    onDateChange,
    enabled: true,
  })

  const formatCurrentDate = () => {
    if (viewMode === 'dayGridMonth') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    } else if (viewMode === 'timeGridWeek') {
      const startOfWeek = new Date(currentDate)
      const day = startOfWeek.getDay()
      const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1)
      startOfWeek.setDate(diff)

      const endOfWeek = new Date(startOfWeek)
      endOfWeek.setDate(startOfWeek.getDate() + 6)

      return `${startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${endOfWeek.toLocaleDateString(
        'en-US',
        { month: 'short', day: 'numeric', year: 'numeric' }
      )}`
    } else if (viewMode === 'timeGridDay') {
      return currentDate.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    } else {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
    }
  }

  const handleQuickJump = (preset: 'today' | 'thisWeek' | 'thisMonth' | 'nextWeek' | 'nextMonth') => {
    const now = new Date()
    const newDate = new Date()

    switch (preset) {
      case 'today':
        onToday()
        return
      case 'thisWeek':
        // Already at current week, just refresh
        onDateChange(now)
        break
      case 'thisMonth':
        onDateChange(now)
        onViewModeChange('dayGridMonth')
        break
      case 'nextWeek':
        newDate.setDate(newDate.getDate() + 7)
        onDateChange(newDate)
        onViewModeChange('timeGridWeek')
        break
      case 'nextMonth':
        newDate.setMonth(newDate.getMonth() + 1)
        onDateChange(newDate)
        onViewModeChange('dayGridMonth')
        break
    }
  }

  return (
    <div className="mb-6">
      {/* Keyboard Feedback Toast */}
      {keyboardFeedback && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-200">
          <div className="bg-graphite-900 text-white px-4 py-2 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2">
            <Keyboard className="h-4 w-4" />
            {keyboardFeedback}
          </div>
        </div>
      )}

      {/* Mobile: Stacked layout */}
      <div className="flex flex-col gap-4 md:hidden">
        {/* Date Display & Navigation - Top Section */}
        <div className="flex items-center justify-between bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <button
            onClick={onPrev}
            className="h-11 w-11 flex items-center justify-center rounded-lg active:bg-gray-100 transition-colors"
            aria-label="Previous date"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <div className="flex-1 text-center px-2">
            <h2 className="text-base font-bold text-gray-900">
              {formatCurrentDate()}
            </h2>
          </div>

          <button
            onClick={onNext}
            className="h-11 w-11 flex items-center justify-center rounded-lg active:bg-gray-100 transition-colors"
            aria-label="Next date"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>
        </div>

        {/* Quick Jump & Today - Row */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => handleQuickJump('today')}
            className={`h-11 flex items-center justify-center text-sm font-semibold rounded-lg transition-all ${
              isToday(currentDate)
                ? 'bg-brand text-gray-900'
                : 'bg-gray-100 text-gray-700 active:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => handleQuickJump('thisWeek')}
            className="h-11 flex items-center justify-center text-sm font-medium text-gray-700 bg-gray-100 active:bg-gray-200 rounded-lg transition-colors"
          >
            This Week
          </button>
        </div>

        {/* View Mode Switcher - Full Width Buttons */}
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <p className="text-xs font-medium uppercase tracking-wider text-gray-600">
              View Mode
            </p>
            <button
              onClick={() => setShowKeyboardHelp(true)}
              className="p-1.5 hover:bg-gray-100 rounded-md transition-colors"
              aria-label="Keyboard shortcuts"
            >
              <Keyboard className="h-4 w-4 text-gray-500" />
            </button>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {(['dayGridMonth', 'timeGridWeek', 'timeGridDay'] as const).map((mode) => {
              const label = mode === 'dayGridMonth' ? 'Month' : mode === 'timeGridWeek' ? 'Week' : 'Day'
              const shortcut = `⌘${mode === 'dayGridMonth' ? 3 : mode === 'timeGridWeek' ? 2 : 1}`

              return (
                <button
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
                  className={`h-11 text-sm font-semibold rounded-lg transition-all active:scale-[0.98] relative ${
                    viewMode === mode
                      ? 'bg-graphite-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 active:bg-gray-200'
                  }`}
                  aria-label={`Switch to ${label.toLowerCase()} view (${shortcut})`}
                  aria-pressed={viewMode === mode}
                >
                  <span>{label}</span>
                  <span className="absolute bottom-0.5 right-1 text-[9px] opacity-60">
                    {shortcut.replace('⌘', '⌘')}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Desktop: Side-by-side layout */}
      <div className="hidden md:flex items-center justify-between gap-4">
        {/* Left: Date Navigation & Quick Jump */}
        <div className="flex items-center gap-3">
          <button
            onClick={onPrev}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Previous date"
          >
            <ChevronLeft className="h-5 w-5 text-gray-700" />
          </button>

          <button
            onClick={() => handleQuickJump('today')}
            className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${
              isToday(currentDate) ? 'bg-brand/10' : ''
            }`}
            aria-label="Go to today"
          >
            <Home className="h-5 w-5 text-gray-700" />
          </button>

          <h2 className="text-xl font-bold text-gray-900 min-w-[200px] text-center">
            {formatCurrentDate()}
          </h2>

          <button
            onClick={onNext}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Next date"
          >
            <ChevronRight className="h-5 w-5 text-gray-700" />
          </button>

          {/* Quick Jump Dropdown */}
          <Popover.Root>
            <Popover.Trigger asChild>
              <button className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center gap-2">
                Jump to
                <ChevronLeft className="h-4 w-4 rotate-[-90deg]" />
              </button>
            </Popover.Trigger>

            <Popover.Portal>
              <Popover.Content
                className="z-50 w-48 bg-white rounded-lg shadow-xl border border-gray-200 p-1 animate-in fade-in-0 zoom-in-95 duration-200"
                sideOffset={5}
                align="start"
              >
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer outline-none w-full text-left"
                  onClick={() => handleQuickJump('today')}
                >
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  Today
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer outline-none w-full text-left"
                  onClick={() => handleQuickJump('thisWeek')}
                >
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  This Week
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer outline-none w-full text-left"
                  onClick={() => handleQuickJump('thisMonth')}
                >
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  This Month
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer outline-none w-full text-left"
                  onClick={() => handleQuickJump('nextWeek')}
                >
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  Next Week
                </button>
                <button
                  className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-md cursor-pointer outline-none w-full text-left"
                  onClick={() => handleQuickJump('nextMonth')}
                >
                  <CalendarIcon className="h-4 w-4 text-gray-500" />
                  Next Month
                </button>
                <Popover.Arrow className="fill-white" />
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
        </div>

        {/* Right: View Mode Switcher & Keyboard Help */}
        <div className="flex items-center gap-3">
          <CalendarIcon className="h-5 w-5 text-gray-500" />

          <div className="inline-flex rounded-lg border border-gray-300 p-1">
            {(['dayGridMonth', 'timeGridWeek', 'timeGridDay'] as const).map((mode) => {
              const label = mode === 'dayGridMonth' ? 'Month' : mode === 'timeGridWeek' ? 'Week' : 'Day'
              const shortcutNumber = mode === 'dayGridMonth' ? 3 : mode === 'timeGridWeek' ? 2 : 1

              return (
                <button
                  key={mode}
                  onClick={() => onViewModeChange(mode)}
                  className={`px-4 py-2 text-sm font-medium rounded-md transition-all relative ${
                    viewMode === mode ? 'bg-graphite-700 text-white shadow-sm' : 'text-gray-700 hover:bg-gray-100'
                  }`}
                  aria-label={`Switch to ${label.toLowerCase()} view (Ctrl/Cmd + ${shortcutNumber})`}
                  aria-pressed={viewMode === mode}
                  title={`Ctrl/Cmd + ${shortcutNumber}`}
                >
                  {label}
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-gray-200 text-[10px] font-bold text-gray-600">
                    {shortcutNumber}
                  </span>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => setShowKeyboardHelp(true)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Keyboard shortcuts"
          >
            <Keyboard className="h-5 w-5 text-gray-500" />
          </button>
        </div>
      </div>

      {/* Keyboard Shortcuts Help Modal */}
      {showKeyboardHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 animate-in fade-in duration-200"
            onClick={() => setShowKeyboardHelp(false)}
          />

          {/* Modal */}
          <div className="relative z-50 w-full max-w-md bg-white rounded-xl shadow-2xl border border-gray-200 p-6 animate-in zoom-in-95 duration-200 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Keyboard className="h-5 w-5" />
                Keyboard Shortcuts
              </h3>
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">View Switching</p>
                {keyboardShortcuts.slice(0, 3).map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">
                      {formatKeyboardShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Navigation</p>
                {keyboardShortcuts.slice(3).map((shortcut, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{shortcut.description}</span>
                    <kbd className="px-2 py-1 text-xs font-semibold text-gray-600 bg-gray-100 border border-gray-300 rounded">
                      {formatKeyboardShortcut(shortcut)}
                    </kbd>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                onClick={() => setShowKeyboardHelp(false)}
                className="w-full px-4 py-2 bg-graphite-700 text-white text-sm font-medium rounded-lg hover:bg-graphite-800 transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
