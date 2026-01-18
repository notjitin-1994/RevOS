-- ============================================================================
-- FUNCTION TO UPDATE MOTORCYCLE LOGOS FROM MAKES TABLE
-- ============================================================================
-- This function updates the logo_url column in the motorcycles table
-- by referencing the makes table
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_motorcycle_logos_from_makes()
RETURNS INTEGER AS $$
DECLARE
  updated_count INTEGER;
BEGIN
  -- Update motorcycles table with logo URLs from makes table
  UPDATE public.motorcycles m
  SET logo_url = mk.logo_url,
      updated_at = NOW()
  FROM public.makes mk
  WHERE m.make = mk.name
    AND mk.logo_url IS NOT NULL
    AND (m.logo_url IS NULL OR m.logo_url != mk.logo_url);

  GET DIAGNOSTICS updated_count = ROW_COUNT;

  RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Comment on the function
COMMENT ON FUNCTION public.update_motorcycle_logos_from_makes() IS 'Updates logo_url in motorcycles table from makes table';
