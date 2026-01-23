-- ============================================================================
-- COMPREHENSIVE PARTS INVENTORY SYSTEM
-- ============================================================================
-- This schema creates a complete parts inventory management system with:
-- 1. SUPPLIERS table - Centralized supplier management
-- 2. PARTS table - Multi-level duplication checking
-- 3. PARTS_FITMENT table - Vehicle compatibility tracking
-- 4. PARTS_BACKUP_SUPPLIERS table - Alternative suppliers
-- 5. PARTS_TRANSACTIONS table - Stock movement history
-- 6. PARTS_CATEGORIES table - Dynamic category management
-- 7. Row Level Security (RLS) for garage isolation
-- ============================================================================

-- ============================================================================
-- SUPPLIERS TABLE
-- ============================================================================
-- Centralized supplier/vendor management across all parts

CREATE TABLE IF NOT EXISTS public.parts_suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,

  -- Basic Information
  supplier_name VARCHAR(255) NOT NULL,
  supplier_code VARCHAR(50),               -- Internal supplier code (e.g., SUP-001)

  -- Contact Information
  contact_person VARCHAR(255),
  phone VARCHAR(50),
  alternate_phone VARCHAR(50),
  email VARCHAR(255),
  website VARCHAR(500),

  -- Address Information
  address TEXT,
  city VARCHAR(100),
  state VARCHAR(100),
  zip_code VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',

  -- Business Details
  gstin VARCHAR(50),                       -- GST Identification Number (India)
  pan_number VARCHAR(20),                  -- Permanent Account Number (India)
  tan_number VARCHAR(20),                  -- Tax Deduction Account Number

  -- Payment Terms
  payment_terms VARCHAR(100),              -- e.g., "Net 30", "COD", "Advance"
  credit_limit DECIMAL(12, 2) DEFAULT 0,
  credit_days INTEGER DEFAULT 0,

  -- Performance Tracking
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  is_active BOOLEAN DEFAULT true,
  is_preferred BOOLEAN DEFAULT false,      -- Mark as preferred supplier

  -- Notes and Metadata
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign key constraint
  -- Foreign key to garages table (enforced via application/RLS),

  -- Constraints
  CONSTRAINT parts_suppliers_garage_code_unique UNIQUE (garage_id, supplier_code)
);

-- ============================================================================
-- PARTS CATEGORIES TABLE
-- ============================================================================
-- Dynamic category management with usage tracking

CREATE TABLE IF NOT EXISTS public.parts_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,

  category_name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_category_id UUID,                 -- For hierarchical categories

  -- Usage tracking
  usage_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,

  -- Display order
  display_order INTEGER DEFAULT 0,

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign keys
  -- Foreign key to garages table (enforced via application/RLS),
  FOREIGN KEY (parent_category_id) REFERENCES public.parts_categories(id) ON DELETE SET NULL,

  -- Constraints
  CONSTRAINT parts_categories_garage_name_unique UNIQUE (garage_id, category_name)
);

-- ============================================================================
-- PARTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,

  -- ========================================================================
  -- TAB 1: BASIC INFORMATION
  -- ========================================================================
  part_number VARCHAR(100) NOT NULL,
  part_name VARCHAR(255) NOT NULL,

  -- References to categories table
  category_id UUID,
  category VARCHAR(100) NOT NULL,          -- Denormalized for performance

  make VARCHAR(150),                       -- Part manufacturer/brand
  model VARCHAR(150),                      -- Part model/type

  -- References to categories table for "used for"
  used_for_category_id UUID,
  used_for VARCHAR(100) NOT NULL,          -- Denormalized: Engine, Brakes, Body, etc.

  description TEXT,

  -- ========================================================================
  -- TAB 2: STOCK INFORMATION
  -- ========================================================================
  on_hand_stock INTEGER NOT NULL DEFAULT 0 CHECK (on_hand_stock >= 0),
  warehouse_stock INTEGER NOT NULL DEFAULT 0 CHECK (warehouse_stock >= 0),
  low_stock_threshold INTEGER NOT NULL DEFAULT 5 CHECK (low_stock_threshold >= 0),

  -- Stock status (computed, but stored for performance)
  stock_status VARCHAR(20) DEFAULT 'in-stock' CHECK (stock_status IN ('in-stock', 'low-stock', 'out-of-stock')),

  -- ========================================================================
  -- TAB 3: PRICING
  -- ========================================================================
  purchase_price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (purchase_price >= 0),
  selling_price DECIMAL(12, 2) NOT NULL DEFAULT 0 CHECK (selling_price >= 0),
  wholesale_price DECIMAL(12, 2) CHECK (wholesale_price >= 0),
  core_charge DECIMAL(12, 2) DEFAULT 0 CHECK (core_charge >= 0),

  -- Profit margin (computed, stored for queries)
  profit_margin_pct DECIMAL(5, 2) CHECK (profit_margin_pct >= -100 AND profit_margin_pct <= 1000),

  -- ========================================================================
  -- TAB 4: VEHICLE FITMENT (stored in parts_fitment junction table)
  -- ========================================================================

  -- ========================================================================
  -- TAB 5: VENDOR INFORMATION
  -- ========================================================================
  -- Reference to suppliers table
  primary_supplier_id UUID,

  -- Denormalized supplier info for performance (can be updated via trigger)
  supplier VARCHAR(255),                   -- Primary supplier name (denormalized)
  supplier_phone VARCHAR(50),
  supplier_email VARCHAR(255),
  supplier_website VARCHAR(500),

  vendor_sku VARCHAR(150),
  lead_time_days INTEGER DEFAULT 0 CHECK (lead_time_days >= 0),
  minimum_order_quantity INTEGER DEFAULT 0 CHECK (minimum_order_quantity >= 0),
  location VARCHAR(100),                   -- Storage location in warehouse

  -- ========================================================================
  -- TAB 6: LIFECYCLE & TRACKING
  -- ========================================================================
  batch_number VARCHAR(100),
  expiration_date DATE,
  warranty_months INTEGER DEFAULT 0 CHECK (warranty_months >= 0),
  country_of_origin VARCHAR(100),

  -- ========================================================================
  -- TAB 7: TECHNICAL / IDENTIFICATION
  -- ========================================================================
  sku VARCHAR(150),                        -- Internal SKU
  oem_part_number VARCHAR(150),            -- OEM part number
  technical_diagram_url VARCHAR(1000),
  installation_instructions_url VARCHAR(1000),

  -- ========================================================================
  -- PHYSICAL ATTRIBUTES
  -- ========================================================================
  weight VARCHAR(50),
  length VARCHAR(50),
  width VARCHAR(50),
  height VARCHAR(50),
  quantity_per_package INTEGER DEFAULT 1 CHECK (quantity_per_package > 0),
  is_hazardous BOOLEAN DEFAULT false,

  -- ========================================================================
  -- METADATA
  -- ========================================================================
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- ========================================================================
  -- MULTI-LEVEL DUPLICATION CHECKS (UNIQUE CONSTRAINTS)
  -- ========================================================================
  CONSTRAINT parts_part_number_garage_unique UNIQUE (garage_id, part_number),
  CONSTRAINT parts_sku_garage_unique UNIQUE (garage_id, sku) DEFERRABLE INITIALLY DEFERRED,
  CONSTRAINT parts_oem_part_number_garage_unique UNIQUE (garage_id, oem_part_number) DEFERRABLE INITIALLY DEFERRED,

  -- Foreign key constraints
  -- Foreign key to garages table (enforced via application/RLS),
  FOREIGN KEY (primary_supplier_id) REFERENCES public.parts_suppliers(id) ON DELETE SET NULL,
  FOREIGN KEY (category_id) REFERENCES public.parts_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (used_for_category_id) REFERENCES public.parts_categories(id) ON DELETE SET NULL
);

-- ============================================================================
-- PARTS FITMENT JUNCTION TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.parts_fitment (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id UUID NOT NULL,
  motorcycle_id UUID NOT NULL,
  garage_id UUID NOT NULL,

  -- Fitment notes (e.g., "Only 2022+ models with ABS")
  fitment_notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign keys
  FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE,
  FOREIGN KEY (motorcycle_id) REFERENCES public.motorcycles(id) ON DELETE CASCADE,
  -- Foreign key to garages table (enforced via application/RLS),

  -- Prevent duplicate fitment entries
  UNIQUE(part_id, motorcycle_id)
);

-- ============================================================================
-- PARTS BACKUP SUPPLIERS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.parts_backup_suppliers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id UUID NOT NULL,
  garage_id UUID NOT NULL,

  -- Reference to suppliers table
  supplier_id UUID,                        -- Optional: Reference to parts_suppliers

  -- Supplier Information (can be denormalized or reference suppliers table)
  supplier_name VARCHAR(255) NOT NULL,
  supplier_phone VARCHAR(50),
  supplier_email VARCHAR(255),
  supplier_website VARCHAR(500),
  vendor_sku VARCHAR(150),
  lead_time_days INTEGER DEFAULT 0 CHECK (lead_time_days >= 0),
  minimum_order_quantity INTEGER DEFAULT 0 CHECK (minimum_order_quantity >= 0),

  is_preferred BOOLEAN DEFAULT false,      -- Mark as preferred backup

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign keys
  FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE,
  -- Foreign key to garages table (enforced via application/RLS),
  FOREIGN KEY (supplier_id) REFERENCES public.parts_suppliers(id) ON DELETE SET NULL
);

-- ============================================================================
-- PARTS TRANSACTIONS TABLE
-- ============================================================================
-- Track all stock movements (additions, removals, adjustments, transfers)

CREATE TABLE IF NOT EXISTS public.parts_transactions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  part_id UUID NOT NULL,
  garage_id UUID NOT NULL,

  -- Transaction Details
  transaction_type VARCHAR(50) NOT NULL CHECK (transaction_type IN (
    'purchase',           -- Stock purchase from supplier
    'sale',               -- Sold to customer
    'return',             -- Returned from customer
    'adjustment',         -- Manual adjustment
    'transfer_in',        -- Transfer from warehouse to workshop
    'transfer_out',       -- Transfer from workshop to warehouse
    'damage',             -- Damaged/lost stock
    'expired',            -- Expired items
    'build',              -- Built from other parts
    'disassembly'         -- Disassembled into parts
  )),

  quantity INTEGER NOT NULL,               -- Positive for additions, negative for removals

  -- Stock before and after (for audit trail)
  stock_before INTEGER NOT NULL,
  stock_after INTEGER NOT NULL,

  -- Location change tracking
  location_from VARCHAR(100),              -- e.g., 'warehouse', 'workshop', 'A1-01'
  location_to VARCHAR(100),

  -- Reference Information
  reference_type VARCHAR(50),              -- e.g., 'purchase_order', 'job_card', 'adjustment'
  reference_id UUID,                       -- ID of the related record
  reference_number VARCHAR(100),           -- Human-readable reference

  -- Supplier/Order Information (for purchases)
  supplier_id UUID,                        -- Reference to parts_suppliers
  supplier_name VARCHAR(255),

  -- Financial Information
  unit_price DECIMAL(12, 2),               -- Price per unit for this transaction
  total_value DECIMAL(12, 2),              -- Total value (quantity * unit_price)

  -- Notes and Metadata
  notes TEXT,
  performed_by UUID,                       -- User who performed the transaction
  performed_by_name VARCHAR(255),          -- Denormalized for history

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign keys
  FOREIGN KEY (part_id) REFERENCES public.parts(id) ON DELETE CASCADE,
  -- Foreign key to garages table (enforced via application/RLS),
  FOREIGN KEY (supplier_id) REFERENCES public.parts_suppliers(id) ON DELETE SET NULL
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Parts suppliers indexes
CREATE INDEX IF NOT EXISTS idx_parts_suppliers_garage_id ON public.parts_suppliers(garage_id);
CREATE INDEX IF NOT EXISTS idx_parts_suppliers_is_active ON public.parts_suppliers(is_active);
CREATE INDEX IF NOT EXISTS idx_parts_suppliers_is_preferred ON public.parts_suppliers(is_preferred);
CREATE INDEX IF NOT EXISTS idx_parts_suppliers_supplier_code ON public.parts_suppliers(supplier_code);
CREATE INDEX IF NOT EXISTS idx_parts_suppliers_garage_active ON public.parts_suppliers(garage_id, is_active);

-- Parts categories indexes
CREATE INDEX IF NOT EXISTS idx_parts_categories_garage_id ON public.parts_categories(garage_id);
CREATE INDEX IF NOT EXISTS idx_parts_categories_parent_id ON public.parts_categories(parent_category_id);
CREATE INDEX IF NOT EXISTS idx_parts_categories_is_active ON public.parts_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_parts_categories_usage_count ON public.parts_categories(usage_count DESC);

-- Parts table indexes
CREATE INDEX IF NOT EXISTS idx_parts_garage_id ON public.parts(garage_id);
CREATE INDEX IF NOT EXISTS idx_parts_part_number ON public.parts(part_number);
CREATE INDEX IF NOT EXISTS idx_parts_sku ON public.parts(sku) WHERE sku IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parts_oem_part_number ON public.parts(oem_part_number) WHERE oem_part_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_parts_category_id ON public.parts(category_id);
CREATE INDEX IF NOT EXISTS idx_parts_category ON public.parts(category);
CREATE INDEX IF NOT EXISTS idx_parts_used_for ON public.parts(used_for);
CREATE INDEX IF NOT EXISTS idx_parts_make_model ON public.parts(make, model);
CREATE INDEX IF NOT EXISTS idx_parts_primary_supplier_id ON public.parts(primary_supplier_id);
CREATE INDEX IF NOT EXISTS idx_parts_supplier ON public.parts(supplier);
CREATE INDEX IF NOT EXISTS idx_parts_stock_status ON public.parts(stock_status);
CREATE INDEX IF NOT EXISTS idx_parts_status ON public.parts(status);
CREATE INDEX IF NOT EXISTS idx_parts_garage_status ON public.parts(garage_id, status);
CREATE INDEX IF NOT EXISTS idx_parts_garage_category ON public.parts(garage_id, category);
CREATE INDEX IF NOT EXISTS idx_parts_composite_search ON public.parts(garage_id, part_name, category, status);

-- Parts fitment indexes
CREATE INDEX IF NOT EXISTS idx_parts_fitment_part_id ON public.parts_fitment(part_id);
CREATE INDEX IF NOT EXISTS idx_parts_fitment_motorcycle_id ON public.parts_fitment(motorcycle_id);
CREATE INDEX IF NOT EXISTS idx_parts_fitment_garage_id ON public.parts_fitment(garage_id);
CREATE INDEX IF NOT EXISTS idx_parts_fitment_composite ON public.parts_fitment(motorcycle_id, garage_id);

-- Parts backup suppliers indexes
CREATE INDEX IF NOT EXISTS idx_parts_backup_suppliers_part_id ON public.parts_backup_suppliers(part_id);
CREATE INDEX IF NOT EXISTS idx_parts_backup_suppliers_garage_id ON public.parts_backup_suppliers(garage_id);
CREATE INDEX IF NOT EXISTS idx_parts_backup_suppliers_supplier_id ON public.parts_backup_suppliers(supplier_id);

-- Parts transactions indexes
CREATE INDEX IF NOT EXISTS idx_parts_transactions_part_id ON public.parts_transactions(part_id);
CREATE INDEX IF NOT EXISTS idx_parts_transactions_garage_id ON public.parts_transactions(garage_id);
CREATE INDEX IF NOT EXISTS idx_parts_transactions_transaction_type ON public.parts_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_parts_transactions_created_at ON public.parts_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_parts_transactions_reference ON public.parts_transactions(reference_type, reference_id);
CREATE INDEX IF NOT EXISTS idx_parts_transactions_supplier_id ON public.parts_transactions(supplier_id);
CREATE INDEX IF NOT EXISTS idx_parts_transactions_performed_by ON public.parts_transactions(performed_by);

-- Composite index for common queries
CREATE INDEX IF NOT EXISTS idx_parts_transactions_part_type_date ON public.parts_transactions(part_id, transaction_type, created_at DESC);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE public.parts_suppliers IS 'Centralized supplier/vendor management for parts inventory';
COMMENT ON COLUMN public.parts_suppliers.supplier_code IS 'Internal supplier code (e.g., SUP-001) - unique per garage';
COMMENT ON COLUMN public.parts_suppliers.gstin IS 'GST Identification Number for Indian businesses';
COMMENT ON COLUMN public.parts_suppliers.is_preferred IS 'Mark as preferred supplier for priority ordering';

COMMENT ON TABLE public.parts_categories IS 'Dynamic category management with usage tracking and hierarchy support';
COMMENT ON COLUMN public.parts_categories.parent_category_id IS 'Parent category for hierarchical organization';
COMMENT ON COLUMN public.parts_categories.usage_count IS 'Track how many times this category is used';

COMMENT ON TABLE public.parts IS 'Parts inventory with multi-level duplication checking. Each part is scoped to a garage.';
COMMENT ON COLUMN public.parts.part_number IS 'Internal part number (unique per garage)';
COMMENT ON COLUMN public.parts.sku IS 'Internal stock keeping unit (unique per garage, can be NULL)';
COMMENT ON COLUMN public.parts.oem_part_number IS 'Original Equipment Manufacturer part number (unique per garage, can be NULL)';
COMMENT ON COLUMN public.parts.primary_supplier_id IS 'Foreign key reference to parts_suppliers table';
COMMENT ON COLUMN public.parts.category_id IS 'Foreign key reference to parts_categories table';
COMMENT ON COLUMN public.parts.profit_margin_pct IS 'Profit margin percentage = ((selling_price - purchase_price) / purchase_price) * 100';
COMMENT ON COLUMN public.parts.stock_status IS 'Computed stock status: in-stock, low-stock, or out-of-stock';

COMMENT ON TABLE public.parts_fitment IS 'Junction table linking parts to compatible motorcycles (many-to-many)';
COMMENT ON COLUMN public.parts_fitment.fitment_notes IS 'Notes about fitment compatibility (e.g., specific model years, required modifications)';

COMMENT ON TABLE public.parts_backup_suppliers IS 'Backup/alternative suppliers for parts';
COMMENT ON COLUMN public.parts_backup_suppliers.supplier_id IS 'Optional reference to parts_suppliers table';

COMMENT ON TABLE public.parts_transactions IS 'Complete audit trail of all stock movements';
COMMENT ON COLUMN public.parts_transactions.transaction_type IS 'Type of transaction: purchase, sale, return, adjustment, transfer_in, transfer_out, damage, expired, build, disassembly';
COMMENT ON COLUMN public.parts_transactions.quantity IS 'Positive for additions, negative for removals';
COMMENT ON COLUMN public.parts_transactions.stock_before IS 'Stock level before this transaction';
COMMENT ON COLUMN public.parts_transactions.stock_after IS 'Stock level after this transaction';

-- ============================================================================
-- HELPER FUNCTIONS FOR DUPLICATION CHECKING
-- ============================================================================

-- Drop existing functions if they exist
DROP FUNCTION IF EXISTS public.check_part_duplicate CASCADE;
DROP FUNCTION IF EXISTS public.part_exists_by_part_number CASCADE;
DROP FUNCTION IF EXISTS public.part_exists_by_sku CASCADE;
DROP FUNCTION IF EXISTS public.part_exists_by_oem_number CASCADE;
DROP FUNCTION IF EXISTS public.increment_category_usage CASCADE;

-- Wait a moment to ensure drops complete
SELECT pg_sleep(0.1);

-- Function to check for duplicate parts using multi-level criteria
CREATE FUNCTION public.check_part_duplicate(
  p_garage_id UUID,
  p_part_number TEXT,
  p_sku TEXT DEFAULT NULL,
  p_oem_part_number TEXT DEFAULT NULL,
  p_exclude_part_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  duplicate_result JSON;
  match_count INTEGER;
  match_details JSON;
BEGIN
  match_details := '{}'::json;

  -- Check Level 1: part_number
  SELECT COUNT(*), json_agg(json_build_object('id', id, 'part_number', part_number, 'part_name', part_name))
  INTO match_count, match_details
  FROM public.parts
  WHERE garage_id = p_garage_id
    AND part_number = p_part_number
    AND (p_exclude_part_id IS NULL OR id != p_exclude_part_id);

  IF match_count > 0 THEN
    duplicate_result := json_build_object(
      'is_duplicate', true,
      'level', 1,
      'criteria', 'part_number',
      'message', 'A part with this part number already exists',
      'matches', match_details
    );
    RETURN duplicate_result;
  END IF;

  -- Check Level 2: sku (only if provided)
  IF p_sku IS NOT NULL AND TRIM(p_sku) != '' THEN
    SELECT COUNT(*), json_agg(json_build_object('id', id, 'sku', sku, 'part_name', part_name))
    INTO match_count, match_details
    FROM public.parts
    WHERE garage_id = p_garage_id
      AND sku = p_sku
      AND (p_exclude_part_id IS NULL OR id != p_exclude_part_id);

    IF match_count > 0 THEN
      duplicate_result := json_build_object(
        'is_duplicate', true,
        'level', 2,
        'criteria', 'sku',
        'message', 'A part with this SKU already exists',
        'matches', match_details
      );
      RETURN duplicate_result;
    END IF;
  END IF;

  -- Check Level 3: oem_part_number (only if provided)
  IF p_oem_part_number IS NOT NULL AND TRIM(p_oem_part_number) != '' THEN
    SELECT COUNT(*), json_agg(json_build_object('id', id, 'oem_part_number', oem_part_number, 'part_name', part_name))
    INTO match_count, match_details
    FROM public.parts
    WHERE garage_id = p_garage_id
      AND oem_part_number = p_oem_part_number
      AND (p_exclude_part_id IS NULL OR id != p_exclude_part_id);

    IF match_count > 0 THEN
      duplicate_result := json_build_object(
        'is_duplicate', true,
        'level', 3,
        'criteria', 'oem_part_number',
        'message', 'A part with this OEM part number already exists',
        'matches', match_details
      );
      RETURN duplicate_result;
    END IF;
  END IF;

  -- No duplicates found
  duplicate_result := json_build_object(
    'is_duplicate', false,
    'message', 'No duplicates found'
  );

  RETURN duplicate_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if part exists by part number
CREATE FUNCTION public.part_exists_by_part_number(p_garage_id UUID, p_part_number TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.parts
    WHERE garage_id = p_garage_id AND part_number = p_part_number
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if part exists by SKU
CREATE FUNCTION public.part_exists_by_sku(p_garage_id UUID, p_sku TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.parts
    WHERE garage_id = p_garage_id AND sku = p_sku
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to check if part exists by OEM number
CREATE FUNCTION public.part_exists_by_oem_number(p_garage_id UUID, p_oem_part_number TEXT)
RETURNS BOOLEAN AS $$
  SELECT EXISTS(
    SELECT 1 FROM public.parts
    WHERE garage_id = p_garage_id AND oem_part_number = p_oem_part_number
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Function to increment category usage count
CREATE FUNCTION public.increment_category_usage(p_category_id UUID)
RETURNS VOID AS $$
BEGIN
  IF p_category_id IS NOT NULL THEN
    UPDATE public.parts_categories
    SET usage_count = usage_count + 1,
        last_used_at = NOW(),
        updated_at = NOW()
    WHERE id = p_category_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- TRIGGERS FOR AUTOMATIC STOCK STATUS AND MARGIN CALCULATION
-- ============================================================================

-- Function to compute part metrics
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

-- Trigger for parts
DROP TRIGGER IF EXISTS compute_parts_metrics ON public.parts;
CREATE TRIGGER compute_parts_metrics
  BEFORE INSERT OR UPDATE ON public.parts
  FOR EACH ROW
  EXECUTE FUNCTION public.compute_part_metrics();

-- Function to update suppliers updated_at
CREATE OR REPLACE FUNCTION public.update_suppliers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_suppliers_updated_at ON public.parts_suppliers;
CREATE TRIGGER set_suppliers_updated_at
  BEFORE UPDATE ON public.parts_suppliers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_suppliers_updated_at();

-- Function to update categories updated_at
CREATE OR REPLACE FUNCTION public.update_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.parts_categories;
CREATE TRIGGER set_categories_updated_at
  BEFORE UPDATE ON public.parts_categories
  FOR EACH ROW
  EXECUTE FUNCTION public.update_categories_updated_at();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE public.parts_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_fitment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_backup_suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.parts_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS POLICIES: PARTS_SUPPLIERS
-- ============================================================================

DROP POLICY IF EXISTS "Allow read suppliers from own garage" ON public.parts_suppliers;
DROP POLICY IF EXISTS "Allow insert suppliers for own garage" ON public.parts_suppliers;
DROP POLICY IF EXISTS "Allow update suppliers from own garage" ON public.parts_suppliers;
DROP POLICY IF EXISTS "Allow delete suppliers from own garage" ON public.parts_suppliers;
DROP POLICY IF EXISTS "Allow service role full access on suppliers" ON public.parts_suppliers;

CREATE POLICY "Allow read suppliers from own garage"
  ON public.parts_suppliers
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow insert suppliers for own garage"
  ON public.parts_suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow update suppliers from own garage"
  ON public.parts_suppliers
  FOR UPDATE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow delete suppliers from own garage"
  ON public.parts_suppliers
  FOR DELETE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on suppliers"
  ON public.parts_suppliers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: PARTS_CATEGORIES
-- ============================================================================

DROP POLICY IF EXISTS "Allow read categories from own garage" ON public.parts_categories;
DROP POLICY IF EXISTS "Allow insert categories for own garage" ON public.parts_categories;
DROP POLICY IF EXISTS "Allow update categories from own garage" ON public.parts_categories;
DROP POLICY IF EXISTS "Allow delete categories from own garage" ON public.parts_categories;
DROP POLICY IF EXISTS "Allow service role full access on categories" ON public.parts_categories;

CREATE POLICY "Allow read categories from own garage"
  ON public.parts_categories
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow insert categories for own garage"
  ON public.parts_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow update categories from own garage"
  ON public.parts_categories
  FOR UPDATE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow delete categories from own garage"
  ON public.parts_categories
  FOR DELETE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on categories"
  ON public.parts_categories
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: PARTS
-- ============================================================================

DROP POLICY IF EXISTS "Allow read parts from own garage" ON public.parts;
DROP POLICY IF EXISTS "Allow insert parts for own garage" ON public.parts;
DROP POLICY IF EXISTS "Allow update parts from own garage" ON public.parts;
DROP POLICY IF EXISTS "Allow delete parts from own garage" ON public.parts;
DROP POLICY IF EXISTS "Allow service role full access on parts" ON public.parts;

CREATE POLICY "Allow read parts from own garage"
  ON public.parts
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow insert parts for own garage"
  ON public.parts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow update parts from own garage"
  ON public.parts
  FOR UPDATE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow delete parts from own garage"
  ON public.parts
  FOR DELETE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on parts"
  ON public.parts
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: PARTS_FITMENT
-- ============================================================================

DROP POLICY IF EXISTS "Allow read fitment from own garage" ON public.parts_fitment;
DROP POLICY IF EXISTS "Allow insert fitment for own garage" ON public.parts_fitment;
DROP POLICY IF EXISTS "Allow update fitment from own garage" ON public.parts_fitment;
DROP POLICY IF EXISTS "Allow delete fitment from own garage" ON public.parts_fitment;
DROP POLICY IF EXISTS "Allow service role full access on fitment" ON public.parts_fitment;

CREATE POLICY "Allow read fitment from own garage"
  ON public.parts_fitment
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow insert fitment for own garage"
  ON public.parts_fitment
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow update fitment from own garage"
  ON public.parts_fitment
  FOR UPDATE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow delete fitment from own garage"
  ON public.parts_fitment
  FOR DELETE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on fitment"
  ON public.parts_fitment
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: PARTS_BACKUP_SUPPLIERS
-- ============================================================================

DROP POLICY IF EXISTS "Allow read backup suppliers from own garage" ON public.parts_backup_suppliers;
DROP POLICY IF EXISTS "Allow insert backup suppliers for own garage" ON public.parts_backup_suppliers;
DROP POLICY IF EXISTS "Allow update backup suppliers from own garage" ON public.parts_backup_suppliers;
DROP POLICY IF EXISTS "Allow delete backup suppliers from own garage" ON public.parts_backup_suppliers;
DROP POLICY IF EXISTS "Allow service role full access on backup suppliers" ON public.parts_backup_suppliers;

CREATE POLICY "Allow read backup suppliers from own garage"
  ON public.parts_backup_suppliers
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow insert backup suppliers for own garage"
  ON public.parts_backup_suppliers
  FOR INSERT
  TO authenticated
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow update backup suppliers from own garage"
  ON public.parts_backup_suppliers
  FOR UPDATE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  )
  WITH CHECK (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow delete backup suppliers from own garage"
  ON public.parts_backup_suppliers
  FOR DELETE
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
  );

CREATE POLICY "Allow service role full access on backup suppliers"
  ON public.parts_backup_suppliers
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RLS POLICIES: PARTS_TRANSACTIONS
-- ============================================================================

DROP POLICY IF EXISTS "Allow read transactions from own garage" ON public.parts_transactions;
DROP POLICY IF EXISTS "Allow insert transactions for own garage" ON public.parts_transactions;
DROP POLICY IF EXISTS "Allow update transactions from own garage" ON public.parts_transactions;
DROP POLICY IF EXISTS "Allow service role full access on transactions" ON public.parts_transactions;

CREATE POLICY "Allow read transactions from own garage"
  ON public.parts_transactions
  FOR SELECT
  TO authenticated
  USING (
    garage_id = (SELECT garage_id::UUID FROM public.garage_auth WHERE user_uid = auth.uid() LIMIT 1)
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

-- ============================================================================
-- GRANT PERMISSIONS
-- ============================================================================

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================================================
-- SAMPLE DATA (OPTIONAL - FOR TESTING)
-- ============================================================================

-- Uncomment below to insert sample data for testing
/*
-- First, insert sample supplier (requires valid garage UUID)
INSERT INTO public.parts_suppliers (
  garage_id, supplier_name, supplier_code, contact_person, phone, email,
  address, city, state, zip_code, country, payment_terms, is_preferred
)
VALUES (
  'garage-uuid-123', -- Replace with actual garage_uid from garages table
  'AutoParts India Ltd',
  'SUP-001',
  'Rajesh Sharma',
  '+91 98765 43210',
  'rajesh.sharma@autopartsindia.com',
  '123, Industrial Area',
  'Bangalore',
  'Karnataka',
  '560045',
  'India',
  'Net 30',
  true
);

-- Insert sample category
INSERT INTO public.parts_categories (garage_id, category_name, description)
VALUES (
  'garage-uuid-123',
  'Engine',
  'Engine parts and components'
);

-- Insert sample part
INSERT INTO public.parts (
  garage_id,
  part_number, part_name, category, make, model, used_for, description,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price, wholesale_price,
  supplier, supplier_phone, supplier_email, vendor_sku, lead_time_days, minimum_order_quantity,
  sku, oem_part_number, location
)
VALUES (
  'garage-uuid-123',
  'OIL-001',
  'Engine Oil 10W-40 Synthetic',
  'Engine',
  'Motul',
  '7100 4T',
  'Engine',
  'Full synthetic motorcycle engine oil, 1L bottle. Suitable for all modern 4-stroke motorcycles.',
  25, 50, 5,
  550.00, 750.00, 650.00,
  'AutoParts India Ltd',
  '+91 98765 43210',
  'rajesh.sharma@autopartsindia.com',
  'APL-OIL-SYN-10W40',
  3, 12,
  'SKU-OIL-10W40-SYN-1L',
  'OEM-999-888-777',
  'A1-01'
);

-- Sample fitment (link to a motorcycle from motorcycles table)
INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id)
SELECT
  (SELECT id FROM public.parts WHERE part_number = 'OIL-001' LIMIT 1),
  id,
  'garage-uuid-123'
FROM public.motorcycles
WHERE make = 'Honda' AND model = 'Activa 6G'
LIMIT 1;
*/

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify the tables were created
SELECT
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
FROM (
  VALUES
    ('parts_suppliers'),
    ('parts_categories'),
    ('parts'),
    ('parts_fitment'),
    ('parts_backup_suppliers'),
    ('parts_transactions')
) AS t(table_name)
ORDER BY table_name;

-- Verify constraints
SELECT
  conname as constraint_name,
  contype as constraint_type,
  pg_get_constraintdef(oid) as constraint_definition
FROM pg_constraint
WHERE conrelid::regclass::text IN (
  'public.parts_suppliers',
  'public.parts_categories',
  'public.parts',
  'public.parts_fitment',
  'public.parts_backup_suppliers',
  'public.parts_transactions'
)
ORDER BY conrelid::regclass::text, conname;

-- Verify indexes
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN (
  'parts_suppliers',
  'parts_categories',
  'parts',
  'parts_fitment',
  'parts_backup_suppliers',
  'parts_transactions'
)
  AND schemaname = 'public'
ORDER BY tablename, indexname;

-- Verify RLS is enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename LIKE 'parts%'
ORDER BY tablename;
