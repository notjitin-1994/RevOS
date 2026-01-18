import { NextResponse } from 'next/server'
import { startTimeEntry, stopTimeEntry, updateChecklistItem, getChecklistItems } from '@/lib/supabase/job-card-queries'

/**
 * PUT /api/checklist/[id]
 *
 * Updates a checklist item
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const checklistItemId = params.id
    const body = await request.json()

    if (!checklistItemId) {
      return NextResponse.json(
        { error: 'Checklist item ID is required' },
        { status: 400 }
      )
    }

    console.log('Updating checklist item:', checklistItemId)

    const result = await updateChecklistItem(checklistItemId, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      checklistItem: result.checklistItem,
    })
  } catch (error) {
    console.error('Error updating checklist item:', error)
    return NextResponse.json(
      {
        error: 'Failed to update checklist item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/checklist/[id]/start
 *
 * Starts timer for a checklist item
 */
export async function POST_start(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const checklistItemId = params.id
    const body = await request.json()

    if (!checklistItemId) {
      return NextResponse.json(
        { error: 'Checklist item ID is required' },
        { status: 400 }
      )
    }

    if (!body.mechanicId) {
      return NextResponse.json(
        { error: 'Mechanic ID is required' },
        { status: 400 }
      )
    }

    console.log('Starting timer for checklist item:', checklistItemId)

    const result = await startTimeEntry(checklistItemId, body.mechanicId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      timeEntry: result.timeEntry,
    })
  } catch (error) {
    console.error('Error starting timer:', error)
    return NextResponse.json(
      {
        error: 'Failed to start timer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/checklist/[id]/stop
 *
 * Stops timer for a time entry
 */
export async function POST_stop(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const timeEntryId = params.id

    if (!timeEntryId) {
      return NextResponse.json(
        { error: 'Time entry ID is required' },
        { status: 400 }
      )
    }

    console.log('Stopping timer for time entry:', timeEntryId)

    const result = await stopTimeEntry(timeEntryId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      timeEntry: result.timeEntry,
    })
  } catch (error) {
    console.error('Error stopping timer:', error)
    return NextResponse.json(
      {
        error: 'Failed to stop timer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
