#!/usr/bin/env tsx
/**
 * Verification Script for Stock Status Fix
 *
 * This script verifies that the stock status fix is working correctly
 * by checking a sample of parts and their stock status calculations.
 *
 * Run this AFTER applying the SQL migration to verify everything works.
 */

import { createAdminClient } from '../lib/supabase/server'

interface PartVerification {
  partName: string
  partNumber: string
  onHandStock: number
  warehouseStock: number
  totalStock: number
  lowStockThreshold: number
  currentStatus: string
  expectedStatus: 'in-stock' | 'low-stock' | 'out-of-stock'
  isCorrect: boolean
}

async function verifyStockStatusFix() {
  console.log('🔍 Verifying Stock Status Fix...\n')

  const supabase = createAdminClient()

  try {
    // Fetch all parts
    const { data: parts, error } = await supabase
      .from('parts')
      .select('part_name, part_number, on_hand_stock, warehouse_stock, low_stock_threshold, stock_status')
      .order('part_name')

    if (error) {
      throw error
    }

    if (!parts || parts.length === 0) {
      console.log('⚠️  No parts found in database')
      return
    }

    console.log(`📊 Analyzing ${parts.length} parts...\n`)

    // Verify each part
    const verifications: PartVerification[] = parts.map(part => {
      const totalStock = (part.on_hand_stock || 0) + (part.warehouse_stock || 0)
      const threshold = part.low_stock_threshold || 0

      let expectedStatus: 'in-stock' | 'low-stock' | 'out-of-stock'
      if (totalStock === 0) {
        expectedStatus = 'out-of-stock'
      } else if (totalStock <= threshold) {
        expectedStatus = 'low-stock'
      } else {
        expectedStatus = 'in-stock'
      }

      const isCorrect = part.stock_status === expectedStatus

      return {
        partName: part.part_name,
        partNumber: part.part_number,
        onHandStock: part.on_hand_stock,
        warehouseStock: part.warehouse_stock,
        totalStock,
        lowStockThreshold: part.low_stock_threshold,
        currentStatus: part.stock_status,
        expectedStatus,
        isCorrect
      }
    })

    // Count results
    const correctCount = verifications.filter(v => v.isCorrect).length
    const incorrectCount = verifications.filter(v => !v.isCorrect).length

    console.log('📈 Verification Results:')
    console.log(`   ✅ Correct: ${correctCount} / ${parts.length} (${((correctCount / parts.length) * 100).toFixed(1)}%)`)
    console.log(`   ❌ Incorrect: ${incorrectCount} / ${parts.length} (${((incorrectCount / parts.length) * 100).toFixed(1)}%)`)

    // Show stock status distribution
    const statusCounts = parts.reduce((acc: any, part: any) => {
      acc[part.stock_status] = (acc[part.stock_status] || 0) + 1
      return acc
    }, {})

    console.log('\n📊 Stock Status Distribution:')
    console.log(`   In Stock: ${statusCounts['in-stock'] || 0}`)
    console.log(`   Low Stock: ${statusCounts['low-stock'] || 0}`)
    console.log(`   Out of Stock: ${statusCounts['out-of-stock'] || 0}`)

    // Show incorrect parts (if any)
    const incorrectParts = verifications.filter(v => !v.isCorrect)

    if (incorrectParts.length > 0) {
      console.log('\n❌ Parts with Incorrect Stock Status:')
      console.table(
        incorrectParts.slice(0, 10).map(p => ({
          part: p.partName.substring(0, 25),
          total: p.totalStock,
          threshold: p.lowStockThreshold,
          current: p.currentStatus,
          expected: p.expectedStatus
        }))
      )

      if (incorrectParts.length > 10) {
        console.log(`   ... and ${incorrectParts.length - 10} more`)
      }
    } else {
      console.log('\n✅ All parts have correct stock status!')
    }

    // Show sample correct parts
    console.log('\n✅ Sample Parts with Correct Status:')
    console.table(
      verifications
        .filter(v => v.isCorrect)
        .slice(0, 10)
        .map(p => ({
          part: p.partName.substring(0, 25),
          on_hand: p.onHandStock,
          warehouse: p.warehouseStock,
          total: p.totalStock,
          threshold: p.lowStockThreshold,
          status: p.currentStatus
        }))
    )

    // Show interesting edge cases
    console.log('\n🎯 Edge Cases (Parts with only warehouse stock):')
    const edgeCases = verifications.filter(
      v => v.onHandStock === 0 && v.warehouseStock > 0
    )

    if (edgeCases.length > 0) {
      console.log(`   Found ${edgeCases.length} parts with only warehouse stock`)
      console.table(
        edgeCases.slice(0, 5).map(p => ({
          part: p.partName.substring(0, 25),
          on_hand: p.onHandStock,
          warehouse: p.warehouseStock,
          total: p.totalStock,
          status: p.currentStatus,
          correct: p.isCorrect ? '✅' : '❌'
        }))
      )
    } else {
      console.log('   No edge cases found (all parts have on-hand stock)')
    }

    // Final verdict
    console.log('\n' + '='.repeat(60))

    if (incorrectCount === 0) {
      console.log('✅ SUCCESS: All stock statuses are correct!')
      console.log('✅ The fix is working properly.')
    } else {
      console.log(`⚠️  WARNING: ${incorrectCount} parts still have incorrect stock status`)
      console.log('⚠️  Please run the SQL migration to fix these parts:')
      console.log('   See STOCK_STATUS_FIX_INSTRUCTIONS.md for details')
    }

    console.log('='.repeat(60) + '\n')

  } catch (error) {
    console.error('❌ Verification failed:', error)
    process.exit(1)
  }
}

// Run the verification
verifyStockStatusFix()
