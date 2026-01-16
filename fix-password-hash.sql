-- Allow password_hash to be NULL initially (for new users who haven't set password yet)
-- Once user sets their password, it should never be NULL again

-- Step 1: Alter the column to allow NULL
ALTER TABLE garage_auth 
ALTER COLUMN password_hash DROP NOT NULL;

-- Step 2: Add a comment to document this behavior
COMMENT ON COLUMN garage_auth.password_hash IS 'Password hash (bcrypt). NULL for new users who haven''t set password yet. Required once user sets their password.';

-- Verify the change
SELECT 
    column_name, 
    is_nullable, 
    data_type,
    column_default
FROM information_schema.columns 
WHERE table_name = 'garage_auth' 
AND column_name = 'password_hash';
