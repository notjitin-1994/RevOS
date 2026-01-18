-- ============================================================================
-- JOB CARDS SYSTEM - CORRECTED MIGRATION
-- ============================================================================
-- This migration creates the job card management system with corrected
-- foreign key references to match existing database schema.
-- ============================================================================

-- ============================================================================
-- JOB CARDS MASTER TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,

  -- === Core Identity ===
  job_card_number VARCHAR(50) NOT NULL,

  -- === Customer & Vehicle References ===
  customer_id UUID NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(20) NOT NULL,
  customer_email VARCHAR(255),

  vehicle_id UUID NOT NULL,
  vehicle_make VARCHAR(100) NOT NULL,
  vehicle_model VARCHAR(100) NOT NULL,
  vehicle_year INTEGER NOT NULL,
  vehicle_license_plate VARCHAR(20) NOT NULL,
  vehicle_vin VARCHAR(100),
  current_mileage INTEGER,

  -- === Job Details ===
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN (
      'draft', 'queued', 'assigned', 'in_progress',
      'parts_waiting', 'quality_check', 'ready',
      'delivered', 'invoiced', 'closed'
    )),
  priority VARCHAR(10) NOT NULL DEFAULT 'medium'
    CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  job_type VARCHAR(20) NOT NULL DEFAULT 'repair'
    CHECK (job_type IN ('routine', 'repair', 'maintenance', 'custom')),

  -- === Customer Inputs ===
  customer_complaint TEXT NOT NULL,
  work_requested TEXT NOT NULL,
  customer_notes TEXT,

  -- === Internal Notes ===
  technician_notes TEXT,
  service_advisor_notes TEXT,
  quality_check_notes TEXT,

  -- === Scheduling ===
  promised_date DATE,
  promised_time VARCHAR(10),
  actual_start_date TIMESTAMPTZ,
  actual_completion_date TIMESTAMPTZ,
  bay_assigned VARCHAR(50),

  -- === Financials ===
  estimated_labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  estimated_parts_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  actual_labor_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  actual_parts_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  tax_amount DECIMAL(10, 2) DEFAULT 0,
  final_amount DECIMAL(10, 2) DEFAULT 0,
  payment_status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (payment_status IN ('pending', 'partial', 'paid', 'overdue')),

  -- === Staffing ===
  service_advisor_id UUID NOT NULL,
  lead_mechanic_id UUID,

  -- === Quality & Satisfaction ===
  quality_checked BOOLEAN DEFAULT false,
  quality_checked_by UUID,
  customer_rating INTEGER CHECK (customer_rating >= 1 AND customer_rating <= 5),

  -- === Metadata ===
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  created_by UUID NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  -- Foreign Keys (using correct primary key names)
  CONSTRAINT fk_job_cards_customer
    FOREIGN KEY (customer_id)
    REFERENCES public.customers(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_job_cards_vehicle
    FOREIGN KEY (vehicle_id)
    REFERENCES public.customer_vehicles(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_job_cards_service_advisor
    FOREIGN KEY (service_advisor_id)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL,

  CONSTRAINT fk_job_cards_lead_mechanic
    FOREIGN KEY (lead_mechanic_id)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL,

  CONSTRAINT fk_job_cards_quality_checker
    FOREIGN KEY (quality_checked_by)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL,

  CONSTRAINT job_cards_garage_number_unique UNIQUE (garage_id, job_card_number)
);

-- ============================================================================
-- JOB CARD CHECKLIST ITEMS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_card_checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  job_card_id UUID NOT NULL,

  task_name VARCHAR(255) NOT NULL,
  task_description TEXT,
  task_category VARCHAR(100) NOT NULL,

  assigned_to UUID NOT NULL,
  assigned_by UUID NOT NULL,
  assigned_at TIMESTAMPTZ DEFAULT NOW(),

  estimated_minutes INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending'
    CHECK (status IN ('pending', 'in_progress', 'completed', 'on_hold', 'cancelled')),

  actual_minutes INTEGER NOT NULL DEFAULT 0,
  display_order INTEGER DEFAULT 0,
  is_required BOOLEAN DEFAULT true,

  approved_by UUID,
  approved_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_checklist_job_card
    FOREIGN KEY (job_card_id)
    REFERENCES public.job_cards(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_checklist_assigned_to
    FOREIGN KEY (assigned_to)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL,

  CONSTRAINT fk_checklist_assigned_by
    FOREIGN KEY (assigned_by)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL,

  CONSTRAINT fk_checklist_approved_by
    FOREIGN KEY (approved_by)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL
);

-- ============================================================================
-- JOB CARD TIME ENTRIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_card_time_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  checklist_item_id UUID NOT NULL,
  job_card_id UUID NOT NULL,
  mechanic_id UUID NOT NULL,

  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_time_entries_checklist
    FOREIGN KEY (checklist_item_id)
    REFERENCES public.job_card_checklist_items(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_time_entries_job_card
    FOREIGN KEY (job_card_id)
    REFERENCES public.job_cards(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_time_entries_mechanic
    FOREIGN KEY (mechanic_id)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL
);

-- ============================================================================
-- JOB CARD PARTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_card_parts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  job_card_id UUID NOT NULL,
  part_id UUID NOT NULL,

  part_number VARCHAR(100) NOT NULL,
  part_name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,

  quantity_requested INTEGER NOT NULL DEFAULT 1,
  quantity_used INTEGER NOT NULL DEFAULT 0,
  quantity_returned INTEGER NOT NULL DEFAULT 0,

  status VARCHAR(20) NOT NULL DEFAULT 'requested'
    CHECK (status IN ('requested', 'allocated', 'used', 'partial', 'returned')),

  unit_cost DECIMAL(10, 2) NOT NULL DEFAULT 0,
  unit_price DECIMAL(10, 2) NOT NULL DEFAULT 0,

  requested_by UUID NOT NULL,
  used_by UUID,

  requested_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  used_at TIMESTAMPTZ,

  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_job_parts_job_card
    FOREIGN KEY (job_card_id)
    REFERENCES public.job_cards(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_job_parts_part
    FOREIGN KEY (part_id)
    REFERENCES public.parts(id)
    ON DELETE RESTRICT,

  CONSTRAINT fk_job_parts_requested_by
    FOREIGN KEY (requested_by)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL,

  CONSTRAINT fk_job_parts_used_by
    FOREIGN KEY (used_by)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL
);

-- ============================================================================
-- JOB CARD ATTACHMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_card_attachments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  job_card_id UUID NOT NULL,

  file_name VARCHAR(500) NOT NULL,
  file_url TEXT NOT NULL,
  file_type VARCHAR(50) NOT NULL,
  file_size_bytes INTEGER,
  mime_type VARCHAR(100),

  attachment_category VARCHAR(50),
  description TEXT,

  uploaded_by UUID NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_attachments_job_card
    FOREIGN KEY (job_card_id)
    REFERENCES public.job_cards(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_attachments_uploaded_by
    FOREIGN KEY (uploaded_by)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL
);

-- ============================================================================
-- JOB CARD COMMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_card_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  job_card_id UUID NOT NULL,

  comment_text TEXT NOT NULL,
  comment_type VARCHAR(20) DEFAULT 'internal'
    CHECK (comment_type IN ('internal', 'customer', 'system')),

  is_visible_to_customer BOOLEAN DEFAULT false,

  author_id UUID NOT NULL,
  author_name VARCHAR(255) NOT NULL,
  author_role VARCHAR(50) NOT NULL,

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_comments_job_card
    FOREIGN KEY (job_card_id)
    REFERENCES public.job_cards(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_comments_author
    FOREIGN KEY (author_id)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL
);

-- ============================================================================
-- JOB CARD STATUS HISTORY
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.job_card_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  job_card_id UUID NOT NULL,

  old_status VARCHAR(20),
  new_status VARCHAR(20) NOT NULL,

  changed_by UUID NOT NULL,
  changed_by_name VARCHAR(255) NOT NULL,
  change_reason TEXT,

  changed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_status_history_job_card
    FOREIGN KEY (job_card_id)
    REFERENCES public.job_cards(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_status_history_changed_by
    FOREIGN KEY (changed_by)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL
);

-- ============================================================================
-- MECHANIC DAILY METRICS
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.mechanic_daily_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  garage_id UUID NOT NULL,
  mechanic_id UUID NOT NULL,
  date DATE NOT NULL,

  total_shift_minutes INTEGER DEFAULT 0,
  total_worked_minutes INTEGER DEFAULT 0,
  total_billable_minutes INTEGER DEFAULT 0,

  productivity_percentage DECIMAL(5, 2) DEFAULT 0,
  efficiency_percentage DECIMAL(5, 2) DEFAULT 0,

  jobs_assigned INTEGER DEFAULT 0,
  jobs_completed INTEGER DEFAULT 0,

  labor_revenue_generated DECIMAL(10, 2) DEFAULT 0,

  customer_rating_sum INTEGER DEFAULT 0,
  customer_rating_count INTEGER DEFAULT 0,

  top_skill_category VARCHAR(100),

  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,

  CONSTRAINT fk_metrics_mechanic
    FOREIGN KEY (mechanic_id)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE CASCADE,

  CONSTRAINT metrics_mechanic_date_unique UNIQUE (garage_id, mechanic_id, date)
);

-- ============================================================================
-- INDEXES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_job_cards_garage_id ON public.job_cards(garage_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_customer_id ON public.job_cards(customer_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_vehicle_id ON public.job_cards(vehicle_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_status ON public.job_cards(status);
CREATE INDEX IF NOT EXISTS idx_job_cards_created_at ON public.job_cards(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_checklist_job_card ON public.job_card_checklist_items(job_card_id);
CREATE INDEX IF NOT EXISTS idx_checklist_assigned_to ON public.job_card_checklist_items(assigned_to);

CREATE INDEX IF NOT EXISTS idx_time_entries_checklist ON public.job_card_time_entries(checklist_item_id);
CREATE INDEX IF NOT EXISTS idx_time_entries_mechanic ON public.job_card_time_entries(mechanic_id);

CREATE INDEX IF NOT EXISTS idx_job_parts_job_card ON public.job_card_parts(job_card_id);
CREATE INDEX IF NOT EXISTS idx_job_parts_part_id ON public.job_card_parts(part_id);

CREATE INDEX IF NOT EXISTS idx_attachments_job_card ON public.job_card_attachments(job_card_id);
CREATE INDEX IF NOT EXISTS idx_comments_job_card ON public.job_card_comments(job_card_id);
CREATE INDEX IF NOT EXISTS idx_status_history_job_card ON public.job_card_status_history(job_card_id);
CREATE INDEX IF NOT EXISTS idx_metrics_mechanic_date ON public.mechanic_daily_metrics(mechanic_id, date DESC);

-- ============================================================================
-- FUNCTIONS AND TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION public.generate_job_card_number(p_garage_id UUID)
RETURNS VARCHAR(50) AS $$
DECLARE
  v_year INTEGER := EXTRACT(YEAR FROM NOW());
  v_sequence INTEGER;
BEGIN
  SELECT COALESCE(COUNT(*), 0) + 1
  INTO v_sequence
  FROM public.job_cards
  WHERE garage_id = p_garage_id
    AND EXTRACT(YEAR FROM created_at) = v_year;

  RETURN 'JC-' || v_year || '-' || LPAD(v_sequence::TEXT, 4, '0');
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trigger_set_job_card_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.job_card_number IS NULL OR NEW.job_card_number = '' THEN
    NEW.job_card_number := public.generate_job_card_number(NEW.garage_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.trigger_update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_job_card_number ON public.job_cards;
CREATE TRIGGER set_job_card_number
  BEFORE INSERT ON public.job_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_set_job_card_number();

DROP TRIGGER IF EXISTS update_job_cards_updated_at ON public.job_cards;
CREATE TRIGGER update_job_cards_updated_at
  BEFORE UPDATE ON public.job_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_updated_at();

DROP TRIGGER IF EXISTS update_checklist_updated_at ON public.job_card_checklist_items;
CREATE TRIGGER update_checklist_updated_at
  BEFORE UPDATE ON public.job_card_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_updated_at();

DROP TRIGGER IF EXISTS update_time_entries_updated_at ON public.job_card_time_entries;
CREATE TRIGGER update_time_entries_updated_at
  BEFORE UPDATE ON public.job_card_time_entries
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_updated_at();

DROP TRIGGER IF EXISTS update_job_parts_updated_at ON public.job_card_parts;
CREATE TRIGGER update_job_parts_updated_at
  BEFORE UPDATE ON public.job_card_parts
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_updated_at();

DROP TRIGGER IF EXISTS update_comments_updated_at ON public.job_card_comments;
CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON public.job_card_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_updated_at();

DROP TRIGGER IF EXISTS update_metrics_updated_at ON public.mechanic_daily_metrics;
CREATE TRIGGER update_metrics_updated_at
  BEFORE UPDATE ON public.mechanic_daily_metrics
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_update_updated_at();

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE public.job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_card_checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_card_time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_card_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_card_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_card_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_card_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mechanic_daily_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable all on job_cards" ON public.job_cards FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all on checklist_items" ON public.job_card_checklist_items FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all on time_entries" ON public.job_card_time_entries FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all on job_card_parts" ON public.job_card_parts FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all on attachments" ON public.job_card_attachments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all on comments" ON public.job_card_comments FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all on status_history" ON public.job_card_status_history FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Enable all on metrics" ON public.mechanic_daily_metrics FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ============================================================================
-- SUCCESS
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE 'Job Cards system created successfully!';
END $$;
