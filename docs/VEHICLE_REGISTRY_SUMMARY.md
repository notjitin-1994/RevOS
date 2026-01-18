# Vehicle Registry Integration - Quick Summary

## What's Missing

The Vehicle Registry page (`/vehicles/page.tsx`) needs **3 additional columns** in the `customer_vehicles` table:

| Column | Type | Purpose | Status |
|--------|------|---------|--------|
| `category` | VARCHAR(50) | Vehicle category (Sport, Naked, Adventure, etc.) | ❌ Missing |
| `chassis_number` | VARCHAR(100) | Vehicle chassis/frame number | ❌ Missing |
| `color` | VARCHAR(50) | Vehicle color | ⚠️ May exist |

## SQL to Run

Execute this file to add missing columns and populate them:
```bash
psql -f prisma/seeds/09_add_vehicle_registry_columns.sql
```

Or run the SQL directly in your Supabase SQL editor:
```sql
-- Add the missing columns
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS category VARCHAR(50);

ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(100);

ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_category
ON public.customer_vehicles(category);

CREATE INDEX IF NOT EXISTS idx_customer_vehicles_chassis
ON public.customer_vehicles(chassis_number);

-- Populate category from motorcycles catalog
UPDATE public.customer_vehicles cv
SET category = (
  SELECT m.category
  FROM public.motorcycles m
  WHERE m.make = cv.make
    AND m.model = cv.model
    AND cv.year BETWEEN m.year_start AND COALESCE(m.year_end, 9999)
  LIMIT 1
)
WHERE cv.category IS NULL;

-- Set defaults for missing data
UPDATE public.customer_vehicles
SET category = 'Other'
WHERE category IS NULL;

UPDATE public.customer_vehicles
SET chassis_number = COALESCE(vin, 'Not Provided')
WHERE chassis_number IS NULL;

UPDATE public.customer_vehicles
SET color = 'Not Specified'
WHERE color IS NULL;

UPDATE public.customer_vehicles
SET engine_number = COALESCE(engine_number, 'Not Provided')
WHERE engine_number IS NULL;
```

## After Running SQL

Once the columns are added, you can wire up the Vehicle Registry page by:

1. **Creating an API endpoint** at `/api/vehicles/list` that:
   - Fetches from `customer_vehicles` table
   - JOINs with `customers` table to get customer name and phone
   - Returns all required fields

2. **Update the frontend** to:
   - Remove mock data from `/vehicles/page.tsx`
   - Fetch real data from the API
   - Handle loading and error states

## Complete Column List (After Migration)

✅ **Core Info**: id, customer_id, garage_id, make, model, year, license_plate
✅ **Identification**: engine_number, chassis_number, vin
✅ **Details**: category, color
✅ **Customer**: (via JOIN) customerName, customerPhone
✅ **Service**: current_mileage, last_service_date, status, etc.
✅ **Compliance**: registration_number, insurance_info, puc_info, warranty_info

## Files Created

1. **`docs/vehicle-registry-integration-analysis.md`** - Detailed analysis
2. **`prisma/seeds/09_add_vehicle_registry_columns.sql`** - SQL migration script
3. **`docs/VEHICLE_REGISTRY_SUMMARY.md`** - This file
