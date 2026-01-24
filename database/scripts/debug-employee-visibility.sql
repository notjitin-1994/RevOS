-- ============================================================================
-- DIAGNOSE EMPLOYEE VISIBILITY ISSUE
-- ============================================================================
-- This script will help identify why employees aren't showing in the UI

-- ============================================================================
-- STEP 1: CHECK YOUR GARAGE ID
-- ============================================================================

-- First, find your garage by looking at your owner/admin account
SELECT '=== FIND YOUR GARAGE INFO ===' as info;
SELECT
    user_uid,
    first_name,
    last_name,
    login_id,
    user_role,
    garage_id,
    garage_uid,
    garage_name
FROM users
WHERE user_role IN ('owner', 'admin', 'Owner', 'Admin')
ORDER BY created_at DESC
LIMIT 5;

-- ============================================================================
-- STEP 2: CHECK ALL USERS IN YOUR GARAGE
-- ============================================================================

-- Replace 'YOUR_GARAGE_ID' with your actual garage_id from above
-- Run this query to see all users in your garage

SELECT '=== ALL USERS IN YOUR GARAGE ===' as info;
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
WHERE garage_id = 'YOUR_GARAGE_ID'  -- REPLACE THIS!
ORDER BY created_at DESC;

-- Or, if you don't know your garage_id, use garage_name instead:
/*
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
WHERE garage_name = 'YOUR_GARAGE_NAME'  -- REPLACE THIS!
ORDER BY created_at DESC;
*/

-- ============================================================================
-- STEP 3: CHECK USER_ROLE VALUES
-- ============================================================================

SELECT '=== USER_ROLE VALUES IN YOUR GARAGE ===' as info;
SELECT
    user_role,
    COUNT(*) as count,
    STRING_AGG(first_name || ' ' || last_name, ', ') as employees
FROM users
-- WHERE garage_id = 'YOUR_GARAGE_ID'  -- Uncomment and replace
GROUP BY user_role
ORDER BY count DESC;

-- ============================================================================
-- STEP 4: SIMULATE THE API QUERY
-- ============================================================================

-- This is what the API does - it excludes users with user_role = 'Owner'
SELECT '=== WHAT THE API RETURNS ===' as info;

-- Replace 'YOUR_GARAGE_ID' with your actual garage_id
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
    garage_id
FROM users
WHERE garage_id = 'YOUR_GARAGE_ID'  -- REPLACE THIS!
  AND user_role != 'Owner'  -- This might be filtering out your employees!
ORDER BY created_at DESC;

-- ============================================================================
-- STEP 5: CHECK FOR CASE SENSITIVITY ISSUES
-- ============================================================================

SELECT '=== CHECK USER_ROLE CASE SENSITIVITY ===' as info;
SELECT DISTINCT
    user_role,
    ASCII(user_role) as first_char_ascii,
    LENGTH(user_role) as length
FROM users
-- WHERE garage_id = 'YOUR_GARAGE_ID'  -- Uncomment and replace
ORDER BY user_role;

-- ============================================================================
-- COMMON ISSUES AND SOLUTIONS
-- ============================================================================

/*
ISSUE 1: Case sensitivity in user_role
----------------------------------------
The API filters: .neq('user_role', 'Owner')

If your database has: 'owner' (lowercase)
The API will NOT filter it out correctly!

SOLUTION: Check what values you have and fix if needed:
*/

-- Fix case inconsistency (run this carefully!)
/*
UPDATE users
SET user_role = LOWER(user_role)
WHERE user_role IN ('Owner', 'Admin', 'Manager', 'Mechanic');
*/

/*
ISSUE 2: garage_id mismatch
---------------------------
The frontend sends garageId from session
Make sure it matches exactly with the database

Check in browser console:
sessionStorage.getItem('user')
Look at the garageId value

Compare with database:
SELECT DISTINCT garage_id FROM users;
*/

/*
ISSUE 3: RLS (Row Level Security) blocking access
--------------------------------------------------
Check if RLS policies are blocking the query

Run this to check policies:
*/

SELECT '=== RLS POLICIES ON USERS TABLE ===' as info;
SELECT
    policyname,
    permissive,
    roles,
    cmd,
    LEFT(qual, 100) as qual_preview
FROM pg_policies
WHERE tablename = 'users';

/*
ISSUE 4: Missing or NULL values
--------------------------------
Check if required fields are NULL
*/

SELECT '=== CHECK FOR NULL VALUES ===' as info;
SELECT
    user_uid,
    first_name,
    last_name,
    user_role,
    garage_id,
    login_id,
    is_active
FROM users
-- WHERE garage_id = 'YOUR_GARAGE_ID'  -- Uncomment and replace
WHERE
    first_name IS NULL
    OR last_name IS NULL
    OR user_role IS NULL
    OR garage_id IS NULL
    OR is_active IS NULL;

-- ============================================================================
-- QUICK FIX QUERIES
-- ============================================================================

-- If user_role has inconsistent casing, standardize it:
/*
UPDATE users
SET user_role = CASE
    WHEN LOWER(user_role) = 'owner' THEN 'owner'
    WHEN LOWER(user_role) = 'admin' THEN 'admin'
    WHEN LOWER(user_role) = 'manager' THEN 'manager'
    WHEN LOWER(user_role) = 'service_advisor' THEN 'service_advisor'
    WHEN LOWER(user_role) = 'mechanic' THEN 'mechanic'
    WHEN LOWER(user_role) = 'employee' THEN 'employee'
    ELSE user_role
END
WHERE user_role ~* '^(owner|admin|manager|service_advisor|mechanic|employee)$';
*/

-- ============================================================================
-- NEXT STEPS
-- ============================================================================

/*
1. Run the queries above to identify the issue
2. Check your browser console for errors:
   - Open DevTools (F12)
   - Go to Network tab
   - Load the employee management page
   - Look for the request to /api/employees/list
   - Check the Response and garageId parameter

3. Common fixes:
   a) If case sensitivity issue: run the standardization query above
   b) If garage_id mismatch: update the API to use garage_uid instead
   c) If RLS issue: check policies in Supabase dashboard

4. Test the fix:
   - After fixing, reload the employee management page
   - Check browser console for any errors
   - Verify employees appear in the table
*/

-- ============================================================================
-- VERIFICATION QUERY (run after fixes)
-- ============================================================================

SELECT '=== FINAL VERIFICATION ===' as info;
SELECT
    COUNT(*) as total_users,
    COUNT(*) FILTER (WHERE user_role != 'Owner') as non_owners,
    COUNT(*) FILTER (WHERE is_active = true) as active_users
FROM users
-- WHERE garage_id = 'YOUR_GARAGE_ID'  -- Uncomment and replace
;
