// ============================================================================
// API Route: Job Card Templates
// Description: List and create job card task templates
// Methods: GET (list templates), POST (create template)
// ============================================================================

import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import type {
  JobCardTemplate,
  ListTemplatesQuery,
  CreateTemplateRequest,
} from '@/lib/types/template.types'

// ============================================================================
// GET /api/job-card-templates
// Description: List all templates for a garage with optional filtering
// Query Params:
//   - garageId (required): Garage UUID
//   - category (optional): Filter by category
//   - tags (optional): Filter by tags (comma-separated)
//   - search (optional): Search in name, description, tags
//   - includeInactive (optional): Include inactive templates (default: false)
// ============================================================================

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const garageId = searchParams.get('garageId')
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')
    const searchQuery = searchParams.get('search')
    const includeInactive = searchParams.get('includeInactive') === 'true'

    // Validate garage ID
    if (!garageId) {
      return NextResponse.json(
        { success: false, error: 'garageId is required' },
        { status: 400 }
      )
    }

    // Initialize Supabase client
    const supabase = createAdminClient()

    // Build query
    let query = supabase
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
      .eq('garage_id', garageId)

    // Filter by active status (unless explicitly requesting inactive)
    if (!includeInactive) {
      query = query.eq('is_active', true)
    }

    // Filter by category if provided
    if (category) {
      query = query.eq('category', category)
    }

    // Filter by tags if provided
    if (tags) {
      const tagArray = tags.split(',').map(t => t.trim())
      query = query.contains('tags', tagArray)
    }

    // Search query if provided
    if (searchQuery) {
      query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%,tags.cs.{${searchQuery}}`)
    }

    // Order by usage count (most used first) and created at
    query = query.order('usage_count', { ascending: false })
               .order('created_at', { ascending: false })

    // Execute query
    const { data: templates, error } = await query

    if (error) {
      console.error('Error fetching templates:', error)
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500 }
      )
    }

    // Return templates
    return NextResponse.json({
      success: true,
      templates: templates || [],
      count: templates?.length || 0,
    })

  } catch (error) {
    console.error('Unexpected error in GET /api/job-card-templates:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// ============================================================================
// POST /api/job-card-templates
// Description: Create a new job card template
// Body: CreateTemplateRequest
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body: CreateTemplateRequest = await request.json()

    // Validate required fields
    if (!body.garageId || !body.name || !body.category || !body.priority) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: garageId, name, category, priority'
        },
        { status: 400 }
      )
    }

    // Generate slug from name
    const baseSlug = body.name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '')

    let slug = baseSlug
    let slugSuffix = 1

    // Initialize Supabase client
    const supabase = createAdminClient()

    // Check for slug uniqueness and append suffix if needed
    let { data: existingTemplate } = await supabase
      .from('job_card_templates')
      .select('slug')
      .eq('garage_id', body.garageId)
      .eq('slug', slug)
      .single()

    while (existingTemplate) {
      slug = `${baseSlug}-${slugSuffix}`
      slugSuffix++
      ;({ data: existingTemplate } = await supabase
        .from('job_card_templates')
        .select('slug')
        .eq('garage_id', body.garageId)
        .eq('slug', slug)
        .single())
    }

    // Get user from session (for created_by)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'User not authenticated' },
        { status: 401 }
      )
    }

    // Create template
    const { data: template, error: templateError } = await supabase
      .from('job_card_templates')
      .insert({
        garage_id: body.garageId,
        name: body.name,
        slug,
        description: body.description || null,
        category: body.category,
        priority: body.priority,
        estimated_minutes: body.estimatedMinutes || 30,
        labor_rate: body.laborRate || 0,
        tags: body.tags || [],
        is_active: true,
        is_system_template: false,
        usage_count: 0,
        created_by: user.id,
      })
      .select()
      .single()

    if (templateError) {
      console.error('Error creating template:', templateError)
      return NextResponse.json(
        { success: false, error: templateError.message },
        { status: 500 }
      )
    }

    // Insert subtasks if provided
    if (body.subtasks && body.subtasks.length > 0) {
      const subtasksToInsert = body.subtasks.map((st, index) => ({
        template_id: template.id,
        name: st.name,
        description: st.description || null,
        estimated_minutes: st.estimatedMinutes,
        display_order: st.displayOrder ?? index,
      }))

      const { error: subtasksError } = await supabase
        .from('job_card_template_subtasks')
        .insert(subtasksToInsert)

      if (subtasksError) {
        console.error('Error creating subtasks:', subtasksError)
        // Don't fail the entire operation, just log the error
      }
    }

    // Insert parts if provided
    if (body.parts && body.parts.length > 0) {
      const partsToInsert = body.parts.map(part => ({
        template_id: template.id,
        part_name: part.partName,
        part_number: part.partNumber || null,
        quantity: part.quantity,
        unit_cost: part.unitCost,
        is_optional: part.isOptional ?? false,
        notes: part.notes || null,
      }))

      const { error: partsError } = await supabase
        .from('job_card_template_parts')
        .insert(partsToInsert)

      if (partsError) {
        console.error('Error creating parts:', partsError)
        // Don't fail the entire operation, just log the error
      }
    }

    // Fetch complete template with subtasks and parts
    const { data: completeTemplate, error: fetchError } = await supabase
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
      .eq('id', template.id)
      .single()

    if (fetchError) {
      console.error('Error fetching complete template:', fetchError)
      // Return the basic template if we can't fetch the complete one
      return NextResponse.json({
        success: true,
        template,
      })
    }

    return NextResponse.json({
      success: true,
      template: completeTemplate,
    })

  } catch (error) {
    console.error('Unexpected error in POST /api/job-card-templates:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
