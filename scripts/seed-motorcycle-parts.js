#!/usr/bin/env node
/**
 * Motorcycle Parts Seeder
 * Automatically fetches garage_id, replaces placeholder, and executes seed file
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const seedFile = path.join(__dirname, '../prisma/seeds/20_motorcycle_parts_seed_data.sql')
const tempFile = path.join(__dirname, '../prisma/seeds/20_motorcycle_parts_seed_data_temp.sql')

async function main() {
  try {
    console.log('🔧 Motorcycle Parts Seeder')
    console.log('=' .repeat(50))

    // Step 1: Get garage_id
    console.log('\n📋 Step 1: Fetching garage_id...')
    const { data: garages, error: garageError } = await supabase
      .from('garages')
      .select('uid, name')
      .limit(1)

    if (garageError) {
      throw new Error(`Failed to fetch garage: ${garageError.message}`)
    }

    if (!garages || garages.length === 0) {
      throw new Error('No garages found in database. Please create a garage first.')
    }

    const garage = garages[0]
    const garageId = garage.uid
    const garageName = garage.name

    console.log(`✅ Found garage: ${garageName}`)
    console.log(`   Garage ID: ${garageId}`)

    // Step 2: Read seed file
    console.log('\n📄 Step 2: Reading seed file...')
    if (!fs.existsSync(seedFile)) {
      throw new Error(`Seed file not found: ${seedFile}`)
    }

    let seedContent = fs.readFileSync(seedFile, 'utf8')
    console.log(`✅ Loaded seed file (${seedContent.length} bytes)`)

    // Count occurrences
    const placeholderCount = (seedContent.match(/YOUR_GARAGE_ID_HERE/g) || []).length
    console.log(`   Found ${placeholderCount} placeholders to replace`)

    // Step 3: Replace placeholder
    console.log('\n✏️  Step 3: Replacing garage_id placeholder...')
    seedContent = seedContent.replace(/YOUR_GARAGE_ID_HERE/g, garageId)
    console.log(`✅ Replaced all ${placeholderCount} occurrences`)

    // Write to temp file
    fs.writeFileSync(tempFile, seedContent, 'utf8')
    console.log(`✅ Created temporary file: ${tempFile}`)

    // Step 4: Execute SQL via PostgreSQL client
    console.log('\n💾 Step 4: Executing seed data...')
    console.log('   This may take a minute...\n')

    // We'll use psql command if available, or provide instructions
    const { execSync } = require('child_process')

    // Try to get database connection info from Supabase
    const dbUrl = process.env.DATABASE_URL || process.env.POSTGRES_URL

    if (dbUrl) {
      try {
        execSync(`psql "${dbUrl}" -f "${tempFile}"`, {
          stdio: 'inherit',
          maxBuffer: 50 * 1024 * 1024 // 50MB buffer
        })
        console.log('\n✅ Seed data executed successfully!')
      } catch (psqlError) {
        console.error('\n⚠️  psql execution failed. Please run manually:')
        console.log(`   psql "${dbUrl}" -f "${tempFile}"`)
        throw psqlError
      }
    } else {
      console.log('\n⚠️  DATABASE_URL not found in environment')
      console.log('📝 Manual execution required:')
      console.log(`   1. Database URL: Get from Supabase dashboard > Settings > Database`)
      console.log(`   2. Run: psql "<DATABASE_URL>" -f "${tempFile}"`)
      console.log(`\n   Or use the Supabase SQL Editor to run:`)
      console.log(`   ${tempFile}`)
    }

    // Step 5: Verification
    console.log('\n📊 Step 5: Verifying data...')
    const { count, error: countError } = await supabase
      .from('parts')
      .select('*', { count: 'exact', head: true })
      .eq('garage_id', garageId)

    if (countError) {
      console.warn('⚠️  Could not verify part count:', countError.message)
    } else {
      console.log(`✅ Total parts in database: ${count}`)
    }

    // Cleanup
    if (fs.existsSync(tempFile)) {
      fs.unlinkSync(tempFile)
      console.log('\n🧹 Cleaned up temporary file')
    }

    console.log('\n' + '='.repeat(50))
    console.log('🎉 Motorcycle parts seeding completed successfully!')
    console.log('='.repeat(50))

  } catch (error) {
    console.error('\n❌ Error:', error.message)
    if (fs.existsSync(tempFile)) {
      console.log(`\n📝 Temporary file saved at: ${tempFile}`)
      console.log('   You can run it manually if needed.')
    }
    process.exit(1)
  }
}

// Run the script
main()
