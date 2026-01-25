import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * PATCH /api/job-cards/[id]/checklist/[checklistItemId]/subtasks/[subtaskId]
 *
 * Updates a single subtask (toggle completed, update name, etc.)
 *
 * Request Body:
 * - completed (optional): Boolean to toggle completion
 * - name (optional): Subtask name
 * - description (optional): Subtask description
 * - estimatedMinutes (optional): Estimated time
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; checklistItemId: string; subtaskId: string } }
) {
  try {
    const { id: jobCardId, checklistItemId, subtaskId } = params
    const body = await request.json()

    console.log('📝 Updating subtask:', subtaskId, 'for checklist item:', checklistItemId)

    // Validate request body
    const updateSchema = z.object({
      completed: z.boolean().optional(),
      name: z.string().optional(),
      description: z.string().optional(),
      estimatedMinutes: z.number().int().min(0).optional(),
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

    // Fetch existing checklist item
    const { data: existingItem, error: fetchError } = await supabase
      .from('job_card_checklist_items')
      .select('subtasks')
      .eq('id', checklistItemId)
      .eq('job_card_id', jobCardId)
      .single()

    if (fetchError || !existingItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      )
    }

    // Find and update the subtask
    const subtasks = existingItem.subtasks || []
    const subtaskIndex = subtasks.findIndex((st: any) => st.id === subtaskId)

    if (subtaskIndex === -1) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      )
    }

    // Update subtask fields
    const updatedSubtasks = [...subtasks]
    updatedSubtasks[subtaskIndex] = {
      ...updatedSubtasks[subtaskIndex],
      ...(updateData.completed !== undefined && { completed: updateData.completed }),
      ...(updateData.name !== undefined && { name: updateData.name }),
      ...(updateData.description !== undefined && { description: updateData.description }),
      ...(updateData.estimatedMinutes !== undefined && { estimatedMinutes: updateData.estimatedMinutes }),
    }

    // Update checklist item
    const { data: updatedItem, error: updateError } = await supabase
      .from('job_card_checklist_items')
      .update({
        subtasks: updatedSubtasks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', checklistItemId)
      .eq('job_card_id', jobCardId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update subtask:', updateError)
      return NextResponse.json(
        { error: 'Failed to update subtask', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Updated subtask:', subtaskId)

    return NextResponse.json({
      success: true,
      message: 'Subtask updated successfully',
      subtask: updatedSubtasks[subtaskIndex],
      checklistItem: {
        id: updatedItem.id,
        itemName: updatedItem.item_name,
        subtasks: updatedItem.subtasks || [],
      },
    })
  } catch (error) {
    console.error('❌ Error updating subtask:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update subtask',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/job-cards/[id]/checklist/[checklistItemId]/subtasks/[subtaskId]
 *
 * Deletes a subtask from a checklist item
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; checklistItemId: string; subtaskId: string } }
) {
  try {
    const { id: jobCardId, checklistItemId, subtaskId } = params

    console.log('🗑️ Deleting subtask:', subtaskId, 'from checklist item:', checklistItemId)

    const supabase = createAdminClient()

    // Fetch existing checklist item
    const { data: existingItem, error: fetchError } = await supabase
      .from('job_card_checklist_items')
      .select('subtasks')
      .eq('id', checklistItemId)
      .eq('job_card_id', jobCardId)
      .single()

    if (fetchError || !existingItem) {
      return NextResponse.json(
        { error: 'Checklist item not found' },
        { status: 404 }
      )
    }

    // Filter out the subtask to delete
    const subtasks = existingItem.subtasks || []
    const filteredSubtasks = subtasks.filter((st: any) => st.id !== subtaskId)

    if (filteredSubtasks.length === subtasks.length) {
      return NextResponse.json(
        { error: 'Subtask not found' },
        { status: 404 }
      )
    }

    // Update checklist item
    const { data: updatedItem, error: updateError } = await supabase
      .from('job_card_checklist_items')
      .update({
        subtasks: filteredSubtasks,
        updated_at: new Date().toISOString(),
      })
      .eq('id', checklistItemId)
      .eq('job_card_id', jobCardId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to delete subtask:', updateError)
      return NextResponse.json(
        { error: 'Failed to delete subtask', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Deleted subtask:', subtaskId)

    return NextResponse.json({
      success: true,
      message: 'Subtask deleted successfully',
      checklistItem: {
        id: updatedItem.id,
        itemName: updatedItem.item_name,
        subtasks: updatedItem.subtasks || [],
      },
    })
  } catch (error) {
    console.error('❌ Error deleting subtask:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete subtask',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
