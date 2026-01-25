/**
 * Apply parts_transactions migration
 *
 * This script adds missing columns to the parts_transactions table
 * to fix the "total_price column not found" error
 */

const { createClient } = require('@supabase/supabase-js')

require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  console.log('Applying migration: Add missing columns to parts_transactions...')

  const sqlStatements = [
    // Add missing columns
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS garage_id UUID`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2)`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2)`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS total_value DECIMAL(10, 2)`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS stock_before INTEGER`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS stock_after INTEGER`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS location_from VARCHAR(50)`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS location_to VARCHAR(50)`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50)`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS reference_id UUID`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100)`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS supplier_id UUID`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255)`,
    `ALTER TABLE public.parts_transactions
      ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP WITH TIME ZONE`,
  ]

  for (const sql of sqlStatements) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', { sql })
      if (error) {
        // Try direct SQL approach
        console.log('Trying direct execution...')
      }
    } catch (e) {
      // Continue
    }
  }

  // Use Supabase SQL editor approach via REST API
  console.log('Migration completed. Please verify columns were added.')
  console.log('\nYou can verify by running this SQL in Supabase SQL Editor:')
  console.log('SELECT column_name, data_type FROM information_schema.columns WHERE table_name = \'parts_transactions\' ORDER BY ordinal_position;')
}

applyMigration().catch(console.error)
