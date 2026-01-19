/**
 * Execute Job Cards Seed Data
 *
 * This script inserts placeholder job card data into your Supabase database.
 * Usage: node scripts/execute-seed-job-cards.js
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables from .env.local
dotenv.config({ path: join(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Job card data matching the actual schema
const jobCardsData = [
  // HIGH PRIORITY - IN PROGRESS
  {
    job_card_number: 'JC-2025-0001',
    status: 'in_progress',
    priority: 'high',
    job_type: 'repair',
    customer_complaint:
      'Engine making grinding noise when accelerating above 40 km/h. Customer concerned about potential damage.',
    work_requested:
      'Complete engine teardown, inspect timing belt, tensioner, and related components. Replace worn parts.',
    customer_notes: 'Customer wants OEM parts only.',
    current_mileage: 45000,
    promised_date: '2025-01-25',
    promised_time: '17:00',
    estimated_labor_cost: 8000,
    estimated_parts_cost: 7000,
    actual_labor_cost: 8500,
    actual_parts_cost: 7200,
    final_amount: 15700,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0002',
    status: 'in_progress',
    priority: 'urgent',
    job_type: 'repair',
    customer_complaint:
      'Complete brake failure. Vehicle unsafe to drive. Customer had vehicle towed to garage.',
    work_requested:
      'Replace all brake pads, rotors, and brake fluid. Inspect brake lines for leaks.',
    customer_notes: 'Urgent repair needed.',
    current_mileage: 32000,
    promised_date: '2025-01-20',
    promised_time: '14:00',
    estimated_labor_cost: 4000,
    estimated_parts_cost: 4500,
    actual_labor_cost: 4200,
    actual_parts_cost: 4600,
    final_amount: 8800,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0003',
    status: 'in_progress',
    priority: 'high',
    job_type: 'repair',
    customer_complaint:
      'Vehicle vibrating at high speeds. Customer notices vibration especially on highways.',
    work_requested:
      'Inspect front and rear suspension. Check wheel bearings, tie rods, and control arms. Replace worn components.',
    current_mileage: 28000,
    promised_date: '2025-01-24',
    promised_time: '16:00',
    estimated_labor_cost: 3500,
    estimated_parts_cost: 2500,
    actual_labor_cost: 3600,
    actual_parts_cost: 2600,
    final_amount: 6200,
    payment_status: 'pending',
  },

  // MEDIUM PRIORITY - QUEUED
  {
    job_card_number: 'JC-2025-0004',
    status: 'queued',
    priority: 'medium',
    job_type: 'maintenance',
    customer_complaint:
      'Regular maintenance due. Customer wants to keep vehicle in optimal condition.',
    work_requested:
      'Oil and filter change. Check and top up all fluid levels. Inspect belts and hoses.',
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
    priority: 'medium',
    job_type: 'maintenance',
    customer_complaint:
      'Tires worn below safe limit. Customer noticed reduced traction in rain.',
    work_requested:
      'Replace all 4 tires. Perform wheel alignment and balancing.',
    customer_notes: 'Customer wants Michelin tires.',
    current_mileage: 8500,
    promised_date: '2025-01-29',
    promised_time: '11:00',
    estimated_labor_cost: 1200,
    estimated_parts_cost: 16800,
    actual_labor_cost: 0,
    actual_parts_cost: 0,
    final_amount: 18000,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0006',
    status: 'queued',
    priority: 'medium',
    job_type: 'repair',
    customer_complaint:
      'Battery not holding charge. Vehicle difficult to start in mornings.',
    work_requested:
      'Test charging system and battery. Replace battery if needed. Check alternator output.',
    current_mileage: 6500,
    promised_date: '2025-01-26',
    promised_time: '15:00',
    estimated_labor_cost: 500,
    estimated_parts_cost: 4000,
    actual_labor_cost: 0,
    actual_parts_cost: 0,
    final_amount: 4500,
    payment_status: 'pending',
  },

  // LOW PRIORITY - QUEUED
  {
    job_card_number: 'JC-2025-0007',
    status: 'queued',
    priority: 'low',
    job_type: 'repair',
    customer_complaint:
      'Air conditioning not cooling properly. Customer notices weak airflow.',
    work_requested:
      'Inspect AC system. Check refrigerant level, compressor, and condenser.',
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
    job_card_number: 'JC-2025-0008',
    status: 'queued',
    priority: 'low',
    job_type: 'maintenance',
    customer_complaint:
      'Headlight dim. Customer failed safety inspection.',
    work_requested:
      'Replace headlight bulbs. Check all exterior lights.',
    current_mileage: 800,
    promised_date: '2025-02-10',
    promised_time: '13:00',
    estimated_labor_cost: 500,
    estimated_parts_cost: 1000,
    actual_labor_cost: 0,
    actual_parts_cost: 0,
    final_amount: 1500,
    payment_status: 'pending',
  },

  // PARTS WAITING
  {
    job_card_number: 'JC-2025-0009',
    status: 'parts_waiting',
    priority: 'high',
    job_type: 'repair',
    customer_complaint:
      'Clutch slipping. Engine revs but vehicle doesnt accelerate properly.',
    work_requested:
      'Replace clutch kit, pressure plate, and release bearing. Special order part required.',
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
    job_card_number: 'JC-2025-0010',
    status: 'parts_waiting',
    priority: 'medium',
    job_type: 'repair',
    customer_complaint:
      'Vehicle stalling intermittently. Fuel pump suspected.',
    work_requested:
      'Replace fuel pump and fuel filter. Awaiting OEM part delivery.',
    current_mileage: 12000,
    promised_date: '2025-02-01',
    promised_time: '14:00',
    estimated_labor_cost: 2500,
    estimated_parts_cost: 5000,
    actual_labor_cost: 2600,
    actual_parts_cost: 5200,
    final_amount: 7800,
    payment_status: 'pending',
  },

  // QUALITY CHECK
  {
    job_card_number: 'JC-2025-0011',
    status: 'quality_check',
    priority: 'medium',
    job_type: 'maintenance',
    customer_complaint:
      'Annual service completed. Awaiting final inspection and customer approval.',
    work_requested:
      'Perform final quality check. Test drive to verify all work completed correctly.',
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
    job_card_number: 'JC-2025-0012',
    status: 'quality_check',
    priority: 'low',
    job_type: 'maintenance',
    customer_complaint:
      'Transmission fluid dark and burnt. Flush completed. Awaiting quality inspection.',
    work_requested:
      'Perform final road test. Check for smooth shifting. Verify no leaks.',
    current_mileage: 3500,
    promised_date: '2025-01-23',
    promised_time: '10:00',
    estimated_labor_cost: 1800,
    estimated_parts_cost: 1700,
    actual_labor_cost: 1900,
    actual_parts_cost: 1750,
    final_amount: 3650,
    payment_status: 'pending',
  },

  // READY
  {
    job_card_number: 'JC-2025-0013',
    status: 'ready',
    priority: 'medium',
    job_type: 'repair',
    customer_complaint:
      'Exhaust loud and rattling. Muffler and exhaust pipe replaced.',
    work_requested:
      'Vehicle ready for pickup. Invoice generated. Waiting for customer.',
    current_mileage: 9500,
    promised_date: '2025-01-20',
    promised_time: '15:00',
    estimated_labor_cost: 2000,
    estimated_parts_cost: 7500,
    actual_labor_cost: 2100,
    actual_parts_cost: 7800,
    final_amount: 9900,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0014',
    status: 'ready',
    priority: 'low',
    job_type: 'maintenance',
    customer_complaint:
      'Vehicle pulling to one side. Wheel alignment completed.',
    work_requested:
      'Alignment done within specs. Ready for delivery.',
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
    job_card_number: 'JC-2025-0015',
    status: 'ready',
    priority: 'low',
    job_type: 'inspection',
    customer_complaint:
      'Pre-purchase inspection completed. Vehicle in good condition.',
    work_requested:
      'Inspection report ready. Customer notified of findings.',
    current_mileage: 1000,
    promised_date: '2025-01-19',
    promised_time: '13:00',
    estimated_labor_cost: 800,
    estimated_parts_cost: 200,
    actual_labor_cost: 850,
    actual_parts_cost: 210,
    final_amount: 1060,
    payment_status: 'pending',
  },

  // DELIVERED
  {
    job_card_number: 'JC-2025-0016',
    status: 'delivered',
    priority: 'low',
    job_type: 'maintenance',
    customer_complaint:
      'Engine misfiring. Spark plugs worn out at 60,000 km.',
    work_requested:
      'Replaced all spark plugs. Engine running smoothly. Vehicle delivered.',
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
    job_card_number: 'JC-2025-0017',
    status: 'delivered',
    priority: 'low',
    job_type: 'maintenance',
    customer_complaint:
      'Coolant low and dirty. Overheating in traffic.',
    work_requested:
      'Flushed coolant system. Replaced thermostat. Vehicle delivered.',
    current_mileage: 2000,
    promised_date: '2025-01-14',
    promised_time: '10:00',
    estimated_labor_cost: 1000,
    estimated_parts_cost: 1000,
    actual_labor_cost: 1050,
    actual_parts_cost: 1020,
    final_amount: 2070,
    payment_status: 'paid',
  },

  // DRAFT
  {
    job_card_number: 'JC-2025-0018',
    status: 'draft',
    priority: 'high',
    job_type: 'repair',
    customer_complaint:
      'Timing belt due for replacement at 90,000 km. Preventive maintenance.',
    work_requested:
      'Replace timing belt, water pump, and tensioners. Full job estimate needed.',
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
  {
    job_card_number: 'JC-2025-0019',
    status: 'draft',
    priority: 'medium',
    job_type: 'inspection',
    customer_complaint:
      'Check engine light on. Customer wants diagnostic scan.',
    work_requested:
      'Perform full diagnostic scan. Identify fault codes. Provide estimate for repairs.',
    current_mileage: 1500,
    promised_date: null,
    promised_time: null,
    estimated_labor_cost: 0,
    estimated_parts_cost: 0,
    actual_labor_cost: 0,
    actual_parts_cost: 0,
    final_amount: 0,
    payment_status: 'pending',
  },
  {
    job_card_number: 'JC-2025-0020',
    status: 'draft',
    priority: 'low',
    job_type: 'maintenance',
    customer_complaint:
      'Customer wants full detailing package for upcoming wedding.',
    work_requested:
      'Complete exterior and interior detailing. Wax, polish, interior cleaning.',
    customer_notes: 'Customer requested premium package.',
    current_mileage: 5000,
    promised_date: '2025-02-15',
    promised_time: '09:00',
    estimated_labor_cost: 0,
    estimated_parts_cost: 0,
    actual_labor_cost: 0,
    actual_parts_cost: 0,
    final_amount: 0,
    payment_status: 'pending',
  },
]

async function seedJobCards() {
  try {
    console.log('🌱 Starting job cards seed data insertion...\n')

    // Get garage ID (using garage_uid as primary key)
    const { data: garages, error: garageError } = await supabase
      .from('garages')
      .select('garage_uid')
      .limit(1)

    if (garageError) {
      throw new Error(`Failed to fetch garage: ${garageError.message}`)
    }

    if (!garages || garages.length === 0) {
      throw new Error('No garage found in database')
    }

    const garageId = garages[0].garage_uid
    console.log(`✅ Using garage: ${garageId}\n`)

    // Get customers, vehicles, and users for foreign key references
    const { data: customers, error: customerError } = await supabase
      .from('customers')
      .select('id')
      .limit(20)

    const { data: vehicles, error: vehicleError } = await supabase
      .from('customer_vehicles')
      .select('id, make, model, year, license_plate, vin')
      .limit(20)

    const { data: users, error: userError } = await supabase
      .from('garage_auth')
      .select('user_uid')
      .limit(5)

    if (customerError || vehicleError || userError) {
      throw new Error('Failed to fetch reference data')
    }

    const availableCustomers = customers?.length || 0
    const availableVehicles = vehicles?.length || 0
    const availableUsers = users?.length || 0

    console.log(`✅ Found ${availableCustomers} customers, ${availableVehicles} vehicles, ${availableUsers} users\n`)

    // Determine how many job cards we can create
    const maxJobCards = Math.min(
      availableCustomers,
      availableVehicles,
      jobCardsData.length
    )

    if (maxJobCards === 0) {
      throw new Error('Insufficient reference data. Please seed customers and vehicles first.')
    }

    console.log(`📊 Will create ${maxJobCards} job cards based on available data\n`)

    // Insert job cards
    let successCount = 0
    let errorCount = 0

    for (let i = 0; i < maxJobCards; i++) {
      const jobCard = jobCardsData[i]

      // Prepare the data with all required fields
      const insertData = {
        garage_id: garageId,
        job_card_number: jobCard.job_card_number,
        customer_id: customers[i].id,
        customer_name: `Customer ${i + 1}`,
        customer_phone: `+12345678${String(i).padStart(4, '0')}`,
        customer_email: `customer${i + 1}@email.com`,
        vehicle_id: vehicles[i].id,
        vehicle_make: vehicles[i].make || 'Honda',
        vehicle_model: vehicles[i].model || 'Civic',
        vehicle_year: vehicles[i].year || 2020,
        vehicle_license_plate: vehicles[i].license_plate || `ABC-${String(i).padStart(4, '0')}`,
        vehicle_vin: vehicles[i].vin || `VIN${String(i).padStart(16, '0')}`,
        current_mileage: jobCard.current_mileage,
        status: jobCard.status,
        priority: jobCard.priority,
        job_type: jobCard.job_type,
        customer_complaint: jobCard.customer_complaint,
        work_requested: jobCard.work_requested,
        customer_notes: jobCard.customer_notes || null,
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
                          ? users[1].user_uid
                          : null,
        created_by: users[0].user_uid,
      }

      const { data, error } = await supabase
        .from('job_cards')
        .insert(insertData)
        .select()

      if (error) {
        console.error(`❌ Error inserting job card ${jobCard.job_card_number}:`, error.message)
        errorCount++
      } else {
        successCount++
        if (successCount % 5 === 0 || successCount === maxJobCards) {
          console.log(`✅ Inserted ${successCount}/${maxJobCards} job cards...`)
        }
      }
    }

    console.log(`\n✅ Successfully inserted ${successCount} job cards`)
    if (errorCount > 0) {
      console.log(`⚠️  ${errorCount} job cards failed to insert`)
    }

    // Verification
    console.log('\n📊 Verifying insertion...\n')

    const { data: jobCards, error } = await supabase
      .from('job_cards')
      .select('status, priority, job_card_number')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('❌ Error verifying insertion:', error.message)
    } else {
      const summary = {}
      jobCards.forEach((jc) => {
        const key = `${jc.status}/${jc.priority}`
        summary[key] = (summary[key] || 0) + 1
      })

      console.log('Job Cards Summary:')
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

    console.log('✅ Seed data insertion complete!\n')
  } catch (error) {
    console.error('❌ Fatal error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

seedJobCards()
