-- Create customer_vehicles table

-- Drop existing table
DROP TABLE IF EXISTS public.customer_vehicles CASCADE;

-- Create customer_vehicles table
CREATE TABLE public.customer_vehicles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id UUID NOT NULL,
  garage_id UUID NOT NULL,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL,
  year INTEGER NOT NULL,
  license_plate VARCHAR(50) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add foreign key to customers
ALTER TABLE public.customer_vehicles
ADD CONSTRAINT customer_vehicles_customer_id_fkey
FOREIGN KEY (customer_id) REFERENCES public.customers(id) ON DELETE CASCADE;

-- Add foreign key to garages
ALTER TABLE public.customer_vehicles
ADD CONSTRAINT customer_vehicles_garage_id_fkey
FOREIGN KEY (garage_id) REFERENCES public.garages(garage_uid) ON DELETE CASCADE;

-- Add unique constraint
ALTER TABLE public.customer_vehicles
ADD CONSTRAINT customer_vehicles_garage_license_unique
UNIQUE (garage_id, license_plate);

-- Verify
SELECT 'Customer vehicles table created!' as result;
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'customer_vehicles' AND column_name = 'garage_id';
