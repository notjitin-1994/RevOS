#!/usr/bin/env tsx
/**
 * ============================================================================
 * DOWNLOAD OFFICIAL LOGO SVGS FOR ALL MAKES
 * ============================================================================
 * This script downloads official logo SVGs for all makes from:
 * 1. Wikipedia Commons (most reliable for official logos)
 * 2. Company official websites
 * 3. Logo repositories
 *
 * Usage: npm run download-logos
 * ============================================================================
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'
import { fileURLToPath } from 'url'
import path from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

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
// WIKIPEDIA LOGO MAPPINGS (Official logos from Wikipedia Commons)
// ============================================================================

const wikipediaLogos: Record<string, string> = {
  'Bajaj': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bajaj_Auto_logo.svg/200px-Bajaj_Auto_logo.svg.png',
  'Hero': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hero_MotoCorp_logo.svg/200px-Hero_MotoCorp_logo.svg.png',
  'Hero Honda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hero_MotoCorp_logo.svg/200px-Hero_MotoCorp_logo.svg.png',
  'TVS': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/TVS_Motor_Company_Logo.svg/200px-TVS_Motor_Company_Logo.svg.png',
  'Honda': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Honda_logo.svg/200px-Honda_logo.svg.png',
  'Royal Enfield': 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Royal_Enfield_logo.svg/200px-Royal_Enfield_logo.svg.png',
  'Suzuki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Suzuki_logo.svg/200px-Suzuki_logo.svg.png',
  'Yamaha': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Yamaha_logo.svg/200px-Yamaha_logo.svg.png',
  'Kawasaki': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Kawasaki_logo.svg/200px-Kawasaki_logo.svg.png',
  'Ducati': 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Ducati_Logo.svg/200px-Ducati_Logo.svg.png',
  'BMW': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW_Motorrad.svg/200px-BMW_Motorrad.svg.png',
  'KTM': 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/KTM_logo.svg/200px-KTM_logo.svg.png',
  'Triumph': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Triumph_logo.svg/200px-Triumph_logo.svg.png',
  'Harley-Davidson': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Harley-Davidson_logo.svg/200px-Harley-Davidson_logo.svg.png',
  'Jawa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Jawa_logo.svg/200px-Jawa_logo.svg.png',
  'Aprilia': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Aprilia_logo.svg/200px-Aprilia_logo.svg.png',
  'Benelli': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6e/Benelli_logo.svg/200px-Benelli_logo.svg.png',
  'MV Agusta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/4e/MV_Agusta_logo.svg/200px-MV_Agusta_logo.svg.png',
  'Vespa': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vespa_Logo.svg/200px-Vespa_Logo.svg.png',
  'Piaggio': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Piaggio_Logo.svg/200px-Piaggio_Logo.svg.png',
}

// ============================================================================
// COMPANY WEBSITE LOGO URLS (Official sources)
// ============================================================================

const companyLogos: Record<string, string> = {
  'Ather': 'https://www.atherenergy.com/themes/custom/ather/logo.svg',
  'Ola': 'https://www.olaelectric.com/assets/logo-ol.svg',
  'Hero Electric': 'https://heroelectric.com/wp-content/uploads/2021/03/hero-electric-logo.png',
  'Revolt': 'https://revoltmotors.com/wp-content/uploads/2021/02/revolt-logo.png',
  'Simple': 'https://simpleenergy.com/wp-content/uploads/2021/09/simple-logo.png',
  'Bounce': 'https://bd.bike/assets/images/brands/bounce-logo.png',
  'Okinawa': 'https://okinawascooter.com/wp-content/uploads/2018/09/okinawa-logo.png',
  'Ampere': 'https://amperevehicles.com/wp-content/uploads/2020/01/ampere-logo.png',
  'BGauss': 'https://bgauss.com/wp-content/uploads/2020/06/bgauss-logo.png',
  'Komaki': 'https://komaki.com/wp-content/uploads/2021/03/komaki-logo.png',
  'Hop': 'https://hopelectric.com/wp-content/uploads/2021/08/hop-logo.png',
  'Benling': 'https://benlingindia.com/wp-content/uploads/2020/08/benling-logo.png',
  'Pure EV': 'https://pureev.com/wp-content/uploads/2020/06/pure-ev-logo.png',
  'Matter': 'https://matterenergy.com/wp-content/uploads/2023/01/matter-logo.png',
  'Emflux': 'https://emflux.com/wp-content/uploads/2021/09/emflux-logo.png',
  'Ultraviolette': 'https://ultraviolette.com/wp-content/uploads/2021/02/uv-logo.png',
  'Tork': 'https://torkmotors.com/wp-content/uploads/2021/07/tork-logo.png',
  '22 Motors': 'https://22motors.com/wp-content/uploads/2021/03/22-logo.png',
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

    const response = await fetch(url)

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

async function getWikipediaSVGUrl(make: string): Promise<string | null> {
  const svgMap: Record<string, string> = {
    'Bajaj': 'https://upload.wikimedia.org/wikipedia/commons/6/6f/Bajaj_Auto_logo.svg',
    'Hero': 'https://upload.wikimedia.org/wikipedia/commons/e/e0/Hero_MotoCorp_logo.svg',
    'TVS': 'https://upload.wikimedia.org/wikipedia/commons/1/1f/TVS_Motor_Company_Logo.svg',
    'Honda': 'https://upload.wikimedia.org/wikipedia/commons/f/f6/Honda_logo.svg',
    'Royal Enfield': 'https://upload.wikimedia.org/wikipedia/commons/9/9f/Royal_Enfield_logo.svg',
    'Suzuki': 'https://upload.wikimedia.org/wikipedia/commons/6/6d/Suzuki_logo.svg',
    'Yamaha': 'https://upload.wikimedia.org/wikipedia/commons/8/87/Yamaha_logo.svg',
    'KTM': 'https://upload.wikimedia.org/wikipedia/commons/8/80/KTM_logo.svg',
    'Ducati': 'https://upload.wikimedia.org/wikipedia/commons/3/33/Ducati_Logo.svg',
    'Kawasaki': 'https://upload.wikimedia.org/wikipedia/commons/1/19/Kawasaki_logo.svg',
    'BMW': 'https://upload.wikimedia.org/wikipedia/commons/4/44/BMW_Motorrad.svg',
    'Triumph': 'https://upload.wikimedia.org/wikipedia/commons/1/12/Triumph_logo.svg',
    'Harley-Davidson': 'https://upload.wikimedia.org/wikipedia/commons/2/23/Harley-Davidson_logo.svg',
    'Jawa': 'https://upload.wikimedia.org/wikipedia/commons/a/a7/Jawa_logo.svg',
    'Aprilia': 'https://upload.wikimedia.org/wikipedia/commons/2/26/Aprilia_logo.svg',
    'Benelli': 'https://upload.wikimedia.org/wikipedia/commons/6/6e/Benelli_logo.svg',
    'Vespa': 'https://upload.wikimedia.org/wikipedia/commons/5/5e/Vespa_Logo.svg',
    'Piaggio': 'https://upload.wikimedia.org/wikipedia/commons/f/f1/Piaggio_Logo.svg',
  }

  return svgMap[make] || null
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🏍️  DOWNLOADING OFFICIAL LOGOS FOR ALL MAKES')
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
    let logoUrl: string | null = null
    let downloaded = false

    // Method 1: Try Wikipedia SVG (best quality)
    const wikiUrl = await getWikipediaSVGUrl(make)
    if (wikiUrl) {
      console.log(`  📖 Trying Wikipedia SVG...`)
      downloaded = await downloadImage(wikiUrl, filePath)
      if (downloaded) {
        successCount++
        continue
      }
    }

    // Method 2: Try Wikipedia PNG
    if (wikipediaLogos[make]) {
      console.log(`  📖 Trying Wikipedia PNG...`)
      downloaded = await downloadImage(wikipediaLogos[make], filePath)
      if (downloaded) {
        successCount++
        continue
      }
    }

    // Method 3: Try company website
    if (companyLogos[make]) {
      console.log(`  🌐 Trying company website...`)
      downloaded = await downloadImage(companyLogos[make], filePath)
      if (downloaded) {
        successCount++
        continue
      }
    }

    // Method 4: Try Clearbit
    const domains: Record<string, string> = {
      'Bajaj': 'bajajauto.com',
      'Hero': 'heromotocorp.com',
      'TVS': 'tvsmotor.com',
      'Honda': 'honda2wheelersindia.com',
      'Royal Enfield': 'royalenfield.com',
      'Suzuki': 'suzukimotorcycle.co.in',
      'Yamaha': 'yamaha-motor-india.com',
    }

    const domain = domains[make]
    if (domain) {
      console.log(`  🔍 Trying Clearbit...`)
      const clearbitUrl = `https://logo.clearbit.com/${domain}`
      downloaded = await downloadImage(clearbitUrl, filePath)
      if (downloaded) {
        successCount++
        continue
      }
    }

    if (!downloaded) {
      console.log(`  ⚠️  No logo found for ${make}`)
      failCount++
    }

    // Rate limiting
    await new Promise((resolve) => setTimeout(resolve, 300))
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('📊 SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total makes processed: ${uniqueMakes.length}`)
  console.log(`✅ Successfully downloaded: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('='.repeat(70) + '\n')

  console.log('💡 Next steps:')
  console.log('   1. Check the downloaded logos in: public/logos/')
  console.log('   2. Run: npm run update-database-logos')
  console.log('   3. Refresh your browser\n')
}

main()
