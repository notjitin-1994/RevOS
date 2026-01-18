# Vehicle Registry Integration Analysis

## Current State

### Database Tables

**customer_vehicles** table currently has:
- id, customer_id, garage_id
- make, model, year, license_plate
- created_at, updated_at

**Enhancements** (from 08_enhance_customer_vehicles.sql):
- color, vin, engine_number, current_mileage, last_service_date, status
- Service tracking columns
- Registration & compliance columns
- Insurance & warranty columns

### Frontend Interface

The **Vehicle Registry Page** (`/vehicles/page.tsx`) expects:
```typescript
interface VehicleData {
  id: string
  make: string
  model: string
  year: number
  engineNumber: string      // ✓ exists as engine_number
  chassisNumber: string     // ✗ needs to be added
  customerId: string        // ✓ exists as customer_id
  customerName: string      // ✓ needs JOIN with customers table
  customerPhone: string     // ✓ needs JOIN with customers table
  category?: string         // ✗ needs to be added
  createdAt: string         // ✓ exists as created_at
}
```

## Missing Columns

### 1. **category** (HIGH PRIORITY)
- Required for: Displaying vehicle category (Sport, Naked, Adventure, Cruiser, etc.)
- Source: Can be JOINed from `motorcycles` table OR stored as a column
- Recommendation: Store as denormalized column in customer_vehicles for better query performance

### 2. **chassis_number** (HIGH PRIORITY)
- Required for: Vehicle identification and registry
- Note: Currently have `vin` column which may be the same, but should clarify naming
- Recommendation: Add explicit `chassis_number` column separate from `vin`

### 3. **color** (MEDIUM PRIORITY)
- Required for: Vehicle display
- Status: May already exist from enhancement script
- Note: Check if it was already added

## SQL Queries to Add Missing Columns

### Option 1: Add columns with catalog lookup
```sql
-- ============================================================================
-- ADD MISSING COLUMNS TO customer_vehicles FOR VEHICLE REGISTRY
-- ============================================================================

-- 1. Add category column
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- 2. Add chassis_number column (VIN can remain separate for manufacturer VIN)
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(100);

-- 3. Add color column (if not exists)
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- Add indexes for frequently queried columns
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_category
ON public.customer_vehicles(category);

CREATE INDEX IF NOT EXISTS idx_customer_vehicles_chassis
ON public.customer_vehicles(chassis_number);

-- Add comments
COMMENT ON COLUMN public.customer_vehicles.category IS 'Vehicle category (Sport, Naked, Adventure, Cruiser, Scooter, etc.)';
COMMENT ON COLUMN public.customer_vehicles.chassis_number IS 'Vehicle chassis number/frame number';
COMMENT ON COLUMN public.customer_vehicles.color IS 'Vehicle color';
```

### Option 2: Populate category from motorcycles catalog (one-time migration)
```sql
-- ============================================================================
-- POPULATE CATEGORY FROM MOTORCYCLES CATALOG (ONE-TIME)
-- ============================================================================

-- Update customer_vehicles with category from motorcycles table
-- This matches on make, model, and year
UPDATE public.customer_vehicles cv
SET
  category = (
    SELECT m.category
    FROM public.motorcycles m
    WHERE m.make = cv.make
      AND m.model = cv.model
      AND cv.year BETWEEN m.year_start AND COALESCE(m.year_end, 9999)
    LIMIT 1
  ),
  color = COALESCE(cv.color, 'Unknown'),
  -- If VIN is null, use chassis_number, and vice versa
  chassis_number = COALESCE(
    chassis_number,
    vin,
    'Not Provided'
  ),
  -- Ensure engine_number has a value
  engine_number = COALESCE(
    engine_number,
    'Not Provided'
  )
WHERE cv.status = 'active'; -- Only update active vehicles

-- Verify the update
SELECT
  make,
  model,
  year,
  category,
  color,
  engine_number,
  chassis_number,
  COUNT(*) as count
FROM public.customer_vehicles
GROUP BY make, model, year, category, color, engine_number, chassis_number
ORDER BY make, model, year;
```

## Complete Schema for Vehicle Registry

Here's the full list of columns needed for complete integration:

### Core Vehicle Info (✓ Complete)
- [x] id
- [x] customer_id
- [x] garage_id
- [x] make
- [x] model
- [x] year
- [x] license_plate
- [x] created_at
- [x] updated_at

### Vehicle Identification (⚠️ Partial)
- [x] engine_number
- [?] vin (exists, but needs clarification vs chassis_number)
- [ ] **chassis_number** (needs to be added)

### Vehicle Details (⚠️ Partial)
- [ ] **category** (needs to be added)
- [?] color (may exist, needs verification)

### Customer Info (✓ Available via JOIN)
- [x] customer_id → can JOIN with customers table for:
  - customerName (customers.first_name || ' ' || customers.last_name)
  - customerPhone (customers.phone_number)

### Service History (✓ Complete from enhancements)
- [x] current_mileage
- [x] last_service_date
- [x] status
- [x] last_service_mileage
- [x] next_service_due_date
- [x] next_service_due_mileage
- [x] total_services_completed
- [x] total_service_cost

### Registration & Compliance (✓ Complete from enhancements)
- [x] registration_number
- [x] registration_expiry
- [x] ownership_type
- [x] insurance_provider
- [x] insurance_policy_number
- [x] insurance_expiry
- [x] puc_number
- [x] puc_expiry
- [x] warranty_expiry
- [x] warranty_provider

## Recommended Approach

### Phase 1: Essential Columns (Immediate)
Add these columns for basic vehicle registry functionality:
```sql
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS category VARCHAR(50),
ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(100),
ADD COLUMN IF NOT EXISTS color VARCHAR(50);
```

### Phase 2: Data Migration (After Phase 1)
Populate the new columns with existing data:
```sql
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
WHERE category IS NULL;

-- Set default chassis_number if VIN exists
UPDATE public.customer_vehicles
SET chassis_number = COALESCE(vin, 'Not Provided')
WHERE chassis_number IS NULL;
```

### Phase 3: API Updates (Next)
Update the vehicle queries to:
1. JOIN with customers table to get customer name and phone
2. Return all the new columns
3. Format the data for the frontend

## Query to Check Current Schema

Run this to see what columns currently exist:
```sql
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'customer_vehicles'
  AND table_schema = 'public'
ORDER BY ordinal_position;
```

## Query to Verify Data After Migration

```sql
-- Check if vehicles have all required data
SELECT
  v.id,
  v.make,
  v.model,
  v.year,
  v.category,
  v.color,
  v.engine_number,
  v.chassis_number,
  c.first_name || ' ' || c.last_name as customer_name,
  c.phone_number as customer_phone
FROM public.customer_vehicles v
INNER JOIN public.customers c ON v.customer_id = c.id
ORDER BY v.created_at DESC
LIMIT 10;
```
