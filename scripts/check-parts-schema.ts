import { createAdminClient } from '../lib/supabase/server'

async function checkPartsSchema() {
  const supabase = createAdminClient()

  // Query information_schema to get actual column names
  const { data: columns, error } = await supabase
    .rpc('exec_sql', {
      sql_query: `
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns
        WHERE table_name = 'parts'
          AND table_schema = 'public'
        ORDER BY ordinal_position
      `
    })

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log('Parts table columns:')
  console.table(columns)
}

checkPartsSchema()
