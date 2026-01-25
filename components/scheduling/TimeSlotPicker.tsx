'use client'

import React from 'react'
import { Clock } from 'lucide-react'
import { type TimeSlot } from '@/lib/scheduling/types'

interface TimeSlotPickerProps {
  selectedTime: string | null
  onSelect: (time: string) => void
  availableSlots: TimeSlot[]
  loading?: boolean
  className?: string
}

export function TimeSlotPicker({ selectedTime, onSelect, availableSlots, loading, className }: TimeSlotPickerProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-900 mb-2">Promised Time</label>
      <div className="border-2 border-gray-300 rounded-xl p-4 bg-white">
        {loading ? (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Clock className="h-5 w-5 animate-pulse" />
            <p className="text-sm">Loading time slots...</p>
          </div>
        ) : (
          <div className="flex items-center justify-center gap-2 text-gray-500">
            <Clock className="h-5 w-5" />
            <p className="text-sm">Time slot picker - Ready for implementation</p>
          </div>
        )}
      </div>
    </div>
  )
}
