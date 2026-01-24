-- Check column types and character limits for garage_auth table
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
