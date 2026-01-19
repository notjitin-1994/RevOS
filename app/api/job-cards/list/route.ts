import { NextResponse } from 'next/server'
import { getJobCardsByGarageId, type JobCardFilters } from '@/lib/supabase/job-card-queries'

export const dynamic = 'force-dynamic'

/**
 * GET /api/job-cards/list
 *
 * Fetches all job cards for a garage with optional filters
 */
export async function GET(request: Request) {
  try {
    const url = new URL(request.url)
    const garageId = url.searchParams.get('garageId')

    if (!garageId) {
      return NextResponse.json(
        { error: 'Garage ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching job cards for garage ID:', garageId)

    // Extract filters from query params
    const filters: JobCardFilters = {}

    if (url.searchParams.get('status')) {
      filters.status = url.searchParams.get('status') as any
    }

    if (url.searchParams.get('mechanicId')) {
      filters.mechanicId = url.searchParams.get('mechanicId')!
    }

    if (url.searchParams.get('customerId')) {
      filters.customerId = url.searchParams.get('customerId')!
    }

    if (url.searchParams.get('dateFrom')) {
      filters.dateFrom = url.searchParams.get('dateFrom')!
    }

    if (url.searchParams.get('dateTo')) {
      filters.dateTo = url.searchParams.get('dateTo')!
    }

    if (url.searchParams.get('search')) {
      filters.search = url.searchParams.get('search')!
    }

    // Fetch job cards with filters
    const jobCards = await getJobCardsByGarageId(garageId, filters)

    console.log(`Found ${jobCards.length} job cards`)

    return NextResponse.json({
      success: true,
      jobCards,
      count: jobCards.length,
    })
  } catch (error) {
    console.error('Error fetching job cards:', error)

    // Check if it's a database table not found error
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    if (errorMessage.includes('Could not find the table') || errorMessage.includes('PGRST205')) {
      // Return a special response for database not configured
      return NextResponse.json(
        {
          success: true,
          jobCards: [],
          count: 0,
          databaseNotConfigured: true,
          message: 'Job cards database table not found. Please run the migration.',
        },
        { status: 200 }
      )
    }

    return NextResponse.json(
      {
        error: 'Failed to fetch job cards',
        details: errorMessage,
        code: 'UNKNOWN_ERROR',
      },
      { status: 500 }
    )
  }
}
