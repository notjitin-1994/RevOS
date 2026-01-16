import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { updateGarage } from '@/lib/supabase/garage-queries'

/**
 * PUT /api/garage/update
 *
 * Updates garage information and syncs to garage_auth table
 * Uses admin client to bypass RLS policies
 */
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { garageId, updates } = body

    // Validate required fields
    if (!garageId) {
      return NextResponse.json(
        { error: 'Garage ID is required' },
        { status: 400 }
      )
    }

    if (!updates || typeof updates !== 'object' || Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No updates provided' },
        { status: 400 }
      )
    }

    console.log('[PUT /api/garage/update] Starting garage update')
    console.log('[PUT /api/garage/update] Garage ID:', garageId)
    console.log('[PUT /api/garage/update] Updates:', updates)

    // Use admin client to bypass RLS
    console.log('[PUT /api/garage/update] Creating admin client...')
    const adminSupabase = await createAdminClient()
    console.log('[PUT /api/garage/update] Admin client created successfully')

    // Update garage and sync to garage_auth
    console.log('[PUT /api/garage/update] Calling updateGarage with admin client...')
    const success = await updateGarage(garageId, updates, adminSupabase)

    if (!success) {
      console.error('[PUT /api/garage/update] Failed to update garage')
      return NextResponse.json(
        { error: 'Failed to update garage' },
        { status: 500 }
      )
    }

    console.log('[PUT /api/garage/update] Garage updated successfully')

    return NextResponse.json({
      success: true,
      message: 'Garage updated successfully',
    })
  } catch (error) {
    console.error('[PUT /api/garage/update] Unexpected error updating garage:', error)
    return NextResponse.json(
      {
        error: 'An error occurred while updating garage',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
