-- ============================================================================
-- MIGRATION: Fix Stock Status Calculation
-- ============================================================================
-- Purpose:
-- 1. Update the compute_part_metrics trigger to calculate stock status based on
--    TOTAL stock (on_hand_stock + warehouse_stock) instead of just on_hand_stock
-- 2. Recalculate stock_status for all existing parts based on the correct logic
--
-- Issue: The trigger was only checking on_hand_stock, ignoring warehouse_stock.
-- This caused parts to show as "out of stock" even when they had warehouse stock.
-- ============================================================================

-- ============================================================================
-- STEP 1: Drop the existing trigger function
-- ============================================================================

DROP FUNCTION IF EXISTS public.compute_part_metrics() CASCADE;

-- ============================================================================
-- STEP 2: Create the corrected trigger function
-- ============================================================================

CREATE OR REPLACE FUNCTION public.compute_part_metrics()
RETURNS TRIGGER AS $$
DECLARE
  total_stock INTEGER;
BEGIN
  -- Calculate total stock (on_hand_stock + warehouse_stock)
  total_stock := COALESCE(NEW.on_hand_stock, 0) + COALESCE(NEW.warehouse_stock, 0);

  -- Compute stock status based on TOTAL stock
  IF total_stock = 0 THEN
    NEW.stock_status := 'out-of-stock';
  ELSIF total_stock <= COALESCE(NEW.low_stock_threshold, 0) THEN
    NEW.stock_status := 'low-stock';
  ELSE
    NEW.stock_status := 'in-stock';
  END IF;

  -- Compute profit margin percentage
  IF NEW.purchase_price > 0 THEN
    NEW.profit_margin_pct := ((NEW.selling_price - NEW.purchase_price) / NEW.purchase_price) * 100;
  ELSE
    NEW.profit_margin_pct := NULL;
  END IF;

  -- Update timestamp
  NEW.updated_at := NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- STEP 3: Recreate the trigger
-- ============================================================================

DROP TRIGGER IF EXISTS compute_parts_metrics ON public.parts;
CREATE TRIGGER compute_parts_metrics
  BEFORE INSERT OR UPDATE ON public.parts
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_part_metrics();

-- ============================================================================
-- STEP 4: Recalculate stock_status for all existing parts
-- ============================================================================

-- Update all parts to use the correct stock status calculation
UPDATE public.parts
SET
  stock_status = CASE
    WHEN (COALESCE(on_hand_stock, 0) + COALESCE(warehouse_stock, 0)) = 0 THEN 'out-of-stock'
    WHEN (COALESCE(on_hand_stock, 0) + COALESCE(warehouse_stock, 0)) <= COALESCE(low_stock_threshold, 0) THEN 'low-stock'
    ELSE 'in-stock'
  END,
  updated_at = NOW()
WHERE true;  -- Apply to all rows

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count parts by stock status
SELECT
  stock_status,
  COUNT(*) as count,
  SUM(on_hand_stock + warehouse_stock) as total_stock
FROM public.parts
GROUP BY stock_status
ORDER BY stock_status;

-- Show sample of parts with their stock calculation
SELECT
  part_name,
  part_number,
  on_hand_stock,
  warehouse_stock,
  on_hand_stock + warehouse_stock as total_stock,
  low_stock_threshold,
  stock_status
FROM public.parts
ORDER BY stock_status, part_name
LIMIT 20;

-- ============================================================================
-- ROLLBACK INSTRUCTIONS (if needed)
-- ============================================================================

-- If you need to rollback this migration, run:
--
-- DROP FUNCTION IF EXISTS public.compute_part_metrics() CASCADE;
--
-- CREATE OR REPLACE FUNCTION public.compute_part_metrics()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   IF NEW.on_hand_stock = 0 THEN
--     NEW.stock_status := 'out-of-stock';
--   ELSIF NEW.on_hand_stock <= NEW.low_stock_threshold THEN
--     NEW.stock_status := 'low-stock';
--   ELSE
--     NEW.stock_status := 'in-stock';
--   END IF;
--
--   IF NEW.purchase_price > 0 THEN
--     NEW.profit_margin_pct := ((NEW.selling_price - NEW.purchase_price) / NEW.purchase_price) * 100;
--   ELSE
--     NEW.profit_margin_pct := NULL;
--   END IF;
--
--   NEW.updated_at := NOW();
--
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- DROP TRIGGER IF EXISTS compute_parts_metrics ON public.parts;
-- CREATE TRIGGER compute_parts_metrics
--   BEFORE INSERT OR UPDATE ON public.parts
--   FOR EACH ROW
--   EXECUTE FUNCTION public.compute_part_metrics();
--
-- Then manually update stock_status values if needed.
-- ============================================================================
