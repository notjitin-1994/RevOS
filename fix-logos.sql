-- ============================================================================
-- COPY-PASTE THIS INTO YOUR SUPABASE SQL EDITOR
-- ============================================================================
-- Instructions:
-- 1. Open https://supabase.com/dashboard
-- 2. Select your project
-- 3. Go to SQL Editor
-- 4. Paste this entire file
-- 5. Click "Run"
-- 6. Refresh your browser
-- ============================================================================

-- MAJOR INDIAN BRANDS
UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bajaj_Auto_logo.svg/200px-Bajaj_Auto_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Bajaj';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hero_MotoCorp_logo.svg/200px-Hero_MotoCorp_logo.svg.png',
  updated_at = NOW()
WHERE name IN ('Hero', 'Hero Honda');

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1f/TVS_Motor_Company_Logo.svg/200px-TVS_Motor_Company_Logo.svg.png',
  updated_at = NOW()
WHERE name = 'TVS';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Honda_logo.svg/200px-Honda_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Honda';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Royal_Enfield_logo.svg/200px-Royal_Enfield_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Royal Enfield';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6d/Suzuki_logo.svg/200px-Suzuki_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Suzuki';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/Yamaha_logo.svg/200px-Yamaha_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Yamaha';

-- CLASSIC BRANDS
UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a7/Jawa_logo.svg/200px-Jawa_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Jawa';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9f/Royal_Enfield_logo.svg/200px-Royal_Enfield_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Yezdi';

-- ELECTRIC BRANDS
UPDATE public.makes SET
  logo_url = 'https://www.atherenergy.com/themes/custom/ather/logo.svg',
  updated_at = NOW()
WHERE name = 'Ather';

UPDATE public.makes SET
  logo_url = 'https://www.olaelectric.com/assets/logo-ol.svg',
  updated_at = NOW()
WHERE name = 'Ola';

UPDATE public.makes SET
  logo_url = 'https://heroelectric.com/wp-content/uploads/2021/03/hero-electric-logo.png',
  updated_at = NOW()
WHERE name = 'Hero Electric';

UPDATE public.makes SET
  logo_url = 'https://revoltmotors.com/wp-content/uploads/2021/02/revolt-logo.png',
  updated_at = NOW()
WHERE name = 'Revolt';

UPDATE public.makes SET
  logo_url = 'https://simpleenergy.com/wp-content/uploads/2021/09/simple-logo.png',
  updated_at = NOW()
WHERE name = 'Simple';

-- INTERNATIONAL BRANDS
UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Kawasaki_logo.svg/200px-Kawasaki_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Kawasaki';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/33/Ducati_Logo.svg/200px-Ducati_Logo.svg.png',
  updated_at = NOW()
WHERE name = 'Ducati';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/BMW_Motorrad.svg/200px-BMW_Motorrad.svg.png',
  updated_at = NOW()
WHERE name = 'BMW';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/KTM_logo.svg/200px-KTM_logo.svg.png',
  updated_at = NOW()
WHERE name = 'KTM';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/en/thumb/d/d8/Harley-Davidson_logo.svg/200px-Harley-Davidson_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Harley-Davidson';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/12/Triumph_logo.svg/200px-Triumph_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Triumph';

-- ============================================================================
-- SYNC TO MOTORCYCLES TABLE
-- ============================================================================

-- Update all motorcycles with the logo URLs from makes table
UPDATE public.motorcycles m
SET logo_url = mk.logo_url,
    updated_at = NOW()
FROM public.makes mk
WHERE m.make = mk.name
  AND mk.logo_url IS NOT NULL;

-- ============================================================================
-- VERIFY RESULTS
-- ============================================================================

-- Show all makes with logos
SELECT
  name AS "Make",
  logo_url AS "Logo URL",
  CASE
    WHEN logo_url IS NOT NULL THEN '✅'
    ELSE '❌'
  END AS "Has Logo"
FROM public.makes
ORDER BY name;

-- Count makes with logos
SELECT
  COUNT(*) AS "Total Makes",
  COUNT(logo_url) AS "With Logos",
  COUNT(*) - COUNT(logo_url) AS "Without Logos"
FROM public.makes;
