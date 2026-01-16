'use client'

import React, { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Calendar as CalendarIcon,
  Clock,
  Users,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  Loader2,
  CheckCircle,
  Circle,
  Timer,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'

/**
 * Calendar & Schedule Management Page
 *
 * A comprehensive interface for managing garage schedules.
 * Features include:
 * - Calendar view with daily/weekly/monthly views
 * - Employee shift scheduling
 * - Work slot management
 * - Activity/task tracking with status
 * - Time tracking for tasks
 */

interface Employee {
  id: string
  firstName: string
  lastName: string
  employeeId: string
  role: string
  status: 'active' | 'inactive' | 'on-leave'
}

interface Shift {
  id: string
  employeeId: string
  employeeName: string
  date: string
  startTime: string
  endTime: string
  status: 'scheduled' | 'in-progress' | 'completed' | 'cancelled'
  breakTime?: number
}

interface Activity {
  id: string
  title: string
  description: string
  assignedTo: string
  assignedToName: string
  date: string
  startTime?: string
  endTime?: string
  status: 'pending' | 'in-progress' | 'done'
  bay?: string
  jobCardId?: string
}

export default function CalendarManagementPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Calendar state
  const [currentDate, setCurrentDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month')

  // Data state
  const [employees, setEmployees] = useState<Employee[]>([])
  const [shifts, setShifts] = useState<Shift[]>([])
  const [activities, setActivities] = useState<Activity[]>([])

  // Modal states
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false)
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'in-progress' | 'completed' | 'cancelled'>('all')

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      // Check authentication
      const sessionUser = sessionStorage.getItem('user')
      if (!sessionUser) {
        router.push('/login')
        return
      }

      const currentUser = JSON.parse(sessionUser)
      const garageId = currentUser.garageId

      if (!garageId) {
        setError('Invalid user session')
        setIsLoading(false)
        return
      }

      // Fetch employees
      const employeeResponse = await fetch(`/api/employees/list?garageId=${garageId}`)
      if (employeeResponse.ok) {
        const result = await employeeResponse.json()
        if (result.success) {
          setEmployees(result.employees.filter((emp: Employee) => emp.status === 'active'))
        }
      }

      // Load mock data for shifts and activities
      // In production, these would come from APIs
      loadMockData()

      setIsLoading(false)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading data:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  const loadMockData = () => {
    // Mock shifts data
    const today = new Date()
    const mockShifts: Shift[] = [
      {
        id: '1',
        employeeId: 'emp1',
        employeeName: 'John Doe',
        date: formatDate(today),
        startTime: '09:00',
        endTime: '17:00',
        status: 'in-progress',
        breakTime: 60,
      },
      {
        id: '2',
        employeeId: 'emp2',
        employeeName: 'Jane Smith',
        date: formatDate(today),
        startTime: '08:00',
        endTime: '16:00',
        status: 'completed',
        breakTime: 30,
      },
      {
        id: '3',
        employeeId: 'emp3',
        employeeName: 'Mike Johnson',
        date: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
        startTime: '10:00',
        endTime: '18:00',
        status: 'scheduled',
      },
    ]

    // Mock activities data
    const mockActivities: Activity[] = [
      {
        id: 'act1',
        title: 'Engine Rebuild',
        description: 'Complete engine rebuild for Honda CBR650R',
        assignedTo: 'emp1',
        assignedToName: 'John Doe',
        date: formatDate(today),
        startTime: '09:30',
        status: 'in-progress',
        bay: 'Bay 1',
        jobCardId: 'JC-001',
      },
      {
        id: 'act2',
        title: 'Oil Change',
        description: 'Regular oil change and filter replacement',
        assignedTo: 'emp2',
        assignedToName: 'Jane Smith',
        date: formatDate(today),
        startTime: '14:00',
        endTime: '15:00',
        status: 'done',
        bay: 'Bay 2',
      },
      {
        id: 'act3',
        title: 'Brake Inspection',
        description: 'Inspect and replace brake pads if needed',
        assignedTo: 'emp1',
        assignedToName: 'John Doe',
        date: formatDate(new Date(today.getTime() + 24 * 60 * 60 * 1000)),
        status: 'pending',
        bay: 'Bay 1',
      },
    ]

    setShifts(mockShifts)
    setActivities(mockActivities)
  }

  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0]
  }

  // Calendar navigation
  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
    } else {
      newDate.setDate(newDate.getDate() + (direction === 'next' ? 1 : -1))
    }
    setCurrentDate(newDate)
  }

  // Get days in month for calendar view
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days = []

    // Add empty cells for days before first of month
    for (let i = 0; i < firstDay; i++) {
      days.push(null)
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  // Get filtered activities
  const filteredActivities = activities.filter((activity) => {
    const matchesSearch =
      searchQuery === '' ||
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.assignedToName.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || activity.status === statusFilter

    return matchesSearch && matchesStatus
  })

  // Get activities for a specific date
  const getActivitiesForDate = (date: Date) => {
    const dateStr = formatDate(date)
    return activities.filter((activity) => activity.date === dateStr)
  }

  // Get shifts for a specific date
  const getShiftsForDate = (date: Date) => {
    const dateStr = formatDate(date)
    return shifts.filter((shift) => shift.date === dateStr)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'pending':
        return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
      case 'in-progress':
        return 'text-blue-400 bg-blue-400/10 border-blue-400/30'
      case 'completed':
      case 'done':
        return 'text-status-success bg-status-success/10 border-status-success/30'
      case 'cancelled':
        return 'text-status-error bg-status-error/10 border-status-error/30'
      default:
        return 'text-graphite-400'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'scheduled':
      case 'pending':
        return Circle
      case 'in-progress':
        return Timer
      case 'completed':
      case 'done':
        return CheckCircle
      default:
        return AlertCircle
    }
  }

  const handleAddShift = (date: Date) => {
    setSelectedDate(date)
    setIsShiftModalOpen(true)
  }

  const handleAddActivity = (date: Date) => {
    setSelectedDate(date)
    setIsActivityModalOpen(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <Loader2 className="h-12 w-12 animate-spin text-brand mx-auto mb-4" />
          <p className="text-graphite-600 font-medium">Loading calendar...</p>
        </motion.div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-md w-full bg-white/70 backdrop-blur-sm rounded-2xl border border-red-500/50 p-8 shadow-2xl"
        >
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-graphite-900 text-center mb-2">Error Loading Calendar</h2>
          <p className="text-sm text-graphite-600 text-center">{error}</p>
        </motion.div>
      </div>
    )
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-8">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6 md:mb-8"
        >
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-1 bg-graphite-600 rounded-full" />
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                  Calendar & Schedule
                </h1>
                <p className="text-sm md:text-base text-graphite-600 mt-1">
                  Manage shifts, appointments, and tasks
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="hidden md:flex items-center gap-1 bg-graphite-800 rounded-xl p-1 border border-graphite-700">
                <button
                  onClick={() => setViewMode('month')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    viewMode === 'month' ? 'bg-brand text-graphite-900' : 'text-white hover:bg-graphite-700'
                  )}
                >
                  Month
                </button>
                <button
                  onClick={() => setViewMode('week')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    viewMode === 'week' ? 'bg-brand text-graphite-900' : 'text-white hover:bg-graphite-700'
                  )}
                >
                  Week
                </button>
                <button
                  onClick={() => setViewMode('day')}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium transition-all',
                    viewMode === 'day' ? 'bg-brand text-graphite-900' : 'text-white hover:bg-graphite-700'
                  )}
                >
                  Day
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        {/* Calendar Navigation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="mb-6 bg-graphite-800 backdrop-blur-sm rounded-xl p-4 border border-graphite-700"
        >
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 text-white hover:bg-graphite-700 rounded-lg transition-all"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="text-center">
              <h2 className="text-xl font-bold text-white">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
            </div>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 text-white hover:bg-graphite-700 rounded-lg transition-all"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </motion.div>

        {/* Calendar Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8"
        >
          <div className="bg-graphite-800 rounded-xl border border-graphite-700 overflow-hidden">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-graphite-700">
              {weekDays.map((day) => (
                <div
                  key={day}
                  className="p-3 text-center text-sm font-semibold text-graphite-400 border-r border-graphite-700 last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentDate).map((date, index) => {
                if (!date) {
                  return <div key={`empty-${index}`} className="min-h-[100px] bg-graphite-800/50" />
                }

                const dayActivities = getActivitiesForDate(date)
                const dayShifts = getShiftsForDate(date)
                const isToday = formatDate(date) === formatDate(new Date())
                const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate)

                return (
                  <motion.div
                    key={index}
                    whileHover={{ backgroundColor: 'rgba(255, 255, 255, 0.03)' }}
                    className={cn(
                      'min-h-[100px] p-2 border-r border-b border-graphite-700 last:border-r-0 cursor-pointer transition-all',
                      isToday && 'bg-brand/5',
                      isSelected && 'bg-brand/10'
                    )}
                    onClick={() => setSelectedDate(date)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'text-sm font-medium',
                          isToday ? 'bg-brand text-graphite-900 rounded-full w-7 h-7 flex items-center justify-center' : 'text-white'
                        )}
                      >
                        {date.getDate()}
                      </span>
                      <div className="flex gap-1">
                        {dayShifts.length > 0 && (
                          <div className="h-2 w-2 rounded-full bg-blue-400" title={`${dayShifts.length} shift(s)`} />
                        )}
                        {dayActivities.length > 0 && (
                          <div className="h-2 w-2 rounded-full bg-brand" title={`${dayActivities.length} activit(y/ies)`} />
                        )}
                      </div>
                    </div>

                    {/* Activities Preview */}
                    <div className="space-y-1">
                      {dayActivities.slice(0, 2).map((activity) => {
                        const StatusIcon = getStatusIcon(activity.status)
                        return (
                          <div
                            key={activity.id}
                            className="flex items-center gap-1 text-xs truncate"
                          >
                            <StatusIcon className="h-3 w-3 shrink-0 text-brand" />
                            <span className="text-graphite-300 truncate">{activity.title}</span>
                          </div>
                        )
                      })}
                      {dayActivities.length > 2 && (
                        <div className="text-xs text-graphite-500 pl-4">
                          +{dayActivities.length - 2} more
                        </div>
                      )}
                    </div>

                    {/* Add button for mobile */}
                    <div className="md:hidden mt-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleAddActivity(date)
                        }}
                        className="w-full py-1 bg-brand/10 hover:bg-brand/20 rounded text-xs text-brand font-medium transition-all"
                      >
                        + Add
                      </button>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* Selected Date Details */}
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mb-6"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-graphite-600">
                {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </h2>
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddShift(selectedDate)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white font-semibold rounded-lg hover:bg-blue-600 transition-all"
                >
                  <Clock className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Shift</span>
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleAddActivity(selectedDate)}
                  className="flex items-center gap-2 px-4 py-2 bg-brand text-graphite-900 font-semibold rounded-lg hover:bg-brand/90 transition-all"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Add Activity</span>
                </motion.button>
              </div>
            </div>

            {/* Shifts for selected date */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-graphite-600 mb-3 flex items-center gap-2">
                <Clock className="h-5 w-5 text-blue-400" />
                Scheduled Shifts
              </h3>
              <div className="space-y-3">
                {getShiftsForDate(selectedDate).map((shift) => {
                  const StatusIcon = getStatusIcon(shift.status)
                  return (
                    <motion.div
                      key={shift.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-graphite-800 rounded-xl border border-graphite-700 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Users className="h-5 w-5 text-blue-400" />
                            <div>
                              <h4 className="text-white font-medium">{shift.employeeName}</h4>
                              <p className="text-sm text-graphite-400">
                                {shift.startTime} - {shift.endTime}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 ml-8">
                            <span
                              className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                                getStatusColor(shift.status)
                              )}
                            >
                              <StatusIcon className="h-3 w-3 inline mr-1" />
                              {shift.status.charAt(0).toUpperCase() + shift.status.slice(1)}
                            </span>
                            {shift.breakTime && (
                              <span className="text-xs text-graphite-400">
                                Break: {shift.breakTime} min
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-graphite-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {getShiftsForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 bg-graphite-800 rounded-xl border border-graphite-700">
                    <Clock className="h-12 w-12 text-graphite-600 mx-auto mb-3" />
                    <p className="text-graphite-400">No shifts scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>

            {/* Activities for selected date */}
            <div>
              <h3 className="text-lg font-semibold text-graphite-600 mb-3 flex items-center gap-2">
                <CalendarIcon className="h-5 w-5 text-brand" />
                Scheduled Activities
              </h3>
              <div className="space-y-3">
                {getActivitiesForDate(selectedDate).map((activity) => {
                  const StatusIcon = getStatusIcon(activity.status)
                  return (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-graphite-800 rounded-xl border border-graphite-700 p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <StatusIcon className="h-5 w-5 text-brand" />
                            <div>
                              <h4 className="text-white font-medium">{activity.title}</h4>
                              <p className="text-sm text-graphite-400">{activity.description}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2 ml-8 text-sm">
                            <span className="text-graphite-400">
                              Assigned to: <span className="text-white">{activity.assignedToName}</span>
                            </span>
                            {activity.bay && (
                              <span className="px-2 py-1 bg-graphite-700 rounded text-xs text-white">
                                {activity.bay}
                              </span>
                            )}
                            {activity.startTime && (
                              <span className="text-graphite-400">
                                {activity.startTime} {activity.endTime && `- ${activity.endTime}`}
                              </span>
                            )}
                            <span
                              className={cn(
                                'px-2.5 py-1 rounded-lg text-xs font-semibold border',
                                getStatusColor(activity.status)
                              )}
                            >
                              {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-graphite-400 hover:text-brand hover:bg-brand/10 rounded-lg transition-all"
                          >
                            <Edit className="h-4 w-4" />
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="p-2 text-graphite-400 hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all"
                          >
                            <Trash2 className="h-4 w-4" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
                {getActivitiesForDate(selectedDate).length === 0 && (
                  <div className="text-center py-8 bg-graphite-800 rounded-xl border border-graphite-700">
                    <CalendarIcon className="h-12 w-12 text-graphite-600 mx-auto mb-3" />
                    <p className="text-graphite-400">No activities scheduled for this day</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* All Activities List (Mobile) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="md:hidden"
        >
          <h2 className="text-xl font-bold text-white mb-4">All Activities</h2>
          <div className="space-y-3">
            {filteredActivities.map((activity) => {
              const StatusIcon = getStatusIcon(activity.status)
              return (
                <motion.div
                  key={activity.id}
                  className="bg-graphite-800 rounded-xl border border-graphite-700 p-4"
                >
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-brand/20 to-brand/5 flex items-center justify-center border border-brand/20 flex-shrink-0">
                      <StatusIcon className="h-5 w-5 text-brand" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-medium truncate">{activity.title}</h3>
                        <span
                          className={cn(
                            'px-2 py-0.5 rounded-md text-xs font-semibold border flex-shrink-0',
                            getStatusColor(activity.status)
                          )}
                        >
                          {activity.status.charAt(0).toUpperCase() + activity.status.slice(1)}
                        </span>
                      </div>
                      <p className="text-sm text-graphite-400 mb-2">{activity.description}</p>
                      <div className="flex items-center gap-2 text-xs text-graphite-500">
                        <Users className="h-3 w-3" />
                        <span>{activity.assignedToName}</span>
                        {activity.bay && (
                          <>
                            <span>•</span>
                            <span>{activity.bay}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      </div>

      {/* Add Shift Modal */}
      {isShiftModalOpen && (
        <AddShiftModal
          isOpen={isShiftModalOpen}
          onClose={() => setIsShiftModalOpen(false)}
          date={selectedDate}
          employees={employees}
          onAdd={(shift) => {
            setShifts([...shifts, shift])
            setIsShiftModalOpen(false)
          }}
        />
      )}

      {/* Add Activity Modal */}
      {isActivityModalOpen && (
        <AddActivityModal
          isOpen={isActivityModalOpen}
          onClose={() => setIsActivityModalOpen(false)}
          date={selectedDate}
          employees={employees}
          onAdd={(activity) => {
            setActivities([...activities, activity])
            setIsActivityModalOpen(false)
          }}
        />
      )}
    </>
  )
}

/**
 * Add Shift Modal Component
 */
interface AddShiftModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date | null
  employees: Employee[]
  onAdd: (shift: Shift) => void
}

function AddShiftModal({ isOpen, onClose, date, employees, onAdd }: AddShiftModalProps) {
  const [formData, setFormData] = useState({
    employeeId: '',
    startTime: '09:00',
    endTime: '17:00',
    breakTime: 60,
    status: 'scheduled' as Shift['status'],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !date) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const employee = employees.find((emp) => emp.id === formData.employeeId)
      if (!employee) {
        setError('Please select an employee')
        setIsLoading(false)
        return
      }

      const newShift: Shift = {
        id: Date.now().toString(),
        employeeId: formData.employeeId,
        employeeName: `${employee.firstName} ${employee.lastName}`,
        date: date.toISOString().split('T')[0],
        startTime: formData.startTime,
        endTime: formData.endTime,
        status: formData.status,
        breakTime: formData.breakTime,
      }

      onAdd(newShift)
      onClose()
    } catch (err) {
      setError('Failed to add shift')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md"
      >
        <div className="p-6 border-b border-graphite-200">
          <h2 className="text-xl font-bold text-graphite-900">Add Shift</h2>
          <p className="text-sm text-graphite-600">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-1.5">
              Employee *
            </label>
            <select
              required
              value={formData.employeeId}
              onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
              className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.role}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                Start Time *
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                End Time *
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-1.5">
              Break Time (minutes)
            </label>
            <input
              type="number"
              value={formData.breakTime}
              onChange={(e) => setFormData({ ...formData, breakTime: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-graphite-300 text-graphite-700 font-semibold rounded-xl hover:bg-graphite-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-blue-500 text-white font-semibold rounded-xl hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Shift
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

/**
 * Add Activity Modal Component
 */
interface AddActivityModalProps {
  isOpen: boolean
  onClose: () => void
  date: Date | null
  employees: Employee[]
  onAdd: (activity: Activity) => void
}

function AddActivityModal({ isOpen, onClose, date, employees, onAdd }: AddActivityModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    assignedTo: '',
    startTime: '',
    endTime: '',
    bay: '',
    status: 'pending' as Activity['status'],
  })

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !date) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const employee = employees.find((emp) => emp.id === formData.assignedTo)
      if (!employee) {
        setError('Please select an employee')
        setIsLoading(false)
        return
      }

      const newActivity: Activity = {
        id: Date.now().toString(),
        title: formData.title,
        description: formData.description,
        assignedTo: formData.assignedTo,
        assignedToName: `${employee.firstName} ${employee.lastName}`,
        date: date.toISOString().split('T')[0],
        startTime: formData.startTime || undefined,
        endTime: formData.endTime || undefined,
        status: formData.status,
        bay: formData.bay || undefined,
      }

      onAdd(newActivity)
      onClose()
    } catch (err) {
      setError('Failed to add activity')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-graphite-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-graphite-900">Add Activity</h2>
          <p className="text-sm text-graphite-600">
            {date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-1.5">
              Title *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Engine Rebuild"
              className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-1.5">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the task..."
              rows={3}
              className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-1.5">
              Assign To *
            </label>
            <select
              required
              value={formData.assignedTo}
              onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Select Employee</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>
                  {emp.firstName} {emp.lastName} - {emp.role}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                Start Time
              </label>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-graphite-700 mb-1.5">
                End Time
              </label>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-1.5">
              Bay
            </label>
            <select
              value={formData.bay}
              onChange={(e) => setFormData({ ...formData, bay: e.target.value })}
              className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="">Select Bay</option>
              <option value="Bay 1">Bay 1</option>
              <option value="Bay 2">Bay 2</option>
              <option value="Bay 3">Bay 3</option>
              <option value="Bay 4">Bay 4</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-graphite-700 mb-1.5">
              Status *
            </label>
            <select
              required
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as Activity['status'] })}
              className="w-full px-4 py-2.5 bg-graphite-50 border border-graphite-200 rounded-xl text-graphite-900 focus:outline-none focus:ring-2 focus:ring-brand focus:border-transparent appearance-none cursor-pointer"
            >
              <option value="pending">Pending</option>
              <option value="in-progress">In Progress</option>
              <option value="done">Done</option>
            </select>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 px-6 py-3 border border-graphite-300 text-graphite-700 font-semibold rounded-xl hover:bg-graphite-50 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-brand text-graphite-900 font-semibold rounded-xl hover:bg-brand/90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  Add Activity
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}
