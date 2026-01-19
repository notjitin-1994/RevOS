import { createAdminClient } from '../lib/supabase/server'

async function addUniversalFitmentColumn() {
  const supabase = createAdminClient()

  console.log('Adding is_universal_fitment column to parts table...')

  // Add the column using raw SQL
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      ALTER TABLE public.parts
      ADD COLUMN IF NOT EXISTS is_universal_fitment BOOLEAN DEFAULT false;

      COMMENT ON COLUMN public.parts.is_universal_fitment IS 'Indicates if this part is universal and fits all motorcycles. When true, no specific fitment records needed.';

      CREATE INDEX IF NOT EXISTS idx_parts_is_universal_fitment
      ON public.parts(is_universal_fitment)
      WHERE is_universal_fitment = true;
    `
  })

  if (error) {
    console.error('Error adding column:', error)
    process.exit(1)
  }

  console.log('✅ Successfully added is_universal_fitment column to parts table')
  console.log('Data:', data)
}

addUniversalFitmentColumn()
