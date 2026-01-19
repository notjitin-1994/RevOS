/**
 * Job Card View Types
 *
 * Extended job card types used in views (Kanban, Timeline, Calendar)
 * Includes customer and vehicle data from related tables
 */

/**
 * Extended job card data for views
 * This is the shape returned by the API with customer and vehicle joins
 */
export interface JobCardViewData {
  id: string
  jobCardNumber: string
  customerId: string
  vehicleId: string
  jobType: string
  priority: string
  status: string
  customerComplaint: string | null
  workRequested: string | null
  customerNotes: string | null
  currentMileage: number | null
  reportedIssue: string | null
  promisedDate: string | null
  promisedTime: string | null
  actualCompletionDate: string | null
  leadMechanicId: string | null
  laborHours: number
  laborCost: number
  partsCost: number
  totalCost: number
  totalChecklistItems: number
  completedChecklistItems: number
  progressPercentage: number
  internalNotes: string | null
  mechanicNotes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
  garageId: string
  // Customer data
  customerName: string
  customerPhone: string
  customerEmail: string | null
  // Vehicle data
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleLicensePlate: string
  vehicleVin: string | null
}

/**
 * Job card view filters
 */
export interface JobCardViewFilters {
  status?: string
  mechanicId?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}
