import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

/**
 * POST /api/auth/set-password
 *
 * Sets a new password for a user by hashing it with bcrypt
 * and updating the password_hash column in garage_auth table
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { loginId, newPassword } = body

    // Validate input
    if (!loginId || !newPassword) {
      return NextResponse.json(
        { error: 'Login ID and new password are required' },
        { status: 400 }
      )
    }

    // Validate password strength
    if (newPassword.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      )
    }

    // Create admin client to bypass RLS
    const supabase = createAdminClient()

    console.log('Setting password for user:', loginId)

    // Hash the password using bcrypt through pgcrypto
    // crypt(password, gen_salt('bf')) generates a bcrypt hash
    const { data: hashResult, error: hashError } = await supabase.rpc('hash_password_new', {
      p_password: newPassword,
    })

    if (hashError) {
      console.error('Password hashing error:', hashError)
      return NextResponse.json(
        { error: 'Failed to hash password' },
        { status: 500 }
      )
    }

    console.log('Password hashed successfully')

    // Update the password_hash in garage_auth table
    const { data: updateData, error: updateError } = await supabase
      .from('garage_auth')
      .update({ password_hash: hashResult })
      .eq('login_id', loginId)
      .select()

    console.log('Password update result:', { error: updateError, data: updateData })

    if (updateError) {
      console.error('Password update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update password' },
        { status: 500 }
      )
    }

    if (!updateData || updateData.length === 0) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Password set successfully
    return NextResponse.json({
      success: true,
      message: 'Password set successfully',
    })
  } catch (error) {
    console.error('Set password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while setting password. Please try again.' },
      { status: 500 }
    )
  }
}
