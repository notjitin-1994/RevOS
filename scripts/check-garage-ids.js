/**
 * Check what garage ID the user session has vs database
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

async function checkState() {
  console.log('🔍 Checking user session and garage IDs\n')

  // 1. Check all garages
  const { data: garages } = await supabase
    .from('garages')
    .select('garage_uid, name')

  console.log('All garages in database:')
  if (garages) {
    garages.forEach(g => console.log(`  - ${g.garage_uid} (${g.name})`))
  }

  // 2. Check all job cards and their garage IDs
  const { data: jobCards } = await supabase
    .from('job_cards')
    .select('garage_id, job_card_number, status')

  console.log('\nJob cards by garage ID:')
  if (jobCards) {
    const byGarage = {}
    jobCards.forEach(jc => {
      byGarage[jc.garage_id] = (byGarage[jc.garage_id] || 0) + 1
    })
    Object.entries(byGarage).forEach(([garageId, count]) => {
      console.log(`  ${garageId}: ${count} job cards`)
    })
  }

  // 3. Check garage_auth to see user-garage mapping
  const { data: garageAuth } = await supabase
    .from('garage_auth')
    .select('*')
    .limit(5)

  console.log('\nSample garage_auth records:')
  if (garageAuth) {
    garageAuth.forEach(ga => {
      console.log(`  User: ${ga.user_uid} -> Garage: ${ga.garage_uid}`)
    })
  }
}

checkState()
