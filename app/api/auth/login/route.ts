import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/login
 *
 * Custom authentication endpoint that fetches user by login_id
 * without password verification
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { loginId } = body

    // Validate input
    if (!loginId) {
      return NextResponse.json(
        { error: 'Login ID is required' },
        { status: 400 }
      )
    }

    // Create admin client to bypass RLS
    const supabase = createAdminClient()

    console.log('Login attempt for:', loginId)

    // Query the garage_auth table to find user by login_id, including password_hash status
    const { data: authData, error: authError } = await supabase
      .from('garage_auth')
      .select('garage_id, user_uid, first_name, last_name, garage_name, user_role, password_hash')
      .eq('login_id', loginId)
      .limit(1)

    console.log('Auth query result:', { error: authError, data: authData, dataLength: authData?.length })

    // Check if user not found
    if (authError || !authData || authData.length === 0) {
      console.log('User not found:', { error: authError, hasData: !!authData, dataLength: authData?.length })
      return NextResponse.json(
        { error: 'User not found with this Login ID' },
        { status: 404 }
      )
    }

    // Extract auth data from the first result
    const authUser = authData[0]
    console.log('Auth user data from query:', authUser)

    // Check if user has a password set
    const hasPassword = authUser.password_hash !== null && authUser.password_hash !== undefined
    console.log('User has password:', hasPassword)

    // Query the users table to get profile picture
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('profile_picture')
      .eq('user_uid', authUser.user_uid)
      .limit(1)

    console.log('Users table query result:', { error: userError, data: userData })

    const profileImageUrl = userData && userData.length > 0 ? userData[0].profile_picture : undefined

    // Return user data on successful lookup
    return NextResponse.json({
      success: true,
      user: {
        garageId: authUser.garage_id, // Now contains valid UUID after database fix
        userUid: authUser.user_uid,
        firstName: authUser.first_name,
        lastName: authUser.last_name,
        garageName: authUser.garage_name,
        userRole: authUser.user_role,
        profileImageUrl: profileImageUrl,
        loginId: loginId,
        hasPassword: hasPassword,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login. Please try again.' },
      { status: 500 }
    )
  }
}
