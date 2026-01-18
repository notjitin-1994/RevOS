-- ============================================================================
-- CLEAN SLATE: RECREATE CUSTOMER TABLES WITH CORRECT SCHEMA
-- ============================================================================
-- This version creates tables WITHOUT foreign keys first, then adds them separately
-- This helps isolate where the type mismatch issue is occurring
-- ============================================================================

-- Drop existing tables and all dependencies
DROP TABLE IF EXISTS public.customer_vehicles CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;

-- ============================================================================
-- CREATE CUSTOMERS TABLE (without foreign key initially)
-- ============================================================================

CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,

  -- Personal Information
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  phone_number VARCHAR(20) NOT NULL,
  alternate_phone VARCHAR(20),

  -- Address Information
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',

  -- Additional Information
  notes TEXT,

  -- Status and Metadata
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  customer_since TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add foreign key separately
ALTER TABLE public.customers
ADD CONSTRAINT customers_garage_id_fkey
FOREIGN KEY (garage_id) REFERENCES public.garages(garage_uid) ON DELETE CASCADE;

-- Add unique constraint on garage_id + phone combination
ALTER TABLE public.customers
ADD CONSTRAINT customers_garage_phone_unique
UNIQUE (garage_id, phone_number);

-- Add indexes for common queries
CREATE INDEX idx_customers_garage_id ON public.customers(garage_id);
CREATE INDEX idx_customers_phone ON public.customers(phone_number);
CREATE INDEX idx_customers_email ON public.customers(email);
CREATE INDEX idx_customers_name ON public.customers(first_name, last_name);
CREATE INDEX idx_customers_status ON public.customers(status);
CREATE INDEX idx_customers_garage_status ON public.customers(garage_id, status);

-- ============================================================================
-- CREATE CUSTOMER VEHICLES TABLE (without foreign keys initially)
-- ============================================================================

CREATE TABLE public.customer_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  garage_id UUID NOT NULL,

  -- Vehicle Identification (from motorcycles table)
  make VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),

  -- Vehicle Details
  license_plate VARCHAR(50) NOT NULL,
  color VARCHAR(100),
  vin VARCHAR(100),
  engine_number VARCHAR(100),

  -- Service Information
  current_mileage INTEGER CHECK (current_mileage >= 0),
  last_service_date TIMESTAMPTZ,

  -- Status and Notes
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'in-repair')),
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add foreign keys separately
ALTER TABLE public.customer_vehicles
ADD CONSTRAINT customer_vehicles_customer_id_fkey
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

ALTER TABLE public.customer_vehicles
ADD CONSTRAINT customer_vehicles_garage_id_fkey
FOREIGN KEY (garage_id) REFERENCES public.garages(garage_uid) ON DELETE CASCADE;

-- Ensure unique license plate per garage
ALTER TABLE public.customer_vehicles
ADD CONSTRAINT customer_vehicles_garage_license_unique
UNIQUE (garage_id, license_plate);

-- Add indexes for common queries
CREATE INDEX idx_customer_vehicles_customer_id ON public.customer_vehicles(customer_id);
CREATE INDEX idx_customer_vehicles_garage_id ON public.customer_vehicles(garage_id);
CREATE INDEX idx_customer_vehicles_make_model ON public.customer_vehicles(make, model);
CREATE INDEX idx_customer_vehicles_license_plate ON public.customer_vehicles(license_plate);
CREATE INDEX idx_customer_vehicles_vin ON public.customer_vehicles(vin);
CREATE INDEX idx_customer_vehicles_status ON public.customer_vehicles(status);
CREATE INDEX idx_customer_vehicles_garage_status ON public.customer_vehicles(garage_id, status);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on customers table
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read customers from own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow insert customers for own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow update customers from own garage" ON public.customers;
DROP POLICY IF EXISTS "Allow service role full access on customers" ON public.customers;

-- Policy: Users can read customers from their garage only
CREATE POLICY "Allow read customers from own garage"
  ON public.customers
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

-- Policy: Users can insert customers for their garage only
CREATE POLICY "Allow insert customers for own garage"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

-- Policy: Users can update customers from their garage only
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

-- Policy: Service role can do anything
CREATE POLICY "Allow service role full access on customers"
  ON public.customers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Enable RLS on customer_vehicles table
ALTER TABLE public.customer_vehicles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow read vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow insert vehicles for own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow update vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow service role full access on vehicles" ON public.customer_vehicles;

-- Policy: Users can read vehicles from their garage only
CREATE POLICY "Allow read vehicles from own garage"
  ON public.customer_vehicles
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

-- Policy: Users can insert vehicles for their garage only
CREATE POLICY "Allow insert vehicles for own garage"
  ON public.customer_vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

-- Policy: Users can update vehicles from their garage only
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

-- Policy: Service role can do anything
CREATE POLICY "Allow service role full access on vehicles"
  ON public.customer_vehicles
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the tables were created successfully
SELECT 'Verification complete!' as status;
SELECT
    'customers' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'customers'
AND column_name = 'garage_id'
UNION ALL
SELECT
    'customer_vehicles' as table_name,
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'customer_vehicles'
AND column_name = 'garage_id';
