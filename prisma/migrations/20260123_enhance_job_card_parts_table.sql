-- ============================================================================
-- ENHANCE JOB_CARD_PARTS TABLE - INDUSTRY-STANDARD COST TRACKING
-- ============================================================================
-- This migration adds comprehensive cost tracking columns to the job_card_parts
-- table to support industry-standard automotive repair shop operations.
--
-- Features:
-- - Estimated vs Actual price tracking
-- - Price variance calculation
-- - Price override tracking with reason codes
-- - Core charge and credit tracking
-- - Disposal fee tracking
-- - Comprehensive audit capabilities
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Add new columns to job_card_parts table
-- ----------------------------------------------------------------------------

-- Price tracking columns
ALTER TABLE public.job_card_parts
  ADD COLUMN IF NOT EXISTS estimated_unit_price DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS actual_unit_price DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_variance DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_price_override BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS price_override_reason TEXT;

-- Core charge tracking (for rebuildable parts like alternators, starters)
ALTER TABLE public.job_card_parts
  ADD COLUMN IF NOT EXISTS core_charge_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS core_credit_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_core_charge BOOLEAN DEFAULT FALSE;

-- Disposal fee tracking (for oil, tires, hazardous materials)
ALTER TABLE public.job_card_parts
  ADD COLUMN IF NOT EXISTS disposal_fee_amount DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS has_disposal_fee BOOLEAN DEFAULT FALSE;

-- Additional part details (denormalized from parts table for history)
ALTER TABLE public.job_card_parts
  ADD COLUMN IF NOT EXISTS manufacturer VARCHAR(150),
  ADD COLUMN IF NOT EXISTS category VARCHAR(100);

-- Source tracking with more detail
ALTER TABLE public.job_card_parts
  ADD COLUMN IF NOT EXISTS source VARCHAR(50) DEFAULT 'inventory'
    CHECK (source IN ('inventory', 'customer', 'external', 'ordered'));

-- User tracking
ALTER TABLE public.job_card_parts
  ADD COLUMN IF NOT EXISTS requested_by UUID,
  ADD COLUMN IF NOT EXISTS used_by UUID;

-- ----------------------------------------------------------------------------
-- Add comments for documentation
-- ----------------------------------------------------------------------------

COMMENT ON COLUMN public.job_card_parts.estimated_unit_price IS 'Price quoted to customer at time of allocation';
COMMENT ON COLUMN public.job_card_parts.actual_unit_price IS 'Actual price paid when part was sourced/used';
COMMENT ON COLUMN public.job_card_parts.price_variance IS 'Difference between actual and estimated price (actual - estimated)';
COMMENT ON COLUMN public.job_card_parts.is_price_override IS 'Flag indicating if price was manually overridden';
COMMENT ON COLUMN public.job_card_parts.price_override_reason IS 'Reason for price override (e.g., emergency, customer negotiation)';
COMMENT ON COLUMN public.job_card_parts.core_charge_amount IS 'Charge applied when part has rebuildable core';
COMMENT ON COLUMN public.job_card_parts.core_credit_amount IS 'Credit given when core is returned to supplier';
COMMENT ON COLUMN public.job_card_parts.has_core_charge IS 'Flag indicating if part has core charge';
COMMENT ON COLUMN public.job_card_parts.disposal_fee_amount IS 'Fee for proper disposal of part/material';
COMMENT ON COLUMN public.job_card_parts.has_disposal_fee IS 'Flag indicating if disposal fee applies';
COMMENT ON COLUMN public.job_card_parts.manufacturer IS 'Part manufacturer/brand (denormalized)';
COMMENT ON COLUMN public.job_card_parts.category IS 'Part category (denormalized)';
COMMENT ON COLUMN public.job_card_parts.source IS 'Part source: inventory (in-stock), customer (customer-supplied), external (special order), ordered (awaiting delivery)';
COMMENT ON COLUMN public.job_card_parts.requested_by IS 'User who requested/allocated the part';
COMMENT ON COLUMN public.job_card_parts.used_by IS 'User who actually installed/used the part';

-- ----------------------------------------------------------------------------
-- Create index for performance
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_job_card_parts_job_card_status
  ON public.job_card_parts(job_card_id, status);

CREATE INDEX IF NOT EXISTS idx_job_card_parts_requested_by
  ON public.job_card_parts(requested_by);

-- ----------------------------------------------------------------------------
-- Create trigger for automatic price variance calculation
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_part_price_variance()
RETURNS TRIGGER AS $$
BEGIN
  -- Calculate price variance when actual_unit_price is set
  IF NEW.actual_unit_price IS NOT NULL AND NEW.actual_unit_price != 0 THEN
    NEW.price_variance := NEW.actual_unit_price - COALESCE(NEW.estimated_unit_price, 0);
  END IF;

  -- Auto-set has_core_charge flag
  NEW.has_core_charge := COALESCE(NEW.core_charge_amount, 0) > 0;

  -- Auto-set has_disposal_fee flag
  NEW.has_disposal_fee := COALESCE(NEW.disposal_fee_amount, 0) > 0;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_calculate_part_price_variance ON public.job_card_parts;
CREATE TRIGGER trigger_calculate_part_price_variance
  BEFORE INSERT OR UPDATE ON public.job_card_parts
  FOR EACH ROW
  EXECUTE FUNCTION public.calculate_part_price_variance();

-- ----------------------------------------------------------------------------
-- Create helper function to get parts with cost details
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_job_card_parts_with_costs(p_job_card_id UUID)
RETURNS TABLE (
  part_id UUID,
  part_name VARCHAR,
  part_number VARCHAR,
  manufacturer VARCHAR,
  category VARCHAR,
  status VARCHAR,
  quantity_requested INTEGER,
  quantity_used INTEGER,
  quantity_returned INTEGER,
  estimated_unit_price DECIMAL,
  actual_unit_price DECIMAL,
  price_variance DECIMAL,
  total_estimated_cost DECIMAL,
  total_actual_cost DECIMAL,
  core_charge_amount DECIMAL,
  core_credit_amount DECIMAL,
  disposal_fee_amount DECIMAL,
  total_cost DECIMAL,
  source VARCHAR,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    jcp.part_id,
    jcp.part_name,
    jcp.part_number,
    jcp.manufacturer,
    jcp.category,
    jcp.status,
    jcp.quantity_requested,
    jcp.quantity_used,
    jcp.quantity_returned,
    jcp.estimated_unit_price,
    jcp.actual_unit_price,
    jcp.price_variance,
    -- Calculate total estimated cost
    (jcp.quantity_requested * jcp.estimated_unit_price),
    -- Calculate total actual cost
    (COALESCE(jcp.quantity_used, jcp.quantity_requested) * COALESCE(jcp.actual_unit_price, jcp.estimated_unit_price)),
    jcp.core_charge_amount,
    jcp.core_credit_amount,
    jcp.disposal_fee_amount,
    -- Calculate total cost including all fees
    (COALESCE(jcp.quantity_used, jcp.quantity_requested) * COALESCE(jcp.actual_unit_price, jcp.estimated_unit_price)) +
    COALESCE(jcp.core_charge_amount, 0) - COALESCE(jcp.core_credit_amount, 0) +
    COALESCE(jcp.disposal_fee_amount, 0),
    jcp.source,
    jcp.notes
  FROM public.job_card_parts jcp
  WHERE jcp.job_card_id = p_job_card_id
  ORDER BY jcp.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Success notification
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE 'job_card_parts table enhanced successfully with industry-standard cost tracking columns';
END $$;
