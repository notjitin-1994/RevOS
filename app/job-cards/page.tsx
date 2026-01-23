'use client'

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
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
  BarChart3,
} from 'lucide-react'
import { motion } from 'framer-motion'

// New imports for drag-and-drop
import { KanbanDragDropContext } from './components/kanban/KanbanDragDropContext'
import { KanbanColumn } from './components/kanban/KanbanColumn'
import { KanbanCard } from './components/kanban/KanbanCard'
import { KanbanSwimlane } from './components/kanban/KanbanSwimlane'
import { KanbanBoardSkeleton } from './components/shared/KanbanBoardSkeleton'
import { ZoomControls } from './components/kanban/ZoomControls'
import { useJobCards } from './hooks/use-job-cards'
import { useJobCardStore } from './lib/stores/job-card-store'
import { useUpdateJobCardStatus } from './hooks/use-job-card-mutations'

// Phase 2 & 4: Dynamic imports for code splitting
const TimelineView = dynamic(
  () => import('./components/timeline/TimelineView').then(mod => ({ default: mod.TimelineView })),
  {
    loading: () => <div className="bg-white rounded-xl border border-gray-200 p-12"><div className="flex items-center justify-center"><Loader2 className="h-12 w-12 text-gray-400 animate-spin" /></div></div>,
    ssr: false
  }
)

const CalendarView = dynamic(
  () => import('./components/calendar/CalendarView').then(mod => ({ default: mod.CalendarView })),
  {
    loading: () => <div className="bg-white rounded-xl border border-gray-200 p-12"><div className="flex items-center justify-center"><Loader2 className="h-12 w-12 text-gray-400 animate-spin" /></div></div>,
    ssr: false
  }
)

// Phase 4: Analytics dashboard (dynamic import)
const AnalyticsDashboard = dynamic(
  () => import('./components/analytics/AnalyticsDashboard').then(mod => ({ default: mod.AnalyticsDashboard })),
  {
    loading: () => <div className="bg-white rounded-xl border border-gray-200 p-12"><div className="flex items-center justify-center"><Loader2 className="h-12 w-12 text-gray-400 animate-spin" /></div></div>,
    ssr: false
  }
)

// Phase 3 imports
import { useKeyboardShortcuts, useJobCardShortcuts, getShortcutHelp } from './hooks/use-keyboard-shortcuts'
import { KeyboardShortcutsHelp, KeyboardShortcutButton } from './components/shared/KeyboardShortcutsHelp'
import { Layers, HelpCircle } from 'lucide-react'

// Type imports
import type { JobCardViewData } from './types/job-card-view.types'

/**
 * Service Center Page
 *
 * Comprehensive interface for managing garage job cards with:
 * - Drag-and-drop Kanban board with @dnd-kit
 * - Job card listing with search and filters
 * - Status-based filtering
 * - Mechanic assignment tracking
 * - Progress indicators
 * - Mobile-responsive design
 * - Keyboard accessibility
 */

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
  { id: 'draft', title: 'Draft', status: 'draft', color: 'text-graphite-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-300' },
  { id: 'queued', title: 'Queued', status: 'queued', color: 'text-graphite-700', bgColor: 'bg-gray-100', borderColor: 'border-graphite-300' },
  { id: 'in_progress', title: 'In Progress', status: 'in_progress', color: 'text-graphite-800', bgColor: 'bg-gray-200', borderColor: 'border-graphite-400' },
  { id: 'parts_waiting', title: 'Parts Waiting', status: 'parts_waiting', color: 'text-graphite-900', bgColor: 'bg-gray-300', borderColor: 'border-graphite-600' },
  { id: 'quality_check', title: 'Quality Check', status: 'quality_check', color: 'text-graphite-700', bgColor: 'bg-gray-100', borderColor: 'border-graphite-400' },
  { id: 'ready', title: 'Ready', status: 'ready', color: 'text-graphite-800', bgColor: 'bg-gray-200', borderColor: 'border-graphite-400' },
  { id: 'delivered', title: 'Delivered', status: 'delivered', color: 'text-graphite-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-300' },
]

export default function JobCardsPage() {
  const router = useRouter()

  // Get current user from session
  const sessionUser = typeof window !== 'undefined' ? sessionStorage.getItem('user') : null
  const currentUser = sessionUser ? JSON.parse(sessionUser) : null

  // If no garage ID in session, fetch the first available garage
  const [garageId, setGarageId] = useState<string>('')
  const [userId, setUserId] = useState<string>('')

  useEffect(() => {
    const initializeIds = async () => {
      // Try to get from session first
      if (currentUser?.garageId) {
        console.log('✅ Using garage ID from session:', currentUser.garageId)
        setGarageId(currentUser.garageId)
        setUserId(currentUser.id || currentUser.userUid || '')
        return
      }

      // If no garage ID in session, fetch from database
      console.log('⚠️  No garage ID in session, fetching from database...')
      try {
        const { createClient } = await import('@/lib/supabase/client')
        const supabase = createClient()

        const { data: garages } = await supabase
          .from('garages')
          .select('garage_uid')
          .limit(1)

        if (garages && garages.length > 0) {
          console.log('✅ Fetched garage ID from database:', garages[0].garage_uid)
          setGarageId(garages[0].garage_uid)
          setUserId(currentUser?.id || currentUser?.userUid || '')
        } else {
          console.error('❌ No garages found in database')
        }
      } catch (error) {
        console.error('❌ Error fetching garage ID:', error)
      }
    }

    initializeIds()
  }, [currentUser])

  // Debug log when garageId changes
  useEffect(() => {
    console.log('🏠 Current garageId:', garageId)
  }, [garageId])

  // Use Zustand store instead of useState for UI state
  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    viewMode: storeViewMode,
    setViewMode: setStoreViewMode,
    swimlaneType,
    setSwimlaneType,
    zoomLevel,
    zoomIn,
    zoomOut,
    resetZoom,
  } = useJobCardStore()

  // View mode state (Phase 2: add timeline option, Phase 4: add analytics)
  const [viewMode, setViewMode] = useState<'kanban' | 'calendar' | 'timeline' | 'analytics'>(
    storeViewMode as 'kanban' | 'calendar' | 'timeline' | 'analytics' || 'kanban'
  )

  // Phase 3: Keyboard shortcuts modal state
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Calendar view states
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month')
  const [currentDate, setCurrentDate] = useState(new Date())

  // Top scrollbar refs and state
  const kanbanScrollRef = useRef<HTMLDivElement>(null)
  const scrollbarTrackRef = useRef<HTMLDivElement>(null)
  const scrollbarThumbRef = useRef<HTMLDivElement>(null)
  const [showScrollbar, setShowScrollbar] = useState(false)
  const [thumbWidth, setThumbWidth] = useState(0)
  const [thumbLeft, setThumbLeft] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  // Use React Query hook for data fetching (instead of loadJobCards)
  const { data: jobCards = [], isLoading, error } = useJobCards(garageId)

  // Filter job cards based on search query (done inline in JSX)
  const filterJobCards = useCallback((cards: JobCardViewData[], query: string) => {
    if (!query) return cards
    const searchLower = query.toLowerCase()
    return cards.filter(
      (jobCard) =>
        jobCard.jobCardNumber.toLowerCase().includes(searchLower) ||
        jobCard.customerName?.toLowerCase().includes(searchLower) ||
        jobCard.vehicleLicensePlate?.toLowerCase().includes(searchLower) ||
        jobCard.vehicleMake?.toLowerCase().includes(searchLower) ||
        jobCard.vehicleModel?.toLowerCase().includes(searchLower)
    )
  }, [])

  // Update scrollbar thumb when kanban scrolls
  useEffect(() => {
    const updateScrollbar = () => {
      if (!kanbanScrollRef.current) return

      const el = kanbanScrollRef.current
      const scrollLeft = el.scrollLeft
      const scrollWidth = el.scrollWidth
      const clientWidth = el.clientWidth
      const maxScroll = scrollWidth - clientWidth

      // Check if scrollbar is needed (accounting for zoom level)
      const scaledContentWidth = scrollWidth * (zoomLevel / 100)
      const needsScrollbar = scaledContentWidth > clientWidth
      setShowScrollbar(needsScrollbar)

      if (!needsScrollbar) return

      // Calculate thumb width and position
      const thumbWidthVal = (clientWidth / scrollWidth) * 100
      const thumbLeftVal = maxScroll > 0 ? (scrollLeft / maxScroll) * (100 - thumbWidthVal) : 0

      setThumbWidth(thumbWidthVal)
      setThumbLeft(thumbLeftVal)
    }

    const el = kanbanScrollRef.current
    if (el) {
      el.addEventListener('scroll', updateScrollbar)
      updateScrollbar()
    }

    // Also update on resize and zoom change
    window.addEventListener('resize', updateScrollbar)

    return () => {
      if (el) {
        el.removeEventListener('scroll', updateScrollbar)
      }
      window.removeEventListener('resize', updateScrollbar)
    }
  }, [searchQuery, statusFilter, jobCards, zoomLevel])

  // Handle scrollbar thumb drag
  const handleThumbMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)

    const startX = e.clientX
    const startLeft = thumbLeft
    const trackWidth = scrollbarTrackRef.current?.clientWidth || 0

    const handleMouseMove = (e: MouseEvent) => {
      if (!kanbanScrollRef.current || !scrollbarTrackRef.current) return

      const deltaX = e.clientX - startX
      const deltaPercent = (deltaX / trackWidth) * 100
      const newLeft = Math.max(0, Math.min(100 - thumbWidth, startLeft + deltaPercent))

      setThumbLeft(newLeft)

      // Scroll the kanban board
      const scrollWidth = kanbanScrollRef.current.scrollWidth
      const clientWidth = kanbanScrollRef.current.clientWidth
      const maxScroll = scrollWidth - clientWidth
      const scrollPos = (newLeft / (100 - thumbWidth)) * maxScroll

      kanbanScrollRef.current.scrollLeft = scrollPos
    }

    const handleMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
  }, [thumbLeft, thumbWidth])

  // Handle clicking on scrollbar track
  const handleTrackClick = useCallback((e: React.MouseEvent) => {
    if (!kanbanScrollRef.current || !scrollbarTrackRef.current) return

    const rect = scrollbarTrackRef.current.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const trackWidth = rect.width

    // Calculate new position (center thumb on click)
    const newLeftPercent = (clickX / trackWidth) * 100 - thumbWidth / 2
    const clampedLeft = Math.max(0, Math.min(100 - thumbWidth, newLeftPercent))

    setThumbLeft(clampedLeft)

    // Scroll the kanban board
    const scrollWidth = kanbanScrollRef.current.scrollWidth
    const clientWidth = kanbanScrollRef.current.clientWidth
    const maxScroll = scrollWidth - clientWidth
    const scrollPos = (clampedLeft / (100 - thumbWidth)) * maxScroll

    kanbanScrollRef.current.scrollLeft = scrollPos
  }, [thumbWidth])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'text-gray-600 bg-gray-50 border-gray-300'
      case 'queued':
        return 'text-graphite-700 bg-gray-100 border-gray-300'
      case 'in_progress':
        return 'text-graphite-800 bg-gray-200 border-gray-400'
      case 'parts_waiting':
        return 'text-graphite-900 bg-gray-300 border-gray-500'
      case 'quality_check':
        return 'text-graphite-700 bg-gray-100 border-gray-400'
      case 'ready':
        return 'text-graphite-800 bg-gray-200 border-gray-400'
      case 'delivered':
        return 'text-gray-600 bg-gray-50 border-gray-300'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'text-graphite-900 bg-gray-300 border-gray-500'
      case 'high':
        return 'text-graphite-800 bg-gray-200 border-gray-400'
      case 'medium':
        return 'text-graphite-700 bg-gray-100 border-gray-300'
      case 'low':
        return 'text-graphite-600 bg-gray-50 border-gray-300'
      default:
        return 'text-gray-600 bg-gray-50 border-gray-300'
    }
  }

  const handleViewJobCard = (id: string) => {
    router.push(`/job-cards/${id}`)
  }

  const handleCreateJobCard = () => {
    router.push('/job-cards/create')
  }

  // Phase 3: Setup keyboard shortcuts
  const { shortcuts } = useJobCardShortcuts({
    onViewModeChange: (mode) => {
      setViewMode(mode)
      setStoreViewMode(mode)
    },
    onCreateNew: handleCreateJobCard,
    onSearchFocus: () => searchInputRef.current?.focus(),
    onFilterToggle: () => {
      // Focus on status filter dropdown
      const filterSelect = document.querySelector('select[value="' + statusFilter + '"]') as HTMLSelectElement
      filterSelect?.focus()
    },
    onZoomIn: zoomIn,
    onZoomOut: zoomOut,
    onResetZoom: resetZoom,
  })

  useKeyboardShortcuts({ shortcuts, isEnabled: true })

  // Mouse wheel zoom handler (Ctrl/Cmd + Scroll)
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      // Check if Ctrl or Cmd key is pressed
      if (e.ctrlKey || e.metaKey) {
        // Only apply zoom when in kanban view
        if (viewMode !== 'kanban') return

        // Prevent default browser zoom behavior
        e.preventDefault()

        // Determine zoom direction
        if (e.deltaY < 0) {
          // Scrolling up - zoom in
          zoomIn()
        } else {
          // Scrolling down - zoom out
          zoomOut()
        }
      }
    }

    // Add event listener with passive: false to allow preventDefault
    window.addEventListener('wheel', handleWheel, { passive: false })

    return () => {
      window.removeEventListener('wheel', handleWheel)
    }
  }, [viewMode, zoomIn, zoomOut])

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
            <div className="h-10 w-1 bg-graphite-700 rounded-full" />
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-graphite-900 tracking-tight">
                Service Center
              </h1>
              <p className="text-sm md:text-base text-graphite-600 mt-1">
                Track and manage all service jobs
              </p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCreateJobCard}
            className="flex items-center gap-2 px-6 py-3 bg-graphite-700 text-white font-semibold rounded-xl hover:bg-graphite-600 transition-all duration-200 shadow-lg"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Create Job Card</span>
            <span className="sm:hidden">Create</span>
          </motion.button>
        </div>
      </motion.header>

      {/* Loading State */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <KanbanBoardSkeleton columnCount={3} />
        </motion.div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-900">Failed to load job cards</p>
              <p className="text-sm text-red-700 mt-1">{error instanceof Error ? error.message : 'An error occurred'}</p>
            </div>
          </div>
        </div>
      )}

      {!isLoading && !error && (
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
              <p className="text-2xl font-bold text-graphite-800">
                {jobCards.filter((jc) => jc.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Ready</p>
              <p className="text-2xl font-bold text-graphite-700">
                {jobCards.filter((jc) => jc.status === 'ready').length}
              </p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-200 shadow-card">
              <p className="text-xs font-medium uppercase tracking-wider text-gray-600 mb-1">Pending</p>
              <p className="text-2xl font-bold text-graphite-600">
                {jobCards.filter((jc) => ['draft', 'queued'].includes(jc.status)).length}
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
                  ref={searchInputRef}
                  type="text"
                  placeholder="Search by job #, customer, vehicle, or plate... (Press / to focus)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-graphite-900 placeholder:text-graphite-400 focus:outline-none focus:ring-2 focus:ring-graphite-400 focus:border-transparent transition-all"
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
                    className="appearance-none pl-10 pr-10 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-graphite-900 focus:outline-none focus:ring-2 focus:ring-graphite-400 focus:border-transparent transition-all cursor-pointer"
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

                {/* Phase 3: Swimlane Selector */}
                {viewMode === 'kanban' && (
                  <div className="relative">
                    <Layers className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                    <select
                      value={swimlaneType}
                      onChange={(e) => setSwimlaneType(e.target.value as 'priority' | 'mechanic' | 'none')}
                      className="appearance-none pl-10 pr-10 py-2.5 bg-white border-2 border-gray-300 rounded-lg text-graphite-900 focus:outline-none focus:ring-2 focus:ring-graphite-400 focus:border-transparent transition-all cursor-pointer"
                    >
                      <option value="none">No Swimlanes</option>
                      <option value="priority">Group by Priority</option>
                      <option value="mechanic">Group by Mechanic</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 pointer-events-none" />
                  </div>
                )}

                {/* Phase 3: Keyboard Shortcuts Help */}
                <KeyboardShortcutButton onClick={() => setShowShortcutsHelp(true)} />

                {/* Zoom Controls (Desktop/Tablet only) */}
                {viewMode === 'kanban' && <ZoomControls />}
              </div>
            </div>
          </motion.div>

          {/* View Mode Tabs */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="border-b border-gray-200 mb-6"
          >
            {/* Mobile: Horizontally Scrollable Tabs */}
            <div className="md:hidden">
              <nav className="flex overflow-x-auto scrollbar-hide snap-x snap-mandatory gap-1 -mb-px touch-pan-x">
                <button
                  onClick={() => {
                    setViewMode('kanban')
                    setStoreViewMode('kanban')
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 snap-start active:scale-[0.98] ${
                    viewMode === 'kanban'
                      ? 'border-graphite-700 text-graphite-700'
                      : 'border-transparent text-gray-600 active:text-gray-900 active:border-gray-300'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Kanban
                </button>
                <button
                  onClick={() => {
                    setViewMode('timeline')
                    setStoreViewMode('timeline')
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 snap-start active:scale-[0.98] ${
                    viewMode === 'timeline'
                      ? 'border-graphite-700 text-graphite-700'
                      : 'border-transparent text-gray-600 active:text-gray-900 active:border-gray-300'
                  }`}
                >
                  <CircleDot className="h-4 w-4" />
                  Gantt
                </button>
                <button
                  onClick={() => {
                    setViewMode('calendar')
                    setStoreViewMode('calendar')
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 snap-start active:scale-[0.98] ${
                    viewMode === 'calendar'
                      ? 'border-graphite-700 text-graphite-700'
                      : 'border-transparent text-gray-600 active:text-gray-900 active:border-gray-300'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Calendar
                </button>
                <button
                  onClick={() => {
                    setViewMode('analytics')
                    setStoreViewMode('analytics')
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap flex-shrink-0 snap-start active:scale-[0.98] ${
                    viewMode === 'analytics'
                      ? 'border-graphite-700 text-graphite-700'
                      : 'border-transparent text-gray-600 active:text-gray-900 active:border-gray-300'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                </button>
              </nav>
            </div>

            {/* Desktop: Full Layout with Shortcuts */}
            <div className="hidden md:flex items-center justify-between">
              <nav className="flex gap-1 -mb-px">
                <button
                  onClick={() => {
                    setViewMode('kanban')
                    setStoreViewMode('kanban')
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    viewMode === 'kanban'
                      ? 'border-graphite-700 text-graphite-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <LayoutGrid className="h-4 w-4" />
                  Kanban Board
                  <span className="hidden lg:inline-block ml-1 text-xs opacity-60">(K)</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('timeline')
                    setStoreViewMode('timeline')
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    viewMode === 'timeline'
                      ? 'border-graphite-700 text-graphite-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <CircleDot className="h-4 w-4" />
                  Gantt View
                  <span className="hidden lg:inline-block ml-1 text-xs opacity-60">(T)</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('calendar')
                    setStoreViewMode('calendar')
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    viewMode === 'calendar'
                      ? 'border-graphite-700 text-graphite-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <CalendarIcon className="h-4 w-4" />
                  Calendar View
                  <span className="hidden lg:inline-block ml-1 text-xs opacity-60">(C)</span>
                </button>
                <button
                  onClick={() => {
                    setViewMode('analytics')
                    setStoreViewMode('analytics')
                  }}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                    viewMode === 'analytics'
                      ? 'border-graphite-700 text-graphite-700'
                      : 'border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300'
                  }`}
                >
                  <BarChart3 className="h-4 w-4" />
                  Analytics
                  <span className="hidden lg:inline-block ml-1 text-xs opacity-60">(A)</span>
                </button>
              </nav>

              {/* Quick shortcut hints */}
              <div className="hidden md:flex items-center gap-4 text-xs text-gray-500">
                <span>Press</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-semibold">/</kbd>
                <span>to search</span>
                <kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded font-semibold">?</kbd>
                <span>for shortcuts</span>
              </div>
            </div>
          </motion.div>

          {/* Kanban Board, Timeline, or Calendar View */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-6"
          >
            {error ? (
              <div className="bg-white rounded-xl border border-red-200 shadow-card p-12 text-center">
                <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Error loading job cards
                </h3>
                <p className="text-gray-600 mb-4">
                  {typeof error === 'string' ? error : 'An unexpected error occurred'}
                </p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : !garageId ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-card p-12 text-center">
                <Loader2 className="h-12 w-12 text-gray-400 mx-auto mb-4 animate-spin" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Loading garage information...
                </h3>
                <p className="text-gray-600">
                  Please wait while we set up your workspace
                </p>
              </div>
            ) : isLoading ? (
              <KanbanBoardSkeleton columnCount={3} />
            ) : jobCards.length === 0 ? (
              <div className="bg-white rounded-xl border border-gray-200 shadow-card p-12 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No job cards yet
                </h3>
                <p className="text-gray-600 mb-4">
                  Create your first job card to get started
                </p>
                <button
                  onClick={handleCreateJobCard}
                  className="text-gray-700 font-medium hover:underline"
                >
                  Create a job card
                </button>
              </div>
            ) : viewMode === 'timeline' ? (
              /* Timeline/Gantt View */
              <TimelineView jobCards={jobCards} garageId={garageId} isLoading={isLoading} />
            ) : viewMode === 'calendar' ? (
              /* Calendar View */
              <CalendarView jobCards={jobCards} garageId={garageId} isLoading={isLoading} />
            ) : viewMode === 'analytics' ? (
              /* Analytics Dashboard */
              <AnalyticsDashboard jobCards={jobCards} garageId={garageId} />
            ) : viewMode === 'kanban' ? (
              /* Kanban Board with Drag-and-Drop */
              <div className="relative">
                {/* Top Scrollbar */}
                {showScrollbar && (
                  <div className="mb-3">
                    <div
                      ref={scrollbarTrackRef}
                      onClick={handleTrackClick}
                      className="h-2 bg-gray-200 rounded-full cursor-pointer relative"
                      style={{ width: '100%' }}
                    >
                      <div
                        ref={scrollbarThumbRef}
                        onMouseDown={handleThumbMouseDown}
                        className={`absolute top-0 h-full bg-gray-500 rounded-full cursor-grab hover:bg-gray-600 transition-colors ${
                          isDragging ? 'cursor-grabbing bg-gray-700' : ''
                        }`}
                        style={{
                          width: `${thumbWidth}%`,
                          left: `${thumbLeft}%`,
                        }}
                      />
                    </div>
                  </div>
                )}

                {/* Main Kanban Board with Drag-and-Drop */}
                <KanbanDragDropContext garageId={garageId} userId={userId}>
                  <div
                    ref={kanbanScrollRef}
                    className="overflow-x-auto overflow-y-hidden pb-4 scrollbar-hide"
                    style={{
                      WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
                    }}
                  >
                    {/* Zoom wrapper - applies CSS transform for zoom */}
                    <div
                      style={{
                        transform: `scale(${zoomLevel / 100})`,
                        transformOrigin: 'top left',
                        transition: 'transform 0.2s ease',
                        willChange: 'transform',
                      }}
                    >
                      <KanbanSwimlane
                        jobCards={jobCards.filter((jc) => statusFilter === 'all' || jc.status === statusFilter)}
                        columns={KANBAN_COLUMNS.filter((col) => statusFilter === 'all' || col.status === statusFilter)}
                      />
                    </div>
                  </div>
                </KanbanDragDropContext>
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
                      {calendarView === 'week' && currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
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
                        const filteredForDay = filterJobCards(jobCards, searchQuery)
                        const dayJobCards = filteredForDay.filter((jc) => jc.promisedDate === dateStr)
                        const isToday = new Date().toDateString() === date.toDateString()
                        const hasJobCards = dayJobCards.length > 0

                        // Count by priority
                        const urgentCount = dayJobCards.filter((jc) => jc.priority === 'urgent').length
                        const highCount = dayJobCards.filter((jc) => jc.priority === 'high').length
                        const mediumCount = dayJobCards.filter((jc) => jc.priority === 'medium').length
                        const lowCount = dayJobCards.filter((jc) => jc.priority === 'low').length

                        days.push(
                          <div
                            key={day}
                            className={`min-h-24 p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors relative ${
                              isToday ? 'bg-graphite-700/5 border-graphite-700' : ''
                            } ${hasJobCards ? 'bg-gray-50/80' : ''}`}
                          >
                            {/* Day number with badge */}
                            <div className="flex items-center justify-between mb-1">
                              <div className={`text-sm font-semibold ${isToday ? 'text-graphite-700' : 'text-gray-900'}`}>
                                {day}
                              </div>
                              {hasJobCards && (
                                <div className="flex items-center gap-1">
                                  <span className="h-5 w-5 rounded-full bg-graphite-700 text-white text-xs font-bold flex items-center justify-center">
                                    {dayJobCards.length}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Priority indicators (dots) */}
                            {hasJobCards && (
                              <div className="flex flex-wrap gap-1 mb-1">
                                {urgentCount > 0 && <div className="h-2 w-2 rounded-full bg-red-500" title={`${urgentCount} urgent`} />}
                                {highCount > 0 && <div className="h-2 w-2 rounded-full bg-orange-500" title={`${highCount} high`} />}
                                {mediumCount > 0 && <div className="h-2 w-2 rounded-full bg-yellow-500" title={`${mediumCount} medium`} />}
                                {lowCount > 0 && <div className="h-2 w-2 rounded-full bg-green-500" title={`${lowCount} low`} />}
                              </div>
                            )}

                            {/* Job cards list */}
                            <div className="space-y-1">
                              {dayJobCards.slice(0, 2).map((jobCard) => (
                                <div
                                  key={jobCard.id}
                                  onClick={() => handleViewJobCard(jobCard.id)}
                                  className={`text-xs p-1.5 rounded truncate cursor-pointer hover:opacity-80 transition-opacity ${
                                    jobCard.priority === 'urgent'
                                      ? 'bg-red-100 text-red-700 border-l-2 border-red-500'
                                      : jobCard.priority === 'high'
                                      ? 'bg-orange-100 text-orange-700 border-l-2 border-orange-500'
                                      : jobCard.priority === 'medium'
                                      ? 'bg-yellow-100 text-yellow-700 border-l-2 border-yellow-500'
                                      : 'bg-green-100 text-green-700 border-l-2 border-green-500'
                                  }`}
                                >
                                  <div className="font-medium truncate">{jobCard.jobCardNumber}</div>
                                  <div className="truncate opacity-75">{jobCard.vehicleLicensePlate}</div>
                                </div>
                              ))}
                              {dayJobCards.length > 2 && (
                                <div className="text-xs text-gray-500 pl-1">+{dayJobCards.length - 2} more</div>
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
                        const filteredForDay = filterJobCards(jobCards, searchQuery)
                        const dayJobCards = filteredForDay.filter((jc) => jc.promisedDate === dateStr)
                        const isToday = new Date().toDateString() === day.toDateString()
                        const hasJobCards = dayJobCards.length > 0

                        // Count by priority for indicators
                        const urgentCount = dayJobCards.filter((jc) => jc.priority === 'urgent').length
                        const highCount = dayJobCards.filter((jc) => jc.priority === 'high').length
                        const mediumCount = dayJobCards.filter((jc) => jc.priority === 'medium').length
                        const lowCount = dayJobCards.filter((jc) => jc.priority === 'low').length

                        days.push(
                          <div key={i} className={`border border-gray-200 rounded-lg p-4 ${isToday ? 'bg-graphite-700/5 border-graphite-700' : ''} ${hasJobCards ? 'bg-gray-50/30' : ''}`}>
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <h3 className={`font-semibold ${isToday ? 'text-graphite-700' : 'text-gray-900'}`}>
                                  {day.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                                </h3>
                                {/* Priority dots */}
                                {hasJobCards && (
                                  <div className="flex gap-1">
                                    {urgentCount > 0 && <div className="h-2 w-2 rounded-full bg-red-500" title={`${urgentCount} urgent`} />}
                                    {highCount > 0 && <div className="h-2 w-2 rounded-full bg-orange-500" title={`${highCount} high`} />}
                                    {mediumCount > 0 && <div className="h-2 w-2 rounded-full bg-yellow-500" title={`${mediumCount} medium`} />}
                                    {lowCount > 0 && <div className="h-2 w-2 rounded-full bg-green-500" title={`${lowCount} low`} />}
                                  </div>
                                )}
                              </div>
                              {hasJobCards && (
                                <span className="h-6 w-6 rounded-full bg-graphite-700 text-white text-xs font-bold flex items-center justify-center">
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
                                      jobCard.priority === 'urgent'
                                        ? 'bg-red-50 border-l-4 border-red-500'
                                        : jobCard.priority === 'high'
                                        ? 'bg-orange-50 border-l-4 border-orange-500'
                                        : jobCard.priority === 'medium'
                                        ? 'bg-yellow-50 border-l-4 border-yellow-500'
                                        : 'bg-green-50 border-l-4 border-green-500'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">{jobCard.jobCardNumber}</p>
                                        <p className="text-xs text-gray-600">
                                          {jobCard.vehicleYear} {jobCard.vehicleMake} {jobCard.vehicleModel} - {jobCard.vehicleLicensePlate}
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">
                                          {jobCard.customerName}
                                        </p>
                                      </div>
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded ${
                                          jobCard.priority === 'urgent'
                                            ? 'bg-red-100 text-red-700'
                                            : jobCard.priority === 'high'
                                            ? 'bg-orange-100 text-orange-700'
                                            : jobCard.priority === 'medium'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}
                                      >
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
                    <div
                      className={`border border-gray-200 rounded-lg p-6 ${
                        new Date().toDateString() === currentDate.toDateString() ? 'bg-graphite-700/5 border-graphite-700' : ''
                      }`}
                    >
                      <h3 className="font-semibold text-gray-900 mb-4">
                        {currentDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                      </h3>
                      <div className="space-y-3">
                        {filterJobCards(jobCards, searchQuery).filter((jc) => jc.promisedDate === currentDate.toISOString().split('T')[0]).length === 0 ? (
                          <p className="text-sm text-gray-400 text-center py-8">No jobs scheduled for this day</p>
                        ) : (
                          filterJobCards(jobCards, searchQuery)
                            .filter((jc) => jc.promisedDate === currentDate.toISOString().split('T')[0])
                            .map((jobCard) => (
                              <div
                                key={jobCard.id}
                                onClick={() => handleViewJobCard(jobCard.id)}
                                className={`p-4 rounded-lg cursor-pointer hover:shadow-md transition-all ${
                                  jobCard.priority === 'urgent'
                                    ? 'bg-red-50 border-l-4 border-red-500'
                                    : jobCard.priority === 'high'
                                    ? 'bg-orange-50 border-l-4 border-orange-500'
                                    : jobCard.priority === 'medium'
                                    ? 'bg-yellow-50 border-l-4 border-yellow-500'
                                    : 'bg-green-50 border-l-4 border-green-500'
                                }`}
                              >
                                <div className="flex items-start justify-between gap-4">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-3 mb-2">
                                      <p className="text-base font-bold text-gray-900">{jobCard.jobCardNumber}</p>
                                      <span
                                        className={`px-2 py-1 text-xs font-medium rounded ${
                                          jobCard.priority === 'urgent'
                                            ? 'bg-red-100 text-red-700'
                                            : jobCard.priority === 'high'
                                            ? 'bg-orange-100 text-orange-700'
                                            : jobCard.priority === 'medium'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-green-100 text-green-700'
                                        }`}
                                      >
                                        {jobCard.priority}
                                      </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-1">
                                      {jobCard.vehicleYear} {jobCard.vehicleMake} {jobCard.vehicleModel}
                                    </p>
                                    <p className="text-sm text-gray-600 mb-1">Plate: {jobCard.vehicleLicensePlate}</p>
                                    <p className="text-sm text-gray-500">
                                      Customer: {jobCard.customerName}
                                    </p>
                                    {jobCard.leadMechanicId && (
                                      <p className="text-sm text-gray-500 mt-1">
                                        Mechanic: Assigned
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

          {/* Phase 3: Keyboard Shortcuts Help Modal */}
          {showShortcutsHelp && (
            <KeyboardShortcutsHelp
              shortcuts={getShortcutHelp(shortcuts)}
              onClose={() => setShowShortcutsHelp(false)}
            />
          )}
        </>
      )}
    </div>
  )
}
