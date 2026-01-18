import { NextRequest, NextResponse } from 'next/server'
import { getMotorcyclesGroupedByMake } from '@/lib/supabase/motorcycle-queries'

/**
 * GET /api/motorcycles/list
 *
 * Fetches all motorcycle makes and models from the catalog.
 * Used for part fitment selection and other catalog references.
 */
export async function GET(request: NextRequest) {
  try {
    const makes = await getMotorcyclesGroupedByMake()

    return NextResponse.json({
      success: true,
      makes,
    })
  } catch (error) {
    console.error('Error fetching motorcycle catalog:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch motorcycle catalog',
      },
      { status: 500 }
    )
  }
}
