# 🔧 Quick Fix for parts_transactions Error

## The Problem
```
Failed to create parts_transactions: Could not find the 'total_price' column
```

## The Solution (2 Minutes)

1. **Open Supabase SQL Editor**
   - Go to: https://supabase.com/dashboard
   - Click your project
   - Click "SQL Editor" (left sidebar)
   - Click "New Query"

2. **Run the Fixed SQL Script**
   - Open this file: `database/fix_parts_transactions_table_v2.sql`
   - Copy ALL the SQL code
   - Paste into SQL Editor
   - Click "Run" (or press Ctrl+Enter)

3. **Verify It Worked**
   - You should see: "✅ Migration completed successfully!"
   - Results will show all columns including `total_price`, `unit_price`, etc.

4. **Restart Your Dev Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

5. **Test It**
   - Go to a job card
   - Click "Parts" tab
   - Try allocating parts
   - Should work now! ✅

## What Was Fixed
- ✅ Added `total_price` column
- ✅ Added `unit_price` column  
- ✅ Added `garage_id` column
- ✅ Added `total_value`, `stock_before`, `stock_after` columns
- ✅ Added `location_from`, `location_to` columns
- ✅ Added `reference_type`, `reference_id`, `reference_number` columns
- ✅ Added `supplier_id`, `supplier_name` columns
- ✅ Added `transaction_date` column
- ✅ Fixed RLS policies (removed user_garages dependency)

## Still Having Issues?
If the SQL script fails, check:
1. You're connected to the right Supabase project
2. You have admin permissions
3. The table `parts_transactions` exists

