import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/job-cards
 *
 * Fetches job cards from the database using server-side Supabase client.
 * This bypasses RLS policies that block the browser client.
 * Joins with customers and customer_vehicles tables to get complete data.
 */
export async function GET(request: NextRequest) {
  try {
    // Get garage ID from query params
    const { searchParams } = new URL(request.url)
    const garageId = searchParams.get('garageId')
    const status = searchParams.get('status')
    const mechanicId = searchParams.get('mechanicId')
    const customerId = searchParams.get('customerId')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')

    if (!garageId) {
      return NextResponse.json(
        { error: 'garageId is required' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    console.log('🔍 [API] Fetching job cards for garage:', garageId)

    // Build query with joins to get customer and vehicle data
    let query = supabase
      .from('job_cards')
      .select(`
        *,
        customers!inner (
          id,
          first_name,
          last_name,
          phone_number,
          email
        ),
        customer_vehicles!inner (
          id,
          make,
          model,
          year,
          license_plate,
          vin
        )
      `)
      .eq('garage_id', garageId)
      .order('created_at', { ascending: false })

    // Apply filters
    if (status) {
      query = query.eq('status', status)
    }

    if (mechanicId) {
      query = query.eq('lead_mechanic_id', mechanicId)
    }

    if (customerId) {
      query = query.eq('customer_id', customerId)
    }

    if (dateFrom) {
      query = query.gte('created_at', dateFrom)
    }

    if (dateTo) {
      query = query.lte('created_at', dateTo)
    }

    if (search) {
      query = query.or(
        `job_card_number.ilike.%${search}%,customer_complaint.ilike.%${search}%,work_requested.ilike.%${search}%`
      )
    }

    const { data: jobCards, error } = await query

    if (error) {
      console.error('❌ [API] Error fetching job cards:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ [API] Fetched ${jobCards?.length || 0} job cards with relations`)

    // Transform data to match frontend interface
    const transformedData = (jobCards || []).map((item: any) => {
      const customer = item.customers
      const vehicle = item.customer_vehicles

      return {
        id: item.id,
        jobCardNumber: item.job_card_number,
        customerId: item.customer_id,
        vehicleId: item.vehicle_id,
        jobType: item.job_type,
        priority: item.priority,
        status: item.status,
        customerComplaint: item.customer_complaint,
        workRequested: item.work_requested,
        customerNotes: item.customer_notes,
        currentMileage: item.current_mileage,
        reportedIssue: item.reported_issue,
        promisedDate: item.promised_date,
        promisedTime: item.promised_time,
        actualCompletionDate: item.actual_completion_date,
        leadMechanicId: item.lead_mechanic_id,
        laborHours: Number(item.labor_hours) || 0,
        laborCost: Number(item.labor_cost) || 0,
        partsCost: Number(item.parts_cost) || 0,
        totalCost: Number(item.total_cost) || 0,
        totalChecklistItems: item.total_checklist_items || 0,
        completedChecklistItems: item.completed_checklist_items || 0,
        progressPercentage: item.progress_percentage || 0,
        internalNotes: item.internal_notes,
        mechanicNotes: item.mechanic_notes,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        deletedAt: item.deleted_at,
        garageId: item.garage_id,
        // Customer data
        customerName: `${customer.first_name} ${customer.last_name}`,
        customerPhone: customer.phone_number,
        customerEmail: customer.email,
        // Vehicle data
        vehicleMake: vehicle.make,
        vehicleModel: vehicle.model,
        vehicleYear: vehicle.year,
        vehicleLicensePlate: vehicle.license_plate,
        vehicleVin: vehicle.vin,
      }
    })

    return NextResponse.json(transformedData)
  } catch (error) {
    console.error('❌ [API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
