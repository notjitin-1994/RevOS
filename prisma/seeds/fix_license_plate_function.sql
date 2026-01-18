-- Drop the function if it exists in any form
DROP FUNCTION IF EXISTS public.license_plate_exists CASCADE;

-- Recreate with correct types
CREATE FUNCTION public.license_plate_exists(garage_param UUID, plate_param TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.customer_vehicles
    WHERE garage_id = garage_param AND license_plate = plate_param
  );
$$ LANGUAGE sql SECURITY DEFINER;
