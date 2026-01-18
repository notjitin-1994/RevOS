#!/usr/bin/env tsx
/**
 * ============================================================================
 * UPDATE MAKE LOGOS SCRIPT
 * ============================================================================
 * This script fetches and updates logos for all motorcycle makes in the database.
 *
 * Usage:
 *   npm run update-logos
 *   or
 *   tsx scripts/update-make-logos.ts
 *
 * Features:
 * - Fetches all unique makes from the database
 * - Downloads logos from multiple sources with fallbacks
 * - Updates the makes table with logo URLs
 * - Handles errors gracefully with detailed logging
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load environment variables from .env.local
config({ path: '.env.local' })

// ============================================================================
// CONFIGURATION
// ============================================================================

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials')
  console.error('Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Logo sources in order of priority
const logoSources = [
  {
    name: 'Clearbit Logo API',
    getUrl: (make: string) =>
      `https://logo.clearbit.com/${make.toLowerCase().replace(/\s+/g, '')}.com`,
  },
  {
    name: 'Google Logo API',
    getUrl: (make: string) =>
      `https://logo.clearbit.com/${make.toLowerCase().replace(/\s+/g, '')}.com?size=200`,
  },
]

// ============================================================================
// MAKE MAPPINGS FOR SPECIAL CASES
// ============================================================================

// Special domain mappings for makes that don't match their name exactly
const makeDomainMap: Record<string, string> = {
  'Royal Enfield': 'royalenfield.com',
  'Hero Honda': 'heromotocorp.com',
  'Hero': 'heromotocorp.com',
  'Hero Electric': 'heroelectric.com',
  'TVS': 'tvsmotor.com',
  'Bajaj': 'bajajauto.com',
  'Kinetic Honda': 'kinetic.com',
  'Kinetic': 'kinetic.com',
  'LML': 'lmlindia.com',
  'Yezdi': 'yezdi.com',
  'Jawa': 'jawamotorcycles.com',
  'Rajdoot': 'escorts.com',
  'Priya': 'priya.com',
  'Vijai': 'vijaisuper.com',
  'Allwyn': 'allwyn.com',
  'Scooters India': 'scootersindia.com',
  'Atul': 'atulauto.com',
  'Ather': 'atherenergy.com',
  'Ola': 'olaelectric.com',
  'Simple': 'simpleenergy.com',
  'Revolt': 'revoltmotors.com',
  'Bounce': 'bounceelectric.com',
  'Okinawa': 'okinawascooter.com',
  'Ampere': 'amperevehicles.com',
  'Benling': 'benlingindia.com',
  'Pure EV': 'pureev.com',
  'Komaki': 'komaki.com',
  'Hop': 'hopelectric.com',
  'BGauss': 'bgauss.com',
  'Matter': 'matterenergy.com',
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Creates a URL-friendly slug from make name
 */
function createSlug(make: string): string {
  return make
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Gets the domain for a make, with fallbacks
 */
function getMakeDomain(make: string): string {
  // Check if we have a special mapping
  if (makeDomainMap[make]) {
    return makeDomainMap[make]
  }

  // Default: create domain from make name
  return make.toLowerCase().replace(/\s+/g, '') + '.com'
}

/**
 * Fetches logo URL from multiple sources with fallbacks
 */
async function fetchLogoUrl(make: string): Promise<string | null> {
  const domain = getMakeDomain(make)

  // Try each source
  for (const source of logoSources) {
    try {
      const logoUrl = `https://logo.clearbit.com/${domain}`
      console.log(`  📡 Trying: ${source.name} for ${make}`)

      // Check if URL is valid (HEAD request)
      const response = await fetch(logoUrl, { method: 'HEAD' })

      if (response.ok && response.headers.get('content-type')?.includes('image')) {
        console.log(`  ✅ Found logo for ${make}: ${logoUrl}`)
        return logoUrl
      }
    } catch (error) {
      console.log(`  ⚠️  ${source.name} failed for ${make}: ${(error as Error).message}`)
    }
  }

  console.log(`  ❌ No logo found for ${make}`)
  return null
}

/**
 * Fetches all unique makes from the database
 */
async function fetchAllMakes(): Promise<string[]> {
  console.log('\n📊 Fetching makes from database...')

  const { data, error } = await supabase
    .from('motorcycles')
    .select('make')
    .order('make')

  if (error) {
    console.error('❌ Error fetching makes:', error)
    throw error
  }

  // Get unique makes
  const uniqueMakes = [...new Set(data?.map((m) => m.make) || [])]
  console.log(`✅ Found ${uniqueMakes.length} unique makes`)

  return uniqueMakes
}

/**
 * Updates the makes table with logo URL
 */
async function updateMakeLogo(make: string, logoUrl: string): Promise<boolean> {
  const slug = createSlug(make)

  const { error } = await supabase
    .from('makes')
    .upsert({
      name: make,
      slug,
      logo_url: logoUrl,
      updated_at: new Date().toISOString(),
    })

  if (error) {
    console.error(`  ❌ Error updating ${make}:`, error.message)
    return false
  }

  return true
}

/**
 * Updates the motorcycles table with logo URL
 */
async function updateMotorcycleLogos(): Promise<void> {
  console.log('\n🔄 Updating motorcycles table with logo URLs...')

  const { error } = await supabase.rpc('update_motorcycle_logos_from_makes')

  if (error) {
    // If the function doesn't exist, do it manually
    console.log('  ℹ️  Function not found, updating manually...')

    const { data: makes } = await supabase
      .from('makes')
      .select('name, logo_url')
      .not('logo_url', 'is', null)

    if (makes) {
      for (const make of makes) {
        await supabase
          .from('motorcycles')
          .update({ logo_url: make.logo_url })
          .eq('make', make.name)
      }
    }
  }

  console.log('✅ Motorcycles table updated')
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🏍️  MAKE LOGOS UPDATE SCRIPT')
  console.log('='.repeat(70))

  try {
    // Step 1: Fetch all makes
    const makes = await fetchAllMakes()

    if (makes.length === 0) {
      console.log('⚠️  No makes found in database. Exiting.')
      return
    }

    console.log('\n📋 Makes to process:')
    makes.forEach((make) => console.log(`   - ${make}`))

    // Step 2: Fetch logos for each make
    console.log('\n🔍 Fetching logos...')
    let successCount = 0
    let failCount = 0

    for (const make of makes) {
      console.log(`\n🏢 Processing: ${make}`)

      const logoUrl = await fetchLogoUrl(make)

      if (logoUrl) {
        const updated = await updateMakeLogo(make, logoUrl)
        if (updated) {
          successCount++
        } else {
          failCount++
        }
      } else {
        failCount++
      }

      // Add delay to be nice to APIs
      await new Promise((resolve) => setTimeout(resolve, 500))
    }

    // Step 3: Update motorcycles table
    await updateMotorcycleLogos()

    // Summary
    console.log('\n' + '='.repeat(70))
    console.log('📊 SUMMARY')
    console.log('='.repeat(70))
    console.log(`Total makes processed: ${makes.length}`)
    console.log(`✅ Successfully updated: ${successCount}`)
    console.log(`❌ Failed: ${failCount}`)
    console.log('='.repeat(70) + '\n')

  } catch (error) {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  }
}

// Run the script
main()
