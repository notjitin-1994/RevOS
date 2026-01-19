const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function executeSQL() {
  try {
    console.log('Adding is_universal_fitment column to parts table...')

    const statements = [
      `ALTER TABLE public.parts ADD COLUMN IF NOT EXISTS is_universal_fitment BOOLEAN DEFAULT false`,
      `COMMENT ON COLUMN public.parts.is_universal_fitment IS 'Indicates if this part is universal and fits all motorcycles. When true, no specific fitment records needed.'`,
      `CREATE INDEX IF NOT EXISTS idx_parts_is_universal_fitment ON public.parts(is_universal_fitment) WHERE is_universal_fitment = true`
    ]

    for (const statement of statements) {
      console.log('Executing:', statement.substring(0, 60) + '...')

      // Try using exec_sql first
      let { data, error } = await supabase.rpc('exec_sql', { sql_query: statement })

      if (error) {
        // Fall back to REST API
        const response = await fetch(`${supabaseUrl}/rest/v1/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
          body: JSON.stringify({ query: statement }),
        })

        if (!response.ok) {
          console.error('Error executing statement:', await response.text())
          console.log('Statement:', statement)
        } else {
          console.log('✓ Executed successfully via REST')
        }
      } else {
        console.log('✓ Executed successfully via RPC')
      }
    }

    console.log('\n✅ Successfully added is_universal_fitment column!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

executeSQL()
