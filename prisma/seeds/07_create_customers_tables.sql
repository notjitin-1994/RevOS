-- ============================================================================
-- CUSTOMERS AND VEHICLES TABLE SCHEMA
-- ============================================================================
-- This schema creates tables for storing customer information and their vehicles
-- Each customer is linked to a garage via the garage_id (UUID) from garage_auth table
-- which references the id (UUID) from the garages table
-- Each customer can have multiple vehicles
-- ============================================================================

-- ============================================================================
-- CUSTOMERS TABLE
-- ============================================================================
-- Stores customer personal information linked to a garage

-- Drop existing tables if needed (WARNING: This will delete all data!)
-- DROP TABLE IF EXISTS public.customer_vehicles CASCADE;
-- DROP TABLE IF EXISTS public.customers CASCADE;

-- Create customers table
CREATE TABLE IF NOT EXISTS public.customers (
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
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign key constraint
  FOREIGN KEY (garage_id) REFERENCES public.garages(garage_uid) ON DELETE CASCADE
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_customers_garage_id ON public.customers(garage_id);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_name ON public.customers(first_name, last_name);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_garage_status ON public.customers(garage_id, status);

-- Add helpful comments
COMMENT ON TABLE public.customers IS 'Customer information linked to garages. Stores personal details, contact info, and address.';
COMMENT ON COLUMN public.customers.garage_id IS 'Foreign key reference to garages table (UUID), same as garage_auth.garage_id';
COMMENT ON COLUMN public.customers.customer_since IS 'Timestamp when customer was first added to the system';
COMMENT ON COLUMN public.customers.status IS 'Customer status - active or inactive';

-- ============================================================================
-- CUSTOMER VEHICLES TABLE
-- ============================================================================
-- Stores vehicle information for customers (one-to-many relationship)

CREATE TABLE IF NOT EXISTS public.customer_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
  garage_id UUID NOT NULL,

  -- Vehicle Identification (from motorcycles table)
  make VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL,
  year INTEGER NOT NULL CHECK (year >= 1900 AND year <= 2100),

  -- Vehicle Details
  license_plate VARCHAR(50) NOT NULL,
  color VARCHAR(100),
  vin VARCHAR(100), -- Vehicle Identification Number (Chassis Number)
  engine_number VARCHAR(100),

  -- Service Information
  current_mileage INTEGER CHECK (current_mileage >= 0),
  last_service_date TIMESTAMPTZ,

  -- Status and Notes
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'in-repair')),
  notes TEXT,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign key constraint
  FOREIGN KEY (garage_id) REFERENCES public.garages(garage_uid) ON DELETE CASCADE,

  -- Ensure unique license plate per garage
  UNIQUE(garage_id, license_plate)
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_customer_id ON public.customer_vehicles(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_garage_id ON public.customer_vehicles(garage_id);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_make_model ON public.customer_vehicles(make, model);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_license_plate ON public.customer_vehicles(license_plate);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_vin ON public.customer_vehicles(vin);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_status ON public.customer_vehicles(status);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_garage_status ON public.customer_vehicles(garage_id, status);

-- Add helpful comments
COMMENT ON TABLE public.customer_vehicles IS 'Vehicle information belonging to customers. Make/model/year from motorcycles table.';
COMMENT ON COLUMN public.customer_vehicles.customer_id IS 'Foreign key reference to customers table';
COMMENT ON COLUMN public.customer_vehicles.garage_id IS 'Foreign key reference to garages table (UUID), same as garage_auth.garage_id';
COMMENT ON COLUMN public.customer_vehicles.vin IS 'Vehicle Identification Number (also called Chassis Number)';
COMMENT ON COLUMN public.customer_vehicles.current_mileage IS 'Current odometer reading in kilometers';
COMMENT ON COLUMN public.customer_vehicles.last_service_date IS 'Date of last service visit';

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
    garage_id IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Users can insert customers for their garage only
CREATE POLICY "Allow insert customers for own garage"
  ON public.customers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Users can update customers from their garage only
CREATE POLICY "Allow update customers from own garage"
  ON public.customers
  FOR UPDATE
  TO authenticated
  USING (
    garage_id IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  )
  WITH CHECK (
    garage_id IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
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
    garage_id IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Users can insert vehicles for their garage only
CREATE POLICY "Allow insert vehicles for own garage"
  ON public.customer_vehicles
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  );

-- Policy: Users can update vehicles from their garage only
CREATE POLICY "Allow update vehicles from own garage"
  ON public.customer_vehicles
  FOR UPDATE
  TO authenticated
  USING (
    garage_id IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
  )
  WITH CHECK (
    garage_id IN (
      SELECT garage_id FROM public.garage_auth
      WHERE user_uid = auth.uid()
    )
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

-- Drop existing functions if they exist (drop all overloads)
DROP FUNCTION IF EXISTS public.get_customer_vehicle_count CASCADE;
DROP FUNCTION IF EXISTS public.license_plate_exists CASCADE;

-- Wait a moment to ensure drops complete
SELECT pg_sleep(0.1);

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
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================================================

-- Uncomment below to insert sample data for testing
/*
-- Sample customer (requires a valid garage UUID from garages table)
INSERT INTO public.customers (garage_id, first_name, last_name, email, phone_number, alternate_phone, address, city, state, zip_code, country, notes)
VALUES (
  'garage-uuid-123', -- Replace with actual id (UUID) from garages table
  'Rajesh',
  'Kumar',
  'rajesh.kumar@email.com',
  '+91 98765 43210',
  '+91 98765 43211',
  '123, Indiranagar 100ft Road',
  'Bangalore',
  'Karnataka',
  '560038',
  'India',
  'Regular customer, prefers Saturday appointments'
);

-- Sample vehicles for the customer
INSERT INTO public.customer_vehicles (customer_id, garage_id, make, model, year, license_plate, color, vin, engine_number, current_mileage, notes)
SELECT
  (SELECT id FROM public.customers WHERE email = 'rajesh.kumar@email.com'),
  'garage-uuid-123', -- Replace with actual id (UUID) from garages table
  'Honda',
  'Activa 6G',
  2022,
  'KA 01 AB 1234',
  'Pearl White',
  'MAL22H1A2M100001',
  'HC22E41001234',
  8500,
  'First service completed, customer prefers synthetic oil'
UNION ALL
SELECT
  (SELECT id FROM public.customers WHERE email = 'rajesh.kumar@email.com'),
  'garage-uuid-123', -- Replace with actual id (UUID) from garages table
  'Bajaj',
  'Pulsar NS200',
  2021,
  'KA 02 CD 5678',
  'Burnt Red',
  'MBL21PNSM2100002',
  'BL21E21001234',
  12500,
  'Needs brake pad replacement';
*/
