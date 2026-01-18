import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * GET /api/vehicles/[id]
 *
 * Fetches a single vehicle by ID with customer information
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch vehicle with customer information
    const { data: vehicle, error } = await supabase
      .from('customer_vehicles')
      .select(`
        *,
        customer:customers(
          id,
          first_name,
          last_name,
          email,
          phone_number,
          alternate_phone,
          address,
          city,
          state,
          zip_code,
          country
        )
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching vehicle:', error)
      throw new Error(`Failed to fetch vehicle: ${error.message}`)
    }

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Transform to frontend format
    const transformedVehicle = {
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      licensePlate: vehicle.license_plate,
      color: vehicle.color || 'Not Specified',
      vin: vehicle.vin,
      engineNumber: vehicle.engine_number || 'Not Provided',
      chassisNumber: vehicle.chassis_number || vehicle.vin || 'Not Provided',
      category: vehicle.category || 'Other',
      currentMileage: vehicle.current_mileage,
      lastServiceDate: vehicle.last_service_date,
      status: vehicle.status,
      notes: vehicle.notes,
      createdAt: vehicle.created_at,
      updatedAt: vehicle.updated_at,
      customerId: vehicle.customer?.id,
      customerName: vehicle.customer
        ? `${vehicle.customer.first_name} ${vehicle.customer.last_name}`
        : 'Unknown',
      customerPhone: vehicle.customer?.phone_number,
      customerEmail: vehicle.customer?.email,
      customerAddress: vehicle.customer?.address
        ? `${vehicle.customer.address}${vehicle.customer.city ? ', ' + vehicle.customer.city : ''}${vehicle.customer.state ? ', ' + vehicle.customer.state : ''}${vehicle.customer.zip_code ? ' ' + vehicle.customer.zip_code : ''}`
        : undefined,
    }

    return NextResponse.json({
      success: true,
      vehicle: transformedVehicle,
    })
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch vehicle',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/vehicles/[id]
 *
 * Updates a vehicle by ID
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    if (!id) {
      return NextResponse.json(
        { error: 'Vehicle ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()
    const supabase = createAdminClient()

    // Check if new license plate already exists (if changed)
    if (body.licensePlate) {
      const { data: existing } = await supabase
        .from('customer_vehicles')
        .select('id, license_plate')
        .neq('id', id)
        .eq('license_plate', body.licensePlate)
        .limit(1)

      if (existing && existing.length > 0) {
        return NextResponse.json(
          { error: `License plate "${body.licensePlate}" is already registered to another vehicle` },
          { status: 400 }
        )
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {}
    if (body.licensePlate !== undefined) updates.license_plate = body.licensePlate
    if (body.color !== undefined) updates.color = body.color
    if (body.vin !== undefined) updates.vin = body.vin
    if (body.engineNumber !== undefined) updates.engine_number = body.engineNumber
    if (body.chassisNumber !== undefined) updates.chassis_number = body.chassisNumber
    if (body.category !== undefined) updates.category = body.category
    if (body.currentMileage !== undefined) updates.current_mileage = body.currentMileage
    if (body.status !== undefined) updates.status = body.status
    if (body.notes !== undefined) updates.notes = body.notes

    const { data: vehicle, error } = await supabase
      .from('customer_vehicles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating vehicle:', error)
      throw new Error(`Failed to update vehicle: ${error.message}`)
    }

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      vehicle: {
        id: vehicle.id,
        make: vehicle.make,
        model: vehicle.model,
        year: vehicle.year,
        licensePlate: vehicle.license_plate,
        color: vehicle.color,
        vin: vehicle.vin,
        engineNumber: vehicle.engine_number,
        chassisNumber: vehicle.chassis_number,
        category: vehicle.category,
        currentMileage: vehicle.current_mileage,
        lastServiceDate: vehicle.last_service_date,
        status: vehicle.status,
        notes: vehicle.notes,
        createdAt: vehicle.created_at,
        updatedAt: vehicle.updated_at,
      },
    })
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json(
      {
        error: 'Failed to update vehicle',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

