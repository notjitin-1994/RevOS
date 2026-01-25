"use client"

import * as React from "react"
import { DayPicker } from "react-day-picker"

import { cn } from "@/lib/utils"

export type CalendarProps = React.ComponentProps<typeof DayPicker>

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  ...props
}: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      className={cn("p-4", className)}
      classNames={{
        months: "flex flex-col sm:flex-row gap-4",
        month: "flex flex-col gap-4",
        caption: "flex justify-center items-center relative pt-1 px-10",
        caption_label: "text-base font-semibold text-gray-900",
        nav: "flex items-center gap-1",
        nav_button: "h-8 w-8 inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed",
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        nav_icon: "h-4 w-4",
        table: "w-full",
        head: "mb-2",
        head_row: "grid grid-cols-7 mb-1",
        head_cell: "text-xs font-semibold text-gray-500 uppercase tracking-wide text-center py-2",
        tbody: "flex flex-col gap-1",
        row: "grid grid-cols-7 gap-1 w-full",
        cell: "aspect-square p-0 relative",
        day: "h-full w-full rounded-lg font-medium text-sm text-gray-900 transition-all duration-200 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-[#0F172A] focus:ring-offset-2 cursor-pointer flex items-center justify-center",
        day_selected: "bg-[#0F172A] text-white hover:bg-[#0F172A] focus:bg-[#0F172A]",
        day_today: "bg-gray-100 text-gray-900 font-semibold border-2 border-gray-300",
        day_outside: "text-gray-400 opacity-50 hover:bg-transparent",
        day_disabled: "text-gray-300 opacity-50 cursor-not-allowed hover:bg-transparent",
        day_range_start: "rounded-l-lg",
        day_range_end: "rounded-r-lg",
        day_range_middle: "rounded-none",
        day_hidden: "invisible",
        ...classNames,
      }}
      {...props}
    />
  )
}
Calendar.displayName = "Calendar"

export { Calendar }
