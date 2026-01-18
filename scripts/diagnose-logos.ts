#!/usr/bin/env tsx
/**
 * Diagnostic script to check logo URLs in the database
 */
import { createClient } from '@supabase/supabase-js'
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

async function testUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    const contentType = response.headers.get('content-type')
    return response.ok && (contentType?.includes('image') ?? false)
  } catch {
    return false
  }
}

async function main() {
  console.log('\n🔍 Diagnosing logo URLs...\n')

  const { data: makes, error } = await supabase
    .from('makes')
    .select('name, logo_url')
    .limit(15)

  if (error || !makes) {
    console.error('❌ Error fetching makes:', error?.message)
    return
  }

  console.log('Testing logo URLs:\n')
  console.log('─'.repeat(80))

  for (const make of makes) {
    const isValid = make.logo_url ? await testUrl(make.logo_url) : false
    const status = isValid ? '✅' : '❌'
    const url = make.logo_url || 'NULL'

    console.log(`${status} ${make.name.padEnd(25)} ${url}`)

    if (!isValid && make.logo_url) {
      console.log(`   ⚠️  Failed to load`)
    }
    console.log()
  }

  console.log('─'.repeat(80))
  console.log('\n💡 If most logos are failing, run the update script with better URLs:')
  console.log('   npm run update-logos-fixed\n')
}

main()
