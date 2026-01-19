import { NextRequest, NextResponse } from 'next/server'
import { getParts } from '@/lib/supabase/inventory-queries'

/**
 * GET /api/inventory/list
 *
 * Fetches parts from the database with optional filtering, search, and pagination
 *
 * Query Parameters:
 * - search: string - Search term (searches part name, number, make, model)
 * - category: string - Filter by category
 * - stockStatus: string - Filter by stock status ('In Stock', 'Low Stock', 'Out of Stock')
 * - page: number - Page number (default: 1)
 * - pageSize: number - Items per page (default: 10)
 *
 * Example:
 * GET /api/inventory/list?search=brake&category=Brakes&stockStatus=In%20Stock&page=1&pageSize=10
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)

    const search = searchParams.get('search') || undefined
    const category = searchParams.get('category') || undefined
    const stockStatus = searchParams.get('stockStatus') || undefined
    const page = parseInt(searchParams.get('page') || '1')
    const pageSize = parseInt(searchParams.get('pageSize') || '10')

    const result = await getParts({
      search,
      category,
      stockStatus,
      page,
      pageSize,
    })

    return NextResponse.json({
      success: true,
      ...result,
    })
  } catch (error) {
    console.error('Error fetching parts:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch parts',
      },
      { status: 500 }
    )
  }
}
