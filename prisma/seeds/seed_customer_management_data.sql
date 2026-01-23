-- ============================================================================
-- CUSTOMER MANAGEMENT DUMMY DATA SEED FILE
-- ============================================================================
-- Purpose: Create comprehensive dummy data for customer management
-- Includes: Customers with 1, 2, or multiple vehicles from the motorcycle catalog
--
-- PREREQUISITES:
-- 1. Run this in Supabase SQL Editor
-- 2. Replace v_garage_id below with your actual garage_id from garages table
--    Run: SELECT garage_uid, garage_name FROM public.garages;
-- 3. Ensure motorcycles table is populated with vehicle catalog data
--
-- FEATURES:
-- - 20 customers with diverse backgrounds
-- - 35+ vehicles covering various makes and models from the catalog
-- - Customers with 1, 2, 3, 4, and 5 vehicles
-- - Realistic Indian names, addresses, phone numbers
-- - Vehicles from all major manufacturers (Hero, Honda, Bajaj, TVS, Royal Enfield, etc.)
-- - Proper foreign key relationships
-- - Transaction-based insertion for data integrity
-- ============================================================================

DO $$
DECLARE
  -- ============================================================================
  -- CONFIGURATION - REPLACE WITH YOUR ACTUAL GARAGE ID
  -- ============================================================================
  v_garage_id UUID := 'c9f656e3-bbac-454a-9b36-c646bcaf6c39'; -- REPLACE THIS!

  -- Validate garage_id exists
  garage_exists BOOLEAN;

  -- Customer IDs
  c1_id UUID; c2_id UUID; c3_id UUID; c4_id UUID; c5_id UUID;
  c6_id UUID; c7_id UUID; c8_id UUID; c9_id UUID; c10_id UUID;
  c11_id UUID; c12_id UUID; c13_id UUID; c14_id UUID; c15_id UUID;
  c16_id UUID; c17_id UUID; c18_id UUID; c19_id UUID; c20_id UUID;

  -- Vehicle IDs
  v1_id UUID; v2_id UUID; v3_id UUID; v4_id UUID; v5_id UUID;
  v6_id UUID; v7_id UUID; v8_id UUID; v9_id UUID; v10_id UUID;
  v11_id UUID; v12_id UUID; v13_id UUID; v14_id UUID; v15_id UUID;
  v16_id UUID; v17_id UUID; v18_id UUID; v19_id UUID; v20_id UUID;
  v21_id UUID; v22_id UUID; v23_id UUID; v24_id UUID; v25_id UUID;
  v26_id UUID; v27_id UUID; v28_id UUID; v29_id UUID; v30_id UUID;
  v31_id UUID; v32_id UUID; v33_id UUID; v34_id UUID; v35_id UUID;

  -- Counters
  customers_created INTEGER := 0;
  vehicles_created INTEGER := 0;

BEGIN
  -- ============================================================================
  -- VALIDATE GARAGE ID
  -- ============================================================================
  SELECT EXISTS(SELECT 1 FROM public.garages WHERE garage_uid = v_garage_id) INTO garage_exists;

  IF NOT garage_exists THEN
    RAISE EXCEPTION 'Invalid garage_id: %. Please run SELECT garage_uid, garage_name FROM public.garages; to get a valid garage UID.', v_garage_id;
  END IF;

  RAISE NOTICE 'Starting customer management data seed for garage: %', v_garage_id;
  RAISE NOTICE '============================================================================';

  -- ============================================================================
  -- SECTION 1: CUSTOMERS WITH 1 VEHICLE (10 customers)
  -- ============================================================================
  RAISE NOTICE 'Creating customers with 1 vehicle...';

  -- Customer 1: Young professional with Activa
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, country, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Arjun', 'Menon', 'arjun.menon@email.com', '+91 98765 43210',
    '42, 3rd Main, Koramangala', 'Bangalore', 'Karnataka', '560034', 'India',
    'Young IT professional, daily commuter', 'active',
    NOW() - INTERVAL '2 years', NOW() - INTERVAL '2 years'
  ) RETURNING id INTO c1_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date,
    status, created_at)
  VALUES (
    gen_random_uuid(), c1_id, v_garage_id, 'Honda', 'Activa 6G', 2022,
    'KA-03-EM-2345', 'Pearl Igneous Black', 'MA1JB5412MC345678', 'JC50E1123456',
    18500, NOW() - INTERVAL '2 months', 'active', NOW() - INTERVAL '2 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  -- Customer 2: College student with Splendor
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Priya', 'Sharma', 'priya.sharma@email.com', '+91 98765 54321',
    'Vijaya College Hostel, Basavanagudi', 'Bangalore', 'Karnataka', '560004',
    'active', NOW() - INTERVAL '1 year', NOW() - INTERVAL '1 year'
  ) RETURNING id INTO c2_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c2_id, v_garage_id, 'Hero', 'Splendor+', 2021,
    'KA-01-EP-9012', 'Black', 'MBLHERO12345678901', 'JC50E3345678',
    32000, 'active', NOW() - INTERVAL '1 year'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  -- Customer 3: Senior citizen with Dio
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number,
    alternate_phone, email, address, city, state, zip_code, notes, status,
    customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Lakshmi', 'Devi', '+91 98765 65432', '+91 98765 65433', 'lakshmi.devi@email.com',
    '23, Temple Street', 'Mysore', 'Karnataka', '570002',
    'Senior citizen - prefers Saturday appointments', 'active',
    NOW() - INTERVAL '4 years', NOW() - INTERVAL '4 years'
  ) RETURNING id INTO c3_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c3_id, v_garage_id, 'Honda', 'Dio', 2023,
    'KA-02-EN-3456', 'Sports Red', 'MA1JB2398MC765432', 'JC50E2234567',
    8500, NOW() - INTERVAL '1 month', 'Well maintained, regular service',
    'active', NOW() - INTERVAL '4 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  -- Customer 4: Delivery person with Jupiter
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, email,
    address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Ravi', 'Kumar', '+91 98765 76543', 'ravi.kumar@email.com',
    '78, Indiranagar 100ft Road', 'Bangalore', 'Karnataka', '560038',
    'Food delivery executive - high mileage vehicle', 'active',
    NOW() - INTERVAL '3 years', NOW() - INTERVAL '3 years'
  ) RETURNING id INTO c4_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c4_id, v_garage_id, 'TVS', 'Jupiter', 2022,
    'KA-01-HJ-3456', 'Mint Blue', 'MD2AABCD987654321', 'JC50E4456789',
    52000, NOW() - INTERVAL '1 week', 'Heavy usage, needs frequent oil changes',
    'active', NOW() - INTERVAL '3 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  -- Customer 5: Business owner with Classic 350
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, country, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Vikram', 'Saxena', 'vikram.saxena@email.com', '+91 98765 87654',
    '156, Gandhi Road', 'Mysore', 'Karnataka', '570001', 'India',
    'VIP customer, owns multiple businesses', 'active',
    NOW() - INTERVAL '5 years', NOW() - INTERVAL '5 years'
  ) RETURNING id INTO c5_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c5_id, v_garage_id, 'Royal Enfield', 'Classic 350', 2022,
    'KA-02-RE-3456', 'Black', 'MD2AARE12345678901', 'MC50E9901234',
    18000, NOW() - INTERVAL '2 months', 'Weekend rider, excellent condition',
    'active', NOW() - INTERVAL '5 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  -- Customer 6: Bank employee with Access 125
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Sneha', 'Patel', 'sneha.patel@email.com', '+91 98765 98765',
    '45, Brigade Road', 'Bangalore', 'Karnataka', '560027',
    'active', NOW() - INTERVAL '8 months', NOW() - INTERVAL '8 months'
  ) RETURNING id INTO c6_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c6_id, v_garage_id, 'Suzuki', 'Access 125', 2023,
    'KA-01-HK-7890', 'Glass Sparkle Black', 'MD2AACBA567890123', 'JC50E5567890',
    12000, 'active', NOW() - INTERVAL '8 months'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  -- Customer 7: Teacher with Fascino
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Meena', 'Raj', 'meena.raj@email.com', '+91 98765 11122', '89, Residency Road', 'Bangalore', 'Karnataka',
    '560025', 'School teacher, prefers morning appointments', 'active',
    NOW() - INTERVAL '2 years', NOW() - INTERVAL '2 years'
  ) RETURNING id INTO c7_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c7_id, v_garage_id, 'Yamaha', 'Fascino 125', 2023,
    'KA-01-YM-7890', 'Yellow Cyan', 'MD2AAYAMA987654321', 'JC50E1012345',
    9500, 'active', NOW() - INTERVAL '2 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  -- Customer 8: Software engineer with Pulsar NS200
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Karthik', 'Narayan', 'karthik.n@email.com', '+91 98765 22233',
    '123, MG Road', 'Bangalore', 'Karnataka', '560001',
    'Enthusiast rider, performs regular maintenance', 'active',
    NOW() - INTERVAL '3 years', NOW() - INTERVAL '3 years'
  ) RETURNING id INTO c8_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c8_id, v_garage_id, 'Bajaj', 'Pulsar NS200', 2021,
    'KA-02-CD-5678', 'Burnt Orange', 'MD2AABCD123456', 'JC50E6678901',
    35000, NOW() - INTERVAL '1 month', 'Well maintained, synthetic oil used',
    'active', NOW() - INTERVAL '3 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  -- Customer 9: Retired government employee with Glamour
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    alternate_phone, address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Chandrasekhar', 'Iyer', 'chandrasekhar.iyer@email.com', '+91 98765 33344', '+91 98765 33345',
    '56, 5th Cross, Malleshwaram', 'Bangalore', 'Karnataka', '560003',
    'Senior citizen, retired government official', 'active',
    NOW() - INTERVAL '6 years', NOW() - INTERVAL '6 years'
  ) RETURNING id INTO c9_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c9_id, v_garage_id, 'Hero', 'Glamour', 2020,
    'KA-03-FG-1234', 'Triple Red', 'MBLHERO56789012345', 'JC50E7789012',
    28000, 'active', NOW() - INTERVAL '6 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  -- Customer 10: Young professional with Apache RTR 160
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Nikhil', 'Verma', 'nikhil.verma@email.com', '+91 98765 44455',
    '234, Hosur Road', 'Bangalore', 'Karnataka', '560068',
    'active', NOW() - INTERVAL '1 year', NOW() - INTERVAL '1 year'
  ) RETURNING id INTO c10_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c10_id, v_garage_id, 'TVS', 'Apache RTR 160', 2023,
    'KA-05-TV-1234', 'Grey', 'MD2AATVS98765432101', 'JC50E8890123',
    7500, 'active', NOW() - INTERVAL '1 year'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 1;

  RAISE NOTICE 'Created 10 customers with 1 vehicle each';

  -- ============================================================================
  -- SECTION 2: CUSTOMERS WITH 2 VEHICLES (5 customers)
  -- ============================================================================
  RAISE NOTICE 'Creating customers with 2 vehicles...';

  -- Customer 11: Family with two scooters
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Ramesh', 'Gupta', 'ramesh.gupta@email.com', '+91 98765 55566',
    '42, Indiranagar', 'Bangalore', 'Karnataka', '560038',
    'Family with two scooters - husband and wife', 'active',
    NOW() - INTERVAL '3 years', NOW() - INTERVAL '3 years'
  ) RETURNING id INTO c11_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date,
    status, created_at)
  VALUES (
    gen_random_uuid(), c11_id, v_garage_id, 'Honda', 'Activa 6G', 2023,
    'KA-03-EM-9999', 'Pearl Igneous Black', 'MA1JB5412MC999999', 'JC50E1123999',
    25000, NOW() - INTERVAL '1 month', 'active', NOW() - INTERVAL '3 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c11_id, v_garage_id, 'TVS', 'Jupiter', 2022,
    'KA-03-HJ-8888', 'Mint Blue', 'MD2AABCD888888888', 'JC50E4456888',
    18000, 'active', NOW() - INTERVAL '3 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 2;

  -- Customer 12: Professional with bike and scooter
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, country, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Anand', 'Prakash', 'anand.prakash@email.com', '+91 98765 66677',
    'TechEmploy Pvt Ltd, 45, Residency Road', 'Bangalore', 'Karnataka', '560025', 'India',
    'Corporate account - uses bike for weekends, scooter for commute', 'active',
    NOW() - INTERVAL '2 years', NOW() - INTERVAL '2 years'
  ) RETURNING id INTO c12_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c12_id, v_garage_id, 'Honda', 'Activa 125', 2022,
    'KA-05-RS-6789', 'Reign Orange', 'MA1JB890123456789', 'JC50E8890123',
    15000, 'active', NOW() - INTERVAL '2 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c12_id, v_garage_id, 'KTM', 'Duke 200', 2021,
    'KA-02-KT-2345', 'Orange', 'MD2AAKTM20000001234', 'KT200E1122334',
    22000, 'active', NOW() - INTERVAL '2 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 2;

  -- Customer 13: Father-son duo with bikes
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, email,
    address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Srinivas', 'Rao', '+91 98765 77788', 'srinivas.rao@email.com',
    '156, Jayanagar 4th Block', 'Bangalore', 'Karnataka', '560041',
    'Vehicles used by self and son', 'active',
    NOW() - INTERVAL '4 years', NOW() - INTERVAL '4 years'
  ) RETURNING id INTO c13_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date,
    status, created_at)
  VALUES (
    gen_random_uuid(), c13_id, v_garage_id, 'Hero', 'Splendor+', 2020,
    'KA-01-EP-1111', 'Black', 'MBLHERO11111111111', 'JC50E3333333',
    42000, NOW() - INTERVAL '1 week', 'active', NOW() - INTERVAL '4 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c13_id, v_garage_id, 'Bajaj', 'Pulsar 150', 2022,
    'KA-02-PJ-2222', 'Blue', 'MD2AAPUL150222222', 'JC50E2222222',
    16000, 'active', NOW() - INTERVAL '2 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 2;

  -- Customer 14: Electric and petrol combo
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Deepika', 'Nair', 'deepika.nair@email.com', '+91 98765 88899',
    '78, Sarjapur Road', 'Bangalore', 'Karnataka', '560034',
    'Environment conscious - has electric and petrol vehicles', 'active',
    NOW() - INTERVAL '1 year', NOW() - INTERVAL '1 year'
  ) RETURNING id INTO c14_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c14_id, v_garage_id, 'Bajaj', 'Chetak Electric', 2023,
    'KA-03-EV-1111', 'White', 'MD2AAELECTRIC001122', 'EV-MOTOR-001',
    4500, NOW() - INTERVAL '2 months', 'Electric scooter - battery health at 94%',
    'active', NOW() - INTERVAL '1 year'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c14_id, v_garage_id, 'Honda', 'Dio', 2021,
    'KA-03-EN-2222', 'Sports Red', 'MA1JB2398MC222222', 'JC50E2234222',
    12000, 'active', NOW() - INTERVAL '1 year'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 2;

  -- Customer 15: Royal Enfield enthusiast
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number,
    alternate_phone, email, address, city, state, zip_code, notes, status,
    customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Rahul', 'Mehta', '+91 98765 99900', '+91 98765 99901', 'rahul.mehta@email.com',
    '45, Industrial Area', 'Bangalore', 'Karnataka', '560045',
    'Royal Enfield enthusiast - member of RE owners club', 'active',
    NOW() - INTERVAL '5 years', NOW() - INTERVAL '5 years'
  ) RETURNING id INTO c15_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c15_id, v_garage_id, 'Royal Enfield', 'Classic 350', 2021,
    'KA-02-RE-1111', 'Black', 'MD2AARE11111111111', 'MC50E1111111',
    25000, NOW() - INTERVAL '1 month', 'First owner, excellent maintenance',
    'active', NOW() - INTERVAL '5 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c15_id, v_garage_id, 'Royal Enfield', 'Hunter 350', 2023,
    'KA-02-RE-2222', 'Mirage Silver', 'MD2AARE22222222222', 'MC50E2222222',
    8500, 'active', NOW() - INTERVAL '1 year'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 2;

  RAISE NOTICE 'Created 5 customers with 2 vehicles each';

  -- ============================================================================
  -- SECTION 3: CUSTOMERS WITH 3 VEHICLES (3 customers)
  -- ============================================================================
  RAISE NOTICE 'Creating customers with 3 vehicles...';

  -- Customer 16: Family with three vehicles
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    alternate_phone, address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Krishna', 'Murthy', 'krishna.murthy@email.com', '+91 98765 12345', '+91 98765 12346',
    '234, Palace Road', 'Mysore', 'Karnataka', '570001',
    'Well-established family - three vehicles for different purposes', 'active',
    NOW() - INTERVAL '6 years', NOW() - INTERVAL '6 years'
  ) RETURNING id INTO c16_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date,
    status, created_at)
  VALUES (
    gen_random_uuid(), c16_id, v_garage_id, 'Honda', 'Activa 6G', 2022,
    'KA-02-EM-3333', 'Pearl Igneous Black', 'MA1JB5412MC333333', 'JC50E1123333',
    30000, NOW() - INTERVAL '2 weeks', 'active', NOW() - INTERVAL '3 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c16_id, v_garage_id, 'Hero', 'Splendor+', 2019,
    'KA-02-EP-4444', 'Black', 'MBLHERO44444444444', 'JC50E3344444',
    48000, 'active', NOW() - INTERVAL '6 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c16_id, v_garage_id, 'TVS', 'Jupiter', 2021,
    'KA-02-HJ-5555', 'Mint Blue', 'MD2AABCD555555555', 'JC50E4455555',
    22000, 'active', NOW() - INTERVAL '4 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 3;

  -- Customer 17: Bike enthusiast family
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, email,
    address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Mohammed', 'Khan', '+91 98765 23456', 'mohammed.khan@email.com',
    '12, Mosque Road', 'Bangalore', 'Karnataka', '560028',
    'Family of bike enthusiasts - all different brands', 'active',
    NOW() - INTERVAL '4 years', NOW() - INTERVAL '4 years'
  ) RETURNING id INTO c17_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c17_id, v_garage_id, 'Bajaj', 'Pulsar NS200', 2020,
    'KA-01-CD-6666', 'Burnt Orange', 'MD2AABCD666666666', 'JC50E6666666',
    38000, 'active', NOW() - INTERVAL '4 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c17_id, v_garage_id, 'Yamaha', 'FZ-S V3', 2022,
    'KA-01-YM-7777', 'Grey', 'MD2AAYAMA777777777', 'JC50E7777777',
    19000, 'active', NOW() - INTERVAL '2 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c17_id, v_garage_id, 'Honda', 'CB Shine', 2021,
    'KA-01-HS-8888', 'Black', 'MA1JCBSHINE88888888', 'JC50E8888888',
    24000, NOW() - INTERVAL '3 weeks', 'Well maintained commuter',
    'active', NOW() - INTERVAL '3 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 3;

  -- Customer 18: Small business owner
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Sunita', 'Reddy', 'sunita.reddy@email.com', '+91 98765 34567',
    'Shop No. 12, Gandhi Bazaar', 'Bangalore', 'Karnataka', '560004',
    'Small business owner - vehicles for business and family', 'active',
    NOW() - INTERVAL '5 years', NOW() - INTERVAL '5 years'
  ) RETURNING id INTO c18_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c18_id, v_garage_id, 'Honda', 'Activa 5G', 2019,
    'KA-05-EM-9999', 'White', 'MA1JB5412MC999999', 'JC50E9999999',
    35000, 'active', NOW() - INTERVAL '5 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, status,
    created_at)
  VALUES (
    gen_random_uuid(), c18_id, v_garage_id, 'Hero', 'Destini 125', 2022,
    'KA-05-HD-1010', 'Grey', 'MBLHERODESTINI101010', 'JC50E1010101',
    18000, NOW() - INTERVAL '1 month', 'active', NOW() - INTERVAL '3 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, status, created_at)
  VALUES (
    gen_random_uuid(), c18_id, v_garage_id, 'Suzuki', 'Access 125', 2023,
    'KA-05-HK-2020', 'Glass Sparkle Black', 'MD2AACBA202020202', 'JC50E2020202',
    8000, 'active', NOW() - INTERVAL '1 year'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 3;

  RAISE NOTICE 'Created 3 customers with 3 vehicles each';

  -- ============================================================================
  -- SECTION 4: CUSTOMER WITH 4 VEHICLES (1 customer)
  -- ============================================================================
  RAISE NOTICE 'Creating customer with 4 vehicles...';

  -- Customer 19: Wealthy businessman with varied collection
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    alternate_phone, address, city, state, zip_code, country, notes, status,
    customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Rajesh', 'Mehta', 'rajesh.mehta@email.com', '+91 98765 45678', '+91 98765 45679',
    '45, Prestige Apartments, Whitefield', 'Bangalore', 'Karnataka', '560066', 'India',
    'Premium customer - luxury vehicles for family members', 'active',
    NOW() - INTERVAL '7 years', NOW() - INTERVAL '7 years'
  ) RETURNING id INTO c19_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c19_id, v_garage_id, 'Honda', 'Activa 6G', 2023,
    'KA-04-EM-1111', 'Pearl Igneous Black', 'MA1JB5412MC111111', 'JC50E1111111',
    12000, NOW() - INTERVAL '1 week', 'Primary commute vehicle - wife',
    'active', NOW() - INTERVAL '2 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, status,
    created_at)
  VALUES (
    gen_random_uuid(), c19_id, v_garage_id, 'Royal Enfield', 'Classic 350', 2022,
    'KA-04-RE-2222', 'Black', 'MD2AARE22222222222', 'MC50E2222222',
    16000, NOW() - INTERVAL '2 weeks', 'active', NOW() - INTERVAL '3 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c19_id, v_garage_id, 'KTM', 'Duke 390', 2021,
    'KA-04-KT-3333', 'Orange', 'MD2AAKTM39033333333', 'KT390E3333333',
    28000, NOW() - INTERVAL '3 weeks', 'Weekend fun bike - son',
    'active', NOW() - INTERVAL '4 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c19_id, v_garage_id, 'Bajaj', 'Chetak Electric', 2024,
    'KA-04-EV-4444', 'White', 'MD2AAELECTRIC444444', 'EV-MOTOR-444',
    3500, NOW() - INTERVAL '1 week', 'Electric scooter for short errands',
    'active', NOW() - INTERVAL '1 year'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 4;

  RAISE NOTICE 'Created 1 customer with 4 vehicles';

  -- ============================================================================
  -- SECTION 5: CUSTOMER WITH 5 VEHICLES (1 customer)
  -- ============================================================================
  RAISE NOTICE 'Creating customer with 5 vehicles...';

  -- Customer 20: Vehicle collector and enthusiast
  INSERT INTO public.customers (id, garage_id, first_name, last_name, email, phone_number,
    address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (
    gen_random_uuid(), v_garage_id,
    'Vikram', 'Singh', 'vikram.singh@email.com', '+91 98765 56789',
    'Farm House, Kanakapura Road', 'Bangalore', 'Karnataka', '560062',
    'Bike enthusiast and collector - owns diverse range of motorcycles', 'active',
    NOW() - INTERVAL '10 years', NOW() - INTERVAL '10 years'
  ) RETURNING id INTO c20_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c20_id, v_garage_id, 'Royal Enfield', 'Himalayan 411', 2019,
    'KA-09-RE-5555', 'Rock Red', 'MD2AAREHIMALAYAN55555', 'MC411E5555555',
    42000, NOW() - INTERVAL '1 month', 'Adventure touring bike - excellent condition',
    'active', NOW() - INTERVAL '7 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, status,
    created_at)
  VALUES (
    gen_random_uuid(), c20_id, v_garage_id, 'KTM', 'RC 390', 2020,
    'KA-09-RC-6666', 'Orange', 'MD2AAKTMRC390666666', 'KT390E6666666',
    18000, NOW() - INTERVAL '2 months', 'active', NOW() - INTERVAL '5 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c20_id, v_garage_id, 'Honda', 'CBR 250R', 2018,
    'KA-09-HN-7777', 'Red', 'MA1JCBR250777777777', 'KT250E7777777',
    35000, NOW() - INTERVAL '3 weeks', 'Rare model - collector piece',
    'active', NOW() - INTERVAL '8 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, status,
    created_at)
  VALUES (
    gen_random_uuid(), c20_id, v_garage_id, 'Yamaha', 'YZF-R15 V4', 2023,
    'KA-09-YM-8888', 'Blue', 'MD2AAYAMAR15V488888', 'JC155E8888888',
    6500, NOW() - INTERVAL '1 week', 'active', NOW() - INTERVAL '2 years'
  );

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year,
    license_plate, color, vin, engine_number, current_mileage, last_service_date, notes,
    status, created_at)
  VALUES (
    gen_random_uuid(), c20_id, v_garage_id, 'Hero', 'Xpulse 200', 2022,
    'KA-09-XP-9999', 'White', 'MBLHEROXP2009999999', 'KT200E9999999',
    15000, NOW() - INTERVAL '2 weeks', 'Dual-sport adventure bike',
    'active', NOW() - INTERVAL '3 years'
  );
  customers_created := customers_created + 1;
  vehicles_created := vehicles_created + 5;

  RAISE NOTICE 'Created 1 customer with 5 vehicles';

  -- ============================================================================
  -- SUMMARY REPORT
  -- ============================================================================
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'CUSTOMER MANAGEMENT SEED DATA CREATED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Summary of data created:';
  RAISE NOTICE '  - Total Customers: %', customers_created;
  RAISE NOTICE '  - Total Vehicles: %', vehicles_created;
  RAISE NOTICE '';
  RAISE NOTICE 'Customer breakdown by vehicle count:';
  RAISE NOTICE '  - 10 customers with 1 vehicle';
  RAISE NOTICE '  - 5 customers with 2 vehicles';
  RAISE NOTICE '  - 3 customers with 3 vehicles';
  RAISE NOTICE '  - 1 customer with 4 vehicles';
  RAISE NOTICE '  - 1 customer with 5 vehicles';
  RAISE NOTICE '';
  RAISE NOTICE 'Vehicle manufacturers represented:';
  RAISE NOTICE '  - Hero (Splendor+, Glamour, Destini, Xpulse)';
  RAISE NOTICE '  - Honda (Activa 5G/6G/7G, Activa 125, Dio, CB Shine, CBR 250R)';
  RAISE NOTICE '  - TVS (Jupiter, Apache RTR 160)';
  RAISE NOTICE '  - Bajaj (Pulsar series, Chetak Electric)';
  RAISE NOTICE '  - Royal Enfield (Classic 350, Hunter 350, Himalayan 411)';
  RAISE NOTICE '  - KTM (Duke 200/390, RC 390)';
  RAISE NOTICE '  - Yamaha (FZ-S V3, YZF-R15 V4, Fascino)';
  RAISE NOTICE '  - Suzuki (Access 125)';
  RAISE NOTICE '';
  RAISE NOTICE 'To verify the data:';
  RAISE NOTICE '  SELECT COUNT(*) FROM public.customers WHERE garage_id = ''%'';', v_garage_id;
  RAISE NOTICE '  SELECT COUNT(*) FROM public.customer_vehicles WHERE garage_id = ''%'';', v_garage_id;
  RAISE NOTICE '  SELECT c.first_name, c.last_name, COUNT(v.id) as vehicle_count';
  RAISE NOTICE '    FROM public.customers c';
  RAISE NOTICE '    LEFT JOIN public.customer_vehicles v ON c.id = v.customer_id';
  RAISE NOTICE '    WHERE c.garage_id = ''%''', v_garage_id;
  RAISE NOTICE '    GROUP BY c.id, c.first_name, c.last_name';
  RAISE NOTICE '    ORDER BY vehicle_count DESC;';
  RAISE NOTICE '============================================================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating seed data: %', SQLERRM;
    RAISE NOTICE 'Please check:';
    RAISE NOTICE '  1. Garage ID is correct (run: SELECT garage_uid FROM public.garages;)';
    RAISE NOTICE '  2. All required tables exist';
    RAISE NOTICE '  3. Motorcycles table is populated';
    RAISE;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify the data)
-- ============================================================================

-- Check customer count
-- SELECT COUNT(*) as total_customers FROM public.customers WHERE garage_id = 'YOUR_v_garage_id';

-- Check vehicle count
-- SELECT COUNT(*) as total_vehicles FROM public.customer_vehicles WHERE garage_id = 'YOUR_v_garage_id';

-- View customers with vehicle counts
-- SELECT
--   c.first_name,
--   c.last_name,
--   c.phone_number,
--   COUNT(v.id) as vehicle_count
-- FROM public.customers c
-- LEFT JOIN public.customer_vehicles v ON c.id = v.customer_id
-- WHERE c.garage_id = 'YOUR_v_garage_id'
-- GROUP BY c.id, c.first_name, c.last_name, c.phone_number
-- ORDER BY vehicle_count DESC, c.first_name;

-- View all vehicles with customer details
-- SELECT
--   c.first_name || ' ' || c.last_name as customer_name,
--   v.make,
--   v.model,
--   v.year,
--   v.license_plate,
--   v.color,
--   v.current_mileage,
--   v.status
-- FROM public.customer_vehicles v
-- JOIN public.customers c ON v.customer_id = c.id
-- WHERE c.garage_id = 'YOUR_v_garage_id'
-- ORDER BY c.first_name, c.last_name, v.make, v.model;

-- Check vehicles by manufacturer
-- SELECT
--   make,
--   COUNT(*) as vehicle_count
-- FROM public.customer_vehicles
-- WHERE garage_id = 'YOUR_v_garage_id'
-- GROUP BY make
-- ORDER BY vehicle_count DESC;
