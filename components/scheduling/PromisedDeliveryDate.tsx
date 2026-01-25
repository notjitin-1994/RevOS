'use client'

import React, { useState, useEffect } from 'react'
import { Calendar } from 'lucide-react'
import { DatePicker } from '@/components/ui/date-picker'
import { cn } from '@/lib/utils'

interface PromisedDeliveryDateProps {
  value: Date | null
  onChange: (date: Date | null) => void
  label?: string
  required?: boolean
  error?: string
  disabled?: boolean
  minDate?: Date
  maxDate?: Date
  className?: string
}

export function PromisedDeliveryDate({
  value,
  onChange,
  label = 'Promised Delivery Date',
  required = false,
  error,
  disabled = false,
  minDate,
  maxDate,
  className,
}: PromisedDeliveryDateProps) {
  // Convert Date to string format for DatePicker component
  const [dateString, setDateString] = useState<string>(() => {
    if (value) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')
      return `${year}-${month}-${day}`
    }
    return ''
  })

  // Update local state when value prop changes
  useEffect(() => {
    if (value) {
      const year = value.getFullYear()
      const month = String(value.getMonth() + 1).padStart(2, '0')
      const day = String(value.getDate()).padStart(2, '0')
      setDateString(`${year}-${month}-${day}`)
    } else {
      setDateString('')
    }
  }, [value])

  // Handle date change from DatePicker
  const handleDateChange = (newDate: string) => {
    setDateString(newDate)

    // Convert string back to Date and call parent onChange
    if (newDate) {
      const [year, month, day] = newDate.split('-').map(Number)
      const date = new Date(year, month - 1, day)

      // Validate against min/max dates
      if (minDate && date < minDate) {
        return // Date is before minDate, ignore
      }
      if (maxDate && date > maxDate) {
        return // Date is after maxDate, ignore
      }

      onChange(date)
    } else {
      onChange(null)
    }
  }

  // Handle clearing the date
  const handleClear = () => {
    setDateString('')
    onChange(null)
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Label */}
      {label && (
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}

      {/* Date Picker Wrapper */}
      <div className="relative">
        <DatePicker
          value={dateString}
          onChange={handleDateChange}
          placeholder="Select delivery date"
          className="w-full"
          theme="light"
        />

        {/* Clear Button - Show when date is selected */}
        {dateString && !disabled && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute right-12 top-1/2 -translate-y-1/2 p-2 rounded-lg hover:bg-gray-100 active:bg-gray-200 transition-colors duration-200 z-10"
            aria-label="Clear date selection"
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
      </div>

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

      {/* Helper Text */}
      {!error && (
        <p className="mt-2 text-xs text-slate-700 ml-1">
          The date you promise to complete the service
        </p>
      )}
    </div>
  )
}
