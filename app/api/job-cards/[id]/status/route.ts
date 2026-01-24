import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * PATCH /api/job-cards/[id]/status
 *
 * Updates job card status with validation and audit trail
 *
 * Request Body:
 * - status (required): New status value
 * - userId (optional): ID of user making the change
 * - notes (optional): Optional notes about the status change
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id
    const body = await request.json()
    const { status, userId, notes } = body

    // Validate required fields
    if (!status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Validate status value
    const validStatuses = [
      'draft',
      'queued',
      'assigned',
      'in_progress',
      'parts_waiting',
      'quality_check',
      'ready',
      'delivered',
      'invoiced',
      'closed',
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      )
    }

    console.log('📋 Job card status update API called for ID:', jobCardId, 'New status:', status)

    // Create Supabase admin client (bypasses RLS for server-side API)
    const supabase = createAdminClient()

    // Check if job card exists
    const { data: existingCard, error: fetchError } = await supabase
      .from('job_cards')
      .select('id, status, garage_id, job_card_number')
      .eq('id', jobCardId)
      .single()

    if (fetchError || !existingCard) {
      console.error('❌ Job card not found:', jobCardId)
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const updateData: any = {
      status,
      updated_at: new Date().toISOString(),
    }

    // Update timestamps based on status transitions
    const statusTransitions: Record<string, string> = {
      queued: 'actual_start_date',
      in_progress: 'actual_start_date',
      ready: 'actual_completion_date',
      delivered: 'actual_completion_date',
    }

    if (statusTransitions[status]) {
      updateData[statusTransitions[status]] = new Date().toISOString()
    }

    // Add technician notes if provided
    if (notes) {
      // Fetch existing notes and append
      const { data: currentNotes } = await supabase
        .from('job_cards')
        .select('technician_notes')
        .eq('id', jobCardId)
        .single()

      const timestamp = new Date().toLocaleString()
      const notePrefix = currentNotes?.technician_notes
        ? `${currentNotes.technician_notes}\n\n`
        : ''
      const noteEntry = `[Status Change to ${status.toUpperCase()} - ${timestamp}]\n${notes}`

      updateData.technician_notes = notePrefix + noteEntry
    }

    // Update the job card
    const { data: updatedCard, error: updateError } = await supabase
      .from('job_cards')
      .update(updateData)
      .select()
      .eq('id', jobCardId)
      .single()

    if (updateError) {
      console.error('❌ Supabase error updating job card status:', updateError)
      return NextResponse.json(
        { error: 'Failed to update status', details: updateError.message },
        { status: 500 }
      )
    }

    console.log(`✅ Job card ${updatedCard.job_card_number} status updated: ${existingCard.status} → ${status}`)

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
      data: {
        id: updatedCard.id,
        jobCardNumber: updatedCard.job_card_number,
        previousStatus: existingCard.status,
        newStatus: status,
        updatedAt: updatedCard.updated_at,
      },
    })
  } catch (error) {
    console.error('❌ Error in job card status API:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to update status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
