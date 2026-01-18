-- Test creating a simple table with foreign key to garages.garage_uid

-- Create a test table
CREATE TABLE IF NOT EXISTS public.test_fk_table (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  test_name VARCHAR(100)
);

-- Try to add the foreign key
ALTER TABLE public.test_fk_table
ADD CONSTRAINT test_fk_table_garage_fkey
FOREIGN KEY (garage_id) REFERENCES public.garages(garage_uid) ON DELETE CASCADE;

-- If this works, show success
SELECT 'Foreign key created successfully!' as result, 'garage_id type is: ' as info;

-- Show the type
SELECT
    column_name,
    data_type,
    udt_name
FROM information_schema.columns
WHERE table_name = 'test_fk_table'
AND column_name = 'garage_id';

-- Clean up
DROP TABLE IF EXISTS public.test_fk_table CASCADE;
