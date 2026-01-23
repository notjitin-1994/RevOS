import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SECRET_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Job card updates with realistic data
const jobCardUpdates = [
  {
    jobCardNumber: 'JC-2025-0001',
    laborHours: 4.5,
    laborCost: 2700,
    partsCost: 4500,
    totalCost: 7200,
    promisedDate: '2025-01-25',
    promisedTime: '17:00',
    status: 'in_progress',
  },
  {
    jobCardNumber: 'JC-2025-0002',
    laborHours: 6.0,
    laborCost: 3600,
    partsCost: 8500,
    totalCost: 12100,
    promisedDate: '2025-01-20',
    promisedTime: '14:00',
    status: 'in_progress',
  },
  {
    jobCardNumber: 'JC-2025-0003',
    laborHours: 3.5,
    laborCost: 2100,
    partsCost: 3200,
    totalCost: 5300,
    promisedDate: '2025-01-24',
    promisedTime: '16:00',
    status: 'in_progress',
  },
  {
    jobCardNumber: 'JC-2025-0004',
    laborHours: 5.0,
    laborCost: 3000,
    partsCost: 5400,
    totalCost: 8400,
    promisedDate: '2025-01-28',
    promisedTime: '12:00',
    status: 'in_progress',
  },
  {
    jobCardNumber: 'JC-2025-0005',
    laborHours: 2.0,
    laborCost: 1200,
    partsCost: 1800,
    totalCost: 3000,
    promisedDate: '2025-02-05',
    promisedTime: '15:00',
    status: 'queued',
  },
  {
    jobCardNumber: 'JC-2025-0006',
    laborHours: 7.5,
    laborCost: 4500,
    partsCost: 12000,
    totalCost: 16500,
    promisedDate: '2025-01-30',
    promisedTime: '18:00',
    status: 'parts_waiting',
  },
  {
    jobCardNumber: 'JC-2025-0007',
    laborHours: 4.0,
    laborCost: 2400,
    partsCost: 3800,
    totalCost: 6200,
    promisedDate: '2025-01-22',
    promisedTime: '13:00',
    status: 'quality_check',
  },
  {
    jobCardNumber: 'JC-2025-0008',
    laborHours: 3.0,
    laborCost: 1800,
    partsCost: 2200,
    totalCost: 4000,
    promisedDate: '2025-01-21',
    promisedTime: '11:00',
    status: 'ready',
  },
  {
    jobCardNumber: 'JC-2025-0009',
    laborHours: 2.5,
    laborCost: 1500,
    partsCost: 2500,
    totalCost: 4000,
    promisedDate: '2025-01-15',
    promisedTime: '10:00',
    status: 'delivered',
  },
  {
    jobCardNumber: 'JC-2025-0010',
    laborHours: 8.0,
    laborCost: 4800,
    partsCost: 15000,
    totalCost: 19800,
    promisedDate: '2025-02-01',
    promisedTime: '17:00',
    status: 'draft',
  },
]

// Checklist items for each job card
const checklistItemsByJobCard: Record<string, Array<{
  itemName: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  estimatedMinutes: number
  actualMinutes: number
  laborRate: number
  displayOrder: number
  completedAt: string | null
}>> = {
  'JC-2025-0001': [
    { itemName: 'Inspect brake system', description: 'Check all brake pads, rotors, and lines', status: 'completed', priority: 'urgent', estimatedMinutes: 60, actualMinutes: 45, laborRate: 600, displayOrder: 1, completedAt: new Date().toISOString() },
    { itemName: 'Replace front brake pads', description: 'Install new front brake pads', status: 'completed', priority: 'urgent', estimatedMinutes: 90, actualMinutes: 75, laborRate: 600, displayOrder: 2, completedAt: new Date().toISOString() },
    { itemName: 'Replace rear brake pads', description: 'Install new rear brake pads', status: 'in_progress', priority: 'urgent', estimatedMinutes: 90, actualMinutes: 30, laborRate: 600, displayOrder: 3, completedAt: null },
    { itemName: 'Replace brake rotors', description: 'Install new brake rotors front and rear', status: 'pending', priority: 'high', estimatedMinutes: 120, actualMinutes: 0, laborRate: 600, displayOrder: 4, completedAt: null },
    { itemName: 'Replace brake fluid', description: 'Flush and replace brake fluid', status: 'pending', priority: 'high', estimatedMinutes: 60, actualMinutes: 0, laborRate: 600, displayOrder: 5, completedAt: null },
    { itemName: 'Test drive and final inspection', description: 'Test brakes and verify safety', status: 'pending', priority: 'urgent', estimatedMinutes: 30, actualMinutes: 0, laborRate: 600, displayOrder: 6, completedAt: null },
  ],
  'JC-2025-0002': [
    { itemName: 'Diagnose engine noise', description: 'Identify source of unusual engine noise', status: 'completed', priority: 'high', estimatedMinutes: 90, actualMinutes: 120, laborRate: 600, displayOrder: 1, completedAt: new Date().toISOString() },
    { itemName: 'Replace timing belt', description: 'Install new timing belt kit', status: 'in_progress', priority: 'high', estimatedMinutes: 180, actualMinutes: 90, laborRate: 700, displayOrder: 2, completedAt: null },
    { itemName: 'Replace water pump', description: 'Install new water pump', status: 'pending', priority: 'high', estimatedMinutes: 120, actualMinutes: 0, laborRate: 700, displayOrder: 3, completedAt: null },
    { itemName: 'Inspect tensioners', description: 'Check and replace if needed', status: 'pending', priority: 'medium', estimatedMinutes: 60, actualMinutes: 0, laborRate: 700, displayOrder: 4, completedAt: null },
    { itemName: 'Test engine operation', description: 'Verify repair and test drive', status: 'pending', priority: 'high', estimatedMinutes: 60, actualMinutes: 0, laborRate: 600, displayOrder: 5, completedAt: null },
  ],
  'JC-2025-0003': [
    { itemName: 'Initial inspection', description: 'Check bike condition and document issues', status: 'completed', priority: 'high', estimatedMinutes: 60, actualMinutes: 45, laborRate: 600, displayOrder: 1, completedAt: new Date().toISOString() },
    { itemName: 'Pre-delivery service', description: 'Complete PDS checklist', status: 'in_progress', priority: 'high', estimatedMinutes: 180, actualMinutes: 120, laborRate: 600, displayOrder: 2, completedAt: null },
    { itemName: 'Installation of accessories', description: 'Install guards and carrier', status: 'pending', priority: 'medium', estimatedMinutes: 90, actualMinutes: 0, laborRate: 600, displayOrder: 3, completedAt: null },
    { itemName: 'Final quality check', description: 'Complete PDS documentation', status: 'pending', priority: 'high', estimatedMinutes: 60, actualMinutes: 0, laborRate: 600, displayOrder: 4, completedAt: null },
  ],
  'JC-2025-0004': [
    { itemName: 'Oil and filter change', description: 'Replace engine oil and oil filter', status: 'completed', priority: 'medium', estimatedMinutes: 60, actualMinutes: 50, laborRate: 600, displayOrder: 1, completedAt: new Date().toISOString() },
    { itemName: 'Air filter replacement', description: 'Install new air filter', status: 'completed', priority: 'medium', estimatedMinutes: 30, actualMinutes: 25, laborRate: 500, displayOrder: 2, completedAt: new Date().toISOString() },
    { itemName: 'Chain adjustment and lubrication', description: 'Adjust chain tension and lubricate', status: 'in_progress', priority: 'medium', estimatedMinutes: 45, actualMinutes: 20, laborRate: 500, displayOrder: 3, completedAt: null },
    { itemName: 'Brake inspection', description: 'Check brake pads and fluid', status: 'pending', priority: 'high', estimatedMinutes: 60, actualMinutes: 0, laborRate: 500, displayOrder: 4, completedAt: null },
    { itemName: 'Tire pressure check', description: 'Check and adjust tire pressures', status: 'pending', priority: 'low', estimatedMinutes: 15, actualMinutes: 0, laborRate: 500, displayOrder: 5, completedAt: null },
  ],
  'JC-2025-0005': [
    { itemName: 'General inspection', description: 'Overall vehicle health check', status: 'pending', priority: 'low', estimatedMinutes: 60, actualMinutes: 0, laborRate: 600, displayOrder: 1, completedAt: null },
    { itemName: 'Fluid top-up', description: 'Check and top up all fluids', status: 'pending', priority: 'low', estimatedMinutes: 30, actualMinutes: 0, laborRate: 600, displayOrder: 2, completedAt: null },
    { itemName: 'Battery check', description: 'Test battery health and connections', status: 'pending', priority: 'medium', estimatedMinutes: 30, actualMinutes: 0, laborRate: 600, displayOrder: 3, completedAt: null },
  ],
  'JC-2025-0006': [
    { itemName: 'Awaiting parts delivery', description: 'Parts ordered from supplier', status: 'in_progress', priority: 'high', estimatedMinutes: 0, actualMinutes: 0, laborRate: 0, displayOrder: 1, completedAt: null },
    { itemName: 'Clutch plate replacement', description: 'Replace worn clutch plates', status: 'pending', priority: 'high', estimatedMinutes: 180, actualMinutes: 0, laborRate: 700, displayOrder: 2, completedAt: null },
    { itemName: 'Clutch cable adjustment', description: 'Adjust clutch cable free play', status: 'pending', priority: 'medium', estimatedMinutes: 30, actualMinutes: 0, laborRate: 600, displayOrder: 3, completedAt: null },
    { itemName: 'Test ride', description: 'Verify clutch operation', status: 'pending', priority: 'high', estimatedMinutes: 30, actualMinutes: 0, laborRate: 600, displayOrder: 4, completedAt: null },
  ],
  'JC-2025-0007': [
    { itemName: 'Service work completed', description: 'All service tasks finished', status: 'completed', priority: 'medium', estimatedMinutes: 240, actualMinutes: 240, laborRate: 600, displayOrder: 1, completedAt: new Date().toISOString() },
    { itemName: 'Quality control inspection', description: 'Final QC check before delivery', status: 'in_progress', priority: 'high', estimatedMinutes: 60, actualMinutes: 0, laborRate: 600, displayOrder: 2, completedAt: null },
    { itemName: 'Clean and polish', description: 'Clean vehicle for delivery', status: 'pending', priority: 'low', estimatedMinutes: 60, actualMinutes: 0, laborRate: 500, displayOrder: 3, completedAt: null },
  ],
  'JC-2025-0008': [
    { itemName: 'Routine service completed', description: 'All routine service tasks done', status: 'completed', priority: 'medium', estimatedMinutes: 180, actualMinutes: 180, laborRate: 600, displayOrder: 1, completedAt: new Date().toISOString() },
    { itemName: 'Final inspection', description: 'Pre-delivery inspection passed', status: 'completed', priority: 'high', estimatedMinutes: 60, actualMinutes: 60, laborRate: 600, displayOrder: 2, completedAt: new Date().toISOString() },
  ],
  'JC-2025-0009': [
    { itemName: 'Service and delivery completed', description: 'All work completed and delivered', status: 'completed', priority: 'medium', estimatedMinutes: 150, actualMinutes: 150, laborRate: 600, displayOrder: 1, completedAt: new Date().toISOString() },
  ],
  'JC-2025-0010': [
    { itemName: 'Timing belt inspection', description: 'Inspect timing belt condition', status: 'pending', priority: 'high', estimatedMinutes: 60, actualMinutes: 0, laborRate: 600, displayOrder: 1, completedAt: null },
    { itemName: 'Water pump inspection', description: 'Check water pump for leaks', status: 'pending', priority: 'high', estimatedMinutes: 45, actualMinutes: 0, laborRate: 600, displayOrder: 2, completedAt: null },
    { itemName: 'Tensioner inspection', description: 'Inspect all tensioners', status: 'pending', priority: 'high', estimatedMinutes: 60, actualMinutes: 0, laborRate: 600, displayOrder: 3, completedAt: null },
    { itemName: 'Provide estimate', description: 'Create detailed cost estimate', status: 'pending', priority: 'medium', estimatedMinutes: 30, actualMinutes: 0, laborRate: 600, displayOrder: 4, completedAt: null },
  ],
}

// Vehicle details to update
const vehicleUpdates = [
  { licensePlate: 'KL22TN6182', color: 'Matte Black', fuelType: 'Petrol', transmission: 'Manual' },
  { licensePlate: 'KA03LB3232', color: 'Orange', fuelType: 'Petrol', transmission: 'Manual' },
  { licensePlate: 'KA04HS6300', color: 'Black', fuelType: 'Petrol', transmission: 'Manual' },
  { licensePlate: 'KA05MK1234', color: 'White', fuelType: 'Petrol', transmission: 'Manual' },
  { licensePlate: 'KL01AB5678', color: 'Red', fuelType: 'Petrol', transmission: 'Manual' },
]

async function main() {
  console.log('🔧 Starting database population...\n')

  // Update job cards
  console.log('📝 Updating job cards...')
  for (const update of jobCardUpdates) {
    const { data, error } = await supabase
      .from('job_cards')
      .update({
        labor_hours: update.laborHours,
        labor_cost: update.laborCost,
        parts_cost: update.partsCost,
        total_cost: update.totalCost,
        promised_date: update.promisedDate,
        promised_time: update.promisedTime,
        status: update.status,
        total_checklist_items: checklistItemsByJobCard[update.jobCardNumber]?.length || 0,
        completed_checklist_items: checklistItemsByJobCard[update.jobCardNumber]?.filter(i => i.status === 'completed').length || 0,
        progress_percentage: Math.round((checklistItemsByJobCard[update.jobCardNumber]?.filter(i => i.status === 'completed').length || 0) / (checklistItemsByJobCard[update.jobCardNumber]?.length || 1) * 100),
      })
      .eq('job_card_number', update.jobCardNumber)
      .select()

    if (error) {
      console.error(`  ❌ Error updating ${update.jobCardNumber}:`, error.message)
    } else {
      console.log(`  ✅ Updated ${update.jobCardNumber}: ${update.laborHours}h labor, ₹${update.totalCost} total`)
    }
  }

  // Create checklist items
  console.log('\n✅ Creating checklist items...')
  for (const [jobCardNumber, items] of Object.entries(checklistItemsByJobCard)) {
    // Get job card ID
    const { data: jobCard } = await supabase
      .from('job_cards')
      .select('id')
      .eq('job_card_number', jobCardNumber)
      .single()

    if (!jobCard) {
      console.error(`  ❌ Job card ${jobCardNumber} not found`)
      continue
    }

    // Delete existing checklist items for this job card
    await supabase
      .from('job_card_checklist_items')
      .delete()
      .eq('job_card_id', jobCard.id)

    // Insert new checklist items
    for (const item of items) {
      const { error } = await supabase
        .from('job_card_checklist_items')
        .insert({
          job_card_id: jobCard.id,
          item_name: item.itemName,
          description: item.description,
          status: item.status,
          priority: item.priority,
          estimated_minutes: item.estimatedMinutes,
          actual_minutes: item.actualMinutes,
          labor_rate: item.laborRate,
          display_order: item.displayOrder,
          completed_at: item.completedAt,
        })

      if (error) {
        console.error(`  ❌ Error creating checklist item "${item.itemName}":`, error.message)
      } else {
        console.log(`  ✅ Created: ${item.itemName}`)
      }
    }
  }

  // Update vehicle details
  console.log('\n🚗 Updating vehicle details...')
  for (const update of vehicleUpdates) {
    const { error } = await supabase
      .from('customer_vehicles')
      .update({
        color: update.color,
        fuel_type: update.fuelType,
        transmission: update.transmission,
      })
      .eq('license_plate', update.licensePlate)

    if (error) {
      console.error(`  ❌ Error updating ${update.licensePlate}:`, error.message)
    } else {
      console.log(`  ✅ Updated ${update.licensePlate}: ${update.color}, ${update.fuelType}, ${update.transmission}`)
    }
  }

  console.log('\n✨ Database population complete!')
}

main().catch(console.error)
