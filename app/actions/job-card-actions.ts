'use server'

import {
  createJobCard,
  getJobCardsByGarageId,
  getJobCardById,
  updateJobCard,
  deleteJobCard,
  getChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  type CreateJobCardInput,
  type UpdateJobCardInput,
  type JobCardData,
  type JobCardWithRelations,
  type ChecklistItemData,
  type JobCardFilters,
} from '@/lib/supabase/job-card-queries'

// Re-export types for convenience
export type {
  CreateJobCardInput,
  UpdateJobCardInput,
  JobCardData,
  JobCardWithRelations,
  ChecklistItemData,
}

// ============================================================================
// JOB CARD ACTIONS
// ============================================================================

/**
 * Server action to create a new job card
 */
export async function createJobCardAction(input: CreateJobCardInput): Promise<{
  success: boolean
  error?: string
  jobCard?: JobCardData
}> {
  return await createJobCard(input)
}

/**
 * Server action to get all job cards for a garage
 */
export async function getJobCardsByGarageIdAction(
  garageId: string,
  filters?: JobCardFilters
): Promise<JobCardData[]> {
  return await getJobCardsByGarageId(garageId, filters)
}

/**
 * Server action to get a single job card by ID
 */
export async function getJobCardByIdAction(jobCardId: string): Promise<JobCardWithRelations | null> {
  return await getJobCardById(jobCardId)
}

/**
 * Server action to update a job card
 */
export async function updateJobCardAction(
  jobCardId: string,
  updates: UpdateJobCardInput
): Promise<{
  success: boolean
  error?: string
  jobCard?: JobCardData
}> {
  return await updateJobCard(jobCardId, updates)
}

/**
 * Server action to delete (soft delete) a job card
 */
export async function deleteJobCardAction(jobCardId: string): Promise<{
  success: boolean
  error?: string
}> {
  return await deleteJobCard(jobCardId)
}

// ============================================================================
// CHECKLIST ITEMS ACTIONS
// ============================================================================

/**
 * Server action to get all checklist items for a job card
 */
export async function getChecklistItemsAction(jobCardId: string): Promise<ChecklistItemData[]> {
  return await getChecklistItems(jobCardId)
}

/**
 * Server action to create a new checklist item
 */
export async function createChecklistItemAction(
  jobCardId: string,
  input: {
    mechanicId?: string | null
    itemName: string
    description?: string | null
    category?: string | null
    status?: 'pending' | 'in_progress' | 'completed' | 'skipped'
    priority?: 'low' | 'medium' | 'high' | 'urgent'
    estimatedMinutes?: number
    laborRate?: number
    displayOrder?: number
    notes?: string | null
  }
): Promise<{
  success: boolean
  error?: string
  checklistItem?: ChecklistItemData
}> {
  return await createChecklistItem(jobCardId, input)
}

/**
 * Server action to update a checklist item
 */
export async function updateChecklistItemAction(
  checklistItemId: string,
  updates: Partial<Omit<ChecklistItemData, 'id' | 'jobCardId' | 'createdAt' | 'updatedAt'>>
): Promise<{
  success: boolean
  error?: string
  checklistItem?: ChecklistItemData
}> {
  return await updateChecklistItem(checklistItemId, updates)
}
