-- ============================================================================
-- DIAGNOSE TRIGGERS THAT REFERENCE job_card_labor
-- ============================================================================
-- Run this script to identify any triggers or functions that reference
-- the non-existent job_card_labor table.
-- ============================================================================

-- Find all triggers
SELECT
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Find all functions that reference job_card_labor
SELECT
  p.proname as function_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND (
    pg_get_functiondef(p.oid) LIKE '%job_card_labor%'
    OR pg_get_functiondef(p.oid) LIKE '%DELETE FROM%job_card%'
  )
ORDER BY p.proname;

-- Check if job_card_labor table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'job_card_labor'
) as table_exists;
