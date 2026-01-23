-- ============================================================================
-- ENHANCE PARTS_TRANSACTIONS TABLE FOR JOB CARD INTEGRATION
-- ============================================================================
-- This migration enhances the existing parts_transactions table to support
-- comprehensive job card integration and audit trail functionality.
--
-- The existing parts_transactions table was created in 10_create_parts_table.sql
-- This migration adds columns needed for job card allocation tracking.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Add new columns to parts_transactions table for job card integration
-- ----------------------------------------------------------------------------

-- Job card references (all nullable since not all transactions are job-related)
ALTER TABLE public.parts_transactions
  ADD COLUMN IF NOT EXISTS job_card_id UUID,
  ADD COLUMN IF NOT EXISTS job_card_part_id UUID,
  ADD COLUMN IF NOT EXISTS performed_by UUID,
  ADD COLUMN IF NOT EXISTS performed_by_name VARCHAR(255);

-- Additional transaction types for job card workflow
ALTER TABLE public.parts_transactions
  DROP CONSTRAINT IF EXISTS parts_transactions_transaction_type_check;

-- Note: The check constraint will be recreated with expanded values

-- ----------------------------------------------------------------------------
-- Add comments for documentation
-- ----------------------------------------------------------------------------

COMMENT ON COLUMN public.parts_transactions.job_card_id IS 'Reference to job_cards table (NULL for non-job transactions)';
COMMENT ON COLUMN public.parts_transactions.job_card_part_id IS 'Reference to specific line item in job_card_parts';
COMMENT ON COLUMN public.parts_transactions.performed_by IS 'User ID who performed this transaction';
COMMENT ON COLUMN public.parts_transactions.performed_by_name IS 'User name (denormalized for audit history)';

-- ----------------------------------------------------------------------------
-- Create index for performance
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_parts_transactions_job_card_id
  ON public.parts_transactions(job_card_id);

CREATE INDEX IF NOT EXISTS idx_parts_transactions_job_card_part_id
  ON public.parts_transactions(job_card_part_id);

CREATE INDEX IF NOT EXISTS idx_parts_transactions_performed_by
  ON public.parts_transactions(performed_by);

-- Composite index for common job card queries
CREATE INDEX IF NOT EXISTS idx_parts_transactions_job_card_date
  ON public.parts_transactions(job_card_id, created_at DESC);

-- ----------------------------------------------------------------------------
-- Create helper function to record job card part transaction
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.record_job_card_part_transaction(
  p_part_id UUID,
  p_garage_id UUID,
  p_transaction_type VARCHAR,
  p_quantity INTEGER,
  p_stock_before INTEGER,
  p_stock_after INTEGER,
  p_unit_cost DECIMAL DEFAULT NULL,
  p_job_card_id UUID DEFAULT NULL,
  p_job_card_part_id UUID DEFAULT NULL,
  p_location_from VARCHAR DEFAULT NULL,
  p_location_to VARCHAR DEFAULT NULL,
  p_reference_type VARCHAR DEFAULT NULL,
  p_reference_id UUID DEFAULT NULL,
  p_reference_number VARCHAR DEFAULT NULL,
  p_performed_by UUID DEFAULT NULL,
  p_performed_by_name VARCHAR DEFAULT NULL,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_transaction_id UUID;
  v_total_cost DECIMAL;
  v_supplier_id UUID;
  v_supplier_name VARCHAR;
BEGIN
  -- Calculate total cost
  v_total_cost := ABS(p_quantity) * COALESCE(p_unit_cost, 0);

  -- Get supplier info if available
  SELECT primary_supplier_id, supplier
  INTO v_supplier_id, v_supplier_name
  FROM public.parts
  WHERE id = p_part_id;

  -- Insert transaction record
  INSERT INTO public.parts_transactions (
    part_id,
    garage_id,
    transaction_type,
    quantity,
    unit_price,
    total_value,
    stock_before,
    stock_after,
    location_from,
    location_to,
    reference_type,
    reference_id,
    reference_number,
    supplier_id,
    supplier_name,
    job_card_id,
    job_card_part_id,
    performed_by,
    performed_by_name,
    notes
  ) VALUES (
    p_part_id,
    p_garage_id,
    p_transaction_type,
    p_quantity,
    p_unit_cost,
    v_total_cost,
    p_stock_before,
    p_stock_after,
    p_location_from,
    p_location_to,
    p_reference_type,
    p_reference_id,
    p_reference_number,
    v_supplier_id,
    v_supplier_name,
    p_job_card_id,
    p_job_card_part_id,
    p_performed_by,
    p_performed_by_name,
    p_notes
  ) RETURNING id INTO v_transaction_id;

  RETURN v_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Create function to get transaction history for a job card
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_job_card_transaction_history(p_job_card_id UUID)
RETURNS TABLE (
  transaction_date TIMESTAMPTZ,
  transaction_type VARCHAR,
  part_name VARCHAR,
  part_number VARCHAR,
  quantity INTEGER,
  unit_price DECIMAL,
  total_value DECIMAL,
  performed_by_name VARCHAR,
  notes TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pt.created_at,
    pt.transaction_type,
    p.part_name,
    p.part_number,
    pt.quantity,
    pt.unit_price,
    pt.total_value,
    pt.performed_by_name,
    pt.notes
  FROM public.parts_transactions pt
  LEFT JOIN public.parts p ON pt.part_id = p.id
  WHERE pt.job_card_id = p_job_card_id
  ORDER BY pt.created_at ASC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ----------------------------------------------------------------------------
-- Update RLS policies to include job card access
-- ----------------------------------------------------------------------------

-- Drop existing policies
DROP POLICY IF EXISTS "Allow read transactions from own garage" ON public.parts_transactions;
DROP POLICY IF EXISTS "Allow insert transactions for own garage" ON public.parts_transactions;
DROP POLICY IF EXISTS "Allow service role full access on transactions" ON public.parts_transactions;

-- Create updated policies
CREATE POLICY "Allow read transactions from own garage"
  ON public.parts_transactions
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
    OR job_card_id IN (
      SELECT id FROM public.job_cards
      WHERE garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
    )
  );

CREATE POLICY "Allow insert transactions for own garage"
  ON public.parts_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on transactions"
  ON public.parts_transactions
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Success notification
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE 'parts_transactions table enhanced successfully with job card integration columns';
END $$;
