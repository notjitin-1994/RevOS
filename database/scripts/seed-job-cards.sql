-- ============================================================================
-- SEED JOB CARDS FOR TESTING
-- ============================================================================
-- This script inserts sample job cards into the job_cards table
-- Modify the garage_id to match your actual garage UUID
-- ============================================================================

-- First, let's check what garage_id/garage_uid values exist
SELECT '=== EXISTING GARAGES ===' as info;
SELECT
    garage_id,
    garage_uid,
    garage_name
FROM garages
LIMIT 5;

-- Insert sample job cards
-- Make sure to replace the garage_id below with your actual value
INSERT INTO job_cards (
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
    promised_date,
    estimated_labor_cost,
    estimated_parts_cost,
    final_amount,
    created_at,
    updated_at
) VALUES
(
    gen_random_uuid(),
    'c9f656e3-bbac-454a-9b36-c646bcaf6c39',  -- Replace with your actual garage_uid
    'JC-2025-001',
    NULL,
    'John Smith',
    '+1234567890',
    'john.smith@example.com',
    NULL,
    'Honda',
    'CBR 600RR',
    2023,
    'KA-01-AB-1234',
    'JH2RC3004MK000001',
    15000,
    'queued',
    'high',
    'service',
    'Engine making unusual noise at high RPM',
    'Inspect engine, check valves, replace if needed',
    '2025-01-30',
    5000.00,
    3000.00,
    8000.00,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'c9f656e3-bbac-454a-9b36-c646bcaf6c39',  -- Replace with your actual garage_uid
    'JC-2025-002',
    NULL,
    'Sarah Johnson',
    '+9876543210',
    'sarah.j@example.com',
    NULL,
    'Yamaha',
    'MT-09',
    2024,
    'KA-02-CD-5678',
    'JYARNJ4E1RA000001',
    5000,
    'in_progress',
    'urgent',
    'repair',
    'Brake pads worn out, need immediate replacement',
    'Replace front and rear brake pads, bleed brakes',
    '2025-01-25',
    2000.00,
    1500.00,
    3500.00,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'c9f656e3-bbac-454a-9b36-c646bcaf6c39',  -- Replace with your actual garage_uid
    'JC-2025-003',
    NULL,
    'Mike Williams',
    '+5555555555',
    'mike.w@example.com',
    NULL,
    'Kawasaki',
    'Ninja 650',
    2022,
    'KA-03-EF-9012',
    'Kawasaki Ninja 650 VIN',
    12000,
    'quality_check',
    'medium',
    'service',
    'Regular service and oil change',
    'Oil change, filter replacement, general inspection',
    '2025-01-28',
    1500.00,
    800.00,
    2300.00,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'c9f656e3-bbac-454a-9b36-c646bcaf6c39',  -- Replace with your actual garage_uid
    'JC-2025-004',
    NULL,
    'Emma Davis',
    '+4444444444',
    'emma.davis@example.com',
    NULL,
    'Royal Enfield',
    'Himalayan',
    2023,
    'KA-04-GH-3456',
    'REHimalayanVIN123',
    8000,
    'parts_waiting',
    'high',
    'repair',
    'Clutch not engaging properly',
    'Replace clutch plates and springs',
    '2025-01-29',
    3000.00,
    2000.00,
    5000.00,
    NOW(),
    NOW()
),
(
    gen_random_uuid(),
    'c9f656e3-bbac-454a-9b36-c646bcaf6c39',  -- Replace with your actual garage_uid
    'JC-2025-005',
    NULL,
    'David Brown',
    '+3333333333',
    'david.brown@example.com',
    NULL,
    'Suzuki',
    'Gixxer 250',
    2024,
    'KA-05-IJ-7890',
    'SuzukiGixxerVIN',
    3000,
    'ready',
    'low',
    'service',
    'First free service',
    'Oil change, chain adjustment, general checkup',
    '2025-01-24',
    0.00,
    0.00,
    0.00,
    NOW(),
    NOW()
);

SELECT '=== VERIFY JOB CARDS INSERTED ===' as info;
SELECT
    job_card_number,
    customer_name,
    vehicle_make,
    vehicle_model,
    status,
    priority,
    garage_id
FROM job_cards
ORDER BY created_at DESC
LIMIT 10;

SELECT '=== TOTAL JOB CARDS ===' as info;
SELECT COUNT(*) as total_job_cards FROM job_cards;
