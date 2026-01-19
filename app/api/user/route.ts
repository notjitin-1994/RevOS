import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/user
 *
 * Fetches all user details from the garage_auth table
 * Supports lookup by userUid or loginId
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userUid = searchParams.get('userUid')
    const loginId = searchParams.get('loginId')

    // Validate input - at least one identifier is required
    if (!userUid && !loginId) {
      return NextResponse.json(
        { error: 'User UID or Login ID is required' },
        { status: 400 }
      )
    }

    // Create Supabase client
    const supabase = await createClient()

    // Try multiple approaches to find the user
    // First, try with userUid (most reliable)
    let data = null
    let error = null
    let searchMethod = ''

    if (userUid) {
      // Try userUid first
      const result = await supabase
        .from('garage_auth')
        .select('*')
        .eq('user_uid', userUid)
        .maybeSingle()
      data = result.data
      error = result.error
      searchMethod = 'user_uid'
      console.log('Search by user_uid:', { userUid, data, error })
    }

    // If not found with userUid and we have loginId, try that
    if (!data && !error && loginId) {
      const result = await supabase
        .from('garage_auth')
        .select('*')
        .eq('login_id', loginId)
        .maybeSingle()
      data = result.data
      error = result.error
      searchMethod = 'login_id'
      console.log('Search by login_id:', { loginId, data, error })
    }

    // If still not found, try listing all to see what's there (for debugging)
    if (!data && !error) {
      const { data: allUsers, error: listError } = await supabase
        .from('garage_auth')
        .select('user_uid, login_id, first_name, last_name')
        .limit(5)

      console.log('Sample users from database:', allUsers)
      console.log('List error:', listError)
    }

    // Check if user not found
    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Database error occurred', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.log('No user found with:', { userUid, loginId, searchMethod })
      return NextResponse.json(
        { error: 'User not found', searchedWith: searchMethod, userUid, loginId },
        { status: 404 }
      )
    }

    // Return all user data
    return NextResponse.json({
      success: true,
      user: {
        garageUid: data.garage_uid,
        userUid: data.user_uid,
        firstName: data.first_name,
        lastName: data.last_name,
        garageName: data.garage_name,
        userRole: data.user_role,
        loginId: data.login_id,
        email: data.email || null,
        phoneNumber: data.phone_number || null,
        address: data.address || null,
        city: data.city || null,
        state: data.state || null,
        zipCode: data.zip_code || null,
        country: data.country || null,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        isActive: data.is_active,
      },
    })
  } catch (error) {
    console.error('Fetch user error:', error)
    return NextResponse.json(
      { error: 'An error occurred while fetching user details. Please try again.' },
      { status: 500 }
    )
  }
}
