-- ============================================================================
-- CHECK GARAGE ID MISMATCH
-- ============================================================================
-- The frontend is sending garageId: c9f656e3-baac-454a-9b36-c646bcaf6c39
-- But no employees are found with that garage_id
-- ============================================================================

-- Check if this is actually a garage_uid instead of garage_id
SELECT '=== SEARCH BY GARAGE_UID ===' as info;
SELECT
    user_uid,
    first_name,
    last_name,
    user_role,
    garage_id,
    garage_uid,
    garage_name,
    is_active
FROM users
WHERE garage_uid = 'c9f656e3-baac-454a-9b36-c646bcaf6c39'
ORDER BY created_at;

-- If the above returns results, it means the session is storing garage_uid
-- but the API is querying by garage_id

-- Let's also check what the garage_id values look like
SELECT '=== SAMPLE GARAGE_ID VALUES ===' as info;
SELECT DISTINCT
    garage_id,
    garage_uid,
    garage_name,
    COUNT(*) as user_count
FROM users
GROUP BY garage_id, garage_uid, garage_name
ORDER BY user_count DESC
LIMIT 10;

-- Check all users to see the relationship
SELECT '=== ALL USERS WITH GARAGE INFO ===' as info;
SELECT
    user_uid,
    first_name,
    last_name,
    user_role,
    garage_id,
    garage_uid,
    garage_name,
    created_at
FROM users
ORDER BY created_at DESC
LIMIT 20;

-- ============================================================================
-- DIAGNOSIS
-- ============================================================================

/*
The issue is likely one of these:

1. SESSION stores garage_uid (UUID) but API queries garage_id (different format)
   - garage_uid: c9f656e3-baac-454a-9b36-c646bcaf6c39
   - garage_id: might be something else (e.g., 'garage_001', 'GARAGE-001', etc.)

2. FIX: Update the API to query by garage_uid instead of garage_id

Run the queries above to confirm which field has the UUID value
*/

-- ============================================================================
-- QUICK FIX: Query by both garage_id AND garage_uid
-- ============================================================================

-- Test query that should work:
/*
SELECT *
FROM users
WHERE garage_uid = 'c9f656e3-baac-454a-9b36-c646bcaf6c39'
  AND user_role NOT IN ('Owner', 'owner')
ORDER BY created_at DESC;
*/
