'use client'

import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { Clock, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimePickerProps {
  value: string | null // Format: "HH:MM" in 24-hour format
  onChange: (time: string | null) => void
  label?: string
  required?: boolean
  error?: string
  disabled?: boolean
  className?: string
}

export function TimePicker({
  value,
  onChange,
  label,
  required = false,
  error,
  disabled = false,
  className,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [hours, setHours] = useState(() => {
    if (value) {
      const [h] = value.split(':').map(Number)
      return h
    }
    return 12
  })
  const [minutes, setMinutes] = useState(() => {
    if (value) {
      const [, m] = value.split(':').map(Number)
      return m
    }
    return 0
  })
  const [popoverPosition, setPopoverPosition] = useState<{ top: number; left: number; width: number } | null>(null)
  const pickerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':').map(Number)
      setHours(h)
      setMinutes(m)
    }
  }, [value])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node
      if (
        pickerRef.current &&
        !pickerRef.current.contains(target) &&
        !(target as Element)?.closest?.('[data-time-picker-portal]')
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Calculate popover position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect()
      const scrollY = window.scrollY
      const scrollX = window.scrollX

      setPopoverPosition({
        top: rect.bottom + scrollY + 8,
        left: rect.left + scrollX,
        width: rect.width
      })
    } else {
      setPopoverPosition(null)
    }
  }, [isOpen])

  const formatTime = (h: number, m: number) => {
    const period = h >= 12 ? 'PM' : 'AM'
    const displayHours = h % 12 || 12
    const displayMinutes = m.toString().padStart(2, '0')
    return `${displayHours}:${displayMinutes} ${period}`
  }

  const handleTimeChange = (h: number, m: number) => {
    setHours(h)
    setMinutes(m)
    const timeString = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
    onChange(timeString)
  }

  const incrementHours = () => {
    const newHours = (hours + 1) % 24
    handleTimeChange(newHours, minutes)
  }

  const decrementHours = () => {
    const newHours = (hours - 1 + 24) % 24
    handleTimeChange(newHours, minutes)
  }

  const incrementMinutes = () => {
    const newMinutes = (minutes + 5) % 60
    handleTimeChange(hours, newMinutes)
  }

  const decrementMinutes = () => {
    const newMinutes = (minutes - 5 + 60) % 60
    handleTimeChange(hours, newMinutes)
  }

  const displayTime = value ? formatTime(hours, minutes) : 'Select time'

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      <div ref={pickerRef} className="relative">
        {/* Time Input Button */}
        <button
          ref={buttonRef}
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={cn(
            'w-full flex items-center justify-between px-4 py-3 border-2 rounded-xl transition-all duration-200',
            'focus:outline-none focus:ring-2 focus:ring-gray-700 focus:ring-offset-2',
            disabled
              ? 'bg-gray-100 border-gray-300 text-gray-400 cursor-not-allowed opacity-60'
              : 'bg-white border-gray-300 text-gray-900 hover:border-gray-400',
            error && 'border-red-500 hover:border-red-600'
          )}
        >
          <div className="flex items-center gap-3">
            <Clock
              className={cn(
                'h-5 w-5 transition-colors duration-200',
                error ? 'text-red-500' : disabled ? 'text-gray-400' : 'text-gray-700'
              )}
            />
            <span
              className={cn(
                'text-sm font-medium transition-colors duration-200',
                value ? 'text-gray-900' : 'text-gray-400'
              )}
            >
              {displayTime}
            </span>
          </div>

          {value && !disabled && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onChange(null)
              }}
              type="button"
              className="p-1 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Clear time selection"
            >
              <svg
                className="h-4 w-4 text-gray-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </button>

        {/* Error Message */}
        {error && (
          <p className="mt-2 text-sm font-medium text-red-600 flex items-center gap-1">
            <svg
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </p>
        )}

        {/* Time Picker Popover - Rendered via Portal */}
        {isOpen && !disabled && popoverPosition && typeof document !== 'undefined' && createPortal(
          <div
            data-time-picker-portal
            className="fixed z-[9999]"
            style={{
              top: `${popoverPosition.top}px`,
              left: `${popoverPosition.left}px`,
              width: `${popoverPosition.width}px`
            }}
          >
            <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl p-4 animate-in fade-in-0 zoom-in-95 duration-200">
              {/* Hours */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Hours
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={decrementHours}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="flex-1 text-center py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl font-bold text-gray-900">
                      {hours.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={incrementHours}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Minutes */}
              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-700 mb-2">
                  Minutes
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={decrementMinutes}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="flex-1 text-center py-3 bg-gray-50 rounded-lg border border-gray-200">
                    <span className="text-2xl font-bold text-gray-900">
                      {minutes.toString().padStart(2, '0')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={incrementMinutes}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                  >
                    <ChevronUp className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Selected Time Preview */}
              <div className="pt-3 border-t border-gray-200">
                <div className="text-center">
                  <p className="text-xs text-gray-500 mb-1">Selected Time</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatTime(hours, minutes)}
                  </p>
                </div>
              </div>
            </div>
          </div>,
          document.body
        )}
      </div>
    </div>
  )
}
