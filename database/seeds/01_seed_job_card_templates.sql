-- ============================================================================
-- Seed Data: Job Card Task Templates
-- Description: Sample automotive service task templates for quick job creation
-- Usage: Run this after creating the templates table to populate with sample data
-- ============================================================================

DO $$
DECLARE
  v_garage_id UUID;
  v_user_id UUID;
  v_template_id UUID;
BEGIN
  -- Get the first garage ID (or you can specify one explicitly)
  SELECT garage_uid INTO v_garage_id FROM public.garages LIMIT 1;

  -- Get the first user/employee ID for created_by
  SELECT user_uid INTO v_user_id FROM users LIMIT 1;

  IF v_garage_id IS NULL THEN
    RAISE EXCEPTION 'No garage found. Please create a garage first or specify garage_id explicitly.';
  END IF;

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'No user found in users table. Please create a user first.';
  END IF;

  -- ========================================================================
  -- ENGINE SERVICE TEMPLATES
  -- ========================================================================

  -- Template 1: Oil Change & Filter Replacement
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Oil Change & Filter Replacement',
    'oil-change-filter-replacement',
    'Complete oil change with filter replacement and fluid level check',
    'Engine',
    'medium',
    30,
    500,
    ARRAY['engine', 'maintenance', 'routine'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  -- Subtasks for Oil Change
  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Drain old oil', 'Drain engine oil completely', 10, 1),
    (v_template_id, 'Replace oil filter', 'Remove old filter and install new one', 5, 2),
    (v_template_id, 'Refill with fresh oil', 'Add recommended oil grade and quantity', 10, 3),
    (v_template_id, 'Check fluid levels', 'Verify oil level and check for leaks', 5, 4);

  -- Template 2: Engine Tune-Up
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Engine Tune-Up',
    'engine-tune-up',
    'Comprehensive engine tune-up including spark plugs, filters, and timing check',
    'Engine',
    'medium',
    120,
    650,
    ARRAY['engine', 'performance', 'maintenance'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Inspect and replace spark plugs', 'Check spark plug condition and replace if needed', 30, 1),
    (v_template_id, 'Replace air filter', 'Install new air filter for better airflow', 15, 2),
    (v_template_id, 'Check ignition timing', 'Verify and adjust ignition timing', 20, 3),
    (v_template_id, 'Inspect belts and hoses', 'Check for wear and replace if necessary', 25, 4),
    (v_template_id, 'Check fuel system', 'Inspect fuel injectors and fuel pressure', 30, 5);

  -- Template 3: Timing Belt Replacement
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Timing Belt Replacement',
    'timing-belt-replacement',
    'Replace timing belt, tensioner, and water pump',
    'Engine',
    'high',
    180,
    700,
    ARRAY['engine', 'critical', 'maintenance'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Remove engine covers', 'Access timing belt area', 30, 1),
    (v_template_id, 'Remove old timing belt', 'Carefully remove worn belt', 30, 2),
    (v_template_id, 'Replace tensioner and idler pulleys', 'Install new pulleys', 40, 3),
    (v_template_id, 'Install new timing belt', 'Align timing marks and install belt', 40, 4),
    (v_template_id, 'Replace water pump', 'Preventive replacement', 30, 5),
    (v_template_id, 'Reassemble and test', 'Put everything back and verify operation', 10, 6);

  INSERT INTO job_card_template_parts (template_id, part_name, part_number, quantity, unit_cost, is_optional, notes)
  VALUES
    (v_template_id, 'Timing Belt', NULL, 1, 2500, false, 'Use OEM or equivalent quality'),
    (v_template_id, 'Tensioner Pulley', NULL, 1, 1800, false, NULL),
    (v_template_id, 'Water Pump', NULL, 1, 3500, false, 'Preventive replacement recommended');

  -- ========================================================================
  -- ELECTRICAL TEMPLATES
  -- ========================================================================

  -- Template 4: Battery Replacement
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Battery Replacement',
    'battery-replacement',
    'Replace car battery and check charging system',
    'Electrical',
    'high',
    20,
    300,
    ARRAY['electrical', 'starting', 'critical'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Test battery condition', 'Check battery health and charge level', 5, 1),
    (v_template_id, 'Check charging system', 'Verify alternator output', 5, 2),
    (v_template_id, 'Replace battery', 'Install new battery', 10, 3);

  INSERT INTO job_card_template_parts (template_id, part_name, part_number, quantity, unit_cost, is_optional, notes)
  VALUES
    (v_template_id, 'Car Battery', NULL, 1, 4500, false, 'Verify battery size and terminal type');

  -- Template 5: Alternator Replacement
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Alternator Replacement',
    'alternator-replacement',
    'Replace faulty alternator and test charging system',
    'Electrical',
    'high',
    90,
    600,
    ARRAY['electrical', 'charging', 'critical'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Diagnose charging system', 'Confirm alternator failure', 20, 1),
    (v_template_id, 'Remove alternator', 'Disconnect and remove old unit', 30, 2),
    (v_template_id, 'Install new alternator', 'Fit new alternator and belt', 30, 3),
    (v_template_id, 'Test charging system', 'Verify proper operation', 10, 4);

  INSERT INTO job_card_template_parts (template_id, part_name, part_number, quantity, unit_cost, is_optional, notes)
  VALUES
    (v_template_id, 'Alternator Assembly', NULL, 1, 8000, false, 'OEM or remanufactured'),
    (v_template_id, 'Serpentine Belt', NULL, 1, 1200, true, 'Replace if worn');

  -- ========================================================================
  -- BRAKE TEMPLATES
  -- ========================================================================

  -- Template 6: Brake Pad Replacement (Front)
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Brake Pad Replacement - Front',
    'brake-pad-replacement-front',
    'Replace front brake pads and resurface rotors',
    'Body',
    'high',
    60,
    550,
    ARRAY['brakes', 'safety', 'maintenance'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Inspect brake system', 'Check pads, rotors, and calipers', 10, 1),
    (v_template_id, 'Remove wheel and caliper', 'Access brake assembly', 10, 2),
    (v_template_id, 'Replace brake pads', 'Install new pads', 15, 3),
    (v_template_id, 'Resurface rotors', 'Machine rotors if needed', 15, 4),
    (v_template_id, 'Reassemble and test', 'Put back together and test brakes', 10, 5);

  INSERT INTO job_card_template_parts (template_id, part_name, part_number, quantity, unit_cost, is_optional, notes)
  VALUES
    (v_template_id, 'Brake Pads (Front)', NULL, 1, 2500, false, 'Quality ceramic pads recommended'),
    (v_template_id, 'Brake Rotor (Front)', NULL, 2, 3000, true, 'Replace if below minimum thickness');

  -- Template 7: Brake Fluid Flush
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Brake Fluid Flush',
    'brake-fluid-flush',
    'Flush brake fluid and bleed all brakes',
    'Body',
    'medium',
    45,
    400,
    ARRAY['brakes', 'maintenance', 'fluids'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Inspect fluid condition', 'Check fluid color and contamination', 5, 1),
    (v_template_id, 'Flush brake fluid', 'Drain old fluid completely', 20, 2),
    (v_template_id, 'Bleed all brakes', 'Remove air from brake lines', 20, 3);

  INSERT INTO job_card_template_parts (template_id, part_name, part_number, quantity, unit_cost, is_optional, notes)
  VALUES
    (v_template_id, 'Brake Fluid (DOT 4)', NULL, 1, 800, false, '500ml bottle');

  -- ========================================================================
  -- MAINTENANCE TEMPLATES
  -- ========================================================================

  -- Template 8: Wheel Alignment
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Wheel Alignment',
    'wheel-alignment',
    'Four-wheel alignment for proper tire wear and handling',
    'Maintenance',
    'medium',
    60,
    500,
    ARRAY['maintenance', 'tires', 'handling'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Inspect suspension', 'Check for worn parts', 10, 1),
    (v_template_id, 'Check tire pressure and condition', 'Verify tire health', 10, 2),
    (v_template_id, 'Perform wheel alignment', 'Adjust camber, caster, and toe', 40, 3);

  -- Template 9: AC Service and Recharge
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'AC Service and Recharge',
    'ac-service-recharge',
    'Check AC system, leak test, and recharge refrigerant',
    'Maintenance',
    'medium',
    60,
    550,
    ARRAY['ac', 'climate', 'comfort'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Perform leak test', 'Check for refrigerant leaks', 20, 1),
    (v_template_id, 'Inspect compressor and components', 'Check AC system parts', 15, 2),
    (v_template_id, 'Recharge refrigerant', 'Fill with proper amount of R134a', 25, 3);

  INSERT INTO job_card_template_parts (template_id, part_name, part_number, quantity, unit_cost, is_optional, notes)
  VALUES
    (v_template_id, 'Refrigerant R134a', NULL, 1, 1500, false, 'Approximately 500-600g needed'),
    (v_template_id, 'AC Oil', NULL, 1, 500, true, 'Compressor oil if needed');

  -- ========================================================================
  -- DIAGNOSTIC TEMPLATES
  -- ========================================================================

  -- Template 10: Engine Diagnostic
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Engine Diagnostic',
    'engine-diagnostic',
    'Comprehensive engine diagnostic using scan tools and visual inspection',
    'Diagnostic',
    'medium',
    90,
    700,
    ARRAY['diagnostic', 'engine', 'troubleshooting'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Connect scan tool', 'Read fault codes from ECU', 20, 1),
    (v_template_id, 'Visual inspection', 'Check engine bay for obvious issues', 20, 2),
    (v_template_id, 'Test drive (if applicable)', 'Reproduce symptoms if safe', 20, 3),
    (v_template_id, 'Analyze data and diagnose', 'Determine root cause', 30, 4);

  -- Template 11: Check Engine Light Diagnostic
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Check Engine Light Diagnostic',
    'check-engine-light-diagnostic',
    'Diagnose check engine light and clear codes',
    'Diagnostic',
    'medium',
    45,
    500,
    ARRAY['diagnostic', 'warning', 'quick'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Read trouble codes', 'Retrieve stored and pending codes', 10, 1),
    (v_template_id, 'Inspect related components', 'Check affected systems', 20, 2),
    (v_template_id, 'Clear codes and verify', 'Clear codes and test fix', 15, 3);

  -- ========================================================================
  -- CUSTOM/SPECIALTY TEMPLATES
  -- ========================================================================

  -- Template 12: Headlight Restoration
  INSERT INTO job_card_templates (
    garage_id, name, slug, description, category, priority,
    estimated_minutes, labor_rate, tags, is_active, is_system_template, created_by
  ) VALUES (
    v_garage_id,
    'Headlight Restoration',
    'headlight-restoration',
    'Restore cloudy headlights for better visibility',
    'Custom',
    'low',
    60,
    400,
    ARRAY['cosmetic', 'visibility', 'detailing'],
    true,
    true,
    v_user_id
  ) RETURNING id INTO v_template_id;

  INSERT INTO job_card_template_subtasks (template_id, name, description, estimated_minutes, display_order)
  VALUES
    (v_template_id, 'Inspect headlights', 'Assess condition and restoration needs', 10, 1),
    (v_template_id, 'Sand headlights', 'Remove oxidation with sandpaper', 30, 2),
    (v_template_id, 'Polish and seal', 'Apply UV protection', 20, 3);

  INSERT INTO job_card_template_parts (template_id, part_name, part_number, quantity, unit_cost, is_optional, notes)
  VALUES
    (v_template_id, 'Headlight Restoration Kit', NULL, 1, 800, false, 'Includes sandpaper and polish'),
    (v_template_id, 'UV Sealant', NULL, 1, 500, false, 'Long-lasting protection');

  RAISE NOTICE 'Successfully seeded 12 automotive service templates for garage: %', v_garage_id;

END $$;
