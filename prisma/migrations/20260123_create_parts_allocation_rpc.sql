-- ============================================================================
-- PARTS ALLOCATION RPC FUNCTIONS
-- ============================================================================
-- This migration creates comprehensive PostgreSQL RPC functions for allocating
-- parts to job cards with proper transaction handling, stock validation, and
-- audit trail creation.
--
-- Key Features:
-- 1. Transactional execution (automatic rollback on error)
-- 2. Row locking with FOR UPDATE (prevents race conditions)
-- 3. Stock availability validation before allocation
-- 4. Automatic stock deduction (on_hand first, then warehouse)
-- 5. Creates job_card_parts records
-- 6. Creates parts_transactions audit records
-- 7. Updates job card estimated_parts_cost
-- 8. Returns detailed success/error response
--
-- Usage:
--   SELECT public.allocate_parts_to_job_card(
--     'job-card-uuid',
--     '[
--       {
--         "partId": "part-uuid",
--         "partName": "Brake Pad",
--         "partNumber": "BP-001",
--         "quantity": 2,
--         "unitPrice": 150.00,
--         "totalPrice": 300.00
--       }
--     ]'::jsonb,
--     'user-uuid',
--     'John Doe'
--   );
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Create the main allocation function
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.allocate_parts_to_job_card(
  p_job_card_id UUID,
  p_parts JSONB,
  p_user_id UUID DEFAULT NULL,
  p_user_name VARCHAR(255) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_part_record JSONB;
  v_part_id UUID;
  v_part_name VARCHAR;
  v_part_number VARCHAR;
  v_quantity INTEGER;
  v_unit_price DECIMAL;
  v_total_price DECIMAL;
  v_manufacturer VARCHAR;
  v_category VARCHAR;

  v_current_on_hand_stock INTEGER;
  v_current_warehouse_stock INTEGER;
  v_total_stock_before INTEGER;
  v_total_stock_after INTEGER;
  v_on_hand_deduction INTEGER;
  v_warehouse_deduction INTEGER;

  v_job_card_part_id UUID;
  v_garage_id UUID;
  v_job_card_number VARCHAR;

  v_total_estimated_cost DECIMAL := 0;
  v_parts_allocated INTEGER := 0;
  v_parts_failed INTEGER := 0;
BEGIN
  -- Get job card information and lock the row
  SELECT
    garage_id,
    job_card_number
  INTO v_garage_id, v_job_card_number
  FROM public.job_cards
  WHERE id = p_job_card_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Job card not found',
      'code', 'JOB_CARD_NOT_FOUND'
    );
  END IF;

  -- Iterate through each part and allocate
  FOR v_part_record IN SELECT * FROM jsonb_array_elements(p_parts)
  LOOP
    -- Extract part data from JSON
    v_part_id := v_part_record->>'partId';
    v_part_name := v_part_record->>'partName';
    v_part_number := v_part_record->>'partNumber';
    v_quantity := COALESCE((v_part_record->>'quantity')::INTEGER, 1);
    v_unit_price := COALESCE((v_part_record->>'unitPrice')::DECIMAL, 0);
    v_total_price := COALESCE((v_part_record->>'totalPrice')::DECIMAL, 0);
    v_manufacturer := v_part_record->>'manufacturer';
    v_category := v_part_record->>'category';

    -- Skip if part_id is NULL (customer-supplied or external part)
    IF v_part_id IS NULL THEN
      INSERT INTO public.job_card_parts (
        garage_id,
        job_card_id,
        part_id,
        part_name,
        part_number,
        manufacturer,
        category,
        status,
        quantity_requested,
        quantity_used,
        quantity_returned,
        unit_cost,
        unit_price,
        total_price,
        source,
        requested_by,
        estimated_unit_price
      ) VALUES (
        v_garage_id,
        p_job_card_id,
        NULL,
        v_part_name,
        v_part_number,
        v_manufacturer,
        v_category,
        'allocated',
        v_quantity,
        0,
        0,
        0,
        v_unit_price,
        v_total_price,
        CASE
          WHEN v_part_number LIKE 'EXT-%' THEN 'external'
          ELSE 'customer'
        END,
        p_user_id,
        v_unit_price
      ) RETURNING id INTO v_job_card_part_id;

      v_parts_allocated := v_parts_allocated + 1;
      v_total_estimated_cost := v_total_estimated_cost + v_total_price;
      CONTINUE;
    END IF;

    -- Lock the part row and check stock availability
    SELECT
      on_hand_stock,
      warehouse_stock,
      purchase_price
    INTO v_current_on_hand_stock, v_current_warehouse_stock, v_unit_price
    FROM public.parts
    WHERE id = v_part_id
    FOR UPDATE;

    IF NOT FOUND THEN
      v_parts_failed := v_parts_failed + 1;
      CONTINUE;
    END IF;

    -- Calculate total stock
    v_total_stock_before := COALESCE(v_current_on_hand_stock, 0) + COALESCE(v_current_warehouse_stock, 0);

    -- Check if we have enough stock
    IF v_total_stock_before < v_quantity THEN
      -- Not enough stock - create part record with 'ordered' status
      INSERT INTO public.job_card_parts (
        garage_id,
        job_card_id,
        part_id,
        part_name,
        part_number,
        manufacturer,
        category,
        status,
        quantity_requested,
        quantity_used,
        quantity_returned,
        unit_cost,
        unit_price,
        total_price,
        source,
        notes,
        requested_by,
        estimated_unit_price
      ) VALUES (
        v_garage_id,
        p_job_card_id,
        v_part_id,
        v_part_name,
        v_part_number,
        v_manufacturer,
        v_category,
        'ordered',
        v_quantity,
        0,
        0,
        0,
        v_unit_price,
        v_total_price,
        'ordered',
        'Out of stock - special order required',
        p_user_id,
        v_unit_price
      ) RETURNING id INTO v_job_card_part_id;

      v_parts_allocated := v_parts_allocated + 1;
      v_total_estimated_cost := v_total_estimated_cost + v_total_price;
      CONTINUE;
    END IF;

    -- Calculate stock deduction (on_hand first, then warehouse)
    v_on_hand_deduction := LEAST(v_quantity, COALESCE(v_current_on_hand_stock, 0));
    v_warehouse_deduction := v_quantity - v_on_hand_deduction;

    -- Update parts stock
    UPDATE public.parts
    SET
      on_hand_stock = on_hand_stock - v_on_hand_deduction,
      warehouse_stock = warehouse_stock - v_warehouse_deduction
    WHERE id = v_part_id;

    -- Calculate new total stock
    v_total_stock_after := v_total_stock_before - v_quantity;

    -- Create job_card_part record
    INSERT INTO public.job_card_parts (
      garage_id,
      job_card_id,
      part_id,
      part_name,
      part_number,
      manufacturer,
      category,
      status,
      quantity_requested,
      quantity_used,
      quantity_returned,
      unit_cost,
      unit_price,
      total_price,
      source,
      requested_by,
      estimated_unit_price
    ) VALUES (
      v_garage_id,
      p_job_card_id,
      v_part_id,
      v_part_name,
      v_part_number,
      v_manufacturer,
      v_category,
      'allocated',
      v_quantity,
      0,
      0,
      0,
      v_unit_price,
      v_total_price,
      'inventory',
      p_user_id,
      v_unit_price
    ) RETURNING id INTO v_job_card_part_id;

    -- Record transaction for stock deduction
    PERFORM public.record_job_card_part_transaction(
      v_part_id,
      v_garage_id,
      'sale',
      p_job_card_id,
      v_job_card_part_id,
      -v_quantity,
      v_unit_price,
      v_total_stock_before,
      v_total_stock_after,
      'on_hand',
      NULL,
      'job_card',
      p_job_card_id,
      v_job_card_number,
      p_user_id,
      p_user_name,
      'Allocated to job card'
    );

    v_parts_allocated := v_parts_allocated + 1;
    v_total_estimated_cost := v_total_estimated_cost + v_total_price;
  END LOOP;

  -- Update job card total estimated parts cost
  UPDATE public.job_cards
  SET estimated_parts_cost = COALESCE(estimated_parts_cost, 0) + v_total_estimated_cost
  WHERE id = p_job_card_id;

  -- Return success result
  RETURN json_build_object(
    'success', true,
    'parts_allocated', v_parts_allocated,
    'parts_failed', v_parts_failed,
    'total_estimated_cost', v_total_estimated_cost,
    'job_card_number', v_job_card_number,
    'message', format('%s parts allocated successfully', v_parts_allocated)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ----------------------------------------------------------------------------
-- Create deallocation function (returns parts to inventory)
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.deallocate_parts_from_job_card(
  p_job_card_part_id UUID,
  p_user_id UUID DEFAULT NULL,
  p_user_name VARCHAR(255) DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_job_card_part RECORD;
  v_part_stock RECORD;
  v_quantity_to_return INTEGER;
  v_job_card_number VARCHAR;
BEGIN
  -- Get job card part record
  SELECT * INTO v_job_card_part
  FROM public.job_card_parts
  WHERE id = p_job_card_part_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Job card part not found',
      'code', 'PART_NOT_FOUND'
    );
  END IF;

  -- Only allow deallocation if status is 'allocated' or 'ordered'
  IF v_job_card_part.status NOT IN ('allocated', 'ordered') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot deallocate part with status: ' || v_job_card_part.status,
      'code', 'INVALID_STATUS'
    );
  END IF;

  -- Get job card number
  SELECT job_card_number INTO v_job_card_number
  FROM public.job_cards
  WHERE id = v_job_card_part.job_card_id;

  -- If part was allocated from inventory, return stock
  IF v_job_card_part.source = 'inventory' AND v_job_card_part.part_id IS NOT NULL THEN
    -- Lock and get current part stock
    SELECT on_hand_stock, warehouse_stock INTO v_part_stock
    FROM public.parts
    WHERE id = v_job_card_part.part_id
    FOR UPDATE;

    IF FOUND THEN
      -- Calculate quantity to return (allocated - used)
      v_quantity_to_return := v_job_card_part.quantity_requested - v_job_card_part.quantity_used;

      IF v_quantity_to_return > 0 THEN
        DECLARE
          v_stock_before INTEGER;
          v_stock_after INTEGER;
        BEGIN
          v_stock_before := COALESCE(v_part_stock.on_hand_stock, 0) + COALESCE(v_part_stock.warehouse_stock, 0);

          -- Return stock to on_hand
          UPDATE public.parts
          SET on_hand_stock = on_hand_stock + v_quantity_to_return
          WHERE id = v_job_card_part.part_id;

          v_stock_after := v_stock_before + v_quantity_to_return;

          -- Record transaction
          PERFORM public.record_job_card_part_transaction(
            v_job_card_part.part_id,
            v_job_card_part.garage_id,
            'return',
            v_job_card_part.job_card_id,
            p_job_card_part_id,
            v_quantity_to_return,
            v_job_card_part.unit_cost,
            v_stock_before,
            v_stock_after,
            NULL,
            'on_hand',
            'job_card',
            v_job_card_part.job_card_id,
            v_job_card_number,
            p_user_id,
            p_user_name,
            'Part deallocated from job card'
          );
        END;
      END IF;
    END IF;
  END IF;

  -- Update or delete the job_card_part record
  DELETE FROM public.job_card_parts WHERE id = p_job_card_part_id;

  RETURN json_build_object(
    'success', true,
    'message', 'Part deallocated successfully'
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ----------------------------------------------------------------------------
-- Create part status update function with state machine validation
-- ----------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION public.update_job_card_part_status(
  p_job_card_part_id UUID,
  p_new_status VARCHAR,
  p_user_id UUID DEFAULT NULL,
  p_quantity_used INTEGER DEFAULT NULL,
  p_actual_unit_price DECIMAL DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_current_part RECORD;
  v_valid_transitions JSONB;
  v_is_valid_transition BOOLEAN;
  v_garage_id UUID;
  v_job_card_number VARCHAR;
BEGIN
  -- Get current part record and lock it
  SELECT * INTO v_current_part
  FROM public.job_card_parts
  WHERE id = p_job_card_part_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Job card part not found',
      'code', 'PART_NOT_FOUND'
    );
  END IF;

  -- Define valid state transitions
  v_valid_transitions := '{
    "allocated": ["ordered", "used", "returned", "cancelled"],
    "ordered": ["received", "cancelled"],
    "received": ["used", "returned", "cancelled"],
    "used": ["returned"],
    "returned": [],
    "cancelled": []
  }'::jsonb;

  -- Check if transition is valid
  SELECT COALESCE(
    v_valid_transitions->v_current_part->>'status' ? p_new_status,
    false
  ) INTO v_is_valid_transition;

  IF NOT v_is_valid_transition THEN
    RETURN json_build_object(
      'success', false,
      'error', format('Invalid status transition from %s to %s', v_current_part.status, p_new_status),
      'code', 'INVALID_TRANSITION',
      'current_status', v_current_part.status,
      'requested_status', p_new_status
    );
  END IF;

  -- Get job card number
  SELECT job_card_number INTO v_job_card_number
  FROM public.job_cards
  WHERE id = v_current_part.job_card_id;

  -- Update the part record
  UPDATE public.job_card_parts
  SET
    status = p_new_status,
    quantity_used = COALESCE(p_quantity_used, quantity_used),
    actual_unit_price = COALESCE(p_actual_unit_price, actual_unit_price),
    used_by = COALESCE(p_user_id, used_by),
    updated_at = NOW()
  WHERE id = p_job_card_part_id;

  -- If moving to 'used' status, record usage transaction
  IF p_new_status = 'used' AND v_current_part.part_id IS NOT NULL THEN
    DECLARE
      v_part_stock RECORD;
      v_stock_before INTEGER;
      v_stock_after INTEGER;
    BEGIN
      SELECT on_hand_stock, warehouse_stock INTO v_part_stock
      FROM public.parts
      WHERE id = v_current_part.part_id;

      v_stock_before := COALESCE(v_part_stock.on_hand_stock, 0) + COALESCE(v_part_stock.warehouse_stock, 0);
      v_stock_after := v_stock_before; -- No stock change (already deducted at allocation)

      -- Record usage transaction (zero quantity, just for tracking)
      PERFORM public.record_job_card_part_transaction(
        v_current_part.part_id,
        v_current_part.garage_id,
        'sale',
        v_current_part.job_card_id,
        p_job_card_part_id,
        0,
        COALESCE(p_actual_unit_price, v_current_part.unit_price),
        v_stock_before,
        v_stock_after,
        NULL,
        NULL,
        'job_card',
        v_current_part.job_card_id,
        v_job_card_number,
        p_user_id,
        NULL,
        'Part marked as used'
      );
    END;
  END IF;

  RETURN json_build_object(
    'success', true,
    'status', p_new_status,
    'message', format('Part status updated to %s', p_new_status)
  );

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

-- ----------------------------------------------------------------------------
-- Grant execute permissions
-- ----------------------------------------------------------------------------

GRANT EXECUTE ON FUNCTION public.allocate_parts_to_job_card TO authenticated;
GRANT EXECUTE ON FUNCTION public.deallocate_parts_from_job_card TO authenticated;
GRANT EXECUTE ON FUNCTION public.update_job_card_part_status TO authenticated;
GRANT EXECUTE ON FUNCTION public.record_job_card_part_transaction TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_job_card_transaction_history TO authenticated;

-- ----------------------------------------------------------------------------
-- Success notification
-- ----------------------------------------------------------------------------

DO $$
BEGIN
  RAISE NOTICE 'Parts allocation RPC functions created successfully';
END $$;
