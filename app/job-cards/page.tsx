'use client'

import React, { useEffect, useState, useCallback, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import dynamic from 'next/dynamic'
import {
  Search,
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
import { KanbanBoard } from './components/kanban/KanbanBoard'
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
import { KANBAN_COLUMNS } from './types/kanban.types'

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
  const [viewMode, setViewMode] = useState<'kanban' | 'timeline' | 'analytics'>(
    (storeViewMode as 'kanban' | 'timeline' | 'analytics') || 'kanban'
  )

  // Phase 3: Keyboard shortcuts modal state
  const [showShortcutsHelp, setShowShortcutsHelp] = useState(false)

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
    onSearchFocus: () => {
      // Focus on the kanban board search input
      const kanbanSearch = document.getElementById('kanban-search') as HTMLInputElement
      kanbanSearch?.focus()
    },
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
                  Gantt Calendar
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
                  Gantt Calendar
                  <span className="hidden lg:inline-block ml-1 text-xs opacity-60">(T)</span>
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
            ) : viewMode === 'analytics' ? (
              /* Analytics Dashboard */
              <AnalyticsDashboard jobCards={jobCards} garageId={garageId} />
            ) : (
              /* Kanban Board with Real-time Data */
              <KanbanBoard garageId={garageId} userId={userId} />
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
