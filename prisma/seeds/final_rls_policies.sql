-- ============================================================================
-- FIX RLS POLICIES - Use correct column name garage_uid from garage_auth
-- ============================================================================

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read customers from own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow insert customers for own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow update customers from own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow service role full access on customers" ON public.customers;

DROP POLICY IF EXISTS "Allow read vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow insert vehicles for own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow update vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow service role full access on vehicles" ON public.customer_vehicles;

-- Customers table policies (using garage_uid from garage_auth)
CREATE POLICY "Allow read customers from own garage"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_uid FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow insert customers for own garage"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_uid FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow update customers from own garage"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (
    garage_id = (SELECT garage_uid FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    garage_id = (SELECT garage_uid FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on customers"
  ON public.customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

SELECT 'RLS policies for customers fixed!' as result;

-- Customer vehicles table policies (using garage_uid from garage_auth)
CREATE POLICY "Allow read vehicles from own garage"
  ON public.customer_vehicles
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_uid FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow insert vehicles for own garage"
  ON public.customer_vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_uid FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow update vehicles from own garage"
  ON public.customer_vehicles
  FOR UPDATE
  TO authenticated
  USING (
    garage_id = (SELECT garage_uid FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    garage_id = (SELECT garage_uid FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on vehicles"
  ON public.customer_vehicles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

SELECT 'RLS policies for customer_vehicles fixed!' as result;

-- ============================================================================
-- COMPLETE SCHEMA SETUP (if not already done)
-- ============================================================================

-- Add missing columns to customers table
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS email VARCHAR(255);
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS alternate_phone VARCHAR(20);
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS city VARCHAR(100);
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS state VARCHAR(100);
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS zip_code VARCHAR(20);
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS country VARCHAR(100) DEFAULT 'India';
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive'));
ALTER TABLE public.customers
ADD COLUMN IF NOT EXISTS customer_since TIMESTAMPTZ DEFAULT NOW() NOT NULL;

-- Add unique constraint if not exists
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'customers_garage_phone_unique'
    ) THEN
        ALTER TABLE public.customers
        ADD CONSTRAINT customers_garage_phone_unique
        UNIQUE (garage_id, phone_number);
    END IF;
END $$;

-- Add missing columns to customer_vehicles table
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS color VARCHAR(100);
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS vin VARCHAR(100);
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS engine_number VARCHAR(100);
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS current_mileage INTEGER;
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS last_service_date TIMESTAMPTZ;
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'in-repair'));
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS notes TEXT;

-- Add check constraint for current_mileage
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint
        WHERE conname = 'customer_vehicles_current_mileage_check'
    ) THEN
        ALTER TABLE public.customer_vehicles
        ADD CONSTRAINT customer_vehicles_current_mileage_check
        CHECK (current_mileage >= 0);
    END IF;
END $$;

-- ============================================================================
-- CREATE INDEXES
-- ============================================================================

-- Customers table indexes
CREATE INDEX IF NOT EXISTS idx_customers_garage_id ON public.customers(garage_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_garage_status ON public.customers(garage_id, status);

-- Customer vehicles table indexes
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_customer_id ON public.customer_vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_garage_id ON public.customer_vehicles(garage_id);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_make_model ON public.customer_vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_license_plate ON public.customer_vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_vin ON public.customer_vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_status ON public.customer_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_garage_status ON public.customer_vehicles(garage_id, status);

SELECT 'Indexes created!' as result;

-- ============================================================================
-- CREATE TRIGGERS
-- ============================================================================

-- Function to update customers updated_at
CREATE OR REPLACE FUNCTION public.update_customers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for customers
DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customers_updated_at();

-- Function to update customer_vehicles updated_at
CREATE OR REPLACE FUNCTION public.update_customer_vehicles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for customer_vehicles
DROP TRIGGER IF EXISTS set_customer_vehicles_updated_at ON public.customer_vehicles;
CREATE TRIGGER set_customer_vehicles_updated_at
  BEFORE UPDATE ON public.customer_vehicles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_customer_vehicles_updated_at();

SELECT 'Triggers created!' as result;

-- ============================================================================
-- CREATE HELPER FUNCTIONS
-- ============================================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.get_customer_vehicle_count CASCADE;
DROP FUNCTION IF EXISTS public.license_plate_exists CASCADE;

-- Function to get vehicle count for a customer
CREATE FUNCTION public.get_customer_vehicle_count(customer_uuid UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*) FROM public.customer_vehicles WHERE customer_id = customer_uuid AND status != 'inactive';
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if license plate exists in garage
CREATE FUNCTION public.license_plate_exists(garage_param UUID, plate_param TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.customer_vehicles
    WHERE garage_id = garage_param AND license_plate = plate_param
  );
$$ LANGUAGE sql SECURITY DEFINER;

SELECT 'Helper functions created!' as result;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

SELECT 'Schema setup complete!' as result;
SELECT COUNT(*) as total_indexes FROM pg_indexes WHERE tablename IN ('customers', 'customer_vehicles');
SELECT COUNT(*) as total_policies FROM pg_policies WHERE tablename IN ('customers', 'customer_vehicles');
SELECT COUNT(*) as total_functions FROM pg_proc WHERE proname IN ('get_customer_vehicle_count', 'license_plate_exists');
