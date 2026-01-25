-- ============================================================================
-- FIX JOB_CARD_LABOR TABLE REFERENCE ERROR
-- ============================================================================
-- This migration fixes the error where triggers/functions try to access
-- the non-existent job_card_labor table. The system uses job_card_checklist_items
-- for labor tracking instead.
-- ============================================================================

-- Drop any triggers that might reference job_card_labor
DO $$
DECLARE
  trigger_record RECORD;
BEGIN
  FOR trigger_record IN
    SELECT DISTINCT trigger_name, event_object_table
    FROM information_schema.triggers
    WHERE trigger_schema = 'public'
      AND event_object_table = 'job_card_labor'
  LOOP
    EXECUTE format('DROP TRIGGER IF EXISTS %s ON public.%s',
                   quote_ident(trigger_record.trigger_name),
                   quote_ident(trigger_record.event_object_table));
    RAISE NOTICE 'Dropped trigger: %', trigger_record.trigger_name;
  END LOOP;
END $$;

-- Drop any functions that might reference job_card_labor in their body
DO $$
DECLARE
  func_record RECORD;
  func_text TEXT;
BEGIN
  FOR func_record IN
    SELECT p.proname::TEXT as func_name,
           pg_get_functiondef(p.oid) as func_def
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND pg_get_functiondef(p.oid) LIKE '%job_card_labor%'
  LOOP
    -- Skip the calculate_job_card_labor_costs function as it doesn't reference the table
    IF func_record.func_name != 'calculate_job_card_labor_costs' THEN
      EXECUTE format('DROP FUNCTION IF EXISTS public.%s CASCADE', quote_ident(func_record.func_name));
      RAISE NOTICE 'Dropped function: %', func_record.func_name;
    END IF;
  END LOOP;
END $$;

-- ============================================================================
-- SUCCESS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Successfully cleaned up job_card_labor references!';
END $$;
