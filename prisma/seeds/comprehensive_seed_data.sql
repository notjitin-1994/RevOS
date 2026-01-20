-- ============================================================================
-- COMPREHENSIVE SEED DATA FOR REVOS GARAGE MANAGEMENT SYSTEM
-- ============================================================================
-- This file creates complete dummy data for all tables with proper relationships
-- Run in Supabase SQL Editor after ensuring the garage exists
-- ============================================================================
-- IMPORTANT: Replace the GARBAGE_ID below with your actual garage_id
-- Run: SELECT garage_uid, garage_name FROM public.garages; to get your garage ID
-- ============================================================================

DO $$
DECLARE
  -- ============================================================================
  -- CONFIGURATION - REPLACE WITH YOUR ACTUAL GARAGE ID
  -- ============================================================================
  GARAGE_ID UUID := '00000000-0000-0000-0000-000000000000'; -- REPLACE THIS!

  -- ============================================================================
  -- VARIABLE DECLARATIONS
  -- ============================================================================
  -- User/Employee IDs
  v_owner_user_uid UUID;
  v_admin_user_uid UUID;
  v_service_advisor_1_uid UUID;
  v_service_advisor_2_uid UUID;
  v_mechanic_1_uid UUID;
  v_mechanic_2_uid UUID;
  v_mechanic_3_uid UUID;
  v_technician_uid UUID;

  -- Customer IDs
  v_customer_1_id UUID;
  v_customer_2_id UUID;
  v_customer_3_id UUID;
  v_customer_4_id UUID;
  v_customer_5_id UUID;
  v_customer_6_id UUID;
  v_customer_7_id UUID;
  v_customer_8_id UUID;

  -- Vehicle IDs
  v_vehicle_1_id UUID;
  v_vehicle_2_id UUID;
  v_vehicle_3_id UUID;
  v_vehicle_4_id UUID;
  v_vehicle_5_id UUID;
  v_vehicle_6_id UUID;
  v_vehicle_7_id UUID;
  v_vehicle_8_id UUID;
  v_vehicle_9_id UUID;
  v_vehicle_10_id UUID;
  v_vehicle_11_id UUID;
  v_vehicle_12_id UUID;

  -- Parts Category IDs
  v_cat_engine_id UUID;
  v_cat_brakes_id UUID;
  v_cat_electrical_id UUID;
  v_cat_suspension_id UUID;
  v_cat_body_id UUID;
  v_cat_oil_fluids_id UUID;
  v_cat_battery_id UUID;
  v_cat_exhaust_id UUID;
  v_cat_transmission_id UUID;
  v_cat_filters_id UUID;

  -- Parts Supplier IDs
  v_supplier_1_id UUID;
  v_supplier_2_id UUID;
  v_supplier_3_id UUID;
  v_supplier_4_id UUID;

  -- Part IDs
  v_part_1_id UUID;
  v_part_2_id UUID;
  v_part_3_id UUID;
  v_part_4_id UUID;
  v_part_5_id UUID;
  v_part_6_id UUID;
  v_part_7_id UUID;
  v_part_8_id UUID;
  v_part_9_id UUID;
  v_part_10_id UUID;
  v_part_11_id UUID;
  v_part_12_id UUID;
  v_part_13_id UUID;
  v_part_14_id UUID;
  v_part_15_id UUID;
  v_part_16_id UUID;
  v_part_17_id UUID;
  v_part_18_id UUID;
  v_part_19_id UUID;
  v_part_20_id UUID;

  -- Motorcycle IDs for fitment
  v_moto_honda_activa_6g UUID;
  v_moto_honda_activa_125 UUID;
  v_moto_hero_splendor_plus UUID;
  v_moto_hero_glamour UUID;
  v_moto_bajaj_pulsar_ns200 UUID;
  v_moto_bajaj_ct100 UUID;
  v_moto_tv_jupiter UUID;
  v_moto_suzuki_access UUID;
  v_moto_royal_enfield_classic UUID;
  v_moto_yamaha_fascino UUID;
  v_moto_honda_dio UUID;
  v_moto_bajaj_chetak UUID;

  -- Job Card IDs
  v_job_card_1_id UUID;
  v_job_card_2_id UUID;
  v_job_card_3_id UUID;
  v_job_card_4_id UUID;
  v_job_card_5_id UUID;
  v_job_card_6_id UUID;

  -- Checklist Item IDs
  v_checklist_1_id UUID;
  v_checklist_2_id UUID;
  v_checklist_3_id UUID;
  v_checklist_4_id UUID;
  v_checklist_5_id UUID;
  v_checklist_6_id UUID;
  v_checklist_7_id UUID;
  v_checklist_8_id UUID;
  v_checklist_9_id UUID;
  v_checklist_10_id UUID;

  -- Time Entry IDs
  v_time_entry_1_id UUID;
  v_time_entry_2_id UUID;

BEGIN

  -- ============================================================================
  -- VALIDATE GARAGE ID
  -- ============================================================================
  IF NOT EXISTS (SELECT 1 FROM public.garages WHERE garage_uid = GARAGE_ID) THEN
    RAISE EXCEPTION 'Invalid garage_id. Please update GARAGE_ID variable with a valid garage_uid from garages table.';
  END IF;

  RAISE NOTICE 'Starting comprehensive seed data for garage: %', GARAGE_ID;

  -- ============================================================================
  -- STEP 1: INSERT USERS/EMPLOYEES INTO garage_auth AND users TABLES
  -- ============================================================================
  RAISE NOTICE 'Step 1: Creating users and employees...';

  -- Owner
  INSERT INTO public.garage_auth (user_uid, garage_id, email, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'owner@revosgarage.com', NOW() - INTERVAL '2 years')
  ON CONFLICT (user_uid) DO NOTHING
  RETURNING user_uid INTO v_owner_user_uid;

  INSERT INTO public.users (user_uid, garage_uid, garage_id, garage_name, first_name, last_name, login_id, email, phone_number, user_role, date_of_joining, is_active, created_at)
  VALUES (v_owner_user_uid, GARAGE_ID, 'GARAGE-001', 'RevvOs Garage', 'Rajesh', 'Mehta', 'rajesh.mehta', 'owner@revosgarage.com', '+91 98765 11111', 'owner', '2022-01-15', true, NOW() - INTERVAL '2 years')
  ON CONFLICT (user_uid) DO NOTHING;

  -- Admin
  INSERT INTO public.garage_auth (user_uid, garage_id, email, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'admin@revosgarage.com', NOW() - INTERVAL '2 years')
  ON CONFLICT (user_uid) DO NOTHING
  RETURNING user_uid INTO v_admin_user_uid;

  INSERT INTO public.users (user_uid, garage_uid, garage_id, garage_name, first_name, last_name, login_id, email, phone_number, user_role, date_of_joining, is_active, created_at)
  VALUES (v_admin_user_uid, GARAGE_ID, 'GARAGE-001', 'RevvOs Garage', 'Sneha', 'Patel', 'sneha.patel', 'admin@revosgarage.com', '+91 98765 11112', 'admin', '2022-02-01', true, NOW() - INTERVAL '2 years')
  ON CONFLICT (user_uid) DO NOTHING;

  -- Service Advisor 1
  INSERT INTO public.garage_auth (user_uid, garage_id, email, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'vikram.singh@revosgarage.com', NOW() - INTERVAL '18 months')
  ON CONFLICT (user_uid) DO NOTHING
  RETURNING user_uid INTO v_service_advisor_1_uid;

  INSERT INTO public.users (user_uid, garage_uid, garage_id, garage_name, first_name, last_name, login_id, email, phone_number, alternate_phone, address, city, state, user_role, date_of_joining, is_active, created_at)
  VALUES (v_service_advisor_1_uid, GARAGE_ID, 'GARAGE-001', 'RevvOs Garage', 'Vikram', 'Singh', 'vikram.singh', 'vikram.singh@revosgarage.com', '+91 98765 11113', '+91 98765 11114', '123, MG Road', 'Bangalore', 'Karnataka', 'service_advisor', '2023-06-15', true, NOW() - INTERVAL '18 months')
  ON CONFLICT (user_uid) DO NOTHING;

  -- Service Advisor 2
  INSERT INTO public.garage_auth (user_uid, garage_id, email, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'priya.sharma@revosgarage.com', NOW() - INTERVAL '12 months')
  ON CONFLICT (user_uid) DO NOTHING
  RETURNING user_uid INTO v_service_advisor_2_uid;

  INSERT INTO public.users (user_uid, garage_uid, garage_id, garage_name, first_name, last_name, login_id, email, phone_number, city, state, user_role, date_of_joining, is_active, created_at)
  VALUES (v_service_advisor_2_uid, GARAGE_ID, 'GARAGE-001', 'RevvOs Garage', 'Priya', 'Sharma', 'priya.sharma', 'priya.sharma@revosgarage.com', '+91 98765 11115', 'Mumbai', 'Maharashtra', 'service_advisor', '2024-01-10', true, NOW() - INTERVAL '12 months')
  ON CONFLICT (user_uid) DO NOTHING;

  -- Lead Mechanic 1
  INSERT INTO public.garage_auth (user_uid, garage_id, email, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'amit.kumar@revosgarage.com', NOW() - INTERVAL '2 years')
  ON CONFLICT (user_uid) DO NOTHING
  RETURNING user_uid INTO v_mechanic_1_uid;

  INSERT INTO public.users (user_uid, garage_uid, garage_id, garage_name, first_name, last_name, login_id, email, phone_number, address, city, state, user_role, date_of_joining, certifications, specializations, is_active, created_at)
  VALUES (v_mechanic_1_uid, GARAGE_ID, 'GARAGE-001', 'RevvOs Garage', 'Amit', 'Kumar', 'amit.kumar', 'amit.kumar@revosgarage.com', '+91 98765 11116', '45, Industrial Area', 'Bangalore', 'Karnataka', 'mechanic', '2022-03-01',
    '["Honda Certified Mechanic", "Two-Wheeler Expert"]'::jsonb,
    '["Engine Repair", "Electrical Systems", "Fuel Injection"]'::jsonb,
    true, NOW() - INTERVAL '2 years')
  ON CONFLICT (user_uid) DO NOTHING;

  -- Mechanic 2
  INSERT INTO public.garage_auth (user_uid, garage_id, email, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'rahul.verma@revosgarage.com', NOW() - INTERVAL '15 months')
  ON CONFLICT (user_uid) DO NOTHING
  RETURNING user_uid INTO v_mechanic_2_uid;

  INSERT INTO public.users (user_uid, garage_uid, garage_id, garage_name, first_name, last_name, login_id, email, phone_number, city, state, user_role, date_of_joining, specializations, is_active, created_at)
  VALUES (v_mechanic_2_uid, GARAGE_ID, 'GARAGE-001', 'RevvOs Garage', 'Rahul', 'Verma', 'rahul.verma', 'rahul.verma@revosgarage.com', '+91 98765 11117', 'Delhi', 'Delhi', 'mechanic', '2023-09-01',
    '["Brake Systems", "Suspension", "Wheel Alignment"]'::jsonb,
    true, NOW() - INTERVAL '15 months')
  ON CONFLICT (user_uid) DO NOTHING;

  -- Mechanic 3
  INSERT INTO public.garage_auth (user_uid, garage_id, email, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'suresh.iyengar@revosgarage.com', NOW() - INTERVAL '10 months')
  ON CONFLICT (user_uid) DO NOTHING
  RETURNING user_uid INTO v_mechanic_3_uid;

  INSERT INTO public.users (user_uid, garage_uid, garage_id, garage_name, first_name, last_name, login_id, email, phone_number, user_role, date_of_joining, is_active, created_at)
  VALUES (v_mechanic_3_uid, GARAGE_ID, 'GARAGE-001', 'RevvOs Garage', 'Suresh', 'Iyengar', 'suresh.iyengar', 'suresh.iyengar@revosgarage.com', '+91 98765 11118', 'Bangalore', 'Karnataka', 'mechanic', '2024-03-01', true, NOW() - INTERVAL '10 months')
  ON CONFLICT (user_uid) DO NOTHING;

  -- Technician
  INSERT INTO public.garage_auth (user_uid, garage_id, email, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'dinesh.rao@revosgarage.com', NOW() - INTERVAL '8 months')
  ON CONFLICT (user_uid) DO NOTHING
  RETURNING user_uid INTO v_technician_uid;

  INSERT INTO public.users (user_uid, garage_uid, garage_id, garage_name, first_name, last_name, login_id, email, phone_number, user_role, date_of_joining, is_active, created_at)
  VALUES (v_technician_uid, GARAGE_ID, 'GARAGE-001', 'RevvOs Garage', 'Dinesh', 'Rao', 'dinesh.rao', 'dinesh.rao@revosgarage.com', '+91 98765 11119', 'Chennai', 'Tamil Nadu', 'employee', '2024-05-01', true, NOW() - INTERVAL '8 months')
  ON CONFLICT (user_uid) DO NOTHING;

  -- ============================================================================
  -- STEP 2: INSERT CUSTOMERS
  -- ============================================================================
  RAISE NOTICE 'Step 2: Creating customers...';

  -- Customer 1: Regular customer with multiple vehicles
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, alternate_phone, email, address, city, state, zip_code, country, notes, status, customer_since, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Ramesh', 'Gupta', '+91 98765 43210', '+91 98765 43211', 'ramesh.gupta@email.com', '42, 5th Cross, Malleshwaram', 'Bangalore', 'Karnataka', '560003', 'India', 'Regular customer, prefers same-day service', 'active', NOW() - INTERVAL '3 years', NOW() - INTERVAL '3 years')
  RETURNING id INTO v_customer_1_id;

  -- Customer 2: New customer
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, email, address, city, state, zip_code, status, customer_since, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Sunita', 'Reddy', '+91 98765 54321', 'sunita.reddy@email.com', '78, Jayanagar 4th Block', 'Bangalore', 'Karnataka', '560041', 'active', NOW() - INTERVAL '6 months', NOW() - INTERVAL '6 months')
  RETURNING id INTO v_customer_2_id;

  -- Customer 3: Long-term customer
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, alternate_phone, email, address, city, state, zip_code, country, notes, status, customer_since, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Krishna', 'Murthy', '+91 98765 65432', '+91 98765 65433', 'krishna.murthy@email.com', '156, Gandhi Road', 'Mysore', 'Karnataka', '570001', 'India', 'VIP customer, always pays on time', 'active', NOW() - INTERVAL '5 years', NOW() - INTERVAL '5 years')
  RETURNING id INTO v_customer_3_id;

  -- Customer 4: Corporate customer
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, email, address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Anand', 'Prakash', '+91 98765 76543', 'anand.prakash@techemploy.com', 'TechEmploy Pvt Ltd, 45, Residency Road', 'Bangalore', 'Karnataka', '560025', 'Corporate account - fleet of 10 vehicles', 'active', NOW() - INTERVAL '2 years', NOW() - INTERVAL '2 years')
  RETURNING id INTO v_customer_4_id;

  -- Customer 5: Student
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, email, address, city, state, zip_code, status, customer_since, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Priyanka', 'Desai', '+91 98765 87654', 'priyanka.desai@student.com', 'Vijaya College Hostel, Basavanagudi', 'Bangalore', 'Karnataka', '560004', 'active', NOW() - INTERVAL '1 year', NOW() - INTERVAL '1 year')
  RETURNING id INTO v_customer_5_id;

  -- Customer 6: Retired senior citizen
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, alternate_phone, email, address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Lakshmi', 'Devi', '+91 98765 98765', '+91 98765 98766', 'lakshsmi.devi@email.com', '23, Temple Street', 'Mysore', 'Karnataka', '570002', 'Senior citizen - needs extra care', 'active', NOW() - INTERVAL '4 years', NOW() - INTERVAL '4 years')
  RETURNING id INTO v_customer_6_id;

  -- Customer 7: Business professional
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, email, address, city, state, zip_code, status, customer_since, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Vikram', 'Saxena', '+91 98765 11122', 'vikram.saxena@email.com', '89, Brigade Road', 'Bangalore', 'Karnataka', '560027', 'active', NOW() - INTERVAL '8 months', NOW() - INTERVAL '8 months')
  RETURNING id INTO v_customer_7_id;

  -- Customer 8: Walk-in customer
  INSERT INTO public.customers (id, garage_id, first_name, last_name, phone_number, address, city, state, zip_code, notes, status, customer_since, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Mohammed', 'Khan', '+91 98765 22233', '12, Mosque Road', 'Bangalore', 'Karnataka', '560028', 'Walk-in customer, first time', 'active', NOW() - INTERVAL '2 months', NOW() - INTERVAL '2 months')
  RETURNING id INTO v_customer_8_id;

  -- ============================================================================
  -- STEP 3: INSERT CUSTOMER VEHICLES
  -- ============================================================================
  RAISE NOTICE 'Step 3: Creating customer vehicles...';

  -- Customer 1 vehicles (3 vehicles)
  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, last_service_date, status, created_at)
  VALUES (gen_random_uuid(), v_customer_1_id, GARAGE_ID, 'Honda', 'Activa 6G', 2023, 'KA-03-EM-2345', 'MA1JB5412MC345678', 'Pearl Igneous Black', 'JC50E1123456', 45000, NOW() - INTERVAL '2 months', 'active', NOW() - INTERVAL '2 years')
  RETURNING id INTO v_vehicle_1_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, status, created_at)
  VALUES (gen_random_uuid(), v_customer_1_id, GARAGE_ID, 'Honda', 'Dio', 2022, 'KA-03-EN-5678', 'MA1JB2398MC765432', 'Sports Red', 'JC50E2234567', 28000, 'active', NOW() - INTERVAL '18 months')
  RETURNING id INTO v_vehicle_2_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, status, created_at)
  VALUES (gen_random_uuid(), v_customer_1_id, GARAGE_ID, 'Hero', 'Splendor+', 2021, 'KA-03-EP-9012', 'MBLHERO12345678901', 'Black', 'JC50E3345678', 35000, 'active', NOW() - INTERVAL '3 years')
  RETURNING id INTO v_vehicle_3_id;

  -- Customer 2 vehicles (2 vehicles)
  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, status, created_at)
  VALUES (gen_random_uuid(), v_customer_2_id, GARAGE_ID, 'TVS', 'Jupiter', 2023, 'KA-01-HJ-3456', 'MD2AABCD987654321', 'Mint Blue', 'JC50E4456789', 12000, 'active', NOW() - INTERVAL '6 months')
  RETURNING id INTO v_vehicle_4_id;

  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, status, created_at)
  VALUES (gen_random_uuid(), v_customer_2_id, GARAGE_ID, 'Suzuki', 'Access 125', 2022, 'KA-01-HK-7890', 'MD2AACBA567890123', 'Glass Sparkle Black', 'JC50E5567890', 18000, 'active', NOW() - INTERVAL '6 months')
  RETURNING id INTO v_vehicle_5_id;

  -- Customer 3 vehicles (1 vehicle)
  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, last_service_date, notes, status, created_at)
  VALUES (gen_random_uuid(), v_customer_3_id, GARAGE_ID, 'Bajaj', 'Pulsar NS200', 2021, 'KA-02-CD-5678', 'MD2AABCD123456', 'Burnt Orange', 'JC50E6678901', 35000, NOW() - INTERVAL '1 month', 'Well maintained, regular service', 'active', NOW() - INTERVAL '5 years')
  RETURNING id INTO v_vehicle_6_id;

  -- Customer 4 vehicles (1 vehicle - corporate)
  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, status, created_at)
  VALUES (gen_random_uuid(), v_customer_4_id, GARAGE_ID, 'Hero', 'Glamour', 2023, 'KA-03-FG-1234', 'MBLHERO56789012345', 'Triple Red', 'JC50E7789012', 8000, 'active', NOW() - INTERVAL '2 years')
  RETURNING id INTO v_vehicle_7_id;

  -- Customer 5 vehicles (1 vehicle)
  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, status, created_at)
  VALUES (gen_random_uuid(), v_customer_5_id, GARAGE_ID, 'Honda', 'Activa 125', 2022, 'KA-05-RS-6789', 'MA1JB890123456789', 'Reign Orange', 'JC50E8890123', 15000, 'active', NOW() - INTERVAL '1 year')
  RETURNING id INTO v_vehicle_8_id;

  -- Customer 6 vehicles (1 electric scooter)
  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, notes, status, created_at)
  VALUES (gen_random_uuid(), v_customer_6_id, GARAGE_ID, 'Bajaj', 'Chetak Electric', 2023, 'KA-03-EV-1111', 'MD2AAELECTRIC001122', 'White', 'EV-MOTOR-001', 2500, 'Electric scooter - battery health good', 'active', NOW() - INTERVAL '4 years')
  RETURNING id INTO v_vehicle_9_id;

  -- Customer 7 vehicles (1 vehicle)
  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, status, created_at)
  VALUES (gen_random_uuid(), v_customer_7_id, GARAGE_ID, 'Royal Enfield', 'Classic 350', 2022, 'KA-02-RE-3456', 'MD2AARE12345678901', 'Black', 'MC50E9901234', 18000, 'active', NOW() - INTERVAL '8 months')
  RETURNING id INTO v_vehicle_10_id;

  -- Customer 8 vehicles (1 vehicle)
  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, status, created_at)
  VALUES (gen_random_uuid(), v_customer_8_id, GARAGE_ID, 'Yamaha', 'Fascino 125', 2023, 'KA-01-YM-7890', 'MD2AAYAMA987654321', 'Yellow Cyan', 'JC50E1012345', 6000, 'active', NOW() - INTERVAL '2 months')
  RETURNING id INTO v_vehicle_11_id;

  -- Additional vehicle for Customer 1 (new purchase)
  INSERT INTO public.customer_vehicles (id, customer_id, garage_id, make, model, year, license_plate, vin, color, engine_number, current_mileage, status, created_at)
  VALUES (gen_random_uuid(), v_customer_1_id, GARAGE_ID, 'Honda', 'Activa 7G', 2025, 'KA-03-EN-9999', 'MA1JB2025NEW001122', 'Pearl Igneous Black', 'JC50E2025001', 500, 'active', NOW() - INTERVAL '1 week')
  RETURNING id INTO v_vehicle_12_id;

  -- ============================================================================
  -- STEP 4: INSERT PARTS CATEGORIES
  -- ============================================================================
  RAISE NOTICE 'Step 4: Creating parts categories...';

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Engine', 'Engine parts and components including pistons, valves, gaskets', 1, true, NOW())
  RETURNING id INTO v_cat_engine_id;

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Brakes', 'Brake system components - pads, shoes, discs, drums', 2, true, NOW())
  RETURNING id INTO v_cat_brakes_id;

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Electrical', 'Electrical components - lights, switches, wiring, ignition', 3, true, NOW())
  RETURNING id INTO v_cat_electrical_id;

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Suspension', 'Suspension parts - shocks, forks, bearings', 4, true, NOW())
  RETURNING id INTO v_cat_suspension_id;

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Body', 'Body panels, mirrors, handles, cosmetic parts', 5, true, NOW())
  RETURNING id INTO v_cat_body_id;

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Oil & Fluids', 'Engine oil, brake fluid, coolant, lubricants', 6, true, NOW())
  RETURNING id INTO v_cat_oil_fluids_id;

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Battery', 'Batteries and battery-related components', 7, true, NOW())
  RETURNING id INTO v_cat_battery_id;

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Exhaust', 'Exhaust systems, mufflers, silencers', 8, true, NOW())
  RETURNING id INTO v_cat_exhaust_id;

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Transmission', 'Clutch, transmission, chain, sprockets', 9, true, NOW())
  RETURNING id INTO v_cat_transmission_id;

  INSERT INTO public.parts_categories (id, garage_id, category_name, description, display_order, is_active, created_at)
  VALUES (gen_random_uuid(), GARAGE_ID, 'Filters', 'Air filters, oil filters, fuel filters', 10, true, NOW())
  RETURNING id INTO v_cat_filters_id;

  -- ============================================================================
  -- STEP 5: INSERT PARTS SUPPLIERS
  -- ============================================================================
  RAISE NOTICE 'Step 5: Creating parts suppliers...';

  INSERT INTO public.parts_suppliers (
    id, garage_id, supplier_name, supplier_code, contact_person, phone, alternate_phone, email,
    address, city, state, zip_code, country, gstin, payment_terms, credit_limit, credit_days,
    rating, is_preferred, is_active, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'Bajaj Auto Parts Ltd', 'SUP-001',
    'Rajesh Kumar', '+91 98765 11111', '+91 98765 11112', 'rajesh.kumar@bajajparts.com',
    '456, Industrial Area, Phase 2', 'Bangalore', 'Karnataka', '560045', 'India',
    '29ABCDE1234F1Z5', 'Net 30', 100000.00, 30,
    5, true, true, NOW() - INTERVAL '2 years'
  )
  RETURNING id INTO v_supplier_1_id;

  INSERT INTO public.parts_suppliers (
    id, garage_id, supplier_name, supplier_code, contact_person, phone, email,
    address, city, state, zip_code, country, gstin, payment_terms, rating,
    is_preferred, is_active, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'Honda Genuine Parts', 'SUP-002',
    'Suresh Iyengar', '+91 98765 22222', 'suresh.iyengar@hondaparts.com',
    '123, Hosur Road', 'Bangalore', 'Karnataka', '560068', 'India',
    '29BCDEF5678G2Z6', 'Advance', 4, true, true, NOW() - INTERVAL '2 years'
  )
  RETURNING id INTO v_supplier_2_id;

  INSERT INTO public.parts_suppliers (
    id, garage_id, supplier_name, supplier_code, contact_person, phone, email,
    address, city, state, zip_code, country, payment_terms, rating,
    is_preferred, is_active, notes, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'TVS Spares Depot', 'SUP-003',
    'Mohan Reddy', '+91 98765 33333', 'mohan.reddy@tvsspares.com',
    '789, Sarjapur Road', 'Bangalore', 'Karnataka', '560034', 'India',
    'COD', 3, false, true, 'Local supplier, quick delivery but limited stock', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_supplier_3_id;

  INSERT INTO public.parts_suppliers (
    id, garage_id, supplier_name, supplier_code, contact_person, phone, email,
    address, city, state, zip_code, country, gstin, payment_terms, rating,
    is_preferred, is_active, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'Universal Auto Parts', 'SUP-004',
    'Ankit Sharma', '+91 98765 44444', 'ankit.sharma@universalparts.com',
    '234, Okhla Industrial Area', 'New Delhi', 'Delhi', '110020', 'India',
    '27GHIJK9012L3Z8', 'Net 45', 4, false, true, NOW() - INTERVAL '3 years'
  )
  RETURNING id INTO v_supplier_4_id;

  -- ============================================================================
  -- STEP 6: GET MOTORCYCLE IDs FOR FITMENT
  -- ============================================================================
  RAISE NOTICE 'Step 6: Getting motorcycle IDs for parts fitment...';

  SELECT id INTO v_moto_honda_activa_6g FROM public.motorcycles WHERE make = 'Honda' AND model = 'Activa 6G' LIMIT 1;
  SELECT id INTO v_moto_honda_activa_125 FROM public.motorcycles WHERE make = 'Honda' AND model LIKE '%Activa 125%' LIMIT 1;
  SELECT id INTO v_moto_hero_splendor_plus FROM public.motorcycles WHERE make = 'Hero' AND model = 'Splendor+' LIMIT 1;
  SELECT id INTO v_moto_hero_glamour FROM public.motorcycles WHERE make = 'Hero' AND model = 'Glamour' LIMIT 1;
  SELECT id INTO v_moto_bajaj_pulsar_ns200 FROM public.motorcycles WHERE make = 'Bajaj' AND model = 'Pulsar NS200' LIMIT 1;
  SELECT id INTO v_moto_bajaj_ct100 FROM public.motorcycles WHERE make = 'Bajaj' AND model = 'CT100' LIMIT 1;
  SELECT id INTO v_moto_tv_jupiter FROM public.motorcycles WHERE make = 'TVS' AND model = 'Jupiter' LIMIT 1;
  SELECT id INTO v_moto_suzuki_access FROM public.motorcycles WHERE make = 'Suzuki' AND model = 'Access 125' LIMIT 1;
  SELECT id INTO v_moto_royal_enfield_classic FROM public.motorcycles WHERE make = 'Royal Enfield' AND model = 'Classic 350' LIMIT 1;
  SELECT id INTO v_moto_yamaha_fascino FROM public.motorcycles WHERE make = 'Yamaha' AND model = 'Fascino' LIMIT 1;
  SELECT id INTO v_moto_honda_dio FROM public.motorcycles WHERE make = 'Honda' AND model = 'Dio' LIMIT 1;
  SELECT id INTO v_moto_bajaj_chetak FROM public.motorcycles WHERE make = 'Bajaj' AND model LIKE '%Chetak%' LIMIT 1;

  -- ============================================================================
  -- STEP 7: INSERT PARTS
  -- ============================================================================
  RAISE NOTICE 'Step 7: Creating parts inventory...';

  -- Engine Parts
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, make, model, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price, profit_margin_pct,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku, lead_time_days, minimum_order_quantity, location,
    sku, oem_part_number, country_of_origin, warranty_months, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'ENG-HON-001', 'Timing Belt Honda Activa', v_cat_engine_id, 'Engine', 'Honda', 'Activa 6G', 'Engine',
    'High-quality timing belt for Honda Activa 6G. Ensures precise engine timing.',
    15, 25, 5,
    450.00, 750.00, 600.00, 66.67,
    v_supplier_2_id, 'Honda Genuine Parts', '+91 98765 22222', 'suresh.iyengar@hondaparts.com', 'HGP-TB-2023-001', 2, 5, 'A1-01',
    'SKU-ENG-HON-001', '06110-KNF-901', 'India', 6, 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_1_id;

  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'ENG-UNI-002', 'Piston Kit Standard Bore', v_cat_engine_id, 'Engine', 'Engine',
    'Standard piston kit for most 100-125cc motorcycles. Includes piston, rings, and pin.',
    20, 40, 8,
    850.00, 1200.00, 1000.00,
    v_supplier_4_id, 'Universal Auto Parts', '+91 98765 44444', 'UAP-PISTON-STD', 5, 'A2-01',
    'SKU-ENG-UNI-002', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_2_id;

  -- Brake Parts
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, make, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'BRK-HON-F-001', 'Brake Pad Front Honda Activa', v_cat_brakes_id, 'Brakes', 'Honda', 'Brakes',
    'Front brake pad set for Honda Activa. Ceramic compound for longer life.',
    25, 50, 10,
    350.00, 550.00, 450.00,
    v_supplier_2_id, 'Honda Genuine Parts', '+91 98765 22222', 'HGP-BP-F-001', 1, 'B1-01',
    'SKU-BRK-HON-F-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_3_id;

  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_email, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'BRK-UNI-S-001', 'Brake Shoe Rear 110mm', v_cat_brakes_id, 'Brakes', 'Brakes',
    'Universal rear brake shoe for 110mm drum. Fits most scooters.',
    40, 60, 15,
    180.00, 300.00,
    v_supplier_4_id, 'Universal Auto Parts', 'ankit.sharma@universalparts.com', 'UAP-BS-110', 3, 'B2-01',
    'SKU-BRK-UNI-S-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_4_id;

  -- Oil & Fluids
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, make, model, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, vendor_sku, lead_time_days, minimum_order_quantity, location,
    sku, oem_part_number, warranty_months, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'OIL-MOT-10W40', 'Motul 7100 4T 10W-40', v_cat_oil_fluids_id, 'Oil & Fluids', 'Motul', '7100 4T', 'Engine',
    'Full synthetic engine oil 1L. Excellent for all modern 4-stroke motorcycles.',
    50, 100, 20,
    550.00, 750.00, 650.00,
    v_supplier_1_id, 'Bajaj Auto Parts Ltd', '+91 98765 11111', 'MOT-7100-10W40-1L', 3, 12, 'O1-01',
    'SKU-OIL-MOT-10W40', 'MOT-7100', 12, 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_5_id;

  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'OIL-BRAKE-DOT4', 'Brake Fluid DOT4 500ml', v_cat_oil_fluids_id, 'Oil & Fluids', 'Brakes',
    'High-quality DOT4 brake fluid. 500ml bottle.',
    30, 50, 10,
    150.00, 250.00,
    v_supplier_4_id, 'Universal Auto Parts', 'UAP-BF-DOT4-500', 7, 'O2-01',
    'SKU-OIL-BRAKE-DOT4', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_6_id;

  -- Electrical Parts
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, make, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_phone, vendor_sku, lead_time_days, location,
    sku, oem_part_number, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'ELE-HON-001', 'Spark Plug Honda Activa', v_cat_electrical_id, 'Electrical', 'Honda', 'Electrical',
    'Genuine spark plug for Honda Activa. Ensures optimal ignition.',
    35, 70, 15,
    80.00, 150.00,
    v_supplier_2_id, 'Honda Genuine Parts', '+91 98765 22222', 'HGP-SP-001', 2, 'E1-01',
    'SKU-ELE-HON-001', '98079-56877', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_7_id;

  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'ELE-UNI-001', 'Headlight Bulb 12V 35/35W', v_cat_electrical_id, 'Electrical', 'Electrical',
    'Standard halogen headlight bulb. Fits most two-wheelers.',
    60, 100, 20,
    50.00, 100.00,
    v_supplier_4_id, 'Universal Auto Parts', 'UAP-HB-12V-35', 5, 'E2-01',
    'SKU-ELE-UNI-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_8_id;

  -- Battery
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, vendor_sku, lead_time_days, minimum_order_quantity, location,
    sku, warranty_months, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'BAT-12V-5AH', 'Battery 12V 5Ah Maintenance Free', v_cat_battery_id, 'Battery', 'Electrical',
    'Maintenance-free 12V 5Ah battery. Fits most scooters.',
    10, 20, 5,
    1200.00, 1800.00, 1500.00,
    v_supplier_4_id, 'Universal Auto Parts', '+91 98765 44444', 'UAP-BAT-12V-5AH', 5, 5, 'BAT1-01',
    'SKU-BAT-12V-5AH', 6, 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_9_id;

  -- Filters
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, make, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'FLT-HON-A-001', 'Air Filter Honda Activa', v_cat_filters_id, 'Filters', 'Honda', 'Engine',
    'Genuine air filter for Honda Activa. Ensures clean air intake.',
    20, 40, 10,
    120.00, 200.00,
    v_supplier_2_id, 'Honda Genuine Parts', 'HGP-AF-001', 2, 'F1-01',
    'SKU-FLT-HON-A-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_10_id;

  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'FLT-UNI-O-001', 'Oil Filter Universal', v_cat_filters_id, 'Filters', 'Engine',
    'Universal oil filter. Fits most 100-150cc motorcycles.',
    45, 80, 15,
    80.00, 150.00,
    v_supplier_4_id, 'Universal Auto Parts', 'UAP-OF-UNI', 3, 'F2-01',
    'SKU-FLT-UNI-O-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_11_id;

  -- Suspension
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'SUS-FRK-001', 'Front Shock Absorber', v_cat_suspension_id, 'Suspension', 'Suspension',
    'Universal front shock absorber for scooters. 300mm length.',
    8, 15, 5,
    1500.00, 2200.00,
    v_supplier_4_id, 'Universal Auto Parts', 'UAP-FSA-300', 7, 'S1-01',
    'SKU-SUS-FRK-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_12_id;

  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'SUS-BER-001', 'Wheel Bearing Set Front', v_cat_suspension_id, 'Suspension', 'Suspension',
    'Front wheel bearing set (2 pieces). 6205-2RS size.',
    50, 100, 20,
    250.00, 450.00,
    v_supplier_4_id, 'Universal Auto Parts', 'UAP-WB-F-6205', 5, 'S2-01',
    'SKU-SUS-BER-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_13_id;

  -- Transmission
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'TRN-CHN-001', 'Drive Chain 428H 116L', v_cat_transmission_id, 'Transmission', 'Transmission',
    'Heavy-duty drive chain 428H with 116 links. Fits most 100-125cc bikes.',
    15, 30, 8,
    650.00, 950.00,
    v_supplier_4_id, 'Universal Auto Parts', 'UAP-DC-428H-116', 5, 'T1-01',
    'SKU-TRN-CHN-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_14_id;

  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'TRN-SKT-001', 'Front Sprocket 14T', v_cat_transmission_id, 'Transmission', 'Transmission',
    'Front sprocket 14 teeth. 428 pitch. Common size for most bikes.',
    25, 50, 10,
    200.00, 350.00,
    v_supplier_4_id, 'Universal Auto Parts', 'UAP-FS-14T-428', 5, 'T2-01',
    'SKU-TRN-SKT-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_15_id;

  -- Body Parts
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, make, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'BDY-HON-M-001', 'Mirror Set Left/Right Honda', v_cat_body_id, 'Body', 'Honda', 'Body',
    'Genuine mirror set for Honda Activa. Includes left and right mirrors.',
    12, 25, 8,
    350.00, 550.00,
    v_supplier_2_id, 'Honda Genuine Parts', 'HGP-MIR-SET', 3, 'BD1-01',
    'SKU-BDY-HON-M-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_16_id;

  -- Exhaust
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'EXH-SIL-001', 'Exhaust Silencer Universal', v_cat_exhaust_id, 'Exhaust', 'Exhaust',
    'Universal exhaust silencer with chrome finish. Fits most scooters.',
    6, 12, 4,
    1800.00, 2800.00,
    v_supplier_4_id, 'Universal Auto Parts', 'UAP-EXS-UNI-CH', 7, 'EX1-01',
    'SKU-EXH-SIL-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_17_id;

  -- More parts to complete inventory
  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'TIRE-FRN-001', 'Tire Front 90/100-10', v_cat_body_id, 'Body', 'Body',
    'Front tire 90/100-10 tubeless. Common size for scooters.',
    10, 20, 5,
    1200.00, 1800.00,
    v_supplier_1_id, 'Bajaj Auto Parts Ltd', 'BAP-T-F-90-100-10', 5, 'T1-01',
    'SKU-TIRE-FRN-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_18_id;

  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'TIRE-RR-001', 'Tire Rear 90/100-10', v_cat_body_id, 'Body', 'Body',
    'Rear tire 90/100-10 tubeless. Common size for scooters.',
    10, 20, 5,
    1400.00, 2000.00,
    v_supplier_1_id, 'Bajaj Auto Parts Ltd', 'BAP-T-R-90-100-10', 5, 'T2-01',
    'SKU-TIRE-RR-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_19_id;

  INSERT INTO public.parts (
    id, garage_id, part_number, part_name, category_id, category, used_for, description,
    on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, vendor_sku, lead_time_days, location,
    sku, status, created_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'TUBE-001', 'Tube 90/100-10', v_cat_body_id, 'Body', 'Body',
    'Inner tube 90/100-10. Standard thickness.',
    30, 60, 12,
    80.00, 150.00,
    v_supplier_4_id, 'Universal Auto Parts', 'UAP-T-90-100-10', 3, 'TU1-01',
    'SKU-TUBE-001', 'active', NOW() - INTERVAL '1 year'
  )
  RETURNING id INTO v_part_20_id;

  -- ============================================================================
  -- STEP 8: INSERT PARTS FITMENT
  -- ============================================================================
  RAISE NOTICE 'Step 8: Creating parts fitment...';

  -- Fitment for Part 1 (Timing Belt) - Honda Activa 6G
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes, created_at)
  VALUES (v_part_1_id, v_moto_honda_activa_6g, GARAGE_ID, 'Fits all 2019-2024 models', NOW());

  -- Fitment for Part 3 (Brake Pad) - Honda Activa 6G, Dio, Jupiter, Access
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, created_at)
  VALUES (v_part_3_id, v_moto_honda_activa_6g, GARAGE_ID, NOW());

  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, created_at)
  VALUES (v_part_3_id, v_moto_honda_dio, GARAGE_ID, NOW());

  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, created_at)
  VALUES (v_part_3_id, v_moto_tv_jupiter, GARAGE_ID, NOW());

  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, created_at)
  VALUES (v_part_3_id, v_moto_suzuki_access, GARAGE_ID, NOW());

  -- Fitment for Part 5 (Engine Oil) - Universal
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, created_at)
  VALUES (v_part_5_id, v_moto_honda_activa_6g, GARAGE_ID, NOW());

  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, created_at)
  VALUES (v_part_5_id, v_moto_hero_splendor_plus, GARAGE_ID, NOW());

  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, created_at)
  VALUES (v_part_5_id, v_moto_bajaj_pulsar_ns200, GARAGE_ID, NOW());

  -- Add more fitment as needed for other parts...

  -- ============================================================================
  -- STEP 9: INSERT PARTS BACKUP SUPPLIERS
  -- ============================================================================
  RAISE NOTICE 'Step 9: Creating parts backup suppliers...';

  INSERT INTO public.parts_backup_suppliers (part_id, garage_id, supplier_id, supplier_name, supplier_phone, vendor_sku, lead_time_days, is_preferred, created_at)
  VALUES (v_part_1_id, GARAGE_ID, v_supplier_4_id, 'Universal Auto Parts', '+91 98765 44444', 'UAP-TB-HON-ACT', 5, true, NOW());

  INSERT INTO public.parts_backup_suppliers (part_id, garage_id, supplier_id, supplier_name, supplier_phone, vendor_sku, lead_time_days, created_at)
  VALUES (v_part_5_id, GARAGE_ID, v_supplier_2_id, 'Honda Genuine Parts', '+91 98765 22222', 'HGP-OIL-10W40', 3, NOW());

  -- ============================================================================
  -- STEP 10: INSERT PARTS TRANSACTIONS
  -- ============================================================================
  RAISE NOTICE 'Step 10: Creating parts transactions...';

  INSERT INTO public.parts_transactions (
    part_id, garage_id, transaction_type, quantity, stock_before, stock_after,
    location_from, location_to, reference_type, reference_number,
    supplier_id, supplier_name, unit_price, total_value, notes, performed_by, performed_by_name, created_at
  )
  VALUES (
    v_part_5_id, GARAGE_ID, 'purchase', 50, 0, 50,
    NULL, 'warehouse', 'purchase_order', 'PO-2025-001',
    v_supplier_1_id, 'Bajaj Auto Parts Ltd', 550.00, 27500.00, 'Monthly stock purchase', v_admin_user_uid, 'Sneha Patel', NOW() - INTERVAL '1 month'
  );

  INSERT INTO public.parts_transactions (
    part_id, garage_id, transaction_type, quantity, stock_before, stock_after,
    location_from, location_to, reference_type, reference_id, unit_price, total_value, notes, performed_by, performed_by_name, created_at
  )
  VALUES (
    v_part_3_id, GARAGE_ID, 'sale', -2, 27, 25,
    'warehouse', NULL, 'job_card', v_job_card_1_id, 550.00, 1100.00, 'Used for JC-2025-0001', v_mechanic_1_uid, 'Amit Kumar', NOW() - INTERVAL '1 day'
  );

  RAISE NOTICE 'Parts inventory created successfully!';

  -- ============================================================================
  -- STEP 11: INSERT JOB CARDS
  -- ============================================================================
  RAISE NOTICE 'Step 11: Creating job cards...';

  -- Job Card 1: Timing Belt Replacement (In Progress)
  INSERT INTO public.job_cards (
    id, garage_id, job_card_number, customer_id, customer_name, customer_phone, customer_email,
    vehicle_id, vehicle_make, vehicle_model, vehicle_year, vehicle_license_plate, vehicle_vin, current_mileage,
    status, priority, job_type,
    customer_complaint, work_requested, customer_notes,
    reported_issue, customer_reported_issues, work_requested_items, technical_diagnosis_items,
    tags, job_tags,
    promised_date, promised_time,
    service_advisor_id, lead_mechanic_id,
    estimated_labor_minutes, actual_labor_minutes,
    estimated_labor_cost, actual_labor_cost, estimated_parts_cost, actual_parts_cost,
    discount_amount, tax_amount, final_amount,
    payment_status,
    source, vehicle_condition_on_arrival, drop_off_mileage, drop_off_fuel_level,
    internal_notes, mechanic_notes, service_advisor_notes,
    warranty_type, warranty_months, warranty_km,
    created_at, updated_at, created_by
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'JC-2025-0001',
    v_customer_1_id, 'Ramesh Gupta', '+91 98765 43210', 'ramesh.gupta@email.com',
    v_vehicle_1_id, 'Honda', 'Activa 6G', 2023, 'KA-03-EM-2345', 'MA1JB5412MC345678', 45000,
    'in_progress', 'high', 'repair',
    'Engine making strange grinding noise when accelerating above 40 km/h', 'Diagnose and fix engine noise, Check suspension system, Inspect and replace brake pads if needed', 'Please call before doing any major work. I need the vehicle back by Tuesday evening.',
    'Engine making strange grinding noise when accelerating above 40 km/h',
    '["Engine making strange grinding noise when accelerating above 40 km/h", "Vehicle vibrating at high speeds", "Brake pads making squeaking noise"]'::jsonb,
    '["Diagnose and fix engine noise", "Check suspension system", "Inspect and replace brake pads if needed", "General service check"]'::jsonb,
    '["Timing belt worn out - needs replacement", "Tensioner showing signs of wear", "Front wheel bearings need attention"]'::jsonb,
    '["engine", "timing-belt", "priority"]'::jsonb,
    '["critical", "warranty-job"]'::jsonb,
    '2025-01-20', '14:00',
    v_service_advisor_1_uid, v_mechanic_1_uid,
    450, 120,
    4500.00, 3850.00, 3200.00, 3175.00,
    0, 0, 7025.00,
    'pending',
    'walk-in', 'Fair condition, some scratches on front fairing', 45000, 'half',
    'Customer is a regular, prioritize this job. He has referred 3 other customers.',
    'Need to check timing belt and tensioner. Customer mentioned noise started after last service from another garage.',
    'Customer called and is concerned about cost. Keep him updated.',
    'Parts warranty', 6, 5000,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 hour', v_service_advisor_1_uid
  )
  RETURNING id INTO v_job_card_1_id;

  -- Job Card 2: Brake System Service (Queued)
  INSERT INTO public.job_cards (
    id, garage_id, job_card_number, customer_id, customer_name, customer_phone, customer_email,
    vehicle_id, vehicle_make, vehicle_model, vehicle_year, vehicle_license_plate, vehicle_vin, current_mileage,
    status, priority, job_type,
    customer_complaint, work_requested, customer_notes,
    reported_issue, customer_reported_issues, work_requested_items, technical_diagnosis_items,
    tags, job_tags,
    promised_date, promised_time,
    service_advisor_id, lead_mechanic_id,
    estimated_labor_minutes, estimated_labor_cost, estimated_parts_cost,
    discount_amount, tax_amount, final_amount,
    payment_status, source,
    internal_notes, warranty_type, warranty_months, warranty_km,
    created_at, updated_at, created_by
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'JC-2025-0002',
    v_customer_2_id, 'Sunita Reddy', '+91 98765 54321', 'sunita.reddy@email.com',
    v_vehicle_4_id, 'TVS', 'Jupiter', 2023, 'KA-01-HJ-3456', 'MD2AABCD987654321', 12000,
    'queued', 'medium', 'maintenance',
    'Brakes are not working properly. Need to check brake pads and fluid', 'Complete brake system check, Replace brake pads if needed, Flush and replace brake fluid', 'This is my daily commute vehicle. Please complete it as soon as possible.',
    'Brakes are not working properly. Need to check brake pads and fluid',
    '["Brakes feel spongy", "Brake lever travels too far", "Unusual noise when braking"]'::jsonb,
    '["Complete brake system check", "Replace front brake pads", "Replace rear brake shoes", "Flush and replace brake fluid"]'::jsonb,
    '["Brake fluid contaminated with water", "Front brake pads worn to 2mm", "Rear brake shoes worn out"]'::jsonb,
    '["brakes", "safety", "maintenance"]'::jsonb,
    '["maintenance", "scheduled"]'::jsonb,
    '2025-01-22', '10:00',
    v_service_advisor_2_uid, v_mechanic_2_uid,
    180, 1500.00, 2500.00,
    100, 340, 3840.00,
    'pending', 'phone',
    'First time customer. Provide good service.', 'Labor warranty', 3, 1000,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', v_service_advisor_2_uid
  )
  RETURNING id INTO v_job_card_2_id;

  -- Job Card 3: General Service (Ready - Completed)
  INSERT INTO public.job_cards (
    id, garage_id, job_card_number, customer_id, customer_name, customer_phone, customer_email,
    vehicle_id, vehicle_make, vehicle_model, vehicle_year, vehicle_license_plate, vehicle_vin, current_mileage,
    status, priority, job_type,
    customer_complaint, work_requested,
    reported_issue, customer_reported_issues, work_requested_items, technical_diagnosis_items,
    tags, job_tags,
    promised_date, promised_time, actual_completion_date,
    service_advisor_id, lead_mechanic_id,
    estimated_labor_minutes, actual_labor_minutes,
    estimated_labor_cost, actual_labor_cost,
    estimated_parts_cost, actual_parts_cost,
    discount_amount, tax_amount, final_amount,
    payment_status, payment_method, payment_date,
    source, vehicle_condition_on_arrival, drop_off_mileage, drop_off_fuel_level,
    internal_notes, mechanic_notes, service_advisor_notes, quality_check_notes,
    quality_checked, warranty_type, warranty_months, warranty_km,
    created_at, updated_at, created_by
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'JC-2025-0003',
    v_customer_3_id, 'Krishna Murthy', '+91 98765 65432', 'krishna.murthy@email.com',
    v_vehicle_6_id, 'Bajaj', 'Pulsar NS200', 2021, 'KA-02-CD-5678', 'MD2AABCD123456', 35000,
    'ready', 'low', 'maintenance',
    'Scheduled 4th free service. Vehicle is running fine otherwise.', '4th Free Service - Oil change, filter replacement, chain adjustment, brake check, general inspection',
    NULL, '["Vehicle due for scheduled service"]'::jsonb,
    '["Engine oil and filter change", "Air filter cleaning/replacement", "Chain adjustment and lubrication", "Brake system check", "Throttle and clutch cable lubrication"]'::jsonb,
    '["All systems normal, just routine maintenance needed"]'::jsonb,
    '["service", "routine", "free-service"]'::jsonb,
    '["warranty", "free-service"]'::jsonb,
    '2025-01-18', '16:00', NOW() - INTERVAL '2 hours',
    v_service_advisor_1_uid, v_mechanic_1_uid,
    90, 85,
    750.00, 700.00,
    1200.00, 1150.00,
    0, 0, 1850.00,
    'paid', 'upi', NOW() - INTERVAL '2 hours',
    'web', 'Excellent condition, very well maintained', 35000, 'full',
    '4th free service as per warranty.', 'Vehicle in great shape. All services completed.', NULL,
    'All checks passed. Vehicle ready for delivery.',
    true, 'Free service warranty', 6, 5000,
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours', v_service_advisor_1_uid
  )
  RETURNING id INTO v_job_card_3_id;

  -- Job Card 4: Electrical System Repair (Parts Waiting)
  INSERT INTO public.job_cards (
    id, garage_id, job_card_number, customer_id, customer_name, customer_phone, customer_email,
    vehicle_id, vehicle_make, vehicle_model, vehicle_year, vehicle_license_plate, vehicle_vin, current_mileage,
    status, priority, job_type,
    customer_complaint, work_requested, customer_notes,
    reported_issue, customer_reported_issues, work_requested_items, technical_diagnosis_items,
    tags, job_tags,
    promised_date, promised_time,
    service_advisor_id, lead_mechanic_id,
    estimated_labor_minutes, estimated_labor_cost, estimated_parts_cost,
    discount_amount, tax_amount, final_amount,
    payment_status, source,
    internal_notes, mechanic_notes, service_advisor_notes,
    warranty_type, warranty_months, warranty_km,
    created_at, updated_at, created_by
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'JC-2025-0004',
    v_customer_1_id, 'Ramesh Gupta', '+91 98765 43210', 'ramesh.gupta@email.com',
    v_vehicle_2_id, 'Honda', 'Dio', 2022, 'KA-03-EN-5678', 'MA1JB2398MC765432', 28000,
    'parts_waiting', 'urgent', 'repair',
    'Battery not charging. Self-start not working. Need to kick start.', 'Check battery and charging system, Replace battery if needed, Check regulator/rectifier', 'Urgent! I use this for daily office commute.',
    'Battery not charging. Self-start not working. Need to kick start.',
    '["Battery dead every morning", "Self-start not working", "Headlight dim at idle"]'::jsonb,
    '["Battery voltage check", "Charging system test", "Load test on alternator", "Check regulator/rectifier"]'::jsonb,
    '["Battery failed load test - needs replacement", "Regulator/rectifier faulty - needs replacement"]'::jsonb,
    '["electrical", "battery", "charging", "urgent"]'::jsonb,
    '["repeat-customer", "urgent"]'::jsonb,
    '2025-01-21', '12:00',
    v_service_advisor_1_uid, v_mechanic_2_uid,
    90, 900.00, 5500.00,
    0, 0, 6400.00,
    'pending', 'walk-in',
    'Repeat customer - Ramesh Gupta.', 'Ordered battery and regulator. Should arrive tomorrow.', 'Customer updated about parts delay.',
    'Parts warranty', 6, 5000,
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '30 minutes', v_service_advisor_1_uid
  )
  RETURNING id INTO v_job_card_4_id;

  -- Job Card 5: Regular Service (In Progress - Bajaj Chetak Electric)
  INSERT INTO public.job_cards (
    id, garage_id, job_card_number, customer_id, customer_name, customer_phone,
    vehicle_id, vehicle_make, vehicle_model, vehicle_year, vehicle_license_plate, vehicle_vin, current_mileage,
    status, priority, job_type,
    customer_complaint, work_requested,
    reported_issue, customer_reported_issues, work_requested_items, technical_diagnosis_items,
    tags, job_tags,
    promised_date, promised_time,
    service_advisor_id, lead_mechanic_id,
    estimated_labor_minutes, estimated_labor_cost, estimated_parts_cost,
    final_amount, payment_status, source,
    vehicle_condition_on_arrival, drop_off_mileage, drop_off_fuel_level,
    internal_notes, warranty_type, warranty_months,
    created_at, updated_at, created_by
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'JC-2025-0005',
    v_customer_6_id, 'Lakshmi Devi', '+91 98765 98765',
    v_vehicle_9_id, 'Bajaj', 'Chetak Electric', 2023, 'KA-03-EV-1111', 'MD2AAELECTRIC001122', 2500,
    'in_progress', 'medium', 'maintenance',
    'General checkup for electric scooter. Battery health check needed.', 'Battery health check, Tire pressure check, Brake inspection, General electrical system check',
    'General checkup for electric scooter. Battery health check needed.',
    '["General service needed", "Check battery health"]'::jsonb,
    '["Battery health check", "Tire pressure check", "Brake inspection", "General electrical system check"]'::jsonb,
    '["Battery health at 92% - excellent", "All systems normal"]'::jsonb,
    '["electric", "battery", "service"]'::jsonb,
    '["electric-vehicle"]'::jsonb,
    '2025-01-21', '11:00',
    v_service_advisor_2_uid, v_mechanic_3_uid,
    60, 600.00, 0,
    600.00, 'pending', 'walk-in',
    'Good condition', 2500, 'three-quarter',
    'Electric scooter - no engine oil needed. Focus on battery and electrical systems.',
    'Battery warranty', 12,
    NOW() - INTERVAL '5 hours', NOW() - INTERVAL '2 hours', v_service_advisor_2_uid
  )
  RETURNING id INTO v_job_card_5_id;

  -- Job Card 6: Tyre Replacement (Ready)
  INSERT INTO public.job_cards (
    id, garage_id, job_card_number, customer_id, customer_name, customer_phone,
    vehicle_id, vehicle_make, vehicle_model, vehicle_year, vehicle_license_plate, current_mileage,
    status, priority, job_type,
    customer_complaint, work_requested,
    reported_issue, customer_reported_issues, work_requested_items, technical_diagnosis_items,
    promised_date, promised_time, actual_completion_date,
    service_advisor_id, lead_mechanic_id,
    estimated_labor_minutes, actual_labor_minutes,
    estimated_labor_cost, actual_labor_cost,
    estimated_parts_cost, actual_parts_cost,
    final_amount, payment_status, payment_method, payment_date,
    source, vehicle_condition_on_arrival,
    internal_notes, quality_checked,
    created_at, updated_at, created_by
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID,
    'JC-2025-0006',
    v_customer_5_id, 'Priyanka Desai', '+91 98765 87654',
    v_vehicle_8_id, 'Honda', 'Activa 125', 2022, 'KA-05-RS-6789', 15000,
    'ready', 'low', 'repair',
    'Both tires worn out. Need replacement.', 'Replace front and rear tires, Wheel alignment check',
    'Both tires worn out. Need replacement.',
    '["Front tire worn to safety limit", "Rear tire worn to safety limit", "Visible cracks on sidewalls"]'::jsonb,
    '["Replace front tire", "Replace rear tire", "Wheel alignment check"]'::jsonb,
    '["Both tires need immediate replacement", "Wheel alignment slightly off"]'::jsonb,
    '2025-01-20', '15:00', NOW() - INTERVAL '4 hours',
    v_service_advisor_1_uid, v_mechanic_1_uid,
    120, 110,
    1000.00, 950.00,
    3200.00, 3200.00,
    4150.00, 'paid', 'upi', NOW() - INTERVAL '4 hours',
    'walk-in', 'Fair condition, tires very worn',
    'Student customer - gave discount on labor charge.', true,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours', v_service_advisor_1_uid
  )
  RETURNING id INTO v_job_card_6_id;

  -- ============================================================================
  -- STEP 12: INSERT CHECKLIST ITEMS FOR JOB CARDS
  -- ============================================================================
  RAISE NOTICE 'Step 12: Creating checklist items...';

  -- Checklist items for Job Card 1
  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category,
    status, priority,
    estimated_minutes, actual_minutes,
    is_timer_running, timer_started_at, total_time_spent,
    labor_rate, labor_cost,
    display_order,
    linked_issues, linked_service_items, linked_diagnosis_items,
    tags, notes,
    assigned_to, assigned_by,
    started_at, completed_at,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_1_id,
    'Diagnose engine noise issue', 'Perform thorough inspection of engine compartment, check timing belt, tensioner, and related components', 'Engine',
    'completed', 'high',
    90, 120,
    false, NULL, 7200,
    600, 1200.00,
    1,
    '[0]'::jsonb, '[0]'::jsonb, '[0, 1]'::jsonb,
    '["diagnostics", "engine"]'::jsonb,
    'Noise confirmed from timing belt area',
    v_mechanic_1_uid, v_service_advisor_1_uid,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day',
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day'
  )
  RETURNING id INTO v_checklist_1_id;

  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category,
    status, priority,
    estimated_minutes, actual_minutes,
    is_timer_running, total_time_spent,
    labor_rate, labor_cost,
    display_order,
    linked_issues, linked_service_items, linked_diagnosis_items,
    tags, notes,
    assigned_to, assigned_by,
    started_at, created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_1_id,
    'Replace timing belt and tensioner', 'Replace worn timing belt and tensioner assembly, re-time engine, verify operation', 'Engine',
    'in_progress', 'high',
    180, 90,
    true, 5400,
    700, 1050.00,
    2,
    '[0]'::jsonb, '[0]'::jsonb, '[0, 1]'::jsonb,
    '["engine", "timing-belt", "critical"]'::jsonb,
    'Parts received, in progress',
    v_mechanic_1_uid, v_service_advisor_1_uid,
    NOW() - INTERVAL '5 hours', NOW() - INTERVAL '2 days', NOW() - INTERVAL '5 hours'
  )
  RETURNING id INTO v_checklist_2_id;

  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category, status, priority,
    estimated_minutes, actual_minutes, labor_rate, labor_cost,
    display_order, linked_issues, linked_service_items, linked_diagnosis_items,
    tags, assigned_to, assigned_by,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_1_id,
    'Check suspension for vibration', 'Inspect front and rear suspension, check wheel bearings, check tire balance', 'Suspension',
    'pending', 'medium',
    120, 0, 550, 1100.00,
    3, '[1]'::jsonb, '[1]'::jsonb, '[2]'::jsonb,
    '["suspension", "vibration"]'::jsonb,
    v_mechanic_2_uid, v_service_advisor_1_uid,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  )
  RETURNING id INTO v_checklist_3_id;

  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category, status, priority,
    estimated_minutes, actual_minutes, labor_rate, labor_cost,
    display_order, linked_issues, linked_service_items,
    tags, assigned_to, assigned_by,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_1_id,
    'Inspect and replace brake pads', 'Check front and rear brake pads, measure thickness, replace if worn', 'Brakes',
    'pending', 'low',
    60, 0, 500, 500.00,
    4, '[2]'::jsonb, '[2]'::jsonb,
    '["brakes", "safety"]'::jsonb,
    v_mechanic_1_uid, v_service_advisor_1_uid,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  )
  RETURNING id INTO v_checklist_4_id;

  -- Checklist items for Job Card 2
  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category, status, priority,
    estimated_minutes, labor_rate, labor_cost,
    display_order, linked_issues, linked_service_items,
    tags, assigned_to, assigned_by,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_2_id,
    'Complete brake system check', 'Inspect entire brake system including pads, shoes, fluid, lines', 'Brakes',
    'pending', 'medium',
    60, 600, 600.00,
    1, '[0, 1, 2]'::jsonb, '[0]'::jsonb,
    '["brakes", "safety"]'::jsonb,
    v_mechanic_2_uid, v_service_advisor_2_uid,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  )
  RETURNING id INTO v_checklist_5_id;

  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category, status, priority,
    estimated_minutes, labor_rate, labor_cost,
    display_order, linked_service_items,
    tags, assigned_to, assigned_by,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_2_id,
    'Replace front brake pads', 'Remove old pads, install new ones, adjust', 'Brakes',
    'pending', 'high',
    45, 650, 487.50,
    2, '[1]'::jsonb,
    '["brakes", "repair"]'::jsonb,
    v_mechanic_2_uid, v_service_advisor_2_uid,
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  )
  RETURNING id INTO v_checklist_6_id;

  -- Checklist items for Job Card 3 (completed)
  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category, status, priority,
    estimated_minutes, actual_minutes,
    labor_rate, labor_cost,
    display_order, linked_service_items,
    tags, assigned_to, assigned_by,
    started_at, completed_at,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_3_id,
    'Engine oil and filter change', 'Drain old oil, replace filter, refill with fresh oil', 'Engine',
    'completed', 'medium',
    30, 28,
    550, 308.00,
    1, '[0]'::jsonb,
    '["engine", "oil", "service"]'::jsonb,
    v_mechanic_1_uid, v_service_advisor_1_uid,
    NOW() - INTERVAL '3 hours', NOW() - INTERVAL '2 hours',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours'
  )
  RETURNING id INTO v_checklist_7_id;

  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category, status, priority,
    estimated_minutes, actual_minutes,
    labor_rate, labor_cost,
    display_order, linked_service_items,
    tags, assigned_to, assigned_by,
    started_at, completed_at,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_3_id,
    'Chain adjustment and lubrication', 'Check chain tension, adjust if needed, lubricate', 'Transmission',
    'completed', 'low',
    25, 22,
    500, 183.00,
    2, '[2]'::jsonb,
    '["chain", "maintenance"]'::jsonb,
    v_mechanic_1_uid, v_service_advisor_1_uid,
    NOW() - INTERVAL '2 hours', NOW() - INTERVAL '1 hour',
    NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 hours'
  )
  RETURNING id INTO v_checklist_8_id;

  -- Checklist for Job Card 6 (completed - tyre replacement)
  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category, status, priority,
    estimated_minutes, actual_minutes,
    labor_rate, labor_cost,
    display_order, linked_issues,
    tags, assigned_to, assigned_by,
    started_at, completed_at,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_6_id,
    'Replace front tire', 'Remove worn front tire, mount and balance new tire', 'Body',
    'completed', 'high',
    60, 55,
    600, 550.00,
    1, '[0]'::jsonb,
    '["tire", "safety"]'::jsonb,
    v_mechanic_1_uid, v_service_advisor_1_uid,
    NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'
  )
  RETURNING id INTO v_checklist_9_id;

  INSERT INTO public.job_card_checklist_items (
    id, garage_id, job_card_id,
    item_name, description, category, status, priority,
    estimated_minutes, actual_minutes,
    labor_rate, labor_cost,
    display_order, linked_issues,
    tags, assigned_to, assigned_by,
    started_at, completed_at,
    created_at, updated_at
  )
  VALUES (
    gen_random_uuid(), GARAGE_ID, v_job_card_6_id,
    'Replace rear tire', 'Remove worn rear tire, mount and balance new tire', 'Body',
    'completed', 'high',
    60, 55,
    600, 550.00,
    2, '[1]'::jsonb,
    '["tire", "safety"]'::jsonb,
    v_mechanic_1_uid, v_service_advisor_1_uid,
    NOW() - INTERVAL '5 hours', NOW() - INTERVAL '4 hours',
    NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'
  )
  RETURNING id INTO v_checklist_10_id;

  -- ============================================================================
  -- STEP 13: INSERT SUBTASKS
  -- ============================================================================
  RAISE NOTICE 'Step 13: Creating subtasks...';

  -- Subtasks for checklist item 2 (Job Card 1 - Replace timing belt)
  INSERT INTO public.job_card_subtasks (garage_id, job_card_id, parent_task_id, subtask_name, description, estimated_minutes, completed, completed_at, display_order, created_at, updated_at)
  VALUES
    (GARAGE_ID, v_job_card_1_id, v_checklist_2_id, 'Drain coolant', 'Drain radiator coolant', 20, true, NOW() - INTERVAL '5 hours', 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, v_checklist_2_id, 'Remove old belt', 'Remove timing belt cover and old belt', 40, true, NOW() - INTERVAL '4 hours', 2, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, v_checklist_2_id, 'Install new belt', 'Install new timing belt', 60, true, NOW() - INTERVAL '3 hours', 3, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, v_checklist_2_id, 'Re-time engine', 'Set timing correctly', 40, false, NULL, 4, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, v_checklist_2_id, 'Refill coolant', 'Refill with fresh coolant', 10, false, NULL, 5, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, v_checklist_2_id, 'Test start engine', 'Start and verify operation', 10, false, NULL, 6, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days');

  -- ============================================================================
  -- STEP 14: INSERT JOB CARD PARTS
  -- ============================================================================
  RAISE NOTICE 'Step 14: Creating job card parts...';

  INSERT INTO public.job_card_parts (
    garage_id, job_card_id, part_id, part_number, part_name, category,
    status, quantity_requested, quantity_used,
    unit_cost, unit_price,
    requested_by, notes, created_at, updated_at
  )
  VALUES (
    GARAGE_ID, v_job_card_1_id, v_part_1_id, 'ENG-HON-001', 'Timing Belt Honda Activa', 'Engine',
    'received', 1, 0,
    450.00, 750.00,
    v_mechanic_1_uid, 'Genuine Honda part', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  );

  INSERT INTO public.job_card_parts (
    garage_id, job_card_id, part_id, part_number, part_name, category,
    status, quantity_requested, quantity_used,
    unit_cost, unit_price,
    requested_by, notes, created_at, updated_at
  )
  VALUES (
    GARAGE_ID, v_job_card_1_id, NULL, 'TENSIONER-HON-001', 'Timing Belt Tensioner', 'Engine',
    'received', 1, 0,
    800.00, 1200.00,
    v_mechanic_1_uid, 'Genuine Honda part', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  );

  INSERT INTO public.job_card_parts (
    garage_id, job_card_id, part_id, part_number, part_name, category,
    status, quantity_requested, quantity_used,
    unit_cost, unit_price,
    requested_by, notes, created_at, updated_at
  )
  VALUES (
    GARAGE_ID, v_job_card_1_id, v_part_5_id, 'OIL-MOT-10W40', 'Motul 7100 4T 10W-40', 'Oil & Fluids',
    'used', 1, 1,
    550.00, 750.00,
    v_mechanic_1_uid, 'Used during diagnosis - top up', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'
  );

  INSERT INTO public.job_card_parts (
    garage_id, job_card_id, part_id, part_number, part_name, category,
    status, quantity_requested, quantity_used,
    unit_cost, unit_price,
    requested_by, created_at, updated_at
  )
  VALUES (
    GARAGE_ID, v_job_card_2_id, v_part_3_id, 'BRK-HON-F-001', 'Brake Pad Front Honda Activa', 'Brakes',
    'ordered', 1, 0,
    350.00, 550.00,
    v_service_advisor_2_uid, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'
  );

  INSERT INTO public.job_card_parts (
    garage_id, job_card_id, part_id, part_number, part_name, category,
    status, quantity_requested, quantity_used,
    unit_cost, unit_price,
    requested_by, created_at, updated_at
  )
  VALUES (
    GARAGE_ID, v_job_card_6_id, v_part_18_id, 'TIRE-FRN-001', 'Tire Front 90/100-10', 'Body',
    'used', 1, 1,
    1200.00, 1800.00,
    v_service_advisor_1_uid, NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'
  );

  INSERT INTO public.job_card_parts (
    garage_id, job_card_id, part_id, part_number, part_name, category,
    status, quantity_requested, quantity_used,
    unit_cost, unit_price,
    requested_by, created_at, updated_at
  )
  VALUES (
    GARAGE_ID, v_job_card_6_id, v_part_19_id, 'TIRE-RR-001', 'Tire Rear 90/100-10', 'Body',
    'used', 1, 1,
    1400.00, 2000.00,
    v_service_advisor_1_uid, NOW() - INTERVAL '1 day', NOW() - INTERVAL '4 hours'
  );

  -- ============================================================================
  -- STEP 15: INSERT TIME ENTRIES
  -- ============================================================================
  RAISE NOTICE 'Step 15: Creating time entries...';

  INSERT INTO public.job_card_time_entries (
    id, checklist_item_id, mechanic_id, started_at, stopped_at, duration_seconds, notes, created_at
  )
  VALUES (
    gen_random_uuid(), v_checklist_1_id, v_mechanic_1_uid,
    NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 day', 7200, 'Engine noise diagnosis completed', NOW() - INTERVAL '1 day'
  )
  RETURNING id INTO v_time_entry_1_id;

  INSERT INTO public.job_card_time_entries (
    id, checklist_item_id, mechanic_id, started_at, stopped_at, duration_seconds, notes, created_at
  )
  VALUES (
    gen_random_uuid(), v_checklist_2_id, v_mechanic_1_uid,
    NOW() - INTERVAL '5 hours', NULL, NULL, 'Currently working on timing belt replacement', NOW() - INTERVAL '5 hours'
  )
  RETURNING id INTO v_time_entry_2_id;

  -- ============================================================================
  -- STEP 16: INSERT ACTIVITY LOG
  -- ============================================================================
  RAISE NOTICE 'Step 16: Creating activity log...';

  INSERT INTO public.job_card_activity_log (
    garage_id, job_card_id, activity_type, title, description,
    author_id, author_name, author_role, created_at
  )
  VALUES
    (GARAGE_ID, v_job_card_1_id, 'status_change', 'Job card created', 'New job card created for engine noise diagnosis', v_service_advisor_1_uid, 'Vikram Singh', 'Service Advisor', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, 'assignment', 'Amit Kumar assigned as lead mechanic', NULL, v_service_advisor_1_uid, 'Vikram Singh', 'Service Advisor', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, 'task_update', 'Task "Diagnose engine noise issue" completed', 'Confirmed timing belt issue, replacement recommended', v_mechanic_1_uid, 'Amit Kumar', 'Mechanic', NOW() - INTERVAL '1 day'),
    (GARAGE_ID, v_job_card_1_id, 'part_added', 'Parts ordered', 'Timing Belt and Tensioner ordered from supplier', v_mechanic_1_uid, 'Amit Kumar', 'Mechanic', NOW() - INTERVAL '1 day'),
    (GARAGE_ID, v_job_card_1_id, 'time_logged', 'Time logged for task "Replace timing belt"', '90 minutes logged', v_mechanic_1_uid, 'Amit Kumar', 'Mechanic', NOW() - INTERVAL '1 hour'),
    (GARAGE_ID, v_job_card_3_id, 'status_change', 'Job card completed', 'All services completed, vehicle ready for delivery', v_mechanic_1_uid, 'Amit Kumar', 'Mechanic', NOW() - INTERVAL '2 hours'),
    (GARAGE_ID, v_job_card_6_id, 'payment', 'Payment received', '₹4,150 paid via UPI', v_service_advisor_1_uid, 'Vikram Singh', 'Service Advisor', NOW() - INTERVAL '4 hours');

  -- ============================================================================
  -- STEP 17: INSERT STATUS HISTORY
  -- ============================================================================
  RAISE NOTICE 'Step 17: Creating status history...';

  INSERT INTO public.job_card_status_history (
    garage_id, job_card_id, old_status, new_status, changed_by, changed_by_name, change_reason, created_at
  )
  VALUES
    (GARAGE_ID, v_job_card_1_id, NULL, 'draft', v_service_advisor_1_uid, 'Vikram Singh', 'Job card created', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, 'draft', 'queued', v_service_advisor_1_uid, 'Vikram Singh', 'Initial assessment complete', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, 'queued', 'in_progress', v_mechanic_1_uid, 'Amit Kumar', 'Started diagnosis', NOW() - INTERVAL '2 days'),

    (GARAGE_ID, v_job_card_3_id, NULL, 'draft', v_service_advisor_1_uid, 'Vikram Singh', 'Job card created', NOW() - INTERVAL '3 days'),
    (GARAGE_ID, v_job_card_3_id, 'draft', 'queued', v_service_advisor_1_uid, 'Vikram Singh', 'Vehicle ready for service', NOW() - INTERVAL '3 days'),
    (GARAGE_ID, v_job_card_3_id, 'queued', 'in_progress', v_mechanic_1_uid, 'Amit Kumar', 'Started service', NOW() - INTERVAL '3 hours'),
    (GARAGE_ID, v_job_card_3_id, 'in_progress', 'quality_check', v_mechanic_1_uid, 'Amit Kumar', 'Service completed, quality check started', NOW() - INTERVAL '2 hours'),
    (GARAGE_ID, v_job_card_3_id, 'quality_check', 'ready', v_service_advisor_1_uid, 'Vikram Singh', 'Quality check passed, ready for delivery', NOW() - INTERVAL '2 hours'),

    (GARAGE_ID, v_job_card_6_id, NULL, 'draft', v_service_advisor_1_uid, 'Vikram Singh', 'Job card created', NOW() - INTERVAL '1 day'),
    (GARAGE_ID, v_job_card_6_id, 'draft', 'in_progress', v_mechanic_1_uid, 'Amit Kumar', 'Started tire replacement', NOW() - INTERVAL '5 hours'),
    (GARAGE_ID, v_job_card_6_id, 'in_progress', 'ready', v_mechanic_1_uid, 'Amit Kumar', 'Tire replacement completed', NOW() - INTERVAL '4 hours');

  -- ============================================================================
  -- STEP 18: INSERT COMMUNICATIONS
  -- ============================================================================
  RAISE NOTICE 'Step 18: Creating communications...';

  INSERT INTO public.job_card_communications (
    garage_id, job_card_id, communication_type, direction,
    subject, message, status,
    sent_by, sent_at, created_at
  )
  VALUES
    (GARAGE_ID, v_job_card_1_id, 'phone', 'incoming', 'Initial inquiry', 'Customer called about engine noise', 'read', v_service_advisor_1_uid, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, 'whatsapp', 'outgoing', 'Job card update', 'Your vehicle JC-2025-0001 is being diagnosed. We will call you with an estimate shortly.', 'delivered', v_service_advisor_1_uid, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_job_card_1_id, 'phone', 'outgoing', 'Estimate shared', 'Called customer with estimate of ₹7,025. Customer approved work.', 'read', v_service_advisor_1_uid, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (GARAGE_ID, v_job_card_4_id, 'phone', 'incoming', 'Urgent repair request', 'Customer''s self-start not working, needs urgent repair', 'read', v_service_advisor_1_uid, NOW() - INTERVAL '3 hours', NOW() - INTERVAL '3 hours'),
    (GARAGE_ID, v_job_card_4_id, 'whatsapp', 'outgoing', 'Parts delay update', 'Your vehicle parts have been ordered. Expected delivery: Tomorrow. We will update you once parts arrive.', 'delivered', v_service_advisor_1_uid, NOW() - INTERVAL '2 hours', NOW() - INTERVAL '2 hours');

  -- ============================================================================
  -- STEP 19: INSERT MECHANIC DAILY METRICS
  -- ============================================================================
  RAISE NOTICE 'Step 19: Creating mechanic daily metrics...';

  INSERT INTO public.mechanic_daily_metrics (
    garage_id, mechanic_id, metric_date, jobs_completed, jobs_in_progress, total_hours_worked, total_labor_cost, created_at, updated_at
  )
  VALUES
    (GARAGE_ID, v_mechanic_1_uid, NOW() - INTERVAL '2 days', 1, 2, 7.5, 4500.00, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
    (GARAGE_ID, v_mechanic_1_uid, NOW() - INTERVAL '1 day', 1, 2, 6.5, 3850.00, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
    (GARAGE_ID, v_mechanic_1_uid, NOW()::DATE, 0, 1, 2.5, 1750.00, NOW(), NOW()),
    (GARAGE_ID, v_mechanic_2_uid, NOW()::DATE, 0, 1, 1.5, 900.00, NOW(), NOW()),
    (GARAGE_ID, v_mechanic_3_uid, NOW()::DATE, 0, 1, 1.0, 600.00, NOW(), NOW());

  -- ============================================================================
  -- SUCCESS MESSAGE
  -- ============================================================================
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'COMPREHENSIVE SEED DATA CREATED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Summary of data created:';
  RAISE NOTICE '  - 8 Users (1 owner, 1 admin, 2 service advisors, 3 mechanics, 1 technician)';
  RAISE NOTICE '  - 8 Customers with full details';
  RAISE NOTICE '  - 12 Customer Vehicles (including 1 electric scooter)';
  RAISE NOTICE '  - 10 Parts Categories';
  RAISE NOTICE '  - 4 Parts Suppliers';
  RAISE NOTICE '  - 20 Parts with full inventory tracking';
  RAISE NOTICE '  - Parts fitment, backup suppliers, and transactions';
  RAISE NOTICE '  - 6 Job Cards with different statuses';
  RAISE NOTICE '  - 10 Checklist Items with links';
  RAISE NOTICE '  - 6 Subtasks';
  RAISE NOTICE '  - 6 Job Card Parts';
  RAISE NOTICE '  - 2 Time Entries';
  RAISE NOTICE '  - 7 Activity Log entries';
  RAISE NOTICE '  - 12 Status History entries';
  RAISE NOTICE '  - 5 Communications';
  RAISE NOTICE '  - 5 Mechanic Daily Metrics';
  RAISE NOTICE '============================================================================';

END $$;
