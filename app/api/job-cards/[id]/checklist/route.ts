import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * POST /api/job-cards/[id]/checklist
 *
 * Creates one or more checklist items for a job card
 *
 * Request Body:
 * - checklistItems (required): Array of checklist items to create
 *   - id (optional): Client-side generated ID (UUID)
 *   - name (required): Task name
 *   - description (optional): Task description
 *   - status (optional): Task status (default: 'pending')
 *   - priority (optional): Task priority (default: 'medium')
 *   - category (optional): Task category (default: 'general')
 *   - estimatedMinutes (optional): Estimated time in minutes
 *   - laborRate (optional): Labor rate per hour
 *   - displayOrder (optional): Display order
 *   - subtasks (optional): Array of subtask objects
 *   - linkedToCustomerIssues (optional): Array of indices to customer issues
 *   - linkedToServiceScope (optional): Array of indices to service scope items
 *   - linkedToTechnicalDiagnosis (optional): Array of indices to diagnosis items
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id
    const body = await request.json()

    console.log('📝 Creating checklist items for job card:', jobCardId, body)

    // Validate request body
    const checklistItemSchema = z.object({
      id: z.string().optional(), // Accept any string ID (not just UUID)
      name: z.string().min(1, 'Task name is required'),
      description: z.string().optional(),
      status: z.enum(['pending', 'in-progress', 'completed', 'skipped']).default('pending'),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
      category: z.enum(['Engine', 'Electrical', 'Body', 'Maintenance', 'Diagnostic', 'Custom']).default('Custom'),
      estimatedMinutes: z.number().int().min(0).default(0),
      laborRate: z.number().min(0).default(0),
      displayOrder: z.number().int().min(0).default(0),
      subtasks: z.array(z.object({
        id: z.string(),
        name: z.string().min(1, 'Subtask name is required'),
        description: z.string().optional(),
        estimatedMinutes: z.number().int().min(0).default(0),
        completed: z.boolean().default(false),
        displayOrder: z.number().int().min(0).default(0),
      })).default([]),
      linkedToCustomerIssues: z.array(z.number()).default([]),
      linkedToServiceScope: z.array(z.number()).default([]),
      linkedToTechnicalDiagnosis: z.array(z.number()).default([]),
    })

    const requestSchema = z.object({
      checklistItems: z.array(checklistItemSchema).min(1, 'At least one checklist item is required'),
    })

    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }))

      console.error('❌ Checklist POST validation failed:', JSON.stringify(errors, null, 2))
      console.error('Received body:', JSON.stringify(body, null, 2))

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { checklistItems } = validationResult.data

    const supabase = createAdminClient()

    // Verify job card exists and get garage_id
    const { data: jobCard, error: jobCardError } = await supabase
      .from('job_cards')
      .select('id, status, garage_id')
      .eq('id', jobCardId)
      .single()

    if (jobCardError || !jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    // Prepare checklist items for insertion
    // Note: We omit the 'id' field to let PostgreSQL auto-generate UUIDs via gen_random_uuid()
    const itemsToInsert = checklistItems.map(item => ({
      garage_id: jobCard.garage_id, // Include garage_id (required)
      job_card_id: jobCardId,
      item_name: item.name,
      description: item.description || null,
      status: item.status,
      priority: item.priority,
      category: item.category,
      estimated_minutes: item.estimatedMinutes,
      actual_minutes: 0,
      labor_rate: item.laborRate,
      display_order: item.displayOrder,
      mechanic_id: null,
      started_at: null,
      completed_at: null,
      mechanic_notes: null,
      subtasks: item.subtasks,
      linked_to_customer_issues: item.linkedToCustomerIssues,
      linked_to_service_scope: item.linkedToServiceScope,
      linked_to_technical_diagnosis: item.linkedToTechnicalDiagnosis,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }))

    // Insert all checklist items
    const { data: insertedItems, error: insertError } = await supabase
      .from('job_card_checklist_items')
      .insert(itemsToInsert)
      .select()

    if (insertError) {
      console.error('Failed to create checklist items:', insertError)
      return NextResponse.json(
        { error: 'Failed to create checklist items', details: insertError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Created ${insertedItems.length} checklist items for job card ${jobCardId}`)

    // Fetch and return updated checklist items with transformed field names
    const { data: allChecklistItems } = await supabase
      .from('job_card_checklist_items')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('display_order', { ascending: true })

    // Transform database field names to camelCase for frontend
    const transformedChecklistItems = (allChecklistItems || []).map(item => ({
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
    }))

    return NextResponse.json({
      success: true,
      message: `Created ${insertedItems.length} checklist item(s)`,
      checklistItems: transformedChecklistItems,
    })
  } catch (error) {
    console.error('❌ Error creating checklist items:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to create checklist items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/job-cards/[id]/checklist
 *
 * Updates one or more checklist items for a job card
 *
 * Request Body:
 * - checklistItems (required): Array of checklist items to update
 *   - id (required): Checklist item ID
 *   - ... (same fields as POST)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id
    const body = await request.json()

    console.log('📝 Updating checklist items for job card:', jobCardId, body)

    // Validate request body (same schema as POST but id is required)
    const checklistItemSchema = z.object({
      id: z.string().min(1, 'Checklist item ID is required'), // Accept any string ID
      name: z.string().min(1, 'Task name is required'),
      description: z.string().optional(),
      status: z.enum(['pending', 'in-progress', 'completed', 'skipped']),
      priority: z.enum(['low', 'medium', 'high', 'urgent']),
      category: z.enum(['Engine', 'Electrical', 'Body', 'Maintenance', 'Diagnostic', 'Custom']),
      estimatedMinutes: z.number().int().min(0),
      laborRate: z.number().min(0),
      displayOrder: z.number().int().min(0),
      mechanicId: z.string().optional(),
      mechanicNotes: z.string().optional(),
      subtasks: z.array(z.object({
        id: z.string(),
        name: z.string(),
        description: z.string().optional(),
        estimatedMinutes: z.number().int().min(0),
        completed: z.boolean(),
        displayOrder: z.number().int().min(0),
      })),
      linkedToCustomerIssues: z.array(z.number()),
      linkedToServiceScope: z.array(z.number()),
      linkedToTechnicalDiagnosis: z.array(z.number()),
    })

    const requestSchema = z.object({
      checklistItems: z.array(checklistItemSchema).min(1, 'At least one checklist item is required'),
    })

    const validationResult = requestSchema.safeParse(body)

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

    const { checklistItems } = validationResult.data

    const supabase = createAdminClient()

    // Verify job card exists
    const { data: jobCard, error: jobCardError } = await supabase
      .from('job_cards')
      .select('id, status')
      .eq('id', jobCardId)
      .single()

    if (jobCardError || !jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    // Update each checklist item
    const updatePromises = checklistItems.map(async (item) => {
      const updateData: any = {
        item_name: item.name,
        description: item.description,
        status: item.status,
        priority: item.priority,
        category: item.category,
        estimated_minutes: item.estimatedMinutes,
        labor_rate: item.laborRate,
        display_order: item.displayOrder,
        subtasks: item.subtasks,
        linked_to_customer_issues: item.linkedToCustomerIssues,
        linked_to_service_scope: item.linkedToServiceScope,
        linked_to_technical_diagnosis: item.linkedToTechnicalDiagnosis,
        updated_at: new Date().toISOString(),
      }

      // Optional fields
      if (item.mechanicId !== undefined) {
        updateData.mechanic_id = item.mechanicId
      }
      if (item.mechanicNotes !== undefined) {
        updateData.mechanic_notes = item.mechanicNotes
      }

      // Set completion timestamp
      if (item.status === 'completed') {
        updateData.completed_at = new Date().toISOString()
      }

      return supabase
        .from('job_card_checklist_items')
        .update(updateData)
        .eq('id', item.id)
        .eq('job_card_id', jobCardId)
    })

    const results = await Promise.all(updatePromises)

    // Check for errors
    const errors = results.filter(r => r.error).map(r => r.error)
    if (errors.length > 0) {
      console.error('Failed to update some checklist items:', errors)
      return NextResponse.json(
        { error: 'Failed to update some checklist items', details: errors.map(e => e?.message || 'Unknown error') },
        { status: 500 }
      )
    }

    console.log(`✅ Updated ${checklistItems.length} checklist items for job card ${jobCardId}`)

    // Fetch and return updated checklist items with transformed field names
    const { data: allChecklistItems } = await supabase
      .from('job_card_checklist_items')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('display_order', { ascending: true })

    // Transform database field names to camelCase for frontend
    const transformedChecklistItems = (allChecklistItems || []).map(item => ({
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
    }))

    return NextResponse.json({
      success: true,
      message: `Updated ${checklistItems.length} checklist item(s)`,
      checklistItems: transformedChecklistItems,
    })
  } catch (error) {
    console.error('❌ Error updating checklist items:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update checklist items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/job-cards/[id]/checklist
 *
 * Deletes one or more checklist items from a job card
 *
 * Request Body:
 * - itemIds (required): Array of checklist item IDs to delete
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id
    const body = await request.json()

    console.log('🗑️ Deleting checklist items from job card:', jobCardId, body)

    const requestSchema = z.object({
      itemIds: z.array(z.string().uuid()).min(1, 'At least one item ID is required'),
    })

    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validationResult.error.errors },
        { status: 400 }
      )
    }

    const { itemIds } = validationResult.data

    const supabase = createAdminClient()

    // Verify job card exists
    const { data: jobCard, error: jobCardError } = await supabase
      .from('job_cards')
      .select('id')
      .eq('id', jobCardId)
      .single()

    if (jobCardError || !jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    // Soft delete checklist items by setting deleted_at timestamp
    const { error: deleteError } = await supabase
      .from('job_card_checklist_items')
      .update({ deleted_at: new Date().toISOString() })
      .in('id', itemIds)
      .eq('job_card_id', jobCardId)

    if (deleteError) {
      console.error('Failed to delete checklist items:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete checklist items', details: deleteError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Deleted ${itemIds.length} checklist items from job card ${jobCardId}`)

    return NextResponse.json({
      success: true,
      message: `Deleted ${itemIds.length} checklist item(s)`,
    })
  } catch (error) {
    console.error('❌ Error deleting checklist items:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to delete checklist items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
