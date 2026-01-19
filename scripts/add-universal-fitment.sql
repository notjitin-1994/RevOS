-- Add is_universal_fitment column to parts table
-- This allows marking parts as "universal" - compatible with all motorcycles

-- Add the column
ALTER TABLE public.parts
ADD COLUMN IF NOT EXISTS is_universal_fitment BOOLEAN DEFAULT false;

-- Add comment for documentation
COMMENT ON COLUMN public.parts.is_universal_fitment IS 'Indicates if this part is universal and fits all motorcycles. When true, no specific fitment records needed.';

-- Create index for filtering universal parts
CREATE INDEX IF NOT EXISTS idx_parts_is_universal_fitment
ON public.parts(is_universal_fitment)
WHERE is_universal_fitment = true;

-- Verify the column was added
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'parts'
  AND table_schema = 'public'
  AND column_name = 'is_universal_fitment';
