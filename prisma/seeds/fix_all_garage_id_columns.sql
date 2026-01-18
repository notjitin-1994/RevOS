-- ============================================================================
-- FIX GARAGE_ID COLUMNS TO UUID TYPE
-- ============================================================================
-- This script fixes the garage_id columns in both customers and customer_vehicles
-- tables to ensure they are UUID type instead of VARCHAR

-- Check current customers table schema
SELECT 'Checking customers table garage_id type...' as step;
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'customers'
AND table_schema = 'public'
AND column_name = 'garage_id';

-- Check current customer_vehicles table schema
SELECT 'Checking customer_vehicles table garage_id type...' as step;
SELECT
    column_name,
    data_type,
    character_maximum_length
FROM information_schema.columns
WHERE table_name = 'customer_vehicles'
AND table_schema = 'public'
AND column_name = 'garage_id';

-- ============================================================================
-- FIX CUSTOMERS TABLE
-- ============================================================================

SELECT 'Fixing customers table...' as step;

-- Drop RLS policies on customers table
DROP POLICY IF EXISTS "Allow read customers from own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow insert customers for own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow update customers from own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow service role full access on customers" ON public.customers;

-- Drop indexes that depend on garage_id
DROP INDEX IF EXISTS public.idx_customers_garage_id CASCADE;
DROP INDEX IF EXISTS public.idx_customers_garage_status CASCADE;

-- Drop foreign key constraint
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_garage_id_fkey;
ALTER TABLE public.customers DROP CONSTRAINT IF EXISTS customers_garage_phone_unique;

-- Alter the column type to UUID
ALTER TABLE public.customers
ALTER COLUMN garage_id TYPE UUID USING garage_id::UUID;

-- Recreate foreign key constraint
ALTER TABLE public.customers
ADD CONSTRAINT customers_garage_id_fkey
FOREIGN KEY (garage_id) REFERENCES public.garages(garage_uid) ON DELETE CASCADE;

-- Recreate unique constraint
ALTER TABLE public.customers
ADD CONSTRAINT customers_garage_phone_unique
UNIQUE (garage_id, phone_number);

-- Recreate indexes
CREATE INDEX idx_customers_garage_id ON public.customers(garage_id);
CREATE INDEX idx_customers_garage_status ON public.customers(garage_id, status);

-- ============================================================================
-- FIX CUSTOMER_VEHICLES TABLE
-- ============================================================================

SELECT 'Fixing customer_vehicles table...' as step;

-- Drop RLS policies on customer_vehicles table
DROP POLICY IF EXISTS "Allow read vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow insert vehicles for own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow update vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow service role full access on vehicles" ON public.customer_vehicles;

-- Drop indexes that depend on garage_id
DROP INDEX IF EXISTS public.idx_customer_vehicles_garage_id CASCADE;

-- Drop foreign key constraint
ALTER TABLE public.customer_vehicles DROP CONSTRAINT IF EXISTS customer_vehicles_garage_id_fkey;
ALTER TABLE public.customer_vehicles DROP CONSTRAINT IF EXISTS customer_vehicles_garage_license_unique;

-- Alter the column type to UUID
ALTER TABLE public.customer_vehicles
ALTER COLUMN garage_id TYPE UUID USING garage_id::UUID;

-- Recreate foreign key constraint
ALTER TABLE public.customer_vehicles
ADD CONSTRAINT customer_vehicles_garage_id_fkey
FOREIGN KEY (garage_id) REFERENCES public.garages(garage_uid) ON DELETE CASCADE;

-- Recreate unique constraint
ALTER TABLE public.customer_vehicles
ADD CONSTRAINT customer_vehicles_garage_license_unique
UNIQUE (garage_id, license_plate);

-- Recreate index
CREATE INDEX idx_customer_vehicles_garage_id ON public.customer_vehicles(garage_id);

-- ============================================================================
-- RECREATE RLS POLICIES
-- ============================================================================

SELECT 'Recreating RLS policies...' as step;

-- Customers table policies
CREATE POLICY "Allow read customers from own garage"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow insert customers for own garage"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow update customers from own garage"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on customers"
  ON public.customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Customer vehicles table policies
CREATE POLICY "Allow read vehicles from own garage"
  ON public.customer_vehicles
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow insert vehicles for own garage"
  ON public.customer_vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow update vehicles from own garage"
  ON public.customer_vehicles
  FOR UPDATE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on vehicles"
  ON public.customer_vehicles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- VERIFY FIX
-- ============================================================================

SELECT 'Verification complete!' as step;
SELECT
    'customers' as table_name,
    data_type as garage_id_type
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name = 'garage_id'
UNION ALL
SELECT
    'customer_vehicles' as table_name,
    data_type as garage_id_type
FROM information_schema.columns
WHERE table_name = 'customer_vehicles'
AND column_name = 'garage_id';
