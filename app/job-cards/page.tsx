'use client'

import React, { useEffect, useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Plus,
  Loader2,
  AlertCircle,
  FileText,
  User,
  Wrench,
  Clock,
  Filter,
  CircleDot,
  MoreVertical,
  LayoutGrid,
} from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * Job Card Management Page
 *
 * Comprehensive interface for managing garage job cards with:
 * - Job card listing with search and filters
 * - Status-based filtering
 * - Mechanic assignment tracking
 * - Progress indicators
 * - Mobile-responsive design
 */

interface JobCardData {
  id: string
  jobCardNumber: string
  customerId: string
  vehicleId: string
  jobType: string
  priority: string
  status: string
  customerComplaint: string | null
  workRequested: string | null
  currentMileage: number | null
  promisedDate: string | null
  leadMechanicId: string | null
  totalCost: number
  progressPercentage: number
  totalChecklistItems: number
  completedChecklistItems: number
  createdAt: string
}

interface CustomerData {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
}

interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
}

interface EmployeeData {
  id: string
  firstName: string
  lastName: string
}

interface JobCardWithDetails extends JobCardData {
  customer?: CustomerData
  vehicle?: VehicleData
  leadMechanic?: EmployeeData
}

type JobCardStatus = 'all' | 'draft' | 'queued' | 'in_progress' | 'parts_waiting' | 'quality_check' | 'ready' | 'delivered'

interface KanbanColumn {
  id: string
  title: string
  status: JobCardStatus
  color: string
  bgColor: string
  borderColor: string
}

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'draft', title: 'Draft', status: 'draft', color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-300' },
  { id: 'queued', title: 'Queued', status: 'queued', color: 'text-status-info', bgColor: 'bg-blue-50', borderColor: 'border-blue-300' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress', color: 'text-status-warning', bgColor: 'bg-amber-50', borderColor: 'border-amber-300' },
  { id: 'parts_waiting', title: 'Parts Waiting', status: 'parts_waiting', color: 'text-status-error', bgColor: 'bg-red-50', borderColor: 'border-red-300' },
  { id: 'quality_check', title: 'Quality Check', status: 'quality_check', color: 'text-purple-600', bgColor: 'bg-purple-50', borderColor: 'border-purple-300' },
  { id: 'ready', title: 'Ready', status: 'ready', color: 'text-status-success', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
  { id: 'delivered', title: 'Delivered', status: 'delivered', color: 'text-status-success', bgColor: 'bg-green-50', borderColor: 'border-green-300' },
]

export default function JobCardsPage() {
  const router = useRouter()
  const [jobCards, setJobCards] = useState<JobCardWithDetails[]>([])
  const [filteredJobCards, setFilteredJobCards] = useState<JobCardWithDetails[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Search and filter states
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<JobCardStatus>('all')

  // View mode state
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar'>('kanban')

  // Calendar view states
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Horizontal scrollbar refs
  const kanbanScrollRef = useRef<HTMLDivElement>(null)
  const topScrollbarRef = useRef<HTMLDivElement>(null)
  const scrollbarTrackRef = useRef<HTMLDivElement>(null)
  const [showTopScrollbar, setShowTopScrollbar] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [scrollPercentage, setScrollPercentage] = useState(0)

  // Sync scroll between top scrollbar and kanban board
  const handleKanbanScroll = useCallback(() => {
    if (kanbanScrollRef.current && topScrollbarRef.current) {
      topScrollbarRef.current.scrollLeft = kanbanScrollRef.current.scrollLeft

      // Update scroll percentage for real-time thumb movement
      const scrollLeft = kanbanScrollRef.current.scrollLeft
      const scrollWidth = kanbanScrollRef.current.scrollWidth
      const clientWidth = kanbanScrollRef.current.clientWidth
      const maxScroll = scrollWidth - clientWidth
      const percentage = maxScroll > 0 ? scrollLeft / maxScroll : 0
      setScrollPercentage(percentage)
    }
  }, [])

  const handleTopScrollbarScroll = useCallback(() => {
    if (topScrollbarRef.current && kanbanScrollRef.current) {
      kanbanScrollRef.current.scrollLeft = topScrollbarRef.current.scrollLeft

      // Update scroll percentage for real-time thumb movement
      const scrollLeft = topScrollbarRef.current.scrollLeft
      const scrollWidth = topScrollbarRef.current.scrollWidth
      const clientWidth = topScrollbarRef.current.clientWidth
      const maxScroll = scrollWidth - clientWidth
      const percentage = maxScroll > 0 ? scrollLeft / maxScroll : 0
      setScrollPercentage(percentage)
    }
  }, [])

  // Handle clicking on scrollbar track to jump to position
  const handleScrollbarTrackClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrollbarTrackRef.current || !kanbanScrollRef.current) return

    const track = scrollbarTrackRef.current
    const rect = track.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const trackWidth = rect.width

    if (kanbanScrollRef.current) {
      const scrollWidth = kanbanScrollRef.current.scrollWidth
      const clientWidth = kanbanScrollRef.current.clientWidth
      const scrollableWidth = scrollWidth - clientWidth
      const scrollPercentage = clickX / trackWidth

      kanbanScrollRef.current.scrollLeft = scrollPercentage * scrollableWidth
    }
  }, [])

  // Handle drag start on scrollbar thumb
  const handleThumbMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragging(true)

    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollbarTrackRef.current || !kanbanScrollRef.current) return

      const track = scrollbarTrackRef.current
      const rect = track.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const trackWidth = rect.width

      const scrollWidth = kanbanScrollRef.current.scrollWidth
      const clientWidth = kanbanScrollRef.current.clientWidth
      const scrollableWidth = scrollWidth - clientWidth

      // Clamp click position to track bounds
      const clampedX = Math.max(0, Math.min(clickX, trackWidth))
      const percentage = clampedX / trackWidth

      // Update scroll position AND state for real-time visual feedback
      kanbanScrollRef.current.scrollLeft = percentage * scrollableWidth
      setScrollPercentage(percentage)
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [])

  // Check if horizontal scrollbar is needed
  useEffect(() => {
    const checkScrollNeeded = () => {
      if (kanbanScrollRef.current) {
        const needsScroll = kanbanScrollRef.current.scrollWidth > kanbanScrollRef.current.clientWidth
        setShowTopScrollbar(needsScroll)
      }
    }

    checkScrollNeeded()
    window.addEventListener('resize', checkScrollNeeded)
    return () => window.removeEventListener('resize', checkScrollNeeded)
  }, [filteredJobCards, statusFilter])

  const [databaseNotConfigured, setDatabaseNotConfigured] = useState(false)
  const [usingMockData, setUsingMockData] = useState(false)

  const loadJobCards = async () => {
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

      console.log('Using mock data for job cards')

      // Use mock data for now
      const mockJobCards: JobCardWithDetails[] = [
        {
          id: '1',
          jobCardNumber: 'JC-2025-0001',
          customerId: 'cust-1',
          vehicleId: 'veh-1',
          jobType: 'repair',
          priority: 'high',
          status: 'in_progress',
          customerComplaint: 'Engine making strange noise when accelerating',
          workRequested: 'Diagnose and repair engine issue',
          currentMileage: 45000,
          promisedDate: '2025-01-20',
          leadMechanicId: 'mech-1',
          totalCost: 0,
          progressPercentage: 60,
          totalChecklistItems: 5,
          completedChecklistItems: 3,
          createdAt: '2025-01-18T09:30:00Z',
          customer: {
            id: 'cust-1',
            firstName: 'Rajesh',
            lastName: 'Kumar',
            phoneNumber: '+91 98765 43210'
          },
          vehicle: {
            id: 'veh-1',
            make: 'Honda',
            model: 'Activa 6G',
            year: 2023,
            licensePlate: 'KA-03-EM-2345'
          },
          leadMechanic: {
            id: 'mech-1',
            firstName: 'Amit',
            lastName: 'Sharma'
          }
        },
        {
          id: '2',
          jobCardNumber: 'JC-2025-0002',
          customerId: 'cust-2',
          vehicleId: 'veh-2',
          jobType: 'maintenance',
          priority: 'medium',
          status: 'queued',
          customerComplaint: 'Regular service due',
          workRequested: 'Full service with oil change',
          currentMileage: 32000,
          promisedDate: '2025-01-19',
          leadMechanicId: 'mech-2',
          totalCost: 0,
          progressPercentage: 0,
          totalChecklistItems: 8,
          completedChecklistItems: 0,
          createdAt: '2025-01-18T11:15:00Z',
          customer: {
            id: 'cust-2',
            firstName: 'Priya',
            lastName: 'Reddy',
            phoneNumber: '+91 98765 12345'
          },
          vehicle: {
            id: 'veh-2',
            make: 'Bajaj',
            model: 'Pulsar NS200',
            year: 2022,
            licensePlate: 'KA-01-HJ-6789'
          },
          leadMechanic: {
            id: 'mech-2',
            firstName: 'Rahul',
            lastName: 'Verma'
          }
        },
        {
          id: '3',
          jobCardNumber: 'JC-2025-0003',
          customerId: 'cust-3',
          vehicleId: 'veh-3',
          jobType: 'repair',
          priority: 'urgent',
          status: 'parts_waiting',
          customerComplaint: 'Brake failure - need immediate attention',
          workRequested: 'Replace brake pads and check brake system',
          currentMileage: 28000,
          promisedDate: '2025-01-18',
          leadMechanicId: 'mech-1',
          totalCost: 0,
          progressPercentage: 40,
          totalChecklistItems: 4,
          completedChecklistItems: 2,
          createdAt: '2025-01-18T07:00:00Z',
          customer: {
            id: 'cust-3',
            firstName: 'Suresh',
            lastName: 'Patel',
            phoneNumber: '+91 99887 76655'
          },
          vehicle: {
            id: 'veh-3',
            make: 'TVS',
            model: 'Apache RTR 160',
            year: 2021,
            licensePlate: 'KA-05-AB-1234'
          },
          leadMechanic: {
            id: 'mech-1',
            firstName: 'Amit',
            lastName: 'Sharma'
          }
        },
        {
          id: '4',
          jobCardNumber: 'JC-2025-0004',
          customerId: 'cust-4',
          vehicleId: 'veh-4',
          jobType: 'maintenance',
          priority: 'low',
          status: 'ready',
          customerComplaint: 'General checkup before long trip',
          workRequested: 'Complete vehicle inspection',
          currentMileage: 15000,
          promisedDate: '2025-01-17',
          leadMechanicId: 'mech-3',
          totalCost: 0,
          progressPercentage: 100,
          totalChecklistItems: 6,
          completedChecklistItems: 6,
          createdAt: '2025-01-17T14:00:00Z',
          customer: {
            id: 'cust-4',
            firstName: 'Anita',
            lastName: 'Desai',
            phoneNumber: '+91 97654 32109'
          },
          vehicle: {
            id: 'veh-4',
            make: 'Royal Enfield',
            model: 'Classic 350',
            year: 2024,
            licensePlate: 'KA-02-CD-4567'
          },
          leadMechanic: {
            id: 'mech-3',
            firstName: 'Vikram',
            lastName: 'Singh'
          }
        },
        {
          id: '5',
          jobCardNumber: 'JC-2025-0005',
          customerId: 'cust-5',
          vehicleId: 'veh-5',
          jobType: 'repair',
          priority: 'high',
          status: 'quality_check',
          customerComplaint: 'Oil leak observed',
          workRequested: 'Fix oil leak and change gasket',
          currentMileage: 52000,
          promisedDate: '2025-01-18',
          leadMechanicId: 'mech-2',
          totalCost: 0,
          progressPercentage: 90,
          totalChecklistItems: 3,
          completedChecklistItems: 3,
          createdAt: '2025-01-17T16:30:00Z',
          customer: {
            id: 'cust-5',
            firstName: 'Mahesh',
            lastName: 'Nair',
            phoneNumber: '+91 96543 21098'
          },
          vehicle: {
            id: 'veh-5',
            make: 'Suzuki',
            model: 'Access 125',
            year: 2020,
            licensePlate: 'KA-04-EF-8901'
          },
          leadMechanic: {
            id: 'mech-2',
            firstName: 'Rahul',
            lastName: 'Verma'
          }
        },
        {
          id: '6',
          jobCardNumber: 'JC-2025-0006',
          customerId: 'cust-6',
          vehicleId: 'veh-6',
          jobType: 'maintenance',
          priority: 'medium',
          status: 'draft',
          customerComplaint: 'Scheduled maintenance',
          workRequested: '6-month service package',
          currentMileage: 8000,
          promisedDate: '2025-01-21',
          leadMechanicId: null,
          totalCost: 0,
          progressPercentage: 0,
          totalChecklistItems: 10,
          completedChecklistItems: 0,
          createdAt: '2025-01-18T13:00:00Z',
          customer: {
            id: 'cust-6',
            firstName: 'Kavitha',
            lastName: 'Rao',
            phoneNumber: '+91 95432 10987'
          },
          vehicle: {
            id: 'veh-6',
            make: 'Honda',
            model: 'Dio',
            year: 2024,
            licensePlate: 'KA-51-GH-2345'
          },
          leadMechanic: undefined
        },
        {
          id: '7',
          jobCardNumber: 'JC-2025-0007',
          customerId: 'cust-7',
          vehicleId: 'veh-7',
          jobType: 'repair',
          priority: 'urgent',
          status: 'delivered',
          customerComplaint: 'Tyre burst - emergency replacement',
          workRequested: 'Replace both tyres',
          currentMileage: 41000,
          promisedDate: '2025-01-17',
          leadMechanicId: 'mech-1',
          totalCost: 0,
          progressPercentage: 100,
          totalChecklistItems: 2,
          completedChecklistItems: 2,
          createdAt: '2025-01-17T10:00:00Z',
          customer: {
            id: 'cust-7',
            firstName: 'Ravi',
            lastName: 'Menon',
            phoneNumber: '+91 94321 09876'
          },
          vehicle: {
            id: 'veh-7',
            make: 'Yamaha',
            model: 'FZ-Fi V3',
            year: 2022,
            licensePlate: 'KA-03-IJ-6789'
          },
          leadMechanic: {
            id: 'mech-1',
            firstName: 'Amit',
            lastName: 'Sharma'
          }
        },
        {
          id: '8',
          jobCardNumber: 'JC-2025-0008',
          customerId: 'cust-8',
          vehicleId: 'veh-8',
          jobType: 'custom',
          priority: 'medium',
          status: 'in_progress',
          customerComplaint: 'Want to install accessories',
          workRequested: 'Install mobile holder, USB charger, and footrest',
          currentMileage: 25000,
          promisedDate: '2025-01-19',
          leadMechanicId: 'mech-3',
          totalCost: 0,
          progressPercentage: 33,
          totalChecklistItems: 3,
          completedChecklistItems: 1,
          createdAt: '2025-01-18T15:45:00Z',
          customer: {
            id: 'cust-8',
            firstName: 'Deepak',
            lastName: 'Gupta',
            phoneNumber: '+91 93210 98765'
          },
          vehicle: {
            id: 'veh-8',
            make: 'Hero',
            model: 'Splendor Plus',
            year: 2023,
            licensePlate: 'KA-02-KL-3456'
          },
          leadMechanic: {
            id: 'mech-3',
            firstName: 'Vikram',
            lastName: 'Singh'
          }
        },
        {
          id: '9',
          jobCardNumber: 'JC-2025-0009',
          customerId: 'cust-1',
          vehicleId: 'veh-1',
          jobType: 'maintenance',
          priority: 'low',
          status: 'queued',
          customerComplaint: 'Chain lubrication needed',
          workRequested: 'Lubricate chain and check tension',
          currentMileage: 45000,
          promisedDate: '2025-01-22',
          leadMechanicId: null,
          totalCost: 0,
          progressPercentage: 0,
          totalChecklistItems: 2,
          completedChecklistItems: 0,
          createdAt: '2025-01-18T16:00:00Z',
          customer: {
            id: 'cust-1',
            firstName: 'Rajesh',
            lastName: 'Kumar',
            phoneNumber: '+91 98765 43210'
          },
          vehicle: {
            id: 'veh-1',
            make: 'Honda',
            model: 'Activa 6G',
            year: 2023,
            licensePlate: 'KA-03-EM-2345'
          },
          leadMechanic: undefined
        },
        {
          id: '10',
          jobCardNumber: 'JC-2025-0010',
          customerId: 'cust-9',
          vehicleId: 'veh-9',
          jobType: 'repair',
          priority: 'high',
          status: 'in_progress',
          customerComplaint: 'Self-start not working',
          workRequested: 'Check and repair self-start mechanism',
          currentMileage: 38000,
          promisedDate: '2025-01-19',
          leadMechanicId: 'mech-2',
          totalCost: 0,
          progressPercentage: 75,
          totalChecklistItems: 4,
          completedChecklistItems: 3,
          createdAt: '2025-01-18T08:30:00Z',
          customer: {
            id: 'cust-9',
            firstName: 'Srinivas',
            lastName: 'Murthy',
            phoneNumber: '+91 92109 87654'
          },
          vehicle: {
            id: 'veh-9',
            make: 'Honda',
            model: 'CB Shine',
            year: 2021,
            licensePlate: 'KA-01-MN-5678'
          },
          leadMechanic: {
            id: 'mech-2',
            firstName: 'Rahul',
            lastName: 'Verma'
          }
        },
        {
          id: '11',
          jobCardNumber: 'JC-2025-0011',
          customerId: 'cust-10',
          vehicleId: 'veh-10',
          jobType: 'maintenance',
          priority: 'medium',
          status: 'ready',
          customerComplaint: 'Air filter replacement due',
          workRequested: 'Replace air filter and check intake',
          currentMileage: 22000,
          promisedDate: '2025-01-18',
          leadMechanicId: 'mech-3',
          totalCost: 0,
          progressPercentage: 100,
          totalChecklistItems: 3,
          completedChecklistItems: 3,
          createdAt: '2025-01-18T06:00:00Z',
          customer: {
            id: 'cust-10',
            firstName: 'Lakshmi',
            lastName: 'Iyer',
            phoneNumber: '+91 91098 76543'
          },
          vehicle: {
            id: 'veh-10',
            make: 'TVS',
            model: 'Jupiter',
            year: 2023,
            licensePlate: 'KA-05-OP-8901'
          },
          leadMechanic: {
            id: 'mech-3',
            firstName: 'Vikram',
            lastName: 'Singh'
          }
        },
        {
          id: '12',
          jobCardNumber: 'JC-2025-0012',
          customerId: 'cust-2',
          vehicleId: 'veh-2',
          jobType: 'repair',
          priority: 'urgent',
          status: 'parts_waiting',
          customerComplaint: 'Clutch plate worn out',
          workRequested: 'Replace clutch plate and check assembly',
          currentMileage: 32000,
          promisedDate: '2025-01-19',
          leadMechanicId: 'mech-1',
          totalCost: 0,
          progressPercentage: 25,
          totalChecklistItems: 4,
          completedChecklistItems: 1,
          createdAt: '2025-01-18T12:00:00Z',
          customer: {
            id: 'cust-2',
            firstName: 'Priya',
            lastName: 'Reddy',
            phoneNumber: '+91 98765 12345'
          },
          vehicle: {
            id: 'veh-2',
            make: 'Bajaj',
            model: 'Pulsar NS200',
            year: 2022,
            licensePlate: 'KA-01-HJ-6789'
          },
          leadMechanic: {
            id: 'mech-1',
            firstName: 'Amit',
            lastName: 'Sharma'
          }
        }
      ]

      setJobCards(mockJobCards)
      setFilteredJobCards(mockJobCards)
      setUsingMockData(true)
      setIsLoading(false)
      setError(null)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'An error occurred'
      console.error('Error loading job cards:', err)
      setError(message)
      setIsLoading(false)
    }
  }

  // Load job cards on mount
  useEffect(() => {
    loadJobCards()
  }, [])

  useEffect(() => {
    let filtered = [...jobCards]

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(
        (jobCard) =>
          jobCard.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
          jobCard.customer?.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          jobCard.customer?.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          jobCard.vehicle?.licensePlate.toLowerCase().includes(searchQuery.toLowerCase()) ||
          jobCard.vehicle?.make.toLowerCase().includes(searchQuery.toLowerCase()) ||
          jobCard.vehicle?.model.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    // Apply status filter (Kanban columns handle filtering visually)
    // We keep all cards and let columns filter themselves

    setFilteredJobCards(filtered)
  }, [searchQuery, jobCards])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-100 border-gray-300'
      case 'queued':
        return 'text-status-info bg-status-info/10 border-status-info/20'
      case 'in_progress':
        return 'text-status-warning bg-status-warning/10 border-status-warning/20'
      case 'parts_waiting':
        return 'text-status-error bg-status-error/10 border-status-error/20'
      case 'quality_check':
        return 'text-purple-600 bg-purple-100 border-purple-300'
      case 'ready':
        return 'text-status-success bg-status-success/10 border-status-success/20'
      case 'delivered':
        return 'text-status-success bg-status-success/10 border-status-success/20'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-status-error bg-status-error/10 border-status-error/20'
      case 'high':
        return 'text-orange-600 bg-orange-100 border-orange-300'
      case 'medium':
        return 'text-status-warning bg-status-warning/10 border-status-warning/20'
      case 'low':
        return 'text-status-info bg-status-info/10 border-status-info/20'
      default:
        return 'text-gray-600 bg-gray-100 border-gray-300'
    }
  }

  const handleViewJobCard = (id: string) => {
    router.push(`/job-cards/${id}`)
  }

  const handleCreateJobCard = () => {
    router.push('/job-cards/create')
  }

  return (
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
            <div className="h-10 w-1 bg-gray-700 rounded-full" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">
                Job Card Management
              </h1>
              <p className="text-sm md:text-base text-gray-600 mt-1">
                Track and manage all service jobs
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateJobCard}
            className="flex items-center gap-2 px-6 py-3 bg-gray-700 text-white font-semibold rounded-xl hover:bg-gray-600 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Create Job Card</span>
            <span className="sm:hidden">Create</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Mock Data Indicator Banner */}
      {usingMockData && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3"
        >
          <div className="h-5 w-5 rounded-full bg-blue-200 flex items-center justify-center shrink-0 mt-0.5">
            <span className="text-blue-700 text-xs font-bold">i</span>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-blue-900">Using Sample Data</p>
            <p className="text-sm text-blue-700 mt-1">
              You're viewing placeholder job cards. Connect the database to see real data by running the migration file.
            </p>
          </div>
        </motion.div>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-700 mb-4" />
          <p className="text-gray-600">Loading job cards...</p>
        </div>
      )}

      {/* Database Not Configured State */}
      {databaseNotConfigured && !isLoading && !usingMockData && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-card p-12 text-center">
          <div className="max-w-md mx-auto">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-6 border-2 border-gray-300">
              <FileText className="h-10 w-10 text-gray-700" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">
              Job Cards Coming Soon
            </h2>
            <p className="text-gray-600 mb-6">
              The Job Card Management system is ready but needs to be connected to your database.
              Please run the database migration to enable this feature.
            </p>

            <div className="bg-gray-50 rounded-lg p-6 mb-6 text-left">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Wrench className="h-4 w-4" />
                Setup Instructions:
              </h3>
              <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
                <li>Locate the migration file: <code className="text-xs bg-gray-200 px-1.5 py-0.5 rounded">prisma/migrations/create_job_cards_system.sql</code></li>
                <li>Run it in your Supabase SQL editor or via psql</li>
                <li>Refresh this page to activate job cards</li>
              </ol>
            </div>

            <div className="flex items-center justify-center gap-3 text-sm text-gray-500">
              <AlertCircle className="h-4 w-4" />
              <span>Contact your administrator if you need assistance</span>
            </div>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && !databaseNotConfigured && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Failed to load job cards</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && (databaseNotConfigured || usingMockData) && (
        <>
          {/* Stats Cards */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6"
          >
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Total Jobs</p>
              <p className="text-2xl font-bold text-gray-900">{jobCards.length}</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">In Progress</p>
              <p className="text-2xl font-bold text-status-warning">
                {jobCards.filter(jc => jc.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Ready</p>
              <p className="text-2xl font-bold text-status-success">
                {jobCards.filter(jc => jc.status === 'ready').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-status-info">
                {jobCards.filter(jc => ['draft', 'queued'].includes(jc.status)).length}
              </p>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white rounded-xl border border-gray-200 shadow-card p-4 mb-6"
          >
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by job #, customer, vehicle, or plate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                {/* Status Filter */}
                <div className="relative">
                  <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as JobCardStatus)}
                    className="appearance-none pl-10 pr-10 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-transparent transition-all cursor-pointer"
                  >
                    <option value="all">All Status</option>
                    <option value="draft">Draft</option>
                    <option value="queued">Queued</option>
                    <option value="in_progress">In Progress</option>
                    <option value="parts_waiting">Parts Waiting</option>
                    <option value="quality_check">Quality Check</option>
                    <option value="ready">Ready</option>
                    <option value="delivered">Delivered</option>
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>
          </motion.div>

          {/* View Mode Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white rounded-xl border border-gray-200 shadow-card mb-6"
          >
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setViewMode('kanban')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all relative ${
                  viewMode === 'kanban'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <LayoutGrid className="h-4 w-4" />
                Kanban Board
                {viewMode === 'kanban' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                className={`flex items-center gap-2 px-6 py-3 font-semibold transition-all relative ${
                  viewMode === 'calendar'
                    ? 'text-gray-900'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <CalendarIcon className="h-4 w-4" />
                Calendar View
                {viewMode === 'calendar' && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}

      {!isLoading && !error && (databaseNotConfigured || usingMockData) && (
        <>
          {/* Kanban Board or Calendar View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            {filteredJobCards.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-card p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {jobCards.length === 0 ? 'No job cards yet' : 'No job cards found'}
                </h3>
                <p className="text-gray-600 mb-4">
                  {jobCards.length === 0
                    ? 'Create your first job card to get started'
                    : 'Try adjusting your search or filter criteria'}
                </p>
                {jobCards.length === 0 ? (
                  <button
                    onClick={handleCreateJobCard}
                    className="text-gray-700 font-medium hover:underline"
                  >
                    Create a job card
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                    }}
                    className="text-gray-700 font-medium hover:underline"
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : viewMode === 'kanban' ? (
              /* Kanban Board with Top Scrollbar */
              <div className="relative">
                {/* Custom Interactive Horizontal Scrollbar */}
                {showTopScrollbar && (
                  <div className="mb-3 px-1">
                    {/* Visible, interactive scrollbar for wheel/trackpad */}
                    <div
                      ref={topScrollbarRef}
                      onScroll={handleTopScrollbarScroll}
                      className="overflow-x-auto scrollbar-hide"
                      style={{ maxHeight: '12px', opacity: '0.01' }}
                    >
                      <div style={{ width: kanbanScrollRef.current?.scrollWidth || '100%', minWidth: '100%' }}>
                        {/* Scrollable spacer - same width as kanban content */}
                      </div>
                    </div>

                    {/* Custom scrollbar track with visual thumb */}
                    <div
                      ref={scrollbarTrackRef}
                      onClick={handleScrollbarTrackClick}
                      className="kanban-scrollbar-track cursor-pointer"
                    >
                      <div
                        className={`kanban-scrollbar-thumb ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
                        onMouseDown={handleThumbMouseDown}
                        style={{
                          width: kanbanScrollRef.current
                            ? `${(kanbanScrollRef.current.clientWidth / kanbanScrollRef.current.scrollWidth) * 100}%`
                            : '100%',
                          transform: kanbanScrollRef.current
                            ? `translateX(${scrollPercentage * (kanbanScrollRef.current.clientWidth * (1 - kanbanScrollRef.current.clientWidth / kanbanScrollRef.current.scrollWidth))}px)`
                            : '0px',
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Main Kanban Board */}
                <div
                  ref={kanbanScrollRef}
                  onScroll={handleKanbanScroll}
                  className="overflow-x-auto scrollbar-hide"
                >
                  <div className="flex gap-4 min-w-max pb-4">
                  {KANBAN_COLUMNS.filter(col => statusFilter === 'all' || col.status === statusFilter).map((column) => {
                    const columnCards = filteredJobCards.filter(jc => jc.status === column.status)

                    return (
                      <motion.div
                        key={column.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3 }}
                        className={`flex-shrink-0 w-80 ${column.bgColor} rounded-xl border-2 ${column.borderColor} p-4`}
                      >
                        {/* Column Header */}
                        <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <CircleDot className={`h-4 w-4 ${column.color}`} />
                            <h3 className={`text-sm font-bold ${column.color}`}>{column.title}</h3>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${column.color} ${column.bgColor.replace('50', '200')}`}>
                              {columnCards.length}
                            </span>
                          </div>
                          <button className="p-1 hover:bg-white/50 rounded-lg transition-colors">
                            <MoreVertical className={`h-4 w-4 ${column.color}`} />
                          </button>
                        </div>

                        {/* Column Cards */}
                        <div className="space-y-3 max-h-[calc(100vh-400px)] overflow-y-auto pr-1 custom-scrollbar">
                          {columnCards.length === 0 ? (
                            <div className={`text-center py-8 px-4 border-2 border-dashed ${column.borderColor} rounded-lg`}>
                              <FileText className={`h-8 w-8 mx-auto mb-2 ${column.color} opacity-30`} />
                              <p className={`text-xs ${column.color} opacity-60`}>No cards</p>
                            </div>
                          ) : (
                            columnCards.map((jobCard, index) => (
                              <motion.div
                                key={jobCard.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2, delay: index * 0.03 }}
                                onClick={() => handleViewJobCard(jobCard.id)}
                                className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300 transition-all duration-200 cursor-pointer group"
                              >
                                <div className="p-4">
                                  {/* Job Card Number & Priority */}
                                  <div className="flex items-start justify-between gap-2 mb-3">
                                    <div className="flex-1 min-w-0">
                                      <p className="text-xs font-mono font-bold text-gray-900 mb-1 truncate">
                                        {jobCard.jobCardNumber}
                                      </p>
                                      <p className="text-xs text-gray-500">
                                        {new Date(jobCard.createdAt).toLocaleDateString()}
                                      </p>
                                    </div>
                                    <span
                                      className={`px-2 py-0.5 rounded-md text-xs font-medium border flex-shrink-0 ${getPriorityColor(jobCard.priority)}`}
                                    >
                                      {jobCard.priority}
                                    </span>
                                  </div>

                                  {/* Customer Info */}
                                  <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
                                    <User className="h-3.5 w-3.5 text-gray-700 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-gray-900 truncate">
                                        {jobCard.customer?.firstName} {jobCard.customer?.lastName}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{jobCard.customer?.phoneNumber}</p>
                                    </div>
                                  </div>

                                  {/* Vehicle Info */}
                                  <div className="flex items-center gap-2 mb-3 bg-gray-50 rounded-lg p-2">
                                    <Wrench className="h-3.5 w-3.5 text-gray-700 shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <p className="text-xs font-medium text-gray-900 truncate">
                                        {jobCard.vehicle?.year} {jobCard.vehicle?.make} {jobCard.vehicle?.model}
                                      </p>
                                      <p className="text-xs text-gray-500 truncate">{jobCard.vehicle?.licensePlate}</p>
                                    </div>
                                  </div>

                                  {/* Progress Bar */}
                                  {jobCard.totalChecklistItems > 0 && (
                                    <div className="mb-3">
                                      <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                                        <span>Progress</span>
                                        <span className="font-medium text-gray-900">
                                          {jobCard.completedChecklistItems}/{jobCard.totalChecklistItems}
                                        </span>
                                      </div>
                                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                          className="h-full bg-gray-700 transition-all duration-300"
                                          style={{ width: `${jobCard.progressPercentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Mechanic & Promised Date */}
                                  <div className="flex items-center justify-between text-xs">
                                    {jobCard.leadMechanic ? (
                                      <div className="flex items-center gap-1 text-gray-700">
                                        <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
                                          <span className="text-xs font-semibold text-gray-700">
                                            {jobCard.leadMechanic.firstName.charAt(0)}
                                          </span>
                                        </div>
                                        <span className="truncate">
                                          {jobCard.leadMechanic.firstName} {jobCard.leadMechanic.lastName}
                                        </span>
                                      </div>
                                    ) : (
                                      <span className="text-gray-400">Unassigned</span>
                                    )}
                                    {jobCard.promisedDate && (
                                      <div className="flex items-center gap-1 text-gray-600">
                                        <CalendarIcon className="h-3 w-3" />
                                        <span>{new Date(jobCard.promisedDate).toLocaleDateString()}</span>
                                      </div>
                                    )}
                                  </div>

                                  {/* View Action */}
                                  <div className="flex items-center justify-end mt-3 pt-3 border-t border-gray-200 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleViewJobCard(jobCard.id)
                                      }}
                                      className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all duration-200"
                                      title="View Details"
                                    >
                                      <Eye className="h-3.5 w-3.5" />
                                    </button>
                                  </div>
                                </div>
                              </motion.div>
                            ))
                          )}
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
              </div>
            ) : (
              /* Calendar View */
              <div className="bg-white rounded-xl border border-gray-200 shadow-card p-6">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => {
                        if (calendarView === 'month') {
                          setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
                        } else if (calendarView === 'week') {
                          setCurrentDate(new Date(currentDate.getTime() - 7 * 24 * 60 * 60 * 1000))
                        } else {
                          setCurrentDate(new Date(currentDate.getTime() - 24 * 60 * 60 * 1000))
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5 text-gray-700" />
                    </button>
                    <h2 className="text-xl font-bold text-gray-900">
                      {calendarView === 'month' && currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                      {calendarView === 'week' && {
                        start: new Date(currentDate.getTime() - currentDate.getDay() * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                        end: new Date(currentDate.getTime() + (6 - currentDate.getDay()) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                      } && `${new Date(currentDate.getTime() - currentDate.getDay() * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${new Date(currentDate.getTime() + (6 - currentDate.getDay()) * 24 * 60 * 60 * 1000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`}
                      {calendarView === 'day' && currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                    </h2>
                    <button
                      onClick={() => {
                        if (calendarView === 'month') {
                          setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
                        } else if (calendarView === 'week') {
                          setCurrentDate(new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000))
                        } else {
                          setCurrentDate(new Date(currentDate.getTime() + 24 * 60 * 60 * 1000))
                        }
                      }}
                      className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ChevronRight className="h-5 w-5 text-gray-700" />
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={calendarView}
                      onChange={(e) => setCalendarView(e.target.value as 'month' | 'week' | 'day')}
                      className="px-4 py-2 bg-white border-2 border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-400 transition-all cursor-pointer"
                    >
                      <option value="month">Month</option>
                      <option value="week">Week</option>
                      <option value="day">Day</option>
                    </select>
                  </div>
                </div>

                {/* Month View */}
                {calendarView === 'month' && (
                  <div className="grid grid-cols-7 gap-1">
                    {/* Day headers */}
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                      <div key={day} className="text-center py-2 text-sm font-semibold text-gray-600 border-b border-gray-200">
                        {day}
                      </div>
                    ))}

                    {/* Calendar days */}
                    {(() => {
                      const year = currentDate.getFullYear()
                      const month = currentDate.getMonth()
                      const firstDay = new Date(year, month, 1)
                      const lastDay = new Date(year, month + 1, 0)
                      const startPadding = firstDay.getDay()
                      const totalDays = lastDay.getDate()

                      const days = []

                      // Padding for first week
                      for (let i = 0; i < startPadding; i++) {
                        days.push(<div key={`pad-start-${i}`} className="min-h-24 bg-gray-50/50 rounded-lg"></div>)
                      }

                      // Actual days
                      for (let day = 1; day <= totalDays; day++) {
                        const date = new Date(year, month, day)
                        const dateStr = date.toISOString().split('T')[0]
                        const dayJobCards = filteredJobCards.filter(jc => jc.promisedDate === dateStr)
                        const isToday = new Date().toDateString() === date.toDateString()
                        const hasJobCards = dayJobCards.length > 0

                        // Count by priority
                        const urgentCount = dayJobCards.filter(jc => jc.priority === 'urgent').length
                        const highCount = dayJobCards.filter(jc => jc.priority === 'high').length
                        const mediumCount = dayJobCards.filter(jc => jc.priority === 'medium').length
                        const lowCount = dayJobCards.filter(jc => jc.priority === 'low').length

                        days.push(
                          <div
                            key={day}
                            className={`min-h-24 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative ${
                              isToday ? 'bg-brand/5 border-brand' : ''
                            } ${hasJobCards ? 'bg-gray-50/80' : ''}`}
                          >
                            {/* Day number with badge */}
                            <div className="flex items-center justify-between mb-1">
                              <div className={`text-sm font-semibold ${isToday ? 'text-brand' : 'text-gray-900'}`}>
                                {day}
                              </div>
                              {hasJobCards && (
                                <div className="flex items-center gap-1">
                                  <span className="h-5 w-5 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
                                    {dayJobCards.length}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Priority indicators (dots) */}
                            {hasJobCards && (
                              <div className="flex flex-wrap gap-1 mb-1">
                                {urgentCount > 0 && (
                                  <div className="h-2 w-2 rounded-full bg-red-500" title={`${urgentCount} urgent`} />
                                )}
                                {highCount > 0 && (
                                  <div className="h-2 w-2 rounded-full bg-orange-500" title={`${highCount} high`} />
                                )}
                                {mediumCount > 0 && (
                                  <div className="h-2 w-2 rounded-full bg-yellow-500" title={`${mediumCount} medium`} />
                                )}
                                {lowCount > 0 && (
                                  <div className="h-2 w-2 rounded-full bg-green-500" title={`${lowCount} low`} />
                                )}
                              </div>
                            )}

                            {/* Job cards list */}
                            <div className="space-y-1">
                              {dayJobCards.slice(0, 2).map((jobCard) => (
                                <div
                                  key={jobCard.id}
                                  onClick={() => handleViewJobCard(jobCard.id)}
                                  className={`text-xs p-1.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                                    jobCard.priority === 'urgent' ? 'bg-red-100 text-red-700 border-l-2 border-red-500' :
                                    jobCard.priority === 'high' ? 'bg-orange-100 text-orange-700 border-l-2 border-orange-500' :
                                    jobCard.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 border-l-2 border-yellow-500' :
                                    'bg-green-100 text-green-700 border-l-2 border-green-500'
                                  }`}
                                >
                                  <div className="font-medium truncate">{jobCard.jobCardNumber}</div>
                                  <div className="truncate opacity-75">{jobCard.vehicle?.licensePlate}</div>
                                </div>
                              ))}
                              {dayJobCards.length > 2 && (
                                <div className="text-xs text-gray-500 pl-1">
                                  +{dayJobCards.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      }

                      return days
                    })()}
                  </div>
                )}

                {/* Week View */}
                {calendarView === 'week' && (
                  <div className="space-y-3">
                    {(() => {
                      const startOfWeek = new Date(currentDate.getTime() - currentDate.getDay() * 24 * 60 * 60 * 1000)
                      const days = []

                      for (let i = 0; i < 7; i++) {
                        const day = new Date(startOfWeek.getTime() + i * 24 * 60 * 60 * 1000)
                        const dateStr = day.toISOString().split('T')[0]
                        const dayJobCards = filteredJobCards.filter(jc => jc.promisedDate === dateStr)
                        const isToday = new Date().toDateString() === day.toDateString()
                        const hasJobCards = dayJobCards.length > 0

                        // Count by priority for indicators
                        const urgentCount = dayJobCards.filter(jc => jc.priority === 'urgent').length
                        const highCount = dayJobCards.filter(jc => jc.priority === 'high').length
                        const mediumCount = dayJobCards.filter(jc => jc.priority === 'medium').length
                        const lowCount = dayJobCards.filter(jc => jc.priority === 'low').length

                        days.push(
                          <div key={i} className={`border border-gray-200 rounded-lg p-4 ${isToday ? 'bg-brand/5 border-brand' : ''} ${hasJobCards ? 'bg-gray-50/30' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <h3 className={`font-semibold ${isToday ? 'text-brand' : 'text-gray-900'}`}>
                                  {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </h3>
                                {/* Priority dots */}
                                {hasJobCards && (
                                  <div className="flex gap-1">
                                    {urgentCount > 0 && (
                                      <div className="h-2 w-2 rounded-full bg-red-500" title={`${urgentCount} urgent`} />
                                    )}
                                    {highCount > 0 && (
                                      <div className="h-2 w-2 rounded-full bg-orange-500" title={`${highCount} high`} />
                                    )}
                                    {mediumCount > 0 && (
                                      <div className="h-2 w-2 rounded-full bg-yellow-500" title={`${mediumCount} medium`} />
                                    )}
                                    {lowCount > 0 && (
                                      <div className="h-2 w-2 rounded-full bg-green-500" title={`${lowCount} low`} />
                                    )}
                                  </div>
                                )}
                              </div>
                              {hasJobCards && (
                                <span className="h-6 w-6 rounded-full bg-brand text-white text-xs font-bold flex items-center justify-center">
                                  {dayJobCards.length}
                                </span>
                              )}
                            </div>
                            <div className="space-y-2">
                              {dayJobCards.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">No jobs scheduled</p>
                              ) : (
                                dayJobCards.map((jobCard) => (
                                  <div
                                    key={jobCard.id}
                                    onClick={() => handleViewJobCard(jobCard.id)}
                                    className={`p-3 rounded-lg cursor-pointer hover:shadow-md transition-all ${
                                      jobCard.priority === 'urgent' ? 'bg-red-50 border-l-4 border-red-500' :
                                      jobCard.priority === 'high' ? 'bg-orange-50 border-l-4 border-orange-500' :
                                      jobCard.priority === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                                      'bg-green-50 border-l-4 border-green-500'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">{jobCard.jobCardNumber}</p>
                                        <p className="text-xs text-gray-600">
                                          {jobCard.vehicle?.year} {jobCard.vehicle?.make} {jobCard.vehicle?.model} - {jobCard.vehicle?.licensePlate}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {jobCard.customer?.firstName} {jobCard.customer?.lastName}
                                        </p>
                                      </div>
                                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                                        jobCard.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                        jobCard.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                        jobCard.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {jobCard.priority}
                                      </span>
                                    </div>
                                  </div>
                                ))
                              )}
                            </div>
                          </div>
                        )
                      }

                      return days
                    })()}
                  </div>
                )}

                {/* Day View */}
                {calendarView === 'day' && (
                  <div className="space-y-3">
                    <div className={`border border-gray-200 rounded-lg p-6 ${new Date().toDateString() === currentDate.toDateString() ? 'bg-brand/5 border-brand' : ''}`}>
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h3>
                      <div className="space-y-3">
                        {filteredJobCards.filter(jc => jc.promisedDate === currentDate.toISOString().split('T')[0]).length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-8">No jobs scheduled for this day</p>
                        ) : (
                          filteredJobCards
                            .filter(jc => jc.promisedDate === currentDate.toISOString().split('T')[0])
                            .map((jobCard) => (
                              <div
                                key={jobCard.id}
                                onClick={() => handleViewJobCard(jobCard.id)}
                                className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${
                                  jobCard.priority === 'urgent' ? 'bg-red-50 border-l-4 border-red-500' :
                                  jobCard.priority === 'high' ? 'bg-orange-50 border-l-4 border-orange-500' :
                                  jobCard.priority === 'medium' ? 'bg-yellow-50 border-l-4 border-yellow-500' :
                                  'bg-green-50 border-l-4 border-green-500'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                      <p className="text-base font-bold text-gray-900">{jobCard.jobCardNumber}</p>
                                      <span className={`px-2 py-1 text-xs font-medium rounded ${
                                        jobCard.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                                        jobCard.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                        jobCard.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                        'bg-green-100 text-green-700'
                                      }`}>
                                        {jobCard.priority}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-1">
                                      {jobCard.vehicle?.year} {jobCard.vehicle?.make} {jobCard.vehicle?.model}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">Plate: {jobCard.vehicle?.licensePlate}</p>
                                    <p className="text-sm text-gray-500">
                                      Customer: {jobCard.customer?.firstName} {jobCard.customer?.lastName}
                                    </p>
                                    {jobCard.leadMechanic && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        Mechanic: {jobCard.leadMechanic.firstName} {jobCard.leadMechanic.lastName}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </div>
  )
}
