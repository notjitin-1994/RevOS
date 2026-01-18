import { createClient, createAdminClient } from './server'
import type { SupabaseClient } from '@supabase/supabase-js'

// ============================================================================
// TYPES
// ============================================================================

export interface DbCustomer {
  id: string
  garage_id: string
  first_name: string
  last_name: string
  email: string | null
  phone_number: string
  alternate_phone: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  notes: string | null
  status: 'active' | 'inactive'
  customer_since: string
  created_at: string
  updated_at: string
}

export interface CustomerData {
  id: string
  garageId: string
  firstName: string
  lastName: string
  email: string | null
  phoneNumber: string
  alternatePhone: string | null
  address: string | null
  city: string | null
  state: string | null
  zipCode: string | null
  country: string | null
  notes: string | null
  status: 'active' | 'inactive'
  customerSince: string
  createdAt: string
  updatedAt: string
}

export interface DbCustomerVehicle {
  id: string
  customer_id: string
  garage_id: string
  make: string
  model: string
  year: number
  license_plate: string
  color: string | null
  vin: string | null
  engine_number: string | null
  chassis_number: string | null
  category: string | null
  current_mileage: number | null
  last_service_date: string | null
  status: 'active' | 'inactive' | 'in-repair'
  notes: string | null
  created_at: string
  updated_at: string
}

export interface CustomerVehicleData {
  id: string
  customerId: string
  garageId: string
  make: string
  model: string
  year: number
  licensePlate: string
  color: string | null
  vin: string | null
  engineNumber: string | null
  chassisNumber: string | null
  category: string | null
  currentMileage: number | null
  lastServiceDate: string | null
  status: 'active' | 'inactive' | 'in-repair'
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CustomerWithVehicles extends CustomerData {
  vehicles: CustomerVehicleData[]
}

export interface CreateCustomerInput {
  garageId: string
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  alternatePhone?: string
  address?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
  notes?: string
  vehicles: CreateVehicleInput[]
}

export interface CreateVehicleInput {
  make: string
  model: string
  year: number
  licensePlate: string
  color?: string
  vin?: string
  engineNumber?: string
  chassisNumber?: string
  category?: string
  currentMileage?: number
  notes?: string
}

// ============================================================================
// TRANSFORM FUNCTIONS
// ============================================================================

function transformCustomerData(dbCustomer: DbCustomer): CustomerData {
  return {
    id: dbCustomer.id,
    garageId: dbCustomer.garage_id,
    firstName: dbCustomer.first_name,
    lastName: dbCustomer.last_name,
    email: dbCustomer.email,
    phoneNumber: dbCustomer.phone_number,
    alternatePhone: dbCustomer.alternate_phone,
    address: dbCustomer.address,
    city: dbCustomer.city,
    state: dbCustomer.state,
    zipCode: dbCustomer.zip_code,
    country: dbCustomer.country,
    notes: dbCustomer.notes,
    status: dbCustomer.status,
    customerSince: dbCustomer.customer_since,
    createdAt: dbCustomer.created_at,
    updatedAt: dbCustomer.updated_at,
  }
}

function transformVehicleData(dbVehicle: DbCustomerVehicle): CustomerVehicleData {
  return {
    id: dbVehicle.id,
    customerId: dbVehicle.customer_id,
    garageId: dbVehicle.garage_id,
    make: dbVehicle.make,
    model: dbVehicle.model,
    year: dbVehicle.year,
    licensePlate: dbVehicle.license_plate,
    color: dbVehicle.color,
    vin: dbVehicle.vin,
    engineNumber: dbVehicle.engine_number,
    chassisNumber: dbVehicle.chassis_number,
    category: dbVehicle.category,
    currentMileage: dbVehicle.current_mileage,
    lastServiceDate: dbVehicle.last_service_date,
    status: dbVehicle.status,
    notes: dbVehicle.notes,
    createdAt: dbVehicle.created_at,
    updatedAt: dbVehicle.updated_at,
  }
}

function customerToDbInput(customer: CreateCustomerInput): Omit<DbCustomer, 'id' | 'customer_since' | 'created_at' | 'updated_at' | 'status'> {
  return {
    garage_id: customer.garageId,
    first_name: customer.firstName,
    last_name: customer.lastName,
    email: customer.email || null,
    phone_number: customer.phoneNumber,
    alternate_phone: customer.alternatePhone || null,
    address: customer.address || null,
    city: customer.city || null,
    state: customer.state || null,
    zip_code: customer.zipCode || null,
    country: customer.country || null,
    notes: customer.notes || null,
  }
}

function vehicleToDbInput(vehicle: CreateVehicleInput, customerId: string, garageId: string): Omit<DbCustomerVehicle, 'id' | 'last_service_date' | 'created_at' | 'updated_at' | 'status'> {
  return {
    customer_id: customerId,
    garage_id: garageId,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    license_plate: vehicle.licensePlate,
    color: vehicle.color || null,
    vin: vehicle.vin || null,
    engine_number: vehicle.engineNumber || null,
    chassis_number: vehicle.chassisNumber || null,
    category: vehicle.category || null,
    current_mileage: vehicle.currentMileage || null,
    notes: vehicle.notes || null,
  }
}

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Get all customers for a garage
 */
export async function getCustomersByGarageId(garageId: string): Promise<CustomerWithVehicles[]> {
  const supabase = await createClient()

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('garage_id', garageId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching customers:', error)
    throw new Error(`Failed to fetch customers: ${error.message}`)
  }

  if (!customers || customers.length === 0) {
    return []
  }

  // Get all vehicles for these customers
  const customerIds = customers.map((c) => c.id)
  const { data: vehicles, error: vehiclesError } = await supabase
    .from('customer_vehicles')
    .select('*')
    .in('customer_id', customerIds)
    .order('created_at', { ascending: false })

  if (vehiclesError) {
    console.error('Error fetching vehicles:', vehiclesError)
    // Continue without vehicles
  }

  // Group vehicles by customer_id
  const vehiclesByCustomer: Record<string, CustomerVehicleData[]> = {}
  if (vehicles) {
    for (const vehicle of vehicles) {
      if (!vehiclesByCustomer[vehicle.customer_id]) {
        vehiclesByCustomer[vehicle.customer_id] = []
      }
      vehiclesByCustomer[vehicle.customer_id].push(transformVehicleData(vehicle))
    }
  }

  // Combine customers with their vehicles
  return customers.map((customer) => ({
    ...transformCustomerData(customer),
    vehicles: vehiclesByCustomer[customer.id] || [],
  }))
}

/**
 * Get a single customer by ID with their vehicles
 */
export async function getCustomerById(customerId: string): Promise<CustomerWithVehicles | null> {
  const supabase = await createClient()

  const { data: customer, error } = await supabase
    .from('customers')
    .select('*')
    .eq('id', customerId)
    .single()

  if (error) {
    console.error('Error fetching customer:', error)
    throw new Error(`Failed to fetch customer: ${error.message}`)
  }

  if (!customer) {
    return null
  }

  // Get vehicles for this customer
  const { data: vehicles, error: vehiclesError } = await supabase
    .from('customer_vehicles')
    .select('*')
    .eq('customer_id', customerId)
    .order('created_at', { ascending: false })

  if (vehiclesError) {
    console.error('Error fetching vehicles:', vehiclesError)
  }

  return {
    ...transformCustomerData(customer),
    vehicles: vehicles?.map(transformVehicleData) || [],
  }
}

/**
 * Create a new customer with vehicles
 */
export async function createCustomer(input: CreateCustomerInput): Promise<{ success: boolean; error?: string; customer?: CustomerData }> {
  const supabase = createAdminClient()

  try {
    // Check if license plates already exist in this garage
    for (const vehicle of input.vehicles) {
      const { data: existing } = await supabase
        .from('customer_vehicles')
        .select('license_plate')
        .eq('garage_id', input.garageId)
        .eq('license_plate', vehicle.licensePlate)
        .limit(1)

      if (existing && existing.length > 0) {
        return {
          success: false,
          error: `License plate "${vehicle.licensePlate}" is already registered in this garage.`,
        }
      }
    }

    // Create customer
    const dbCustomer = customerToDbInput(input)
    const { data: customerData, error: customerError } = await supabase
      .from('customers')
      .insert([dbCustomer])
      .select()
      .single()

    if (customerError) {
      console.error('Error creating customer:', customerError)
      return {
        success: false,
        error: `Failed to create customer: ${customerError.message}`,
      }
    }

    // Create vehicles
    if (input.vehicles.length > 0) {
      const vehiclesToInsert = input.vehicles.map((v) =>
        vehicleToDbInput(v, customerData.id, input.garageId)
      )

      const { error: vehiclesError } = await supabase
        .from('customer_vehicles')
        .insert(vehiclesToInsert)

      if (vehiclesError) {
        console.error('Error creating vehicles:', vehiclesError)
        // Customer was created but vehicles failed - log this
        console.error('Customer created successfully but vehicles failed to create')
      }
    }

    return {
      success: true,
      customer: transformCustomerData(customerData),
    }
  } catch (error) {
    console.error('Error in createCustomer:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'An error occurred while creating customer',
    }
  }
}

/**
 * Update an existing customer
 */
export async function updateCustomer(
  customerId: string,
  updates: Partial<Omit<CustomerData, 'id' | 'garageId' | 'customerSince' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; error?: string; customer?: CustomerData }> {
  const supabase = createAdminClient()

  // Transform updates to DB format
  const dbUpdates: Record<string, any> = {}
  if (updates.firstName !== undefined) dbUpdates.first_name = updates.firstName
  if (updates.lastName !== undefined) dbUpdates.last_name = updates.lastName
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber
  if (updates.alternatePhone !== undefined) dbUpdates.alternate_phone = updates.alternatePhone
  if (updates.address !== undefined) dbUpdates.address = updates.address
  if (updates.city !== undefined) dbUpdates.city = updates.city
  if (updates.state !== undefined) dbUpdates.state = updates.state
  if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode
  if (updates.country !== undefined) dbUpdates.country = updates.country
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes
  if (updates.status !== undefined) dbUpdates.status = updates.status

  const { data: customerData, error } = await supabase
    .from('customers')
    .update(dbUpdates)
    .eq('id', customerId)
    .select()
    .single()

  if (error) {
    console.error('Error updating customer:', error)
    return {
      success: false,
      error: `Failed to update customer: ${error.message}`,
    }
  }

  return {
    success: true,
    customer: transformCustomerData(customerData),
  }
}

/**
 * Delete (soft delete) a customer by setting status to inactive
 */
export async function deleteCustomer(customerId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('customers')
    .update({ status: 'inactive' })
    .eq('id', customerId)

  if (error) {
    console.error('Error deleting customer:', error)
    return {
      success: false,
      error: `Failed to delete customer: ${error.message}`,
    }
  }

  return { success: true }
}

/**
 * Add a vehicle to an existing customer
 */
export async function addVehicleToCustomer(
  customerId: string,
  garageId: string,
  vehicle: CreateVehicleInput
): Promise<{ success: boolean; error?: string; vehicleData?: CustomerVehicleData }> {
  const supabase = createAdminClient()

  // Check if license plate already exists
  const { data: existing } = await supabase
    .from('customer_vehicles')
    .select('license_plate')
    .eq('garage_id', garageId)
    .eq('license_plate', vehicle.licensePlate)
    .limit(1)

  if (existing && existing.length > 0) {
    return {
      success: false,
      error: `License plate "${vehicle.licensePlate}" is already registered in this garage.`,
    }
  }

  const dbVehicle = vehicleToDbInput(vehicle, customerId, garageId)

  const { data: vehicleData, error } = await supabase
    .from('customer_vehicles')
    .insert([dbVehicle])
    .select()
    .single()

  if (error) {
    console.error('Error adding vehicle:', error)
    return {
      success: false,
      error: `Failed to add vehicle: ${error.message}`,
    }
  }

  return {
    success: true,
    vehicleData: transformVehicleData(vehicleData),
  }
}

/**
 * Update an existing vehicle
 */
export async function updateVehicle(
  vehicleId: string,
  updates: Partial<Omit<CustomerVehicleData, 'id' | 'customerId' | 'garageId' | 'make' | 'model' | 'year' | 'createdAt' | 'updatedAt'>>
): Promise<{ success: boolean; error?: string; vehicleData?: CustomerVehicleData }> {
  const supabase = createAdminClient()

  // Transform updates to DB format
  const dbUpdates: Record<string, any> = {}
  if (updates.licensePlate !== undefined) dbUpdates.license_plate = updates.licensePlate
  if (updates.color !== undefined) dbUpdates.color = updates.color
  if (updates.vin !== undefined) dbUpdates.vin = updates.vin
  if (updates.engineNumber !== undefined) dbUpdates.engine_number = updates.engineNumber
  if (updates.currentMileage !== undefined) dbUpdates.current_mileage = updates.currentMileage
  if (updates.lastServiceDate !== undefined) dbUpdates.last_service_date = updates.lastServiceDate
  if (updates.status !== undefined) dbUpdates.status = updates.status
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes

  const { data: vehicleData, error } = await supabase
    .from('customer_vehicles')
    .update(dbUpdates)
    .eq('id', vehicleId)
    .select()
    .single()

  if (error) {
    console.error('Error updating vehicle:', error)
    return {
      success: false,
      error: `Failed to update vehicle: ${error.message}`,
    }
  }

  return {
    success: true,
    vehicleData: transformVehicleData(vehicleData),
  }
}

/**
 * Delete a vehicle
 */
export async function deleteVehicle(vehicleId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('customer_vehicles')
    .delete()
    .eq('id', vehicleId)

  if (error) {
    console.error('Error deleting vehicle:', error)
    return {
      success: false,
      error: `Failed to delete vehicle: ${error.message}`,
    }
  }

  return { success: true }
}

/**
 * Search customers by name, phone, or email
 */
export async function searchCustomers(garageId: string, query: string): Promise<CustomerWithVehicles[]> {
  const supabase = await createClient()

  const { data: customers, error } = await supabase
    .from('customers')
    .select('*')
    .eq('garage_id', garageId)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,phone_number.ilike.%${query}%,email.ilike.%${query}%`)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error searching customers:', error)
    throw new Error(`Failed to search customers: ${error.message}`)
  }

  if (!customers || customers.length === 0) {
    return []
  }

  // Get vehicles for these customers
  const customerIds = customers.map((c) => c.id)
  const { data: vehicles } = await supabase
    .from('customer_vehicles')
    .select('*')
    .in('customer_id', customerIds)

  // Group vehicles by customer_id
  const vehiclesByCustomer: Record<string, CustomerVehicleData[]> = {}
  if (vehicles) {
    for (const vehicle of vehicles) {
      if (!vehiclesByCustomer[vehicle.customer_id]) {
        vehiclesByCustomer[vehicle.customer_id] = []
      }
      vehiclesByCustomer[vehicle.customer_id].push(transformVehicleData(vehicle))
    }
  }

  return customers.map((customer) => ({
    ...transformCustomerData(customer),
    vehicles: vehiclesByCustomer[customer.id] || [],
  }))
}

/**
 * Get all vehicles for a garage with customer information
 * Used for Vehicle Registry page
 */
export async function getVehiclesByGarageId(garageId: string) {
  const supabase = await createClient()

  const { data: vehicles, error } = await supabase
    .from('customer_vehicles')
    .select('*')
    .eq('garage_id', garageId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching vehicles:', error)
    throw new Error(`Failed to fetch vehicles: ${error.message}`)
  }

  if (!vehicles || vehicles.length === 0) {
    return []
  }

  // Get customer information for all vehicles
  const customerIds = vehicles.map((v) => v.customer_id)
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .in('id', customerIds)

  if (customersError) {
    console.error('Error fetching customers:', customersError)
  }

  // Create a map for quick lookup
  const customerMap = new Map()
  if (customers) {
    for (const customer of customers) {
      customerMap.set(customer.id, {
        id: customer.id,
        firstName: customer.first_name,
        lastName: customer.last_name,
        phoneNumber: customer.phone_number,
        email: customer.email,
      })
    }
  }

  // Combine vehicles with customer data
  return vehicles.map((vehicle) => {
    const customer = customerMap.get(vehicle.customer_id)
    return {
      ...transformVehicleData(vehicle),
      customerName: customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown',
      customerPhone: customer?.phoneNumber || null,
      customerEmail: customer?.email || null,
    }
  })
}
