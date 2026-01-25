-- ============================================================================
-- FIX JOB_CARD_LABOR TABLE REFERENCE ERROR
-- ============================================================================
-- This script fixes triggers/functions that reference the non-existent
-- job_card_labor table. Run this in your Supabase SQL Editor.
-- ============================================================================

-- Step 1: Check if job_card_labor table exists
SELECT
  table_name,
  table_type
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE '%labor%'
ORDER BY table_name;

-- Step 2: Find all triggers on all tables
SELECT
  trigger_name,
  event_object_table,
  action_statement,
  action_timing,
  event_manipulation
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;

-- Step 3: Search for functions that reference job_card_labor in their definition
SELECT
  p.proname as function_name,
  n.nspname as schema_name,
  pg_get_functiondef(p.oid) as function_definition
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND pg_get_functiondef(p.oid) LIKE '%job_card_labor%'
ORDER BY p.proname;

-- Step 4: Drop any problematic triggers (safe to run - only drops if exists)
-- You may need to uncomment specific lines based on the results above

-- Example: If you find a trigger named 'cleanup_labor_trigger' on 'job_cards':
-- DROP TRIGGER IF EXISTS cleanup_labor_trigger ON public.job_cards;

-- Step 5: Drop any problematic functions (safe to run - only drops if exists)
-- You may need to uncomment specific lines based on the results above

-- Common problematic functions - uncomment if they exist:
-- DROP FUNCTION IF EXISTS public.maintain_job_card_labor() CASCADE;
-- DROP FUNCTION IF EXISTS public.cleanup_job_card_labor() CASCADE;
-- DROP FUNCTION IF EXISTS public.sync_job_card_labor() CASCADE;
