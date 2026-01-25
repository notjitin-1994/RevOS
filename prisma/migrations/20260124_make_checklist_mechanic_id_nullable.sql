-- ============================================================================
-- MAKE MECHANIC_ID NULLABLE IN JOB_CARD CHECKLIST ITEMS
-- ============================================================================
-- This migration makes the mechanic_id column nullable to allow checklist
-- items to be created without an assigned mechanic initially.
-- ============================================================================

-- Make mechanic_id nullable
ALTER TABLE public.job_card_checklist_items
  ALTER COLUMN mechanic_id DROP NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.job_card_checklist_items.mechanic_id IS 'Assigned mechanic (can be NULL - tasks can be created before assignment)';

-- Success notification
DO $$
BEGIN
  RAISE NOTICE 'mechanic_id column is now nullable in job_card_checklist_items';
END $$;
