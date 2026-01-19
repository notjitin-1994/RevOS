/**
 * Show Actual Job Cards Data from Database
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

async function showJobCardsData() {
  try {
    console.log('🔍 Fetching job cards from database...\n')

    // Get all job cards with full details
    const { data: jobCards, error } = await supabase
      .from('job_cards')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error fetching job cards:', error.message)
      return
    }

    if (!jobCards || jobCards.length === 0) {
      console.log('⚠️  No job cards found in database')
      return
    }

    console.log(`✅ Found ${jobCards.length} job cards:\n`)

    jobCards.forEach((jc, index) => {
      console.log(`━`.repeat(80))
      console.log(`📋 Job Card #${index + 1}: ${jc.job_card_number}`)
      console.log(`━`.repeat(80))
      console.log(`ID:              ${jc.id}`)
      console.log(`Status:          ${jc.status} (Priority: ${jc.priority})`)
      console.log(`Customer:        ${jc.customer_name}`)
      console.log(`Customer Phone:  ${jc.customer_phone}`)
      console.log(`Vehicle:         ${jc.vehicle_year} ${jc.vehicle_make} ${jc.vehicle_model}`)
      console.log(`License Plate:   ${jc.vehicle_license_plate}`)
      console.log(`VIN:             ${jc.vehicle_vin}`)
      console.log(`Complaint:       ${jc.customer_complaint}`)
      console.log(`Work Requested:  ${jc.work_requested}`)
      console.log(`Mileage:         ${jc.current_mileage} km`)
      console.log(`Promised Date:   ${jc.promised_date || 'Not set'} ${jc.promised_time || ''}`)
      console.log(`Lead Mechanic:   ${jc.lead_mechanic_id || 'Unassigned'}`)
      console.log(`Job Type:        ${jc.job_type}`)
      console.log(`Est. Labor:      $${jc.estimated_labor_cost}`)
      console.log(`Est. Parts:      $${jc.estimated_parts_cost}`)
      console.log(`Actual Labor:    $${jc.actual_labor_cost}`)
      console.log(`Actual Parts:    $${jc.actual_parts_cost}`)
      console.log(`Final Amount:    $${jc.final_amount}`)
      console.log(`Payment Status:  ${jc.payment_status}`)
      console.log(`Garage ID:       ${jc.garage_id}`)
      console.log(`Created At:      ${jc.created_at}`)
      console.log(`Updated At:      ${jc.updated_at}`)
      console.log()
    })

    // Summary by status
    console.log('\n📊 Summary by Status:')
    console.log('━'.repeat(80))
    const summary = {}
    jobCards.forEach((jc) => {
      const key = `${jc.status}/${jc.priority}`
      summary[key] = (summary[key] || 0) + 1
    })

    Object.entries(summary)
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([key, count]) => {
        const [status, priority] = key.split('/')
        console.log(`  ${status.padEnd(20)} | ${priority.padEnd(10)} | ${count}`)
      })

    console.log('━'.repeat(80))
    console.log(`  Total: ${jobCards.length} job cards\n`)

  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  }
}

showJobCardsData()
