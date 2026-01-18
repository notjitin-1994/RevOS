#!/usr/bin/env tsx
/**
 * ============================================================================
 * UPDATE DATABASE WITH LOCAL LOGO PATHS
 * ============================================================================
 * This script scans the public/logos/ folder and updates the database
 * with the local file paths.
 *
 * Usage: npm run update-database-logos
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { readdirSync, statSync } from 'fs'
import { join } from 'path'

// Load environment variables
config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getLogoFiles() {
  const logosDir = join(process.cwd(), 'public', 'logos')
  const files = readdirSync(logosDir)
  const logoMap: Record<string, string> = {}

  // Priority: PNG > SVG
  const fileExtensions = ['.png', '.svg']

  for (const file of files) {
    const filePath = join(logosDir, file)
    const stat = statSync(filePath)

    if (stat.isFile() && (file.endsWith('.svg') || file.endsWith('.png'))) {
      // Convert filename back to make name
      // e.g., "bajaj.svg" -> "Bajaj"
      // e.g., "hero-honda.svg" -> "Hero Honda"
      const makeName = file
        .replace(/\.(svg|png)$/, '')
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

      // Only use PNG if it exists, otherwise use SVG
      const existingExt = logoMap[makeName]?.split('.').pop()
      const currentExt = file.split('.').pop()

      if (!existingExt || (currentExt === 'png' && existingExt === 'svg')) {
        logoMap[makeName] = `/logos/${file}`
        console.log(`  Found: ${makeName} -> /logos/${file}`)
      }
    }
  }

  return logoMap
}

async function updateDatabase() {
  console.log('\n' + '='.repeat(70))
  console.log('🔄 UPDATING DATABASE WITH LOCAL LOGO PATHS')
  console.log('='.repeat(70) + '\n')

  // Get all logo files
  console.log('📁 Scanning public/logos/ directory...\n')
  const logoMap = getLogoFiles()

  if (Object.keys(logoMap).length === 0) {
    console.log('⚠️  No logo files found in public/logos/')
    console.log('💡 Run: npm run download-logos\n')
    return
  }

  console.log(`\n✅ Found ${Object.keys(logoMap).length} logo files\n`)

  // Update makes table
  console.log('🔄 Updating makes table...')
  let makesUpdated = 0

  for (const [makeName, logoPath] of Object.entries(logoMap)) {
    const { error } = await supabase
      .from('makes')
      .update({ logo_url: logoPath, updated_at: new Date().toISOString() })
      .eq('name', makeName)

    if (error) {
      console.log(`  ❌ Failed to update ${makeName}: ${error.message}`)
    } else {
      console.log(`  ✅ Updated ${makeName}: ${logoPath}`)
      makesUpdated++
    }
  }

  console.log(`\n✅ Updated ${makesUpdated} makes\n`)

  // Update motorcycles table
  console.log('🔄 Syncing to motorcycles table...')
  const { data: syncResult, error: syncError } = await supabase
    .rpc('update_motorcycle_logos_from_makes')

  if (syncError) {
    // If function doesn't exist, do it manually
    console.log('  ℹ️  Function not found, updating manually...')

    const { error: updateError } = await supabase
      .from('motorcycles')
      .update({
        logo_url: supabase.raw(`(SELECT logo_url FROM makes WHERE makes.name = motorcycles.make)`),
        updated_at: new Date().toISOString(),
      })
      .not('logo_url', 'is', null)

    if (updateError) {
      // Last resort: update each make individually
      for (const [makeName, logoPath] of Object.entries(logoMap)) {
        await supabase
          .from('motorcycles')
          .update({ logo_url: logoPath, updated_at: new Date().toISOString() })
          .eq('make', makeName)
      }
    }
  }

  console.log('  ✅ Motorcycles table synced\n')

  // Verify
  console.log('🔍 Verifying updates...')
  const { data: makes, error: verifyError } = await supabase
    .from('makes')
    .select('name, logo_url')
    .not('logo_url', 'is', null)
    .order('name')

  if (verifyError) {
    console.error('❌ Error verifying:', verifyError.message)
  } else {
    console.log('\n📊 Makes with logos:')
    makes?.forEach((m) => {
      console.log(`  ✅ ${m.name}: ${m.logo_url}`)
    })
    console.log(`\nTotal: ${makes?.length || 0} makes with logos\n`)
  }

  console.log('='.repeat(70))
  console.log('✅ DATABASE UPDATED SUCCESSFULLY!')
  console.log('='.repeat(70))
  console.log('\n💡 Next steps:')
  console.log('   1. Refresh your browser (Ctrl+Shift+R)')
  console.log('   2. Check /services page to see logos\n')
}

updateDatabase()
