-- ============================================================================
-- ENHANCE CUSTOMER_VEHICLES TABLE FOR SERVICE HISTORY & JOB CARDS
-- ============================================================================
-- This adds columns to link with job cards, track service history, and
-- manage vehicle registry features

-- ============================================================================
-- STEP 1: Add columns WITHOUT foreign key references (job_cards doesn't exist yet)
-- ============================================================================

-- Add job card reference (without FK constraint for now)
ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS current_job_card_id UUID;

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS vehicle_status VARCHAR(50) DEFAULT 'active' 
CHECK (vehicle_status IN ('active', 'in-service', 'ready-for-delivery', 'delivered', 'sold', inactive', 'in-repair'));

-- Service tracking columns
ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS last_service_mileage INTEGER CHECK (last_service_mileage >= 0);

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS next_service_due_date DATE;

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS next_service_due_mileage INTEGER CHECK (next_service_due_mileage >= 0);

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS total_services_completed INTEGER DEFAULT 0 CHECK (total_services_completed >= 0);

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS total_service_cost DECIMAL(12, 2) DEFAULT 0.00 CHECK (total_service_cost >= 0);

-- Registration and compliance columns
ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS registration_number VARCHAR(50);

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS registration_expiry DATE;

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS ownership_type VARCHAR(20) DEFAULT 'owned' 
CHECK (ownership_type IN ('owned', 'leased', 'rented', 'company', 'financed'));

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS insurance_provider VARCHAR(100);

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS insurance_policy_number VARCHAR(100);

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS insurance_expiry DATE;

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS puc_number VARCHAR(50);

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS puc_expiry DATE;

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS warranty_expiry DATE;

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS warranty_provider VARCHAR(100);

-- Customer preferences
ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS preferred_contact_time VARCHAR(50);

ALTER TABLE public.customer_vehicles 
ADD COLUMN IF NOT EXISTS is_primary_vehicle BOOLEAN DEFAULT false;

-- ============================================================================
-- ADD INDEXES FOR PERFORMANCE
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_customer_vehicles_current_job_card ON public.customer_vehicles(current_job_card_id);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_vehicle_status ON public.customer_vehicles(vehicle_status);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_next_service_due ON public.customer_vehicles(next_service_due_date);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_insurance_expiry ON public.customer_vehicles(insurance_expiry);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_puc_expiry ON public.customer_vehicles(puc_expiry);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_registration_expiry ON public.customer_vehicles(registration_expiry);
CREATE INDEX IF NOT EXISTS idx_customer_vehicles_primary ON public.customer_vehicles(is_primary_vehicle) WHERE is_primary_vehicle = true;

-- ============================================================================
-- ADD COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON COLUMN public.customer_vehicles.current_job_card_id IS 'Reference to the currently active job card for this vehicle (FK to job_cards.id - add constraint after creating job_cards table)';
COMMENT ON COLUMN public.customer_vehicles.vehicle_status IS 'Current status of the vehicle: active, in-service, ready-for-delivery, delivered, sold, inactive, in-repair';
COMMENT ON COLUMN public.customer_vehicles.last_service_mileage IS 'Odometer reading at the time of last service';
COMMENT ON COLUMN public.customer_vehicles.next_service_due_date IS 'Date when next service is due';
COMMENT ON COLUMN public.customer_vehicles.next_service_due_mileage IS 'Odometer reading when next service is due';
COMMENT ON COLUMN public.customer_vehicles.total_services_completed IS 'Total number of services completed for this vehicle';
COMMENT ON COLUMN public.customer_vehicles.total_service_cost IS 'Total amount spent on all services for this vehicle';

COMMENT ON COLUMN public.customer_vehicles.registration_number IS 'Official vehicle registration number (may differ from license plate in some regions)';
COMMENT ON COLUMN public.customer_vehicles.registration_expiry IS 'Vehicle registration expiry date';
COMMENT ON COLUMN public.customer_vehicles.ownership_type IS 'Type of ownership: owned, leased, rented, company, financed';
COMMENT ON COLUMN public.customer_vehicles.insurance_provider IS 'Name of insurance company';
COMMENT ON COLUMN public.customer_vehicles.insurance_policy_number IS 'Insurance policy number';
COMMENT ON COLUMN public.customer_vehicles.insurance_expiry IS 'Insurance policy expiry date';
COMMENT ON COLUMN public.customer_vehicles.puc_number IS 'Pollution Under Control certificate number';
COMMENT ON COLUMN public.customer_vehicles.puc_expiry IS 'PUC certificate expiry date';
COMMENT ON COLUMN public.customer_vehicles.warranty_expiry IS 'Manufacturer or extended warranty expiry date';
COMMENT ON COLUMN public.customer_vehicles.warranty_provider IS 'Warranty provider name (manufacturer, third-party, etc.)';

COMMENT ON COLUMN public.customer_vehicles.preferred_contact_time IS 'Customer preferred time for service-related communications';
COMMENT ON COLUMN public.customer_vehicles.is_primary_vehicle IS 'Flag to indicate if this is the customer primary vehicle';

-- ============================================================================
-- CREATE A VIEW FOR SERVICE HISTORY SUMMARY
-- ============================================================================

CREATE OR REPLACE VIEW public.vehicle_service_summary AS
SELECT 
  v.id,
  v.customer_id,
  v.garage_id,
  v.make,
  v.model,
  v.year,
  v.license_plate,
  v.current_mileage,
  v.vehicle_status,
  v.current_job_card_id,
  v.last_service_date,
  v.last_service_mileage,
  v.next_service_due_date,
  v.next_service_due_mileage,
  v.total_services_completed,
  v.total_service_cost,
  -- Overdue service indicator
  CASE 
    WHEN v.next_service_due_date IS NOT NULL AND v.next_service_due_date < CURRENT_DATE THEN 'overdue'
    WHEN v.next_service_due_date IS NOT NULL AND v.next_service_due_date <= CURRENT_DATE + INTERVAL '7 days' THEN 'due-soon'
    ELSE 'ok'
  END AS service_status,
  -- Expiry alerts
  CASE 
    WHEN v.insurance_expiry IS NOT NULL AND v.insurance_expiry < CURRENT_DATE THEN 'expired'
    WHEN v.insurance_expiry IS NOT NULL AND v.insurance_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring-soon'
    ELSE 'valid'
  END AS insurance_status,
  CASE 
    WHEN v.puc_expiry IS NOT NULL AND v.puc_expiry < CURRENT_DATE THEN 'expired'
    WHEN v.puc_expiry IS NOT NULL AND v.puc_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring-soon'
    ELSE 'valid'
  END AS puc_status,
  CASE 
    WHEN v.registration_expiry IS NOT NULL AND v.registration_expiry < CURRENT_DATE THEN 'expired'
    WHEN v.registration_expiry IS NOT NULL AND v.registration_expiry <= CURRENT_DATE + INTERVAL '30 days' THEN 'expiring-soon'
    ELSE 'valid'
  END AS registration_status,
  v.created_at,
  v.updated_at
FROM public.customer_vehicles v
WHERE v.status = 'active';

COMMENT ON VIEW public.vehicle_service_summary IS 'Summary view of vehicles with service status and compliance alerts';

-- ============================================================================
-- HELPER FUNCTION TO CHECK SERVICE DUE
-- ============================================================================

CREATE OR REPLACE FUNCTION public.check_service_due(vehicle_id_param UUID)
RETURNS TABLE(
  vehicle_id UUID,
  is_overdue BOOLEAN,
  days_until_due INTEGER,
  due_date DATE,
  due_mileage INTEGER,
  current_mileage INTEGER,
  mileage_overdue INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    CASE 
      WHEN v.next_service_due_date IS NOT NULL AND v.next_service_due_date < CURRENT_DATE THEN true
      WHEN v.next_service_due_mileage IS NOT NULL AND v.current_mileage >= v.next_service_due_mileage THEN true
      ELSE false
    END AS is_overdue,
    CASE 
      WHEN v.next_service_due_date IS NOT NULL 
      THEN EXTRACT(DAY FROM (v.next_service_due_date - CURRENT_DATE))::INTEGER
      ELSE NULL
    END AS days_until_due,
    v.next_service_due_date,
    v.next_service_due_mileage,
    v.current_mileage,
    CASE 
      WHEN v.next_service_due_mileage IS NOT NULL AND v.current_mileage >= v.next_service_due_mileage
      THEN (v.current_mileage - v.next_service_due_mileage)
      ELSE NULL
    END AS mileage_overdue
  FROM public.customer_vehicles v
  WHERE v.id = vehicle_id_param;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.check_service_due IS 'Check if a vehicle service is overdue by date or mileage';

-- ============================================================================
-- HELPER FUNCTION TO GET UPCOMING EXPIRIES
-- ============================================================================

CREATE OR REPLACE FUNCTION public.get_vehicle_expiries(garage_id_param UUID, days_ahead INTEGER DEFAULT 30)
RETURNS TABLE(
  vehicle_id UUID,
  customer_id UUID,
  license_plate VARCHAR,
  expiry_type TEXT,
  expiry_date DATE,
  days_until_expiry INTEGER,
  status TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    v.id,
    v.customer_id,
    v.license_plate,
    'insurance' AS expiry_type,
    v.insurance_expiry AS expiry_date,
    EXTRACT(DAY FROM (v.insurance_expiry - CURRENT_DATE))::INTEGER AS days_until_expiry,
    CASE 
      WHEN v.insurance_expiry < CURRENT_DATE THEN 'expired'
      WHEN v.insurance_expiry <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL THEN 'expiring-soon'
      ELSE 'valid'
    END AS status
  FROM public.customer_vehicles v
  WHERE v.garage_id = garage_id_param
    AND v.insurance_expiry IS NOT NULL
    AND v.insurance_expiry <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL

  UNION ALL

  SELECT 
    v.id,
    v.customer_id,
    v.license_plate,
    'puc' AS expiry_type,
    v.puc_expiry AS expiry_date,
    EXTRACT(DAY FROM (v.puc_expiry - CURRENT_DATE))::INTEGER AS days_until_expiry,
    CASE 
      WHEN v.puc_expiry < CURRENT_DATE THEN 'expired'
      WHEN v.puc_expiry <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL THEN 'expiring-soon'
      ELSE 'valid'
    END AS status
  FROM public.customer_vehicles v
  WHERE v.garage_id = garage_id_param
    AND v.puc_expiry IS NOT NULL
    AND v.puc_expiry <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL

  UNION ALL

  SELECT 
    v.id,
    v.customer_id,
    v.license_plate,
    'registration' AS expiry_type,
    v.registration_expiry AS expiry_date,
    EXTRACT(DAY FROM (v.registration_expiry - CURRENT_DATE))::INTEGER AS days_until_expiry,
    CASE 
      WHEN v.registration_expiry < CURRENT_DATE THEN 'expired'
      WHEN v.registration_expiry <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL THEN 'expiring-soon'
      ELSE 'valid'
    END AS status
  FROM public.customer_vehicles v
  WHERE v.garage_id = garage_id_param
    AND v.registration_expiry IS NOT NULL
    AND v.registration_expiry <= CURRENT_DATE + (days_ahead || ' days')::INTERVAL;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION public.get_vehicle_expiries IS 'Get all upcoming vehicle document expiries for a garage';

-- ============================================================================
-- POST-JOB_CARDS SETUP: Run this AFTER creating job_cards table
-- ============================================================================

-- Step 1: Add foreign key constraint
-- ALTER TABLE public.customer_vehicles 
-- ADD CONSTRAINT fk_customer_vehicles_job_card 
-- FOREIGN KEY (current_job_card_id) REFERENCES public.job_cards(id) ON DELETE SET NULL;

-- Step 2: Create trigger function to update vehicle service statistics
-- CREATE OR REPLACE FUNCTION public.update_vehicle_service_stats()
-- RETURNS TRIGGER AS $$
-- BEGIN
--   -- Update total services count when a job card is completed
--   IF NEW.status = 'completed' AND (OLD.status IS NULL OR OLD.status != 'completed') THEN
--     UPDATE public.customer_vehicles
--     SET 
--       total_services_completed = total_services_completed + 1,
--       total_service_cost = total_service_cost + COALESCE(NEW.total_amount, 0),
--       last_service_date = NEW.completed_at,
--       last_service_mileage = NEW.vehicle_mileage,
--       vehicle_status = 'active',
--       current_job_card_id = NULL
--     WHERE id = NEW.vehicle_id;
--   END IF;
--
--   -- Set current job card when job card is created
--   IF NEW.status = 'open' AND (OLD IS NULL OR OLD.status != 'open') THEN
--     UPDATE public.customer_vehicles
--     SET 
--       current_job_card_id = NEW.id,
--       vehicle_status = 'in-service'
--     WHERE id = NEW.vehicle_id;
--   END IF;
--
--   RETURN NEW;
-- END;
-- $$ LANGUAGE plpgsql;
--
-- COMMENT ON FUNCTION public.update_vehicle_service_stats IS 'Update vehicle service statistics when job cards are completed';

-- Step 3: Create trigger on job_cards table
-- DROP TRIGGER IF EXISTS trigger_update_vehicle_service_stats ON public.job_cards;
-- CREATE TRIGGER trigger_update_vehicle_service_stats
--   AFTER INSERT OR UPDATE ON public.job_cards
--   FOR EACH ROW
--   EXECUTE FUNCTION public.update_vehicle_service_stats();

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Check added columns
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'customer_vehicles'
-- AND table_schema = 'public'
-- ORDER BY ordinal_position;

-- Test the service due check function
-- SELECT * FROM public.check_service_due('your-vehicle-id-here');

-- Test the expiries function
-- SELECT * FROM public.get_vehicle_expiries('your-garage-id-here', 30);

-- Query the service summary view
-- SELECT * FROM public.vehicle_service_summary;
