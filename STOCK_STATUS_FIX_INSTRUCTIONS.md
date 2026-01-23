# Stock Status Fix - Implementation Guide

## Summary

This fix addresses the issue where all parts showed as "out of stock" in the UI due to:
1. **Field name mismatch**: API returned `stockStatus`, UI expected `status`
2. **Incorrect trigger logic**: Database trigger only checked `on_hand_stock`, ignoring `warehouse_stock`

## ✅ Changes Completed

### 1. TypeScript Interface Fix
**File**: `/lib/supabase/inventory-queries.ts`

- Changed `stockStatus` to `status` in the `Part` type definition (line 19)
- Updated all transformation mappings in:
  - `getParts()` function (line 111)
  - `getPartById()` function (line 162)
  - `getLowStockParts()` function (line 221)

### 2. Database Schema Fix
**Files**:
- `/prisma/seeds/10_create_parts_table.sql` - Updated trigger function
- `/prisma/migrations/fix_stock_status_calculation.sql` - Migration script

The trigger now correctly calculates stock status based on **TOTAL STOCK**:
```sql
total_stock := COALESCE(NEW.on_hand_stock, 0) + COALESCE(NEW.warehouse_stock, 0);

IF total_stock = 0 THEN
  NEW.stock_status := 'out-of-stock';
ELSIF total_stock <= COALESCE(NEW.low_stock_threshold, 0) THEN
  NEW.stock_status := 'low-stock';
ELSE
  NEW.stock_status := 'in-stock';
END IF;
```

## 🚀 Next Steps - Manual Database Update Required

Since the migration couldn't be applied automatically, you need to run the SQL manually in Supabase:

### Option 1: Using Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `prisma/migrations/fix_stock_status_calculation.sql`
5. Click **Run** to execute the migration

### Option 2: Using Supabase CLI

If you have the Supabase CLI installed with proper access:

```bash
# Set your database URL
export DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Apply the migration
psql $DATABASE_URL -f prisma/migrations/fix_stock_status_calculation.sql
```

### Option 3: Quick Fix for Existing Data (Minimum Viable)

If you only want to fix existing data quickly without updating the trigger:

1. Go to **SQL Editor** in Supabase Dashboard
2. Run this query to update all existing parts:

```sql
UPDATE public.parts
SET
  stock_status = CASE
    WHEN (COALESCE(on_hand_stock, 0) + COALESCE(warehouse_stock, 0)) = 0 THEN 'out-of-stock'
    WHEN (COALESCE(on_hand_stock, 0) + COALESCE(warehouse_stock, 0)) <= COALESCE(low_stock_threshold, 0) THEN 'low-stock'
    ELSE 'in-stock'
  END,
  updated_at = NOW();
```

3. Then update the trigger function:

```sql
CREATE OR REPLACE FUNCTION public.compute_part_metrics()
RETURNS TRIGGER AS $$
DECLARE
  total_stock INTEGER;
BEGIN
  total_stock := COALESCE(NEW.on_hand_stock, 0) + COALESCE(NEW.warehouse_stock, 0);

  IF total_stock = 0 THEN
    NEW.stock_status := 'out-of-stock';
  ELSIF total_stock <= COALESCE(NEW.low_stock_threshold, 0) THEN
    NEW.stock_status := 'low-stock';
  ELSE
    NEW.stock_status := 'in-stock';
  END IF;

  IF NEW.purchase_price > 0 THEN
    NEW.profit_margin_pct := ((NEW.selling_price - NEW.purchase_price) / NEW.purchase_price) * 100;
  ELSE
    NEW.profit_margin_pct := NULL;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

## ✅ Verification

After applying the fix, verify it works by:

1. **Check the UI**:
   - Navigate to `/inventory`
   - Parts should now show correct stock status badges
   - "In Stock", "Low Stock", or "Out of Stock" based on total stock

2. **Check the Database**:
   ```sql
   SELECT
     part_name,
     on_hand_stock,
     warehouse_stock,
     on_hand_stock + warehouse_stock as total_stock,
     low_stock_threshold,
     stock_status
   FROM public.parts
   ORDER BY stock_status, part_name
   LIMIT 20;
   ```

3. **Test the Trigger**:
   - Update a part's stock via the UI
   - The `stock_status` should automatically recalculate based on total stock

## 📝 What the Fix Does

### Before (Wrong):
```javascript
// Only checked on_hand_stock
if (on_hand_stock === 0) {
  status = 'out-of-stock'  // Even if warehouse_stock > 0!
}
```

### After (Correct):
```javascript
// Checks total stock (on_hand_stock + warehouse_stock)
const totalStock = on_hand_stock + warehouse_stock;
if (totalStock === 0) {
  status = 'out-of-stock';
} else if (totalStock <= lowStockThreshold) {
  status = 'low-stock';
} else {
  status = 'in-stock';
}
```

## 🔍 Example

**Before Fix**:
- Part: "Brake Pad"
- On Hand: 0
- Warehouse: 50
- Status: ❌ "out-of-stock" (WRONG!)

**After Fix**:
- Part: "Brake Pad"
- On Hand: 0
- Warehouse: 50
- Total Stock: 50
- Status: ✅ "in-stock" (CORRECT!)

## 🎯 Files Changed

1. `/lib/supabase/inventory-queries.ts` - Fixed field name from `stockStatus` to `status`
2. `/prisma/seeds/10_create_parts_table.sql` - Fixed trigger to use total stock
3. `/prisma/migrations/fix_stock_status_calculation.sql` - Migration script created
4. `/scripts/fix-stock-status.ts` - Helper script (requires env vars to run)

## ⚠️ Important Notes

- The UI will start working immediately after the TypeScript changes
- Existing data will show correct status after you run the SQL update
- New/updated parts will automatically have correct status after the trigger is updated
- No code deployment is needed - this is a database-only fix

## 📞 Support

If you encounter issues:
1. Check the Supabase logs for any SQL errors
2. Verify the trigger function exists: `SELECT * FROM pg_proc WHERE proname = 'compute_part_metrics'`
3. Check stock_status values: `SELECT stock_status, COUNT(*) FROM parts GROUP BY stock_status;`
