-- Fix garage_id columns to be UUID instead of VARCHAR

-- First, let's see the current customers table schema too
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'customers'
AND table_schema = 'public'
AND column_name = 'garage_id';

-- Fix customer_vehicles.garage_id
-- First, we need to drop any dependent objects
DROP POLICY IF EXISTS "Allow read vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow insert vehicles for own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow update vehicles from own garage" ON public.customer_vehicles;
DROP POLICY IF EXISTS "Allow service role full access on vehicles" ON public.customer_vehicles;

-- Drop the foreign key constraint
ALTER TABLE public.customer_vehicles DROP CONSTRAINT IF EXISTS customer_vehicles_garage_id_fkey;

-- Alter the column type to UUID
ALTER TABLE public.customer_vehicles
ALTER COLUMN garage_id TYPE UUID USING garage_id::UUID;

-- Recreate the foreign key constraint
ALTER TABLE public.customer_vehicles
ADD CONSTRAINT customer_vehicles_garage_id_fkey
FOREIGN KEY (garage_id) REFERENCES public.garages(id) ON DELETE CASCADE;

-- Recreate RLS policies
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
