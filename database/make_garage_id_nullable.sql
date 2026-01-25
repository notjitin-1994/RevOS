-- ============================================================================
-- Make garage_id nullable in parts_transactions table
-- ============================================================================
-- This allows the column to be NULL for existing records while
-- requiring it for new records created through the API
-- ============================================================================

-- Drop NOT NULL constraint from garage_id (if exists)
ALTER TABLE public.parts_transactions
  ALTER COLUMN garage_id DROP NOT NULL;

-- Verify the change
SELECT column_name, is_nullable, data_type
FROM information_schema.columns
WHERE table_name = 'parts_transactions'
  AND column_name = 'garage_id';

DO $$
BEGIN
  RAISE NOTICE '✅ garage_id is now nullable in parts_transactions table';
END $$;
