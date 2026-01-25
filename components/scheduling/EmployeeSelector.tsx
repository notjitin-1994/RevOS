'use client'

import React from 'react'
import { Users, Wrench, type LucideIcon } from 'lucide-react'
import { type Employee } from '@/lib/scheduling/types'
import { cn } from '@/lib/utils'

interface EmployeeSelectorProps {
  label: string
  placeholder: string
  employees: Employee[]
  selectedEmployeeId: string | null
  onSelect: (id: string | null) => void
  roleFilter?: string[]
  icon?: LucideIcon
  className?: string
}

export function EmployeeSelector({
  label,
  placeholder,
  employees,
  selectedEmployeeId,
  onSelect,
  roleFilter = [],
  icon: Icon = Users,
  className,
}: EmployeeSelectorProps) {
  const filteredEmployees = roleFilter.length > 0
    ? employees.filter(emp => roleFilter.includes(emp.role))
    : employees

  return (
    <div className={className}>
      <label className="block text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
        <Icon className="h-4 w-4" />
        {label}
      </label>
      <div className="border-2 border-gray-300 rounded-xl p-4 bg-white">
        <div className="flex items-center gap-2 text-gray-500">
          <Icon className="h-5 w-5" />
          <p className="text-sm">{placeholder}</p>
        </div>
      </div>
    </div>
  )
}
