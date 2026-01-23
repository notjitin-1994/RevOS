-- ============================================================================
-- ADD UNIVERSAL FITMENT SUPPORT TO PARTS TABLE
-- ============================================================================
-- This migration adds support for universal parts that fit all vehicles.
-- Universal parts (like oil, filters, etc.) don't need individual fitment records.

-- Add universal fitment column to parts table
ALTER TABLE public.parts
ADD COLUMN IF NOT EXISTS is_universal_fitment BOOLEAN DEFAULT FALSE;

-- Add index for filtering universal parts
CREATE INDEX IF NOT EXISTS idx_parts_is_universal_fitment ON public.parts(is_universal_fitment);

-- Add comment for documentation
COMMENT ON COLUMN public.parts.is_universal_fitment IS 'TRUE if part fits all vehicles (universal part like oil, filters, etc.). When TRUE, no individual fitment records needed in parts_fitment table.';

-- Add composite index for queries filtering by garage and universal fitment
CREATE INDEX IF NOT EXISTS idx_parts_garage_universal ON public.parts(garage_id, is_universal_fitment);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify the column was added successfully
SELECT
    column_name,
    data_type,
    column_default,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'parts'
  AND column_name = 'is_universal_fitment';

-- Verify the indexes were created
SELECT
    indexname,
    indexdef
FROM pg_indexes
WHERE tablename = 'parts'
  AND indexname LIKE '%universal%';

-- Count existing parts (should all be FALSE by default)
SELECT
    COUNT(*) as total_parts,
    SUM(CASE WHEN is_universal_fitment = TRUE THEN 1 ELSE 0 END) as universal_parts,
    SUM(CASE WHEN is_universal_fitment = FALSE THEN 1 ELSE 0 END) as specific_fitment_parts
FROM public.parts;

-- ============================================================================
-- NOTES
-- ============================================================================
-- 1. Existing parts will have is_universal_fitment = FALSE by default
-- 2. Parts with is_universal_fitment = TRUE should NOT have records in parts_fitment
-- 3. The API should handle this logic when creating/updating parts
-- 4. Frontend should display universal parts differently than specific-fit parts
