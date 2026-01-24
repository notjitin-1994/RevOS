import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { generateJobCardNumber } from '@/lib/utils/job-card-number'
import { z } from 'zod'
import type { KanbanJobCard } from '@/app/job-cards/types/kanban.types'

/**
 * GET /api/job-cards
 *
 * Fetches job cards with related customer, vehicle, and employee data
 * Supports filtering by status, priority, mechanic, customer, date range, and search
 *
 * Query Parameters:
 * - garageId (required): Garage ID to fetch cards for
 * - status: Filter by status (comma-separated for multiple)
 * - priority: Filter by priority (comma-separated for multiple)
 * - mechanicId: Filter by lead mechanic
 * - unassigned: Filter for unassigned cards (no lead mechanic)
 * - serviceAdvisorId: Filter by service advisor
 * - customerId: Filter by customer
 * - search: Full-text search across multiple fields
 * - promisedDateFrom: Filter by promised date (ISO string)
 * - promisedDateTo: Filter by promised date (ISO string)
 * - createdDateFrom: Filter by creation date (ISO string)
 * - createdDateTo: Filter by creation date (ISO string)
 * - sortBy: Sort field (priority, promisedDate, createdDate, customerName, jobCardNumber)
 * - sortOrder: Sort order (asc, desc)
 * - limit: Maximum number of records to return (default: 100)
 * - offset: Offset for pagination (default: 0)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)

    // Extract query parameters
    const garageId = searchParams.get('garageId')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const mechanicId = searchParams.get('mechanicId')
    const unassigned = searchParams.get('unassigned') === 'true'
    const serviceAdvisorId = searchParams.get('serviceAdvisorId')
    const customerId = searchParams.get('customerId')
    const search = searchParams.get('search')
    const promisedDateFrom = searchParams.get('promisedDateFrom')
    const promisedDateTo = searchParams.get('promisedDateTo')
    const createdDateFrom = searchParams.get('createdDateFrom')
    const createdDateTo = searchParams.get('createdDateTo')
    const sortBy = searchParams.get('sortBy') || 'createdDate'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    const limit = parseInt(searchParams.get('limit') || '100')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Validate required parameters
    if (!garageId) {
      return NextResponse.json(
        { error: 'garageId is required' },
        { status: 400 }
      )
    }

    console.log('📋 Job cards API called with params:', {
      garageId,
      status,
      priority,
      mechanicId,
      unassigned,
      serviceAdvisorId,
      customerId,
      search,
      sortBy,
      sortOrder,
      limit,
      offset,
    })

    // Create Supabase admin client (bypasses RLS for server-side API)
    const supabase = createAdminClient()

    // DEBUG: First, let's check what job cards exist and their garage_id values
    console.log('🔍 DEBUG: Fetching sample job cards to inspect garage_id values...')
    const { data: sampleData, error: sampleError } = await supabase
      .from('job_cards')
      .select('id, job_card_number, garage_id, customer_name, status')
      .limit(5)

    console.log('🔍 DEBUG: Sample job cards:', sampleData)
    console.log('🔍 DEBUG: Sample error:', sampleError)

    // The session stores garage_uid (UUID), but we need to figure out which column
    // in job_cards contains this value. Based on the error, job_cards.garage_id
    // is UUID type, so we should use the garage_uid value directly.
    const actualGarageId = garageId  // Use the garage_uid from session directly

    console.log('🔍 Querying job cards with garage_id:', actualGarageId)

    // Build query
    let query = supabase
      .from('job_cards')
      .select(`
        id,
        garage_id,
        job_card_number,
        customer_id,
        customer_name,
        customer_phone,
        customer_email,
        vehicle_id,
        vehicle_make,
        vehicle_model,
        vehicle_year,
        vehicle_license_plate,
        vehicle_vin,
        current_mileage,
        status,
        priority,
        job_type,
        customer_complaint,
        work_requested,
        customer_notes,
        technician_notes,
        service_advisor_notes,
        quality_check_notes,
        promised_date,
        promised_time,
        actual_start_date,
        actual_completion_date,
        bay_assigned,
        estimated_labor_cost,
        estimated_parts_cost,
        actual_labor_cost,
        actual_parts_cost,
        discount_amount,
        tax_amount,
        final_amount,
        payment_status,
        service_advisor_id,
        lead_mechanic_id,
        quality_checked,
        quality_checked_by,
        customer_rating,
        created_at,
        updated_at,
        created_by
      `)
      .eq('garage_id', actualGarageId)

    // Apply filters
    if (status) {
      const statuses = status.split(',')
      query = query.in('status', statuses)
    }

    if (priority) {
      const priorities = priority.split(',')
      query = query.in('priority', priorities)
    }

    if (unassigned) {
      // Filter for cards without a lead mechanic (null check)
      query = query.is('lead_mechanic_id', null)
    } else if (mechanicId) {
      query = query.eq('lead_mechanic_id', mechanicId)
    }

    if (serviceAdvisorId) {
      query = query.eq('service_advisor_id', serviceAdvisorId)
    }

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    // Date range filters
    if (promisedDateFrom) {
      query = query.gte('promised_date', promisedDateFrom)
    }

    if (promisedDateTo) {
      query = query.lte('promised_date', promisedDateTo)
    }

    if (createdDateFrom) {
      query = query.gte('created_at', createdDateFrom)
    }

    if (createdDateTo) {
      query = query.lte('created_at', createdDateTo)
    }

    // Full-text search
    if (search) {
      // Search across multiple text fields
      query = query.or(`
        job_card_number.ilike.%${search}%,
        customer_name.ilike.%${search}%,
        customer_phone.ilike.%${search}%,
        vehicle_make.ilike.%${search}%,
        vehicle_model.ilike.%${search}%,
        vehicle_license_plate.ilike.%${search}%,
        customer_complaint.ilike.%${search}%,
        work_requested.ilike.%${search}%
      `)
    }

    // Apply sorting
    const orderByColumn = sortBy === 'priority' ? 'priority' :
                         sortBy === 'promisedDate' ? 'promised_date' :
                         sortBy === 'customerName' ? 'customer_name' :
                         sortBy === 'jobCardNumber' ? 'job_card_number' :
                         'created_at'

    query = query.order(orderByColumn, { ascending: sortOrder === 'asc' })

    // Apply pagination
    query = query.range(offset, offset + limit - 1)

    // Execute query
    const { data: rawData, error, count } = await query

    console.log('🔍 Query results:', {
      hasData: !!rawData,
      count: rawData?.length || 0,
      totalCount: count,
      error: error?.message,
      sampleFirst: rawData?.[0] || null
    })

    if (error) {
      console.error('❌ Supabase error fetching job cards:', error)
      return NextResponse.json(
        { error: 'Failed to fetch job cards', details: error.message },
        { status: 500 }
      )
    }

    // Transform snake_case to camelCase and add derived fields
    const jobCards: KanbanJobCard[] = (rawData || []).map((card: any) => ({
      id: card.id,
      garageId: card.garage_id,
      jobCardNumber: card.job_card_number,
      customerId: card.customer_id,
      customerName: card.customer_name,
      customerPhone: card.customer_phone,
      customerEmail: card.customer_email,
      vehicleId: card.vehicle_id,
      vehicleMake: card.vehicle_make,
      vehicleModel: card.vehicle_model,
      vehicleYear: card.vehicle_year,
      vehicleLicensePlate: card.vehicle_license_plate,
      vehicleVin: card.vehicle_vin,
      currentMileage: card.current_mileage,
      status: card.status,
      priority: card.priority,
      jobType: card.job_type,
      customerComplaint: card.customer_complaint,
      workRequested: card.work_requested,
      customerNotes: card.customer_notes,
      technicianNotes: card.technician_notes,
      serviceAdvisorNotes: card.service_advisor_notes,
      qualityCheckNotes: card.quality_check_notes,
      promisedDate: card.promised_date,
      promisedTime: card.promised_time,
      actualStartDate: card.actual_start_date,
      actualCompletionDate: card.actual_completion_date,
      bayAssigned: card.bay_assigned,
      estimatedLaborCost: parseFloat(card.estimated_labor_cost) || 0,
      estimatedPartsCost: parseFloat(card.estimated_parts_cost) || 0,
      actualLaborCost: parseFloat(card.actual_labor_cost) || 0,
      actualPartsCost: parseFloat(card.actual_parts_cost) || 0,
      discountAmount: parseFloat(card.discount_amount) || 0,
      taxAmount: parseFloat(card.tax_amount) || 0,
      finalAmount: parseFloat(card.final_amount) || 0,
      paymentStatus: card.payment_status,
      serviceAdvisorId: card.service_advisor_id,
      leadMechanicId: card.lead_mechanic_id,
      qualityChecked: card.quality_checked || false,
      qualityCheckedBy: card.quality_checked_by,
      customerRating: card.customer_rating,
      createdAt: card.created_at,
      updatedAt: card.updated_at,
      createdBy: card.created_by,
    }))

    // Fetch additional data: checklist counts, attachments count, comments count
    // This is done in a separate query to avoid overcomplicating the main query
    const cardIds = jobCards.map(card => card.id)

    let checklistCounts: Record<string, { total: number; completed: number }> = {}
    let attachmentsCounts: Record<string, number> = {}
    let commentsCounts: Record<string, number> = {}

    if (cardIds.length > 0) {
      // Fetch checklist item counts
      const { data: checklistItems } = await supabase
        .from('job_card_checklist_items')
        .select('job_card_id, status')
        .in('job_card_id', cardIds)

      if (checklistItems) {
        checklistItems.forEach(item => {
          const cardId = item.job_card_id
          if (!checklistCounts[cardId]) {
            checklistCounts[cardId] = { total: 0, completed: 0 }
          }
          checklistCounts[cardId].total++
          if (item.status === 'completed') {
            checklistCounts[cardId].completed++
          }
        })
      }

      // Fetch attachment counts
      const { data: attachments } = await supabase
        .from('job_card_attachments')
        .select('job_card_id')
        .in('job_card_id', cardIds)

      if (attachments) {
        attachments.forEach(attachment => {
          const cardId = attachment.job_card_id
          attachmentsCounts[cardId] = (attachmentsCounts[cardId] || 0) + 1
        })
      }

      // Fetch comment counts
      const { data: comments } = await supabase
        .from('job_card_comments')
        .select('job_card_id')
        .in('job_card_id', cardIds)

      if (comments) {
        comments.forEach(comment => {
          const cardId = comment.job_card_id
          commentsCounts[cardId] = (commentsCounts[cardId] || 0) + 1
        })
      }
    }

    // Attach derived data to job cards
    const enrichedJobCards = jobCards.map(card => {
      const checklist = checklistCounts[card.id] || { total: 0, completed: 0 }
      return {
        ...card,
        totalChecklistItems: checklist.total,
        completedChecklistItems: checklist.completed,
        progressPercentage: checklist.total > 0
          ? Math.round((checklist.completed / checklist.total) * 100)
          : 0,
        attachmentsCount: attachmentsCounts[card.id] || 0,
        commentsCount: commentsCounts[card.id] || 0,
      }
    })

    console.log(`✅ Fetched ${enrichedJobCards.length} job cards (total: ${count || 0})`)

    // Return data with pagination metadata
    return NextResponse.json({
      data: enrichedJobCards,
      meta: {
        total: count || 0,
        limit,
        offset,
        hasMore: (count || 0) > offset + limit,
      },
    })
  } catch (error) {
    console.error('❌ Error in job cards API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch job cards', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/job-cards
 *
 * Creates a new draft job card with customer and vehicle information.
 * This is called when user clicks "Next: Job Details" on the job card creation page.
 *
 * Request Body:
 * - garageId (required): Garage ID
 * - customerId (required): Customer ID
 * - customerName (required): Customer's full name
 * - customerPhone (required): Customer's phone number
 * - customerEmail (optional): Customer's email
 * - vehicleId (required): Vehicle ID
 * - vehicleMake (required): Vehicle make
 * - vehicleModel (required): Vehicle model
 * - vehicleYear (required): Vehicle year
 * - vehicleLicensePlate (required): Vehicle license plate
 * - vehicleVin (optional): Vehicle VIN
 * - currentMileage (optional): Current vehicle mileage
 * - createdBy (required): User ID who is creating the job card
 *
 * Returns:
 * - success: true/false
 * - jobCard: Created job card object with all fields
 * - message: Success/error message
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Define validation schema with Zod
    const createJobCardSchema = z.object({
      garageId: z.string()
        .min(1, 'Garage ID is required')
        .uuid('Invalid garage ID format'),

      customerId: z.string()
        .min(1, 'Customer ID is required')
        .uuid('Invalid customer ID format'),

      customerName: z.string()
        .min(1, 'Customer name is required')
        .max(255, 'Customer name must be less than 255 characters')
        .trim(),

      customerPhone: z.string()
        .min(1, 'Customer phone is required')
        .max(20, 'Customer phone must be less than 20 characters')
        .trim(),

      customerEmail: z.string()
        .email('Invalid email format')
        .max(255, 'Customer email must be less than 255 characters')
        .trim()
        .optional(),

      vehicleId: z.string()
        .min(1, 'Vehicle ID is required')
        .uuid('Invalid vehicle ID format'),

      vehicleMake: z.string()
        .min(1, 'Vehicle make is required')
        .max(100, 'Vehicle make must be less than 100 characters')
        .trim(),

      vehicleModel: z.string()
        .min(1, 'Vehicle model is required')
        .max(100, 'Vehicle model must be less than 100 characters')
        .trim(),

      vehicleYear: z.number()
        .int('Vehicle year must be an integer')
        .min(1900, 'Vehicle year must be after 1900')
        .max(2100, 'Vehicle year must be before 2100'),

      vehicleLicensePlate: z.string()
        .min(1, 'Vehicle license plate is required')
        .max(20, 'Vehicle license plate must be less than 20 characters')
        .trim(),

      vehicleVin: z.string()
        .max(100, 'Vehicle VIN must be less than 100 characters')
        .trim()
        .optional(),

      currentMileage: z.number()
        .int('Current mileage must be an integer')
        .min(0, 'Current mileage cannot be negative')
        .optional(),

      createdBy: z.string()
        .min(1, 'Created by user ID is required')
        .uuid('Invalid user ID format'),
    })

    // Validate input
    const validationResult = createJobCardSchema.safeParse(body)

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

    const data = validationResult.data

    // Create admin client to bypass RLS
    const supabase = createAdminClient()

    // Verify customer exists
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, first_name, last_name, phone_number, email')
      .eq('id', data.customerId)
      .eq('garage_id', data.garageId)
      .single()

    if (customerError || !customer) {
      console.error('Error fetching customer:', customerError)
      return NextResponse.json(
        { error: 'Customer not found or does not belong to this garage' },
        { status: 404 }
      )
    }

    // Verify vehicle exists
    const { data: vehicle, error: vehicleError } = await supabase
      .from('customer_vehicles')
      .select('id, make, model, year, license_plate, vin, current_mileage')
      .eq('id', data.vehicleId)
      .eq('customer_id', data.customerId)
      .single()

    if (vehicleError || !vehicle) {
      console.error('Error fetching vehicle:', vehicleError)
      return NextResponse.json(
        { error: 'Vehicle not found or does not belong to this customer' },
        { status: 404 }
      )
    }

    // Generate unique job card number
    let jobCardNumber: string
    try {
      jobCardNumber = await generateJobCardNumber(data.garageId)
    } catch (error) {
      console.error('Error generating job card number:', error)
      return NextResponse.json(
        { error: 'Failed to generate job card number', details: error instanceof Error ? error.message : 'Unknown error' },
        { status: 500 }
      )
    }

    // Prepare job card data
    const jobCardData = {
      garage_id: data.garageId,
      job_card_number: jobCardNumber,
      customer_id: data.customerId,
      customer_name: data.customerName,
      customer_phone: data.customerPhone,
      customer_email: data.customerEmail || null,
      vehicle_id: data.vehicleId,
      vehicle_make: data.vehicleMake,
      vehicle_model: data.vehicleModel,
      vehicle_year: data.vehicleYear,
      vehicle_license_plate: data.vehicleLicensePlate,
      vehicle_vin: data.vehicleVin || null,
      current_mileage: data.currentMileage || null,
      status: 'draft',
      priority: 'medium',
      job_type: 'repair',
      customer_complaint: '',
      work_requested: '',
      customer_notes: null,
      technician_notes: null,
      service_advisor_notes: null,
      quality_check_notes: null,
      promised_date: null,
      promised_time: null,
      actual_start_date: null,
      actual_completion_date: null,
      bay_assigned: null,
      estimated_labor_cost: 0,
      estimated_parts_cost: 0,
      actual_labor_cost: 0,
      actual_parts_cost: 0,
      discount_amount: 0,
      tax_amount: 0,
      final_amount: 0,
      payment_status: 'pending',
      service_advisor_id: data.createdBy,
      lead_mechanic_id: null,
      quality_checked: false,
      quality_checked_by: null,
      customer_rating: null,
      created_by: data.createdBy,
    }

    // Insert job card
    const { data: insertedJobCard, error: insertError } = await supabase
      .from('job_cards')
      .insert(jobCardData)
      .select('*')
      .single()

    if (insertError) {
      console.error('Error creating job card:', insertError)
      return NextResponse.json(
        { error: 'Failed to create job card', details: insertError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Job card created successfully: ${jobCardNumber}`)

    // Return success response with created job card
    return NextResponse.json({
      success: true,
      message: 'Job card created successfully',
      jobCard: {
        id: insertedJobCard.id,
        jobCardNumber: insertedJobCard.job_card_number,
        status: insertedJobCard.status,
        customerId: insertedJobCard.customer_id,
        customerName: insertedJobCard.customer_name,
        vehicleId: insertedJobCard.vehicle_id,
        vehicleMake: insertedJobCard.vehicle_make,
        vehicleModel: insertedJobCard.vehicle_model,
        createdAt: insertedJobCard.created_at,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error creating job card:', error)

    // Don't expose internal error details to client
    return NextResponse.json(
      {
        error: 'An error occurred while creating job card',
      },
      { status: 500 }
    )
  }
}
