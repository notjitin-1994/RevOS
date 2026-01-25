'use client'

import React, { useState, useEffect } from 'react'
import { Calendar, Clock, User, Wrench, ChevronDown, Loader2 } from 'lucide-react'
import { PromisedDeliveryDate } from './PromisedDeliveryDate'
import { TimePicker } from './TimePicker'
import { cn } from '@/lib/utils'

interface Employee {
  userUid: string
  firstName: string
  lastName: string
  userRole: string
  employeeId?: string | null
}

interface SchedulingData {
  promisedDate: string | null
  promisedTime: string | null
  actualStartDate: string | null
  actualCompletionDate: string | null
  bayAssigned: string | null
  serviceAdvisorId?: string | null
  mechanicId?: string | null
}

interface SchedulingTabProps {
  jobCardId: string
  initialData: SchedulingData
  onDataChange: (data: Partial<SchedulingData>) => void
  onCancel?: () => void
  className?: string
}

export function SchedulingTab({ jobCardId, initialData, onDataChange, onCancel, className }: SchedulingTabProps) {
  // Local state for promised date
  const [promisedDate, setPromisedDate] = useState<Date | null>(
    initialData.promisedDate ? new Date(initialData.promisedDate) : null
  )

  // Local state for promised time
  const [promisedTime, setPromisedTime] = useState<string | null>(initialData.promisedTime || null)

  // Local state for service advisor and mechanic
  const [serviceAdvisorId, setServiceAdvisorId] = useState<string | null>(
    initialData.serviceAdvisorId || null
  )
  const [mechanicId, setMechanicId] = useState<string | null>(
    initialData.mechanicId || null
  )

  // Employees data
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(false)
  const [employeeError, setEmployeeError] = useState<string | null>(null)

  // Dropdown open states
  const [advisorDropdownOpen, setAdvisorDropdownOpen] = useState(false)
  const [mechanicDropdownOpen, setMechanicDropdownOpen] = useState(false)

  // Set minimum date to today
  const [minDate] = useState<Date>(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return today
  })

  // Set maximum date to 1 year from now
  const [maxDate] = useState<Date>(() => {
    const maxDate = new Date()
    maxDate.setFullYear(maxDate.getFullYear() + 1)
    return maxDate
  })

  // Fetch employees
  useEffect(() => {
    const fetchEmployees = async () => {
      setIsLoadingEmployees(true)
      setEmployeeError(null)
      try {
        // Get garage ID from sessionStorage (user data stored there after login)
        const userStr = sessionStorage.getItem('user')
        if (!userStr) {
          console.warn('No user data found in sessionStorage')
          setEmployeeError('Please log in to view employees')
          return
        }

        const user = JSON.parse(userStr)
        const garageId = user?.garageId

        if (!garageId) {
          console.warn('No garage ID found in user data', user)
          setEmployeeError('No garage ID found. Please log in again.')
          return
        }

        console.log('Fetching employees for garage:', garageId)

        const response = await fetch(`/api/employees/list?garageId=${garageId}`)
        const result = await response.json()

        console.log('Employees API response:', result)

        if (!response.ok) {
          throw new Error(result.error || result.details || 'Failed to fetch employees')
        }

        if (result.success) {
          setEmployees(result.employees || [])
          console.log(`Loaded ${result.employees?.length || 0} employees`)

          // Log role distribution for debugging
          const roles = result.employees?.map((e: Employee) => e.userRole) || []
          console.log('Employee roles:', roles)
        } else {
          throw new Error(result.error || 'Unknown error')
        }
      } catch (error) {
        console.error('Failed to fetch employees:', error)
        setEmployeeError(error instanceof Error ? error.message : 'Failed to load employees')
        setEmployees([])
      } finally {
        setIsLoadingEmployees(false)
      }
    }

    fetchEmployees()
  }, [])

  // Sync local state with initialData when it changes
  // This ensures data persistence when editing an existing job card
  useEffect(() => {
    console.log('[SchedulingTab] initialData changed:', initialData)

    if (initialData.promisedDate) {
      const date = typeof initialData.promisedDate === 'string'
        ? new Date(initialData.promisedDate)
        : initialData.promisedDate
      console.log('[SchedulingTab] Syncing promisedDate from initialData:', date)
      setPromisedDate(date)
    } else {
      setPromisedDate(null)
    }

    if (initialData.promisedTime !== undefined) {
      console.log('[SchedulingTab] Syncing promisedTime from initialData:', initialData.promisedTime)
      setPromisedTime(initialData.promisedTime)
    } else {
      setPromisedTime(null)
    }

    if (initialData.serviceAdvisorId !== undefined) {
      console.log('[SchedulingTab] Syncing serviceAdvisorId from initialData:', initialData.serviceAdvisorId)
      setServiceAdvisorId(initialData.serviceAdvisorId)
    } else {
      setServiceAdvisorId(null)
    }

    if (initialData.mechanicId !== undefined) {
      console.log('[SchedulingTab] Syncing mechanicId from initialData:', initialData.mechanicId)
      setMechanicId(initialData.mechanicId)
    } else {
      setMechanicId(null)
    }
  }, [initialData.promisedDate, initialData.promisedTime, initialData.serviceAdvisorId, initialData.mechanicId])

  // Filter employees by role
  const serviceAdvisors = employees.filter(emp => {
    const role = emp.userRole.toLowerCase()
    return (
      role.includes('advisor') ||
      role.includes('service') ||
      role.includes('manager') ||
      role.includes('owner')
    )
  })

  const mechanics = employees.filter(emp => {
    const role = emp.userRole.toLowerCase()
    return role.includes('mechanic')
  })

  // Update parent when values change
  useEffect(() => {
    onDataChange({
      promisedDate: promisedDate ? promisedDate.toISOString() : null,
      promisedTime: promisedTime,
      serviceAdvisorId: serviceAdvisorId,
      mechanicId: mechanicId,
    })
  }, [promisedDate, promisedTime, serviceAdvisorId, mechanicId, onDataChange])

  const getEmployeeName = (employeeId: string | null) => {
    if (!employeeId) return 'Select employee'
    const employee = employees.find(emp => emp.userUid === employeeId)
    if (employee) {
      return `${employee.firstName} ${employee.lastName}`
    }
    return 'Select employee'
  }

  return (
    <div className={className}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-display font-bold text-gray-900">
            Schedule Service
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Set promised delivery date and time, and assign team members
          </p>
        </div>
      </div>

      {/* Schedule Form */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
        {/* Grid Layout for 4 Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 1. Promised Delivery Date */}
          <PromisedDeliveryDate
            value={promisedDate}
            onChange={setPromisedDate}
            label="Promised Delivery Date"
            required={true}
            minDate={minDate}
            maxDate={maxDate}
          />

          {/* 2. Promised Delivery Time */}
          <TimePicker
            value={promisedTime}
            onChange={setPromisedTime}
            label="Promised Delivery Time"
            required={true}
          />

          {/* 3. Service Advisor Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Service Advisor
            </label>
            <div className="relative" ref={advisorDropdownOpen ? (node) => {
              if (node && !node.contains(document.activeElement)) {
                setAdvisorDropdownOpen(false)
              }
            } : null}>
              <button
                type="button"
                onClick={() => setAdvisorDropdownOpen(!advisorDropdownOpen)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3',
                  'bg-white border-2 border-gray-300 rounded-xl',
                  'text-slate-900 text-sm font-medium',
                  'hover:border-gray-400 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2'
                )}
              >
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-700" />
                  <span>
                    {isLoadingEmployees ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      getEmployeeName(serviceAdvisorId) || 'Select advisor'
                    )}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {advisorDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {serviceAdvisors.length > 0 ? (
                    serviceAdvisors.map((advisor) => (
                      <button
                        key={advisor.userUid}
                        type="button"
                        onClick={() => {
                          setServiceAdvisorId(advisor.userUid)
                          setAdvisorDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors',
                          'flex items-center justify-between',
                          serviceAdvisorId === advisor.userUid && 'bg-gray-100 font-semibold'
                        )}
                      >
                        <span className="text-slate-900">{`${advisor.firstName} ${advisor.lastName}`}</span>
                        {advisor.employeeId && (
                          <span className="text-xs text-slate-700">#{advisor.employeeId}</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-700">
                      {employeeError ? (
                        <span className="text-red-500">{employeeError}</span>
                      ) : !isLoadingEmployees ? (
                        'No advisors, managers, or owners found'
                      ) : (
                        'Loading...'
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-700 mt-1 ml-1">
              Assign an advisor, manager, or owner to this job
            </p>
          </div>

          {/* 4. Mechanic Dropdown */}
          <div className="space-y-1">
            <label className="block text-sm font-semibold text-slate-900 mb-2">
              Mechanic
            </label>
            <div className="relative" ref={mechanicDropdownOpen ? (node) => {
              if (node && !node.contains(document.activeElement)) {
                setMechanicDropdownOpen(false)
              }
            } : null}>
              <button
                type="button"
                onClick={() => setMechanicDropdownOpen(!mechanicDropdownOpen)}
                className={cn(
                  'w-full flex items-center justify-between px-4 py-3',
                  'bg-white border-2 border-gray-300 rounded-xl',
                  'text-slate-900 text-sm font-medium',
                  'hover:border-gray-400 transition-all duration-200',
                  'focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2'
                )}
              >
                <div className="flex items-center gap-3">
                  <Wrench className="h-5 w-5 text-gray-700" />
                  <span>
                    {isLoadingEmployees ? (
                      <span className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Loading...
                      </span>
                    ) : (
                      getEmployeeName(mechanicId) || 'Select mechanic'
                    )}
                  </span>
                </div>
                <ChevronDown className="h-4 w-4 text-gray-500" />
              </button>

              {/* Dropdown Menu */}
              {mechanicDropdownOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border-2 border-gray-200 rounded-xl shadow-lg max-h-60 overflow-auto">
                  {mechanics.length > 0 ? (
                    mechanics.map((mechanic) => (
                      <button
                        key={mechanic.userUid}
                        type="button"
                        onClick={() => {
                          setMechanicId(mechanic.userUid)
                          setMechanicDropdownOpen(false)
                        }}
                        className={cn(
                          'w-full px-4 py-3 text-left text-sm hover:bg-gray-50 transition-colors',
                          'flex items-center justify-between',
                          mechanicId === mechanic.userUid && 'bg-gray-100 font-semibold'
                        )}
                      >
                        <span className="text-slate-900">{`${mechanic.firstName} ${mechanic.lastName}`}</span>
                        {mechanic.employeeId && (
                          <span className="text-xs text-slate-700">#{mechanic.employeeId}</span>
                        )}
                      </button>
                    ))
                  ) : (
                    <div className="px-4 py-3 text-sm text-gray-700">
                      {employeeError ? (
                        <span className="text-red-500">{employeeError}</span>
                      ) : !isLoadingEmployees ? (
                        'No mechanics found'
                      ) : (
                        'Loading...'
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            <p className="text-xs text-slate-700 mt-1 ml-1">
              Assign a mechanic to perform the service
            </p>
          </div>
        </div>

        {/* Info Section */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 mt-0.5">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  Scheduling Information
                </h4>
                <p className="text-sm text-gray-600 leading-relaxed">
                  The promised delivery date and time will be shared with the customer.
                  Assign team members to track responsibility for this job.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Export types for use in other components
export type { SchedulingData }
