import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * PATCH /api/job-cards/[id]/checklist/[checklistItemId]
 *
 * Updates a single checklist item (status, notes, etc.)
 *
 * Request Body:
 * - status (optional): Task status ('pending' | 'in-progress' | 'completed' | 'blocked')
 * - mechanicNotes (optional): Mechanic notes
 * - actualMinutes (optional): Actual time spent
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; checklistItemId: string } }
) {
  try {
    const { id: jobCardId, checklistItemId } = params
    const body = await request.json()

    console.log('📝 Updating checklist item:', checklistItemId, 'for job card:', jobCardId)

    // Validate request body
    const updateSchema = z.object({
      status: z.enum(['pending', 'in-progress', 'completed', 'blocked', 'skipped']).optional(),
      mechanicNotes: z.string().optional(),
      actualMinutes: z.number().int().min(0).optional(),
    })

    const validationResult = updateSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const updateData = validationResult.data

    const supabase = createAdminClient()

    // Verify checklist item exists and belongs to job card
    const { data: existingItem, error: fetchError } = await supabase
      .from('job_card_checklist_items')
      .select('*')
      .eq('id', checklistItemId)
      .eq('job_card_id', jobCardId)
      .single()

    if (fetchError || !existingItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const dbUpdateData: any = {
      updated_at: new Date().toISOString(),
    }

    if (updateData.status !== undefined) {
      dbUpdateData.status = updateData.status

      // Set timestamps based on status
      if (updateData.status === 'in-progress' && !existingItem.started_at) {
        dbUpdateData.started_at = new Date().toISOString()
      }
      if (updateData.status === 'completed' && !existingItem.completed_at) {
        dbUpdateData.completed_at = new Date().toISOString()
      }
      if (updateData.status === 'pending') {
        dbUpdateData.started_at = null
        dbUpdateData.completed_at = null
      }
    }

    if (updateData.mechanicNotes !== undefined) {
      dbUpdateData.mechanic_notes = updateData.mechanicNotes
    }

    if (updateData.actualMinutes !== undefined) {
      dbUpdateData.actual_minutes = updateData.actualMinutes
    }

    // Update checklist item
    const { data: updatedItem, error: updateError } = await supabase
      .from('job_card_checklist_items')
      .update(dbUpdateData)
      .eq('id', checklistItemId)
      .eq('job_card_id', jobCardId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update checklist item:', updateError)
      return NextResponse.json(
        { error: 'Failed to update checklist item', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Updated checklist item:', checklistItemId)

    // Transform database field names to camelCase for frontend
    const transformedItem = {
      id: updatedItem.id,
      itemName: updatedItem.item_name,
      description: updatedItem.description,
      status: updatedItem.status,
      priority: updatedItem.priority,
      category: updatedItem.category,
      estimatedMinutes: updatedItem.estimated_minutes || 0,
      actualMinutes: updatedItem.actual_minutes || 0,
      laborRate: updatedItem.labor_rate || 0,
      displayOrder: updatedItem.display_order || 0,
      mechanicId: updatedItem.mechanic_id,
      startedAt: updatedItem.started_at,
      completedAt: updatedItem.completed_at,
      mechanicNotes: updatedItem.mechanic_notes,
      subtasks: updatedItem.subtasks || [],
      linkedToCustomerIssues: updatedItem.linked_to_customer_issues || [],
      linkedToServiceScope: updatedItem.linked_to_service_scope || [],
      linkedToTechnicalDiagnosis: updatedItem.linked_to_technical_diagnosis || [],
    }

    return NextResponse.json({
      success: true,
      message: 'Checklist item updated successfully',
      checklistItem: transformedItem,
    })
  } catch (error) {
    console.error('❌ Error updating checklist item:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update checklist item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/job-cards/[id]/checklist/[checklistItemId]
 *
 * Fetches a single checklist item
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string; checklistItemId: string } }
) {
  try {
    const { id: jobCardId, checklistItemId } = params

    const supabase = createAdminClient()

    const { data: item, error } = await supabase
      .from('job_card_checklist_items')
      .select('*')
      .eq('id', checklistItemId)
      .eq('job_card_id', jobCardId)
      .single()

    if (error || !item) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      )
    }

    // Transform database field names to camelCase
    const transformedItem = {
      id: item.id,
      itemName: item.item_name,
      description: item.description,
      status: item.status,
      priority: item.priority,
      category: item.category,
      estimatedMinutes: item.estimated_minutes || 0,
      actualMinutes: item.actual_minutes || 0,
      laborRate: item.labor_rate || 0,
      displayOrder: item.display_order || 0,
      mechanicId: item.mechanic_id,
      startedAt: item.started_at,
      completedAt: item.completed_at,
      mechanicNotes: item.mechanic_notes,
      subtasks: item.subtasks || [],
      linkedToCustomerIssues: item.linked_to_customer_issues || [],
      linkedToServiceScope: item.linked_to_service_scope || [],
      linkedToTechnicalDiagnosis: item.linked_to_technical_diagnosis || [],
    }

    return NextResponse.json({
      success: true,
      checklistItem: transformedItem,
    })
  } catch (error) {
    console.error('❌ Error fetching checklist item:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch checklist item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
