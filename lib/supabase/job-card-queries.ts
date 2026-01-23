import { createClient, createAdminClient } from './server'
import type { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export type JobCardStatus =
  | 'draft'
  | 'queued'
  | 'in_progress'
  | 'parts_waiting'
  | 'quality_check'
  | 'ready'
  | 'delivered'
  | 'cancelled'

export type JobType = 'routine' | 'repair' | 'maintenance' | 'custom' | 'diagnostic'
export type Priority = 'low' | 'medium' | 'high' | 'urgent'

export type ChecklistItemStatus =
  | 'pending'
  | 'in_progress'
  | 'waiting_parts'
  | 'completed'
  | 'skipped'

export type PartStatus = 'allocated' | 'ordered' | 'received' | 'used' | 'returned' | 'cancelled'
export type JobCardPartStatus = PartStatus

export interface JobCardPartInput {
  partId: string | null
  partName: string
  partNumber: string | null
  quantity: number
  unitPrice: number
  totalPrice: number
  manufacturer?: string | null
  category?: string | null
}

export interface DbJobCard {
  id: string
  job_card_number: string
  garage_id: string
  customer_id: string
  customer_name: string
  customer_phone: string
  customer_email: string | null
  vehicle_id: string
  vehicle_make: string
  vehicle_model: string
  vehicle_year: number
  vehicle_license_plate: string
  vehicle_vin: string | null
  current_mileage: number | null
  job_type: JobType
  priority: Priority
  status: JobCardStatus
  customer_complaint: string | null
  work_requested: string | null
  customer_notes: string | null
  technician_notes: string | null
  service_advisor_notes: string | null
  quality_check_notes: string | null
  promised_date: string | null
  promised_time: string | null
  actual_completion_date: string | null
  service_advisor_id: string
  lead_mechanic_id: string | null
  labor_hours: number
  labor_cost: number
  parts_cost: number
  total_cost: number
  estimated_labor_cost: number
  estimated_parts_cost: number
  total_checklist_items: number
  completed_checklist_items: number
  progress_percentage: number
  created_by: string
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface JobCardData {
  id: string
  jobCardNumber: string
  garageId: string
  customerId: string
  vehicleId: string
  jobType: JobType
  priority: Priority
  status: JobCardStatus
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
  technicianNotes: string | null
  serviceAdvisorNotes: string | null
  qualityCheckNotes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface DbChecklistItem {
  id: string
  job_card_id: string
  mechanic_id: string | null
  item_name: string
  description: string | null
  category: string | null
  status: ChecklistItemStatus
  priority: Priority
  estimated_minutes: number
  actual_minutes: number
  is_timer_running: boolean
  timer_started_at: string | null
  total_time_spent: number
  labor_rate: number
  labor_cost: number
  display_order: number
  mechanic_notes: string | null
  notes: string | null
  created_at: string
  updated_at: string
  completed_at: string | null
  deleted_at: string | null
}

export interface ChecklistItemData {
  id: string
  jobCardId: string
  mechanicId: string | null
  itemName: string
  description: string | null
  category: string | null
  status: ChecklistItemStatus
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
  createdAt: string
  updatedAt: string
  completedAt: string | null
  deletedAt: string | null
}

export interface DbTimeEntry {
  id: string
  checklist_item_id: string
  mechanic_id: string
  started_at: string
  stopped_at: string | null
  duration_seconds: number | null
  notes: string | null
  created_at: string
}

export interface TimeEntryData {
  id: string
  checklistItemId: string
  mechanicId: string
  startedAt: string
  stoppedAt: string | null
  durationSeconds: number | null
  notes: string | null
  createdAt: string
}

export interface DbJobCardPart {
  id: string
  garage_id: string
  job_card_id: string
  part_id: string | null
  part_name: string
  part_number: string | null
  manufacturer: string | null
  category: string | null
  status: JobCardPartStatus
  quantity_requested: number
  quantity_used: number
  quantity_returned: number
  unit_cost: number
  unit_price: number
  total_price: number
  source: string
  notes: string | null
  requested_by: string | null
  used_by: string | null
  created_at: string
  updated_at: string
  deleted_at: string | null
  // Enhanced cost tracking fields
  estimated_unit_price?: number
  actual_unit_price?: number
  price_variance?: number
  is_price_override?: boolean
  price_override_reason?: string | null
  core_charge_amount?: number
  core_credit_amount?: number
  has_core_charge?: boolean
  disposal_fee_amount?: number
  has_disposal_fee?: boolean
}

export interface JobCardPartData {
  id: string
  jobCardId: string
  partId: string | null
  partName: string
  partNumber: string | null
  manufacturer: string | null
  status: PartStatus
  quantityAllocated: number
  quantityUsed: number
  quantityReturned: number
  unitPrice: number
  totalPrice: number
  source: string
  notes: string | null
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface DbJobCardComment {
  id: string
  job_card_id: string
  employee_id: string | null
  comment_text: string
  comment_type: string
  is_visible_to_customer: boolean
  created_at: string
  updated_at: string
  deleted_at: string | null
}

export interface JobCardCommentData {
  id: string
  jobCardId: string
  employeeId: string | null
  commentText: string
  commentType: string
  isVisibleToCustomer: boolean
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export interface DbJobCardAttachment {
  id: string
  job_card_id: string
  file_name: string
  file_url: string
  file_type: string | null
  file_size: number | null
  category: string
  description: string | null
  uploaded_by: string | null
  created_at: string
  deleted_at: string | null
}

export interface JobCardAttachmentData {
  id: string
  jobCardId: string
  fileName: string
  fileUrl: string
  fileType: string | null
  fileSize: number | null
  category: string
  description: string | null
  uploadedBy: string | null
  createdAt: string
  deletedAt: string | null
}

export interface CreateJobCardInput {
  garageId: string
  customerId: string
  vehicleId: string
  jobType: JobType
  priority: Priority
  status?: JobCardStatus
  customerComplaint?: string
  workRequested?: string
  customerNotes?: string
  currentMileage?: number
  promisedDate?: string
  promisedTime?: string
  leadMechanicId?: string
  technicianNotes?: string
  checklistItems?: Omit<ChecklistItemData, 'id' | 'jobCardId' | 'createdAt' | 'updatedAt' | 'deletedAt'>[]
  parts?: JobCardPartInput[]
  // Required fields from database schema
  customerName: string
  customerPhone: string
  customerEmail?: string
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleLicensePlate: string
  vehicleVin?: string
  serviceAdvisorId: string
  createdBy: string
}

export interface JobCardFilters {
  status?: JobCardStatus
  mechanicId?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}

export interface JobCardWithRelations extends JobCardData {
  customer: {
    id: string
    firstName: string
    lastName: string
    phoneNumber: string
    email: string | null
  }
  vehicle: {
    id: string
    make: string
    model: string
    year: number
    licensePlate: string
    vin: string | null
    color: string | null
  }
  leadMechanic: {
    id: string
    firstName: string
    lastName: string
  } | null
  checklistItems: ChecklistItemData[]
  parts: JobCardPartData[]
}

// ============================================================================
// TRANSFORM FUNCTIONS
// ============================================================================

function transformJobCardData(dbJobCard: DbJobCard): JobCardData {
  return {
    id: dbJobCard.id,
    jobCardNumber: dbJobCard.job_card_number,
    garageId: dbJobCard.garage_id,
    customerId: dbJobCard.customer_id,
    vehicleId: dbJobCard.vehicle_id,
    jobType: dbJobCard.job_type,
    priority: dbJobCard.priority,
    status: dbJobCard.status,
    customerComplaint: dbJobCard.customer_complaint,
    workRequested: dbJobCard.work_requested,
    customerNotes: dbJobCard.customer_notes,
    currentMileage: dbJobCard.current_mileage,
    reportedIssue: null, // Not in current schema
    promisedDate: dbJobCard.promised_date,
    promisedTime: dbJobCard.promised_time,
    actualCompletionDate: dbJobCard.actual_completion_date,
    leadMechanicId: dbJobCard.lead_mechanic_id,
    laborHours: 0, // Not tracked in current schema
    laborCost: Number(dbJobCard.estimated_labor_cost) || 0,
    partsCost: Number(dbJobCard.estimated_parts_cost) || 0,
    totalCost: (Number(dbJobCard.estimated_labor_cost) || 0) + (Number(dbJobCard.estimated_parts_cost) || 0),
    totalChecklistItems: dbJobCard.total_checklist_items,
    completedChecklistItems: dbJobCard.completed_checklist_items,
    progressPercentage: dbJobCard.progress_percentage,
    technicianNotes: dbJobCard.technician_notes,
    serviceAdvisorNotes: dbJobCard.service_advisor_notes,
    qualityCheckNotes: dbJobCard.quality_check_notes,
    createdAt: dbJobCard.created_at,
    updatedAt: dbJobCard.updated_at,
    deletedAt: dbJobCard.deleted_at,
  }
}

function jobCardToDbInput(input: CreateJobCardInput): Omit<DbJobCard, 'id' | 'job_card_number' | 'labor_hours' | 'labor_cost' | 'parts_cost' | 'total_cost' | 'total_checklist_items' | 'completed_checklist_items' | 'progress_percentage' | 'created_at' | 'updated_at' | 'deleted_at'> {
  return {
    garage_id: input.garageId,
    customer_id: input.customerId,
    customer_name: input.customerName,
    customer_phone: input.customerPhone,
    customer_email: input.customerEmail ?? null,
    vehicle_id: input.vehicleId,
    vehicle_make: input.vehicleMake,
    vehicle_model: input.vehicleModel,
    vehicle_year: input.vehicleYear,
    vehicle_license_plate: input.vehicleLicensePlate,
    vehicle_vin: input.vehicleVin ?? null,
    current_mileage: input.currentMileage ?? null,
    job_type: input.jobType,
    priority: input.priority,
    status: input.status ?? 'draft',
    customer_complaint: input.customerComplaint ?? '',
    work_requested: input.workRequested ?? '',
    customer_notes: input.customerNotes ?? null,
    technician_notes: input.technicianNotes ?? null,
    service_advisor_notes: null,
    quality_check_notes: null,
    promised_date: input.promisedDate ?? null,
    promised_time: input.promisedTime ?? null,
    actual_completion_date: null,
    service_advisor_id: input.serviceAdvisorId,
    lead_mechanic_id: input.leadMechanicId ?? null,
    created_by: input.createdBy,
    estimated_labor_cost: 0,
    estimated_parts_cost: 0,
  }
}

function transformChecklistItem(dbItem: DbChecklistItem): ChecklistItemData {
  return {
    id: dbItem.id,
    jobCardId: dbItem.job_card_id,
    mechanicId: dbItem.mechanic_id,
    itemName: dbItem.item_name,
    description: dbItem.description,
    category: dbItem.category,
    status: dbItem.status,
    priority: dbItem.priority,
    estimatedMinutes: dbItem.estimated_minutes,
    actualMinutes: dbItem.actual_minutes,
    isTimerRunning: dbItem.is_timer_running,
    timerStartedAt: dbItem.timer_started_at,
    totalTimeSpent: dbItem.total_time_spent,
    laborRate: Number(dbItem.labor_rate),
    laborCost: Number(dbItem.labor_cost),
    displayOrder: dbItem.display_order,
    mechanicNotes: dbItem.mechanic_notes,
    notes: dbItem.notes,
    createdAt: dbItem.created_at,
    updatedAt: dbItem.updated_at,
    completedAt: dbItem.completed_at,
    deletedAt: dbItem.deleted_at,
  }
}

function transformTimeEntry(dbEntry: DbTimeEntry): TimeEntryData {
  return {
    id: dbEntry.id,
    checklistItemId: dbEntry.checklist_item_id,
    mechanicId: dbEntry.mechanic_id,
    startedAt: dbEntry.started_at,
    stoppedAt: dbEntry.stopped_at,
    durationSeconds: dbEntry.duration_seconds,
    notes: dbEntry.notes,
    createdAt: dbEntry.created_at,
  }
}

function transformJobCardPart(dbPart: DbJobCardPart): JobCardPartData {
  return {
    id: dbPart.id,
    jobCardId: dbPart.job_card_id,
    partId: dbPart.part_id,
    partName: dbPart.part_name,
    partNumber: dbPart.part_number,
    manufacturer: dbPart.manufacturer,
    status: dbPart.status,
    quantityAllocated: dbPart.quantity_requested,
    quantityUsed: dbPart.quantity_used,
    quantityReturned: dbPart.quantity_returned,
    unitPrice: Number(dbPart.unit_price),
    totalPrice: Number(dbPart.total_price),
    source: dbPart.source,
    notes: dbPart.notes,
    createdAt: dbPart.created_at,
    updatedAt: dbPart.updated_at,
    deletedAt: dbPart.deleted_at,
  }
}

function transformComment(dbComment: DbJobCardComment): JobCardCommentData {
  return {
    id: dbComment.id,
    jobCardId: dbComment.job_card_id,
    employeeId: dbComment.employee_id,
    commentText: dbComment.comment_text,
    commentType: dbComment.comment_type,
    isVisibleToCustomer: dbComment.is_visible_to_customer,
    createdAt: dbComment.created_at,
    updatedAt: dbComment.updated_at,
    deletedAt: dbComment.deleted_at,
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all job cards for a garage with optional filters
 */
export async function getJobCardsByGarageId(
  garageId: string,
  filters: JobCardFilters = {}
): Promise<JobCardData[]> {
  const supabase = await createClient()

  let query = supabase
    .from('job_cards')
    .select('*')
    .eq('garage_id', garageId)
    .order('created_at', { ascending: false })

  // Apply filters
  if (filters.status) {
    query = query.eq('status', filters.status)
  }

  if (filters.mechanicId) {
    query = query.eq('lead_mechanic_id', filters.mechanicId)
  }

  if (filters.customerId) {
    query = query.eq('customer_id', filters.customerId)
  }

  if (filters.dateFrom) {
    query = query.gte('created_at', filters.dateFrom)
  }

  if (filters.dateTo) {
    query = query.lte('created_at', filters.dateTo)
  }

  if (filters.search) {
    query = query.or(`job_card_number.ilike.%${filters.search}%,customer_complaint.ilike.%${filters.search}%,work_requested.ilike.%${filters.search}%`)
  }

  const { data, error } = await query

  if (error) {
    console.error('Error fetching job cards:', error)
    throw new Error(`Failed to fetch job cards: ${error.message}`)
  }

  return (data || []).map(transformJobCardData)
}

/**
 * Get a single job card by ID with relations
 */
export async function getJobCardById(jobCardId: string): Promise<JobCardWithRelations | null> {
  const supabase = createAdminClient()

  // Get job card
  const { data: jobCard, error: jobCardError } = await supabase
    .from('job_cards')
    .select('*')
    .eq('id', jobCardId)
    .maybeSingle()

  if (jobCardError) {
    console.error('Error fetching job card:', jobCardError)
    throw new Error(`Failed to fetch job card: ${jobCardError.message}`)
  }

  if (!jobCard) {
    return null
  }

  // Get customer
  const { data: customer } = await supabase
    .from('customers')
    .select('id, first_name, last_name, phone_number, email')
    .eq('id', jobCard.customer_id)
    .single()

  // Get vehicle
  const { data: vehicle } = await supabase
    .from('customer_vehicles')
    .select('id, make, model, year, license_plate, vin, color')
    .eq('id', jobCard.vehicle_id)
    .single()

  // Get lead mechanic
  let leadMechanic = null
  if (jobCard.lead_mechanic_id) {
    const { data: mechanic } = await supabase
      .from('employees')
      .select('id, first_name, last_name')
      .eq('id', jobCard.lead_mechanic_id)
      .single()

    if (mechanic) {
      leadMechanic = {
        id: mechanic.id,
        firstName: mechanic.first_name,
        lastName: mechanic.last_name,
      }
    }
  }

  // Get checklist items
  const { data: checklistItems } = await supabase
    .from('job_card_checklist_items')
    .select('*')
    .eq('job_card_id', jobCardId)
    .order('display_order', { ascending: true })

  // Get parts
  const { data: parts } = await supabase
    .from('job_card_parts')
    .select('*')
    .eq('job_card_id', jobCardId)
    .order('created_at', { ascending: false })

  return {
    ...transformJobCardData(jobCard),
    customer: {
      id: customer?.id || '',
      firstName: customer?.first_name || '',
      lastName: customer?.last_name || '',
      phoneNumber: customer?.phone_number || '',
      email: customer?.email || null,
    },
    vehicle: {
      id: vehicle?.id || '',
      make: vehicle?.make || '',
      model: vehicle?.model || '',
      year: vehicle?.year || 0,
      licensePlate: vehicle?.license_plate || '',
      vin: vehicle?.vin || null,
      color: vehicle?.color || null,
    },
    leadMechanic,
    checklistItems: (checklistItems || []).map(transformChecklistItem),
    parts: (parts || []).map(transformJobCardPart),
  }
}

/**
 * Create a new job card with checklist items and parts
 */
export async function createJobCard(
  input: CreateJobCardInput
): Promise<{ success: boolean; error?: string; jobCard?: JobCardData }> {
  const supabase = createAdminClient()

  try {
    // Create job card
    const dbInput = jobCardToDbInput(input)
    const { data: jobCardData, error: jobCardError } = await supabase
      .from('job_cards')
      .insert([dbInput])
      .select()
      .single()

    if (jobCardError) {
      console.error('Error creating job card:', jobCardError)
      return {
        success: false,
        error: `Failed to create job card: ${jobCardError.message}`,
      }
    }

    // Create checklist items if provided
    if (input.checklistItems && input.checklistItems.length > 0) {
      const itemsToInsert = input.checklistItems.map((item) => ({
        job_card_id: jobCardData.id,
        mechanic_id: item.mechanicId || jobCardData.lead_mechanic_id,
        item_name: item.itemName,
        description: item.description || null,
        category: item.category || null,
        status: item.status,
        priority: item.priority,
        estimated_minutes: item.estimatedMinutes,
        labor_rate: item.laborRate,
        display_order: item.displayOrder,
        notes: item.notes || null,
      }))

      const { error: itemsError } = await supabase
        .from('job_card_checklist_items')
        .insert(itemsToInsert)

      if (itemsError) {
        console.error('Error creating checklist items:', itemsError)
        // Job card was created but items failed
        console.error('Job card created successfully but checklist items failed')
      }
    }

    // Allocate parts if provided
    if (input.parts && input.parts.length > 0) {
      try {
        // Prepare parts data for RPC function
        const partsData = input.parts.map(part => ({
          partId: part.partId,
          partName: part.partName,
          partNumber: part.partNumber,
          quantity: part.quantity,
          unitPrice: part.unitPrice,
          totalPrice: part.totalPrice,
          manufacturer: part.manufacturer || null,
          category: part.category || null,
        }))

        // Call the RPC function
        const { data: allocationResult, error: allocationError } = await supabase.rpc('allocate_parts_to_job_card', {
          p_job_card_id: jobCardData.id,
          p_parts: JSON.stringify(partsData),
          p_user_id: input.createdBy,
          p_user_name: null, // Could fetch user name if needed
        })

        if (allocationError) {
          console.error('Error allocating parts:', allocationError)
          // Job card was created but parts allocation failed
          console.error('Job card created successfully but parts allocation failed')
        } else if (allocationResult) {
          const result = allocationResult as { success: boolean; error?: string; data?: any }
          if (!result.success) {
            console.error('Parts allocation returned error:', result.error)
          } else {
            console.log('Parts allocated successfully:', result.data)
          }
        }
      } catch (partsError) {
        console.error('Exception in parts allocation:', partsError)
        // Job card was created but parts allocation failed
        console.error('Job card created successfully but parts allocation threw exception')
      }
    }

    return {
      success: true,
      jobCard: transformJobCardData(jobCardData),
    }
  } catch (error) {
    console.error('Error in createJobCard:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating job card',
    }
  }
}

/**
 * Update an existing job card
 */
export async function updateJobCard(
  jobCardId: string,
  updates: Partial<Omit<JobCardData, 'id' | 'jobCardNumber' | 'garageId' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; error?: string; jobCard?: JobCardData }> {
  const supabase = createAdminClient()

  // Transform updates to DB format
  const dbUpdates: Record<string, any> = {}
  if (updates.customerId !== undefined) dbUpdates.customer_id = updates.customerId
  if (updates.vehicleId !== undefined) dbUpdates.vehicle_id = updates.vehicleId
  if (updates.jobType !== undefined) dbUpdates.job_type = updates.jobType
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.customerComplaint !== undefined) dbUpdates.customer_complaint = updates.customerComplaint
  if (updates.workRequested !== undefined) dbUpdates.work_requested = updates.workRequested
  if (updates.customerNotes !== undefined) dbUpdates.customer_notes = updates.customerNotes
  if (updates.currentMileage !== undefined) dbUpdates.current_mileage = updates.currentMileage
  if (updates.promisedDate !== undefined) dbUpdates.promised_date = updates.promisedDate
  if (updates.promisedTime !== undefined) dbUpdates.promised_time = updates.promisedTime
  if (updates.leadMechanicId !== undefined) dbUpdates.lead_mechanic_id = updates.leadMechanicId
  if (updates.technicianNotes !== undefined) dbUpdates.technician_notes = updates.technicianNotes
  if (updates.serviceAdvisorNotes !== undefined) dbUpdates.service_advisor_notes = updates.serviceAdvisorNotes
  if (updates.qualityCheckNotes !== undefined) dbUpdates.quality_check_notes = updates.qualityCheckNotes

  const { data: jobCardData, error } = await supabase
    .from('job_cards')
    .update(dbUpdates)
    .eq('id', jobCardId)
    .select()
    .single()

  if (error) {
    console.error('Error updating job card:', error)
    return {
      success: false,
      error: `Failed to update job card: ${error.message}`,
    }
  }

  return {
    success: true,
    jobCard: transformJobCardData(jobCardData),
  }
}

/**
 * Update job card status with history tracking
 */
export async function updateJobCardStatus(
  jobCardId: string,
  newStatus: JobCardStatus,
  userId: string,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  try {
    // Get current status
    const { data: currentJobCard } = await supabase
      .from('job_cards')
      .select('status')
      .eq('id', jobCardId)
      .single()

    if (!currentJobCard) {
      return {
        success: false,
        error: 'Job card not found',
      }
    }

    const oldStatus = currentJobCard.status

    // Update status
    const { error: updateError } = await supabase
      .from('job_cards')
      .update({ status: newStatus })
      .eq('id', jobCardId)

    if (updateError) {
      console.error('Error updating status:', updateError)
      return {
        success: false,
        error: `Failed to update status: ${updateError.message}`,
      }
    }

    // Record status change in history
    const { error: historyError } = await supabase
      .from('job_card_status_history')
      .insert([{
        job_card_id: jobCardId,
        old_status: oldStatus,
        new_status: newStatus,
        changed_by: userId,
        change_reason: reason || null,
      }])

    if (historyError) {
      console.error('Error recording status history:', historyError)
      // Status was updated but history failed - log this
      console.error('Status updated successfully but history recording failed')
    }

    return { success: true }
  } catch (error) {
    console.error('Error in updateJobCardStatus:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating status',
    }
  }
}

/**
 * Soft delete a job card
 */
export async function deleteJobCard(jobCardId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('job_cards')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', jobCardId)

  if (error) {
    console.error('Error deleting job card:', error)
    return {
      success: false,
      error: `Failed to delete job card: ${error.message}`,
    }
  }

  return { success: true }
}

// ============================================================================
// CHECKLIST ITEMS
// ============================================================================

/**
 * Get all checklist items for a job card
 */
export async function getChecklistItems(jobCardId: string): Promise<ChecklistItemData[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_card_checklist_items')
    .select('*')
    .eq('job_card_id', jobCardId)
    .is('deleted_at', null)
    .order('display_order', { ascending: true })

  if (error) {
    console.error('Error fetching checklist items:', error)
    throw new Error(`Failed to fetch checklist items: ${error.message}`)
  }

  return (data || []).map(transformChecklistItem)
}

/**
 * Create a new checklist item
 */
export async function createChecklistItem(
  jobCardId: string,
  input: {
    mechanicId?: string | null
    itemName: string
    description?: string | null
    category?: string | null
    status?: ChecklistItemStatus
    priority?: Priority
    estimatedMinutes?: number
    laborRate?: number
    displayOrder?: number
    notes?: string | null
  }
): Promise<{ success: boolean; error?: string; checklistItem?: ChecklistItemData }> {
  const supabase = createAdminClient()

  const dbInput = {
    job_card_id: jobCardId,
    mechanic_id: input.mechanicId || null,
    item_name: input.itemName,
    description: input.description || null,
    category: input.category || null,
    status: input.status || 'pending',
    priority: input.priority || 'medium',
    estimated_minutes: input.estimatedMinutes || 0,
    actual_minutes: 0,
    is_timer_running: false,
    timer_started_at: null,
    total_time_spent: 0,
    labor_rate: input.laborRate || 0,
    labor_cost: 0,
    display_order: input.displayOrder || 0,
    mechanic_notes: null,
    notes: input.notes || null,
    completed_at: null,
  }

  const { data, error } = await supabase
    .from('job_card_checklist_items')
    .insert([dbInput])
    .select()
    .single()

  if (error) {
    console.error('Error creating checklist item:', error)
    return {
      success: false,
      error: `Failed to create checklist item: ${error.message}`,
    }
  }

  return {
    success: true,
    checklistItem: transformChecklistItem(data),
  }
}

/**
 * Update checklist item
 */
export async function updateChecklistItem(
  checklistItemId: string,
  updates: Partial<Omit<ChecklistItemData, 'id' | 'jobCardId' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; error?: string; checklistItem?: ChecklistItemData }> {
  const supabase = createAdminClient()

  const dbUpdates: Record<string, any> = {}
  if (updates.itemName !== undefined) dbUpdates.item_name = updates.itemName
  if (updates.description !== undefined) dbUpdates.description = updates.description
  if (updates.category !== undefined) dbUpdates.category = updates.category
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.priority !== undefined) dbUpdates.priority = updates.priority
  if (updates.estimatedMinutes !== undefined) dbUpdates.estimated_minutes = updates.estimatedMinutes
  if (updates.laborRate !== undefined) dbUpdates.labor_rate = updates.laborRate
  if (updates.displayOrder !== undefined) dbUpdates.display_order = updates.displayOrder
  if (updates.mechanicNotes !== undefined) dbUpdates.mechanic_notes = updates.mechanicNotes
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes

  const { data, error } = await supabase
    .from('job_card_checklist_items')
    .update(dbUpdates)
    .eq('id', checklistItemId)
    .select()
    .single()

  if (error) {
    console.error('Error updating checklist item:', error)
    return {
      success: false,
      error: `Failed to update checklist item: ${error.message}`,
    }
  }

  return {
    success: true,
    checklistItem: transformChecklistItem(data),
  }
}

// ============================================================================
// TIME TRACKING
// ============================================================================

/**
 * Start timer for a checklist item
 */
export async function startTimeEntry(
  checklistItemId: string,
  mechanicId: string
): Promise<{ success: boolean; error?: string; timeEntry?: TimeEntryData }> {
  const supabase = createAdminClient()

  try {
    // First, stop any running timer for this item
    await stopTimerForChecklistItem(checklistItemId)

    // Update checklist item to start timer
    const { error: updateError } = await supabase
      .from('job_card_checklist_items')
      .update({
        is_timer_running: true,
        timer_started_at: new Date().toISOString(),
      })
      .eq('id', checklistItemId)

    if (updateError) {
      throw updateError
    }

    // Create new time entry
    const { data, error } = await supabase
      .from('job_card_time_entries')
      .insert([{
        checklist_item_id: checklistItemId,
        mechanic_id: mechanicId,
        started_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) {
      throw error
    }

    return {
      success: true,
      timeEntry: transformTimeEntry(data),
    }
  } catch (error) {
    console.error('Error starting timer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start timer',
    }
  }
}

/**
 * Stop timer for a time entry
 */
export async function stopTimeEntry(
  timeEntryId: string
): Promise<{ success: boolean; error?: string; timeEntry?: TimeEntryData }> {
  const supabase = createAdminClient()

  try {
    const stoppedAt = new Date().toISOString()

    // Get time entry to calculate duration
    const { data: existingEntry } = await supabase
      .from('job_card_time_entries')
      .select('*')
      .eq('id', timeEntryId)
      .single()

    if (!existingEntry) {
      return {
        success: false,
        error: 'Time entry not found',
      }
    }

    // Calculate duration
    const startedAt = new Date(existingEntry.started_at)
    const stoppedDate = new Date(stoppedAt)
    const durationSeconds = Math.floor((stoppedDate.getTime() - startedAt.getTime()) / 1000)

    // Update time entry
    const { data, error } = await supabase
      .from('job_card_time_entries')
      .update({
        stopped_at: stoppedAt,
        duration_seconds: durationSeconds,
      })
      .eq('id', timeEntryId)
      .select()
      .single()

    if (error) {
      throw error
    }

    // Update checklist item - stop timer and add to total time
    const { data: checklistItem } = await supabase
      .from('job_card_checklist_items')
      .select('total_time_spent')
      .eq('id', existingEntry.checklist_item_id)
      .single()

    if (checklistItem) {
      await supabase
        .from('job_card_checklist_items')
        .update({
          is_timer_running: false,
          timer_started_at: null,
          total_time_spent: (checklistItem.total_time_spent || 0) + durationSeconds,
          actual_minutes: Math.floor(((checklistItem.total_time_spent || 0) + durationSeconds) / 60),
        })
        .eq('id', existingEntry.checklist_item_id)
    }

    return {
      success: true,
      timeEntry: transformTimeEntry(data),
    }
  } catch (error) {
    console.error('Error stopping timer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to stop timer',
    }
  }
}

/**
 * Stop timer for a checklist item (helper function)
 */
async function stopTimerForChecklistItem(checklistItemId: string): Promise<void> {
  const supabase = createAdminClient()

  // Get running time entry
  const { data: runningEntry } = await supabase
    .from('job_card_time_entries')
    .select('*')
    .eq('checklist_item_id', checklistItemId)
    .is('stopped_at', null)
    .single()

  if (runningEntry) {
    await stopTimeEntry(runningEntry.id)
  }
}

// ============================================================================
// PARTS
// ============================================================================

/**
 * Get all parts for a job card
 */
export async function getJobCardParts(jobCardId: string): Promise<JobCardPartData[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_card_parts')
    .select('*')
    .eq('job_card_id', jobCardId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching parts:', error)
    throw new Error(`Failed to fetch parts: ${error.message}`)
  }

  return (data || []).map(transformJobCardPart)
}

/**
 * Add parts to a job card
 */
export async function addJobCardPart(
  jobCardId: string,
  input: Omit<JobCardPartData, 'id' | 'jobCardId' | 'createdAt' | 'updatedAt' | 'deletedAt'>
): Promise<{ success: boolean; error?: string; part?: JobCardPartData }> {
  const supabase = createAdminClient()

  const dbInput = {
    job_card_id: jobCardId,
    part_id: input.partId,
    part_name: input.partName,
    part_number: input.partNumber || null,
    manufacturer: input.manufacturer || null,
    status: input.status || 'allocated',
    quantity_allocated: input.quantityAllocated || 0,
    quantity_used: input.quantityUsed || 0,
    quantity_returned: input.quantityReturned || 0,
    unit_price: input.unitPrice || 0,
    source: input.source || 'inventory',
    notes: input.notes || null,
  }

  const { data, error } = await supabase
    .from('job_card_parts')
    .insert([dbInput])
    .select()
    .single()

  if (error) {
    console.error('Error adding part:', error)
    return {
      success: false,
      error: `Failed to add part: ${error.message}`,
    }
  }

  return {
    success: true,
    part: transformJobCardPart(data),
  }
}

// ============================================================================
// COMMENTS
// ============================================================================

/**
 * Get comments for a job card
 */
export async function getJobCardComments(jobCardId: string): Promise<JobCardCommentData[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('job_card_comments')
    .select('*')
    .eq('job_card_id', jobCardId)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    throw new Error(`Failed to fetch comments: ${error.message}`)
  }

  return (data || []).map(transformComment)
}

/**
 * Add a comment to a job card
 */
export async function addJobCardComment(
  jobCardId: string,
  employeeId: string | null,
  commentText: string,
  commentType: string = 'internal',
  isVisibleToCustomer: boolean = false
): Promise<{ success: boolean; error?: string; comment?: JobCardCommentData }> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('job_card_comments')
    .insert([{
      job_card_id: jobCardId,
      employee_id: employeeId,
      comment_text: commentText,
      comment_type: commentType,
      is_visible_to_customer: isVisibleToCustomer,
    }])
    .select()
    .single()

  if (error) {
    console.error('Error adding comment:', error)
    return {
      success: false,
      error: `Failed to add comment: ${error.message}`,
    }
  }

  return {
    success: true,
    comment: transformComment(data),
  }
}

// ============================================================================
// PARTS STATUS MANAGEMENT
// ============================================================================

/**
 * Update job card part status with validation
 *
 * This function validates status transitions and updates the part record.
 * It can also record actual usage and costs when moving to 'used' status.
 *
 * Valid transitions:
 * - allocated -> ordered, used, returned, cancelled
 * - ordered -> received, cancelled
 * - received -> used, returned, cancelled
 * - used -> returned
 * - returned -> (terminal)
 * - cancelled -> (terminal)
 */
export async function updateJobCardPartStatus(
  jobCardPartId: string,
  newStatus: JobCardPartStatus,
  userId: string,
  quantityUsed?: number,
  actualUnitPrice?: number
): Promise<{ success: boolean; error?: string; part?: DbJobCardPart }> {
  const supabase = createAdminClient()

  try {
    // Get current part record
    const { data: currentPart, error: fetchError } = await supabase
      .from('job_card_parts')
      .select('*')
      .eq('id', jobCardPartId)
      .single()

    if (fetchError || !currentPart) {
      return {
        success: false,
        error: 'Job card part not found',
      }
    }

    // Define valid status transitions
    const validTransitions: Record<string, string[]> = {
      allocated: ['ordered', 'used', 'returned', 'cancelled'],
      ordered: ['received', 'cancelled'],
      received: ['used', 'returned', 'cancelled'],
      used: ['returned'],
      returned: [], // Terminal state
      cancelled: [], // Terminal state
    }

    // Validate transition
    const allowedTransitions = validTransitions[currentPart.status] || []
    if (!allowedTransitions.includes(newStatus)) {
      return {
        success: false,
        error: `Invalid status transition from ${currentPart.status} to ${newStatus}. Allowed: ${allowedTransitions.join(', ')}`,
      }
    }

    // Call the RPC function to update status
    const { data: updateResult, error: updateError } = await supabase.rpc('update_job_card_part_status', {
      p_job_card_part_id: jobCardPartId,
      p_new_status: newStatus,
      p_quantity_used: quantityUsed,
      p_actual_unit_price: actualUnitPrice,
      p_user_id: userId,
    })

    if (updateError) {
      console.error('Error updating part status:', updateError)
      return {
        success: false,
        error: `Failed to update part status: ${updateError.message}`,
      }
    }

    const result = updateResult as { success: boolean; error?: string }

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to update part status',
      }
    }

    // Fetch and return the updated part
    const { data: updatedPart, error: fetchUpdatedError } = await supabase
      .from('job_card_parts')
      .select('*')
      .eq('id', jobCardPartId)
      .single()

    if (fetchUpdatedError || !updatedPart) {
      return {
        success: true,
        error: undefined,
      }
    }

    return {
      success: true,
      part: updatedPart as DbJobCardPart,
    }
  } catch (error) {
    console.error('Error in updateJobCardPartStatus:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while updating part status',
    }
  }
}

/**
 * Check parts availability before allocation
 *
 * This function checks if the requested quantities are available in stock.
 * Returns availability status for each part.
 */
export async function checkPartsAvailability(
  parts: Array<{ partId: string; quantity: number }>,
  garageId: string
): Promise<Array<{ partId: string; available: boolean; currentStock: number; requestedQuantity: number }>> {
  const supabase = createAdminClient()

  try {
    const results: Array<{
      partId: string
      available: boolean
      currentStock: number
      requestedQuantity: number
    }> = []

    for (const part of parts) {
      // Fetch part stock information
      const { data: partData, error } = await supabase
        .from('parts')
        .select('on_hand_stock, warehouse_stock')
        .eq('id', part.partId)
        .eq('garage_id', garageId)
        .single()

      if (error || !partData) {
        // Part not found - treat as unavailable
        results.push({
          partId: part.partId,
          available: false,
          currentStock: 0,
          requestedQuantity: part.quantity,
        })
        continue
      }

      const totalStock = (partData.on_hand_stock || 0) + (partData.warehouse_stock || 0)

      results.push({
        partId: part.partId,
        available: totalStock >= part.quantity,
        currentStock: totalStock,
        requestedQuantity: part.quantity,
      })
    }

    return results
  } catch (error) {
    console.error('Error in checkPartsAvailability:', error)
    throw error
  }
}

/**
 * Allocate additional parts to an existing job card
 *
 * This function allows adding parts to a job card after initial creation.
 * Uses the same RPC function as createJobCard for consistency.
 */
export async function allocatePartsToJobCard(
  jobCardId: string,
  parts: JobCardPartInput[],
  userId: string,
  userName?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  const supabase = createAdminClient()

  try {
    // Prepare parts data for RPC function
    const partsData = parts.map(part => ({
      partId: part.partId,
      partName: part.partName,
      partNumber: part.partNumber,
      quantity: part.quantity,
      unitPrice: part.unitPrice,
      totalPrice: part.totalPrice,
      manufacturer: part.manufacturer || null,
      category: part.category || null,
    }))

    // Call the RPC function
    const { data: allocationResult, error: allocationError } = await supabase.rpc('allocate_parts_to_job_card', {
      p_job_card_id: jobCardId,
      p_parts: JSON.stringify(partsData),
      p_user_id: userId,
      p_user_name: userName || null,
    })

    if (allocationError) {
      console.error('Error allocating parts:', allocationError)
      return {
        success: false,
        error: `Failed to allocate parts: ${allocationError.message}`,
      }
    }

    const result = allocationResult as { success: boolean; error?: string; data?: any }

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to allocate parts',
      }
    }

    return {
      success: true,
      data: result.data,
    }
  } catch (error) {
    console.error('Error in allocatePartsToJobCard:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while allocating parts',
    }
  }
}

/**
 * Deallocate parts from a job card (return to inventory)
 *
 * This function removes parts from a job card and returns them to inventory
 * if they were not yet used.
 */
export async function deallocatePartsFromJobCard(
  jobCardPartId: string,
  quantity?: number,
  userId?: string,
  userName?: string
): Promise<{ success: boolean; error?: string; data?: any }> {
  const supabase = createAdminClient()

  try {
    // Call the RPC function
    const { data: deallocationResult, error: deallocationError } = await supabase.rpc('deallocate_parts_from_job_card', {
      p_job_card_part_id: jobCardPartId,
      p_quantity: quantity || null,
      p_user_id: userId || null,
      p_user_name: userName || null,
    })

    if (deallocationError) {
      console.error('Error deallocating parts:', deallocationError)
      return {
        success: false,
        error: `Failed to deallocate parts: ${deallocationError.message}`,
      }
    }

    const result = deallocationResult as { success: boolean; error?: string; data?: any }

    if (!result.success) {
      return {
        success: false,
        error: result.error || 'Failed to deallocate parts',
      }
    }

    return {
      success: true,
      data: result.data,
    }
  } catch (error) {
    console.error('Error in deallocatePartsFromJobCard:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while deallocating parts',
    }
  }
}

/**
 * Get inventory transaction history for a job card
 *
 * This function returns the complete audit trail of all parts movements
 * for a specific job card.
 */
export async function getJobCardTransactionHistory(
  jobCardId: string
): Promise<any[]> {
  const supabase = createAdminClient()

  try {
    // Call the RPC function to get transaction history
    const { data, error } = await supabase.rpc('get_job_card_transaction_history', {
      p_job_card_id: jobCardId,
    })

    if (error) {
      console.error('Error fetching transaction history:', error)
      throw new Error(`Failed to fetch transaction history: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Error in getJobCardTransactionHistory:', error)
    throw error
  }
}
