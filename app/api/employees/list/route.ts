import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * GET /api/employees/list
 *
 * Fetches all employees for the current garage
 * Excludes the owner (user with role 'Owner')
 */
export async function GET(request: Request) {
  try {
    const supabase = await createClient()

    // Get current user from session
    const authHeader = request.headers.get('authorization')
    let garageId: string | null = null

    // Try to get garage_id from various sources
    // In production, this should come from a proper JWT/session token
    const url = new URL(request.url)
    const garageIdParam = url.searchParams.get('garageId')

    if (garageIdParam) {
      garageId = garageIdParam
    }

    if (!garageId) {
      return NextResponse.json(
        { error: 'Garage ID is required' },
        { status: 400 }
      )
    }

    console.log('Fetching employees for garage ID:', garageId)

    // Fetch employees from users table
    // Filter by garage_id and exclude Owner role
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('garage_id', garageId)
      .neq('user_role', 'Owner')
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
      role: user.user_role,
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
