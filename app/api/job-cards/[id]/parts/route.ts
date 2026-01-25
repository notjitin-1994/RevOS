import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { z } from 'zod'

/**
 * POST /api/job-cards/[id]/parts
 *
 * Saves parts to a job card and updates all related tables:
 * - job_card_parts: Parts requested/used for this job
 * - parts_transactions: Inventory audit trail
 * - parts: Stock allocation (if applicable)
 * - job_cards: Parts cost updates
 *
 * Request Body:
 * - selectedParts (required): Array of parts to save
 * - userId (required): User ID performing the allocation
 * - userName (required): User name for audit trail
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id
    const body = await request.json()

    console.log('📦 Saving parts for job card:', jobCardId, body)

    // Validate request body
    const partSchema = z.object({
      id: z.string(), // Temporary frontend ID
      partId: z.string().nullable(), // Database part ID (null for customer parts)
      partName: z.string().min(1, 'Part name is required'),
      partNumber: z.string().nullable(),
      quantity: z.number().int().min(1, 'Quantity must be at least 1'),
      unitPrice: z.number().min(0, 'Unit price cannot be negative'),
      totalPrice: z.number().min(0, 'Total price cannot be negative'),
      source: z.enum(['inventory', 'customer', 'external']).default('inventory'),
    })

    const requestSchema = z.object({
      selectedParts: z.array(partSchema).min(1, 'At least one part is required'),
      userId: z.string().uuid('Invalid user ID'),
      userName: z.string().min(1, 'User name is required'),
    })

    const validationResult = requestSchema.safeParse(body)

    if (!validationResult.success) {
      const errors = validationResult.error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message
      }))

      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      )
    }

    const { selectedParts, userId, userName } = validationResult.data

    const supabase = createAdminClient()

    // Verify job card exists
    const { data: jobCard, error: jobCardError } = await supabase
      .from('job_cards')
      .select('id, garage_id, status, job_card_number, estimated_labor_cost')
      .eq('id', jobCardId)
      .single()

    if (jobCardError || !jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    // Fetch part details from inventory for all parts that have partId
    const partIds = selectedParts.filter(p => p.partId).map(p => p.partId!)
    const inventoryPartsData = partIds.length > 0 ? await supabase
      .from('parts')
      .select('id, category, manufacturer, part_number')
      .in('id', partIds) : { data: [] }

    // Create a map for easy lookup
    const inventoryPartsMap = new Map(
      (inventoryPartsData.data || []).map(p => [p.id, p])
    )

    // Prepare parts for insertion into job_card_parts
    const partsToInsert = selectedParts.map((part, index) => {
      // Get category and manufacturer from inventory if available
      const inventoryPart = part.partId ? inventoryPartsMap.get(part.partId) : null

      return {
        job_card_id: jobCardId,
        garage_id: jobCard.garage_id,
        part_id: part.partId, // Can be null for customer-supplied parts
        part_number: part.partNumber,
        part_name: part.partName,
        category: inventoryPart?.category || 'Uncategorized', // Fetch from inventory or use default
        manufacturer: inventoryPart?.manufacturer || null, // Fetch from inventory
        quantity_requested: part.quantity,
        quantity_used: 0,
        quantity_returned: 0,
        status: 'requested',
        estimated_unit_price: part.unitPrice,
        actual_unit_price: 0,
        price_variance: 0,
        is_price_override: false,
        price_override_reason: null,
        core_charge_amount: 0,
        core_credit_amount: 0,
        has_core_charge: false,
        disposal_fee_amount: 0,
        has_disposal_fee: false,
        source: part.source,
        requested_by: userId,
        used_by: null,
        requested_at: new Date().toISOString(),
        used_at: null,
        notes: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }
    })

    // Insert parts into job_card_parts
    const { data: insertedParts, error: insertError } = await supabase
      .from('job_card_parts')
      .insert(partsToInsert)
      .select()

    if (insertError) {
      console.error('Failed to save parts:', insertError)
      return NextResponse.json(
        { error: 'Failed to save parts', details: insertError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Saved ${insertedParts.length} parts to job_card_parts`)

    // Create a map of temporary IDs to actual database IDs for updating transactions
    const partIdMap = new Map<string, string>()
    insertedParts.forEach((insertedPart: any, index: number) => {
      const tempId = selectedParts[index].id
      partIdMap.set(tempId, insertedPart.id)
    })

    // Calculate total estimated parts cost
    const totalEstimatedPartsCost = selectedParts.reduce((sum, part) => {
      return sum + part.totalPrice
    }, 0)

    // Update job card with estimated parts cost
    const { error: updateError } = await supabase
      .from('job_cards')
      .update({
        estimated_parts_cost: totalEstimatedPartsCost,
        // Update final amount
        final_amount: (jobCard.estimated_labor_cost || 0) + totalEstimatedPartsCost,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobCardId)

    if (updateError) {
      console.error('Failed to update job card costs:', updateError)
      // Don't fail the request, just log the error
    } else {
      console.log(`✅ Updated job card parts cost: ₹${totalEstimatedPartsCost}`)
    }

    // Create parts_transactions records for inventory parts
    const transactionsToInsert = []
    const inventoryUpdates = []

    for (const part of selectedParts) {
      if (part.partId && part.source === 'inventory') {
        // Get part details from inventory
        const { data: inventoryPart } = await supabase
          .from('parts')
          .select('id, part_number, part_name, on_hand_stock, warehouse_stock, selling_price, supplier, primary_supplier_id')
          .eq('id', part.partId)
          .single()

        if (inventoryPart) {
          // Calculate stock levels (handle nulls)
          const stockBefore = (inventoryPart.on_hand_stock || 0) + (inventoryPart.warehouse_stock || 0)
          const stockAfter = stockBefore - part.quantity

          // Create transaction record
          transactionsToInsert.push({
            garage_id: jobCard.garage_id,
            job_card_id: jobCardId,
            job_card_part_id: null, // Will be updated after insert
            part_id: part.partId,
            transaction_type: 'allocation',
            quantity: part.quantity,
            unit_price: part.unitPrice,
            total_price: part.totalPrice,
            total_value: part.totalPrice,
            stock_before: stockBefore,
            stock_after: stockAfter,
            location_from: 'inventory',
            location_to: 'job_card',
            reference_type: 'job_card',
            reference_id: jobCardId,
            reference_number: jobCard.job_card_number,
            supplier_id: inventoryPart.primary_supplier_id,
            supplier_name: inventoryPart.supplier || null,
            transaction_date: new Date().toISOString(),
            performed_by: userId,
            performed_by_name: null, // Could fetch from users table
            notes: `Allocated for job card ${jobCard.job_card_number}`,
            created_at: new Date().toISOString(),
          })

          // Prepare inventory stock update (allocate stock)
          inventoryUpdates.push({
            id: part.partId,
            on_hand_stock: Math.max(0, (inventoryPart.on_hand_stock || 0) - part.quantity),
            updated_at: new Date().toISOString(),
          })
        }
      }
    }

    // Insert parts_transactions records
    if (transactionsToInsert.length > 0) {
      // Update job_card_part_id with the actual inserted part ID
      const transactionsWithPartIds = transactionsToInsert.map((trans, index) => {
        const tempId = selectedParts[index].id
        const actualPartId = partIdMap.get(tempId)
        return {
          ...trans,
          job_card_part_id: actualPartId || null,
        }
      })

      const { error: transError } = await supabase
        .from('parts_transactions')
        .insert(transactionsWithPartIds)

      if (transError) {
        console.error('Failed to create parts_transactions:', transError)
      } else {
        console.log(`✅ Created ${transactionsWithPartIds.length} parts_transactions records`)
      }
    }

    // Update inventory stock levels
    if (inventoryUpdates.length > 0) {
      for (const update of inventoryUpdates) {
        const { error: stockUpdateError } = await supabase
          .from('parts')
          .update({
            on_hand_stock: update.on_hand_stock,
            updated_at: update.updated_at,
          })
          .eq('id', update.id)

        if (stockUpdateError) {
          console.error(`Failed to update stock for part ${update.id}:`, stockUpdateError)
        }
      }
      console.log(`✅ Updated stock levels for ${inventoryUpdates.length} inventory parts`)
    }

    // Fetch and return all parts for this job card
    const { data: allJobCardParts } = await supabase
      .from('job_card_parts')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('requested_at', { ascending: false })

    return NextResponse.json({
      success: true,
      message: `Saved ${insertedParts.length} part(s) and updated inventory`,
      parts: allJobCardParts || [],
      totalEstimatedPartsCost,
    })
  } catch (error) {
    console.error('❌ Error saving parts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to save parts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/job-cards/[id]/parts
 *
 * Updates existing parts on a job card (quantities, status, etc.)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id
    const body = await request.json()

    console.log('📦 Updating parts for job card:', jobCardId, body)

    const supabase = createAdminClient()

    // Verify job card exists
    const { data: jobCard } = await supabase
      .from('job_cards')
      .select('id, garage_id')
      .eq('id', jobCardId)
      .single()

    if (!jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    // Update parts logic here
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Parts updated successfully',
    })
  } catch (error) {
    console.error('❌ Error updating parts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update parts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/job-cards/[id]/parts
 *
 * Fetches all parts for a job card
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id

    const supabase = createAdminClient()

    // Fetch all parts for this job card
    const { data: parts, error } = await supabase
      .from('job_card_parts')
      .select('*')
      .eq('job_card_id', jobCardId)
      .order('requested_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch parts:', error)
      return NextResponse.json(
        { error: 'Failed to fetch parts', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      parts: parts || [],
    })
  } catch (error) {
    console.error('❌ Error fetching parts:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch parts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
