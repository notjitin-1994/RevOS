-- Script to check current database structure
-- Run this in your Supabase SQL Editor

-- List all tables in the database
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_type NOT IN ('VIEW')
ORDER BY table_name;

-- Check if there's a separate employees table
SELECT EXISTS (
    SELECT FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'employees'
) AS employees_table_exists;

-- Check users table structure
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'users'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Count all records in users table
SELECT COUNT(*) as total_users FROM users;

-- Count by user_role in users table
SELECT
    user_role,
    COUNT(*) as count
FROM users
GROUP BY user_role
ORDER BY count DESC;
