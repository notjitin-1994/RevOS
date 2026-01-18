-- ============================================================================
-- ADD INDEXES, RLS POLICIES, TRIGGERS, AND FUNCTIONS
-- ============================================================================
-- Run this after create_minimal_customers.sql and create_customer_vehicles.sql
-- ============================================================================

-- ============================================================================
-- INDEXES
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
-- ROW LEVEL SECURITY POLICIES
-- ============================================================================

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

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

SELECT 'RLS policies for customers created!' as result;

-- Enable RLS on customer_vehicles table
ALTER TABLE public.customer_vehicles ENABLE ROW LEVEL SECURITY;

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

SELECT 'RLS policies for customer_vehicles created!' as result;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATED_AT
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
-- HELPER FUNCTIONS
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
-- ADD MISSING COLUMNS TO CUSTOMERS TABLE
-- ============================================================================

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

-- ============================================================================
-- ADD MISSING COLUMNS TO CUSTOMER_VEHICLES TABLE
-- ============================================================================

ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS color VARCHAR(100);
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS vin VARCHAR(100);
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS engine_number VARCHAR(100);
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS current_mileage INTEGER CHECK (current_mileage >= 0);
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS last_service_date TIMESTAMPTZ;
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'in-repair'));
ALTER TABLE public.customer_vehicles
ADD COLUMN IF NOT EXISTS notes TEXT;

-- ============================================================================
-- FINAL VERIFICATION
-- ============================================================================

SELECT 'Schema setup complete!' as result;
SELECT COUNT(*) as total_indexes FROM pg_indexes WHERE tablename IN ('customers', 'customer_vehicles');
SELECT COUNT(*) as total_policies FROM pg_policies WHERE tablename IN ('customers', 'customer_vehicles');
SELECT COUNT(*) as total_functions FROM pg_proc WHERE proname IN ('get_customer_vehicle_count', 'license_plate_exists');
