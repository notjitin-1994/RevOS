import { create } from 'zustand'

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
}))
