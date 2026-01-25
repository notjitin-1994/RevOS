-- ============================================================================
-- ADD PRIORITY COLUMN TO CHECKLIST ITEMS
-- ============================================================================
-- This migration adds the missing 'priority' column to job_card_checklist_items
-- The code expects this column but it was missing from the original schema
-- ============================================================================

-- Add priority column with check constraint
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS priority VARCHAR(20) NOT NULL DEFAULT 'medium'
  CHECK (priority IN ('low', 'medium', 'high', 'urgent'));

-- Add index for filtering by priority
CREATE INDEX IF NOT EXISTS idx_checklist_items_priority
  ON public.job_card_checklist_items(priority);

-- Add comment for documentation
COMMENT ON COLUMN public.job_card_checklist_items.priority IS 'Task priority: low, medium, high, or urgent';

-- Update existing records to have 'medium' priority if NULL
UPDATE public.job_card_checklist_items
SET priority = 'medium'
WHERE priority IS NULL;

-- ----------------------------------------------------------------------------
-- Success notification
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE 'Priority column added to job_card_checklist_items successfully';
END $$;
