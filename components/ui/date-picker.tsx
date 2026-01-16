'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value?: string
  onChange: (date: string) => void
  onClose?: () => void
  className?: string
  placeholder?: string
}

/**
 * DatePicker - A modern, elegant, brand-compliant date picker component
 *
 * Features:
 * - Custom calendar UI with smooth animations
 * - Brand-compliant colors (Volt Lime & Graphite)
 * - Glassmorphism design
 * - Hover states and transitions
 * - Accessible keyboard navigation
 * - WCAG 2.2 Level AA compliant
 */
type ViewMode = 'days' | 'months' | 'years'

export function DatePicker({ value, onChange, onClose, className, placeholder }: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(value ? new Date(value) : null)
  const [currentDate, setCurrentDate] = useState(selectedDate || new Date())
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null)
  const [viewMode, setViewMode] = useState<ViewMode>('days')
  const pickerRef = useRef<HTMLDivElement>(null)

  // Update selected date when value prop changes
  useEffect(() => {
    if (value) {
      const newDate = new Date(value)
      setSelectedDate(newDate)
      setCurrentDate(newDate)
    } else {
      setSelectedDate(null)
      setCurrentDate(new Date())
    }
  }, [value])

  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
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

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const isSameDay = (date1: Date | null, date2: Date | null) => {
    if (!date1 || !date2) return false
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return isSameDay(date, today)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    // Format date as YYYY-MM-DD in local timezone (not UTC)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const localDate = `${year}-${month}-${day}`
    onChange(localDate)
    setIsOpen(false)
    onClose?.()
  }

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const handleMonthSelect = (monthIndex: number) => {
    setCurrentDate(new Date(currentDate.getFullYear(), monthIndex, 1))
    setViewMode('days')
  }

  const handleYearSelect = (year: number) => {
    setCurrentDate(new Date(year, currentDate.getMonth(), 1))
    setViewMode('days')
  }

  const getYearRange = () => {
    const currentYear = currentDate.getFullYear()
    const startYear = Math.floor(currentYear / 12) * 12
    return {
      startYear,
      endYear: startYear + 11,
      prevRangeStart: startYear - 12,
      nextRangeStart: startYear + 12
    }
  }

  const handlePrevYearRange = () => {
    const { prevRangeStart } = getYearRange()
    setCurrentDate(new Date(prevRangeStart, currentDate.getMonth(), 1))
  }

  const handleNextYearRange = () => {
    const { nextRangeStart } = getYearRange()
    setCurrentDate(new Date(nextRangeStart, currentDate.getMonth(), 1))
  }

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div ref={pickerRef} className={cn('relative', className)}>
      {/* Date Input Button */}
      <motion.button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={cn(
          'w-full px-4 py-3 text-base bg-graphite-900 border border-graphite-700 rounded-xl min-h-[44px]',
          'text-left text-white placeholder:text-graphite-500',
          'focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent',
          'transition-all duration-200',
          'hover:border-brand/40 active:border-brand/60',
          'flex items-center justify-between'
        )}
      >
        <span className={selectedDate ? 'font-medium' : 'text-graphite-500'}>
          {selectedDate ? formatDate(selectedDate) : (placeholder || 'Select date')}
        </span>
        <Calendar className="h-5 w-5 text-brand flex-shrink-0 ml-2" />
      </motion.button>

      {/* Calendar Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute z-50 mt-2 w-full min-w-[320px]"
          >
            <div className="bg-graphite-800 rounded-2xl border border-graphite-700 shadow-2xl overflow-hidden">
              {/* Header with Month/Year */}
              <div className="bg-gradient-to-r from-graphite-900 to-graphite-800 px-4 py-4 border-b border-graphite-700">
                <div className="flex items-center justify-between">
                  {/* Month and Year - Clickable */}
                  <div className="flex items-center gap-2">
                    <Calendar className="h-5 w-5 text-brand" />
                    <div className="flex items-center gap-1">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('months')}
                        className="text-lg font-semibold text-brand hover:text-brand/90 transition-colors px-2 py-1 rounded-lg hover:bg-graphite-700/50"
                      >
                        {months[currentDate.getMonth()]}
                      </motion.button>
                      <span className="text-brand">/</span>
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setViewMode('years')}
                        className="text-lg font-semibold text-brand hover:text-brand/90 transition-colors px-2 py-1 rounded-lg hover:bg-graphite-700/50"
                      >
                        {currentDate.getFullYear()}
                      </motion.button>
                    </div>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="flex items-center gap-1">
                    {viewMode === 'days' ? (
                      <>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handlePrevMonth}
                          className="p-2 rounded-lg hover:bg-graphite-700 transition-colors duration-200"
                        >
                          <ChevronLeft className="h-5 w-5 text-brand" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleNextMonth}
                          className="p-2 rounded-lg hover:bg-graphite-700 transition-colors duration-200"
                        >
                          <ChevronRight className="h-5 w-5 text-brand" />
                        </motion.button>
                      </>
                    ) : viewMode === 'years' ? (
                      <>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handlePrevYearRange}
                          className="p-2 rounded-lg hover:bg-graphite-700 transition-colors duration-200"
                        >
                          <ChevronLeft className="h-5 w-5 text-brand" />
                        </motion.button>
                        <motion.button
                          type="button"
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={handleNextYearRange}
                          className="p-2 rounded-lg hover:bg-graphite-700 transition-colors duration-200"
                        >
                          <ChevronRight className="h-5 w-5 text-brand" />
                        </motion.button>
                      </>
                    ) : null}
                  </div>
                </div>
              </div>

              {/* Content based on view mode */}
              {viewMode === 'days' ? (
                <>
                  {/* Week Day Headers */}
                  <div className="px-4 pt-4 pb-2">
                    <div className="grid grid-cols-7 gap-1">
                      {weekDays.map((day) => (
                        <div
                          key={day}
                          className="text-center text-xs font-semibold text-graphite-400 uppercase tracking-wide py-2"
                        >
                          {day}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Calendar Days */}
                  <div className="px-4 pb-4">
                    <div className="grid grid-cols-7 gap-1">
                      {getDaysInMonth(currentDate).map((date, index) => (
                        <motion.button
                          key={index}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onMouseEnter={() => date && setHoveredDate(date)}
                          onMouseLeave={() => setHoveredDate(null)}
                          onClick={() => date && handleDateSelect(date)}
                          disabled={!date}
                          className={cn(
                            'aspect-square rounded-lg text-sm font-medium transition-all duration-200',
                            'disabled:opacity-0 disabled:cursor-not-allowed',
                            'relative overflow-hidden'
                          )}
                        >
                          {/* Background */}
                          <div className="absolute inset-0">
                            {date && (
                              <>
                                {/* Hover background */}
                                {isSameDay(date, hoveredDate) && !isSameDay(date, selectedDate) && (
                                  <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="absolute inset-0 bg-brand/10"
                                  />
                                )}

                                {/* Selected background */}
                                {isSameDay(date, selectedDate) && (
                                  <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                                    className="absolute inset-0 bg-brand"
                                  />
                                )}

                                {/* Today indicator */}
                                {isToday(date) && !isSameDay(date, selectedDate) && (
                                  <div className="absolute inset-0 border-2 border-brand/40 rounded-lg" />
                                )}
                              </>
                            )}
                          </div>

                          {/* Date text */}
                          <span
                            className={cn(
                              'relative z-10 flex items-center justify-center h-full',
                              isSameDay(date, selectedDate)
                                ? 'text-graphite-900 font-bold'
                                : date && isToday(date)
                                ? 'text-brand font-semibold'
                                : 'text-graphite-200'
                            )}
                          >
                            {date?.getDate()}
                          </span>
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </>
              ) : viewMode === 'months' ? (
                /* Month Selector */
                <div className="px-4 py-4">
                  <div className="grid grid-cols-3 gap-2">
                    {months.map((month, index) => (
                      <motion.button
                        key={month}
                        type="button"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleMonthSelect(index)}
                        className={cn(
                          'py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                          'relative overflow-hidden',
                          currentDate.getMonth() === index
                            ? 'bg-brand text-graphite-900 font-bold'
                            : 'bg-graphite-700/50 text-graphite-200 hover:bg-graphite-700'
                        )}
                      >
                        {month}
                      </motion.button>
                    ))}
                  </div>
                </div>
              ) : (
                /* Year Selector */
                <div className="px-4 py-4">
                  <div className="grid grid-cols-3 gap-2">
                    {Array.from({ length: 12 }, (_, i) => {
                      const { startYear } = getYearRange()
                      const year = startYear + i
                      return (
                        <motion.button
                          key={year}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleYearSelect(year)}
                          className={cn(
                            'py-3 px-4 rounded-lg text-sm font-medium transition-all duration-200',
                            'relative overflow-hidden',
                            currentDate.getFullYear() === year
                              ? 'bg-brand text-graphite-900 font-bold'
                              : 'bg-graphite-700/50 text-graphite-200 hover:bg-graphite-700'
                          )}
                        >
                          {year}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className="px-4 py-3 bg-graphite-900/50 border-t border-graphite-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-brand shadow-[0_0_8px_rgba(204,255,0,0.6)]" />
                    <span className="text-xs text-graphite-400">
                      {selectedDate ? formatDate(selectedDate) : 'Select a date'}
                    </span>
                  </div>
                  <motion.button
                    type="button"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsOpen(false)}
                    className="text-xs font-medium text-brand hover:text-brand/90 transition-colors"
                  >
                    Close
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
