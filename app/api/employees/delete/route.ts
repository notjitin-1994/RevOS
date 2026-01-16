import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * DELETE /api/employees/delete
 *
 * Soft deletes an employee by setting is_active to false
 */
export async function DELETE(request: Request) {
  try {
    const supabase = await createClient()

    // Get request body
    const body = await request.json()
    const { employeeId } = body

    if (!employeeId) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    console.log('Soft deleting employee:', employeeId)

    // Update is_active to false (soft delete)
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: false })
      .eq('user_uid', employeeId)
      .select()

    if (error) {
      console.error('Error deleting employee:', error)
      return NextResponse.json(
        { error: 'Failed to delete employee', details: error.message },
        { status: 500 }
      )
    }

    if (!data || data.length === 0) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    console.log('Employee deleted successfully:', employeeId)

    return NextResponse.json({
      success: true,
      message: 'Employee deleted successfully',
      employee: data[0],
    })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      {
        error: 'An error occurred while deleting employee',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
