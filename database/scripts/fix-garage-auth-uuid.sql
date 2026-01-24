-- ============================================================================
-- FIX garage_auth.garage_id TO USE VALID UUIDs
-- ============================================================================

-- Step 1: Check current data
SELECT 
    login_id,
    garage_id,
    first_name,
    last_name,
    garage_name
FROM public.garage_auth;

-- Step 2: Check what valid UUIDs exist in garages table
SELECT 
    garage_uid,
    garage_name,
    garage_email
FROM public.garages;

-- Step 3: Update garage_auth with correct garage_uid from garages table
-- This matches by garage_name and updates garage_id to be the proper UUID
UPDATE public.garage_auth ga
SET garage_id = g.garage_uid
FROM public.garages g
WHERE ga.garage_name = g.garage_name
  AND ga.garage_id::text !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$';

-- Step 4: Verify the fix
SELECT 
    login_id,
    garage_id,
    first_name,
    last_name,
    garage_name
FROM public.garage_auth;
