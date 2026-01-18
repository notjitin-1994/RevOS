import { NextResponse } from 'next/server'
import { getCustomerById } from '@/lib/supabase/customer-queries'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/customers/[id]
 *
 * Fetches a single customer by ID with their vehicles
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const customerId = params.id

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching customer:', customerId)

    // Fetch customer with vehicles
    const customer = await getCustomerById(customerId)

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    console.log(`Found customer: ${customer.firstName} ${customer.lastName}`)

    // Transform to frontend format
    const transformedCustomer = {
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
      vehicles: customer.vehicles.map((vehicle) => ({
        id: vehicle.id,
        customerId: vehicle.customerId,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.licensePlate,
        color: vehicle.color || 'N/A',
        vin: vehicle.vin,
        mileage: vehicle.currentMileage,
        lastServiceDate: vehicle.lastServiceDate ? new Date(vehicle.lastServiceDate).toISOString().split('T')[0] : null,
        status: vehicle.status,
      })),
    }

    return NextResponse.json({
      success: true,
      customer: transformedCustomer,
    })
  } catch (error) {
    console.error('Error fetching customer:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch customer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/customers/[id]
 *
 * Updates a customer by ID
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Build update object with only provided fields
    const updates: Record<string, any> = {}
    if (body.firstName !== undefined) updates.first_name = body.firstName
    if (body.lastName !== undefined) updates.last_name = body.lastName
    if (body.email !== undefined) updates.email = body.email
    if (body.phoneNumber !== undefined) updates.phone_number = body.phoneNumber
    if (body.alternatePhone !== undefined) updates.alternate_phone = body.alternatePhone
    if (body.address !== undefined) updates.address = body.address
    if (body.city !== undefined) updates.city = body.city
    if (body.state !== undefined) updates.state = body.state
    if (body.zipCode !== undefined) updates.zip_code = body.zipCode
    if (body.country !== undefined) updates.country = body.country
    if (body.notes !== undefined) updates.notes = body.notes
    if (body.status !== undefined) updates.status = body.status

    const { data: customer, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating customer:', error)
      throw new Error(`Failed to update customer: ${error.message}`)
    }

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Transform to frontend format
    const transformedCustomer = {
      id: customer.id,
      garageId: customer.garage_id,
      firstName: customer.first_name,
      lastName: customer.last_name,
      email: customer.email,
      phoneNumber: customer.phone_number,
      alternatePhone: customer.alternate_phone,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zip_code,
      country: customer.country,
      notes: customer.notes,
      status: customer.status,
      customerSince: customer.customer_since,
      createdAt: customer.created_at,
      updatedAt: customer.updated_at,
    }

    return NextResponse.json({
      success: true,
      customer: transformedCustomer,
    })
  } catch (error) {
    console.error('Error updating customer:', error)
    return NextResponse.json(
      {
        error: 'Failed to update customer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

