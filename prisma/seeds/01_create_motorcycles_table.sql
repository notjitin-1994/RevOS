-- ============================================================================
-- MOTORCYCLES TABLE SCHEMA (Supports Electric Motorcycles)
-- ============================================================================

-- Drop existing table if needed (WARNING: This will delete all data!)
-- DROP TABLE IF EXISTS public.motorcycles CASCADE;

-- Create motorcycles table
CREATE TABLE IF NOT EXISTS public.motorcycles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  make VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL,
  year_start INTEGER NOT NULL CHECK (year_start >= 1900 AND year_start <= 2100),
  year_end INTEGER CHECK (year_end >= year_start OR year_end IS NULL),
  country_of_origin VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL,
  engine_displacement_cc INTEGER NOT NULL CHECK (engine_displacement_cc >= 0),
  production_status VARCHAR(20) DEFAULT 'In Production' CHECK (production_status IN ('In Production', 'Discontinued', 'Limited')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Add indexes for common queries
CREATE INDEX IF NOT EXISTS idx_motorcycles_make ON public.motorcycles(make);
CREATE INDEX IF NOT EXISTS idx_motorcycles_model ON public.motorcycles(model);
CREATE INDEX IF NOT EXISTS idx_motorcycles_category ON public.motorcycles(category);
CREATE INDEX IF NOT EXISTS idx_motorcycles_engine_cc ON public.motorcycles(engine_displacement_cc);
CREATE INDEX IF NOT EXISTS idx_motorcycles_production_status ON public.motorcycles(production_status);
CREATE INDEX IF NOT EXISTS idx_motorcycles_make_model ON public.motorcycles(make, model);

-- Add helpful comments
COMMENT ON TABLE public.motorcycles IS 'Master table of serviceable motorcycles across all garages (India 1970-2026)';
COMMENT ON COLUMN public.motorcycles.year_end IS 'NULL if currently in production, otherwise the last manufacturing year';
COMMENT ON COLUMN public.motorcycles.production_status IS 'Auto-calculated based on year_end, but can be manually overridden';
COMMENT ON COLUMN public.motorcycles.engine_displacement_cc IS '0 for electric motorcycles, >0 for IC engines';

-- Enable Row Level Security (RLS) - Supabase best practice
ALTER TABLE public.motorcycles ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access (since this is a shared public table)
CREATE POLICY "Allow public read access" ON public.motorcycles
  FOR SELECT
  TO public
  USING (true);

-- Create policy to allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to insert" ON public.motorcycles
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update" ON public.motorcycles
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create policy to allow only admins/service role to delete
CREATE POLICY "Allow service role to delete" ON public.motorcycles
  FOR DELETE
  TO service_role
  USING (true);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_motorcycles_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
DROP TRIGGER IF EXISTS set_motorcycles_updated_at ON public.motorcycles;
CREATE TRIGGER set_motorcycles_updated_at
  BEFORE UPDATE ON public.motorcycles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_motorcycles_updated_at();
