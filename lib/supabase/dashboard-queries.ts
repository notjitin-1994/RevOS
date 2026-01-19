import { createAdminClient } from './server'

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardCalendarJobCard {
  id: string
  jobCardNumber: string
  customerId: string
  vehicleId: string
  jobType: string
  priority: string
  status: string
  promisedDate: string | null
  promisedTime: string | null
  createdAt: string
  garageId: string
  // Customer data
  customerName: string
  customerPhone: string
  // Vehicle data
  vehicleMake: string
  vehicleModel: string
  vehicleYear: number
  vehicleLicensePlate: string
}

export interface JobCardStats {
  total: number
  active: number
  ready: number
}

export interface EmployeeStats {
  total: number
  active: number
  onLeave: number
}

export interface CustomerStats {
  total: number
  activeWithVehicles: number
  newThisMonth: number
}

export interface VehicleStats {
  total: number
}

export interface InventoryStats {
  total: number
  lowStock: number
  outOfStock: number
}

export interface BillingStats {
  pendingInvoices: number
  amountDue: number
  paidThisMonth: number
}

export interface DashboardStats {
  jobCards: JobCardStats
  employees: EmployeeStats
  customers: CustomerStats
  vehicles: VehicleStats
  inventory: InventoryStats
  billing: BillingStats
}

// ============================================================================
// JOB CARDS STATS
// ============================================================================

/**
 * Get job card statistics for dashboard
 * Returns total, active (queued, in_progress, parts_waiting, quality_check),
 * and ready (ready) counts
 */
export async function getJobCardStats(garageId: string): Promise<JobCardStats> {
  const supabase = createAdminClient()

  try {
    // Get total job cards (excluding deleted and cancelled)
    const { count: total, error: totalError } = await supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)
      .is('deleted_at', null)
      .neq('status', 'cancelled')

    if (totalError) {
      console.error('Error fetching total job cards:', totalError)
      throw new Error(`Failed to fetch total job cards: ${totalError.message}`)
    }

    // Get active job cards
    const { count: active, error: activeError } = await supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)
      .is('deleted_at', null)
      .in('status', ['queued', 'in_progress', 'parts_waiting', 'quality_check'])

    if (activeError) {
      console.error('Error fetching active job cards:', activeError)
      throw new Error(`Failed to fetch active job cards: ${activeError.message}`)
    }

    // Get ready for delivery job cards
    const { count: ready, error: readyError } = await supabase
      .from('job_cards')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)
      .is('deleted_at', null)
      .eq('status', 'ready')

    if (readyError) {
      console.error('Error fetching ready job cards:', readyError)
      throw new Error(`Failed to fetch ready job cards: ${readyError.message}`)
    }

    return {
      total: total || 0,
      active: active || 0,
      ready: ready || 0,
    }
  } catch (error) {
    console.error('Error in getJobCardStats:', error)
    // Return default values on error
    return {
      total: 0,
      active: 0,
      ready: 0,
    }
  }
}

// ============================================================================
// EMPLOYEES STATS
// ============================================================================

/**
 * Get employee statistics for dashboard
 * Returns total, active, and on-leave counts
 */
export async function getEmployeeStats(garageId: string): Promise<EmployeeStats> {
  const supabase = createAdminClient()

  try {
    // Get total employees (excluding inactive and owner role)
    const { count: total, error: totalError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)
      .neq('role', 'owner')

    if (totalError) {
      console.error('Error fetching total employees:', totalError)
      throw new Error(`Failed to fetch total employees: ${totalError.message}`)
    }

    // Get active employees
    const { count: active, error: activeError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)
      .eq('status', 'active')
      .neq('role', 'owner')

    if (activeError) {
      console.error('Error fetching active employees:', activeError)
      throw new Error(`Failed to fetch active employees: ${activeError.message}`)
    }

    // Get employees on leave
    const { count: onLeave, error: onLeaveError } = await supabase
      .from('employees')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)
      .eq('status', 'on-leave')
      .neq('role', 'owner')

    if (onLeaveError) {
      console.error('Error fetching on-leave employees:', onLeaveError)
      throw new Error(`Failed to fetch on-leave employees: ${onLeaveError.message}`)
    }

    return {
      total: total || 0,
      active: active || 0,
      onLeave: onLeave || 0,
    }
  } catch (error) {
    console.error('Error in getEmployeeStats:', error)
    return {
      total: 0,
      active: 0,
      onLeave: 0,
    }
  }
}

// ============================================================================
// CUSTOMERS STATS
// ============================================================================

/**
 * Get customer statistics for dashboard
 * Returns total, active with vehicles, and new this month counts
 */
export async function getCustomerStats(garageId: string): Promise<CustomerStats> {
  const supabase = createAdminClient()

  try {
    // Get total customers
    const { count: total, error: totalError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)

    if (totalError) {
      console.error('Error fetching total customers:', totalError)
      throw new Error(`Failed to fetch total customers: ${totalError.message}`)
    }

    // Get active customers with vehicles in garage
    // We need to find customers who have vehicles with status 'in-repair'
    const { data: vehiclesInRepair, error: vehiclesError } = await supabase
      .from('customer_vehicles')
      .select('customer_id')
      .eq('garage_id', garageId)
      .eq('status', 'in-repair')

    if (vehiclesError) {
      console.error('Error fetching vehicles in repair:', vehiclesError)
    }

    const uniqueCustomersWithVehicles = new Set(vehiclesInRepair?.map(v => v.customer_id) || [])

    // Get new customers this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const { count: newThisMonth, error: newError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)
      .gte('created_at', startOfMonth.toISOString())

    if (newError) {
      console.error('Error fetching new customers:', newError)
      throw new Error(`Failed to fetch new customers: ${newError.message}`)
    }

    return {
      total: total || 0,
      activeWithVehicles: uniqueCustomersWithVehicles.size,
      newThisMonth: newThisMonth || 0,
    }
  } catch (error) {
    console.error('Error in getCustomerStats:', error)
    return {
      total: 0,
      activeWithVehicles: 0,
      newThisMonth: 0,
    }
  }
}

// ============================================================================
// VEHICLES STATS
// ============================================================================

/**
 * Get vehicle statistics for dashboard
 * Returns total registered vehicles count
 */
export async function getVehicleStats(garageId: string): Promise<VehicleStats> {
  const supabase = createAdminClient()

  try {
    const { count, error } = await supabase
      .from('customer_vehicles')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)

    if (error) {
      console.error('Error fetching vehicle stats:', error)
      throw new Error(`Failed to fetch vehicle stats: ${error.message}`)
    }

    return {
      total: count || 0,
    }
  } catch (error) {
    console.error('Error in getVehicleStats:', error)
    return {
      total: 0,
    }
  }
}

// ============================================================================
// INVENTORY STATS
// ============================================================================

/**
 * Get inventory statistics for dashboard
 * Returns total, low stock, and out of stock counts
 */
export async function getInventoryStats(garageId: string): Promise<InventoryStats> {
  const supabase = createAdminClient()

  try {
    // Get total parts
    const { count: total, error: totalError } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)

    if (totalError) {
      console.error('Error fetching total parts:', totalError)
      throw new Error(`Failed to fetch total parts: ${totalError.message}`)
    }

    // Get low stock items
    const { count: lowStock, error: lowStockError } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)
      .eq('stock_status', 'low-stock')

    if (lowStockError) {
      console.error('Error fetching low stock parts:', lowStockError)
      throw new Error(`Failed to fetch low stock parts: ${lowStockError.message}`)
    }

    // Get out of stock items
    const { count: outOfStock, error: outOfStockError } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)
      .eq('stock_status', 'out-of-stock')

    if (outOfStockError) {
      console.error('Error fetching out of stock parts:', outOfStockError)
      throw new Error(`Failed to fetch out of stock parts: ${outOfStockError.message}`)
    }

    return {
      total: total || 0,
      lowStock: lowStock || 0,
      outOfStock: outOfStock || 0,
    }
  } catch (error) {
    console.error('Error in getInventoryStats:', error)
    return {
      total: 0,
      lowStock: 0,
      outOfStock: 0,
    }
  }
}

// ============================================================================
// BILLING STATS (Placeholder)
// ============================================================================

/**
 * Get billing statistics for dashboard
 * Currently returns placeholder values
 */
export async function getBillingStats(garageId: string): Promise<BillingStats> {
  // Placeholder implementation until billing module is built
  return {
    pendingInvoices: 0,
    amountDue: 0,
    paidThisMonth: 0,
  }
}

// ============================================================================
// COMBINED STATS
// ============================================================================

/**
 * Get all dashboard statistics in a single call
 * Useful for loading all data at once
 */
export async function getAllDashboardStats(garageId: string) {
  try {
    const [jobCardStats, employeeStats, customerStats, vehicleStats, inventoryStats, billingStats] =
      await Promise.all([
        getJobCardStats(garageId),
        getEmployeeStats(garageId),
        getCustomerStats(garageId),
        getVehicleStats(garageId),
        getInventoryStats(garageId),
        getBillingStats(garageId),
      ])

    return {
      jobCards: jobCardStats,
      employees: employeeStats,
      customers: customerStats,
      vehicles: vehicleStats,
      inventory: inventoryStats,
      billing: billingStats,
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

// ============================================================================
// CALENDAR DATA
// ============================================================================

/**
 * Get job cards for dashboard calendar with customer and vehicle data
 * Returns job cards that have a promised date scheduled
 */
export async function getDashboardCalendarJobCards(
  garageId: string
): Promise<DashboardCalendarJobCard[]> {
  const supabase = createAdminClient()

  try {
    const { data, error } = await supabase
      .from('job_cards')
      .select(`
        id,
        job_card_number,
        customer_id,
        vehicle_id,
        job_type,
        priority,
        status,
        promised_date,
        promised_time,
        created_at,
        garage_id,
        customers!inner (
          name,
          phone
        ),
        customer_vehicles!inner (
          make,
          model,
          year,
          license_plate
        )
      `)
      .eq('garage_id', garageId)
      .is('deleted_at', null)
      .not('promised_date', 'is', null)
      .order('promised_date', { ascending: true })

    if (error) {
      console.error('Error fetching calendar job cards:', error)
      throw new Error(`Failed to fetch calendar job cards: ${error.message}`)
    }

    return (data || []).map((jobCard: any) => ({
      id: jobCard.id,
      jobCardNumber: jobCard.job_card_number,
      customerId: jobCard.customer_id,
      vehicleId: jobCard.vehicle_id,
      jobType: jobCard.job_type,
      priority: jobCard.priority,
      status: jobCard.status,
      promisedDate: jobCard.promised_date,
      promisedTime: jobCard.promised_time,
      createdAt: jobCard.created_at,
      garageId: jobCard.garage_id,
      customerName: jobCard.customers?.name || 'Unknown',
      customerPhone: jobCard.customers?.phone || '',
      vehicleMake: jobCard.customer_vehicles?.make || 'Unknown',
      vehicleModel: jobCard.customer_vehicles?.model || '',
      vehicleYear: jobCard.customer_vehicles?.year || new Date().getFullYear(),
      vehicleLicensePlate: jobCard.customer_vehicles?.license_plate || '',
    }))
  } catch (error) {
    console.error('Error in getDashboardCalendarJobCards:', error)
    return []
  }
}
