import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * POST /api/job-cards/[id]/checklist/[checklistItemId]/subtasks
 *
 * Adds a new subtask to a checklist item
 *
 * Request Body:
 * - name (required): Subtask name
 * - description (optional): Subtask description
 * - estimatedMinutes (optional): Estimated time in minutes
 * - displayOrder (optional): Display order
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string; checklistItemId: string } }
) {
  try {
    const { id: jobCardId, checklistItemId } = params
    const body = await request.json()

    console.log('📝 Adding subtask to checklist item:', checklistItemId)

    // Validate request body
    const subtaskSchema = z.object({
      name: z.string().min(1, 'Subtask name is required'),
      description: z.string().optional(),
      estimatedMinutes: z.number().int().min(0).default(0),
      displayOrder: z.number().int().min(0).default(0),
    })

    const validationResult = subtaskSchema.safeParse(body)

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

    const subtaskData = validationResult.data

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

    // Create new subtask
    const newSubtask = {
      id: crypto.randomUUID(),
      name: subtaskData.name,
      description: subtaskData.description || null,
      completed: false,
      estimatedMinutes: subtaskData.estimatedMinutes,
      displayOrder: subtaskData.displayOrder,
    }

    // Add to existing subtasks array
    const updatedSubtasks = [...(existingItem.subtasks || []), newSubtask]

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
      console.error('Failed to add subtask:', updateError)
      return NextResponse.json(
        { error: 'Failed to add subtask', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Added subtask to checklist item:', checklistItemId)

    return NextResponse.json({
      success: true,
      message: 'Subtask added successfully',
      subtask: newSubtask,
      checklistItem: {
        id: updatedItem.id,
        itemName: updatedItem.item_name,
        subtasks: updatedItem.subtasks || [],
      },
    })
  } catch (error) {
    console.error('❌ Error adding subtask:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to add subtask',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
