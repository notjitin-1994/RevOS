import { NextResponse } from 'next/server'
import { getJobCardById, updateJobCard, deleteJobCard, updateJobCardStatus } from '@/lib/supabase/job-card-queries'

/**
 * GET /api/job-cards/[id]
 *
 * Fetches a single job card by ID with all relations
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

    console.log('Fetching job card:', jobCardId)

    const jobCard = await getJobCardById(jobCardId)

    if (!jobCard) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      jobCard,
    })
  } catch (error) {
    console.error('Error fetching job card:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch job card',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/job-cards/[id]
 *
 * Updates a job card
 */
export async function PUT(
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

    console.log('Updating job card:', jobCardId)

    const result = await updateJobCard(jobCardId, body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      jobCard: result.jobCard,
    })
  } catch (error) {
    console.error('Error updating job card:', error)
    return NextResponse.json(
      {
        error: 'Failed to update job card',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/job-cards/[id]
 *
 * Soft deletes a job card
 */
export async function DELETE(
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

    console.log('Deleting job card:', jobCardId)

    const result = await deleteJobCard(jobCardId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Job card deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting job card:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete job card',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/job-cards/[id]/status
 *
 * Updates job card status with history tracking
 */
export async function PATCH(
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

    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    console.log('Updating job card status:', jobCardId, 'to:', body.status)

    const result = await updateJobCardStatus(
      jobCardId,
      body.status,
      body.userId,
      body.reason
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Status updated successfully',
    })
  } catch (error) {
    console.error('Error updating status:', error)
    return NextResponse.json(
      {
        error: 'Failed to update status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
