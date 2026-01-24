/**
 * Kanban Board Types
 *
 * Production-ready types for the kanban board system
 * Matches the database schema from job_cards table
 */

// ============================================================================
// ENUMS
// ============================================================================

/**
 * Job card status values matching database CHECK constraint
 */
export type JobCardStatus =
  | 'draft'
  | 'queued'
  | 'assigned'
  | 'in_progress'
  | 'parts_waiting'
  | 'quality_check'
  | 'ready'
  | 'delivered'
  | 'invoiced'
  | 'closed'

/**
 * Priority levels matching database CHECK constraint
 */
export type JobCardPriority = 'low' | 'medium' | 'high' | 'urgent'

/**
 * Job types matching database CHECK constraint
 */
export type JobType = 'routine' | 'repair' | 'maintenance' | 'custom'

/**
 * Payment status values matching database CHECK constraint
 */
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'overdue'

// ============================================================================
// KANBAN COLUMN CONFIGURATION
// ============================================================================

/**
 * Kanban column configuration
 * Defines the structure and appearance of each status column
 */
export interface KanbanColumnConfig {
  id: JobCardStatus
  title: string
  status: JobCardStatus
  color: string // Tailwind text color class
  bgColor: string // Tailwind background color class
  borderColor: string // Tailwind border color class
  wipLimit?: number // Optional work-in-progress limit
  icon?: string // Lucide icon name
}

/**
 * Column configuration for the kanban board
 * Ordered in the logical workflow sequence
 */
export const KANBAN_COLUMNS: readonly KanbanColumnConfig[] = [
  {
    id: 'draft',
    title: 'Draft',
    status: 'draft',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-300',
    wipLimit: undefined,
    icon: 'file',
  },
  {
    id: 'queued',
    title: 'Queued',
    status: 'queued',
    color: 'text-gray-700',
    bgColor: 'bg-gray-200',
    borderColor: 'border-gray-400',
    wipLimit: 10,
    icon: 'clock',
  },
  {
    id: 'assigned',
    title: 'Assigned',
    status: 'assigned',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    wipLimit: 8,
    icon: 'user-check',
  },
  {
    id: 'in_progress',
    title: 'In Progress',
    status: 'in_progress',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-400',
    wipLimit: 5,
    icon: 'wrench',
  },
  {
    id: 'parts_waiting',
    title: 'Parts Waiting',
    status: 'parts_waiting',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-400',
    wipLimit: undefined,
    icon: 'package',
  },
  {
    id: 'quality_check',
    title: 'Quality Check',
    status: 'quality_check',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-400',
    wipLimit: 3,
    icon: 'check-circle',
  },
  {
    id: 'ready',
    title: 'Ready',
    status: 'ready',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-400',
    wipLimit: undefined,
    icon: 'truck',
  },
  {
    id: 'delivered',
    title: 'Delivered',
    status: 'delivered',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-400',
    wipLimit: undefined,
    icon: 'check-square',
  },
  {
    id: 'invoiced',
    title: 'Invoiced',
    status: 'invoiced',
    color: 'text-gray-700',
    bgColor: 'bg-gray-100',
    borderColor: 'border-gray-400',
    wipLimit: undefined,
    icon: 'file-text',
  },
  {
    id: 'closed',
    title: 'Closed',
    status: 'closed',
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    wipLimit: undefined,
    icon: 'archive',
  },
] as const

// ============================================================================
// JOB CARD DATA TYPES
// ============================================================================

/**
 * Extended job card data for kanban board
 * Includes all relevant fields from the database schema
 */
export interface KanbanJobCard {
  // Core identity
  id: string
  garageId: string
  jobCardNumber: string

  // Customer information
  customerId: string
  customerName: string
  customerPhone: string
  customerEmail: string | null

  // Vehicle information
  vehicleId: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleLicensePlate: string
  vehicleVin: string | null
  currentMileage: number | null

  // Job details
  status: JobCardStatus
  priority: JobCardPriority
  jobType: JobType

  // Customer inputs
  customerComplaint: string
  workRequested: string
  customerNotes: string | null

  // Internal notes
  technicianNotes: string | null
  serviceAdvisorNotes: string | null
  qualityCheckNotes: string | null

  // Scheduling
  promisedDate: string | null
  promisedTime: string | null
  actualStartDate: string | null
  actualCompletionDate: string | null
  bayAssigned: string | null

  // Financials
  estimatedLaborCost: number
  estimatedPartsCost: number
  actualLaborCost: number
  actualPartsCost: number
  discountAmount: number
  taxAmount: number
  finalAmount: number
  paymentStatus: PaymentStatus

  // Staffing
  serviceAdvisorId: string
  leadMechanicId: string | null
  serviceAdvisorName?: string
  leadMechanicName?: string

  // Quality
  qualityChecked: boolean
  qualityCheckedBy: string | null
  customerRating: number | null

  // Progress tracking (derived from checklist items)
  totalChecklistItems?: number
  completedChecklistItems?: number
  progressPercentage?: number

  // Attachments count
  attachmentsCount?: number

  // Comments count
  commentsCount?: number

  // Metadata
  createdAt: string
  updatedAt: string
  createdBy: string
}

/**
 * Employee/Staff information for assignee display
 */
export interface EmployeeInfo {
  id: string
  fullName: string
  avatarUrl: string | null
  role: string
}

// ============================================================================
// FILTER AND SEARCH TYPES
// ============================================================================

/**
 * Kanban board filters
 */
export interface KanbanFilters {
  // Status filter (empty array = all statuses)
  statuses?: JobCardStatus[]

  // Priority filter (empty array = all priorities)
  priorities?: JobCardPriority[]

  // Job type filter (empty array = all types)
  jobTypes?: JobType[]

  // Assigned to specific mechanic
  mechanicId?: string | null

  // Assigned to specific service advisor
  serviceAdvisorId?: string | null

  // Customer filter
  customerId?: string

  // Date range
  promisedDateFrom?: string
  promisedDateTo?: string
  createdDateFrom?: string
  createdDateTo?: string

  // Full-text search
  searchQuery?: string

  // Payment status
  paymentStatus?: PaymentStatus[]

  // Overdue items only
  overdueOnly?: boolean

  // Unassigned only
  unassignedOnly?: boolean
}

/**
 * Quick filter presets
 */
export type QuickFilter =
  | 'all'
  | 'assigned-to-me'
  | 'due-soon'
  | 'overdue'
  | 'high-priority'
  | 'unassigned'
  | 'ready-for-billing'

/**
 * Sort options for kanban cards
 */
export type KanbanSortOption =
  | 'priority'
  | 'promised-date'
  | 'created-date'
  | 'customer-name'
  | 'job-card-number'

// ============================================================================
// UI STATE TYPES
// ============================================================================>

/**
 * Kanban board UI state
 */
export interface KanbanUIState {
  // Filters
  filters: KanbanFilters
  quickFilter: QuickFilter

  // Sort
  sortBy: KanbanSortOption
  sortAscending: boolean

  // View options
  cardDensity: 'comfortable' | 'compact'
  showWIPWarnings: boolean
  collapsedColumns: Record<JobCardStatus, boolean>

  // Drag and drop
  isDragging: boolean
  draggedCardId: string | null

  // Selection
  selectedCardIds: string[]
}

/**
 * Column state for UI management
 */
export interface KanbanColumnState {
  id: JobCardStatus
  isCollapsed: boolean
  cardCount: number
  isOverWIP: boolean
  isNearWIP: boolean
}

// ============================================================================
// DRAG AND DROP TYPES
// ============================================================================

/**
 * Drag data transferred during drag operations
 */
export interface KanbanDragData {
  cardId: string
  status: JobCardStatus
  jobCardNumber: string
  priority: JobCardPriority
  customerName: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleLicensePlate: string
}

/**
 * Drop result data
 */
export interface KanbanDropResult {
  cardId: string
  sourceStatus: JobCardStatus
  destinationStatus: JobCardStatus
}

// ============================================================================
// REAL-TIME UPDATE TYPES
// ============================================================================

/**
 * Real-time event types from Supabase
 */
export type KanbanRealtimeEvent =
  | 'INSERT'
  | 'UPDATE'
  | 'DELETE'

/**
 * Real-time update payload
 */
export interface KanbanRealtimeUpdate {
  type: KanbanRealtimeEvent
  card: KanbanJobCard
  oldCard?: KanbanJobCard // For UPDATE events
}

// ============================================================================
// ACTION TYPES
// ============================================================================

/**
 * Quick actions available on cards
 */
export type CardActionType =
  | 'view'
  | 'edit'
  | 'assign'
  | 'duplicate'
  | 'archive'
  | 'delete'
  | 'print'
  | 'add-comment'
  | 'add-attachment'

/**
 * Card action configuration
 */
export interface CardAction {
  type: CardActionType
  label: string
  icon: string // Lucide icon name
  shortcut?: string // Keyboard shortcut
  showOnHover?: boolean // Only show on card hover
  requirePermission?: string // Permission required
}

/**
 * Bulk action options
 */
export type BulkActionType =
  | 'assign'
  | 'change-status'
  | 'change-priority'
  | 'archive'
  | 'delete'
  | 'export'

// ============================================================================
// ANALYTICS TYPES
// ============================================================================

/**
 * Column statistics for analytics
 */
export interface ColumnStats {
  status: JobCardStatus
  count: number
  totalEstimatedCost: number
  totalActualCost: number
  overdueCount: number
  averageDaysInColumn: number
}

/**
 * Board-level analytics
 */
export interface BoardAnalytics {
  totalCards: number
  totalEstimatedValue: number
  totalActualValue: number
  columnsStats: ColumnStats[]
  workloadByMechanic: Array<{
    mechanicId: string
    mechanicName: string
    activeJobs: number
    totalEstimatedCost: number
  }>
}

// ============================================================================
// HELPER TYPES
// ============================================================================

/**
 * Card display mode
 */
export type CardDisplayMode = 'full' | 'compact' | 'minimal'

/**
 * Priority badge styles
 */
export interface PriorityBadgeStyle {
  bgColor: string
  textColor: string
  borderColor: string
  icon: string
}

/**
 * Get priority badge styles
 */
export function getPriorityBadgeStyles(priority: JobCardPriority): PriorityBadgeStyle {
  switch (priority) {
    case 'urgent':
      return {
        bgColor: 'bg-red-50',
        textColor: 'text-red-700',
        borderColor: 'border-red-400',
        icon: 'alert-circle',
      }
    case 'high':
      return {
        bgColor: 'bg-orange-50',
        textColor: 'text-orange-700',
        borderColor: 'border-orange-400',
        icon: 'trending-up',
      }
    case 'medium':
      return {
        bgColor: 'bg-yellow-50',
        textColor: 'text-yellow-700',
        borderColor: 'border-yellow-400',
        icon: 'minus',
      }
    case 'low':
      return {
        bgColor: 'bg-gray-50',
        textColor: 'text-gray-600',
        borderColor: 'border-gray-300',
        icon: 'arrow-down',
      }
  }
}

/**
 * Check if a date is overdue
 */
export function isOverdue(promisedDate: string | null): boolean {
  if (!promisedDate) return false
  return new Date(promisedDate) < new Date()
}

/**
 * Get status column config by status value
 */
export function getColumnConfig(status: JobCardStatus): KanbanColumnConfig {
  return KANBAN_COLUMNS.find(col => col.status === status) || KANBAN_COLUMNS[0]
}

/**
 * Format currency for display (Indian Rupees)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount)
}
