import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user-roles
 *
 * Fetches all active user roles from the database
 */
export async function GET() {
  try {
    const supabase = await createClient()

    console.log('Attempting to fetch user_roles from database...')

    const { data, error } = await supabase
      .from('user_roles')
      .select('role_name')

    if (error) {
      console.error('Supabase error fetching user roles:', error)
      return NextResponse.json(
        {
          error: 'Failed to fetch user roles',
          details: error.message,
          hint: error.hint,
          code: error.code
        },
        { status: 500 }
      )
    }

    console.log('Raw data from database:', data)

    // Extract role names from the result
    const roles = data?.map((item: any) => item.role_name) || []

    console.log('Extracted roles:', roles)

    return NextResponse.json({
      success: true,
      roles: roles,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'An error occurred while fetching user roles',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
