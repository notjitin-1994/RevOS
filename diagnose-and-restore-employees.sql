-- ============================================================================
-- DIAGNOSE AND RESTORE EMPLOYEES
-- ============================================================================
-- This script will help you:
-- 1. Check if employees exist in the database
-- 2. Verify the users table structure
-- 3. Restore employee data if it was deleted
-- ============================================================================

-- ============================================================================
-- STEP 1: DIAGNOSE CURRENT STATE
-- ============================================================================

-- Check all tables in the database
SELECT '=== ALL TABLES IN DATABASE ===' as info;
SELECT
    table_name,
    table_type
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if users table exists and its row count
SELECT '=== USERS TABLE STATUS ===' as info;
SELECT
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'users'
    ) AS users_table_exists;

-- If users table exists, show record count and role breakdown
SELECT '=== USERS TABLE RECORD COUNT ===' as info;
SELECT COUNT(*) as total_users FROM users;

SELECT '=== USERS BY ROLE ===' as info;
SELECT
    COALESCE(user_role, 'NULL') as user_role,
    COUNT(*) as count
FROM users
GROUP BY user_role
ORDER BY count DESC;

-- Check garage_auth table
SELECT '=== GARAGE_AUTH TABLE STATUS ===' as info;
SELECT
    EXISTS (
        SELECT FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'garage_auth'
    ) AS garage_auth_exists;

SELECT COUNT(*) as total_auth_records FROM garage_auth;

-- ============================================================================
-- STEP 2: IF EMPLOYEES WERE DELETED FROM USERS TABLE
-- ============================================================================

-- Check if you have the owner/admin account (this should still exist)
SELECT '=== CHECK FOR OWNER/ADMIN ACCOUNTS ===' as info;
SELECT
    user_uid,
    first_name,
    last_name,
    login_id,
    email,
    user_role,
    is_active,
    garage_name
FROM users
WHERE user_role IN ('owner', 'admin')
ORDER BY created_at;

-- ============================================================================
-- STEP 3: RESTORE EMPLOYEES IF NEEDED
-- ============================================================================

-- IMPORTANT: If you have a database backup, use that instead!
-- In Supabase, go to: Database > Backups > Point-in-Time Recovery

-- If you need to recreate an employee that was accidentally deleted,
-- you'll need their information. Here's a template:

/*
-- TEMPLATE: Insert a deleted employee back into the users table
-- Replace the values below with the actual employee information

INSERT INTO users (
    user_uid,
    garage_uid,
    garage_id,
    garage_name,
    first_name,
    last_name,
    employee_id,
    login_id,
    email,
    phone_number,
    alternate_phone,
    address,
    city,
    state,
    zip_code,
    country,
    date_of_birth,
    date_of_joining,
    blood_group,
    department,
    user_role,
    is_active,
    profile_picture,
    certifications,
    specializations,
    created_at,
    updated_at
) VALUES (
    gen_random_uuid(),              -- user_uid (will be generated)
    'YOUR_GARAGE_UID',              -- Get this from your owner account
    'YOUR_GARAGE_ID',               -- Get this from your owner account
    'YOUR_GARAGE_NAME',             -- Get this from your owner account

    -- Employee Information
    'John',                         -- first_name
    'Doe',                          -- last_name
    'EMP001',                       -- employee_id (optional)
    'john.doe@yourgarage',          -- login_id (or auto-generate)
    'john.doe@email.com',           -- email
    '+91 98765 43210',              -- phone_number
    NULL,                           -- alternate_phone (optional)
    NULL,                           -- address (optional)
    NULL,                           -- city (optional)
    NULL,                           -- state (optional)
    NULL,                           -- zip_code (optional)
    'India',                        -- country (optional)
    NULL,                           -- date_of_birth (optional)
    '2024-01-01'::DATE,             -- date_of_joining (optional)
    NULL,                           -- blood_group (optional)
    'Service',                      -- department (optional)
    'mechanic',                     -- user_role: 'owner', 'admin', 'manager', 'service_advisor', 'mechanic', 'employee'
    true,                           -- is_active
    NULL,                           -- profile_picture (optional)
    '[]'::jsonb,                    -- certifications (empty array)
    '[]'::jsonb,                    -- specializations (empty array)
    NOW(),                          -- created_at
    NOW()                           -- updated_at
);

-- After inserting, you need to create a garage_auth record for them to login
-- Use the same user_uid that was generated above
*/

-- ============================================================================
-- STEP 4: VERIFY RESTORATION
-- ============================================================================

-- After restoring employees, verify they appear correctly
SELECT '=== CURRENT EMPLOYEES (excluding owner/admin) ===' as info;
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
    created_at
FROM users
WHERE user_role IN ('employee', 'mechanic', 'service_advisor', 'manager')
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 5: CHECK EMPLOYEE COUNT
-- ============================================================================

SELECT '=== EMPLOYEE COUNT SUMMARY ===' as info;
SELECT
    user_role,
    COUNT(*) as count,
    COUNT(*) FILTER (WHERE is_active = true) as active_count
FROM users
WHERE user_role IN ('owner', 'admin', 'manager', 'service_advisor', 'mechanic', 'employee')
GROUP BY user_role
ORDER BY user_role;

-- ============================================================================
-- RECOVERY OPTIONS
-- ============================================================================

/*
OPTIONS TO RESTORE LOST DATA:

1. SUPABASE POINT-IN-TIME RECOVERY (PITR):
   - Go to your Supabase dashboard
   - Navigate to Database > Backups
   - If PITR is enabled, you can restore to a specific time before deletion
   - This is the BEST option if available

2. SUPABASE BACKUP:
   - Check if you have any automated backups
   - Database > Backups > Manual Backups

3. LOG EXPORT:
   - Check Supabase Logs for any export functionality
   - Database > Logs

4. RECREATE FROM SCRATCH:
   - If no backup exists, you'll need to manually re-enter employee data
   - Use the template INSERT statement above
   - Use the UI to add employees (http://localhost:3000/employee-management/add)

TO PREVENT FUTURE DATA LOSS:
- Enable Point-in-Time Recovery in Supabase (if available in your plan)
- Set up regular automated backups
- Use transactions when making bulk changes
- Always backup before major database operations
*/

-- ============================================================================
-- TROUBLESHOOTING QUERIES
-- ============================================================================

-- Check if RLS is blocking visibility
SELECT '=== CHECK RLS POLICIES ===' as info;
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users';

-- Check current user and their garage
SELECT '=== CURRENT SESSION INFO ===' as info;
SELECT
    current_user,
    session_user,
    current_database();
