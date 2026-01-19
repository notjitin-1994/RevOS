#!/usr/bin/env node
/**
 * Import motorcycle parts from SQL seed file
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const garageId = 'c9f656e3-bbac-454a-9b36-c646bcaf6c39'

async function importParts() {
  const seedFile = path.join(__dirname, '../prisma/seeds/20_motorcycle_parts_seed_data_fixed.sql')

  console.log('📄 Reading seed file...')
  const content = fs.readFileSync(seedFile, 'utf8')

  // Replace garage_id placeholder with actual value if needed
  const processedContent = content.replace(/YOUR_GARAGE_ID_HERE/g, garageId)

  // Extract all parts using regex
  const parts = []
  const rowPattern = /\('([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*'([^']+)',\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+),\s*([\d.]+),\s*'([^']*)',\s*'([^']*)',\s*'([^']*)'\)/g

  let match
  while ((match = rowPattern.exec(processedContent)) !== null) {
    parts.push({
      garage_id: garageId,
      part_number: match[1],
      part_name: match[2],
      category: match[3],
      make: match[4],
      model: match[5],
      used_for: match[6],
      on_hand_stock: parseInt(match[7]),
      warehouse_stock: parseInt(match[8]),
      low_stock_threshold: parseInt(match[9]),
      purchase_price: parseFloat(match[10]),
      selling_price: parseFloat(match[11]),
      supplier: match[12],
      location: match[13],
      stock_status: match[14]
    })
  }

  console.log(`📦 Extracted ${parts.length} parts from SQL file`)

  if (parts.length === 0) {
    console.error('❌ No parts found in SQL file')
    process.exit(1)
  }

  // Insert in batches
  const batchSize = 50
  let totalInserted = 0
  let totalErrors = 0

  for (let i = 0; i < parts.length; i += batchSize) {
    const batch = parts.slice(i, i + batchSize)
    const batchNum = Math.floor(i / batchSize) + 1
    const totalBatches = Math.ceil(parts.length / batchSize)

    console.log(`\n📦 Batch ${batchNum}/${totalBatches} (${batch.length} parts)...`)

    try {
      const { data, error } = await supabase
        .from('parts')
        .insert(batch)
        .select()

      if (error) {
        console.error(`   ❌ Error:`, error.message)
        totalErrors++
      } else {
        totalInserted += batch.length
        console.log(`   ✅ Inserted ${batch.length} parts (total: ${totalInserted})`)
      }
    } catch (err) {
      console.error(`   ❌ Exception:`, err.message)
      totalErrors++
    }
  }

  console.log(`\n` + '='.repeat(50))
  console.log(`🎉 Import complete!`)
  console.log(`   ✅ Successfully inserted: ${totalInserted} parts`)
  console.log(`   ❌ Errors: ${totalErrors} batches`)
  console.log('='.repeat(50))

  // Verify
  const { count, error: countError } = await supabase
    .from('parts')
    .select('*', { count: 'exact', head: true })
    .eq('garage_id', garageId)

  if (!countError) {
    console.log(`\n📊 Total parts in database for this garage: ${count}`)
  }
}

importParts().catch(console.error)
