import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * POST /api/inventory/log-communication
 *
 * Logs a vendor communication or order
 *
 * Request body:
 * {
 *   partId: string
 *   vendorName: string
 *   communicationType: 'phone' | 'email'
 *   outcome: 'order-placed' | 'price-quote' | 'follow-up-required' | 'no-answer' | 'other'
 *   quantityOrdered?: number
 *   expectedDeliveryDate?: string
 *   notes?: string
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate required fields
    if (!body.partId) {
      return NextResponse.json(
        { success: false, error: 'Part ID is required' },
        { status: 400 }
      )
    }

    if (!body.vendorName) {
      return NextResponse.json(
        { success: false, error: 'Vendor name is required' },
        { status: 400 }
      )
    }

    if (!body.communicationType || !['phone', 'email'].includes(body.communicationType)) {
      return NextResponse.json(
        { success: false, error: 'Communication type must be phone or email' },
        { status: 400 }
      )
    }

    if (!body.outcome) {
      return NextResponse.json(
        { success: false, error: 'Outcome is required' },
        { status: 400 }
      )
    }

    const validOutcomes = ['order-placed', 'price-quote', 'follow-up-required', 'no-answer', 'other']
    if (!validOutcomes.includes(body.outcome)) {
      return NextResponse.json(
        { success: false, error: `Outcome must be one of: ${validOutcomes.join(', ')}` },
        { status: 400 }
      )
    }

    // Validate order-placed specific fields
    if (body.outcome === 'order-placed') {
      if (!body.quantityOrdered || body.quantityOrdered <= 0) {
        return NextResponse.json(
          { success: false, error: 'Quantity ordered is required when order is placed' },
          { status: 400 }
        )
      }

      if (!body.expectedDeliveryDate) {
        return NextResponse.json(
          { success: false, error: 'Expected delivery date is required when order is placed' },
          { status: 400 }
        )
      }
    }

    const supabase = createAdminClient()

    // Check if part exists
    const { data: part, error: partError } = await supabase
      .from('parts')
      .select('id, part_name, part_number')
      .eq('id', body.partId)
      .single()

    if (partError || !part) {
      return NextResponse.json(
        { success: false, error: 'Part not found' },
        { status: 404 }
      )
    }

    // Insert communication log
    const { data: communicationLog, error: logError } = await supabase
      .from('parts_communications')
      .insert({
        part_id: body.partId,
        vendor_name: body.vendorName,
        communication_type: body.communicationType,
        outcome: body.outcome,
        quantity_ordered: body.quantityOrdered || null,
        expected_delivery_date: body.expectedDeliveryDate || null,
        notes: body.notes || null,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (logError) {
      console.error('Error logging communication:', logError)
      return NextResponse.json(
        { success: false, error: `Failed to log communication: ${logError.message}` },
        { status: 500 }
      )
    }

    // If order was placed, create a transaction record
    if (body.outcome === 'order-placed' && body.quantityOrdered) {
      const { error: transactionError } = await supabase
        .from('parts_transactions')
        .insert({
          part_id: body.partId,
          transaction_type: 'purchase',
          quantity: body.quantityOrdered,
          vendor_name: body.vendorName,
          communication_id: communicationLog.id,
          created_at: new Date().toISOString(),
        })

      if (transactionError) {
        console.error('Error creating transaction record:', transactionError)
        // Don't fail the request if transaction creation fails
      }
    }

    return NextResponse.json({
      success: true,
      communication: {
        id: communicationLog.id,
        partId: communicationLog.part_id,
        vendorName: communicationLog.vendor_name,
        communicationType: communicationLog.communication_type,
        outcome: communicationLog.outcome,
        quantityOrdered: communicationLog.quantity_ordered,
        expectedDeliveryDate: communicationLog.expected_delivery_date,
        notes: communicationLog.notes,
        createdAt: communicationLog.created_at,
      },
      message: 'Communication logged successfully',
    })
  } catch (error) {
    console.error('Error in log communication API route:', error)
    const message = error instanceof Error ? error.message : 'Failed to log communication'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
