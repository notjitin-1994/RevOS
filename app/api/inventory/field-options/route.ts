import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

interface FieldOption {
  value: string
  label: string
  usageCount: number
  lastUsed?: string
}

// Define all available options for each field
const ALL_OPTIONS = {
  category: [
    'Engine',
    'Brakes',
    'Body',
    'Electrical',
    'Suspension',
    'Transmission',
    'Exhaust',
    'Tires & Wheels',
    'Filters',
    'Fluids',
    'Accessories',
    'Other',
  ],
  usedFor: [
    'Engine',
    'Brakes',
    'Body',
    'Electrical',
    'Suspension',
    'Transmission',
    'Exhaust',
    'General',
  ],
}

/**
 * GET /api/inventory/field-options?field=category&garageId=xxx
 *
 * Returns dropdown options sorted by usage frequency for the specific garage.
 * Options with higher usage appear first.
 * Unused options appear at the end in their original order.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const field = searchParams.get('field')
    const garageId = searchParams.get('garageId')

    if (!field) {
      return NextResponse.json(
        { success: false, error: 'Field name is required' },
        { status: 400 }
      )
    }

    if (!garageId) {
      return NextResponse.json(
        { success: false, error: 'Garage ID is required' },
        { status: 400 }
      )
    }

    // Validate field name
    const availableOptions = ALL_OPTIONS[field as keyof typeof ALL_OPTIONS]
    if (!availableOptions) {
      return NextResponse.json(
        { success: false, error: `Unknown field: ${field}` },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Fetch usage statistics for this garage and field
    const { data: usageData, error } = await supabase
      .from('inventory_field_usage')
      .select('field_value, usage_count, last_used_at')
      .eq('garage_id', garageId)
      .eq('field_name', field)
      .order('usage_count', { ascending: false })
      .order('last_used_at', { ascending: false })

    if (error) {
      console.error('Error fetching field usage:', error)
      // Return default options if query fails
      const defaultOptions = availableOptions.map((value) => ({
        value,
        label: value,
        usageCount: 0,
      }))
      return NextResponse.json({
        success: true,
        options: defaultOptions,
      })
    }

    // Create a map of usage counts
    const usageMap = new Map<string, { count: number; lastUsed: string }>()
    usageData?.forEach((item) => {
      usageMap.set(item.field_value, {
        count: item.usage_count,
        lastUsed: item.last_used_at,
      })
    })

    // Sort options: used options first (by count), then unused options
    const sortedOptions: FieldOption[] = []

    // First, add options that have been used (sorted by usage count)
    const usedOptions = availableOptions.filter((opt) => usageMap.has(opt))
    usedOptions.sort((a, b) => {
      const aUsage = usageMap.get(a)!
      const bUsage = usageMap.get(b)!
      if (aUsage.count !== bUsage.count) {
        return bUsage.count - aUsage.count // Higher count first
      }
      // If counts are equal, sort by last used
      return new Date(bUsage.lastUsed).getTime() - new Date(aUsage.lastUsed).getTime()
    })
    sortedOptions.push(
      ...usedOptions.map((value) => ({
        value,
        label: value,
        usageCount: usageMap.get(value)!.count,
        lastUsed: usageMap.get(value)!.lastUsed,
      }))
    )

    // Then, add unused options in original order
    const unusedOptions = availableOptions.filter((opt) => !usageMap.has(opt))
    sortedOptions.push(
      ...unusedOptions.map((value) => ({
        value,
        label: value,
        usageCount: 0,
      }))
    )

    return NextResponse.json({
      success: true,
      options: sortedOptions,
      field,
      garageId,
    })
  } catch (error) {
    console.error('Error fetching field options:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to fetch field options',
      },
      { status: 500 }
    )
  }
}

/**
 * POST /api/inventory/field-options
 *
 * Records usage of a field value (to be called when a part is added/updated).
 * Body: { garageId, field, value }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { garageId, field, value } = body

    if (!garageId || !field || !value) {
      return NextResponse.json(
        { success: false, error: 'garageId, field, and value are required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Call the function to increment usage count
    const { error } = await supabase.rpc('increment_field_usage', {
      p_garage_id: garageId,
      p_field_name: field,
      p_field_value: value,
    })

    if (error) {
      console.error('Error incrementing field usage:', error)
      // Don't fail the request, just log it
      return NextResponse.json({
        success: true,
        message: 'Usage tracking attempted but may not have been recorded',
        warning: error.message,
      })
    }

    return NextResponse.json({
      success: true,
      message: 'Usage recorded successfully',
    })
  } catch (error) {
    console.error('Error recording field usage:', error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to record usage',
      },
      { status: 500 }
    )
  }
}
