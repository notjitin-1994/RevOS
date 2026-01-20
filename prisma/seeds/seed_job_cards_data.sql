-- ============================================================================
-- JOB CARDS SEED DATA
-- ============================================================================
-- This file contains dummy/seed data for testing the job cards system
-- Run this after the migration to populate tables with sample data
-- ============================================================================

-- ============================================================================
-- STEP 1: GET GARAGE ID AND SAMPLE USER IDs
-- ============================================================================
-- Note: You'll need to replace these UUIDs with actual values from your database
-- Run: SELECT id, garage_id FROM public.garage_auth LIMIT 5;
-- ============================================================================

DO $$
DECLARE
  v_garage_id UUID := '00000000-0000-0000-0000-000000000000'; -- REPLACE WITH ACTUAL GARAGE ID
  v_service_advisor_id UUID := '00000000-0000-0000-0000-000000000001'; -- REPLACE WITH ACTUAL USER ID
  v_mechanic_1_id UUID := '00000000-0000-0000-0000-000000000002'; -- REPLACE WITH ACTUAL USER ID
  v_mechanic_2_id UUID := '00000000-0000-0000-0000-000000000003'; -- REPLACE WITH ACTUAL USER ID
  v_customer_1_id UUID := '00000000-0000-0000-0000-000000000010'; -- REPLACE WITH ACTUAL CUSTOMER ID
  v_customer_2_id UUID := '00000000-0000-0000-0000-000000000011'; -- REPLACE WITH ACTUAL CUSTOMER ID
  v_customer_3_id UUID := '00000000-0000-0000-0000-000000000012'; -- REPLACE WITH ACTUAL CUSTOMER ID
  v_vehicle_1_id UUID := '00000000-0000-0000-0000-000000000020'; -- REPLACE WITH ACTUAL VEHICLE ID
  v_vehicle_2_id UUID := '00000000-0000-0000-0000-000000000021'; -- REPLACE WITH ACTUAL VEHICLE ID
  v_vehicle_3_id UUID := '00000000-0000-0000-0000-000000000022'; -- REPLACE WITH ACTUAL VEHICLE ID

  v_job_card_1_id UUID;
  v_job_card_2_id UUID;
  v_job_card_3_id UUID;
  v_job_card_4_id UUID;
BEGIN

  -- ============================================================================
  -- STEP 2: INSERT SAMPLE JOB CARDS
  -- ============================================================================

  -- Job Card 1: Engine Timing Belt Replacement (In Progress)
  INSERT INTO public.job_cards (
    id,
    garage_id,
    job_card_number,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    vehicle_id,
    vehicle_make,
    vehicle_model,
    vehicle_year,
    vehicle_license_plate,
    vehicle_vin,
    current_mileage,
    status,
    priority,
    job_type,
    customer_complaint,
    work_requested,
    customer_notes,
    reported_issue,
    customer_reported_issues,
    work_requested_items,
    technical_diagnosis_items,
    tags,
    job_tags,
    promised_date,
    promised_time,
    service_advisor_id,
    lead_mechanic_id,
    estimated_labor_minutes,
    actual_labor_minutes,
    estimated_labor_cost,
    actual_labor_cost,
    estimated_parts_cost,
    actual_parts_cost,
    discount_amount,
    tax_amount,
    final_amount,
    payment_status,
    source,
    vehicle_condition_on_arrival,
    drop_off_mileage,
    drop_off_fuel_level,
    vehicle_images,
    internal_notes,
    mechanic_notes,
    service_advisor_notes,
    warranty_type,
    warranty_months,
    warranty_km,
    created_at,
    updated_at,
    created_by
  ) VALUES (
    gen_random_uuid(),
    v_garage_id,
    'JC-2025-0001',
    v_customer_1_id,
    'Rajesh Kumar',
    '+91 98765 43210',
    'rajesh.kumar@email.com',
    v_vehicle_1_id,
    'Honda',
    'Activa 6G',
    2023,
    'KA-03-EM-2345',
    'MA1JB5412MC345678',
    45000,
    'in_progress',
    'high',
    'repair',
    'Engine making strange grinding noise when accelerating above 40 km/h',
    'Diagnose and fix engine noise, Check suspension system, Inspect and replace brake pads if needed',
    'Please call before doing any major work. I need the vehicle back by Tuesday evening.',
    'Engine making strange grinding noise when accelerating above 40 km/h',
    '["Engine making strange grinding noise when accelerating above 40 km/h", "Vehicle vibrating at high speeds", "Brake pads making squeaking noise"]'::jsonb,
    '["Diagnose and fix engine noise", "Check suspension system", "Inspect and replace brake pads if needed", "General service check"]'::jsonb,
    '["Timing belt worn out - needs replacement", "Tensioner showing signs of wear", "Front wheel bearings need attention"]'::jsonb,
    '["engine", "timing-belt", "priority"]'::jsonb,
    '["critical", "warranty-job"]'::jsonb,
    '2025-01-20',
    '14:00',
    v_service_advisor_id,
    v_mechanic_1_id,
    450,
    120,
    4500.00,
    3850.00,
    3200.00,
    3175.00,
    0,
    0,
    7025.00,
    'pending',
    'walk-in',
    'Fair condition, some scratches on front fairing',
    45000,
    'half',
    '[]'::jsonb,
    'Customer is a regular, prioritize this job. He has referred 3 other customers.',
    'Need to check timing belt and tensioner. Customer mentioned noise started after last service from another garage.',
    'Customer called and is concerned about cost. Keep him updated.',
    'Parts warranty',
    6,
    5000,
    NOW() - INTERVAL '2 days',
    NOW() - INTERVAL '1 hour',
    v_service_advisor_id
  )
  RETURNING id INTO v_job_card_1_id;

  -- Job Card 2: Brake System Service (Queued)
  INSERT INTO public.job_cards (
    id,
    garage_id,
    job_card_number,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    vehicle_id,
    vehicle_make,
    vehicle_model,
    vehicle_year,
    vehicle_license_plate,
    vehicle_vin,
    current_mileage,
    status,
    priority,
    job_type,
    customer_complaint,
    work_requested,
    customer_notes,
    reported_issue,
    customer_reported_issues,
    work_requested_items,
    technical_diagnosis_items,
    tags,
    job_tags,
    promised_date,
    promised_time,
    service_advisor_id,
    lead_mechanic_id,
    estimated_labor_minutes,
    estimated_labor_cost,
    estimated_parts_cost,
    discount_amount,
    tax_amount,
    final_amount,
    payment_status,
    source,
    vehicle_condition_on_arrival,
    drop_off_mileage,
    drop_off_fuel_level,
    internal_notes,
    mechanic_notes,
    warranty_type,
    warranty_months,
    warranty_km,
    created_at,
    updated_at,
    created_by
  ) VALUES (
    gen_random_uuid(),
    v_garage_id,
    'JC-2025-0002',
    v_customer_2_id,
    'Priya Sharma',
    '+91 98765 54321',
    'priya.sharma@email.com',
    v_vehicle_2_id,
    'Hero',
    'Splendor+',
    2022,
    'KA-01-AB-1234',
    'MBLHERO123456',
    28000,
    'queued',
    'medium',
    'maintenance',
    'Brakes are not working properly. Need to check brake pads and fluid',
    'Complete brake system check, Replace brake pads if needed, Flush and replace brake fluid',
    'This is my daily commute vehicle. Please complete it as soon as possible.',
    'Brakes are not working properly. Need to check brake pads and fluid',
    '["Brakes feel spongy", "Brake lever travels too far", "Unusual noise when braking"]'::jsonb,
    '["Complete brake system check", "Replace front brake pads", "Replace rear brake shoes", "Flush and replace brake fluid"]'::jsonb,
    '["Brake fluid contaminated with water", "Front brake pads worn to 2mm", "Rear brake shoes worn out"]'::jsonb,
    '["brakes", "safety", "maintenance"]'::jsonb,
    '["maintenance", "scheduled"]'::jsonb,
    '2025-01-22',
    '10:00',
    v_service_advisor_id,
    v_mechanic_2_id,
    180,
    1500.00,
    2500.00,
    100,
    340,
    3840.00,
    'pending',
    'phone',
    'Good condition, well maintained',
    28000,
    'three-quarter',
    'First time customer. Provide good service.',
    NULL,
    'Labor warranty',
    3,
    1000,
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '1 day',
    v_service_advisor_id
  )
  RETURNING id INTO v_job_card_2_id;

  -- Job Card 3: General Service (Ready)
  INSERT INTO public.job_cards (
    id,
    garage_id,
    job_card_number,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    vehicle_id,
    vehicle_make,
    vehicle_model,
    vehicle_year,
    vehicle_license_plate,
    vehicle_vin,
    current_mileage,
    status,
    priority,
    job_type,
    customer_complaint,
    work_requested,
    customer_notes,
    reported_issue,
    customer_reported_issues,
    work_requested_items,
    technical_diagnosis_items,
    tags,
    job_tags,
    promised_date,
    promised_time,
    actual_completion_date,
    service_advisor_id,
    lead_mechanic_id,
    estimated_labor_minutes,
    actual_labor_minutes,
    estimated_labor_cost,
    actual_labor_cost,
    estimated_parts_cost,
    actual_parts_cost,
    discount_amount,
    tax_amount,
    final_amount,
    payment_status,
    payment_method,
    payment_date,
    source,
    vehicle_condition_on_arrival,
    drop_off_mileage,
    drop_off_fuel_level,
    internal_notes,
    mechanic_notes,
    service_advisor_notes,
    quality_check_notes,
    quality_checked,
    warranty_type,
    warranty_months,
    warranty_km,
    created_at,
    updated_at,
    created_by
  ) VALUES (
    gen_random_uuid(),
    v_garage_id,
    'JC-2025-0003',
    v_customer_3_id,
    'Amit Patel',
    '+91 98765 65432',
    'amit.patel@email.com',
    v_vehicle_3_id,
    'Bajaj',
    'Pulsar NS200',
    2021,
    'MH-02-CD-5678',
    'MD2AABCD123456',
    35000,
    'ready',
    'low',
    'maintenance',
    'Scheduled 4th free service. Vehicle is running fine otherwise.',
    '4th Free Service - Oil change, filter replacement, chain adjustment, brake check, general inspection',
    NULL,
    NULL,
    '["Vehicle due for scheduled service"]'::jsonb,
    '["Engine oil and filter change", "Air filter cleaning/replacement", "Chain adjustment and lubrication", "Brake system check", "Throttle and clutch cable lubrication"]'::jsonb,
    '["All systems normal, just routine maintenance needed"]'::jsonb,
    '["service", "routine", "free-service"]'::jsonb,
    '["warranty", "free-service"]'::jsonb,
    '2025-01-18',
    '16:00',
    NOW() - INTERVAL '2 hours',
    v_service_advisor_id,
    v_mechanic_1_id,
    90,
    85,
    750.00,
    700.00,
    1200.00,
    1150.00,
    0,
    0,
    1850.00,
    'paid',
    'upi',
    NOW() - INTERVAL '2 hours',
    'web',
    'Excellent condition, very well maintained',
    35000,
    'full',
    '4th free service as per warranty.',
    'Vehicle in great shape. All services completed.',
    NULL,
    'All checks passed. Vehicle ready for delivery.',
    true,
    'Free service warranty',
    6,
    5000,
    NOW() - INTERVAL '3 days',
    NOW() - INTERVAL '2 hours',
    v_service_advisor_id
  )
  RETURNING id INTO v_job_card_3_id;

  -- Job Card 4: Electrical System Repair (Parts Waiting)
  INSERT INTO public.job_cards (
    id,
    garage_id,
    job_card_number,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    vehicle_id,
    vehicle_make,
    vehicle_model,
    vehicle_year,
    vehicle_license_plate,
    vehicle_vin,
    current_mileage,
    status,
    priority,
    job_type,
    customer_complaint,
    work_requested,
    customer_notes,
    reported_issue,
    customer_reported_issues,
    work_requested_items,
    technical_diagnosis_items,
    tags,
    job_tags,
    promised_date,
    promised_time,
    service_advisor_id,
    lead_mechanic_id,
    estimated_labor_minutes,
    estimated_labor_cost,
    estimated_parts_cost,
    discount_amount,
    tax_amount,
    final_amount,
    payment_status,
    source,
    vehicle_condition_on_arrival,
    drop_off_mileage,
    drop_off_fuel_level,
    internal_notes,
    mechanic_notes,
    service_advisor_notes,
    warranty_type,
    warranty_months,
    warranty_km,
    created_at,
    updated_at,
    created_by
  ) VALUES (
    gen_random_uuid(),
    v_garage_id,
    'JC-2025-0004',
    v_customer_1_id,
    'Rajesh Kumar',
    '+91 98765 43210',
    'rajesh.kumar@email.com',
    v_vehicle_1_id,
    'Honda',
    'Activa 6G',
    2023,
    'KA-03-EM-2345',
    'MA1JB5412MC345678',
    45000,
    'parts_waiting',
    'urgent',
    'repair',
    'Battery not charging. Self-start not working. Need to kick start.',
    'Check battery and charging system, Replace battery if needed, Check regulator/rectifier',
    'Urgent! I use this for daily office commute.',
    'Battery not charging. Self-start not working. Need to kick start.',
    '["Battery dead every morning", "Self-start not working", "Headlight dim at idle"]'::jsonb,
    '["Battery voltage check", "Charging system test", "Load test on alternator", "Check regulator/rectifier"]'::jsonb,
    '["Battery failed load test - needs replacement", "Regulator/rectifier faulty - needs replacement"]'::jsonb,
    '["electrical", "battery", "charging", "urgent"]'::jsonb,
    '["repeat-customer", "urgent"]'::jsonb,
    '2025-01-21',
    '12:00',
    v_service_advisor_id,
    v_mechanic_2_id,
    90,
    900.00,
    5500.00,
    0,
    0,
    6400.00,
    'pending',
    'walk-in',
    'Fair condition',
    45000,
    'quarter',
    'Repeat customer - Rajesh Kumar.',
    'Ordered battery and regulator. Should arrive tomorrow.',
    'Customer updated about parts delay.',
    'Parts warranty',
    6,
    5000,
    NOW() - INTERVAL '3 hours',
    NOW() - INTERVAL '30 minutes',
    v_service_advisor_id
  )
  RETURNING id INTO v_job_card_4_id;

  -- ============================================================================
  -- STEP 3: INSERT CHECKLIST ITEMS FOR JOB CARD 1
  -- ============================================================================

  -- Task 1: Diagnose engine noise issue
  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category,
    status, priority,
    estimated_minutes, actual_minutes,
    labor_rate, labor_cost,
    display_order,
    linked_issues, linked_service_items, linked_diagnosis_items,
    tags, notes,
    completed_at,
    started_at
  ) VALUES (
    gen_random_uuid(), v_garage_id, v_job_card_1_id,
    'Diagnose engine noise issue', 'Perform thorough inspection of engine compartment, check timing belt, tensioner, and related components', 'Engine',
    'completed', 'high',
    90, 120,
    600, 1200.00,
    1,
    '[0]'::jsonb, '[0]'::jsonb, '[0, 1]'::jsonb,
    '["diagnostics", "engine"]'::jsonb,
    'Noise confirmed from timing belt area',
    NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '2 days'
  );

  -- Task 2: Replace timing belt and tensioner
  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category,
    status, priority,
    estimated_minutes, actual_minutes,
    labor_rate, labor_cost,
    display_order,
    linked_issues, linked_service_items, linked_diagnosis_items,
    tags, notes,
    started_at
  ) VALUES (
    gen_random_uuid(), v_garage_id, v_job_card_1_id,
    'Replace timing belt and tensioner', 'Replace worn timing belt and tensioner assembly, re-time engine, verify operation', 'Engine',
    'in_progress', 'high',
    180, 90,
    700, 1050.00,
    2,
    '[0]'::jsonb, '[0]'::jsonb, '[0, 1]'::jsonb,
    '["engine", "timing-belt", "critical"]'::jsonb,
    'Parts received, in progress',
    NOW() - INTERVAL '5 hours'
  );

  -- Task 3: Check suspension for vibration
  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category,
    status, priority,
    estimated_minutes, actual_minutes,
    labor_rate, labor_cost,
    display_order,
    linked_issues, linked_service_items, linked_diagnosis_items,
    tags
  ) VALUES (
    gen_random_uuid(), v_garage_id, v_job_card_1_id,
    'Check suspension for vibration', 'Inspect front and rear suspension, check wheel bearings, check tire balance', 'Suspension',
    'pending', 'medium',
    120, 0,
    550, 1100.00,
    3,
    '[1]'::jsonb, '[1]'::jsonb, '[2]'::jsonb,
    '["suspension", "vibration"]'::jsonb
  );

  -- Task 4: Inspect and replace brake pads
  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category,
    status, priority,
    estimated_minutes, actual_minutes,
    labor_rate, labor_cost,
    display_order,
    linked_issues, linked_service_items,
    tags
  ) VALUES (
    gen_random_uuid(), v_garage_id, v_job_card_1_id,
    'Inspect and replace brake pads', 'Check front and rear brake pads, measure thickness, replace if worn', 'Brakes',
    'pending', 'low',
    60, 0,
    500, 500.00,
    4,
    '[2]'::jsonb, '[2]'::jsonb,
    '["brakes", "safety"]'::jsonb
  );

  -- ============================================================================
  -- STEP 4: INSERT SUBTASKS FOR TASK 2
  -- ============================================================================

  -- Get the task 2 ID
  -- Assuming the second task was inserted last, you may need to adjust this

  -- Subtask 1: Drain coolant
  INSERT INTO public.job_card_subtasks (
    garage_id, job_card_id, parent_task_id,
    subtask_name, description, estimated_minutes, completed, display_order
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    (SELECT id FROM public.job_card_checklist_items WHERE job_card_id = v_job_card_1_id AND item_name = 'Replace timing belt and tensioner' LIMIT 1),
    'Drain coolant', 'Drain radiator coolant', 20, true, 1
  );

  -- Subtask 2: Remove old belt
  INSERT INTO public.job_card_subtasks (
    garage_id, job_card_id, parent_task_id,
    subtask_name, description, estimated_minutes, completed, display_order
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    (SELECT id FROM public.job_card_checklist_items WHERE job_card_id = v_job_card_1_id AND item_name = 'Replace timing belt and tensioner' LIMIT 1),
    'Remove old belt', 'Remove timing belt cover and old belt', 40, true, 2
  );

  -- Subtask 3: Install new belt
  INSERT INTO public.job_card_subtasks (
    garage_id, job_card_id, parent_task_id,
    subtask_name, description, estimated_minutes, completed, display_order
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    (SELECT id FROM public.job_card_checklist_items WHERE job_card_id = v_job_card_1_id AND item_name = 'Replace timing belt and tensioner' LIMIT 1),
    'Install new belt', 'Install new timing belt', 60, true, 3
  );

  -- Subtask 4: Re-time engine
  INSERT INTO public.job_card_subtasks (
    garage_id, job_card_id, parent_task_id,
    subtask_name, description, estimated_minutes, completed, display_order
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    (SELECT id FROM public.job_card_checklist_items WHERE job_card_id = v_job_card_1_id AND item_name = 'Replace timing belt and tensioner' LIMIT 1),
    'Re-time engine', 'Set timing correctly', 40, false, 4
  );

  -- Subtask 5: Refill coolant
  INSERT INTO public.job_card_subtasks (
    garage_id, job_card_id, parent_task_id,
    subtask_name, description, estimated_minutes, completed, display_order
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    (SELECT id FROM public.job_card_checklist_items WHERE job_card_id = v_job_card_1_id AND item_name = 'Replace timing belt and tensioner' LIMIT 1),
    'Refill coolant', 'Refill with fresh coolant', 10, false, 5
  );

  -- Subtask 6: Test start engine
  INSERT INTO public.job_card_subtasks (
    garage_id, job_card_id, parent_task_id,
    subtask_name, description, estimated_minutes, completed, display_order
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    (SELECT id FROM public.job_card_checklist_items WHERE job_card_id = v_job_card_1_id AND item_name = 'Replace timing belt and tensioner' LIMIT 1),
    'Test start engine', 'Start and verify operation', 10, false, 6
  );

  -- ============================================================================
  -- STEP 5: INSERT PARTS FOR JOB CARD 1
  -- ============================================================================

  INSERT INTO public.job_card_parts (
    garage_id, job_card_id, part_id,
    part_number, part_name, category,
    status, quantity_requested, quantity_used,
    unit_cost, unit_price,
    notes
  ) VALUES (
    v_garage_id, v_job_card_1_id, NULL,
    'TB-HON-2023-001', 'Timing Belt', 'Engine',
    'received', 1, 0,
    1500.00, 1800.00,
    'Genuine Honda part'
  );

  INSERT INTO public.job_card_parts (
    garage_id, job_card_id, part_id,
    part_number, part_name, category,
    status, quantity_requested, quantity_used,
    unit_cost, unit_price,
    notes
  ) VALUES (
    v_garage_id, v_job_card_1_id, NULL,
    'TBT-HON-2023-045', 'Timing Belt Tensioner', 'Engine',
    'received', 1, 0,
    1000.00, 1200.00,
    'Genuine Honda part'
  );

  INSERT INTO public.job_card_parts (
    garage_id, job_card_id, part_id,
    part_number, part_name, category,
    status, quantity_requested, quantity_used,
    unit_cost, unit_price,
    notes
  ) VALUES (
    v_garage_id, v_job_card_1_id, NULL,
    'OIL-4T-10W30-1L', 'Engine Oil (for diagnosis)', 'Engine',
    'used', 1, 0.5,
    300.00, 350.00,
    'Used during initial diagnosis'
  );

  -- ============================================================================
  -- STEP 6: INSERT ACTIVITY LOG FOR JOB CARD 1
  -- ============================================================================

  INSERT INTO public.job_card_activity_log (
    garage_id, job_card_id,
    activity_type, title, description,
    author_id, author_name, author_role
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    'status_change', 'Job card created', 'New job card created for engine noise diagnosis',
    v_service_advisor_id, 'Vikram Singh', 'Service Advisor'
  );

  INSERT INTO public.job_card_activity_log (
    garage_id, job_card_id,
    activity_type, title, description,
    author_id, author_name, author_role
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    'assignment', 'Amit Sharma assigned as lead mechanic', NULL,
    v_service_advisor_id, 'Vikram Singh', 'Service Advisor'
  );

  INSERT INTO public.job_card_activity_log (
    garage_id, job_card_id,
    activity_type, title, description,
    author_id, author_name, author_role
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    'task_update', 'Task "Diagnose engine noise issue" completed', 'Confirmed timing belt issue, replacement recommended',
    v_mechanic_1_id, 'Amit Sharma', 'Mechanic'
  );

  INSERT INTO public.job_card_activity_log (
    garage_id, job_card_id,
    activity_type, title, description,
    author_id, author_name, author_role
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    'part_added', 'Parts ordered', 'Timing Belt and Tensioner ordered from supplier',
    v_mechanic_1_id, 'Amit Sharma', 'Mechanic'
  );

  INSERT INTO public.job_card_activity_log (
    garage_id, job_card_id,
    activity_type, title, description,
    author_id, author_name, author_role
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    'time_logged', 'Time logged for task "Replace timing belt"', '90 minutes logged',
    v_mechanic_1_id, 'Amit Sharma', 'Mechanic'
  );

  -- ============================================================================
  -- STEP 7: INSERT STATUS HISTORY FOR JOB CARD 1
  -- ============================================================================

  INSERT INTO public.job_card_status_history (
    garage_id, job_card_id,
    old_status, new_status,
    changed_by, changed_by_name, change_reason
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    NULL, 'draft',
    v_service_advisor_id, 'Vikram Singh', 'Job card created'
  );

  INSERT INTO public.job_card_status_history (
    garage_id, job_card_id,
    old_status, new_status,
    changed_by, changed_by_name, change_reason
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    'draft', 'queued',
    v_service_advisor_id, 'Vikram Singh', 'Initial assessment complete, added to queue'
  );

  INSERT INTO public.job_card_status_history (
    garage_id, job_card_id,
    old_status, new_status,
    changed_by, changed_by_name, change_reason
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    'queued', 'in_progress',
    v_mechanic_1_id, 'Amit Sharma', 'Started diagnosis'
  );

  -- ============================================================================
  -- STEP 8: INSERT COMMUNICATIONS FOR JOB CARD 1
  -- ============================================================================

  INSERT INTO public.job_card_communications (
    garage_id, job_card_id,
    communication_type, direction,
    subject, message, status,
    sent_by, sent_at
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    'phone', 'incoming',
    'Initial inquiry', 'Customer called about engine noise', 'read',
    v_service_advisor_id, NOW() - INTERVAL '2 days'
  );

  INSERT INTO public.job_card_communications (
    garage_id, job_card_id,
    communication_type, direction,
    subject, message, status,
    sent_by, sent_at
  ) VALUES (
    v_garage_id, v_job_card_1_id,
    'whatsapp', 'outgoing',
    'Job card update', 'Your vehicle JC-2025-0001 is being diagnosed. We will call you with an estimate shortly.', 'delivered',
    v_service_advisor_id, NOW() - INTERVAL '2 days'
  );

  -- ============================================================================
  -- SUCCESS MESSAGE
  -- ============================================================================

  RAISE NOTICE 'Job cards seed data inserted successfully!';
  RAISE NOTICE 'Created 4 job cards with checklist items, subtasks, parts, activity log, and communications.';

END $$;
