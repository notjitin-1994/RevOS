-- Detailed check of garages table garage_uid column
SELECT
    column_name,
    data_type,
    udt_name,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'garages'
AND table_schema = 'public'
AND column_name = 'garage_uid';

-- Check the actual constraint type
SELECT
    conname AS constraint_name,
    pg_get_constraintdef(c.oid) AS constraint_definition
FROM pg_constraint c
JOIN pg_namespace n ON n.oid = c.connamespace
JOIN pg_class cl ON cl.oid = c.conrelid
WHERE cl.relname = 'garages'
AND n.nspname = 'public'
AND contype = 'p'; -- primary key
