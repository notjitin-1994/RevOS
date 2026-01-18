-- Check the schema of customer_vehicles table
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'customer_vehicles'
AND table_schema = 'public'
ORDER BY ordinal_position;
