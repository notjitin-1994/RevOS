'use server'

import {
  createCustomer,
  getCustomersByGarageId,
  getCustomerById,
  updateCustomer,
  deleteCustomer as deleteCustomerQuery,
  addVehicleToCustomer,
  updateVehicle,
  deleteVehicle as deleteVehicleQuery,
  searchCustomers,
  type CreateCustomerInput,
  type CustomerWithVehicles,
  type CustomerData,
  type CustomerVehicleData,
  type CreateVehicleInput,
} from '@/lib/supabase/customer-queries'

// Re-export types for convenience
export type { CreateCustomerInput, CustomerWithVehicles, CustomerData, CustomerVehicleData, CreateVehicleInput }

// ============================================================================
// CUSTOMER ACTIONS
// ============================================================================

/**
 * Server action to create a new customer with vehicles
 */
export async function createCustomerAction(input: CreateCustomerInput): Promise<{
  success: boolean
  error?: string
  customer?: CustomerData
}> {
  return await createCustomer(input)
}

/**
 * Server action to get all customers for a garage
 */
export async function getCustomersByGarageIdAction(garageId: string): Promise<CustomerWithVehicles[]> {
  return await getCustomersByGarageId(garageId)
}

/**
 * Server action to get a single customer by ID
 */
export async function getCustomerByIdAction(customerId: string): Promise<CustomerWithVehicles | null> {
  return await getCustomerById(customerId)
}

/**
 * Server action to update a customer
 */
export async function updateCustomerAction(
  customerId: string,
  updates: Partial<Omit<CustomerData, 'id' | 'garageId' | 'customerSince' | 'createdAt' | 'updatedAt'>>
): Promise<{
  success: boolean
  error?: string
  customer?: CustomerData
}> {
  return await updateCustomer(customerId, updates)
}

/**
 * Server action to delete (soft delete) a customer
 */
export async function deleteCustomerAction(customerId: string): Promise<{
  success: boolean
  error?: string
}> {
  return await deleteCustomerQuery(customerId)
}

/**
 * Server action to search customers
 */
export async function searchCustomersAction(garageId: string, query: string): Promise<CustomerWithVehicles[]> {
  return await searchCustomers(garageId, query)
}

// ============================================================================
// VEHICLE ACTIONS
// ============================================================================

/**
 * Server action to add a vehicle to an existing customer
 */
export async function addVehicleToCustomerAction(
  customerId: string,
  garageId: string,
  vehicle: CreateVehicleInput
): Promise<{
  success: boolean
  error?: string
  vehicleData?: CustomerVehicleData
}> {
  return await addVehicleToCustomer(customerId, garageId, vehicle)
}

/**
 * Server action to update a vehicle
 */
export async function updateVehicleAction(
  vehicleId: string,
  updates: Partial<Omit<CustomerVehicleData, 'id' | 'customerId' | 'garageId' | 'make' | 'model' | 'year' | 'createdAt' | 'updatedAt'>>
): Promise<{
  success: boolean
  error?: string
  vehicleData?: CustomerVehicleData
}> {
  return await updateVehicle(vehicleId, updates)
}

/**
 * Server action to delete a vehicle
 */
export async function deleteVehicleAction(vehicleId: string): Promise<{
  success: boolean
  error?: string
}> {
  return await deleteVehicleQuery(vehicleId)
}
