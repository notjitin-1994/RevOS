-- Fix column lengths in garage_auth table
-- This ensures first_name, last_name, and login_id can store full values

-- Increase first_name column to VARCHAR(100)
ALTER TABLE garage_auth ALTER COLUMN first_name TYPE VARCHAR(100);

-- Increase last_name column to VARCHAR(100)
ALTER TABLE garage_auth ALTER COLUMN last_name TYPE VARCHAR(100);

-- Increase login_id column to VARCHAR(255) to accommodate long garage names
ALTER TABLE garage_auth ALTER COLUMN login_id TYPE VARCHAR(255);

-- Verify the changes
SELECT
  column_name,
  data_type,
  character_maximum_length,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'garage_auth'
  AND table_schema = 'public'
  AND column_name IN ('first_name', 'last_name', 'login_id')
ORDER BY ordinal_position;
