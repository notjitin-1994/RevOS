'use client'

// ============================================================================
// TYPES
// ============================================================================

export type JobType = 'routine' | 'repair' | 'maintenance' | 'custom' | 'diagnostic'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export interface ChecklistItem {
  id: string
  itemName: string
  description?: string
  category?: string
  priority: Priority
  estimatedMinutes: number
  laborRate: number
  displayOrder: number
  subtasks?: Array<{
    id: string
    name: string
    completed: boolean
  }>
  linkedToCustomerIssues?: number[]
  linkedToServiceScope?: number[]
  linkedToTechnicalDiagnosis?: number[]
}

export interface PartItem {
  id: string
  partId: string | null
  partName: string
  partNumber: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
}

export interface CustomerData {
  id: string
  firstName: string
  lastName: string
  phoneNumber: string
  email?: string
}

export interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  vin?: string
  color?: string
  engineNumber?: string
  chassisNumber?: string
  category?: string
  notes?: string
}

export interface CollectJobCardDataOptions {
  garageId: string
  userId: string

  // Customer & Vehicle
  selectedCustomer: CustomerData | null
  selectedVehicle: VehicleData | null
  currentMileage: string

  // Job Details
  jobType: JobType
  priority: Priority
  customerReportIssues: string[]
  workRequestedItems: string[]
  customerNotes: string
  technicalDiagnosisItems: string[]

  // Tasks
  checklistItems: ChecklistItem[]

  // Parts
  selectedParts: PartItem[]

  // Scheduling
  promisedDate: string
  promisedTime: string
  leadMechanicId: string
  serviceAdvisorId: string
  technicianNotes: string
}

export interface CollectedJobCardData {
  // Core job card fields
  garageId: string
  customerId: string
  vehicleId: string
  jobType: JobType
  priority: Priority
  status: 'draft' | 'queued'

  // Job details from UI
  customerComplaint: string
  workRequested: string
  customerNotes?: string
  currentMileage?: number
  technicalDiagnosis?: string

  // Scheduling
  promisedDate?: string
  promisedTime?: string
  leadMechanicId?: string
  technicianNotes?: string

  // Checklist items with ALL UI fields
  checklistItems?: Array<{
    mechanicId: string | null
    itemName: string
    description: string | null
    category: string | null
    status: 'pending'
    priority: Priority
    estimatedMinutes: number
    actualMinutes: number
    isTimerRunning: boolean
    timerStartedAt: string | null
    totalTimeSpent: number
    laborRate: number
    laborCost: number
    displayOrder: number
    mechanicNotes: string | null
    notes: string | null
    completedAt: string | null
    // UI-specific fields that must be saved
    subtasks?: Array<{
      id: string
      name: string
      description?: string
      estimatedMinutes: number
      completed: boolean
      displayOrder: number
    }>
    linkedToCustomerIssues?: number[]
    linkedToServiceScope?: number[]
    linkedToTechnicalDiagnosis?: number[]
  }>

  // Parts
  parts?: Array<{
    partId: string | null
    partName: string
    partNumber: string | null
    quantity: number
    unitPrice: number
    totalPrice: number
  }>

  // Customer snapshot (required by database - NOT NULL constraint)
  customerName: string
  customerPhone: string
  customerEmail?: string

  // Vehicle snapshot (required by database - NOT NULL constraint)
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleLicensePlate: string
  vehicleVin?: string

  // Service assignment
  serviceAdvisorId: string
  createdBy: string
}

// ============================================================================
// DATA COLLECTION FUNCTION
// ============================================================================

/**
 * Collects all job card form data from all tabs into a format suitable for API submission.
 * This ensures all data from all tabs is included when saving as draft.
 */
export function collectJobCardData(
  options: CollectJobCardDataOptions,
  saveAsDraft: boolean = false
): CollectedJobCardData {
  const {
    garageId,
    userId,
    selectedCustomer,
    selectedVehicle,
    currentMileage,
    jobType,
    priority,
    customerReportIssues,
    workRequestedItems,
    customerNotes,
    technicalDiagnosisItems,
    checklistItems,
    selectedParts,
    promisedDate,
    promisedTime,
    leadMechanicId,
    serviceAdvisorId,
    technicianNotes,
  } = options

  // Validate required fields
  if (!selectedCustomer) {
    throw new Error('Customer is required')
  }
  if (!selectedVehicle) {
    throw new Error('Vehicle is required')
  }

  return {
    garageId,
    customerId: selectedCustomer.id,
    vehicleId: selectedVehicle.id,
    jobType,
    priority,
    status: saveAsDraft ? ('draft' as const) : ('queued' as const),

    // Customer complaint and work requested (pipe-separated arrays)
    customerComplaint: customerReportIssues.length > 0 ? customerReportIssues.join(' | ') : '',
    workRequested: workRequestedItems.length > 0 ? workRequestedItems.join(' | ') : '',

    // Customer notes
    customerNotes: customerNotes || undefined,

    // Current mileage
    currentMileage: currentMileage ? parseInt(currentMileage) : undefined,

    // Technical diagnosis (pipe-separated array)
    technicalDiagnosis: technicalDiagnosisItems.length > 0 ? technicalDiagnosisItems.join(' | ') : undefined,

    // Scheduling
    promisedDate: promisedDate || undefined,
    promisedTime: promisedTime || undefined,
    leadMechanicId: leadMechanicId || undefined,
    technicianNotes: technicianNotes || undefined,

    // Checklist items (tasks) - mapped to database format with ALL UI fields
    checklistItems: checklistItems.length > 0 ? checklistItems.map(item => ({
      mechanicId: leadMechanicId || null,
      itemName: item.itemName,
      description: item.description || null,
      category: item.category || null,
      status: 'pending' as const,
      priority: item.priority,
      estimatedMinutes: item.estimatedMinutes,
      actualMinutes: 0,
      isTimerRunning: false,
      timerStartedAt: null,
      totalTimeSpent: 0,
      laborRate: item.laborRate,
      laborCost: 0,
      displayOrder: item.displayOrder,
      mechanicNotes: null,
      notes: null,
      completedAt: null,
      // Include UI-specific fields: subtasks and linking arrays
      subtasks: item.subtasks?.map(st => ({
        id: st.id,
        name: st.name,
        description: st.description,
        estimatedMinutes: st.estimatedMinutes || 0,
        completed: st.completed,
        displayOrder: st.displayOrder || 0,
      })) || [],
      linkedToCustomerIssues: item.linkedToCustomerIssues || [],
      linkedToServiceScope: item.linkedToServiceScope || [],
      linkedToTechnicalDiagnosis: item.linkedToTechnicalDiagnosis || [],
    })) : undefined,

    // Parts - mapped to database format
    parts: selectedParts.length > 0 ? selectedParts.map(part => ({
      partId: part.partId,
      partName: part.partName,
      partNumber: part.partNumber,
      quantity: part.quantity,
      unitPrice: part.unitPrice,
      totalPrice: part.totalPrice,
    })) : undefined,

    // Customer snapshot (required by database - stores a copy of customer data at time of job card creation)
    // This is a denormalized design pattern to preserve historical data even if customer is updated later
    customerName: `${selectedCustomer.firstName} ${selectedCustomer.lastName}`,
    customerPhone: selectedCustomer.phoneNumber,
    customerEmail: selectedCustomer.email || undefined,

    // Vehicle snapshot (required by database - stores a copy of vehicle data at time of job card creation)
    // This is a denormalized design pattern to preserve historical data even if vehicle is updated later
    vehicleMake: selectedVehicle.make,
    vehicleModel: selectedVehicle.model,
    vehicleYear: selectedVehicle.year,
    vehicleLicensePlate: selectedVehicle.licensePlate,
    vehicleVin: selectedVehicle.vin || undefined,

    // Service advisor (required field - use current user if not specified)
    serviceAdvisorId: serviceAdvisorId || userId,

    // Created by
    createdBy: userId,
  }
}

/**
 * Validates that minimum required data is present for saving as draft
 */
export function validateMinimumDraftData(options: CollectJobCardDataOptions): {
  valid: boolean
  error?: string
} {
  if (!options.selectedCustomer) {
    return { valid: false, error: 'Please select a customer' }
  }
  if (!options.selectedVehicle) {
    return { valid: false, error: 'Please select a vehicle' }
  }
  return { valid: true }
}
