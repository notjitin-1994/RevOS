#!/usr/bin/env tsx
/**
 * ============================================================================
 * DOWNLOAD OFFICIAL PNG LOGOS FOR ALL MAKES
 * ============================================================================
 * Downloads actual official company logos in PNG format from multiple sources
 *
 * Sources (tried in order):
 * 1. Wikipedia Commons (official, high-quality logos)
 * 2. Company official websites
 * 3. Brand guide repositories
 * 4. Logo CDN services
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
// Logo URL Sources - Multiple fallbacks for each make
// ============================================================================

interface LogoSource {
  name: string
  sources: string[]
}

const logoSources: LogoSource[] = [
  {
    name: 'Bajaj',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bajaj_Auto_logo.svg/512px-Bajaj_Auto_logo.svg.png',
      'https://companieslogo.com/wp-content/uploads/2022/05/Bajaj-Auto-Logo-500x281.png',
      'https://1000logos.net/wp-content/uploads/2022/02/Bajaj-Logo-500x281.png',
      'https://www.bajajauto.com/wp-content/themes/bajaj-auto/assets/images/bajaj-logo.png',
    ]
  },
  {
    name: 'Hero',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hero_MotoCorp_logo.svg/512px-Hero_MotoCorp_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2022/02/Hero-MotoCorp-Logo-500x281.png',
      'https://www.heromotocorp.com/en-in/assets/images/Hero-Logo.png',
    ]
  },
  {
    name: 'Hero Honda',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hero_MotoCorp_logo.svg/512px-Hero_MotoCorp_logo.svg.png',
    ]
  },
  {
    name: 'TVS',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/TVS_Motor_Company_Logo.svg/512px-TVS_Motor_Company_Logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2021/07/TVS-Logo-500x281.png',
      'https://companieslogo.com/wp-content/uploads/2022/05/TVS-Motor-Company-500x281.png',
    ]
  },
  {
    name: 'Honda',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Honda_logo.svg/512px-Honda_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2021/10/Honda-Logo-500x281.png',
      'https://www.honda2wheelersindia.com/assets/images/Honda-Logo.png',
    ]
  },
  {
    name: 'Royal Enfield',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Royal_Enfield_logo.svg/512px-Royal_Enfield_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2021/08/Royal-Enfield-Logo-500x281.png',
      'https://companieslogo.com/wp-content/uploads/2022/05/Royal-Enfield-Logo-500x281.png',
    ]
  },
  {
    name: 'Suzuki',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Suzuki_logo.svg/512px-Suzuki_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2022/01/Suzuki-Logo-500x281.png',
      'https://companieslogo.com/wp-content/uploads/2022/05/Suzuki-Motor-500x281.png',
    ]
  },
  {
    name: 'Yamaha',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Yamaha_logo.svg/512px-Yamaha_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2022/01/Yamaha-Logo-500x281.png',
      'https://companieslogo.com/wp-content/uploads/2022/05/Yamaha-Motor-500x281.png',
    ]
  },
  {
    name: 'KTM',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/KTM_logo.svg/512px-KTM_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2022/02/KTM-Logo-500x281.png',
      'https://companieslogo.com/wp-content/uploads/2022/05/KTM-500x281.png',
    ]
  },
  {
    name: 'Ducati',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Ducati_Logo.svg/512px-Ducati_Logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2021/10/Ducati-Logo-500x281.png',
      'https://companieslogo.com/wp-content/uploads/2022/05/Ducati-500x281.png',
    ]
  },
  {
    name: 'Kawasaki',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Kawasaki_logo.svg/512px-Kawasaki_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2021/12/Kawasaki-Logo-500x281.png',
    ]
  },
  {
    name: 'BMW',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW_Motorrad.svg/512px-BMW_Motorrad.svg.png',
      'https://1000logos.net/wp-content/uploads/2022/01/BMW-Logo-500x281.png',
    ]
  },
  {
    name: 'Triumph',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Triumph_logo.svg/512px-Triumph_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2021/12/Triumph-Logo-500x281.png',
    ]
  },
  {
    name: 'Harley-Davidson',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Harley-Davidson_logo.svg/512px-Harley-Davidson_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2021/10/Harley-Davidson-Logo-500x281.png',
    ]
  },
  {
    name: 'Jawa',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Jawa_logo.svg/512px-Jawa_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2022/02/Jawa-Logo-500x281.png',
    ]
  },
  {
    name: 'Aprilia',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Aprilia_logo.svg/512px-Aprilia_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2022/04/Aprilia-Logo.png',
    ]
  },
  {
    name: 'Ather',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/Ather_Energy_logo.svg/512px-Ather_Energy_logo.svg.png',
      'https://companieslogo.com/wp-content/uploads/2022/06/Ather-Energy-Logo-500x281.png',
      'https://www.atherenergy.com/sites/default/files/ather-logo.png',
    ]
  },
  {
    name: 'Ola',
    sources: [
      'https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/Ola_Electric_logo.svg/512px-Ola_Electric_logo.svg.png',
      'https://companieslogo.com/wp-content/uploads/2022/06/Ola-Electric-Logo-500x281.png',
    ]
  },
  {
    name: 'Hero Electric',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Hero-Electric-Logo-500x281.png',
      'https://heroelectric.com/wp-content/uploads/2021/03/logo.png',
    ]
  },
  {
    name: 'Revolt',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Revolt-Motors-500x281.png',
      'https://revoltmotors.com/wp-content/uploads/2021/02/revolt-logo.png',
    ]
  },
  {
    name: 'Simple',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Simple-Energy-Logo-500x281.png',
      'https://simpleenergy.com/wp-content/uploads/2021/09/logo-simple.png',
    ]
  },
  {
    name: 'Bounce',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Bounce-Logo-500x281.png',
    ]
  },
  {
    name: 'Okinawa',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Okinawa-Autotech-500x281.png',
    ]
  },
  {
    name: 'Ampere',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Ampere-Vehicles-500x281.png',
    ]
  },
  {
    name: 'BGauss',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/BGauss-Logo-500x281.png',
    ]
  },
  {
    name: 'Komaki',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Komaki-500x281.png',
    ]
  },
  {
    name: 'Hop',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Hop-Electric-500x281.png',
    ]
  },
  {
    name: 'Benling',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Benling-India-500x281.png',
    ]
  },
  {
    name: 'Pure EV',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Pure-EV-500x281.png',
    ]
  },
  {
    name: 'Matter',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Matter-Energy-500x281.png',
    ]
  },
  {
    name: 'Emflux',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Emflux-500x281.png',
    ]
  },
  {
    name: 'Ultraviolette',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Ultraviolette-500x281.png',
    ]
  },
  {
    name: 'Tork',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Tork-Motors-500x281.png',
    ]
  },
  {
    name: 'Mahindra',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/4/48/Mahindra_Rise_Logo.svg/512px-Mahindra_Rise_Logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2022/01/Mahindra-Logo-500x281.png',
    ]
  },
  {
    name: 'Moto Guzzi',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Moto_Guzzi_logo.svg/512px-Moto_Guzzi_logo.svg.png',
      'https://1000logos.net/wp-content/uploads/2022/01/Moto-Guzzi-Logo.png',
    ]
  },
  {
    name: 'Vespa',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Vespa_Logo.svg/512px-Vespa_Logo.svg.png',
    ]
  },
  {
    name: 'Piaggio',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f1/Piaggio_Logo.svg/512px-Piaggio_Logo.svg.png',
    ]
  },
  {
    name: 'Yezdi',
    sources: [
      'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Classic_Legends_Logo.svg/512px-Classic_Legends_Logo.svg.png',
    ]
  },
  {
    name: 'Kinetic',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/05/Kinetic-Logo-500x281.png',
    ]
  },
  {
    name: 'LML',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/LML-India-500x281.png',
    ]
  },
  {
    name: 'Rajdoot',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/05/Rajdoot-500x281.png',
    ]
  },
  {
    name: 'Priya',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/05/Priya-500x281.png',
    ]
  },
  {
    name: 'Allwyn',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/05/Allwyn-500x281.png',
    ]
  },
  {
    name: 'Vijai',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/05/Vijai-Super-500x281.png',
    ]
  },
  {
    name: 'Atul',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/06/Atul-Auto-500x281.png',
    ]
  },
  {
    name: 'Scooters India',
    sources: [
      'https://companieslogo.com/wp-content/uploads/2022/05/Scooters-India-500x281.png',
    ]
  },
]

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
    console.log(`  📥 Trying: ${url}`)

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      },
      signal: AbortSignal.timeout(10000), // 10 second timeout
    })

    if (!response.ok) {
      console.log(`  ❌ HTTP ${response.status}`)
      return false
    }

    const buffer = Buffer.from(await response.arrayBuffer())

    // Verify it's actually an image
    if (buffer.length < 1000) {
      console.log(`  ❌ File too small (${buffer.length} bytes), not a valid image`)
      return false
    }

    writeFileSync(filePath, buffer)
    console.log(`  ✅ Saved (${(buffer.length / 1024).toFixed(1)} KB): ${filePath}`)
    return true
  } catch (error) {
    console.log(`  ❌ Error: ${(error as Error).message}`)
    return false
  }
}

async function downloadLogoForMake(makeName: string, logosDir: string): Promise<boolean> {
  const fileName = `${sanitizeFileName(makeName)}.png`
  const filePath = join(logosDir, fileName)

  // Find the logo sources for this make
  const logoSource = logoSources.find(s => s.name === makeName)

  if (!logoSource || logoSource.sources.length === 0) {
    console.log(`  ⚠️  No sources configured for ${makeName}`)
    return false
  }

  // Try each source until one works
  for (const url of logoSource.sources) {
    const success = await downloadImage(url, filePath)
    if (success) {
      return true
    }
    // Add small delay between attempts
    await new Promise(resolve => setTimeout(resolve, 500))
  }

  console.log(`  ❌ All sources failed for ${makeName}`)
  return false
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

async function main() {
  console.log('\n' + '='.repeat(70))
  console.log('🏍️  DOWNLOADING OFFICIAL PNG LOGOS')
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

    const downloaded = await downloadLogoForMake(make, logosDir)

    if (downloaded) {
      successCount++
    } else {
      failCount++
    }

    // Rate limiting - be nice to servers
    await new Promise(resolve => setTimeout(resolve, 1000))
  }

  // Summary
  console.log('\n' + '='.repeat(70))
  console.log('📊 SUMMARY')
  console.log('='.repeat(70))
  console.log(`Total makes processed: ${uniqueMakes.length}`)
  console.log(`✅ Successfully downloaded: ${successCount}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('='.repeat(70) + '\n')

  if (failCount > 0) {
    console.log('⚠️  Some logos failed to download.')
    console.log('💡 Tips:')
    console.log('   - Check your internet connection')
    console.log('   - Some sources may be temporarily unavailable')
    console.log('   - You can manually add logos later\n')
  } else {
    console.log('🎉 All logos downloaded successfully!\n')
  }

  console.log('💡 Next step:')
  console.log('   Run: npm run update-database-logos\n')
}

main()
