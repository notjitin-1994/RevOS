-- Check the garages table schema
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'garages'
AND table_schema = 'public'
ORDER BY ordinal_position;
