-- ============================================================================
-- SIMPLE DIAGNOSTIC - Find job_card_labor references
-- ============================================================================
-- Run each section separately in Supabase SQL Editor
-- ============================================================================

-- SECTION 1: Check what tables exist with 'labor' in the name
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%labor%';

-- SECTION 2: List all triggers (check results for any referencing job_card_labor)
SELECT
  trigger_name,
  event_object_table,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table;

-- SECTION 3: Check trigger action statements for job_card_labor references
SELECT
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND action_statement LIKE '%job_card_labor%';

-- SECTION 4: Get function definitions that mention job_card_labor
SELECT
  proname as function_name
FROM pg_proc
JOIN pg_namespace ON pg_proc.pronamespace = pg_namespace.oid
WHERE pg_namespace.nspname = 'public'
  AND prosrc LIKE '%job_card_labor%';
