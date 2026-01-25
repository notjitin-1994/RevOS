-- ============================================================================
-- ADD DIAGNOSTIC JOB TYPE
-- ============================================================================
-- This migration adds 'diagnostic' to the allowed job_type values
-- to match the frontend TypeScript type definition.
-- ============================================================================

-- Drop the existing CHECK constraint
ALTER TABLE public.job_cards
  DROP CONSTRAINT IF EXISTS job_cards_job_type_check;

-- Add the updated CHECK constraint with 'diagnostic' included
ALTER TABLE public.job_cards
  ADD CONSTRAINT job_cards_job_type_check
  CHECK (job_type IN ('routine', 'repair', 'maintenance', 'custom', 'diagnostic'));

-- ============================================================================
-- SUCCESS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Successfully added diagnostic job type!';
END $$;
