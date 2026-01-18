-- ============================================================================
-- ADD MAKE LOGOS SUPPORT
-- ============================================================================
-- This migration adds logo_url column to motorcycles table and creates
-- a makes table for centralized make management with logos
-- ============================================================================

-- Step 1: Create makes table for centralized make management
CREATE TABLE IF NOT EXISTS public.makes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  country_of_origin VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_makes_name ON public.makes(name);
CREATE INDEX IF NOT EXISTS idx_makes_slug ON public.makes(slug);
CREATE INDEX IF NOT EXISTS idx_makes_is_active ON public.makes(is_active);

-- Add comments
COMMENT ON TABLE public.makes IS 'Master table of vehicle makes/manufacturers with logos and metadata';

-- Enable RLS
ALTER TABLE public.makes ENABLE ROW LEVEL SECURITY;

-- Create policies for makes table
CREATE POLICY "Allow public read access to makes" ON public.makes
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Allow authenticated users to insert makes" ON public.makes
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update makes" ON public.makes
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow service role to delete makes" ON public.makes
  FOR DELETE
  TO service_role
  USING (true);

-- Trigger to update updated_at
CREATE OR REPLACE FUNCTION public.update_makes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_makes_updated_at ON public.makes;
CREATE TRIGGER set_makes_updated_at
  BEFORE UPDATE ON public.makes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_makes_updated_at();

-- Step 2: Add logo_url column to motorcycles table
ALTER TABLE public.motorcycles
  ADD COLUMN IF NOT EXISTS logo_url TEXT;

COMMENT ON COLUMN public.motorcycles.logo_url IS 'URL to the make logo image';

-- Step 3: Function to create slug from make name
CREATE OR REPLACE FUNCTION public.create_slug(input_text VARCHAR)
RETURNS VARCHAR AS $$
DECLARE
  cleaned_text VARCHAR;
BEGIN
  -- Lowercase the text
  cleaned_text := LOWER(input_text);
  -- Replace spaces and special chars with hyphens
  cleaned_text := REGEXP_REPLACE(cleaned_text, '[^a-z0-9]+', '-', 'g');
  -- Remove leading/trailing hyphens
  cleaned_text := TRIM(BOTH '-' FROM cleaned_text);
  RETURN cleaned_text;
END;
$$ LANGUAGE plpgsql;

-- Step 4: Populate makes table from existing motorcycle data
INSERT INTO public.makes (name, slug, country_of_origin)
SELECT DISTINCT
  make,
  public.create_slug(make),
  MIN(country_of_origin)
FROM public.motorcycles
GROUP BY make
ON CONFLICT (name) DO NOTHING;

-- Step 5: Update motorcycles table with logo URLs from makes table
UPDATE public.motorcycles m
SET logo_url = mk.logo_url
FROM public.makes mk
WHERE m.make = mk.name
  AND mk.logo_url IS NOT NULL;
