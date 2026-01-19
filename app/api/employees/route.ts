import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { v4 as uuidv4 } from 'uuid'

export const dynamic = 'force-dynamic'

/**
 * POST /api/employees
 *
 * Creates a new employee in both users and garage_auth tables.
 * - Generates a new user UID
 * - Inherits garage details from the logged-in user (parent)
 * - Generates login_id as firstname.lastname@garagename
 * - Leaves password_hash empty (to be set by user later)
 */
export async function POST(request: Request) {
  try {
    // Parse request body
    const body = await request.json()
    const { firstName, lastName, employeeId, userRole, email, phoneNumber, parentUserUid } = body

    // Validate required fields
    if (!firstName || !lastName || !userRole || !email || !phoneNumber) {
      return NextResponse.json(
        { error: 'All fields are required: firstName, lastName, userRole, email, phoneNumber' },
        { status: 400 }
      )
    }

    // Validate parent user UID
    if (!parentUserUid) {
      return NextResponse.json(
        { error: 'Parent user UID is required to inherit garage details' },
        { status: 400 }
      )
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Phone validation (basic check for numbers and common formats)
    const phoneRegex = /^[\d\s\+\-\(\)]+$/
    if (!phoneRegex.test(phoneNumber) || phoneNumber.length < 10) {
      return NextResponse.json(
        { error: 'Invalid phone number format (minimum 10 digits)' },
        { status: 400 }
      )
    }

    // Create admin client to bypass RLS
    const adminSupabase = createAdminClient()

    // Fetch parent user (the owner adding the employee) to get garage details
    console.log('Fetching parent user details for UID:', parentUserUid)

    const { data: parentUser, error: parentError } = await adminSupabase
      .from('users')
      .select('*')
      .eq('user_uid', parentUserUid)
      .single()

    if (parentError || !parentUser) {
      console.error('Error fetching parent user:', parentError)
      return NextResponse.json(
        { error: 'Parent user not found or invalid' },
        { status: 404 }
      )
    }

    console.log('Parent user data:', {
      garageUid: parentUser.garage_uid,
      garageId: parentUser.garage_id,
      garageName: parentUser.garage_name,
    })

    // Generate new user UID
    const newUserUid = uuidv4()

    // Generate login_id as firstname.lastname@garagename (lowercase, no spaces)
    const cleanFirstName = firstName.trim().toLowerCase().replace(/\s+/g, '')
    const cleanLastName = lastName.trim().toLowerCase().replace(/\s+/g, '')
    const cleanGarageName = parentUser.garage_name.trim().toLowerCase().replace(/\s+/g, '')
    const loginId = `${cleanFirstName}.${cleanLastName}@${cleanGarageName}`

    console.log('Generated login ID:', loginId)

    // Check if login_id already exists in both tables
    const { data: existingUser, error: checkError } = await adminSupabase
      .from('users')
      .select('user_uid, login_id')
      .eq('login_id', loginId)
      .maybeSingle()

    if (checkError) {
      console.error('Error checking existing login_id:', checkError)
    }

    if (existingUser) {
      return NextResponse.json(
        {
          error: `User with login ID "${loginId}" already exists`,
          existingUser: {
            userUid: existingUser.user_uid,
            loginId: existingUser.login_id
          }
        },
        { status: 409 }
      )
    }

    // Also check garage_auth for orphaned records
    const { data: existingAuth, error: authCheckError } = await adminSupabase
      .from('garage_auth')
      .select('user_uid, login_id')
      .eq('login_id', loginId)
      .maybeSingle()

    if (authCheckError) {
      console.error('Error checking existing auth login_id:', authCheckError)
    }

    if (existingAuth) {
      // Cleanup orphaned auth record
      console.log('Found orphaned auth record, cleaning up:', existingAuth.user_uid)
      await adminSupabase.from('garage_auth').delete().eq('user_uid', existingAuth.user_uid)
    }

    // Prepare user data for insertion
    const newUserData = {
      user_uid: newUserUid,
      garage_uid: parentUser.garage_uid,
      garage_id: parentUser.garage_id,
      garage_name: parentUser.garage_name,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      employee_id: employeeId?.trim() || null,
      login_id: loginId,
      user_role: userRole,
      email: email.trim(),
      phone_number: phoneNumber.trim(),
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('Inserting new user data:', { ...newUserData, user_uid: '***' })

    // Insert into users table
    const { data: insertedUser, error: insertError } = await adminSupabase
      .from('users')
      .insert(newUserData)
      .select()
      .single()

    if (insertError) {
      console.error('Error inserting user:', insertError)
      return NextResponse.json(
        { error: 'Failed to create user', details: insertError.message },
        { status: 500 }
      )
    }

    console.log('User created successfully:', { userUid: newUserUid })

    // Prepare auth data for garage_auth table
    // garage_auth only contains authentication-related fields
    const newAuthData = {
      user_uid: newUserUid,
      garage_id: parentUser.garage_id,
      garage_name: parentUser.garage_name,
      first_name: firstName.trim(),
      last_name: lastName.trim(),
      login_id: loginId,
      user_role: userRole,
      password_hash: null, // Empty - user will set their own password
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    console.log('Inserting auth data...')

    // Insert into garage_auth table
    const { data: insertedAuth, error: authInsertError } = await adminSupabase
      .from('garage_auth')
      .insert(newAuthData)
      .select()
      .single()

    if (authInsertError) {
      console.error('Error inserting auth data:', authInsertError)

      // Rollback: Delete the user from users table
      const { error: deleteError } = await adminSupabase.from('users').delete().eq('user_uid', newUserUid)

      if (deleteError) {
        console.error('Error rolling back user record:', deleteError)
      }

      // Check if it's a duplicate error
      if (authInsertError.code === '23505') {
        return NextResponse.json(
          {
            error: 'A user with this login ID already exists',
            details: 'Please check if this employee has already been added'
          },
          { status: 409 }
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to create authentication record',
          details: authInsertError.message
        },
        { status: 500 }
      )
    }

    console.log('Auth record created successfully')

    // Return success response with created employee data
    return NextResponse.json({
      success: true,
      message: 'Employee added successfully',
      employee: {
        userUid: newUserUid,
        firstName: firstName,
        lastName: lastName,
        loginId: loginId,
        email: email,
        phoneNumber: phoneNumber,
        userRole: userRole,
        garageUid: parentUser.garage_uid,
        garageId: parentUser.garage_id,
        garageName: parentUser.garage_name,
      },
    }, { status: 201 })

  } catch (error) {
    console.error('Unexpected error adding employee:', error)
    return NextResponse.json(
      {
        error: 'An error occurred while adding employee',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
