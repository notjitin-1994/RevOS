import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/verify-password
 *
 * Verifies password against the stored hash in garage_auth table
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { loginId, password } = body

    // Validate input
    if (!loginId || !password) {
      return NextResponse.json(
        { error: 'Login ID and password are required' },
        { status: 400 }
      )
    }

    // Create admin client to bypass RLS
    const supabase = createAdminClient()

    console.log('Password verification attempt for:', loginId)

    // Query the garage_auth table to get the password_hash
    const { data: authData, error: authError } = await supabase
      .from('garage_auth')
      .select('password_hash')
      .eq('login_id', loginId)
      .limit(1)

    if (authError || !authData || authData.length === 0) {
      console.log('User not found:', { error: authError, hasData: !!authData, dataLength: authData?.length })
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const user = authData[0]

    // Check if user has a password
    if (!user.password_hash) {
      console.log('User has no password set')
      return NextResponse.json(
        { error: 'No password set for this account' },
        { status: 400 }
      )
    }

    // Verify password using crypt() function
    const { data: verifyResult, error: verifyError } = await supabase.rpc('verify_password', {
      input_password: password,
      stored_hash: user.password_hash,
    })

    if (verifyError) {
      console.log('Password verification error:', verifyError)
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    if (!verifyResult) {
      console.log('Password does not match')
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      )
    }

    // Password verified successfully
    return NextResponse.json({
      success: true,
      message: 'Password verified successfully',
    })
  } catch (error) {
    console.error('Password verification error:', error)
    return NextResponse.json(
      { error: 'An error occurred during password verification. Please try again.' },
      { status: 500 }
    )
  }
}
