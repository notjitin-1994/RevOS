import { NextResponse } from 'next/server'
import { addVehicleToCustomer } from '@/lib/supabase/customer-queries'

/**
 * POST /api/vehicles/add
 *
 * Adds a new vehicle to an existing customer
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      garageId,
      customerId,
      make,
      model,
      year,
      category,
      engineNumber,
      chassisNumber,
      licensePlate,
      notes,
    } = body

    // Validation
    if (!garageId || !customerId || !make || !model || !year) {
      return NextResponse.json(
        { error: 'Missing required fields: garageId, customerId, make, model, year' },
        { status: 400 }
      )
    }

    if (!engineNumber || !chassisNumber) {
      return NextResponse.json(
        { error: 'Engine number and chassis number are required' },
        { status: 400 }
      )
    }

    // Add vehicle
    const result = await addVehicleToCustomer(customerId, garageId, {
      make,
      model,
      year,
      licensePlate: licensePlate || chassisNumber,
      color: null,
      vin: chassisNumber,
      engineNumber,
      chassisNumber,
      category,
      currentMileage: null,
      notes,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to add vehicle' },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      vehicle: result.vehicleData,
    })
  } catch (error) {
    console.error('Error adding vehicle:', error)
    return NextResponse.json(
      {
        error: 'Failed to add vehicle',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
