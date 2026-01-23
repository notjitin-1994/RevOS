import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✓' : '✗')
  console.error('SUPABASE_SECRET_KEY:', supabaseKey ? '✓' : '✗')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function executeMigration() {
  try {
    console.log('🔄 Starting migration: 20260123_fix_checklist_items_schema_and_add_triggers.sql')
    console.log('')

    // Read the migration file
    const migrationPath = join(process.cwd(), 'prisma', 'migrations', '20260123_fix_checklist_items_schema_and_add_triggers.sql')
    const sql = readFileSync(migrationPath, 'utf8')

    console.log('📄 Migration file loaded')
    console.log('')

    // Use the PostgreSQL RPC function to execute SQL
    // Supabase doesn't have a direct SQL execution endpoint, so we use pgadmin or the dashboard
    console.log('⚠️  This migration needs to be run manually through the Supabase dashboard or psql')
    console.log('')
    console.log('📋 Instructions to run manually:')
    console.log('')
    console.log('   Option 1: Supabase Dashboard')
    console.log('   1. Go to https://app.supabase.com/project/YOUR_PROJECT_ID/sql')
    console.log('   2. Copy the contents of: prisma/migrations/20260123_fix_checklist_items_schema_and_add_triggers.sql')
    console.log('   3. Paste and execute')
    console.log('')
    console.log('   Option 2: psql command line')
    const psqlUrl = supabaseUrl
      ? supabaseUrl.replace('https://', 'postgresql://').replace('/rest/v1', '/postgres')
      : 'postgresql://user:password@host:5432/postgres'
    console.log(`   psql "${psqlUrl}" -f "${migrationPath}"`)
    console.log('')
    console.log('   Option 3: Supabase CLI')
    console.log('   supabase db push')
    console.log('')

    // For now, let's just display the SQL that needs to be run
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📜 Migration SQL (first 100 lines):')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    const lines = sql.split('\n').slice(0, 100).join('\n')
    console.log(lines)
    if (sql.split('\n').length > 100) {
      console.log('')
      console.log(`... (${sql.split('\n').length - 100} more lines)`)
    }
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

  } catch (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }
}

executeMigration()
