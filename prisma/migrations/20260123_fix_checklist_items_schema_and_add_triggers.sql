-- ============================================================================
-- FIX JOB CARD CHECKLIST ITEMS SCHEMA MISMATCH
-- ============================================================================
-- This migration fixes the mismatch between the database schema and the
-- TypeScript code expectations for job_card_checklist_items table.
--
-- Changes:
-- 1. Rename columns to match code expectations
-- 2. Add missing columns for timer tracking, cost tracking, etc.
-- 3. Add trigger for automatic status history tracking
-- 4. Add function to calculate labor costs from checklist items
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Step 1: Rename existing columns to match code expectations
-- ----------------------------------------------------------------------------

-- Drop existing foreign key constraints that reference old column names
ALTER TABLE public.job_card_checklist_items DROP CONSTRAINT IF EXISTS fk_checklist_assigned_to;
ALTER TABLE public.job_card_checklist_items DROP CONSTRAINT IF EXISTS fk_checklist_assigned_by;
ALTER TABLE public.job_card_checklist_items DROP CONSTRAINT IF EXISTS fk_checklist_approved_by;

-- Rename core columns
ALTER TABLE public.job_card_checklist_items RENAME COLUMN task_name TO item_name;
ALTER TABLE public.job_card_checklist_items RENAME COLUMN task_description TO description;
ALTER TABLE public.job_card_checklist_items RENAME COLUMN task_category TO category;

-- Rename assignment columns
ALTER TABLE public.job_card_checklist_items RENAME COLUMN assigned_to TO mechanic_id;
-- Note: approved_by, started_at, completed_at already have correct names

-- ----------------------------------------------------------------------------
-- Step 1.5: Drop obsolete columns and add missing columns
-- ----------------------------------------------------------------------------

-- Drop obsolete columns that are no longer needed
ALTER TABLE public.job_card_checklist_items DROP COLUMN IF EXISTS assigned_by;
ALTER TABLE public.job_card_checklist_items DROP COLUMN IF EXISTS assigned_at;
ALTER TABLE public.job_card_checklist_items DROP COLUMN IF EXISTS is_required;

-- Add created_by column (new tracking column)
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS created_by UUID;

-- Populate created_by from mechanic_id for existing records
UPDATE public.job_card_checklist_items
SET created_by = mechanic_id
WHERE created_by IS NULL;

-- ----------------------------------------------------------------------------
-- Step 2: Add missing columns that the code expects
-- ----------------------------------------------------------------------------

-- Timer tracking columns
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS is_timer_running BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS timer_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_time_spent INTEGER DEFAULT 0;

-- Cost tracking columns
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS labor_rate DECIMAL(10, 2) DEFAULT 0,
  ADD COLUMN IF NOT EXISTS labor_cost DECIMAL(10, 2) DEFAULT 0;

-- Additional tracking columns
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS mechanic_notes TEXT,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Fix garage_id column (should exist but adding for safety)
ALTER TABLE public.job_card_checklist_items
  ADD COLUMN IF NOT EXISTS garage_id UUID;

-- ----------------------------------------------------------------------------
-- Step 3: Update garage_id from job_cards for existing records
-- ----------------------------------------------------------------------------

UPDATE public.job_card_checklist_items jci
SET garage_id = (
  SELECT jc.garage_id
  FROM public.job_cards jc
  WHERE jc.id = jci.job_card_id
)
WHERE jci.garage_id IS NULL;

-- Make garage_id NOT NULL after filling it
ALTER TABLE public.job_card_checklist_items
  ALTER COLUMN garage_id SET NOT NULL;

-- ----------------------------------------------------------------------------
-- Step 4: Recreate foreign key constraints with new column names
-- ----------------------------------------------------------------------------

ALTER TABLE public.job_card_checklist_items
  ADD CONSTRAINT fk_checklist_mechanic_id
    FOREIGN KEY (mechanic_id)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL;

ALTER TABLE public.job_card_checklist_items
  ADD CONSTRAINT fk_checklist_created_by
    FOREIGN KEY (created_by)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL;

ALTER TABLE public.job_card_checklist_items
  ADD CONSTRAINT fk_checklist_approved_by
    FOREIGN KEY (approved_by)
    REFERENCES public.garage_auth(user_uid)
    ON DELETE SET NULL;

-- ----------------------------------------------------------------------------
-- Step 5: Create trigger for automatic status history tracking
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.track_job_card_status_history()
RETURNS TRIGGER AS $$
DECLARE
  v_user_name VARCHAR(255);
BEGIN
  -- Get user name from garage_auth if available
  SELECT CONCAT(first_name, ' ', last_name) INTO v_user_name
  FROM public.garage_auth
  WHERE user_uid = NEW.created_by
  LIMIT 1;

  -- If no user found, use system
  IF v_user_name IS NULL THEN
    v_user_name := 'System';
  END IF;

  -- Insert status history record if status actually changed
  IF TG_OP = 'INSERT' THEN
    -- New job card - record initial status
    INSERT INTO public.job_card_status_history (
      garage_id,
      job_card_id,
      old_status,
      new_status,
      changed_by,
      changed_by_name,
      changed_at
    ) VALUES (
      NEW.garage_id,
      NEW.id,
      NULL,
      NEW.status,
      NEW.created_by,
      v_user_name,
      NOW()
    );
  ELSIF TG_OP = 'UPDATE' AND OLD.status IS DISTINCT FROM NEW.status THEN
    -- Status changed - record the transition
    INSERT INTO public.job_card_status_history (
      garage_id,
      job_card_id,
      old_status,
      new_status,
      changed_by,
      changed_by_name,
      changed_at
    ) VALUES (
      NEW.garage_id,
      NEW.id,
      OLD.status,
      NEW.status,
      NEW.created_by,
      v_user_name,
      NOW()
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create trigger
DROP TRIGGER IF EXISTS job_card_status_change_tracker ON public.job_cards;
CREATE TRIGGER job_card_status_change_tracker
  AFTER INSERT OR UPDATE OF status ON public.job_cards
  FOR EACH ROW
  EXECUTE FUNCTION public.track_job_card_status_history();

-- ----------------------------------------------------------------------------
-- Step 6: Create function to calculate labor costs from checklist items
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.calculate_job_card_labor_costs(p_job_card_id UUID)
RETURNS DECIMAL AS $$
DECLARE
  v_total_labor_cost DECIMAL := 0;
BEGIN
  -- Calculate total labor cost from all checklist items
  SELECT COALESCE(SUM(
    (estimated_minutes::DECIMAL / 60) * COALESCE(labor_rate, 0)
  ), 0) INTO v_total_labor_cost
  FROM public.job_card_checklist_items
  WHERE job_card_id = p_job_card_id
    AND deleted_at IS NULL;

  -- Update the job card
  UPDATE public.job_cards
  SET estimated_labor_cost = v_total_labor_cost
  WHERE id = p_job_card_id;

  RETURN v_total_labor_cost;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.calculate_job_card_labor_costs(UUID) TO authenticated;

-- ----------------------------------------------------------------------------
-- Step 7: Create trigger to auto-calculate labor costs on checklist change
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.auto_calculate_labor_costs()
RETURNS TRIGGER AS $$
BEGIN
  -- Recalculate labor costs when checklist items are inserted, updated, or deleted
  IF TG_OP = 'INSERT' THEN
    PERFORM public.calculate_job_card_labor_costs(NEW.job_card_id);
    RETURN NEW;
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.calculate_job_card_labor_costs(NEW.job_card_id);
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.calculate_job_card_labor_costs(OLD.job_card_id);
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- Create triggers for checklist items
DROP TRIGGER IF EXISTS checklist_items_labor_cost_trigger ON public.job_card_checklist_items;
CREATE TRIGGER checklist_items_labor_cost_trigger
  AFTER INSERT OR UPDATE OR DELETE ON public.job_card_checklist_items
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_calculate_labor_costs();

-- ----------------------------------------------------------------------------
-- Step 8: Add comments for documentation
-- ----------------------------------------------------------------------------

COMMENT ON COLUMN public.job_card_checklist_items.item_name IS 'Name of the task/checklist item';
COMMENT ON COLUMN public.job_card_checklist_items.description IS 'Detailed description of the task';
COMMENT ON COLUMN public.job_card_checklist_items.category IS 'Task category for grouping';
COMMENT ON COLUMN public.job_card_checklist_items.mechanic_id IS 'Assigned mechanic (was assigned_to)';
COMMENT ON COLUMN public.job_card_checklist_items.created_by IS 'User who created this task (was assigned_by)';
COMMENT ON COLUMN public.job_card_checklist_items.is_timer_running IS 'Whether the timer is currently running';
COMMENT ON COLUMN public.job_card_checklist_items.timer_started_at IS 'When the current timer session started';
COMMENT ON COLUMN public.job_card_checklist_items.total_time_spent IS 'Total accumulated time in seconds';
COMMENT ON COLUMN public.job_card_checklist_items.labor_rate IS 'Hourly labor rate for this task';
COMMENT ON COLUMN public.job_card_checklist_items.labor_cost IS 'Calculated labor cost (minutes * rate)';
COMMENT ON COLUMN public.job_card_checklist_items.mechanic_notes IS 'Notes from the mechanic';

COMMENT ON FUNCTION public.track_job_card_status_history() IS 'Automatically logs status changes to job_card_status_history table';
COMMENT ON FUNCTION public.calculate_job_card_labor_costs(UUID) IS 'Calculates total labor cost from all checklist items';
COMMENT ON FUNCTION public.auto_calculate_labor_costs() IS 'Trigger function to recalculate labor costs when checklist items change';

-- ----------------------------------------------------------------------------
-- Step 9: Recalculate labor costs for existing job cards
-- ----------------------------------------------------------------------------

-- Update all existing job cards with labor costs
DO $$
DECLARE
  v_job_card RECORD;
BEGIN
  FOR v_job_card IN SELECT DISTINCT id FROM public.job_cards LOOP
    PERFORM public.calculate_job_card_labor_costs(v_job_card.id);
  END LOOP;
END $$;

-- ----------------------------------------------------------------------------
-- Success notification
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE 'Job card checklist items schema fixed and triggers created successfully';
  RAISE NOTICE '- Columns renamed to match TypeScript expectations';
  RAISE NOTICE '- Missing columns added (timer tracking, cost tracking)';
  RAISE NOTICE '- Status history trigger created';
  RAISE NOTICE '- Labor cost auto-calculation trigger created';
END $$;
