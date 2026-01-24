-- ============================================================================
-- FIX GARAGE_AUTH PRIMARY KEY
-- ============================================================================
-- This script ensures the garage_auth table has user_uid as PRIMARY KEY
-- This is required for foreign key references in the job cards system
-- ============================================================================

-- First, check if there's an existing primary key
DO $$
DECLARE
    pk_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'garage_auth'
        AND constraint_type = 'PRIMARY KEY'
    ) INTO pk_exists;

    IF pk_exists THEN
        -- Drop existing primary key
        ALTER TABLE garage_auth DROP CONSTRAINT IF EXISTS garage_auth_pkey;
        ALTER TABLE garage_auth DROP CONSTRAINT IF EXISTS garage_auth_user_uid_pkey;
    END IF;
END $$;

-- Check if user_uid has unique constraint
DO $$
DECLARE
    unique_exists BOOLEAN;
BEGIN
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_schema = 'public'
        AND table_name = 'garage_auth'
        AND constraint_type = 'UNIQUE'
        AND constraint_name LIKE '%user_uid%'
    ) INTO unique_exists;

    IF unique_exists THEN
        -- Drop unique constraint
        ALTER TABLE garage_auth DROP CONSTRAINT IF EXISTS garage_auth_user_uid_key;
        ALTER TABLE garage_auth DROP CONSTRAINT IF EXISTS garage_auth_user_uid_unique;
    END IF;
END $$;

-- Now add user_uid as PRIMARY KEY
ALTER TABLE garage_auth ADD PRIMARY KEY (user_uid);

-- Verify the primary key was created
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_schema = 'public'
AND table_name = 'garage_auth'
AND constraint_type IN ('PRIMARY KEY', 'UNIQUE');

-- Show table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'garage_auth'
AND table_schema = 'public'
ORDER BY ordinal_position;
