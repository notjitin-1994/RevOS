import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/employees/by-login/[loginId]
 *
 * Fetches an employee by their login_id
 */
export async function GET(
  request: Request,
  { params }: { params: { loginId: string } }
) {
  try {
    const { loginId } = params

    if (!loginId) {
      return NextResponse.json(
        { error: 'Login ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching employee for login_id:', loginId)

    // Create admin client to bypass RLS
    const adminSupabase = await createClient()

    // Fetch employee by login_id
    const { data, error } = await adminSupabase
      .from('users')
      .select('*')
      .eq('login_id', loginId)
      .single()

    if (error) {
      console.error('Error fetching employee:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employee', details: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    console.log('Employee found:', data.user_uid)

    // Return employee data
    return NextResponse.json({
      success: true,
      employee: {
        userUid: data.user_uid,
        firstName: data.first_name,
        lastName: data.last_name,
        employeeId: data.employee_id,
        loginId: data.login_id,
        email: data.email,
        alternateEmail: data.alternate_email,
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
        userRole: data.user_role,
        dateOfJoining: data.date_of_joining,
        isActive: data.is_active,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        garageName: data.garage_name,
        profilePicture: data.profile_picture,
        emergencyContactName: data.emergency_contact_name,
        emergencyContactPhone: data.emergency_contact_phone,
        emergencyContactRelation: data.emergency_contact_relation,
        idProofType: data.id_proof_type,
        idProofNumber: data.id_proof_number,
      },
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'An error occurred while fetching employee',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
