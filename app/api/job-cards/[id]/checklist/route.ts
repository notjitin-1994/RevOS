import { NextResponse } from 'next/server'
import { getChecklistItems, createChecklistItem } from '@/lib/supabase/job-card-queries'

/**
 * GET /api/job-cards/[id]/checklist
 *
 * Fetches all checklist items for a job card
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id

    if (!jobCardId) {
      return NextResponse.json(
        { error: 'Job card ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching checklist items for job card:', jobCardId)

    const checklistItems = await getChecklistItems(jobCardId)

    return NextResponse.json({
      success: true,
      checklistItems,
      count: checklistItems.length,
    })
  } catch (error) {
    console.error('Error fetching checklist items:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch checklist items',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/job-cards/[id]/checklist
 *
 * Creates a new checklist item for a job card
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id
    const body = await request.json()

    if (!jobCardId) {
      return NextResponse.json(
        { error: 'Job card ID is required' },
        { status: 400 }
      )
    }

    if (!body.itemName) {
      return NextResponse.json(
        { error: 'Item name is required' },
        { status: 400 }
      )
    }

    console.log('Creating checklist item for job card:', jobCardId)

    const result = await createChecklistItem(jobCardId, {
      mechanicId: body.mechanicId || null,
      itemName: body.itemName,
      description: body.description || null,
      category: body.category || null,
      status: body.status || 'pending',
      priority: body.priority || 'medium',
      estimatedMinutes: body.estimatedMinutes || 0,
      laborRate: body.laborRate || 0,
      displayOrder: body.displayOrder || 0,
      notes: body.notes || null,
    })

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
    console.error('Error creating checklist item:', error)
    return NextResponse.json(
      {
        error: 'Failed to create checklist item',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
