-- ============================================================================
-- ADD MISSING COLUMNS FOR COMPLETE VEHICLE REGISTRY INTEGRATION
-- ============================================================================
-- This script adds the missing columns needed by the Vehicle Registry page
-- Run this after creating the customer_vehicles table and enhancements
-- ============================================================================

-- ============================================================================
-- STEP 1: ADD MISSING COLUMNS
-- ============================================================================

-- 1. Add category column for vehicle categorization (Sport, Naked, Adventure, etc.)
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS category VARCHAR(50);

-- 2. Add chassis_number column for vehicle identification
-- Note: VIN is separate (manufacturer VIN), chassis_number is frame number
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS chassis_number VARCHAR(100);

-- 3. Add color column if it doesn't exist
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS color VARCHAR(50);

-- ============================================================================
-- STEP 2: CREATE INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_customer_vehicles_category
ON public.customer_vehicles(category);

CREATE INDEX IF NOT EXISTS idx_customer_vehicles_chassis
ON public.customer_vehicles(chassis_number);

CREATE INDEX IF NOT EXISTS idx_customer_vehicles_color
ON public.customer_vehicles(color);

-- ============================================================================
-- STEP 3: POPULATE CATEGORY FROM MOTORCYCLES CATALOG
-- ============================================================================

-- Update customer_vehicles with category from motorcycles table
-- This matches on make, model, and year range
UPDATE public.customer_vehicles cv
SET
  category = (
    SELECT m.category
    FROM public.motorcycles m
    WHERE m.make = cv.make
      AND m.model = cv.model
      AND cv.year BETWEEN m.year_start AND COALESCE(m.year_end, 9999)
    LIMIT 1
  )
WHERE cv.category IS NULL;

-- Set default category to 'Other' if not found in catalog
UPDATE public.customer_vehicles
SET category = 'Other'
WHERE category IS NULL;

-- ============================================================================
-- STEP 4: MIGRATE EXISTING DATA
-- ============================================================================

-- Populate chassis_number from vin if available
UPDATE public.customer_vehicles
SET chassis_number = COALESCE(vin, 'Not Provided')
WHERE chassis_number IS NULL;

-- Set default color if not provided
UPDATE public.customer_vehicles
SET color = 'Not Specified'
WHERE color IS NULL;

-- Ensure engine_number has a value
UPDATE public.customer_vehicles
SET engine_number = COALESCE(engine_number, 'Not Provided')
WHERE engine_number IS NULL;

-- ============================================================================
-- STEP 5: ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.customer_vehicles.category IS 'Vehicle category (Sport, Naked, Adventure, Cruiser, Scooter, Electric, etc.)';
COMMENT ON COLUMN public.customer_vehicles.chassis_number IS 'Vehicle chassis/frame number';
COMMENT ON COLUMN public.customer_vehicles.color IS 'Vehicle color';

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check which columns exist
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'customer_vehicles'
  AND table_schema = 'public'
  AND column_name IN ('category', 'chassis_number', 'color')
ORDER BY ordinal_position;

-- Check sample data with customer information
SELECT
  v.id,
  v.make,
  v.model,
  v.year,
  v.license_plate,
  v.category,
  v.color,
  v.engine_number,
  v.chassis_number,
  c.first_name || ' ' || c.last_name as customer_name,
  c.phone_number as customer_phone,
  v.status
FROM public.customer_vehicles v
INNER JOIN public.customers c ON v.customer_id = c.id
ORDER BY v.created_at DESC
LIMIT 5;

-- Count vehicles by category
SELECT
  category,
  COUNT(*) as vehicle_count
FROM public.customer_vehicles
GROUP BY category
ORDER BY vehicle_count DESC;

-- ============================================================================
-- SUMMARY
-- ============================================================================

SELECT 'Vehicle registry columns added successfully!' as status;
SELECT 'Total vehicles: ' || COUNT(*) as info FROM public.customer_vehicles;
SELECT 'Vehicles with category: ' || COUNT(*) as info FROM public.customer_vehicles WHERE category IS NOT NULL;
SELECT 'Vehicles with chassis_number: ' || COUNT(*) as info FROM public.customer_vehicles WHERE chassis_number IS NOT NULL;
SELECT 'Vehicles with color: ' || COUNT(*) as info FROM public.customer_vehicles WHERE color IS NOT NULL;
