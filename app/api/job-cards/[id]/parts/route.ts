import { NextResponse } from 'next/server'
import {
  getJobCardParts,
  allocatePartsToJobCard,
  updateJobCardPartStatus,
  deallocatePartsFromJobCard,
  checkPartsAvailability,
  type JobCardPartInput,
} from '@/lib/supabase/job-card-queries'

type RouteContext = {
  params: Promise<{
    jobCardId: string
  }>
}

/**
 * GET /api/job-cards/[jobCardId]/parts
 *
 * Get all parts for a job card
 */
export async function GET(
  request: Request,
  context: RouteContext
) {
  try {
    const { jobCardId } = await context.params

    if (!jobCardId) {
      return NextResponse.json(
        { error: 'Job card ID is required' },
        { status: 400 }
      )
    }

    const parts = await getJobCardParts(jobCardId)

    return NextResponse.json({
      success: true,
      parts,
      count: parts.length,
    })
  } catch (error) {
    console.error('Error fetching job card parts:', error)
    return NextResponse.json(
      {
        error: 'Failed to fetch job card parts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/job-cards/[jobCardId]/parts
 *
 * Allocate additional parts to an existing job card
 *
 * Request body:
 * {
 *   "parts": JobCardPartInput[],
 *   "userId": string,
 *   "userName?: string
 * }
 */
export async function POST(
  request: Request,
  context: RouteContext
) {
  try {
    const { jobCardId } = await context.params

    if (!jobCardId) {
      return NextResponse.json(
        { error: 'Job card ID is required' },
        { status: 400 }
      )
    }

    const body = await request.json()

    // Validate required fields
    if (!body.parts || !Array.isArray(body.parts)) {
      return NextResponse.json(
        { error: 'Parts array is required' },
        { status: 400 }
      )
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Optionally check availability before allocation
    if (body.checkAvailability === true) {
      const partsToCheck = body.parts
        .filter((part: JobCardPartInput) => part.partId !== null)
        .map((part: JobCardPartInput) => ({
          partId: part.partId!,
          quantity: part.quantity,
        }))

      // Get garage ID from job card
      // For simplicity, we'll skip this check here and let the RPC handle it
      // In production, you might want to validate garage access first
    }

    // Allocate parts using the RPC function
    const result = await allocatePartsToJobCard(
      jobCardId,
      body.parts,
      body.userId,
      body.userName
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Parts allocated successfully',
      data: result.data,
    })
  } catch (error) {
    console.error('Error allocating parts:', error)
    return NextResponse.json(
      {
        error: 'Failed to allocate parts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/job-cards/[jobCardId]/parts
 *
 * Update part status or quantity
 *
 * Request body:
 * {
 *   "jobCardPartId": string,
 *   "newStatus": "allocated" | "ordered" | "received" | "used" | "returned" | "cancelled",
 *   "quantityUsed?: number,
 *   "actualUnitPrice?: number,
 *   "userId": string
 * }
 */
export async function PATCH(
  request: Request,
  context: RouteContext
) {
  try {
    const { jobCardId } = await context.params

    const body = await request.json()

    // Validate required fields
    if (!body.jobCardPartId) {
      return NextResponse.json(
        { error: 'Job card part ID is required' },
        { status: 400 }
      )
    }

    if (!body.newStatus) {
      return NextResponse.json(
        { error: 'New status is required' },
        { status: 400 }
      )
    }

    if (!body.userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Update part status
    const result = await updateJobCardPartStatus(
      body.jobCardPartId,
      body.newStatus,
      body.userId,
      body.quantityUsed,
      body.actualUnitPrice
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Part status updated successfully',
      part: result.part,
    })
  } catch (error) {
    console.error('Error updating part status:', error)
    return NextResponse.json(
      {
        error: 'Failed to update part status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/job-cards/[jobCardId]/parts
 *
 * Deallocate parts from a job card (return to inventory)
 *
 * Query parameters:
 * - jobCardPartId: string (required)
 * - quantity: number (optional - if not provided, returns all allocated quantity)
 * - userId: string (optional)
 * - userName: string (optional)
 */
export async function DELETE(
  request: Request,
  context: RouteContext
) {
  try {
    const { jobCardId } = await context.params

    const { searchParams } = new URL(request.url)

    const jobCardPartId = searchParams.get('jobCardPartId')
    const quantity = searchParams.get('quantity')
    const userId = searchParams.get('userId')
    const userName = searchParams.get('userName')

    if (!jobCardPartId) {
      return NextResponse.json(
        { error: 'Job card part ID is required' },
        { status: 400 }
      )
    }

    // Deallocate parts
    const result = await deallocatePartsFromJobCard(
      jobCardPartId,
      quantity ? parseInt(quantity, 10) : undefined,
      userId || undefined,
      userName || undefined
    )

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Parts deallocated successfully',
      data: result.data,
    })
  } catch (error) {
    console.error('Error deallocating parts:', error)
    return NextResponse.json(
      {
        error: 'Failed to deallocate parts',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
