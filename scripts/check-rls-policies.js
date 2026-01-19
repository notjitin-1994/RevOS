/**
 * Check RLS policies on job_cards table
 */

import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

dotenv.config({ path: join(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SECRET_KEY
)

async function checkRLS() {
  console.log('🔍 Checking RLS policies on job_cards table\n')

  // Check if RLS is enabled
  const { data: rlsStatus, error: rlsError } = await supabase
    .rpc('check_rls_enabled', { table_name: 'job_cards' })
    .catch(() => null)

  // Get RLS policies
  const { data: policies, error: policiesError } = await supabase
    .from('pg_policies')
    .select('*')
    .eq('tablename', 'job_cards')

  if (policiesError) {
    console.log('⚠️  Could not fetch RLS policies (might need admin access)')
    console.log('Error:', policiesError.message)
  } else if (policies && policies.length > 0) {
    console.log(`Found ${policies.length} RLS policies on job_cards:`)
    policies.forEach(p => {
      console.log(`\n  Policy: ${p.policyname}`)
      console.log(`  Command: ${p.cmd}`)
      console.log(`  Using: ${p.qualify}`)
    })
  } else {
    console.log('⚠️  No RLS policies found on job_cards table')
  }

  // Check if there's a policy for garage_id filtering
  console.log('\n🔍 Checking for garage_id-based policies...')

  // Try to understand what policies exist by checking the schema
  const { data: schemaInfo, error: schemaError } = await supabase
    .rpc('get_table_policies', { table_name: 'job_cards' })
    .catch(() => null)

  console.log('\n💡 RLS Issue Diagnosis:')
  console.log('━'.repeat(80))
  console.log('The browser Supabase client is likely being blocked by RLS policies.')
  console.log('\nTo fix this, you need to either:')
  console.log('  1. Create an RLS policy that allows authenticated users to access job_cards')
  console.log('  2. Disable RLS on job_cards table (not recommended for production)')
  console.log('  3. Create a service role API route that bypasses RLS')
  console.log('\n✅ Recommended: Create RLS policy like:')
  console.log(`
    CREATE POLICY "Users can view job cards for their garage"
    ON job_cards FOR SELECT
    USING (
      garage_id IN (
        SELECT garage_uid FROM garage_auth WHERE user_uid = auth.uid()
      )
    );
  `)
}

checkRLS()
