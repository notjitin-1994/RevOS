import { createClient } from './client'
import type { SupabaseClient } from '@supabase/supabase-js'

export interface DbGarage {
  id?: string
  garage_id: string
  owner_id: string
  garage_name: string
  email: string | null
  phone_number: string | null
  alternate_phone_number: string | null
  whatsapp_number: string | null
  address: string | null
  city: string | null
  state: string | null
  zip_code: string | null
  country: string | null
  gstin: string | null
  business_registration_number: string | null
  business_type: string | null
  year_established: string | null
  website: string | null
  pan_number: string | null
  service_types: string[] | null
  vehicle_types_serviced: string[] | null
  number_of_service_bays: string | null
  certifications: string[] | null
  insurance_details: string | null
  payment_methods: string[] | null
  bank_name: string | null
  account_number: string | null
  ifsc_code: string | null
  branch: string | null
  default_labor_rate: string | null
  invoice_prefix: string | null
  parking_capacity: string | null
  waiting_area_amenities: string[] | null
  tow_service_available: boolean | null
  pickup_drop_service_available: boolean | null
  operating_hours: object | null
  tax_rate: string | null
  currency: string | null
  billing_cycle: string | null
  credit_terms: string | null
  notes: string | null
  created_at: string | null
  updated_at: string | null
}

export interface GarageData {
  garageId: string
  ownerId: string
  garageName: string
  email?: string | null
  phoneNumber?: string | null
  alternatePhoneNumber?: string | null
  whatsappNumber?: string | null
  address?: string | null
  city?: string | null
  state?: string | null
  zipCode?: string | null
  country?: string | null
  gstin?: string | null
  businessRegistrationNumber?: string | null
  businessType?: string | null
  yearEstablished?: string | null
  website?: string | null
  panNumber?: string | null
  serviceTypes?: string[] | null
  vehicleTypesServiced?: string[] | null
  numberOfServiceBays?: string | null
  certifications?: string[] | null
  insuranceDetails?: string | null
  paymentMethods?: string[] | null
  bankName?: string | null
  accountNumber?: string | null
  ifscCode?: string | null
  branch?: string | null
  defaultLaborRate?: string | null
  invoicePrefix?: string | null
  parkingCapacity?: string | null
  waitingAreaAmenities?: string[] | null
  towServiceAvailable?: boolean | null
  pickupDropServiceAvailable?: boolean | null
  operatingHours?: {
    weekdays?: string
    saturday?: string
    sunday?: string
  } | null
  taxRate?: string | null
  currency?: string | null
  billingCycle?: string | null
  creditTerms?: string | null
  notes?: string | null
  createdAt?: string | null
  updatedAt?: string | null
}

/**
 * Transform database garage data (snake_case) to frontend format (camelCase)
 */
function transformGarageData(dbGarage: DbGarage): GarageData {
  return {
    garageId: dbGarage.garage_id,
    ownerId: dbGarage.owner_id,
    garageName: dbGarage.garage_name,
    email: dbGarage.email,
    phoneNumber: dbGarage.phone_number,
    alternatePhoneNumber: dbGarage.alternate_phone_number,
    whatsappNumber: dbGarage.whatsapp_number,
    address: dbGarage.address,
    city: dbGarage.city,
    state: dbGarage.state,
    zipCode: dbGarage.zip_code,
    country: dbGarage.country,
    gstin: dbGarage.gstin,
    businessRegistrationNumber: dbGarage.business_registration_number,
    businessType: dbGarage.business_type,
    yearEstablished: dbGarage.year_established,
    website: dbGarage.website,
    panNumber: dbGarage.pan_number,
    serviceTypes: dbGarage.service_types,
    vehicleTypesServiced: dbGarage.vehicle_types_serviced,
    numberOfServiceBays: dbGarage.number_of_service_bays,
    certifications: dbGarage.certifications,
    insuranceDetails: dbGarage.insurance_details,
    paymentMethods: dbGarage.payment_methods,
    bankName: dbGarage.bank_name,
    accountNumber: dbGarage.account_number,
    ifscCode: dbGarage.ifsc_code,
    branch: dbGarage.branch,
    defaultLaborRate: dbGarage.default_labor_rate,
    invoicePrefix: dbGarage.invoice_prefix,
    parkingCapacity: dbGarage.parking_capacity,
    waitingAreaAmenities: dbGarage.waiting_area_amenities,
    towServiceAvailable: dbGarage.tow_service_available,
    pickupDropServiceAvailable: dbGarage.pickup_drop_service_available,
    operatingHours: dbGarage.operating_hours as {
      weekdays?: string
      saturday?: string
      sunday?: string
    } | null,
    taxRate: dbGarage.tax_rate,
    currency: dbGarage.currency,
    billingCycle: dbGarage.billing_cycle,
    creditTerms: dbGarage.credit_terms,
    notes: dbGarage.notes,
    createdAt: dbGarage.created_at,
    updatedAt: dbGarage.updated_at,
  }
}

/**
 * Fetch garage data by garage_id
 * @param garageId - Garage ID to fetch
 * @param client - Optional Supabase client. If not provided, creates browser client
 */
export async function getGarageByGarageId(
  garageId: string,
  client?: SupabaseClient
): Promise<GarageData | null> {
  const supabase = client || createClient()

  const { data, error } = await supabase
    .from('garages')
    .select('*')
    .eq('garage_id', garageId)
    .single()

  if (error) {
    console.error('Error fetching garage:', error)
    return null
  }

  if (!data) {
    return null
  }

  return transformGarageData(data)
}

/**
 * Fetch garage data by owner_id (user_uid)
 * @param ownerId - Owner ID (user_uid) to fetch garage for
 * @param client - Optional Supabase client
 */
export async function getGarageByOwnerId(
  ownerId: string,
  client?: SupabaseClient
): Promise<GarageData | null> {
  const supabase = client || createClient()

  const { data, error } = await supabase
    .from('garages')
    .select('*')
    .eq('owner_id', ownerId)
    .single()

  if (error) {
    console.error('Error fetching garage by owner:', error)
    return null
  }

  if (!data) {
    return null
  }

  return transformGarageData(data)
}

/**
 * Update garage data and sync to garage_auth table
 * @param garageId - Garage ID to update
 * @param updates - Fields to update
 * @param client - Optional Supabase client
 */
export async function updateGarage(
  garageId: string,
  updates: Partial<Omit<GarageData, 'garageId' | 'ownerId' | 'createdAt' | 'updatedAt'>>,
  client?: SupabaseClient
): Promise<boolean> {
  const supabase = client || createClient()

  console.log('[updateGarage] Starting update for garage_id:', garageId)
  console.log('[updateGarage] Updates received:', updates)
  console.log('[updateGarage] Using client:', client ? 'Admin client (provided)' : 'Default client (created)')

  // Transform camelCase to snake_case for database
  const dbUpdates: Record<string, any> = {}
  if (updates.garageName !== undefined) dbUpdates.garage_name = updates.garageName
  if (updates.email !== undefined) dbUpdates.email = updates.email
  if (updates.phoneNumber !== undefined) dbUpdates.phone_number = updates.phoneNumber
  if (updates.alternatePhoneNumber !== undefined) dbUpdates.alternate_phone_number = updates.alternatePhoneNumber
  if (updates.whatsappNumber !== undefined) dbUpdates.whatsapp_number = updates.whatsappNumber
  if (updates.address !== undefined) dbUpdates.address = updates.address
  if (updates.city !== undefined) dbUpdates.city = updates.city
  if (updates.state !== undefined) dbUpdates.state = updates.state
  if (updates.zipCode !== undefined) dbUpdates.zip_code = updates.zipCode
  if (updates.country !== undefined) dbUpdates.country = updates.country
  if (updates.gstin !== undefined) dbUpdates.gstin = updates.gstin
  if (updates.businessRegistrationNumber !== undefined) dbUpdates.business_registration_number = updates.businessRegistrationNumber
  if (updates.businessType !== undefined) dbUpdates.business_type = updates.businessType
  if (updates.yearEstablished !== undefined) dbUpdates.year_established = updates.yearEstablished
  if (updates.website !== undefined) dbUpdates.website = updates.website
  if (updates.panNumber !== undefined) dbUpdates.pan_number = updates.panNumber
  if (updates.serviceTypes !== undefined) dbUpdates.service_types = updates.serviceTypes
  if (updates.vehicleTypesServiced !== undefined) dbUpdates.vehicle_types_serviced = updates.vehicleTypesServiced
  if (updates.numberOfServiceBays !== undefined) dbUpdates.number_of_service_bays = updates.numberOfServiceBays
  if (updates.certifications !== undefined) dbUpdates.certifications = updates.certifications
  if (updates.insuranceDetails !== undefined) dbUpdates.insurance_details = updates.insuranceDetails
  if (updates.paymentMethods !== undefined) dbUpdates.payment_methods = updates.paymentMethods
  if (updates.bankName !== undefined) dbUpdates.bank_name = updates.bankName
  if (updates.accountNumber !== undefined) dbUpdates.account_number = updates.accountNumber
  if (updates.ifscCode !== undefined) dbUpdates.ifsc_code = updates.ifscCode
  if (updates.branch !== undefined) dbUpdates.branch = updates.branch
  if (updates.defaultLaborRate !== undefined) dbUpdates.default_labor_rate = updates.defaultLaborRate
  if (updates.invoicePrefix !== undefined) dbUpdates.invoice_prefix = updates.invoicePrefix
  if (updates.parkingCapacity !== undefined) dbUpdates.parking_capacity = updates.parkingCapacity
  if (updates.waitingAreaAmenities !== undefined) dbUpdates.waiting_area_amenities = updates.waitingAreaAmenities
  if (updates.towServiceAvailable !== undefined) dbUpdates.tow_service_available = updates.towServiceAvailable
  if (updates.pickupDropServiceAvailable !== undefined) dbUpdates.pickup_drop_service_available = updates.pickupDropServiceAvailable
  if (updates.operatingHours !== undefined) dbUpdates.operating_hours = updates.operatingHours
  if (updates.taxRate !== undefined) dbUpdates.tax_rate = updates.taxRate
  if (updates.currency !== undefined) dbUpdates.currency = updates.currency
  if (updates.billingCycle !== undefined) dbUpdates.billing_cycle = updates.billingCycle
  if (updates.creditTerms !== undefined) dbUpdates.credit_terms = updates.creditTerms
  if (updates.notes !== undefined) dbUpdates.notes = updates.notes

  // Automatically update updated_at timestamp
  dbUpdates.updated_at = new Date().toISOString()

  console.log('[updateGarage] Transformed updates for DB:', dbUpdates)

  // Update garages table
  console.log('[updateGarage] Updating garages table...')
  const { data: garageData, error: garageError } = await supabase
    .from('garages')
    .update(dbUpdates)
    .eq('garage_id', garageId)
    .select('garage_id, garage_name, email, phone_number')
    .single()

  if (garageError) {
    console.error('[updateGarage] Error updating garage:', garageError)
    console.error('[updateGarage] Error details:', {
      code: garageError.code,
      message: garageError.message,
      details: garageError.details,
      hint: garageError.hint,
    })
    return false
  }

  console.log('[updateGarage] Successfully updated garages table:', garageData)

  // Sync relevant fields to garage_auth table
  // Note: garage_auth only has authentication fields (garage_name, first_name, last_name, login_id, user_role)
  // It does NOT have email or phone_number - those stay in the garages/users tables
  const authUpdates: Record<string, any> = {
    updated_at: new Date().toISOString(),
  }

  // Use the actual values from the database response
  if (garageData && dbUpdates.garage_name) {
    authUpdates.garage_name = garageData.garage_name
  }

  console.log('[updateGarage] Prepared garage_auth updates:', authUpdates)
  console.log('[updateGarage] Number of fields to sync:', Object.keys(authUpdates).length)

  // Only update garage_auth if there are fields to sync (more than just updated_at)
  if (Object.keys(authUpdates).length > 1) {
    console.log('[updateGarage] Syncing to garage_auth table for garage_id:', garageId)

    // First, check if records exist in garage_auth (there can be multiple - owner + employees)
    const { data: existingAuthRecords, error: checkError, count: authCount } = await supabase
      .from('garage_auth')
      .select('garage_id, garage_name, user_uid')
      .eq('garage_id', garageId)

    if (checkError) {
      console.error('[updateGarage] Error checking garage_auth:', checkError)
      return false
    }

    if (!existingAuthRecords || existingAuthRecords.length === 0) {
      console.warn('[updateGarage] WARNING: No garage_auth records found for garage_id:', garageId)
      console.warn('[updateGarage] Skipping garage_auth update. Records need to be created first.')
    } else {
      console.log('[updateGarage] Found', existingAuthRecords.length, 'garage_auth records for garage_id:', garageId)

      // Update ALL records with this garage_id (not just one, since there can be multiple users per garage)
      const { data: authUpdateData, error: authError, count: updateCount } = await supabase
        .from('garage_auth')
        .update(authUpdates)
        .eq('garage_id', garageId)
        .select('garage_id, garage_name, updated_at')

      if (authError) {
        console.error('[updateGarage] Error syncing to garage_auth:', authError)
        console.error('[updateGarage] Error details:', {
          code: authError.code,
          message: authError.message,
          details: authError.details,
          hint: authError.hint,
        })
        return false
      }

      console.log('[updateGarage] Successfully synced to garage_auth table')
      console.log('[updateGarage] Updated', updateCount, 'garage_auth records')
      if (authUpdateData && authUpdateData.length > 0) {
        console.log('[updateGarage] Sample updated record:', authUpdateData[0])
      }
    }
  } else {
    console.log('[updateGarage] No fields to sync to garage_auth (only updated_at)')
  }

  return true
}
