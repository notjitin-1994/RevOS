/**
 * Test Frontend-Backend Connection
 * Verifies that the frontend can fetch garage ID and job cards
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

async function testConnection() {
  console.log('🧪 Testing Frontend-Backend Connection\n')

  try {
    // Step 1: Fetch garage ID (simulates what happens when no garage ID in session)
    console.log('Step 1: Fetching garage ID from database...')
    const { data: garages, error: garageError } = await supabase
      .from('garages')
      .select('garage_uid')
      .limit(1)

    if (garageError) {
      console.error('❌ Error fetching garage:', garageError.message)
      return
    }

    if (!garages || garages.length === 0) {
      console.error('❌ No garages found in database')
      return
    }

    const garageId = garages[0].garage_uid
    console.log(`✅ Garage ID found: ${garageId}\n`)

    // Step 2: Fetch job cards for this garage (simulates useJobCards hook)
    console.log('Step 2: Fetching job cards for garage...')
    const { data: jobCards, error: jobCardsError } = await supabase
      .from('job_cards')
      .select('*')
      .eq('garage_id', garageId)
      .order('created_at', { ascending: false })

    if (jobCardsError) {
      console.error('❌ Error fetching job cards:', jobCardsError.message)
      return
    }

    if (!jobCards || jobCards.length === 0) {
      console.warn('⚠️  No job cards found for this garage')
      return
    }

    console.log(`✅ Found ${jobCards.length} job cards\n`)

    // Step 3: Transform data (simulates data transformation in hook)
    console.log('Step 3: Transforming data to frontend format...')
    const transformedData = jobCards.map((item) => ({
      id: item.id,
      jobCardNumber: item.job_card_number,
      customerId: item.customer_id,
      vehicleId: item.vehicle_id,
      jobType: item.job_type,
      priority: item.priority,
      status: item.status,
      customerComplaint: item.customer_complaint,
      workRequested: item.work_requested,
      currentMileage: item.current_mileage,
      promisedDate: item.promised_date,
      leadMechanicId: item.lead_mechanic_id,
      createdAt: item.created_at,
      updatedAt: item.updated_at,
      garageId: item.garage_id,
      customerName: item.customer_name,
      customerPhone: item.customer_phone,
      vehicleMake: item.vehicle_make,
      vehicleModel: item.vehicle_model,
      vehicleYear: item.vehicle_year,
      vehicleLicensePlate: item.vehicle_license_plate,
    }))

    console.log('✅ Data transformation complete\n')

    // Step 4: Display sample transformed data
    console.log('Step 4: Sample transformed data (first 3 job cards):')
    console.log('━'.repeat(80))
    transformedData.slice(0, 3).forEach((jobCard, index) => {
      console.log(`\nJob Card ${index + 1}:`)
      console.log(`  Number:    ${jobCard.jobCardNumber}`)
      console.log(`  Status:    ${jobCard.status} (${jobCard.priority} priority)`)
      console.log(`  Customer:  ${jobCard.customerName} - ${jobCard.customerPhone}`)
      console.log(`  Vehicle:   ${jobCard.vehicleYear} ${jobCard.vehicleMake} ${jobCard.vehicleModel}`)
      console.log(`  Plate:     ${jobCard.vehicleLicensePlate}`)
      console.log(`  Complaint: ${jobCard.customerComplaint?.substring(0, 60)}...`)
    })

    console.log('\n' + '━'.repeat(80))
    console.log('\n✅ Frontend-Backend Connection Test Passed!')
    console.log(`\n📊 Summary:`)
    console.log(`  - Garage ID: ${garageId}`)
    console.log(`  - Total Job Cards: ${jobCards.length}`)
    console.log(`  - Data is ready to be displayed in the UI`)
    console.log(`\n🌐 Open http://localhost:3002/job-cards in your browser to view the job cards`)
    console.log(`\n💡 Open browser console (F12) to see debug logs:`)
    console.log(`   - "✅ Using garage ID from session: [garageId]"`)
    console.log(`   - "✅ Fetched garage ID from database: [garageId]"`)
    console.log(`   - "🔍 Fetching job cards for garage: [garageId]"`)
    console.log(`   - "✅ Fetched [count] job cards"`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  }
}

testConnection()
