#!/usr/bin/env node
/**
 * Execute SQL seed file via Supabase REST API
 */

const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeSeedFile() {
  const seedFile = path.join(__dirname, '../prisma/seeds/20_motorcycle_parts_seed_data.sql')

  console.log('📄 Reading seed file...')
  const sqlContent = fs.readFileSync(seedFile, 'utf8')

  // Split by INSERT statements and extract just the data
  const insertStatements = sqlContent.split(/INSERT INTO public.parts \([^)]+\) VALUES /g)

  let totalInserted = 0
  let statementNumber = 0

  for (const stmt of insertStatements) {
    if (!stmt.trim() || stmt.startsWith('--')) continue

    statementNumber++
    console.log(`\n📦 Executing statement ${statementNumber}...`)

    try {
      // Extract rows from the VALUES clause
      // Match all (UUID, ...) patterns that are actual data rows
      const rows = []
      const rowPattern = /\('([a-f0-9-]+)',([^)]+)\)/g

      let match
      while ((match = rowPattern.exec(stmt)) !== null) {
        const fullRow = match[0]
        // Parse the row values
        const values = fullRow
          .substring(1, fullRow.length - 1) // Remove outer parentheses
          .split(',')
          .map(v => v.trim().startsWith("'") ? v.trim().slice(1, -1) : v.trim())

        if (values.length >= 15) {
          rows.push({
            garage_id: values[0],
            part_number: values[1],
            part_name: values[2],
            category: values[3],
            make: values[4],
            model: values[5],
            used_for: values[6],
            on_hand_stock: parseInt(values[7]) || 0,
            warehouse_stock: parseInt(values[8]) || 0,
            low_stock_threshold: parseInt(values[9]) || 5,
            purchase_price: parseFloat(values[10]) || 0,
            selling_price: parseFloat(values[11]) || 0,
            supplier: values[12],
            location: values[13],
            stock_status: values[14]?.replace(/[');,]/g, '') || 'in-stock'
          })
        }
      }

      if (rows.length > 0) {
        console.log(`   Inserting ${rows.length} parts...`)

        // Insert in batches of 100
        const batchSize = 100
        for (let i = 0; i < rows.length; i += batchSize) {
          const batch = rows.slice(i, i + batchSize)
          const { data, error } = await supabase
            .from('parts')
            .insert(batch)
            .select()

          if (error) {
            console.error(`   ❌ Error inserting batch:`, error.message)
            console.log(`   First row in batch:`, JSON.stringify(batch[0], null, 2))
          } else {
            totalInserted += batch.length
            console.log(`   ✅ Inserted ${batch.length} parts (total: ${totalInserted})`)
          }
        }
      }
    } catch (err) {
      console.error(`   ❌ Error processing statement:`, err.message)
    }
  }

  console.log(`\n` + '='.repeat(50))
  console.log(`🎉 Total parts inserted: ${totalInserted}`)
  console.log('='.repeat(50))

  // Verify
  const { count } = await supabase
    .from('parts')
    .select('*', { count: 'exact', head: true })
    .eq('garage_id', 'c9f656e3-bbac-454a-9b36-c646bcaf6c39')

  console.log(`📊 Verified parts count in database: ${count}`)
}

executeSeedFile().catch(console.error)
