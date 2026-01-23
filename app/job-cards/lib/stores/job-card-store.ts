import { create } from 'zustand'

// Zoom constants
const ZOOM_MIN = 50
const ZOOM_MAX = 150
const ZOOM_DEFAULT = 100
const ZOOM_STEP = 10
const ZOOM_STORAGE_KEY = 'kanban-zoom-level'

// Load zoom level from localStorage
const loadZoomLevel = (): number => {
  if (typeof window === 'undefined') return ZOOM_DEFAULT
  try {
    const saved = localStorage.getItem(ZOOM_STORAGE_KEY)
    return saved ? Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, parseInt(saved, 10))) : ZOOM_DEFAULT
  } catch {
    return ZOOM_DEFAULT
  }
}

// Save zoom level to localStorage
const saveZoomLevel = (level: number): void => {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(ZOOM_STORAGE_KEY, level.toString())
  } catch (error) {
    console.warn('Failed to save zoom level:', error)
  }
}

type JobCardStatus = 'draft' | 'queued' | 'in_progress' | 'parts_waiting' | 'quality_check' | 'ready' | 'delivered'
type ViewMode = 'kanban' | 'timeline' | 'calendar' | 'analytics'
type CardDensity = 'comfortable' | 'compact'
type Priority = 'low' | 'medium' | 'high' | 'urgent'
type SwimlaneType = 'priority' | 'mechanic' | 'none'

interface JobCardUIState {
  // View mode
  viewMode: ViewMode
  setViewMode: (mode: ViewMode) => void

  // Filters
  statusFilter: JobCardStatus | 'all'
  setStatusFilter: (status: JobCardStatus | 'all') => void
  mechanicFilter: string | null
  setMechanicFilter: (mechanicId: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // UI preferences
  cardDensity: CardDensity
  setCardDensity: (density: CardDensity) => void
  showWIPWarnings: boolean
  toggleWIPWarnings: () => void

  // Swimlane settings (Phase 3)
  swimlaneType: SwimlaneType
  setSwimlaneType: (type: SwimlaneType) => void

  // Drag and drop state
  isDragging: boolean
  setIsDragging: (isDragging: boolean) => void
  draggedCardId: string | null
  setDraggedCardId: (id: string | null) => void

  // Column collapse state
  collapsedColumns: Record<string, boolean>
  toggleColumnCollapse: (columnId: string) => void

  // Zoom state
  zoomLevel: number // Range: 50-150
  setZoomLevel: (level: number) => void
  zoomIn: () => void
  zoomOut: () => void
  resetZoom: () => void
}

export const useJobCardStore = create<JobCardUIState>((set) => ({
  // View mode
  viewMode: 'kanban',
  setViewMode: (mode) => set({ viewMode: mode }),

  // Filters
  statusFilter: 'all',
  setStatusFilter: (status) => set({ statusFilter: status }),
  mechanicFilter: null,
  setMechanicFilter: (mechanicId) => set({ mechanicFilter: mechanicId }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),

  // UI preferences
  cardDensity: 'comfortable',
  setCardDensity: (density) => set({ cardDensity: density }),
  showWIPWarnings: true,
  toggleWIPWarnings: () => set((state) => ({ showWIPWarnings: !state.showWIPWarnings })),

  // Swimlane settings (Phase 3)
  swimlaneType: 'none',
  setSwimlaneType: (type) => set({ swimlaneType: type }),

  // Drag and drop state
  isDragging: false,
  setIsDragging: (isDragging) => set({ isDragging }),
  draggedCardId: null,
  setDraggedCardId: (id) => set({ draggedCardId: id }),

  // Column collapse state
  collapsedColumns: {},
  toggleColumnCollapse: (columnId) =>
    set((state) => ({
      collapsedColumns: {
        ...state.collapsedColumns,
        [columnId]: !state.collapsedColumns[columnId],
      },
    })),

  // Zoom state
  zoomLevel: loadZoomLevel(),
  setZoomLevel: (level) => {
    const clampedLevel = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, level))
    set({ zoomLevel: clampedLevel })
    saveZoomLevel(clampedLevel)
  },
  zoomIn: () => {
    set((state) => {
      const newLevel = Math.min(ZOOM_MAX, state.zoomLevel + ZOOM_STEP)
      saveZoomLevel(newLevel)
      return { zoomLevel: newLevel }
    })
  },
  zoomOut: () => {
    set((state) => {
      const newLevel = Math.max(ZOOM_MIN, state.zoomLevel - ZOOM_STEP)
      saveZoomLevel(newLevel)
      return { zoomLevel: newLevel }
    })
  },
  resetZoom: () => {
    saveZoomLevel(ZOOM_DEFAULT)
    set({ zoomLevel: ZOOM_DEFAULT })
  },
}))
