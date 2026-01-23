-- Migration: Add parts_communications and parts_transactions tables
-- Created: 2026-01-22
-- Description: Adds tables for tracking vendor communications and inventory transactions

-- Create parts_communications table
CREATE TABLE IF NOT EXISTS public.parts_communications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  vendor_name TEXT NOT NULL,
  communication_type TEXT NOT NULL CHECK (communication_type IN ('phone', 'email')),
  outcome TEXT NOT NULL CHECK (outcome IN ('order-placed', 'price-quote', 'follow-up-required', 'no-answer', 'other')),
  quantity_ordered INTEGER,
  expected_delivery_date DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_parts_communications_part_id ON public.parts_communications(part_id);
CREATE INDEX IF NOT EXISTS idx_parts_communications_created_at ON public.parts_communications(created_at DESC);

-- Create parts_transactions table (if it doesn't exist)
CREATE TABLE IF NOT EXISTS public.parts_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  part_id UUID NOT NULL REFERENCES public.parts(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'sale', 'adjustment', 'return')),
  quantity INTEGER NOT NULL,
  vendor_name TEXT,
  notes TEXT,
  communication_id UUID REFERENCES public.parts_communications(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_parts_transactions_part_id ON public.parts_transactions(part_id);
CREATE INDEX IF NOT EXISTS idx_parts_transactions_created_at ON public.parts_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parts_transactions_communication_id ON public.parts_transactions(communication_id);

-- Add updated_at trigger to parts_communications
CREATE OR REPLACE FUNCTION update_parts_communications_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_parts_communications_updated_at ON public.parts_communications;
CREATE TRIGGER update_parts_communications_updated_at
  BEFORE UPDATE ON public.parts_communications
  FOR EACH ROW
  EXECUTE FUNCTION update_parts_communications_updated_at();

-- Add comments for documentation
COMMENT ON TABLE public.parts_communications IS 'Tracks all vendor communications related to parts';
COMMENT ON TABLE public.parts_transactions IS 'Tracks inventory transactions (purchases, sales, adjustments, returns)';

COMMENT ON COLUMN public.parts_communications.communication_type IS 'Type of communication: phone or email';
COMMENT ON COLUMN public.parts_communications.outcome IS 'Result of the communication';
COMMENT ON COLUMN public.parts_transactions.transaction_type IS 'Type of transaction: purchase, sale, adjustment, or return';
