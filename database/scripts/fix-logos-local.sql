-- ============================================================================
-- USE LOCAL LOGO FILES - COPY THIS TO SUPABASE SQL EDITOR
-- ============================================================================
-- This updates the database to use local SVG logo files
-- Run this in your Supabase SQL Editor
-- ============================================================================

-- Update makes to use local logo files
UPDATE public.makes SET logo_url = '/logos/bajaj.svg', updated_at = NOW() WHERE name = 'Bajaj';
UPDATE public.makes SET logo_url = '/logos/hero.svg', updated_at = NOW() WHERE name = 'Hero';
UPDATE public.makes SET logo_url = '/logos/hero.svg', updated_at = NOW() WHERE name = 'Hero Honda';
UPDATE public.makes SET logo_url = '/logos/tvs.svg', updated_at = NOW() WHERE name = 'TVS';
UPDATE public.makes SET logo_url = '/logos/honda.svg', updated_at = NOW() WHERE name = 'Honda';
UPDATE public.makes SET logo_url = '/logos/royal-enfield.svg', updated_at = NOW() WHERE name = 'Royal Enfield';
UPDATE public.makes SET logo_url = '/logos/suzuki.svg', updated_at = NOW() WHERE name = 'Suzuki';
UPDATE public.makes SET logo_url = '/logos/yamaha.svg', updated_at = NOW() WHERE name = 'Yamaha';
UPDATE public.makes SET logo_url = '/logos/jawa.svg', updated_at = NOW() WHERE name = 'Jawa';
UPDATE public.makes SET logo_url = '/logos/yezdi.svg', updated_at = NOW() WHERE name = 'Yezdi';
UPDATE public.makes SET logo_url = '/logos/ather.svg', updated_at = NOW() WHERE name = 'Ather';
UPDATE public.makes SET logo_url = '/logos/ola.svg', updated_at = NOW() WHERE name = 'Ola';
UPDATE public.makes SET logo_url = '/logos/revolt.svg', updated_at = NOW() WHERE name = 'Revolt';
UPDATE public.makes SET logo_url = '/logos/simple.svg', updated_at = NOW() WHERE name = 'Simple';

-- Sync to motorcycles table
UPDATE public.motorcycles m
SET logo_url = mk.logo_url, updated_at = NOW()
FROM public.makes mk
WHERE m.make = mk.name AND mk.logo_url IS NOT NULL;

-- Verify
SELECT name, logo_url FROM public.makes WHERE logo_url IS NOT NULL ORDER BY name;
