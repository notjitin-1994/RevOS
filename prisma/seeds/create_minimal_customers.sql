-- MINIMAL TEST: Create just the customers table

-- Drop existing table
DROP TABLE IF EXISTS public.customers CASCADE;

-- Create customers table
CREATE TABLE public.customers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone_number VARCHAR(20) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add foreign key
ALTER TABLE public.customers
ADD CONSTRAINT customers_garage_id_fkey
FOREIGN KEY (garage_id) REFERENCES public.garages(garage_uid) ON DELETE CASCADE;

-- Verify
SELECT 'Customers table created!' as result;
SELECT column_name, data_type, udt_name
FROM information_schema.columns
WHERE table_name = 'customers' AND column_name = 'garage_id';
