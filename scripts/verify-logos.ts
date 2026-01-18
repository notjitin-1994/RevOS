#!/usr/bin/env tsx
/**
 * Quick script to verify logos are in the database
 */
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import { config } from 'dotenv'

// Load environment variables from .env.local
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

async function main() {
  console.log('\n🔍 Verifying logos in database...\n')

  // Check makes table
  const { data: makes, error: makesError } = await supabase
    .from('makes')
    .select('name, logo_url')
    .limit(10)

  if (makesError) {
    console.error('❌ Error fetching makes:', makesError.message)
  } else {
    console.log('✅ Makes table:')
    makes?.forEach(m => {
      console.log(`   ${m.name}: ${m.logo_url ? '✅' : '❌'} ${m.logo_url || 'No logo'}`)
    })
  }

  // Check motorcycles table
  const { data: motorcycles, error: bikesError } = await supabase
    .from('motorcycles')
    .select('make, logo_url')
    .not('logo_url', 'is', null)
    .limit(10)

  if (bikesError) {
    console.error('❌ Error fetching motorcycles:', bikesError.message)
  } else {
    console.log('\n✅ Motorcycles with logos:')
    motorcycles?.forEach(m => {
      console.log(`   ${m.make}: ${m.logo_url}`)
    })
  }

  // Count
  const { count: makesCount } = await supabase
    .from('makes')
    .select('*', { count: 'exact', head: true })

  const { count: logosCount } = await supabase
    .from('makes')
    .select('*', { count: 'exact', head: true })
    .not('logo_url', 'is', null)

  console.log(`\n📊 Stats:`)
  console.log(`   Total makes: ${makesCount || 0}`)
  console.log(`   With logos: ${logosCount || 0}`)
}

main()
