-- =====================================================
-- RevvOS Job Card Placeholder Data
-- Design System: Precision Volt (Light Mode)
-- Brand Accent: Graphite (not Lime)
-- =====================================================

-- Insert placeholder job cards for presentations and demos
-- These use the actual database schema from create_job_cards_system.sql

INSERT INTO job_cards (
  id,
  garage_id,
  job_card_number,

  -- Customer & Vehicle References
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

  -- Job Details
  status,
  priority,
  job_type,

  -- Customer Inputs
  customer_complaint,
  work_requested,
  customer_notes,

  -- Scheduling
  promised_date,
  promised_time,

  -- Financials
  estimated_labor_cost,
  estimated_parts_cost,
  actual_labor_cost,
  actual_parts_cost,
  final_amount,
  payment_status,

  -- Staffing
  service_advisor_id,
  lead_mechanic_id,

  -- Metadata
  created_at,
  updated_at,
  created_by
) VALUES
-- =====================================================
-- HIGH PRIORITY - IN PROGRESS JOBS
-- =====================================================

-- Job 1: Engine Overhaul - High Priority, In Progress
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0001',

  (SELECT id FROM customers LIMIT 1),
  'John Smith',
  '+1234567890',
  'john.smith@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1),
  'Honda',
  'Civic',
  2020,
  'ABC-1234',
  '1HGFC2F59LA123456',
  45000,

  'in_progress',
  'high',
  'repair',

  'Engine making grinding noise when accelerating above 40 km/h. Customer concerned about potential damage.',
  'Complete engine teardown, inspect timing belt, tensioner, and related components. Replace worn parts.',
  'Customer wants OEM parts only.',

  '2025-01-25',
  '17:00',

  8000,
  7000,
  8500,
  7200,
  15700,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  (SELECT user_uid FROM garage_auth LIMIT 1 OFFSET 1),

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 2: Brake System Failure - Urgent, In Progress
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0002',

  (SELECT id FROM customers LIMIT 1 OFFSET 1),
  'Sarah Johnson',
  '+1234567891',
  'sarah.j@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 1),
  'Toyota',
  'Corolla',
  2019,
  'XYZ-5678',
  '2T1BURHE9KC123456',
  32000,

  'in_progress',
  'urgent',
  'repair',

  'Complete brake failure. Vehicle unsafe to drive. Customer had vehicle towed to garage.',
  'Replace all brake pads, rotors, and brake fluid. Inspect brake lines for leaks.',
  'Urgent repair needed.',

  '2025-01-20',
  '14:00',

  4000,
  4500,
  4200,
  4600,
  8800,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  (SELECT user_uid FROM garage_auth LIMIT 1 OFFSET 1),

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 3: Suspension Repair - High Priority, In Progress
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0003',

  (SELECT id FROM customers LIMIT 1 OFFSET 2),
  'Michael Brown',
  '+1234567892',
  'm.brown@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 2),
  'Ford',
  'F-150',
  2021,
  'DEF-9012',
  '1FTEW1EP4MF123456',
  28000,

  'in_progress',
  'high',
  'repair',

  'Vehicle vibrating at high speeds. Customer notices vibration especially on highways.',
  'Inspect front and rear suspension. Check wheel bearings, tie rods, and control arms. Replace worn components.',
  NULL,

  '2025-01-24',
  '16:00',

  3500,
  2500,
  3600,
  2600,
  6200,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  (SELECT user_uid FROM garage_auth LIMIT 1 OFFSET 1),

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- =====================================================
-- MEDIUM PRIORITY - QUEUED JOBS
-- =====================================================

-- Job 4: Oil Change + Filter - Medium Priority, Queued
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0004',

  (SELECT id FROM customers LIMIT 1 OFFSET 3),
  'Emily Davis',
  '+1234567893',
  'emily.d@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 3),
  'Chevrolet',
  'Malibu',
  2022,
  'GHI-3456',
  '1G1ZE5ST4KF123456',
  15000,

  'queued',
  'medium',
  'maintenance',

  'Regular maintenance due. Customer wants to keep vehicle in optimal condition.',
  'Oil and filter change. Check and top up all fluid levels. Inspect belts and hoses.',
  NULL,

  '2025-01-28',
  '10:00',

  800,
  400,
  0,
  0,
  1200,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 5: Tire Replacement - Medium Priority, Queued
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0005',

  (SELECT id FROM customers LIMIT 1 OFFSET 4),
  'Robert Wilson',
  '+1234567894',
  'r.wilson@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 4),
  'Nissan',
  'Altima',
  2020,
  'JKL-7890',
  '1N4BL4BV5LC123456',
  8500,

  'queued',
  'medium',
  'maintenance',

  'Tires worn below safe limit. Customer noticed reduced traction in rain.',
  'Replace all 4 tires. Perform wheel alignment and balancing.',
  'Customer wants Michelin tires.',

  '2025-01-29',
  '11:00',

  1200,
  16800,
  0,
  0,
  18000,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 6: Battery Replacement - Medium Priority, Queued
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0006',

  (SELECT id FROM customers LIMIT 1 OFFSET 5),
  'Lisa Martinez',
  '+1234567895',
  'lisa.m@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 5),
  'Hyundai',
  'Elantra',
  2021,
  'MNO-2345',
  '5NPD84LF6MH123456',
  6500,

  'queued',
  'medium',
  'repair',

  'Battery not holding charge. Vehicle difficult to start in mornings.',
  'Test charging system and battery. Replace battery if needed. Check alternator output.',
  NULL,

  '2025-01-26',
  '15:00',

  500,
  4000,
  0,
  0,
  4500,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- =====================================================
-- LOW PRIORITY - QUEUED JOBS
-- =====================================================

-- Job 7: AC Repair - Low Priority, Queued
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0007',

  (SELECT id FROM customers LIMIT 1 OFFSET 6),
  'David Garcia',
  '+1234567896',
  'd.garcia@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 6),
  'Kia',
  'Soul',
  2019,
  'PQR-4567',
  'KNDJP3A55K7123456',
  3500,

  'queued',
  'low',
  'repair',

  'Air conditioning not cooling properly. Customer notices weak airflow.',
  'Inspect AC system. Check refrigerant level, compressor, and condenser.',
  NULL,

  '2025-02-05',
  '09:00',

  1500,
  3500,
  0,
  0,
  5000,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 8: Light Bulb Replacement - Low Priority, Queued
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0008',

  (SELECT id FROM customers LIMIT 1 OFFSET 7),
  'Jennifer Anderson',
  '+1234567897',
  'j.anderson@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 7),
  'Mazda',
  'CX-5',
  2022,
  'STU-6789',
  'JM3KFBCM3N0123456',
  800,

  'queued',
  'low',
  'maintenance',

  'Headlight dim. Customer failed safety inspection.',
  'Replace headlight bulbs. Check all exterior lights.',
  NULL,

  '2025-02-10',
  '13:00',

  500,
  1000,
  0,
  0,
  1500,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- =====================================================
-- PARTS WAITING - BLOCKED JOBS
-- =====================================================

-- Job 9: Clutch Replacement - High Priority, Parts Waiting
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0009',

  (SELECT id FROM customers LIMIT 1 OFFSET 8),
  'Chris Taylor',
  '+1234567898',
  'c.taylor@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 8),
  'Subaru',
  'WRX',
  2018,
  'VWX-8901',
  'JF1VA2B66J9123456',
  22000,

  'parts_waiting',
  'high',
  'repair',

  'Clutch slipping. Engine revs but vehicle doesnt accelerate properly.',
  'Replace clutch kit, pressure plate, and release bearing. Special order part required.',
  NULL,

  '2025-01-30',
  '12:00',

  6000,
  19000,
  6200,
  19500,
  25700,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  (SELECT user_uid FROM garage_auth LIMIT 1 OFFSET 1),

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 10: Fuel Pump Replacement - Medium Priority, Parts Waiting
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0010',

  (SELECT id FROM customers LIMIT 1 OFFSET 9),
  'Amanda Thomas',
  '+1234567899',
  'a.thomas@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 9),
  'Volkswagen',
  'Jetta',
  2020,
  'YZA-0123',
  '3VWD17AJ4LM123456',
  12000,

  'parts_waiting',
  'medium',
  'repair',

  'Vehicle stalling intermittently. Fuel pump suspected.',
  'Replace fuel pump and fuel filter. Awaiting OEM part delivery.',
  NULL,

  '2025-02-01',
  '14:00',

  2500,
  5000,
  2600,
  5200,
  7800,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  (SELECT user_uid FROM garage_auth LIMIT 1 OFFSET 1),

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- =====================================================
-- QUALITY CHECK - READY FOR FINAL INSPECTION
-- =====================================================

-- Job 11: Full Service - Medium Priority, Quality Check
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0011',

  (SELECT id FROM customers LIMIT 1 OFFSET 10),
  'Kevin Lee',
  '+1234567800',
  'k.lee@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 10),
  'Honda',
  'Accord',
  2021,
  'BCD-2345',
  '1HGCV1F31MA123456',
  4500,

  'quality_check',
  'medium',
  'maintenance',

  'Annual service completed. Awaiting final inspection and customer approval.',
  'Perform final quality check. Test drive to verify all work completed correctly.',
  NULL,

  '2025-01-22',
  '16:00',

  2000,
  2500,
  2100,
  2600,
  4700,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  (SELECT user_uid FROM garage_auth LIMIT 1 OFFSET 1),

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 12: Transmission Flush - Low Priority, Quality Check
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0012',

  (SELECT id FROM customers LIMIT 1 OFFSET 11),
  'Michelle White',
  '+1234567801',
  'm.white@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 11),
  'BMW',
  '3-Series',
  2019,
  'EFG-4567',
  'WBA8E9C54KA123456',
  3500,

  'quality_check',
  'low',
  'maintenance',

  'Transmission fluid dark and burnt. Flush completed. Awaiting quality inspection.',
  'Perform final road test. Check for smooth shifting. Verify no leaks.',
  NULL,

  '2025-01-23',
  '10:00',

  1800,
  1700,
  1900,
  1750,
  3650,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  (SELECT user_uid FROM garage_auth LIMIT 1 OFFSET 1),

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- =====================================================
-- READY - WAITING FOR CUSTOMER PICKUP
-- =====================================================

-- Job 13: Exhaust Repair - Medium Priority, Ready
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0013',

  (SELECT id FROM customers LIMIT 1 OFFSET 12),
  'Daniel Harris',
  '+1234567802',
  'd.harris@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 12),
  'Ford',
  'Mustang',
  2020,
  'HIJ-5678',
  '1FA6P8CF5L5123456',
  9500,

  'ready',
  'medium',
  'repair',

  'Exhaust loud and rattling. Muffler and exhaust pipe replaced.',
  'Vehicle ready for pickup. Invoice generated. Waiting for customer.',
  NULL,

  '2025-01-20',
  '15:00',

  2000,
  7500,
  2100,
  7800,
  9900,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 14: Wheel Alignment - Low Priority, Ready
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0014',

  (SELECT id FROM customers LIMIT 1 OFFSET 13),
  'Nancy Clark',
  '+1234567803',
  'n.clark@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 13),
  'Toyota',
  'Camry',
  2022,
  'KLM-7890',
  '4T1BF1FK5CU123456',
  1500,

  'ready',
  'low',
  'maintenance',

  'Vehicle pulling to one side. Wheel alignment completed.',
  'Alignment done within specs. Ready for delivery.',
  NULL,

  '2025-01-21',
  '11:00',

  1200,
  300,
  1250,
  320,
  1570,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 15: General Inspection - Low Priority, Ready
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0015',

  (SELECT id FROM customers LIMIT 1 OFFSET 14),
  'James Lewis',
  '+1234567804',
  'j.lewis@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 14),
  'Tesla',
  'Model 3',
  2023,
  'NOP-9012',
  '5YJ3E1EB8PF123456',
  1000,

  'ready',
  'low',
  'inspection',

  'Pre-purchase inspection completed. Vehicle in good condition.',
  'Inspection report ready. Customer notified of findings.',
  NULL,

  '2025-01-19',
  '13:00',

  800,
  200,
  850,
  210,
  1060,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- =====================================================
-- DELIVERED - COMPLETED JOBS
-- =====================================================

-- Job 16: Spark Plug Replacement - Low Priority, Delivered
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0016',

  (SELECT id FROM customers LIMIT 1 OFFSET 15),
  'Laura Walker',
  '+1234567805',
  'l.walker@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 15),
  'Mercedes-Benz',
  'C-Class',
  2018,
  'QRS-0123',
  'WDDGF4HBXJA123456',
  3000,

  'delivered',
  'low',
  'maintenance',

  'Engine misfiring. Spark plugs worn out at 60,000 km.',
  'Replaced all spark plugs. Engine running smoothly. Vehicle delivered.',
  NULL,

  '2025-01-15',
  '14:00',

  1500,
  1500,
  1600,
  1550,
  3150,
  'paid',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 17: Coolant Flush - Low Priority, Delivered
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0017',

  (SELECT id FROM customers LIMIT 1 OFFSET 16),
  'Paul Hall',
  '+1234567806',
  'p.hall@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 16),
  'Audi',
  'A4',
  2020,
  'TUV-2345',
  'WAUAAAF79MA123456',
  2000,

  'delivered',
  'low',
  'maintenance',

  'Coolant low and dirty. Overheating in traffic.',
  'Flushed coolant system. Replaced thermostat. Vehicle delivered.',
  NULL,

  '2025-01-14',
  '10:00',

  1000,
  1000,
  1050,
  1020,
  2070,
  'paid',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- =====================================================
-- DRAFT - NEW JOBS BEING CREATED
-- =====================================================

-- Job 18: Timing Belt - High Priority, Draft
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0018',

  (SELECT id FROM customers LIMIT 1 OFFSET 17),
  'Susan Young',
  '+1234567807',
  's.young@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 17),
  'Chrysler',
  '300',
  2017,
  'WXY-3456',
  '2C3CCABG9JH123456',
  18000,

  'draft',
  'high',
  'repair',

  'Timing belt due for replacement at 90,000 km. Preventive maintenance.',
  'Replace timing belt, water pump, and tensioners. Full job estimate needed.',
  NULL,

  NULL,
  NULL,

  0,
  0,
  0,
  0,
  0,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 19: Diagnostic - Medium Priority, Draft
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0019',

  (SELECT id FROM customers LIMIT 1 OFFSET 18),
  'Mark King',
  '+1234567808',
  'm.king@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 18),
  'Lexus',
  'RX 350',
  2021,
  'ZAB-4567',
  '2T2BZMCA1MC123456',
  1500,

  'draft',
  'medium',
  'inspection',

  'Check engine light on. Customer wants diagnostic scan.',
  'Perform full diagnostic scan. Identify fault codes. Provide estimate for repairs.',
  NULL,

  NULL,
  NULL,

  0,
  0,
  0,
  0,
  0,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
),

-- Job 20: Detailing Package - Low Priority, Draft
(
  gen_random_uuid(),
  (SELECT id FROM garages LIMIT 1),
  'JC-2025-0020',

  (SELECT id FROM customers LIMIT 1 OFFSET 19),
  'Betty Wright',
  '+1234567809',
  'b.wright@email.com',

  (SELECT id FROM customer_vehicles LIMIT 1 OFFSET 19),
  'Cadillac',
  'Escalade',
  2022,
  'CDE-5678',
  '1GYKPDRS4MZ123456',
  5000,

  'draft',
  'low',
  'maintenance',

  'Customer wants full detailing package for upcoming wedding.',
  'Complete exterior and interior detailing. Wax, polish, interior cleaning.',
  'Customer requested premium package.',

  '2025-02-15',
  '09:00',

  0,
  0,
  0,
  0,
  0,
  'pending',

  (SELECT user_uid FROM garage_auth LIMIT 1),
  NULL,

  NOW(),
  NOW(),
  (SELECT user_uid FROM garage_auth LIMIT 1)
)

ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- VERIFICATION
-- =====================================================

-- Verify the insert was successful
SELECT
  status,
  priority,
  COUNT(*) as count
FROM job_cards
GROUP BY status, priority
ORDER BY
  CASE status
    WHEN 'draft' THEN 1
    WHEN 'queued' THEN 2
    WHEN 'in_progress' THEN 3
    WHEN 'parts_waiting' THEN 4
    WHEN 'quality_check' THEN 5
    WHEN 'ready' THEN 6
    WHEN 'delivered' THEN 7
  END,
  CASE priority
    WHEN 'urgent' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END;
