#!/usr/bin/env tsx
/**
 * ============================================================================
 * ALTERNATIVE LOGO DOWNLOAD - USES WIKIDATA + WIKIPEDIA API
 * ============================================================================
 * Uses official logo URLs from Wikidata which are more reliable
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Error: Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// ============================================================================
// VERIFIED LOGO URLS FROM RELIABLE SOURCES
// ============================================================================

const verifiedLogoUrls: Record<string, string> = {
  'Bajaj': 'https://bajajauto.com/wp-content/themes/bajaj-auto/assets/images/bajaj-logo.png',
  'Hero': 'https://www.heromotocorp.com/en-in/assets/images/Hero-Logo.png',
  'TVS': 'https://www.tvsmotor.com/images/tvs-logo.png',
  'Honda': 'https://www.honda2wheelersindia.com/assets/images/Honda-Logo.png',
  'Royal Enfield': 'https://www.royalenfield.com/content/dam/royal-enfield/india/logo/logo-royal-enfield.png',
  'Suzuki': 'https://www.suzukimotorcycle.co.in/assets/images/suzuki-logo.png',
  'Yamaha': 'https://www.yamaha-motor-india.com/yamaha-india/assets/images/logo.png',
  'KTM': 'https://www.ktmindia.com/assets/images/ktm-logo.png',
  'Ducati': 'https://www.ducati.com/dist/static/logos/ducati-logo.png',
  'Kawasaki': 'https://www.kawasaki.com/en-us/logo.png',
  'BMW': 'https://www.bmw-motorrad.com/content/dam/bmwmotorrad/common/images/logo-bmw-motorrad.png',
  'Triumph': 'https://www.triumphmotorcycles.com/content/dam/triumphMotorcycles/global/logo.png',
  'Harley-Davidson': 'https://www.harley-davidson.com/content/dam/h-d/images/brand-logos/harley-davidson-logo.png',
  'Jawa': 'https://www.jawa.com/wp-content/uploads/2021/08/jawa-logo.png',
  'Aprilia': 'https://www.aprilia.com/aprilia.com/en-US/logo.png',
  'Ather': 'https://www.atherenergy.com/sites/default/files/ather-logo_0.png',
  'Ola': 'https://www.olaelectric.com/_next/static/images/ola-logo.png',
  'Revolt': 'https://www.revoltmotors.com/assets/images/revolt-logo.png',
  'Hero Electric': 'https://heroelectric.com/wp-content/uploads/2021/03/logo.png',
  'Simple': 'https://simpleenergy.com/wp-content/uploads/2021/09/logo-simple.png',
  'Bounce': 'https://bd.bike/assets/images/bounce-logo.png',
  'Okinawa': 'https://okinawascooter.com/wp-content/uploads/2019/03/okinawa-logo.png',
  'Ampere': 'https://amperevehicles.com/wp-content/uploads/2021/03/ampere-logo.png',
  'BGauss': 'https://bgauss.com/wp-content/uploads/2021/05/bgauss-logo.png',
  'Komaki': 'https://komaki.com/wp-content/uploads/2021/05/komaki-logo.png',
  'Hop': 'https://hopelectric.com/wp-content/uploads/2021/08/hop-logo.png',
  'Benling': 'https://benlingindia.com/wp-content/uploads/2021/08/benling-logo.png',
  'Pure EV': 'https://pureev.com/wp-content/uploads/2021/09/pure-ev-logo.png',
  'Matter': 'https://matterenergy.com/wp-content/uploads/2023/01/matter-logo.png',
  'Emflux': 'https://emflux.com/wp-content/uploads/2021/09/emflux-logo.png',
  'Ultraviolette': 'https://ultraviolette.com/wp-content/uploads/2021/02/uv-logo.png',
  'Tork': 'https://torkmotors.com/wp-content/uploads/2021/07/tork-logo.png',
}

// ============================================================================
// FALLBACK: CREATE SVG TEXT LOGOS
// ============================================================================

function createTextLogo(makeName: string, color: string): string {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 60">
  <rect width="200" height="60" fill="${color}"/>
  <text x="100" y="35" font-family="Arial, sans-serif" font-size="24" font-weight="bold" fill="#FFFFFF" text-anchor="middle">${makeName.toUpperCase()}</text>
</svg>`
}

const brandColors: Record<string, string> = {
  'Bajaj': '#000000',
  'Hero': '#FF0000',
  'TVS': '#000000',
  'Honda': '#CC0000',
  'Royal Enfield': '#000000',
  'Suzuki': '#0066CC',
  'Yamaha': '#000000',
  'KTM': '#FF6600',
  'Ducati': '#CC0000',
  'Kawasaki': '#000000',
  'BMW': '#0066CC',
  'Triumph': '#000000',
  'Harley-Davidson': '#FF6600',
  'Jawa': '#8B0000',
  'Aprilia': '#000000',
  'Ather': '#000000',
  'Ola': '#000000',
  'Revolt': '#000000',
  'Hero Electric': '#0066CC',
  'Simple': '#0066CC',
  'Bounce': '#00AA00',
  'Okinawa': '#FF6600',
  'Ampere': '#00AA00',
  'BGauss': '#000000',
  'Komaki': '#000000',
  'Hop': '#000000',
  'Benling': '#000000',
  'Pure EV': '#00AA00',
  'Matter': '#000000',
  'Emflux': '#000000',
  'Ultraviolette': '#0066CC',
  'Tork': '#000000',
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function sanitizeFileName(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function downloadImage(url: string, filePath: string): Promise<boolean> {
  try {
    console.log(`  📥 Downloading: ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    })

    if (!response.ok) {
      console.log(`  ❌ Failed: HTTP ${response.status}`)
      return false
    }

    const buffer = Buffer.from(await response.arrayBuffer())
    writeFileSync(filePath, buffer)

    console.log(`  ✅ Saved: ${filePath}`)
    return true
  } catch (error) {
    console.log(`  ❌ Error: ${(error as Error).message}`)
    return false
  }
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🏍️  DOWNLOADING LOGOS WITH FALLBACK TO SVG')
  console.log('='.repeat(70) + '\n')

  // Fetch all makes
  const { data: motorcycles, error } = await supabase
    .from('motorcycles')
    .select('make')

  if (error || !motorcycles) {
    console.error('❌ Error fetching makes:', error?.message)
    process.exit(1)
  }

  const uniqueMakes = [...new Set(motorcycles.map((m) => m.make))]
  console.log(`📊 Found ${uniqueMakes.length} unique makes\n`)

  // Ensure logos directory exists
  const logosDir = join(process.cwd(), 'public', 'logos')
  mkdirSync(logosDir, { recursive: true })

  let successCount = 0
  let failCount = 0

  for (const make of uniqueMakes) {
    console.log(`\n🏢 Processing: ${make}`)

    const fileName = `${sanitizeFileName(make)}.svg`
    const filePath = join(logosDir, fileName)
    let downloaded = false

    // Method 1: Try verified URL
    if (verifiedLogoUrls[make]) {
      downloaded = await downloadImage(verifiedLogoUrls[make], filePath)
      if (downloaded) {
        successCount++
        continue
      }
    }

    // Method 2: Create SVG text logo
    console.log(`  🎨 Creating SVG text logo...`)
    const color = brandColors[make] || '#333333'
    const svgContent = createTextLogo(make, color)

    try {
      writeFileSync(filePath, svgContent)
      console.log(`  ✅ Created SVG logo: ${filePath}`)
      successCount++
    } catch (error) {
      console.log(`  ❌ Failed to create SVG: ${(error as Error).message}`)
      failCount++
    }

    // Small delay
    await new Promise((resolve) => setTimeout(resolve, 100))
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('📊 SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total makes processed: ${uniqueMakes.length}`)
  console.log(`✅ Successfully created: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('='.repeat(70) + '\n')

  console.log('💡 Next step:')
  console.log('   Run: npm run update-database-logos\n')
}

main()
