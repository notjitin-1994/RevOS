-- ============================================================================
-- FIX: Add missing columns to parts_transactions table
-- ============================================================================
-- Run this SQL in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/YOUR_PROJECT_ID/sql/new
--
-- This fixes the error:
-- "Could not find the 'total_price' column of 'parts_transactions'"
-- ============================================================================

-- Add missing columns
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

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_parts_transactions_garage_id
  ON public.parts_transactions(garage_id);

CREATE INDEX IF NOT EXISTS idx_parts_transactions_transaction_date
  ON public.parts_transactions(transaction_date DESC);

CREATE INDEX IF NOT EXISTS idx_parts_transactions_supplier_id
  ON public.parts_transactions(supplier_id);

-- Update RLS policies
DROP POLICY IF EXISTS "Allow read transactions from own garage" ON public.parts_transactions;
DROP POLICY IF EXISTS "Allow insert transactions for own garage" ON public.parts_transactions;

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

-- Verify the columns were added
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'parts_transactions'
ORDER BY ordinal_position;
