-- Script to verify if employees exist in the users table
-- Run this in your Supabase SQL editor or psql client

-- Check if users table exists and has employee records
SELECT 
    table_name,
    table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('users', 'employees', 'garage_auth')
ORDER BY table_name;

-- Check for employee records in users table
SELECT 
    user_role,
    COUNT(*) as count,
    STRING_AGG(DISTINCT first_name || ' ' || last_name, ', ') as sample_names
FROM users
GROUP BY user_role
ORDER BY count DESC;

-- Show sample employee records
SELECT 
    user_uid,
    first_name,
    last_name,
    employee_id,
    login_id,
    email,
    phone_number,
    user_role,
    is_active,
    garage_name,
    created_at
FROM users
WHERE user_role IN ('employee', 'mechanic', 'service_advisor', 'manager')
ORDER BY created_at DESC
LIMIT 10;
