import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

/**
 * PUT /api/employees/update
 *
 * Updates an existing employee's data in the users table
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const {
      userUid,
      firstName,
      lastName,
      employeeId,
      email,
      phoneNumber,
      alternatePhone,
      address,
      city,
      state,
      zipCode,
      country,
      dateOfBirth,
      bloodGroup,
      department,
      role,
      dateOfJoining,
      status,
    } = body

    // Validate required fields
    if (!userUid) {
      return NextResponse.json(
        { error: 'User UID is required' },
        { status: 400 }
      )
    }

    // Validate firstName if provided
    if (firstName !== undefined && firstName !== null && !firstName.trim()) {
      return NextResponse.json(
        { error: 'First name cannot be empty' },
        { status: 400 }
      )
    }

    // Validate lastName if provided
    if (lastName !== undefined && lastName !== null && !lastName.trim()) {
      return NextResponse.json(
        { error: 'Last name cannot be empty' },
        { status: 400 }
      )
    }

    // Email validation
    if (email !== undefined && email !== null) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (email && !emailRegex.test(email)) {
        return NextResponse.json(
          { error: 'Invalid email format' },
          { status: 400 }
        )
      }
    }

    // Phone validation
    if (phoneNumber !== undefined && phoneNumber !== null) {
      const phoneRegex = /^[\d\s\+\-\(\)]+$/
      if (phoneNumber && (!phoneRegex.test(phoneNumber) || phoneNumber.length < 10)) {
        return NextResponse.json(
          { error: 'Invalid phone number format (minimum 10 digits)' },
          { status: 400 }
        )
      }
    }

    // Create admin client to bypass RLS
    const adminSupabase = await createAdminClient()

    // Prepare update data (snake_case for database)
    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    // Only include fields that are being updated
    if (firstName !== undefined && firstName !== null) {
      updateData.first_name = firstName.trim()
    }
    if (lastName !== undefined && lastName !== null) {
      updateData.last_name = lastName.trim()
    }
    if (employeeId !== undefined && employeeId !== null) {
      updateData.employee_id = employeeId.trim() || null
    }
    if (email !== undefined && email !== null) {
      updateData.email = email.trim() || null
    }
    if (phoneNumber !== undefined && phoneNumber !== null) {
      updateData.phone_number = phoneNumber.trim() || null
    }
    if (alternatePhone !== undefined && alternatePhone !== null) {
      updateData.alternate_phone = typeof alternatePhone === 'string' ? alternatePhone.trim() || null : alternatePhone
    }
    if (address !== undefined && address !== null) {
      updateData.address = typeof address === 'string' ? address.trim() || null : address
    }
    if (city !== undefined && city !== null) {
      updateData.city = typeof city === 'string' ? city.trim() || null : city
    }
    if (state !== undefined && state !== null) {
      updateData.state = typeof state === 'string' ? state.trim() || null : state
    }
    if (zipCode !== undefined && zipCode !== null) {
      updateData.zip_code = typeof zipCode === 'string' ? zipCode.trim() || null : zipCode
    }
    if (country !== undefined && country !== null) {
      updateData.country = typeof country === 'string' ? country.trim() || null : country
    }
    if (dateOfBirth !== undefined && dateOfBirth !== null) {
      updateData.date_of_birth = dateOfBirth || null
    }
    if (bloodGroup !== undefined && bloodGroup !== null) {
      updateData.blood_group = bloodGroup || null
    }
    if (department !== undefined && department !== null) {
      updateData.department = department || null
    }
    if (role !== undefined && role !== null) {
      updateData.user_role = role || null
    }
    if (dateOfJoining !== undefined && dateOfJoining !== null) {
      updateData.date_of_joining = dateOfJoining || null
    }
    if (status !== undefined && status !== null) {
      updateData.is_active = status === 'active'
    }

    console.log('[updateEmployee] Starting update for user_uid:', userUid)
    console.log('[updateEmployee] Update data:', updateData)

    // Update users table
    console.log('[updateEmployee] Updating users table...')
    const { data, error } = await adminSupabase
      .from('users')
      .update(updateData)
      .eq('user_uid', userUid)
      .select()
      .single()

    if (error) {
      console.error('[updateEmployee] Error updating employee:', error)
      console.error('[updateEmployee] Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      })
      return NextResponse.json(
        { error: 'Failed to update employee', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      console.error('[updateEmployee] Employee not found:', userUid)
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    console.log('[updateEmployee] Successfully updated users table')
    console.log('[updateEmployee] Updated user data:', {
      user_uid: data.user_uid,
      first_name: data.first_name,
      last_name: data.last_name,
      login_id: data.login_id,
      email: data.email,
      phone_number: data.phone_number,
    })

    // Also update garage_auth table if needed
    // Sync fields that exist in both tables
    // Use the actual values from the database (data) to ensure consistency
    const authUpdates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    }

    if (updateData.first_name) {
      authUpdates.first_name = data.first_name
      console.log('[updateEmployee] Syncing first_name to garage_auth:', data.first_name)
    }
    if (updateData.last_name) {
      authUpdates.last_name = data.last_name
      console.log('[updateEmployee] Syncing last_name to garage_auth:', data.last_name)
    }
    if (updateData.user_role) {
      authUpdates.user_role = data.user_role
      console.log('[updateEmployee] Syncing user_role to garage_auth:', data.user_role)
    }
    if (updateData.login_id) {
      authUpdates.login_id = data.login_id
      console.log('[updateEmployee] Syncing login_id to garage_auth:', data.login_id)
    }

    console.log('[updateEmployee] Prepared garage_auth updates:', authUpdates)
    console.log('[updateEmployee] Number of fields to sync:', Object.keys(authUpdates).length)

    // Only make the update call if there are actual changes to sync
    if (Object.keys(authUpdates).length > 1) { // More than just updated_at
      console.log('[updateEmployee] Syncing to garage_auth table for user_uid:', userUid)

      // First check if record exists in garage_auth
      const { data: existingAuth, error: checkError } = await adminSupabase
        .from('garage_auth')
        .select('user_uid, first_name, last_name, login_id, user_role')
        .eq('user_uid', userUid)
        .maybeSingle()

      if (checkError) {
        console.error('[updateEmployee] Error checking garage_auth:', checkError)
      }

      if (!existingAuth) {
        console.warn('[updateEmployee] WARNING: No garage_auth record found for user_uid:', userUid)
        console.warn('[updateEmployee] Skipping garage_auth update. Record needs to be created first.')
      } else {
        console.log('[updateEmployee] Found existing garage_auth record:', existingAuth)

        const { error: authError, data: authUpdateData, count } = await adminSupabase
          .from('garage_auth')
          .update(authUpdates)
          .eq('user_uid', userUid)
          .select('user_uid, first_name, last_name, login_id, user_role, updated_at')
          .single()

        if (authError) {
          console.error('[updateEmployee] Error updating garage_auth:', authError)
          console.error('[updateEmployee] Error details:', {
            code: authError.code,
            message: authError.message,
            details: authError.details,
            hint: authError.hint,
          })
          // Don't fail the request if auth update fails, just log it
        } else {
          console.log('[updateEmployee] Successfully synced to garage_auth table')
          console.log('[updateEmployee] Update count:', count)
          console.log('[updateEmployee] Updated garage_auth record:', authUpdateData)
        }
      }
    } else {
      console.log('[updateEmployee] No fields to sync to garage_auth (only updated_at)')
    }

    console.log('[updateEmployee] Employee updated successfully:', userUid)

    return NextResponse.json({
      success: true,
      message: 'Employee updated successfully',
      employee: {
        id: data.user_uid,
        firstName: data.first_name,
        lastName: data.last_name,
        employeeId: data.employee_id,
        email: data.email,
        phoneNumber: data.phone_number,
        alternatePhone: data.alternate_phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zip_code,
        country: data.country,
        dateOfBirth: data.date_of_birth,
        bloodGroup: data.blood_group,
        department: data.department,
        role: data.user_role,
        dateOfJoining: data.date_of_joining,
        status: data.is_active ? 'active' : 'inactive',
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'An error occurred while updating employee',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
