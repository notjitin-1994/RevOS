-- ============================================================================
-- DATA INTEGRITY CHECK SCRIPT
-- ============================================================================
-- This script checks for common data integrity issues in the motorcycles table
-- Run this periodically or after data imports to catch errors early
-- ============================================================================

-- CHECK 1: Models that contain make names of OTHER manufacturers (potential misclassification)
-- This catches cases like "Ola" having a model called "Ather 450X"
SELECT
  make,
  model,
  year_start,
  'Model name contains another manufacturer name' as issue_type,
  'Model should likely belong to a different make' as suggestion
FROM motorcycles
WHERE model ILIKE '%Ather%'
  AND make != 'Ather'
UNION ALL
SELECT
  make,
  model,
  year_start,
  'Model name contains another manufacturer name' as issue_type,
  'Model should likely belong to a different make' as suggestion
FROM motorcycles
WHERE model ILIKE '%Hero%'
  AND make NOT IN ('Hero', 'Hero Honda', 'Hero Electric')
UNION ALL
SELECT
  make,
  model,
  year_start,
  'Model name contains another manufacturer name' as issue_type,
  'Model should likely belong to a different make' as suggestion
FROM motorcycles
WHERE model ILIKE '%Honda%'
  AND make != 'Honda'
UNION ALL
SELECT
  make,
  model,
  year_start,
  'Model name contains another manufacturer name' as issue_type,
  'Model should likely belong to a different make' as suggestion
FROM motorcycles
WHERE model ILIKE '%Bajaj%'
  AND make != 'Bajaj'
UNION ALL
SELECT
  make,
  model,
  year_start,
  'Model name contains another manufacturer name' as issue_type,
  'Model should likely belong to a different make' as suggestion
FROM motorcycles
WHERE model ILIKE '%TVS%'
  AND make != 'TVS'
UNION ALL
SELECT
  make,
  model,
  year_start,
  'Model name contains another manufacturer name' as issue_type,
  'Model should likely belong to a different make' as suggestion
FROM motorcycles
WHERE model ILIKE '%Yamaha%'
  AND make != 'Yamaha'
UNION ALL
SELECT
  make,
  model,
  year_start,
  'Model name contains another manufacturer name' as issue_type,
  'Model should likely belong to a different make' as suggestion
FROM motorcycles
WHERE model ILIKE '%Suzuki%'
  AND make != 'Suzuki'
UNION ALL
SELECT
  make,
  model,
  year_start,
  'Model name contains another manufacturer name' as issue_type,
  'Model should likely belong to a different make' as suggestion
FROM motorcycles
WHERE model ILIKE '%Ola%'
  AND make != 'Ola'
ORDER BY make, model;

-- CHECK 2: Duplicate model names within the same make
SELECT
  make,
  model,
  COUNT(*) as duplicate_count,
  'Duplicate model name within make' as issue_type,
  'Models should have unique names within each make' as suggestion
FROM motorcycles
GROUP BY make, model
HAVING COUNT(*) > 1
ORDER BY make, model;

-- CHECK 3: Models with same name across different makes (potential data entry errors)
-- This might be valid (e.g., different makes with similarly named models), but worth reviewing
SELECT
  m1.make as make_1,
  m2.make as make_2,
  m1.model,
  'Same model name exists under different makes' as issue_type,
  'Review if these are correctly classified' as suggestion
FROM motorcycles m1
JOIN motorcycles m2 ON m1.model = m2.model AND m1.make != m2.make
WHERE m1.make < m2.make  -- Avoid duplicates in result
ORDER BY m1.model, m1.make, m2.make;

-- CHECK 4: Inconsistent year ranges (year_end before year_start)
SELECT
  make,
  model,
  year_start,
  year_end,
  'Invalid year range' as issue_type,
  'year_end cannot be before year_start' as suggestion
FROM motorcycles
WHERE year_end IS NOT NULL
  AND year_end < year_start
ORDER BY make, model;

-- CHECK 5: Electric vehicles with engine displacement > 0
SELECT
  make,
  model,
  category,
  engine_displacement_cc,
  'Electric vehicle with engine displacement' as issue_type,
  'Electric vehicles should have engine_displacement_cc = 0' as suggestion
FROM motorcycles
WHERE category = 'Electric'
  AND engine_displacement_cc != 0
ORDER BY make, model;

-- CHECK 6: Non-electric vehicles with zero engine displacement (except edge cases)
SELECT
  make,
  model,
  category,
  engine_displacement_cc,
  'Non-electric with zero engine displacement' as issue_type,
  'Verify if this is correct (mopeds might have 50cc)' as suggestion
FROM motorcycles
WHERE category != 'Electric'
  AND engine_displacement_cc = 0
  AND category NOT IN ('Moped', 'Scooter')  -- These can legitimately have small/zero CC
ORDER BY make, model;

-- CHECK 7: Inconsistent country of origin within the same make
WITH country_counts AS (
  SELECT
    make,
    country_of_origin,
    COUNT(*) as model_count
  FROM motorcycles
  GROUP BY make, country_of_origin
)
SELECT
  make,
  string_agg(country_of_origin, ', ' ORDER BY country_of_origin) as countries,
  COUNT(*) as country_count,
  'Multiple countries for same make' as issue_type,
  'Verify if make operates in multiple countries or if data is inconsistent' as suggestion
FROM country_counts
GROUP BY make
HAVING COUNT(*) > 1
ORDER BY make;

-- CHECK 8: Models with production status "Discontinued" but no year_end
SELECT
  make,
  model,
  production_status,
  year_end,
  'Discontinued without end year' as issue_type,
  'Set year_end to last production year or change status' as suggestion
FROM motorcycles
WHERE production_status = 'Discontinued'
  AND year_end IS NULL
ORDER BY make, model;

-- CHECK 9: Models with year_end but status "In Production"
SELECT
  make,
  model,
  production_status,
  year_end,
  'Has end year but marked In Production' as issue_type,
  'Change status to Discontinued or remove year_end' as suggestion
FROM motorcycles
WHERE year_end IS NOT NULL
  AND production_status = 'In Production'
ORDER BY make, model;

-- CHECK 10: Future year_start values (potential data entry errors)
SELECT
  make,
  model,
  year_start,
  'Future start year' as issue_type,
  'Verify if this model is announced for future release' as suggestion
FROM motorcycles
WHERE year_start > EXTRACT(YEAR FROM CURRENT_DATE) + 2  -- Allow 2 years for announced models
ORDER BY year_start DESC, make, model;

-- ============================================================================
-- SUMMARY COUNTS
-- ============================================================================
SELECT 'Data Integrity Check Summary' as check_name;

SELECT
  'Total models' as metric,
  COUNT(*) as count
FROM motorcycles
UNION ALL
SELECT
  'Total makes' as metric,
  COUNT(DISTINCT make) as count
FROM motorcycles
UNION ALL
SELECT
  'Models with issues (see above)' as metric,
  COUNT(*) as count
FROM motorcycles
WHERE
  -- Add up all the conditions from checks above
  (model ILIKE '%Ather%' AND make != 'Ather') OR
  (model ILIKE '%Hero%' AND make NOT IN ('Hero', 'Hero Honda', 'Hero Electric')) OR
  (model ILIKE '%Honda%' AND make != 'Honda') OR
  (model ILIKE '%Bajaj%' AND make != 'Bajaj') OR
  (model ILIKE '%TVS%' AND make != 'TVS') OR
  (model ILIKE '%Yamaha%' AND make != 'Yamaha') OR
  (model ILIKE '%Suzuki%' AND make != 'Suzuki') OR
  (model ILIKE '%Ola%' AND make != 'Ola') OR
  (year_end IS NOT NULL AND year_end < year_start) OR
  (category = 'Electric' AND engine_displacement_cc != 0);

-- ============================================================================
-- INSTRUCTIONS FOR FIXING ISSUES
-- ============================================================================
-- 1. Review each issue returned by the queries above
-- 2. For misclassified models (like Ola/Ather 450X), use:
--    UPDATE motorcycles SET make = 'CorrectMake' WHERE make = 'WrongMake' AND model = 'ModelName';
-- 3. For duplicates, decide which entry is correct and delete the other:
--    DELETE FROM motorcycles WHERE id = 'duplicate_id';
-- 4. For year ranges and statuses, update with correct values:
--    UPDATE motorcycles SET year_end = 2020, production_status = 'Discontinued' WHERE id = 'model_id';
-- ============================================================================
