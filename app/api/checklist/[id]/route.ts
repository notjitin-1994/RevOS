import { NextResponse } from 'next/server'
import { updateChecklistItem } from '@/lib/supabase/job-card-queries'

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
