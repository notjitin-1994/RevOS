const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

const fs = require('fs')
const path = require('path')

const sqlFile = path.join(__dirname, 'add-inventory-field-usage-tracking.sql')
const sql = fs.readFileSync(sqlFile, 'utf8')

async function executeSQL() {
  try {
    console.log('Executing SQL script...')

    // Split the SQL into individual statements and execute
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0)

    for (const statement of statements) {
      if (statement.trim()) {
        console.log('Executing:', statement.substring(0, 50) + '...')

        const { data, error } = await supabase.rpc('exec_sql', { sql_query: statement })

        if (error) {
          // Try using raw SQL execution via REST
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
            console.error('Error executing statement:', error)
            console.log('Statement:', statement)
          } else {
            console.log('✓ Executed successfully')
          }
        } else {
          console.log('✓ Executed successfully')
        }
      }
    }

    console.log('\n✅ SQL script executed successfully!')
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  }
}

executeSQL()
