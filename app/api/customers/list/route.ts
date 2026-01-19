import { NextResponse } from 'next/server'
import { getCustomersByGarageId } from '@/lib/supabase/customer-queries'

export const dynamic = 'force-dynamic'

/**
 * GET /api/customers/list
 *
 * Fetches all customers for a garage
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

    console.log('Fetching customers for garage ID:', garageId)

    // Fetch customers with vehicles
    const customers = await getCustomersByGarageId(garageId)

    console.log(`Found ${customers.length} customers`)

    // Transform to frontend format
    const transformedCustomers = customers.map((customer) => ({
      id: customer.id,
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phoneNumber: customer.phoneNumber,
      alternatePhone: customer.alternatePhone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      country: customer.country,
      dateOfBirth: null,
      customerSince: new Date(customer.customerSince).toISOString().split('T')[0],
      status: customer.status,
      profilePicture: null,
      notes: customer.notes,
      garageId: customer.garageId,
      totalVehicles: customer.vehicles.length,
      totalJobs: 0, // Can be calculated later from jobs table
      vehicles: customer.vehicles,
    }))

    return NextResponse.json({
      success: true,
      customers: transformedCustomers,
      count: transformedCustomers.length,
    })
  } catch (error) {
    console.error('Error fetching customers:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch customers',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
