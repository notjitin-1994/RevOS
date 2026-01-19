import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

/**
 * PATCH /api/job-cards/[id]/status
 *
 * Updates job card status using server-side Supabase client.
 * This bypasses RLS policies that block the browser client.
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jobCardId = params.id
    const body = await request.json()

    if (!body.status) {
      return NextResponse.json(
        { error: 'Status is required' },
        { status: 400 }
      )
    }

    // Create server-side Supabase client (bypasses RLS)
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SECRET_KEY!
    )

    console.log(`📝 [API] Updating job card ${jobCardId} to status: ${body.status}`)

    const { data, error } = await supabase
      .from('job_cards')
      .update({
        status: body.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', jobCardId)
      .select()
      .single()

    if (error) {
      console.error('❌ [API] Error updating job card:', error)
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      )
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Job card not found' },
        { status: 404 }
      )
    }

    console.log(`✅ [API] Updated job card ${jobCardId}`)

    return NextResponse.json({
      success: true,
      jobCard: data,
    })
  } catch (error) {
    console.error('❌ [API] Unexpected error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
