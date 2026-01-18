-- Check the garage_auth table schema
SELECT
    column_name,
    data_type,
    udt_name,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'garage_auth'
AND table_schema = 'public'
ORDER BY ordinal_position;
