/**
 * Add More Job Cards for Demo
 *
 * This script adds additional job cards by reusing existing customers/vehicles
 * to provide a better variety for presentations.
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

// Additional job cards with varied statuses
const additionalJobCards = [
  {
    job_card_number: 'JC-2025-0004',
    status: 'queued',
    priority: 'medium',
    job_type: 'maintenance',
    customer_complaint: 'Regular maintenance due. Customer wants to keep vehicle in optimal condition.',
    work_requested: 'Oil and filter change. Check and top up all fluid levels.',
    current_mileage: 15000,
    promised_date: '2025-01-28',
    promised_time: '10:00',
    estimated_labor_cost: 800,
    estimated_parts_cost: 400,
    actual_labor_cost: 0,
    actual_parts_cost: 0,
    final_amount: 1200,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0005',
    status: 'queued',
    priority: 'low',
    job_type: 'repair',
    customer_complaint: 'Air conditioning not cooling properly.',
    work_requested: 'Inspect AC system. Check refrigerant level, compressor, and condenser.',
    current_mileage: 3500,
    promised_date: '2025-02-05',
    promised_time: '09:00',
    estimated_labor_cost: 1500,
    estimated_parts_cost: 3500,
    actual_labor_cost: 0,
    actual_parts_cost: 0,
    final_amount: 5000,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0006',
    status: 'parts_waiting',
    priority: 'high',
    job_type: 'repair',
    customer_complaint: 'Clutch slipping. Engine revs but vehicle doesnt accelerate properly.',
    work_requested: 'Replace clutch kit, pressure plate, and release bearing. Special order part required.',
    current_mileage: 22000,
    promised_date: '2025-01-30',
    promised_time: '12:00',
    estimated_labor_cost: 6000,
    estimated_parts_cost: 19000,
    actual_labor_cost: 6200,
    actual_parts_cost: 19500,
    final_amount: 25700,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0007',
    status: 'quality_check',
    priority: 'medium',
    job_type: 'maintenance',
    customer_complaint: 'Annual service completed. Awaiting final inspection and customer approval.',
    work_requested: 'Perform final quality check. Test drive to verify all work completed correctly.',
    current_mileage: 4500,
    promised_date: '2025-01-22',
    promised_time: '16:00',
    estimated_labor_cost: 2000,
    estimated_parts_cost: 2500,
    actual_labor_cost: 2100,
    actual_parts_cost: 2600,
    final_amount: 4700,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0008',
    status: 'ready',
    priority: 'low',
    job_type: 'maintenance',
    customer_complaint: 'Vehicle pulling to one side. Wheel alignment completed.',
    work_requested: 'Alignment done within specs. Ready for delivery.',
    current_mileage: 1500,
    promised_date: '2025-01-21',
    promised_time: '11:00',
    estimated_labor_cost: 1200,
    estimated_parts_cost: 300,
    actual_labor_cost: 1250,
    actual_parts_cost: 320,
    final_amount: 1570,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0009',
    status: 'delivered',
    priority: 'low',
    job_type: 'maintenance',
    customer_complaint: 'Engine misfiring. Spark plugs worn out.',
    work_requested: 'Replaced all spark plugs. Engine running smoothly. Vehicle delivered.',
    current_mileage: 3000,
    promised_date: '2025-01-15',
    promised_time: '14:00',
    estimated_labor_cost: 1500,
    estimated_parts_cost: 1500,
    actual_labor_cost: 1600,
    actual_parts_cost: 1550,
    final_amount: 3150,
    payment_status: 'paid',
  },
  {
    job_card_number: 'JC-2025-0010',
    status: 'draft',
    priority: 'high',
    job_type: 'repair',
    customer_complaint: 'Timing belt due for replacement at 90,000 km. Preventive maintenance.',
    work_requested: 'Replace timing belt, water pump, and tensioners. Full job estimate needed.',
    current_mileage: 18000,
    promised_date: null,
    promised_time: null,
    estimated_labor_cost: 0,
    estimated_parts_cost: 0,
    actual_labor_cost: 0,
    actual_parts_cost: 0,
    final_amount: 0,
    payment_status: 'pending',
  },
]

async function addMoreJobCards() {
  try {
    console.log('🌱 Adding more job cards for demo...\n')

    // Get garage
    const { data: garages } = await supabase
      .from('garages')
      .select('garage_uid')
      .limit(1)
    const garageId = garages[0].garage_uid

    // Get customers and vehicles (reuse existing)
    const { data: customers } = await supabase
      .from('customers')
      .select('id')

    const { data: vehicles } = await supabase
      .from('customer_vehicles')
      .select('id, make, model, year, license_plate, vin')

    const { data: users } = await supabase
      .from('garage_auth')
      .select('user_uid')

    console.log(`✅ Using ${customers.length} customers and ${vehicles.length} vehicles\n`)

    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < additionalJobCards.length; i++) {
      const jobCard = additionalJobCards[i]

      // Cycle through customers and vehicles
      const customerIndex = i % customers.length
      const vehicleIndex = i % vehicles.length

      const insertData = {
        garage_id: garageId,
        job_card_number: jobCard.job_card_number,
        customer_id: customers[customerIndex].id,
        customer_name: `Customer ${customerIndex + 1}`,
        customer_phone: `+12345678${String(customerIndex).padStart(4, '0')}`,
        customer_email: `customer${customerIndex + 1}@email.com`,
        vehicle_id: vehicles[vehicleIndex].id,
        vehicle_make: vehicles[vehicleIndex].make || 'Honda',
        vehicle_model: vehicles[vehicleIndex].model || 'Civic',
        vehicle_year: vehicles[vehicleIndex].year || 2020,
        vehicle_license_plate: vehicles[vehicleIndex].license_plate || `ABC-${String(i).padStart(4, '0')}`,
        vehicle_vin: vehicles[vehicleIndex].vin || `VIN${String(i).padStart(16, '0')}`,
        current_mileage: jobCard.current_mileage,
        status: jobCard.status,
        priority: jobCard.priority,
        job_type: jobCard.job_type,
        customer_complaint: jobCard.customer_complaint,
        work_requested: jobCard.work_requested,
        customer_notes: null,
        promised_date: jobCard.promised_date,
        promised_time: jobCard.promised_time,
        estimated_labor_cost: jobCard.estimated_labor_cost,
        estimated_parts_cost: jobCard.estimated_parts_cost,
        actual_labor_cost: jobCard.actual_labor_cost,
        actual_parts_cost: jobCard.actual_parts_cost,
        final_amount: jobCard.final_amount,
        payment_status: jobCard.payment_status,
        service_advisor_id: users[0].user_uid,
        lead_mechanic_id: jobCard.status === 'in_progress' ||
                          jobCard.status === 'parts_waiting' ||
                          jobCard.status === 'quality_check'
                          ? users[1]?.user_uid || null
                          : null,
        created_by: users[0].user_uid,
      }

      const { error } = await supabase
        .from('job_cards')
        .insert(insertData)

      if (error) {
        console.error(`❌ Error inserting ${jobCard.job_card_number}:`, error.message)
        errorCount++
      } else {
        successCount++
        console.log(`✅ Inserted ${jobCard.job_card_number}`)
      }
    }

    console.log(`\n✅ Successfully inserted ${successCount} additional job cards`)
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} job cards failed to insert`)
    }

    // Show final summary
    const { data: jobCards } = await supabase
      .from('job_cards')
      .select('status, priority')
      .order('created_at', { ascending: false })

    if (jobCards) {
      const summary = {}
      jobCards.forEach((jc) => {
        const key = `${jc.status}/${jc.priority}`
        summary[key] = (summary[key] || 0) + 1
      })

      console.log('\n📊 Final Job Cards Summary:')
      console.log('─'.repeat(50))
      Object.entries(summary)
        .sort(([a], [b]) => a.localeCompare(b))
        .forEach(([key, count]) => {
          const [status, priority] = key.split('/')
          console.log(`  ${status.padEnd(20)} | ${priority.padEnd(10)} | ${count}`)
        })
      console.log('─'.repeat(50))
      console.log(`  Total: ${jobCards.length} job cards\n`)
    }

    console.log('✅ Done!\n')
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.error(error.stack)
  }
}

addMoreJobCards()
