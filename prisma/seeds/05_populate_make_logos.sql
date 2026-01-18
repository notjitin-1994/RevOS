-- ============================================================================
-- POPULATE MAKE LOGOS - ALL IN ONE SQL SCRIPT
-- ============================================================================
-- This script populates the makes table with logo URLs for all makes.
-- Run this after creating the makes table to add all logos at once.
--
-- Usage:
--   psql -h your-host -U your-user -d your-database -f 05_populate_make_logos.sql
-- ============================================================================

-- Truncate existing makes data (optional - remove if you want to keep existing data)
-- TRUNCATE TABLE public.makes CASCADE;

-- ============================================================================
-- INDIAN MANUFACTURERS
-- ============================================================================

-- Bajaj Auto
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Bajaj',
  'bajaj',
  'https://logo.clearbit.com/bajajauto.com',
  'https://www.bajajauto.com',
  'India',
  'Bajaj Auto is an Indian multinational automotive manufacturing company'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Hero MotoCorp
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Hero',
  'hero',
  'https://logo.clearbit.com/heromotocorp.com',
  'https://www.heromotocorp.com',
  'India',
  'Hero MotoCorp is the world''s largest manufacturer of motorcycles and scooters'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Hero Honda (legacy)
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Hero Honda',
  'hero-honda',
  'https://logo.clearbit.com/heromotocorp.com',
  'https://www.heromotocorp.com',
  'India',
  'Hero Honda was a joint venture between Hero Group and Honda Motor Company'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Hero Electric
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Hero Electric',
  'hero-electric',
  'https://logo.clearbit.com/heroelectric.com',
  'https://www.heroelectric.com',
  'India',
  'Hero Electric is India''s largest electric two-wheeler manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- TVS Motor Company
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'TVS',
  'tvs',
  'https://logo.clearbit.com/tvsmotor.com',
  'https://www.tvsmotor.com',
  'India',
  'TVS Motor Company is the third largest two-wheeler manufacturer in India'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Honda Motorcycle & Scooter India
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Honda',
  'honda',
  'https://logo.clearbit.com/honda2wheelersindia.com',
  'https://www.honda2wheelersindia.com',
  'India',
  'Honda Motorcycle and Scooter India (HMSI) is a subsidiary of Honda Motor Company'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Royal Enfield
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Royal Enfield',
  'royal-enfield',
  'https://logo.clearbit.com/royalenfield.com',
  'https://www.royalenfield.com',
  'India',
  'Royal Enfield is the oldest global motorcycle brand in continuous production'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Suzuki Motorcycle India
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Suzuki',
  'suzuki',
  'https://logo.clearbit.com/suzukimotorcycle.co.in',
  'https://www.suzukimotorcycle.co.in',
  'India',
  'Suzuki Motorcycle India is a subsidiary of Suzuki Motor Corporation'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Yamaha Motor India
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Yamaha',
  'yamaha',
  'https://logo.clearbit.com/yamaha-motor-india.com',
  'https://www.yamaha-motor-india.com',
  'Japan/India',
  'India Yamaha Motor is a subsidiary of Yamaha Motor Company'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Kinetic Engineering
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Kinetic',
  'kinetic',
  'https://logo.clearbit.com/kinetic.com',
  'https://www.kinetic.com',
  'India',
  'Kinetic Engineering is an Indian motorcycle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Kinetic Honda (legacy)
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Kinetic Honda',
  'kinetic-honda',
  'https://logo.clearbit.com/kinetic.com',
  'https://www.kinetic.com',
  'India',
  'Kinetic Honda was a joint venture between Kinetic Engineering and Honda'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- LML (Lohia Machines Limited)
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'LML',
  'lml',
  'https://logo.clearbit.com/lmlindia.com',
  'https://www.lmlindia.com',
  'India',
  'LML was an Indian motorcycle and scooter manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Yezdi (Classic Legends)
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Yezdi',
  'yezdi',
  'https://logo.clearbit.com/yezdi.com',
  'https://www.yezdi.com',
  'India',
  'Yezdi is a classic Indian motorcycle brand revived by Classic Legends'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Jawa (Classic Legends)
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Jawa',
  'jawa',
  'https://logo.clearbit.com/jawamotorcycles.com',
  'https://www.jawamotorcycles.com',
  'India',
  'Jawa is a Czech motorcycle brand now manufactured in India by Classic Legends'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Rajdoot (Escorts)
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Rajdoot',
  'rajdoot',
  'https://logo.clearbit.com/escorts.com',
  'https://www.escorts.com',
  'India',
  'Rajdoot was an Indian motorcycle brand manufactured by Escorts Limited'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Priya
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Priya',
  'priya',
  'https://logo.clearbit.com/priya.com',
  'https://www.priya.com',
  'India',
  'Priya was an Indian scooter brand'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Vijai
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Vijai',
  'vijai',
  'https://logo.clearbit.com/vijaisuper.com',
  'https://www.vijaisuper.com',
  'India',
  'Vijai Super was an Indian scooter manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Allwyn
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Allwyn',
  'allwyn',
  'https://logo.clearbit.com/allwyn.com',
  'https://www.allwyn.com',
  'India',
  'Allwyn was an Indian scooter manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Scooters India
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Scooters India',
  'scooters-india',
  'https://logo.clearbit.com/scootersindia.com',
  'https://www.scootersindia.com',
  'India',
  'Scooters India Limited manufactured the iconic Lambretta scooters'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Atul
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Atul',
  'atul',
  'https://logo.clearbit.com/atulauto.com',
  'https://www.atulauto.com',
  'India',
  'Atul Auto is an Indian electric vehicle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- ============================================================================
-- ELECTRIC VEHICLE MANUFACTURERS
-- ============================================================================

-- Ather Energy
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Ather',
  'ather',
  'https://logo.clearbit.com/atherenergy.com',
  'https://www.atherenergy.com',
  'India',
  'Ather Energy is an Indian electric vehicle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Ola Electric
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Ola',
  'ola',
  'https://logo.clearbit.com/olaelectric.com',
  'https://www.olaelectric.com',
  'India',
  'Ola Electric is an Indian electric two-wheeler manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Simple Energy
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Simple',
  'simple',
  'https://logo.clearbit.com/simpleenergy.com',
  'https://www.simpleenergy.com',
  'India',
  'Simple Energy is an Indian electric scooter manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Revolt Motors
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Revolt',
  'revolt',
  'https://logo.clearbit.com/revoltmotors.com',
  'https://www.revoltmotors.com',
  'India',
  'Revolt Motors is India''s first AI-enabled electric motorcycle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Bounce
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Bounce',
  'bounce',
  'https://logo.clearbit.com/bounceelectric.com',
  'https://www.bounceelectric.com',
  'India',
  'Bounce Electric is an Indian electric vehicle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Okinawa
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Okinawa',
  'okinawa',
  'https://logo.clearbit.com/okinawascooter.com',
  'https://www.okinawascooter.com',
  'India',
  'Okinawa Autotech is an Indian electric two-wheeler manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Ampere
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Ampere',
  'ampere',
  'https://logo.clearbit.com/amperevehicles.com',
  'https://www.amperevehicles.com',
  'India',
  'Ampere Vehicles is an Indian electric scooter manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Benling
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Benling',
  'benling',
  'https://logo.clearbit.com/benlingindia.com',
  'https://www.benlingindia.com',
  'India',
  'Benling India is an electric vehicle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Pure EV
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Pure EV',
  'pure-ev',
  'https://logo.clearbit.com/pureev.com',
  'https://www.pureev.com',
  'India',
  'Pure EV is an Indian electric vehicle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Komaki
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Komaki',
  'komaki',
  'https://logo.clearbit.com/komaki.com',
  'https://www.komaki.com',
  'India',
  'Komaki is an Indian electric vehicle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Hop Electric
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Hop',
  'hop',
  'https://logo.clearbit.com/hopelectric.com',
  'https://www.hopelectric.com',
  'India',
  'Hop Electric is an Indian electric vehicle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- BGauss
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'BGauss',
  'bgauss',
  'https://logo.clearbit.com/bgauss.com',
  'https://www.bgauss.com',
  'India',
  'BGauss is an Indian electric scooter manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- Matter
INSERT INTO public.makes (name, slug, logo_url, website_url, country_of_origin, description)
VALUES (
  'Matter',
  'matter',
  'https://logo.clearbit.com/matterenergy.com',
  'https://www.matterenergy.com',
  'India',
  'Matter Energy is an Indian electric vehicle manufacturer'
)
ON CONFLICT (name) DO UPDATE SET
  logo_url = EXCLUDED.logo_url,
  website_url = EXCLUDED.website_url,
  updated_at = NOW();

-- ============================================================================
-- UPDATE MOTORCYCLES TABLE WITH LOGO URLS
-- ============================================================================

-- Now update all motorcycles with the logo URLs from the makes table
UPDATE public.motorcycles m
SET logo_url = mk.logo_url,
    updated_at = NOW()
FROM public.makes mk
WHERE m.make = mk.name
  AND mk.logo_url IS NOT NULL
  AND (m.logo_url IS NULL OR m.logo_url != mk.logo_url);

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Run this to verify the update:
-- SELECT make, logo_url FROM motorcycles WHERE logo_url IS NOT NULL LIMIT 10;
