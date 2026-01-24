-- Remove garage_uid from garage_auth table as it's redundant
-- The relationship is already established through user_uid -> users table

-- Step 1: Drop the current primary key constraint
ALTER TABLE garage_auth DROP CONSTRAINT garage_auth_pkey;

-- Step 2: Remove the garage_uid column
ALTER TABLE garage_auth DROP COLUMN IF EXISTS garage_uid;

-- Step 3: Set user_uid as the primary key
ALTER TABLE garage_auth ADD PRIMARY KEY (user_uid);

-- Verify the changes
SELECT 
    column_name, 
    is_nullable, 
    data_type
FROM information_schema.columns 
WHERE table_name = 'garage_auth'
ORDER BY ordinal_position;

-- Check primary key constraint
SELECT
    constraint_name,
    constraint_type
FROM information_schema.table_constraints
WHERE table_name = 'garage_auth';
