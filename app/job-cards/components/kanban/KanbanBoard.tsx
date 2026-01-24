'use client'

import { useMemo, useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useKanbanJobCards } from '../../hooks/use-job-cards'
import { useJobCardsRealtime } from '../../hooks/use-job-cards-realtime'
import { useJobCardStore } from '../../lib/stores/job-card-store'
import { KanbanDragDropContext } from './KanbanDragDropContext'
import { KanbanColumn } from './KanbanColumn'
import { KanbanCard } from './KanbanCard'
import { ZoomControls } from './ZoomControls'
import type { KanbanJobCard, KanbanFilters, QuickFilter } from '../../types/kanban.types'
import { KANBAN_COLUMNS } from '../../types/kanban.types'
import {
  Search,
  Filter,
  X,
  RefreshCw,
  LayoutGrid,
  List,
  AlertCircle,
  CheckCircle2,
  Clock,
  TrendingUp,
  UserCheck,
  FileX,
} from 'lucide-react'

interface KanbanBoardProps {
  garageId: string
  userId: string
}

/**
 * Quick filter definitions
 */
const QUICK_FILTERS: Array<{ id: QuickFilter; label: string; icon: any }> = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'assigned-to-me', label: 'Assigned to Me', icon: UserCheck },
  { id: 'due-soon', label: 'Due Soon', icon: Clock },
  { id: 'overdue', label: 'Overdue', icon: AlertCircle },
  { id: 'high-priority', label: 'High Priority', icon: TrendingUp },
  { id: 'unassigned', label: 'Unassigned', icon: FileX },
  { id: 'ready-for-billing', label: 'Ready for Billing', icon: CheckCircle2 },
]

export function KanbanBoard({ garageId, userId }: KanbanBoardProps) {
  // Store state
  const {
    zoomLevel,
    searchQuery,
    setSearchQuery,
    mechanicFilter,
    setMechanicFilter,
    cardDensity,
    collapsedColumns,
    toggleColumnCollapse,
  } = useJobCardStore()

  // Local state
  const [quickFilter, setQuickFilter] = useState<QuickFilter>('all')
  const [showFilters, setShowFilters] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)

  // Enable real-time subscriptions
  useJobCardsRealtime({ garageId, enabled: true })

  // Build filters based on quick filter and search
  const filters = useMemo((): KanbanFilters => {
    const baseFilters: KanbanFilters = {
      searchQuery: searchQuery || undefined,
    }

    // Apply quick filter logic
    switch (quickFilter) {
      case 'assigned-to-me':
        baseFilters.mechanicId = userId
        break
      case 'high-priority':
        baseFilters.priorities = ['high', 'urgent']
        break
      case 'unassigned':
        baseFilters.mechanicId = null
        break
      case 'ready-for-billing':
        baseFilters.statuses = ['ready', 'delivered']
        break
      case 'due-soon':
        // Due within 3 days
        const dueSoon = new Date()
        dueSoon.setDate(dueSoon.getDate() + 3)
        baseFilters.promisedDateTo = dueSoon.toISOString().split('T')[0]
        break
      case 'overdue':
        // Overdue cards (promised date < today)
        const today = new Date().toISOString().split('T')[0]
        baseFilters.promisedDateTo = today
        break
    }

    return baseFilters
  }, [quickFilter, searchQuery, userId])

  // Fetch job cards
  const { data: jobCards = [], isLoading, error, refetch } = useKanbanJobCards(garageId, filters)

  // Group cards by status
  const cardsByStatus = useMemo(() => {
    const grouped: Record<string, KanbanJobCard[]> = {}

    KANBAN_COLUMNS.forEach((col) => {
      grouped[col.status] = []
    })

    jobCards.forEach((card) => {
      if (grouped[card.status]) {
        grouped[card.status].push(card)
      }
    })

    // Sort cards within each column
    Object.keys(grouped).forEach((status) => {
      grouped[status].sort((a, b) => {
        // Sort by priority first (urgent > high > medium > low)
        const priorityOrder = { urgent: 0, high: 1, medium: 2, low: 3 }
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority]
        if (priorityDiff !== 0) return priorityDiff

        // Then by due date (earliest first)
        if (a.promisedDate && b.promisedDate) {
          const dateDiff = new Date(a.promisedDate).getTime() - new Date(b.promisedDate).getTime()
          if (dateDiff !== 0) return dateDiff
        }

        // Finally by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      })
    })

    return grouped
  }, [jobCards])

  // Calculate stats
  const stats = useMemo(() => {
    const totalCards = jobCards.length
    const overdueCards = jobCards.filter(
      (card) => card.promisedDate && new Date(card.promisedDate) < new Date()
    ).length
    const unassignedCards = jobCards.filter((card) => !card.leadMechanicId).length
    const highPriorityCards = jobCards.filter(
      (card) => card.priority === 'high' || card.priority === 'urgent'
    ).length

    const totalEstimatedCost = jobCards.reduce(
      (sum, card) => sum + card.estimatedLaborCost + card.estimatedPartsCost,
      0
    )

    return {
      totalCards,
      overdueCards,
      unassignedCards,
      highPriorityCards,
      totalEstimatedCost,
    }
  }, [jobCards])

  // Handle refresh
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)
    await refetch()
    setTimeout(() => setIsRefreshing(false), 500)
  }, [refetch])

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setSearchQuery('')
  }, [setSearchQuery])

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K to focus search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        document.getElementById('kanban-search')?.focus()
      }

      // Cmd/Ctrl + F to toggle filters
      if ((e.metaKey || e.ctrlKey) && e.key === 'f') {
        e.preventDefault()
        setShowFilters((prev) => !prev)
      }

      // Escape to clear search
      if (e.key === 'Escape' && searchQuery) {
        handleClearSearch()
      }

      // R to refresh
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey && document.activeElement?.tagName !== 'INPUT') {
        e.preventDefault()
        handleRefresh()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [searchQuery, handleClearSearch, handleRefresh])

  // Synchronize top scrollbar with main board content
  useEffect(() => {
    const topScrollbar = document.getElementById('kanban-top-scrollbar')
    const boardContainer = document.getElementById('kanban-board-container')
    const scrollbarTrack = document.getElementById('kanban-scrollbar-track')
    const scrollbarThumb = document.getElementById('kanban-scrollbar-thumb')
    const boardContent = document.getElementById('kanban-board-content')

    if (!topScrollbar || !boardContainer || !scrollbarTrack || !scrollbarThumb || !boardContent) return

    let isDragging = false
    let startX = 0
    let startScrollLeft = 0

    // Update scrollbar thumb position and width
    const updateScrollbar = () => {
      const containerWidth = boardContainer.clientWidth
      const scrollWidth = boardContainer.scrollWidth
      const scrollLeft = boardContainer.scrollLeft
      const maxScroll = scrollWidth - containerWidth

      if (maxScroll <= 0) {
        // No scrolling needed - hide scrollbar
        scrollbarThumb.style.width = '0px'
        scrollbarThumb.style.opacity = '0'
        return
      }

      // Show scrollbar
      scrollbarThumb.style.opacity = '0.5'

      // Calculate thumb width (minimum 40px, maximum for aesthetics)
      const thumbWidth = Math.max(40, Math.min(120, (containerWidth / scrollWidth) * containerWidth))
      scrollbarThumb.style.width = `${thumbWidth}px`

      // Calculate thumb position
      const thumbLeft = (scrollLeft / maxScroll) * (containerWidth - thumbWidth)
      scrollbarThumb.style.transform = `translateX(${thumbLeft}px)`
    }

    // Handle thumb drag start
    const handleThumbMouseDown = (e: MouseEvent) => {
      isDragging = true
      startX = e.clientX
      startScrollLeft = boardContainer.scrollLeft
      scrollbarThumb.style.cursor = 'grabbing'
      scrollbarThumb.style.opacity = '1'
      scrollbarThumb.style.transition = 'none'
      document.body.style.userSelect = 'none'

      e.preventDefault()
    }

    // Handle thumb drag
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging) return

      const containerWidth = boardContainer.clientWidth
      const scrollWidth = boardContainer.scrollWidth
      const maxScroll = scrollWidth - containerWidth
      const thumbWidth = parseFloat(scrollbarThumb.style.width)

      const deltaX = e.clientX - startX
      const scrollDelta = (deltaX / (containerWidth - thumbWidth)) * maxScroll

      boardContainer.scrollLeft = Math.max(0, Math.min(maxScroll, startScrollLeft + scrollDelta))
    }

    // Handle thumb drag end
    const handleMouseUp = () => {
      if (isDragging) {
        isDragging = false
        scrollbarThumb.style.cursor = 'grab'
        scrollbarThumb.style.opacity = '0.5'
        scrollbarThumb.style.transition = 'all 200ms ease-out'
        document.body.style.userSelect = ''
      }
    }

    // Handle track click
    const handleTrackClick = (e: MouseEvent) => {
      if (e.target === scrollbarThumb) return

      const rect = scrollbarTrack.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const containerWidth = boardContainer.clientWidth
      const scrollWidth = boardContainer.scrollWidth
      const maxScroll = scrollWidth - containerWidth

      // Scroll to clicked position
      const scrollPosition = (clickX / containerWidth) * maxScroll
      boardContainer.scrollLeft = scrollPosition
    }

    // Show scrollbar on hover over track area
    const handleMouseEnter = () => {
      if (!isDragging) {
        scrollbarThumb.style.opacity = '0.8'
      }
    }

    const handleMouseLeave = () => {
      if (!isDragging) {
        scrollbarThumb.style.opacity = '0.5'
      }
    }

    // Sync board scrolling to scrollbar
    const handleBoardScroll = () => {
      updateScrollbar()
    }

    // Add event listeners
    scrollbarThumb.addEventListener('mousedown', handleThumbMouseDown)
    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
    scrollbarTrack.addEventListener('click', handleTrackClick)
    topScrollbar.addEventListener('mouseenter', handleMouseEnter)
    topScrollbar.addEventListener('mouseleave', handleMouseLeave)
    boardContainer.addEventListener('scroll', handleBoardScroll, { passive: true })

    // Initial update
    const initTimeout = setTimeout(updateScrollbar, 100)

    // Update on resize
    const resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(updateScrollbar)
    })

    resizeObserver.observe(boardContent)
    resizeObserver.observe(boardContainer)

    // Cleanup
    return () => {
      clearTimeout(initTimeout)
      scrollbarThumb.removeEventListener('mousedown', handleThumbMouseDown)
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      scrollbarTrack.removeEventListener('click', handleTrackClick)
      topScrollbar.removeEventListener('mouseenter', handleMouseEnter)
      topScrollbar.removeEventListener('mouseleave', handleMouseLeave)
      boardContainer.removeEventListener('scroll', handleBoardScroll)
      resizeObserver.disconnect()
    }
  }, [zoomLevel, jobCards.length, cardsByStatus])

  if (error) {
    return (
      <div className="flex items-center justify-center h-full bg-white">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-status-error mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-graphite-900 mb-2">Error loading job cards</h3>
          <p className="text-gray-500 mb-4">{error.message}</p>
          <button
            onClick={handleRefresh}
            className="px-4 py-2 bg-graphite-900 text-white rounded-lg hover:bg-graphite-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <KanbanDragDropContext garageId={garageId} userId={userId}>
      <div className="h-full flex flex-col bg-white rounded-xl overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            {/* Title and stats */}
            <div>
              <h1 className="text-2xl font-bold text-graphite-900 mb-2">Job Cards</h1>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1.5 text-graphite-600">
                  <LayoutGrid className="h-4 w-4" />
                  <span>{stats.totalCards} total</span>
                </div>
                {stats.overdueCards > 0 && (
                  <div className="flex items-center gap-1.5 text-status-error">
                    <AlertCircle className="h-4 w-4" />
                    <span>{stats.overdueCards} overdue</span>
                  </div>
                )}
                {stats.unassignedCards > 0 && (
                  <div className="flex items-center gap-1.5 text-status-warning">
                    <UserCheck className="h-4 w-4" />
                    <span>{stats.unassignedCards} unassigned</span>
                  </div>
                )}
                {stats.highPriorityCards > 0 && (
                  <div className="flex items-center gap-1.5 text-status-error">
                    <TrendingUp className="h-4 w-4" />
                    <span>{stats.highPriorityCards} high priority</span>
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="p-2 text-gray-500 hover:text-graphite-900 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                title="Refresh (R)"
              >
                <RefreshCw className={`h-5 w-5 ${isRefreshing ? 'animate-spin' : ''}`} />
              </button>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-lg transition-colors ${
                  showFilters
                    ? 'text-graphite-900 bg-gray-100'
                    : 'text-gray-500 hover:text-graphite-900 hover:bg-gray-100'
                }`}
                title="Toggle filters (Cmd+F)"
              >
                <Filter className="h-5 w-5" />
              </button>

              <ZoomControls />
            </div>
          </div>

          {/* Search and Quick Filters */}
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
              <input
                id="kanban-search"
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search cards... (Cmd+K)"
                className="w-full pl-10 pr-10 py-2 bg-gray-50 border border-gray-200 rounded-lg text-graphite-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-graphite-400"
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-graphite-900 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              {QUICK_FILTERS.map((filter) => {
                const Icon = filter.icon
                const isActive = quickFilter === filter.id

                return (
                  <button
                    key={filter.id}
                    onClick={() => setQuickFilter(filter.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-graphite-900 text-white'
                        : 'text-gray-600 hover:text-graphite-900 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="hidden sm:inline">{filter.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Board Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 text-gray-400 mx-auto mb-4 animate-spin" />
                <p className="text-gray-500">Loading job cards...</p>
              </div>
            </div>
          ) : jobCards.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center max-w-md">
                <LayoutGrid className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-700 mb-2">No job cards found</h3>
                <p className="text-gray-500 mb-4">
                  {searchQuery
                    ? 'Try adjusting your search or filters'
                    : 'Get started by creating your first job card'}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => window.location.href = '/job-cards/create'}
                    className="px-4 py-2 bg-graphite-900 text-white rounded-lg hover:bg-graphite-800 transition-colors font-medium"
                  >
                    Create Job Card
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col">
              {/* Top Scrollbar */}
              <div
                id="kanban-top-scrollbar"
                className="flex-shrink-0 h-3 bg-transparent relative select-none"
                style={{ paddingTop: '2px', paddingBottom: '2px' }}
              >
                <div
                  id="kanban-scrollbar-track"
                  className="absolute inset-x-0 inset-y-1 cursor-pointer"
                />
                <div
                  id="kanban-scrollbar-thumb"
                  className="absolute top-1 bottom-1 left-0 rounded-full cursor-grab hover:opacity-80 active:opacity-100 transition-all duration-200 ease-out"
                  style={{
                    width: '60px',
                    transform: 'translateX(0)',
                    backgroundColor: 'rgba(107, 114, 128, 0.5)',
                    boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                  }}
                />
              </div>

              {/* Main Board Content */}
              <div
                id="kanban-board-container"
                className="flex-1 overflow-x-auto overflow-y-hidden scrollbar-hide"
              >
                <motion.div
                  id="kanban-board-content"
                  className="h-fit flex gap-4 p-4 origin-top-left"
                  style={{
                    transform: `scale(${zoomLevel / 100})`,
                    transformOrigin: 'top left',
                    minWidth: `${zoomLevel}%`,
                  }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                <AnimatePresence>
                  {KANBAN_COLUMNS.map((columnConfig) => {
                    const cards = cardsByStatus[columnConfig.status] || []
                    const isCollapsed = collapsedColumns[columnConfig.status]

                    return (
                      <KanbanColumn
                        key={columnConfig.status}
                        config={columnConfig}
                        count={cards.length}
                        isCollapsed={isCollapsed}
                        onToggleCollapse={() => toggleColumnCollapse(columnConfig.status)}
                      >
                        <AnimatePresence>
                          {cards.map((card) => (
                            <KanbanCard key={card.id} card={card} />
                          ))}
                        </AnimatePresence>
                      </KanbanColumn>
                    )
                  })}
                </AnimatePresence>
              </motion.div>
              </div>
            </div>
          )}
        </div>
      </div>
    </KanbanDragDropContext>
  )
}

