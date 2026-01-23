-- ============================================================================
-- ADD TECHNICAL DIAGNOSIS COLUMN TO JOB CARDS
-- ============================================================================
-- This migration adds the technical_diagnosis column to the job_cards table
-- to store technician's diagnosis information collected from the UI
-- ============================================================================

-- Add technical_diagnosis column if it doesn't exist
ALTER TABLE public.job_cards
  ADD COLUMN IF NOT EXISTS technical_diagnosis TEXT;

-- Add comment for documentation
COMMENT ON COLUMN public.job_cards.technical_diagnosis IS 'Technician''s diagnosis of the issues - collected from technical diagnosis items in the UI';

-- ----------------------------------------------------------------------------
-- Success notification
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE 'technical_diagnosis column added to job_cards successfully';
END $$;
