import { NextResponse } from 'next/server'
import { createJobCard } from '@/lib/supabase/job-card-queries'

/**
 * POST /api/job-cards/create
 *
 * Creates a new job card
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.garageId) {
      return NextResponse.json(
        { error: 'Garage ID is required' },
        { status: 400 }
      )
    }

    if (!body.customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    if (!body.vehicleId) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    if (!body.jobType) {
      return NextResponse.json(
        { error: 'Job type is required' },
        { status: 400 }
      )
    }

    if (!body.priority) {
      return NextResponse.json(
        { error: 'Priority is required' },
        { status: 400 }
      )
    }

    console.log('Creating job card with data:', {
      garageId: body.garageId,
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      jobType: body.jobType,
    })

    // Create job card
    const result = await createJobCard({
      garageId: body.garageId,
      customerId: body.customerId,
      vehicleId: body.vehicleId,
      jobType: body.jobType,
      priority: body.priority,
      status: body.status,
      customerComplaint: body.customerComplaint,
      workRequested: body.workRequested,
      customerNotes: body.customerNotes,
      currentMileage: body.currentMileage,
      promisedDate: body.promisedDate,
      promisedTime: body.promisedTime,
      leadMechanicId: body.leadMechanicId,
      technicianNotes: body.technicianNotes,
      checklistItems: body.checklistItems,
      // Required fields
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      vehicleMake: body.vehicleMake,
      vehicleModel: body.vehicleModel,
      vehicleYear: body.vehicleYear,
      vehicleLicensePlate: body.vehicleLicensePlate,
      vehicleVin: body.vehicleVin,
      serviceAdvisorId: body.serviceAdvisorId,
      createdBy: body.createdBy,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    console.log('Job card created successfully:', result.jobCard?.jobCardNumber)

    return NextResponse.json({
      success: true,
      jobCard: result.jobCard,
    })
  } catch (error) {
    console.error('Error creating job card:', error)
    return NextResponse.json(
      {
        error: 'Failed to create job card',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
