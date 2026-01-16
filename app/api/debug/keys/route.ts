import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const publishableKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  const secretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

  return NextResponse.json({
    url: url ? url?.substring(0, 50) + '...' : 'MISSING',
    publishableKey: publishableKey ? publishableKey.substring(0, 20) + '...' : 'MISSING',
    secretKey: secretKey ? secretKey.substring(0, 20) + '...' : 'MISSING',
    publishableKeyFormat: publishableKey?.startsWith('sb_') ? 'NEW_FORMAT' : publishableKey?.startsWith('eyJ') ? 'JWT_FORMAT' : 'UNKNOWN',
    secretKeyFormat: secretKey?.startsWith('sb_') ? 'NEW_FORMAT' : secretKey?.startsWith('eyJ') ? 'JWT_FORMAT' : 'UNKNOWN',
    publishableKeyLength: publishableKey?.length || 0,
    secretKeyLength: secretKey?.length || 0,
  })
}
