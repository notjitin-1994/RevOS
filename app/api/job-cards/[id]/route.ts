import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { createClient } from '@/lib/supabase/client'

/**
 * PATCH /api/job-cards/[id]
 *
 * Updates an existing job card
 * Supports partial updates of any job card field
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id
    const body = await request.json()

    console.log('📝 PATCH /api/job-cards/[id] - Updating job card:', jobCardId)
    console.log('📝 Request body:', JSON.stringify(body, null, 2))

    const supabase = createAdminClient()

    // Get the current job card for comparison
    const { data: existingCard } = await supabase
      .from('job_cards')
      .select('*')
      .eq('id', jobCardId)
      .single()

    if (!existingCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    // Prepare update data - only include fields that were provided
    const updateData: any = {
      updated_at: new Date().toISOString(),
    }

    // Map of frontend field names to database column names
    const fieldMapping = {
      // Basic info
      status: 'status',
      priority: 'priority',
      jobType: 'job_type',
      bayAssigned: 'bay_assigned',

      // Customer info (stored on job card for quick access)
      customerName: 'customer_name',
      customerPhone: 'customer_phone',
      customerEmail: 'customer_email',

      // Vehicle info (stored on job card for quick access)
      vehicleMake: 'vehicle_make',
      vehicleModel: 'vehicle_model',
      vehicleYear: 'vehicle_year',
      vehicleLicensePlate: 'vehicle_license_plate',
      vehicleVin: 'vehicle_vin',
      currentMileage: 'current_mileage',

      // Job details
      customerComplaint: 'customer_complaint',
      workRequested: 'work_requested',
      customerNotes: 'customer_notes',
      technicianNotes: 'technician_notes',
      serviceAdvisorNotes: 'service_advisor_notes',
      qualityCheckNotes: 'quality_check_notes',
      technicalDiagnosis: 'technical_diagnosis',

      // Scheduling
      promisedDate: 'promised_date',
      promisedTime: 'promised_time',
      actualStartDate: 'actual_start_date',
      actualCompletionDate: 'actual_completion_date',

      // Financials
      estimatedLaborCost: 'estimated_labor_cost',
      estimatedPartsCost: 'estimated_parts_cost',
      actualLaborCost: 'actual_labor_cost',
      actualPartsCost: 'actual_parts_cost',
      discountAmount: 'discount_amount',
      taxAmount: 'tax_amount',
      finalAmount: 'final_amount',
      paymentStatus: 'payment_status',

      // Staff
      serviceAdvisorId: 'service_advisor_id',
      leadMechanicId: 'lead_mechanic_id',

      // Quality
      qualityChecked: 'quality_checked',
      qualityCheckedBy: 'quality_checked_by',
      customerRating: 'customer_rating',
    }

    // Build update data from provided fields
    for (const [frontendField, dbColumn] of Object.entries(fieldMapping)) {
      if (body[frontendField] !== undefined) {
        updateData[dbColumn] = body[frontendField]
        console.log(`📝 Mapping field: ${frontendField} → ${dbColumn} = ${body[frontendField]}`)
      }
    }

    console.log('📝 Final updateData:', updateData)

    // If status changed, record in status history
    if (body.status && body.status !== existingCard.status) {
      const { error: historyError } = await supabase
        .from('job_card_status_history')
        .insert({
          job_card_id: jobCardId,
          old_status: existingCard.status,
          new_status: body.status,
          changed_by: body.changedBy || 'System',
          changed_by_name: body.changedByName || 'Unknown',
          change_reason: body.changeReason || null,
          changed_at: new Date().toISOString(),
        })

      if (historyError) {
        console.error('Failed to record status history:', historyError)
      }
    }

    // Update the job card
    const { data: updatedCard, error: updateError } = await supabase
      .from('job_cards')
      .update(updateData)
      .eq('id', jobCardId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update job card:', updateError)
      return NextResponse.json(
        { error: 'Failed to update job card', details: updateError.message },
        { status: 500 }
      )
    }

    console.log('✅ Job card updated successfully:', updatedCard.job_card_number)

    // Fetch the complete updated job card with all relations
    const { data: fullCard } = await supabase
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
        technical_diagnosis,
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
      .eq('id', jobCardId)
      .single()

    return NextResponse.json({
      success: true,
      jobCard: fullCard,
      message: 'Job card updated successfully',
    })
  } catch (error) {
    console.error('❌ Error updating job card:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update job card',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/job-cards/[id]
 *
 * Fetches a single job card by ID with all related data
 * Including checklist items, attachments, comments, and time entries
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id

    console.log('📋 Job card detail API called for ID:', jobCardId)

    // Create Supabase admin client (bypasses RLS for server-side API)
    const supabase = createAdminClient()

    // Fetch the job card
    const { data: card, error } = await supabase
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
        technical_diagnosis,
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
      .eq('id', jobCardId)
      .single()

    if (error || !card) {
      console.error('❌ Job card not found:', jobCardId)
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    // Fetch checklist items
    const { data: checklistItems } = await supabase
      .from('job_card_checklist_items')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('display_order', { ascending: true })

    // Fetch attachments
    const { data: attachments } = await supabase
      .from('job_card_attachments')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('created_at', { ascending: false })

    // Fetch comments
    const { data: comments } = await supabase
      .from('job_card_comments')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('created_at', { ascending: false })

    // Fetch time entries
    const { data: timeEntries } = await supabase
      .from('job_card_time_entries')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('start_time', { ascending: false })

    // Fetch job card parts (CRITICAL - Previously missing)
    const { data: jobCardParts } = await supabase
      .from('job_card_parts')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('requested_at', { ascending: false })

    // Fetch status history (Previously missing)
    const { data: statusHistory } = await supabase
      .from('job_card_status_history')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('changed_at', { ascending: false })

    // Fetch parts transactions for inventory tracking (Previously missing)
    const { data: partsTransactions } = await supabase
      .from('parts_transactions')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('created_at', { ascending: false })

    // Fetch full customer details (Previously only had basic info)
    let customerDetails = null
    if (card.customer_id) {
      const { data: customer } = await supabase
        .from('customers')
        .select('*')
        .eq('id', card.customer_id)
        .single()
      customerDetails = customer
    }

    // Fetch full vehicle details (Previously only had basic info)
    let vehicleDetails = null
    if (card.vehicle_id) {
      const { data: vehicle } = await supabase
        .from('customer_vehicles')
        .select('*')
        .eq('id', card.vehicle_id)
        .single()
      vehicleDetails = vehicle
    }

    // Fetch employee (lead mechanic) details if assigned from users table
    let leadMechanic = null
    if (card.lead_mechanic_id) {
      const { data: mechanic } = await supabase
        .from('users')
        .select('*')
        .eq('user_uid', card.lead_mechanic_id)
        .single()

      if (mechanic) {
        leadMechanic = {
          id: mechanic.user_uid,
          firstName: mechanic.first_name,
          lastName: mechanic.last_name,
          email: mechanic.email,
          phoneNumber: mechanic.phone_number,
          role: mechanic.user_role,
          specialization: mechanic.specialization || null,
          status: mechanic.is_active ? 'active' : 'inactive',
          hireDate: mechanic.date_of_joining || null,
        }
      }
    }

    // Fetch service advisor details from users table
    let serviceAdvisor = null
    if (card.service_advisor_id) {
      const { data: advisor } = await supabase
        .from('users')
        .select('*')
        .eq('user_uid', card.service_advisor_id)
        .single()

      if (advisor) {
        serviceAdvisor = {
          id: advisor.user_uid,
          firstName: advisor.first_name,
          lastName: advisor.last_name,
          email: advisor.email,
          phoneNumber: advisor.phone_number,
          role: advisor.user_role,
          specialization: advisor.specialization || null,
          status: advisor.is_active ? 'active' : 'inactive',
          hireDate: advisor.date_of_joining || null,
        }
      }
    }

    // Build the response with nested structure expected by the frontend
    const jobCardDetail = {
      id: card.id,
      garageId: card.garage_id,
      jobCardNumber: card.job_card_number,
      jobType: card.job_type,
      priority: card.priority,
      status: card.status,
      createdAt: card.created_at,
      updatedAt: card.updated_at,
      promisedDate: card.promised_date,
      promisedTime: card.promised_time,
      actualStartDate: card.actual_start_date,
      actualCompletionDate: card.actual_completion_date,
      customerComplaint: card.customer_complaint,
      workRequested: card.work_requested,
      customerNotes: card.customer_notes,
      technicianNotes: card.technician_notes,
      serviceAdvisorNotes: card.service_advisor_notes,
      qualityCheckNotes: card.quality_check_notes,
      technicalDiagnosis: card.technical_diagnosis,
      bayAssigned: card.bay_assigned,
      estimatedLaborCost: parseFloat(card.estimated_labor_cost || 0),
      estimatedPartsCost: parseFloat(card.estimated_parts_cost || 0),
      actualLaborCost: parseFloat(card.actual_labor_cost || 0),
      actualPartsCost: parseFloat(card.actual_parts_cost || 0),
      discountAmount: parseFloat(card.discount_amount || 0),
      taxAmount: parseFloat(card.tax_amount || 0),
      finalAmount: parseFloat(card.final_amount || 0),
      paymentStatus: card.payment_status,
      serviceAdvisorId: card.service_advisor_id,
      leadMechanicId: card.lead_mechanic_id,
      qualityChecked: card.quality_checked,
      qualityCheckedBy: card.quality_checked_by,
      customerRating: card.customer_rating,
      createdBy: card.created_by,

      // Full customer details (previously only basic info)
      customer: customerDetails ? {
        id: customerDetails.id,
        firstName: customerDetails.first_name || card.customer_name?.split(' ')[0] || 'Customer',
        lastName: customerDetails.last_name || card.customer_name?.split(' ').slice(1).join(' ') || '',
        phoneNumber: customerDetails.phone_number || card.customer_phone || 'N/A',
        alternatePhone: customerDetails.alternate_phone,
        email: customerDetails.email || card.customer_email,
        address: customerDetails.address,
        city: customerDetails.city,
        state: customerDetails.state,
        zipCode: customerDetails.zip_code,
        country: customerDetails.country,
        customerSince: customerDetails.customer_since,
        status: customerDetails.status,
        notes: customerDetails.notes,
      } : {
        id: card.customer_id || 'unknown',
        firstName: card.customer_name?.split(' ')[0] || 'Customer',
        lastName: card.customer_name?.split(' ').slice(1).join(' ') || '',
        phoneNumber: card.customer_phone || 'N/A',
        email: card.customer_email,
      },

      // Full vehicle details (previously only basic info)
      vehicle: vehicleDetails ? {
        id: vehicleDetails.id,
        make: card.vehicle_make || vehicleDetails.make || 'Unknown',
        model: card.vehicle_model || vehicleDetails.model || 'Unknown',
        year: card.vehicle_year || vehicleDetails.year || new Date().getFullYear(),
        licensePlate: card.vehicle_license_plate || vehicleDetails.license_plate || 'N/A',
        vin: card.vehicle_vin || vehicleDetails.vin,
        color: vehicleDetails.color,
        engineNumber: vehicleDetails.engine_number,
        fuelType: vehicleDetails.fuel_type,
        transmission: vehicleDetails.transmission,
        currentMileage: card.current_mileage || vehicleDetails.current_mileage,
        lastServiceDate: vehicleDetails.last_service_date,
        status: vehicleDetails.status,
        notes: vehicleDetails.notes,
      } : {
        id: card.vehicle_id || 'unknown',
        make: card.vehicle_make || 'Unknown',
        model: card.vehicle_model || 'Unknown',
        year: card.vehicle_year || new Date().getFullYear(),
        licensePlate: card.vehicle_license_plate || 'N/A',
        vin: card.vehicle_vin,
        color: null,
        currentMileage: card.current_mileage,
      },

      // Staff details
      serviceAdvisor,
      leadMechanic,

      // Transform checklist items to expected format
      checklistItems: (checklistItems || []).map(item => ({
        id: item.id,
        itemName: item.item_name || item.name || 'Unnamed Task', // Map to itemName to match type
        description: item.description,
        status: item.status,
        priority: item.priority || 'medium',
        category: item.category || 'general',
        estimatedMinutes: item.estimated_minutes || 0,
        actualMinutes: item.actual_minutes || 0,
        laborRate: item.labor_rate || 0,
        displayOrder: item.display_order || 0,
        mechanicId: item.mechanic_id,
        startedAt: item.started_at,
        completedAt: item.completed_at,
        mechanicNotes: item.mechanic_notes,
        subtasks: (item.subtasks || []).map((st: any) => ({
          id: st.id,
          name: st.name, // Subtasks use 'name' field
          description: st.description,
          estimatedMinutes: st.estimated_minutes,
          completed: st.completed || false,
          displayOrder: st.display_order,
        })),
        linkedToCustomerIssues: item.linked_to_customer_issues || [],
        linkedToServiceScope: item.linked_to_service_scope || [],
        linkedToTechnicalDiagnosis: item.linked_to_technical_diagnosis || [],
        isTimerRunning: false,
        timerStartedAt: null,
        totalTimeSpent: item.actual_minutes || 0,
      })),

      // Parts data (previously missing - now fully implemented)
      parts: (jobCardParts || []).map(part => ({
        id: part.id,
        jobCardId: part.job_card_id,
        partNumber: part.part_number,
        partName: part.part_name,
        category: part.category,
        manufacturer: part.manufacturer,
        quantityRequested: part.quantity_requested,
        quantityUsed: part.quantity_used,
        quantityReturned: part.quantity_returned,
        status: part.status,
        estimatedUnitPrice: parseFloat(part.estimated_unit_price || 0),
        actualUnitPrice: parseFloat(part.actual_unit_price || 0),
        priceVariance: parseFloat(part.price_variance || 0),
        isPriceOverride: part.is_price_override,
        priceOverrideReason: part.price_override_reason,
        coreChargeAmount: parseFloat(part.core_charge_amount || 0),
        coreCreditAmount: parseFloat(part.core_credit_amount || 0),
        hasCoreCharge: part.has_core_charge,
        disposalFeeAmount: parseFloat(part.disposal_fee_amount || 0),
        hasDisposalFee: part.has_disposal_fee,
        source: part.source,
        requestedBy: part.requested_by,
        usedBy: part.used_by,
        requestedAt: part.requested_at,
        usedAt: part.used_at,
        notes: part.notes,
        createdAt: part.created_at,
        updatedAt: part.updated_at,
      })),

      // Status history (previously missing)
      statusHistory: (statusHistory || []).map(history => ({
        id: history.id,
        jobCardId: history.job_card_id,
        oldStatus: history.old_status,
        newStatus: history.new_status,
        changedById: history.changed_by,
        changedByName: history.changed_by_name,
        reason: history.change_reason,
        timestamp: history.changed_at,
      })),

      // Parts transactions (previously missing)
      partsTransactions: (partsTransactions || []).map(transaction => ({
        id: transaction.id,
        jobCardId: transaction.job_card_id,
        partId: transaction.part_id,
        transactionType: transaction.transaction_type,
        quantity: transaction.quantity,
        unitPrice: parseFloat(transaction.unit_price || 0),
        totalPrice: parseFloat(transaction.total_price || 0),
        transactionDate: transaction.transaction_date,
        performedBy: transaction.performed_by,
        notes: transaction.notes,
        createdAt: transaction.created_at,
      })),

      attachments: attachments || [],
      comments: comments || [],
      timeEntries: timeEntries || [],
    }

    console.log(`✅ Fetched job card ${card.job_card_number}`)

    return NextResponse.json({
      success: true,
      jobCard: jobCardDetail,
    })
  } catch (error) {
    console.error('❌ Error in job card detail API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch job card',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
