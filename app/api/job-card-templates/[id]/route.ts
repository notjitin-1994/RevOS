// ============================================================================
// API Route: Job Card Template - Single Template Operations
// Description: Get, update, or delete a specific template
// Methods: GET, PATCH, DELETE
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type { UpdateTemplateRequest } from '@/lib/types/template.types'

// ============================================================================
// GET /api/job-card-templates/[id]
// Description: Get a single template with all subtasks and parts
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id

    // Initialize Supabase client
    const supabase = createAdminClient()

    // Fetch template
    const { data: template, error } = await supabase
      .from('job_card_templates')
      .select(`
        id,
        garage_id,
        name,
        slug,
        description,
        category,
        priority,
        estimated_minutes,
        labor_rate,
        tags,
        is_active,
        is_system_template,
        usage_count,
        created_by,
        created_at,
        updated_at,
        subtasks:job_card_template_subtasks(
          id,
          name,
          description,
          estimated_minutes,
          display_order
        ),
        parts:job_card_template_parts(
          id,
          part_name,
          part_number,
          quantity,
          unit_cost,
          is_optional,
          notes
        )
      `)
      .eq('id', templateId)
      .single()

    if (error) {
      console.error('Error fetching template:', error)
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Increment usage count
    await supabase
      .from('job_card_templates')
      .update({ usage_count: (template.usage_count || 0) + 1 })
      .eq('id', templateId)

    return NextResponse.json({
      success: true,
      template,
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/job-card-templates/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH /api/job-card-templates/[id]
// Description: Update a template (supports partial updates)
// Body: UpdateTemplateRequest
// ============================================================================

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id

    // Parse request body
    const body: UpdateTemplateRequest = await request.json()

    // Initialize Supabase client
    const supabase = createAdminClient()

    // Check if template exists
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('job_card_templates')
      .select('id, garage_id, slug')
      .eq('id', templateId)
      .single()

    if (fetchError || !existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Build update object (only include provided fields)
    const updateData: any = {}

    if (body.name !== undefined) updateData.name = body.name
    if (body.description !== undefined) updateData.description = body.description
    if (body.category !== undefined) updateData.category = body.category
    if (body.priority !== undefined) updateData.priority = body.priority
    if (body.estimatedMinutes !== undefined) updateData.estimated_minutes = body.estimatedMinutes
    if (body.laborRate !== undefined) updateData.labor_rate = body.laborRate
    if (body.tags !== undefined) updateData.tags = body.tags
    if (body.isActive !== undefined) updateData.is_active = body.isActive

    // Update slug if name changed
    if (body.name) {
      const baseSlug = body.name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')

      let slug = baseSlug
      let slugSuffix = 1

      // Check for slug uniqueness
      let { data: slugConflict } = await supabase
        .from('job_card_templates')
        .select('slug')
        .eq('garage_id', existingTemplate.garage_id)
        .eq('slug', slug)
        .neq('id', templateId)
        .single()

      while (slugConflict) {
        slug = `${baseSlug}-${slugSuffix}`
        slugSuffix++
        ;({ data: slugConflict } = await supabase
          .from('job_card_templates')
          .select('slug')
          .eq('garage_id', existingTemplate.garage_id)
          .eq('slug', slug)
          .neq('id', templateId)
          .single())
      }

      updateData.slug = slug
    }

    updateData.updated_at = new Date().toISOString()

    // Update template
    const { data: updatedTemplate, error: updateError } = await supabase
      .from('job_card_templates')
      .update(updateData)
      .eq('id', templateId)
      .select()
      .single()

    if (updateError) {
      console.error('Error updating template:', updateError)
      return NextResponse.json(
        { success: false, error: updateError.message },
        { status: 500 }
      )
    }

    // Fetch complete template with subtasks and parts
    const { data: completeTemplate, error: fetchError2 } = await supabase
      .from('job_card_templates')
      .select(`
        id,
        garage_id,
        name,
        slug,
        description,
        category,
        priority,
        estimated_minutes,
        labor_rate,
        tags,
        is_active,
        is_system_template,
        usage_count,
        created_by,
        created_at,
        updated_at,
        subtasks:job_card_template_subtasks(
          id,
          name,
          description,
          estimated_minutes,
          display_order
        ),
        parts:job_card_template_parts(
          id,
          part_name,
          part_number,
          quantity,
          unit_cost,
          is_optional,
          notes
        )
      `)
      .eq('id', templateId)
      .single()

    return NextResponse.json({
      success: true,
      template: completeTemplate || updatedTemplate,
    })

  } catch (error) {
    console.error('Unexpected error in PATCH /api/job-card-templates/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE /api/job-card-templates/[id]
// Description: Soft delete a template (sets is_active = false)
// ============================================================================

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const templateId = params.id

    // Initialize Supabase client
    const supabase = createAdminClient()

    // Check if template exists
    const { data: existingTemplate, error: fetchError } = await supabase
      .from('job_card_templates')
      .select('id, is_system_template')
      .eq('id', templateId)
      .single()

    if (fetchError || !existingTemplate) {
      return NextResponse.json(
        { success: false, error: 'Template not found' },
        { status: 404 }
      )
    }

    // Prevent deletion of system templates
    if (existingTemplate.is_system_template) {
      return NextResponse.json(
        { success: false, error: 'Cannot delete system templates' },
        { status: 403 }
      )
    }

    // Soft delete (set is_active to false)
    const { error: deleteError } = await supabase
      .from('job_card_templates')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('id', templateId)

    if (deleteError) {
      console.error('Error deleting template:', deleteError)
      return NextResponse.json(
        { success: false, error: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Template deleted successfully',
    })

  } catch (error) {
    console.error('Unexpected error in DELETE /api/job-card-templates/[id]:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
