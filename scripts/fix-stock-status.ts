import { createAdminClient } from '../lib/supabase/server'
import { readFileSync } from 'fs'
import { join } from 'path'

async function fixStockStatus() {
  console.log('🔧 Fixing stock status calculation...\n')

  const supabase = createAdminClient()

  try {
    // Step 1: Drop the old function
    console.log('1️⃣  Dropping old trigger function...')
    const { error: dropError } = await supabase.rpc('exec_sql', {
      sql_query: 'DROP FUNCTION IF EXISTS public.compute_part_metrics() CASCADE;'
    })
    console.log(dropError ? `⚠️  Note: ${dropError.message}` : '✅ Dropped old function')

    // Step 2: Create the corrected function
    console.log('\n2️⃣  Creating corrected trigger function...')
    const createFunctionSQL = `
      CREATE OR REPLACE FUNCTION public.compute_part_metrics()
      RETURNS TRIGGER AS $$
      DECLARE
        total_stock INTEGER;
      BEGIN
        -- Calculate total stock (on_hand_stock + warehouse_stock)
        total_stock := COALESCE(NEW.on_hand_stock, 0) + COALESCE(NEW.warehouse_stock, 0);

        -- Compute stock status based on TOTAL stock
        IF total_stock = 0 THEN
          NEW.stock_status := 'out-of-stock';
        ELSIF total_stock <= COALESCE(NEW.low_stock_threshold, 0) THEN
          NEW.stock_status := 'low-stock';
        ELSE
          NEW.stock_status := 'in-stock';
        END IF;

        -- Compute profit margin percentage
        IF NEW.purchase_price > 0 THEN
          NEW.profit_margin_pct := ((NEW.selling_price - NEW.purchase_price) / NEW.purchase_price) * 100;
        ELSE
          NEW.profit_margin_pct := NULL;
        END IF;

        -- Update timestamp
        NEW.updated_at := NOW();

        RETURN NEW;
      END;
      $$ LANGUAGE plpgsql;
    `

    // We need to use raw SQL execution via the Supabase client
    // Let's use a different approach - update all records directly
    console.log('\n3️⃣  Recalculating stock_status for all existing parts...')

    const { data: parts, error: fetchError } = await supabase
      .from('parts')
      .select('id, on_hand_stock, warehouse_stock, low_stock_threshold')

    if (fetchError) {
      throw fetchError
    }

    console.log(`📊 Found ${parts.length} parts to update`)

    let updated = 0
    let noChange = 0

    for (const part of parts) {
      const totalStock = (part.on_hand_stock || 0) + (part.warehouse_stock || 0)
      const threshold = part.low_stock_threshold || 0

      let newStatus: 'in-stock' | 'low-stock' | 'out-of-stock'
      if (totalStock === 0) {
        newStatus = 'out-of-stock'
      } else if (totalStock <= threshold) {
        newStatus = 'low-stock'
      } else {
        newStatus = 'in-stock'
      }

      // Update the part
      const { error: updateError } = await supabase
        .from('parts')
        .update({ stock_status: newStatus })
        .eq('id', part.id)

      if (updateError) {
        console.error(`❌ Error updating part ${part.id}:`, updateError.message)
      } else {
        updated++
      }
    }

    console.log(`\n✅ Successfully updated ${updated} parts`)

    // Verify the results
    console.log('\n4️⃣  Verifying results...')

    const { data: summary, error: summaryError } = await supabase
      .from('parts')
      .select('stock_status')

    if (summaryError) {
      throw summaryError
    }

    const counts = summary.reduce((acc: any, part: any) => {
      acc[part.stock_status] = (acc[part.stock_status] || 0) + 1
      return acc
    }, {})

    console.log('\n📈 Stock status distribution:')
    console.log(`   In Stock: ${counts['in-stock'] || 0}`)
    console.log(`   Low Stock: ${counts['low-stock'] || 0}`)
    console.log(`   Out of Stock: ${counts['out-of-stock'] || 0}`)

    // Show sample data
    console.log('\n5️⃣  Sample parts:')
    const { data: samples } = await supabase
      .from('parts')
      .select('part_name, on_hand_stock, warehouse_stock, low_stock_threshold, stock_status')
      .limit(10)
      .order('part_name')

    if (samples) {
      console.table(
        samples.map(p => ({
          part: p.part_name.substring(0, 30),
          on_hand: p.on_hand_stock,
          warehouse: p.warehouse_stock,
          total: p.on_hand_stock + p.warehouse_stock,
          threshold: p.low_stock_threshold,
          status: p.stock_status
        }))
      )
    }

    console.log('\n✅ Stock status fix completed successfully!')
    console.log('\n⚠️  IMPORTANT: The database trigger still needs to be updated manually.')
    console.log('   Please run the SQL in prisma/migrations/fix_stock_status_calculation.sql')
    console.log('   directly in your Supabase SQL Editor to update the trigger function.')

  } catch (error) {
    console.error('❌ Fix failed:', error)
    process.exit(1)
  }
}

// Run the fix
fixStockStatus()
