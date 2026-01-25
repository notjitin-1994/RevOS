"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface PopoverDatePickerProps {
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
}

export function PopoverDatePicker({
  value,
  onChange,
  placeholder = "Pick a date",
  className,
}: PopoverDatePickerProps) {
  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-900 mb-2">Promised Date</label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            data-empty={!value}
            className={cn(
              "w-full justify-start text-left font-normal h-12 px-4 rounded-xl border-2 border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 transition-all",
              "data-[empty=true]:text-gray-500",
            )}
          >
            <CalendarIcon className="mr-2 h-5 w-5 text-gray-500" />
            <span className={cn(!value && "text-gray-500")}>
              {value ? format(value, "PPP") : placeholder}
            </span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 border-2 border-gray-200" align="start">
          <Calendar
            mode="single"
            selected={value}
            onSelect={onChange}
            initialFocus
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
