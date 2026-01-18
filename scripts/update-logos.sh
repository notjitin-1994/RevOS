#!/bin/bash
# ============================================================================
# QUICK FIX FOR LOGOS - Run SQL directly in Supabase
# ============================================================================

echo "🔧 Logo URLs Quick Fix"
echo ""
echo "The easiest way to fix logos is to run SQL directly in Supabase:"
echo ""
echo "1. Open your Supabase Dashboard"
echo "2. Go to: SQL Editor"
echo "3. Create a new query and paste this:"
echo ""
echo "═══════════════════════════════════════════════════════════════"
cat << 'EOF'
-- Update makes with verified Wikipedia logo URLs
UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Bajaj_Auto_logo.svg/200px-Bajaj_Auto_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Bajaj';

UPDATE public.makes SET
  logo_url = 'https://upload.wikimedia.org/wikipedia/commons/thumb/e/e0/Hero_MotoCorp_logo.svg/200px-Hero_MotoCorp_logo.svg.png',
  updated_at = NOW()
WHERE name = 'Hero';

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

-- Sync to motorcycles table
UPDATE public.motorcycles m
SET logo_url = mk.logo_url
FROM public.makes mk
WHERE m.make = mk.name AND mk.logo_url IS NOT NULL;

-- Verify
SELECT name, logo_url FROM public.makes WHERE logo_url IS NOT NULL ORDER BY name;
EOF
echo "═══════════════════════════════════════════════════════════════"
echo ""
echo "4. Click 'Run' to execute"
echo "5. Refresh your browser to see the logos"
echo ""
