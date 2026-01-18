import { NextResponse } from 'next/server'
import { deleteCustomer } from '@/lib/supabase/customer-queries'

/**
 * DELETE /api/customers/delete
 *
 * Soft deletes a customer by setting status to inactive
 */
export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { customerId } = body

    if (!customerId) {
      return NextResponse.json(
        { error: 'Customer ID is required' },
        { status: 400 }
      )
    }

    console.log('Deleting customer:', customerId)

    const result = await deleteCustomer(customerId)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to delete customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
    })
  } catch (error) {
    console.error('Error deleting customer:', error)
    return NextResponse.json(
      {
        error: 'Failed to delete customer',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
