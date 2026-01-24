-- Check if both tables have the same columns
SELECT
  table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name IN ('users', 'garage_auth')
  AND table_schema = 'public'
ORDER BY
  table_name,
  ordinal_position;

-- This will show us if there are any column mismatches
-- that could prevent the update from working
