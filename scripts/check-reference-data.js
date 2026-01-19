/**
 * Check Reference Data for Job Cards Seed
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

async function checkData() {
  try {
    console.log('🔍 Checking reference data...\n')

    // Check garages
    const { data: garages, error: garageError } = await supabase
      .from('garages')
      .select('garage_uid, garage_name')
    console.log(`Garages: ${garages?.length || 0} found`)
    if (garageError) console.log(`  Error: ${garageError.message}`)

    // Check customers
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id')
    console.log(`\nCustomers: ${customers?.length || 0} found`)
    if (customerError) console.log(`  Error: ${customerError.message}`)

    // Check vehicles
    const { data: vehicles, error: vehicleError } = await supabase
      .from('customer_vehicles')
      .select('id')
    console.log(`\nVehicles: ${vehicles?.length || 0} found`)
    if (vehicleError) console.log(`  Error: ${vehicleError.message}`)

    // Check garage_auth
    const { data: users, error: userError } = await supabase
      .from('garage_auth')
      .select('user_uid')
    console.log(`\nGarage Auth Users: ${users?.length || 0} found`)
    if (userError) console.log(`  Error: ${userError.message}`)

    console.log('\n✅ Check complete\n')
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

checkData()
