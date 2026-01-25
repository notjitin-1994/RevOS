-- ============================================================================
-- ADD MISSING COLUMNS TO PARTS_TRANSACTIONS TABLE
-- ============================================================================
-- Created: 2026-01-25
-- Description: Adds columns that are referenced in the code but missing from schema
--
-- This migration fixes the error:
-- "Could not find the 'total_price' column of 'parts_transactions' in the schema cache"
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Add missing columns to parts_transactions table
-- ----------------------------------------------------------------------------

ALTER TABLE public.parts_transactions
  ADD COLUMN IF NOT EXISTS garage_id UUID,
  ADD COLUMN IF NOT EXISTS unit_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS total_price DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS total_value DECIMAL(10, 2),
  ADD COLUMN IF NOT EXISTS stock_before INTEGER,
  ADD COLUMN IF NOT EXISTS stock_after INTEGER,
  ADD COLUMN IF NOT EXISTS location_from VARCHAR(50),
  ADD COLUMN IF NOT EXISTS location_to VARCHAR(50),
  ADD COLUMN IF NOT EXISTS reference_type VARCHAR(50),
  ADD COLUMN IF NOT EXISTS reference_id UUID,
  ADD COLUMN IF NOT EXISTS reference_number VARCHAR(100),
  ADD COLUMN IF NOT EXISTS supplier_id UUID,
  ADD COLUMN IF NOT EXISTS supplier_name VARCHAR(255),
  ADD COLUMN IF NOT EXISTS transaction_date TIMESTAMP WITH TIME ZONE;

-- ----------------------------------------------------------------------------
-- Add indexes for performance
-- ----------------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_parts_transactions_garage_id
  ON public.parts_transactions(garage_id);

CREATE INDEX IF NOT EXISTS idx_parts_transactions_transaction_date
  ON public.parts_transactions(transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_parts_transactions_supplier_id
  ON public.parts_transactions(supplier_id);

-- ----------------------------------------------------------------------------
-- Add comments for documentation
-- ----------------------------------------------------------------------------

COMMENT ON COLUMN public.parts_transactions.garage_id IS 'Garage ID for multi-tenant support';
COMMENT ON COLUMN public.parts_transactions.unit_price IS 'Unit price of the part at transaction time';
COMMENT ON COLUMN public.parts_transactions.total_price IS 'Total price (quantity × unit_price)';
COMMENT ON COLUMN public.parts_transactions.total_value IS 'Total value (alias for total_price)';
COMMENT ON COLUMN public.parts_transactions.stock_before IS 'Stock quantity before transaction';
COMMENT ON COLUMN public.parts_transactions.stock_after IS 'Stock quantity after transaction';
COMMENT ON COLUMN public.parts_transactions.location_from IS 'Source location (on_hand, warehouse, etc.)';
COMMENT ON COLUMN public.parts_transactions.location_to IS 'Destination location';
COMMENT ON COLUMN public.parts_transactions.reference_type IS 'Type of reference (job_card, purchase_order, etc.)';
COMMENT ON COLUMN public.parts_transactions.reference_id IS 'ID of the referenced record';
COMMENT ON COLUMN public.parts_transactions.reference_number IS 'Human-readable reference number';
COMMENT ON COLUMN public.parts_transactions.supplier_id IS 'Supplier/vender ID';
COMMENT ON COLUMN public.parts_transactions.supplier_name IS 'Supplier name (denormalized)';
COMMENT ON COLUMN public.parts_transactions.transaction_date IS 'When the transaction occurred';

-- ----------------------------------------------------------------------------
-- Update RLS policies to include new columns
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
  USING (garage_id IN (SELECT garage_id FROM user_garages WHERE user_id = auth.uid()));

CREATE POLICY "Allow insert transactions for own garage"
  ON public.parts_transactions
  FOR INSERT
  TO authenticated
  WITH CHECK (garage_id IN (SELECT garage_id FROM user_garages WHERE user_id = auth.uid()));

CREATE POLICY "Allow service role full access on transactions"
  ON public.parts_transactions
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ----------------------------------------------------------------------------
-- Grant necessary permissions
-- ----------------------------------------------------------------------------

GRANT USAGE ON SCHEMA public TO service_role, authenticated;
GRANT ALL ON public.parts_transactions TO service_role;
GRANT SELECT, INSERT, UPDATE ON public.parts_transactions TO authenticated;
