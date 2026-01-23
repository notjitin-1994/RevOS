-- ============================================================================
-- ADD SUBTASKS AND LINKING FIELDS TO CHECKLIST ITEMS
-- ============================================================================
-- This migration adds support for:
-- 1. Subtasks within each checklist item
-- 2. Linking checklist items to customer issues, service scope, and technical diagnosis
-- These are features that exist in the UI but were not being saved to the database
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Step 1: Add subtasks column (JSONB array)
-- ----------------------------------------------------------------------------

-- Subtasks structure: [{ id, name, description, estimatedMinutes, completed, displayOrder }]
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS subtasks JSONB DEFAULT '[]'::jsonb;

-- Add GIN index for efficient querying of subtasks
CREATE INDEX IF NOT EXISTS idx_checklist_items_subtasks
  ON public.job_card_checklist_items USING GIN (subtasks);

-- ----------------------------------------------------------------------------
-- Step 2: Add linking columns (JSONB arrays of indices)
-- ----------------------------------------------------------------------------

-- Links to customerReportIssues array indices
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS linked_to_customer_issues JSONB DEFAULT '[]'::jsonb;

-- Links to workRequestedItems array indices
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS linked_to_service_scope JSONB DEFAULT '[]'::jsonb;

-- Links to technicalDiagnosisItems array indices
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS linked_to_technical_diagnosis JSONB DEFAULT '[]'::jsonb;

-- Add GIN indexes for efficient querying of linking fields
CREATE INDEX IF NOT EXISTS idx_checklist_items_linked_customer_issues
  ON public.job_card_checklist_items USING GIN (linked_to_customer_issues);

CREATE INDEX IF NOT EXISTS idx_checklist_items_linked_service_scope
  ON public.job_card_checklist_items USING GIN (linked_to_service_scope);

CREATE INDEX IF NOT EXISTS idx_checklist_items_linked_technical_diagnosis
  ON public.job_card_checklist_items USING GIN (linked_to_technical_diagnosis);

-- ----------------------------------------------------------------------------
-- Step 3: Add comments for documentation
-- ----------------------------------------------------------------------------

COMMENT ON COLUMN public.job_card_checklist_items.subtasks IS 'JSONB array of subtasks: [{ id, name, description, estimatedMinutes, completed, displayOrder }]';
COMMENT ON COLUMN public.job_card_checklist_items.linked_to_customer_issues IS 'JSONB array of indices linking to customerReportIssues array';
COMMENT ON COLUMN public.job_card_checklist_items.linked_to_service_scope IS 'JSONB array of indices linking to workRequestedItems array';
COMMENT ON COLUMN public.job_card_checklist_items.linked_to_technical_diagnosis IS 'JSONB array of indices linking to technicalDiagnosisItems array';

-- ----------------------------------------------------------------------------
-- Success notification
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE 'Subtasks and linking fields added to job_card_checklist_items successfully';
END $$;
