import { NextResponse } from 'next/server'
import { getVehiclesByGarageId } from '@/lib/supabase/customer-queries'

/**
 * GET /api/vehicles/list
 *
 * Fetches all vehicles for a garage with customer information
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const garageId = url.searchParams.get('garageId')

    if (!garageId) {
      return NextResponse.json(
        { error: 'Garage ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching vehicles for garage ID:', garageId)

    // Fetch vehicles with customer information
    const vehicles = await getVehiclesByGarageId(garageId)

    console.log(`Found ${vehicles.length} vehicles`)

    // Transform to frontend format
    const transformedVehicles = vehicles.map((vehicle: any) => ({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.licensePlate,
      color: vehicle.color || 'Not Specified',
      vin: vehicle.vin,
      engineNumber: vehicle.engineNumber || 'Not Provided',
      chassisNumber: vehicle.chassisNumber || vehicle.vin || 'Not Provided',
      category: vehicle.category || 'Other',
      mileage: vehicle.currentMileage,
      lastServiceDate: vehicle.lastServiceDate,
      status: vehicle.status,
      customerId: vehicle.customerId,
      customerName: vehicle.customerName,
      customerPhone: vehicle.customerPhone,
      customerEmail: vehicle.customerEmail,
      notes: vehicle.notes,
      createdAt: vehicle.createdAt,
    }))

    return NextResponse.json({
      success: true,
      vehicles: transformedVehicles,
      count: transformedVehicles.length,
    })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch vehicles',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
