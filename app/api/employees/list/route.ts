import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'

/**
 * GET /api/employees/list
 *
 * Fetches all employees for the current garage
 * Excludes the owner (user with role 'Owner')
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get garage_id from query params (this is the garage_uid in users table)
    const url = new URL(request.url)
    const garageUid = url.searchParams.get('garageId')

    if (!garageUid) {
      console.error('No garageId provided')
      return NextResponse.json(
        { error: 'Garage ID is required', garageId: garageUid },
        { status: 400 }
      )
    }

    console.log('Fetching employees for garage_uid:', garageUid)

    // Fetch employees from users table using garage_uid
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('garage_uid', garageUid)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching employees:', error)
      return NextResponse.json(
        { error: 'Failed to fetch employees', details: error.message },
        { status: 500 }
      )
    }

    console.log(`Found ${data?.length || 0} employees`)

    // Transform database data to frontend format
    const employees = data?.map((user: any) => ({
      id: user.user_uid,
      firstName: user.first_name,
      lastName: user.last_name,
      employeeId: user.employee_id || null,
      email: user.email || null,
      phoneNumber: user.phone_number || null,
      alternatePhone: user.alternate_phone || null,
      address: user.address || null,
      city: user.city || null,
      state: user.state || null,
      zipCode: user.zip_code || null,
      country: user.country || null,
      dateOfBirth: user.date_of_birth || null,
      dateOfJoining: user.date_of_joining || null,
      bloodGroup: user.blood_group || null,
      department: user.department || null,
      userRole: user.user_role,
      status: user.is_active ? 'active' : 'inactive',
      profilePicture: user.profile_picture || null,
      certifications: [],
      specializations: [],
      userUid: user.user_uid,
      loginId: user.login_id,
      garageUid: user.garage_uid,
      garageId: user.garage_id,
      garageName: user.garage_name,
    })) || []

    return NextResponse.json({
      success: true,
      employees: employees,
      count: employees.length,
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'An error occurred while fetching employees',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
