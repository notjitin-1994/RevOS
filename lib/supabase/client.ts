import { createBrowserClient } from '@supabase/ssr'

/**
 * Creates a Supabase client for use in browser components
 * This client automatically handles cookies and session management
 *
 * Uses the NEW publishable key (supersedes the old anon key)
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
  )
}
