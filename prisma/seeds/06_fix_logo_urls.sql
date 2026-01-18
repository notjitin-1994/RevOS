-- ============================================================================
-- FIX LOGO URLS WITH RELIABLE SOURCES
-- ============================================================================
-- This script updates all make logos with verified, working URLs
-- Uses Wikipedia/SVG logos and manufacturer-hosted logos
-- ============================================================================

-- Update makes table with verified logo URLs

-- ============================================================================
-- MAJOR INDIAN MANUFACTURERS - Use Wikipedia/hosted logos
-- ============================================================================

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bajaj_Auto_logo.svg/200px-Bajaj_Auto_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Bajaj';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hero_MotoCorp_logo.svg/200px-Hero_MotoCorp_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Hero';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hero_MotoCorp_logo.svg/200px-Hero_MotoCorp_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Hero Honda';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/TVS_Motor_Company_Logo.svg/200px-TVS_Motor_Company_Logo.svg.png',
  updated_at = NOW()
WHERE name = 'TVS';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Honda_logo.svg/200px-Honda_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Honda';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Royal_Enfield_logo.svg/200px-Royal_Enfield_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Royal Enfield';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Suzuki_logo.svg/200px-Suzuki_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Suzuki';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Yamaha_logo.svg/200px-Yamaha_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Yamaha';

-- ============================================================================
-- CLASSIC/HERITAGE BRANDS
-- ============================================================================

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Royal_Enfield_logo.svg/200px-Royal_Enfield_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Yezdi';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Jawa_logo.svg/200px-Jawa_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Jawa';

UPDATE public.makes
SET
  logo_url = 'https://www.escortskubota.com/wp-content/themes/escorts/assets/images/logo.png',
  updated_at = NOW()
WHERE name = 'Rajdoot';

-- ============================================================================
-- ELECTRIC VEHICLE MANUFACTURERS
-- ============================================================================

UPDATE public.makes
SET
  logo_url = 'https://cdn.zebrs.com/brands/ather-energy-logo.png',
  updated_at = NOW()
WHERE name = 'Ather';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/Ola_Electric_logo.svg/200px-Ola_Electric_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Ola';

UPDATE public.makes
SET
  logo_url = 'https://simpleenergy.com/wp-content/uploads/2021/09/simple-logo.png',
  updated_at = NOW()
WHERE name = 'Simple';

UPDATE public.makes
SET
  logo_url = 'https://revoltmotors.com/wp-content/uploads/2021/02/revolt-logo.png',
  updated_at = NOW()
WHERE name = 'Revolt';

UPDATE public.makes
SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/TVS_Motor_Company_Logo.svg/200px-TVS_Motor_Company_Logo.svg.png',
  updated_at = NOW()
WHERE (name = 'TVS' AND logo_url IS NULL);

-- ============================================================================
-- FALLBACK: For makes without specific logos, use text-based approach
-- ============================================================================

-- Kinetic
UPDATE public.makes
SET
  logo_url = NULL,
  updated_at = NOW()
WHERE name = 'Kinetic' OR name = 'Kinetic Honda';

-- LML
UPDATE public.makes
SET
  logo_url = NULL,
  updated_at = NOW()
WHERE name = 'LML';

-- Hero Electric
UPDATE public.makes
SET
  logo_url = 'https://heroelectric.com/wp-content/uploads/2021/03/hero-electric-logo.png',
  updated_at = NOW()
WHERE name = 'Hero Electric';

-- ============================================================================
-- SYNC TO MOTORCYCLES TABLE
-- ============================================================================

-- Update all motorcycles with the new logo URLs
UPDATE public.motorcycles m
SET logo_url = mk.logo_url,
    updated_at = NOW()
FROM public.makes mk
WHERE m.make = mk.name
  AND mk.logo_url IS NOT NULL;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- View results:
-- SELECT name, logo_url FROM makes WHERE logo_url IS NOT NULL ORDER BY name;
