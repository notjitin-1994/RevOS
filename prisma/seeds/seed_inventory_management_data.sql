-- ============================================================================
-- INVENTORY MANAGEMENT DUMMY DATA SEED FILE
-- ============================================================================
-- Purpose: Create comprehensive dummy data for parts inventory management
-- Includes: Suppliers, Categories, Parts, Parts Fitment, Backup Suppliers
--
-- PREREQUISITES:
-- 1. Run this in Supabase SQL Editor
-- 2. Replace v_garage_id below with your actual garage_id from garages table
--    Run: SELECT garage_uid, garage_name FROM public.garages;
-- 3. Ensure motorcycles table is populated with vehicle catalog data
--
-- FEATURES:
-- - 10 suppliers with diverse backgrounds and payment terms
-- - 12 parts categories covering all motorcycle systems
-- - 50+ parts with realistic Indian motorcycle parts data
-- - Parts fitment data linking parts to compatible motorcycles
-- - Backup suppliers for critical parts
-- - Realistic pricing, stock levels, and lead times
-- - Proper foreign key relationships and constraints
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

  -- Supplier IDs
  sup1_id UUID; sup2_id UUID; sup3_id UUID; sup4_id UUID; sup5_id UUID;
  sup6_id UUID; sup7_id UUID; sup8_id UUID; sup9_id UUID; sup10_id UUID;

  -- Category IDs
  cat1_id UUID; cat2_id UUID; cat3_id UUID; cat4_id UUID; cat5_id UUID;
  cat6_id UUID; cat7_id UUID; cat8_id UUID; cat9_id UUID; cat10_id UUID;
  cat11_id UUID; cat12_id UUID;

  -- Part IDs (sample for fitment)
  p1_id UUID; p5_id UUID; p10_id UUID; p15_id UUID; p20_id UUID;
  p25_id UUID; p30_id UUID; p35_id UUID; p40_id UUID; p45_id UUID;

  -- Counters
  suppliers_created INTEGER := 0;
  categories_created INTEGER := 0;
  parts_created INTEGER := 0;
  fitment_created INTEGER := 0;
  backup_suppliers_created INTEGER := 0;

BEGIN
  -- ============================================================================
  -- VALIDATE GARAGE ID
  -- ============================================================================
  SELECT EXISTS(SELECT 1 FROM public.garages WHERE garage_uid = v_garage_id) INTO garage_exists;

  IF NOT garage_exists THEN
    RAISE EXCEPTION 'Invalid garage_id: %. Please run SELECT garage_uid, garage_name FROM public.garages; to get a valid garage UID.', v_garage_id;
  END IF;

  RAISE NOTICE 'Starting inventory management data seed for garage: %', v_garage_id;
  RAISE NOTICE '============================================================================';

  -- ============================================================================
  -- SECTION 1: PARTS SUPPLIERS (10 suppliers)
  -- ============================================================================
  RAISE NOTICE 'Creating parts suppliers...';

  -- Supplier 1: Major national distributor
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, alternate_phone,
    email, website, address, city, state, zip_code, country, gstin, payment_terms,
    credit_limit, credit_days, rating, is_preferred, notes
  )
  VALUES (
    v_garage_id, 'AutoParts India Ltd', 'SUP-001', 'Rajesh Sharma', '+91 98765 43210', '+91 98765 43211',
    'rajesh.sharma@autopartsindia.com', 'https://www.autopartsindia.com', '123, Industrial Area, Phase 1',
    'Bangalore', 'Karnataka', '560045', 'India', '29AABCU9603R1ZM', 'Net 30',
    500000.00, 30, 5, true, 'Largest motorcycle parts distributor in South India. Preferred supplier for OEM parts.'
  ) RETURNING id INTO sup1_id;

  -- Supplier 2: Regional specialist
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, email,
    address, city, state, zip_code, country, payment_terms, rating, is_preferred
  )
  VALUES (
    v_garage_id, 'Mysore Auto Spares', 'SUP-002', 'Srinivas', '+91 98765 54321',
    'srinivas@mysoreautospares.com', '45, Gandhi Bazaar', 'Mysore', 'Karnataka',
    '570001', 'India', 'COD', 4, false
  ) RETURNING id INTO sup2_id;

  -- Supplier 3: Oil and lubricants specialist
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, email,
    website, address, city, state, zip_code, country, gstin, payment_terms,
    credit_limit, rating, is_preferred, notes
  )
  VALUES (
    v_garage_id, 'Lubricants Express', 'SUP-003', 'Priya Kumar', '+91 98765 65432',
    'priya@lubexpress.com', 'https://www.lubexpress.com', '78, Hosur Road', 'Bangalore',
    'Karnataka', '560068', 'India', '29AAACL1234R1Z8', 'Net 15', 200000.00, 5,
    true, 'Authorized dealer for Motul, Castrol, and Shell oils. Quick delivery.'
  ) RETURNING id INTO sup3_id;

  -- Supplier 4: Electrical parts specialist
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, email,
    address, city, state, zip_code, country, payment_terms, rating, is_preferred
  )
  VALUES (
    v_garage_id, 'ElectroParts Wholesale', 'SUP-004', 'Anil Deshmukh', '+91 98765 76543',
    'anil@electroparts.com', '156, SP Road', 'Bangalore', 'Karnataka', '560001',
    'India', 'Advance Payment', 4, false
  ) RETURNING id INTO sup4_id;

  -- Supplier 5: Brake system specialist
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, email,
    website, address, city, state, zip_code, country, payment_terms, credit_limit,
    rating, is_preferred, notes
  )
  VALUES (
    v_garage_id, 'Brake Masters India', 'SUP-005', 'Vikram Singh', '+91 98765 87654',
    'vikram@brakemasters.com', 'https://www.brakemasters.in', '234, Peenya Industrial Area',
    'Bangalore', 'Karnataka', '560058', 'India', 'Net 30', 300000.00, 5,
    true, 'Exclusive distributor for Bosch and Brembo brake components.'
  ) RETURNING id INTO sup5_id;

  -- Supplier 6: Chain and sprocket specialist
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, email,
    address, city, state, zip_code, country, payment_terms, rating, is_preferred
  )
  VALUES (
    v_garage_id, 'Drive Systems Ltd', 'SUP-006', 'Mohammed Ali', '+91 98765 98765',
    'ali@drivesystems.com', '56, 3rd Cross, Malleshwaram', 'Bangalore', 'Karnataka',
    '560003', 'India', 'Net 45', 4, false
  ) RETURNING id INTO sup6_id;

  -- Supplier 7: Battery specialist
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, email,
    website, address, city, state, zip_code, country, gstin, payment_terms,
    credit_limit, rating, is_preferred, notes
  )
  VALUES (
    v_garage_id, 'PowerBattery Solutions', 'SUP-007', 'Sandeep Patel', '+91 98765 11122',
    'sandeep@powerbattery.com', 'https://www.powerbattery.in', '89, Residency Road',
    'Bangalore', 'Karnataka', '560025', 'India', '29AABCP5678R1Z2', 'Net 30',
    250000.00, 5, true, 'Authorized dealer for Exide, Amaron, and Tata Green batteries.'
  ) RETURNING id INTO sup7_id;

  -- Supplier 8: Tire specialist
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, email,
    address, city, state, zip_code, country, payment_terms, rating, is_preferred
  )
  VALUES (
    v_garage_id, 'Tire World Wholesale', 'SUP-008', 'Rahul Mehta', '+91 98765 22233',
    'rahul@tireworld.com', '345, Magrath Road', 'Bangalore', 'Karnataka', '560002',
    'India', 'COD', 4, false
  ) RETURNING id INTO sup8_id;

  -- Supplier 9: Filter specialist
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, email,
    website, address, city, state, zip_code, country, payment_terms, credit_limit,
    rating, is_preferred, notes
  )
  VALUES (
    v_garage_id, 'FilterTech India', 'SUP-009', 'Karthik Narayan', '+91 98765 33344',
    'karthik@filtertech.com', 'https://www.filtertech.in', '12, Mosque Road',
    'Bangalore', 'Karnataka', '560028', 'India', 'Net 30', 150000.00, 5,
    true, 'Specializes in air, oil, and fuel filters for all motorcycle brands.'
  ) RETURNING id INTO sup9_id;

  -- Supplier 10: Fast-moving parts
  INSERT INTO public.parts_suppliers (
    garage_id, supplier_name, supplier_code, contact_person, phone, email,
    address, city, state, zip_code, country, payment_terms, rating, is_preferred
  )
  VALUES (
    v_garage_id, 'QuickParts Distribution', 'SUP-010', 'Deepak Reddy', '+91 98765 44455',
    'deepak@quickparts.com', '67, Indiranagar 100ft Road', 'Bangalore', 'Karnataka',
    '560038', 'India', 'Net 15', 4, false
  ) RETURNING id INTO sup10_id;

  suppliers_created := 10;
  RAISE NOTICE 'Created 10 parts suppliers';

  -- ============================================================================
  -- SECTION 2: PARTS CATEGORIES (12 categories)
  -- ============================================================================
  RAISE NOTICE 'Creating parts categories...';

  -- Category 1: Engine
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Engine', 'Engine internal components and assemblies', 1)
  RETURNING id INTO cat1_id;

  -- Category 2: Brakes
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Brakes', 'Brake system components including pads, discs, and fluids', 2)
  RETURNING id INTO cat2_id;

  -- Category 3: Electrical
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Electrical', 'Electrical components including battery, lights, and ignition', 3)
  RETURNING id INTO cat3_id;

  -- Category 4: Filters
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Filters', 'Air, oil, and fuel filters', 4)
  RETURNING id INTO cat4_id;

  -- Category 5: Transmission
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Transmission', 'Transmission, chain, sprocket, and related components', 5)
  RETURNING id INTO cat5_id;

  -- Category 6: Suspension
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Suspension', 'Front forks, rear shock absorbers, and related components', 6)
  RETURNING id INTO cat6_id;

  -- Category 7: Wheels & Tires
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Wheels & Tires', 'Wheels, tires, tubes, and related components', 7)
  RETURNING id INTO cat7_id;

  -- Category 8: Body & Frame
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Body & Frame', 'Body panels, frame, mirrors, and cosmetic parts', 8)
  RETURNING id INTO cat8_id;

  -- Category 9: Fuel System
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Fuel System', 'Fuel pump, carburetor, injectors, and fuel lines', 9)
  RETURNING id INTO cat9_id;

  -- Category 10: Lubricants
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Lubricants', 'Engine oil, transmission oil, and other lubricants', 10)
  RETURNING id INTO cat10_id;

  -- Category 11: Exhaust
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Exhaust', 'Exhaust systems, mufflers, and related components', 11)
  RETURNING id INTO cat11_id;

  -- Category 12: Accessories
  INSERT INTO public.parts_categories (garage_id, category_name, description, display_order)
  VALUES (v_garage_id, 'Accessories', 'General accessories and add-on components', 12)
  RETURNING id INTO cat12_id;

  categories_created := 12;
  RAISE NOTICE 'Created 12 parts categories';

  -- ============================================================================
  -- SECTION 3: PARTS INVENTORY (50+ parts)
  -- ============================================================================
  RAISE NOTICE 'Creating parts inventory...';

  -- ============================================================================
  -- ENGINE PARTS
  -- ============================================================================

  -- Part 1: Piston Kit (Hero/Honda 100cc)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ENG-PIS-100-HH', 'Piston Kit Standard 100cc', cat1_id, 'Engine',
    'Hero Honda', 'Universal', 'Engine',
    'Complete piston kit with rings, pin, and clips. Fits Hero Honda CD 100, Splendor, Passion. Standard bore 47.0mm.',
    15, 30, 5,
    450.00, 750.00, 600.00,
    sup1_id, 'AutoParts India Ltd', '+91 98765 43210', 'rajesh.sharma@autopartsindia.com',
    'API-PIS-100-STD', 3, 10, 'A1-01', 'SKU-PIS-100-HH-STD', 'OEM-HH-100-STD',
    6, 'India', 1, 'active'
  ) RETURNING id INTO p1_id;

  -- Part 2: Valve Set (Royal Enfield 350cc)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ENG-VAL-350-RE', 'Valve Set UCE 350', cat1_id, 'Engine',
    'Royal Enfield', 'Classic 350 / Bullet 350', 'Engine',
    'Complete valve set (inlet + exhaust) for Royal Enfield UCE 350 engine. OEM specification.',
    8, 15, 3,
    1200.00, 1800.00, 1500.00,
    sup1_id, 'AutoParts India Ltd', '+91 98765 43210', 'rajesh.sharma@autopartsindia.com',
    'API-VAL-RE350-SET', 5, 5, 'A1-02', 'SKU-VAL-350-RE', 'OEM-RE-350-VAL',
    12, 'India', 1, 'active'
  );

  -- Part 3: Cylinder Block (Honda Activa)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ENG-CYL-HAC', 'Cylinder Block Activa 110cc', cat1_id, 'Engine',
    'Honda', 'Activa 4G/5G/6G', 'Engine',
    'Cylinder block for Honda Activa 110cc engines. Standard bore.',
    5, 10, 2,
    2800.00, 4200.00,
    sup1_id, 'AutoParts India Ltd', '+91 98765 43210', 'rajesh.sharma@autopartsindia.com',
    'API-CYL-HAC-110', 7, 3, 'A1-03', 'OEM-HON-12200-KNN-9000',
    12, 'India', 1, 'active'
  );

  -- Part 4: Timing Chain
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ENG-TIM-UNI', 'Timing Chain 428', cat1_id, 'Engine',
    'Universal', 'Universal 125cc', 'Engine',
    'Standard 428 pitch timing chain. Fits most 125cc motorcycles. 116 links.',
    25, 50, 10,
    180.00, 320.00, 250.00,
    sup6_id, 'Drive Systems Ltd', '+91 98765 98765', 'ali@drivesystems.com',
    'DSL-TIM-428-116', 2, 20, 'A1-04', 'SKU-TIM-428-116', 'OEM-UNI-428',
    3, 'India', 1, 'active'
  );

  -- Part 5: Gasket Kit Complete
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ENG-GSK-150', 'Complete Gasket Kit 150cc', cat1_id, 'Engine',
    'Universal', 'Universal 150cc', 'Engine',
    'Complete engine gasket kit for 150cc motorcycles. Includes head gasket, valve cover gasket, and all seals.',
    20, 40, 8,
    650.00, 1100.00, 900.00,
    sup1_id, 'AutoParts India Ltd', '+91 98765 43210', 'rajesh.sharma@autopartsindia.com',
    'API-GSK-150-COMP', 4, 15, 'A1-05', 'SKU-GSK-150-COMP',
    6, 'India', 1, 'active'
  ) RETURNING id INTO p5_id;

  -- ============================================================================
  -- BRAKE PARTS
  -- ============================================================================

  -- Part 6: Brake Pads Front (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BRK-PAD-FR-SC', 'Brake Pads Front Scooter', cat2_id, 'Brakes',
    'Universal', 'Honda Activa / Dio / Jupiter', 'Brakes',
    'High-quality organic brake pads for front drum brakes of 110-125cc scooters.',
    40, 80, 15,
    150.00, 280.00, 220.00,
    sup5_id, 'Brake Masters India', '+91 98765 87654', 'vikram@brakemasters.com',
    'BMI-PAD-SC-FR', 3, 30, 'B1-01', 'SKU-BRK-PAD-SC-FR', 'OEM-UNI-PAD-SC',
    6, 'India', 1, 'active'
  );

  -- Part 7: Brake Shoes Rear (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BRK-SHO-RR-SC', 'Brake Shoes Rear Scooter', cat2_id, 'Brakes',
    'Universal', 'Universal Scooter', 'Brakes',
    'Brake shoe set for rear drum brakes of all scooters. 110mm standard size.',
    35, 70, 12,
    220.00, 400.00, 320.00,
    sup5_id, 'Brake Masters India', '+91 98765 87654', 'vikram@brakemasters.com',
    'BMI-SHO-SC-110', 2, 25, 'B1-02', 'SKU-BRK-SHO-SC-110',
    6, 'India', 1, 'active'
  );

  -- Part 8: Brake Fluid DOT 4
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BRK-FLD-DOT4', 'Brake Fluid DOT 4 (500ml)', cat2_id, 'Brakes',
    'Castrol', 'Universal', 'Brakes',
    'DOT 4 brake fluid, 500ml bottle. Exceeds DOT 4 specifications. Suitable for all disc brake motorcycles.',
    50, 100, 20,
    180.00, 350.00, 280.00,
    sup3_id, 'Lubricants Express', '+91 98765 65432', 'priya@lubexpress.com',
    'LXP-BRK-DOT4-500', 3, 24, 'B1-03', 'SKU-BRK-FLD-DOT4', 'OEM-CAST-DOT4',
    24, 'India', 1, 'active'
  );

  -- Part 9: Brake Disc Front (Pulsar/Apache)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BRK-DSC-FR-200', 'Brake Disc Front 200cc', cat2_id, 'Brakes',
    'Bajaj/TVS', 'Pulsar NS200 / Apache RTR 200', 'Brakes',
    'Front brake disc rotor 276mm for 200cc motorcycles. 4 bolt pattern.',
    10, 20, 4,
    1450.00, 2200.00,
    sup5_id, 'Brake Masters India', '+91 98765 87654', 'vikram@brakemasters.com',
    'BMI-DSC-FR-276', 5, 5, 'B1-04', 'SKU-BRK-DSC-276', 'OEM-BOSCH-276',
    12, 'India', 1, 'active'
  );

  -- Part 10: Brake Caliper Assembly Front
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BRK-CAL-FR-UNI', 'Brake Caliper Assembly Front', cat2_id, 'Brakes',
    'Universal', 'Universal 200-250cc', 'Brakes',
    'Front brake caliper assembly with pads. Fits most 200-250cc Indian motorcycles with axial mount.',
    12, 24, 5,
    1800.00, 2800.00, 2400.00,
    sup5_id, 'Brake Masters India', '+91 98765 87654', 'vikram@brakemasters.com',
    'BMI-CAL-FR-AXIAL', 7, 8, 'B1-05', 'SKU-BRK-CAL-FR-AX',
    12, 'India', 1, 'active'
  ) RETURNING id INTO p10_id;

  -- ============================================================================
  -- ELECTRICAL PARTS
  -- ============================================================================

  -- Part 11: Battery MF 12V 5Ah
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ELC-BAT-5AH', 'Battery MF 12V 5Ah', cat3_id, 'Electrical',
    'Exide', 'Universal Scooter/Commutter', 'Electrical',
    'Maintenance-free battery 12V 5Ah. Fits Honda Activa, Dio, TVS Jupiter, Access 125.',
    18, 36, 6,
    650.00, 1100.00, 950.00,
    sup7_id, 'PowerBattery Solutions', '+91 98765 11122', 'sandeep@powerbattery.com',
    'PBS-BAT-MF-5AH', 2, 12, 'E1-01', 'SKU-BAT-5AH-MF', 'OEM-EXI-5AH-MF',
    12, 'India', 1, 'active'
  );

  -- Part 12: Spark Plug Standard
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ELC-SPK-STD', 'Spark Plug Standard', cat3_id, 'Electrical',
    'NGK', 'Universal 100-150cc', 'Electrical',
    'NGK standard spark plug. Fits most 100-150cc motorcycles. CR8HSA equivalent.',
    60, 120, 25,
    85.00, 150.00, 120.00,
    sup4_id, 'ElectroParts Wholesale', '+91 98765 76543', 'anil@electroparts.com',
    'EPW-SPK-NGK-STD', 3, 50, 'E1-02', 'SKU-SPK-NGK-STD', 'OEM-NGK-CR8HSA',
    6, 'Japan', 1, 'active'
  );

  -- Part 13: Headlight Assembly (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ELC-HDL-SC', 'Headlight Assembly Scooter', cat3_id, 'Electrical',
    'Universal', 'Honda Activa / Dio', 'Electrical',
    'Complete headlight assembly with bulb and holder. For Honda Activa/Dio style scooters.',
    15, 30, 5,
    850.00, 1400.00,
    sup4_id, 'ElectroParts Wholesale', '+91 98765 76543', 'anil@electroparts.com',
    'EPW-HDL-SC-ACT', 5, 10, 'E1-03', 'SKU-HDL-SC-ACT', 'OEM-HON-33100-KNN-901',
    6, 'India', 1, 'active'
  );

  -- Part 14: CDI Unit DC
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ELC-CDI-DC', 'CDI Unit DC', cat3_id, 'Electrical',
    'Universal', 'Universal 125-150cc', 'Electrical',
    'DC CDI unit for 125-150cc motorcycles. 5-pin connector. Universal fitment.',
    25, 50, 10,
    450.00, 850.00, 700.00,
    sup4_id, 'ElectroParts Wholesale', '+91 98765 76543', 'anil@electroparts.com',
    'EPW-CDI-DC-5PIN', 4, 20, 'E1-04', 'SKU-CDI-DC-5PIN',
    6, 'India', 1, 'active'
  );

  -- Part 15: Regulator Rectifier
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ELC-RR-UNI', 'Regulator Rectifier Universal', cat3_id, 'Electrical',
    'Universal', 'Universal Motorcycle', 'Electrical',
    'Universal regulator rectifier with single-phase output. 5-pin connector.',
    30, 60, 12,
    380.00, 750.00, 600.00,
    sup4_id, 'ElectroParts Wholesale', '+91 98765 76543', 'anil@electroparts.com',
    'EPW-RR-UNI-SP', 3, 25, 'E1-05', 'SKU-RR-UNI-SP', 'OEM-UNI-RR-SP',
    6, 'India', 1, 'active'
  ) RETURNING id INTO p15_id;

  -- ============================================================================
  -- FILTERS
  -- ============================================================================

  -- Part 16: Oil Filter (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'FLT-OIL-SC', 'Oil Filter Scooter', cat4_id, 'Filters',
    'Universal', 'Honda Activa / Dio / Jupiter', 'Engine',
    'High-quality oil filter for 110-125cc scooters. Paper element type.',
    50, 100, 20,
    65.00, 120.00, 95.00,
    sup9_id, 'FilterTech India', '+91 98765 33344', 'karthik@filtertech.com',
    'FTI-OIL-SC-110', 2, 50, 'F1-01', 'SKU-FLT-OIL-SC', 'OEM-UNI-FLT-OIL-SC',
    3, 'India', 1, 'active'
  );

  -- Part 17: Air Filter (Scooter - Foam)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'FLT-AIR-SC-FOAM', 'Air Filter Scooter Foam', cat4_id, 'Filters',
    'Universal', 'Universal Scooter', 'Engine',
    'Foam air filter for scooters. Reusable and washable. Pre-oiled.',
    40, 80, 15,
    95.00, 180.00, 145.00,
    sup9_id, 'FilterTech India', '+91 98765 33344', 'karthik@filtertech.com',
    'FTI-AIR-SC-FOAM', 3, 40, 'F1-02', 'SKU-FLT-AIR-SC-FOAM',
    6, 'India', 1, 'active'
  );

  -- Part 18: Fuel Filter (In-line)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'FLT-FUL-INLINE', 'Fuel Filter In-line', cat4_id, 'Filters',
    'Universal', 'Universal Motorcycle', 'Fuel System',
    'Universal in-line fuel filter. 6mm connection. Clear body for inspection.',
    80, 160, 30,
    25.00, 55.00, 40.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-FLT-FUL-INLINE', 1, 100, 'F1-03', 'SKU-FLT-FUL-INLINE', 'OEM-UNI-FLT-FUL',
    3, 'India', 1, 'active'
  );

  -- ============================================================================
  -- TRANSMISSION / CHAIN / SPROCKET
  -- ============================================================================

  -- Part 19: Drive Chain 428 Heavy Duty
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'TRN-CHN-428-HD', 'Drive Chain 428 Heavy Duty', cat5_id, 'Transmission',
    'DID', 'Universal 125-180cc', 'Transmission',
    'DID 428 heavy duty drive chain with O-rings. 116 links. Gold color.',
    20, 40, 8,
    1100.00, 1800.00, 1500.00,
    sup6_id, 'Drive Systems Ltd', '+91 98765 98765', 'ali@drivesystems.com',
    'DSL-CHN-428-O-116', 5, 15, 'T1-01', 'SKU-CHN-428-O-116', 'OEM-DID-428-O',
    6, 'Japan', 1, 'active'
  );

  -- Part 20: Front Sprocket 14T
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'TRN-SPR-FR-14T', 'Front Sprocket 14 Tooth', cat5_id, 'Transmission',
    'Universal', 'Universal 125-180cc', 'Transmission',
    'Front sprocket 14 teeth. 428 pitch. Steel construction. Heat treated.',
    30, 60, 12,
    280.00, 550.00, 450.00,
    sup6_id, 'Drive Systems Ltd', '+91 98765 98765', 'ali@drivesystems.com',
    'DSL-SPR-FR-14T-428', 3, 25, 'T1-02', 'SKU-SPR-FR-14T-428',
    6, 'India', 1, 'active'
  ) RETURNING id INTO p20_id;

  -- Part 21: Rear Sprocket 40T
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'TRN-SPR-RR-40T', 'Rear Sprocket 40 Tooth', cat5_id, 'Transmission',
    'Universal', 'Universal 125-180cc', 'Transmission',
    'Rear sprocket 40 teeth. 428 pitch. Steel construction. Hardened teeth.',
    25, 50, 10,
    550.00, 950.00, 800.00,
    sup6_id, 'Drive Systems Ltd', '+91 98765 98765', 'ali@drivesystems.com',
    'DSL-SPR-RR-40T-428', 4, 20, 'T1-03', 'SKU-SPR-RR-40T-428',
    6, 'India', 1, 'active'
  );

  -- Part 22: Chain Link Joining Clip
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'TRN-LNK-CLIP', 'Chain Link Joining Clip', cat5_id, 'Transmission',
    'Universal', 'Universal 428 Chain', 'Transmission',
    'Master link clip for 428 chain. Easy installation. Pack of 5.',
    100, 200, 40,
    15.00, 35.00, 25.00,
    sup6_id, 'Drive Systems Ltd', '+91 98765 98765', 'ali@drivesystems.com',
    'DSL-LNK-CLIP-428-5', 2, 50, 'T1-04', 'SKU-LNK-CLIP-428-5',
    3, 'India', 5, 'active'
  );

  -- ============================================================================
  -- SUSPENSION
  -- ============================================================================

  -- Part 23: Front Fork Oil Seal Pair
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'SUS-SEAL-FR-PR', 'Fork Oil Seal Pair (Front)', cat6_id, 'Suspension',
    'Universal', 'Universal 100-180cc', 'Suspension',
    'Front fork oil seal pair. Standard size 31x42x7mm. Fits most commuter bikes.',
    35, 70, 14,
    180.00, 350.00, 280.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-SEAL-FR-31-42', 3, 30, 'S1-01', 'SKU-SEAL-FR-31-42', 'OEM-UNI-SEAL-31-42',
    6, 'India', 2, 'active'
  );

  -- Part 24: Shock Absorber Rear (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'SUS-SHK-RR-SC', 'Shock Absorber Rear Scooter', cat6_id, 'Suspension',
    'Universal', 'Honda Activa / Dio', 'Suspension',
    'Rear shock absorber for scooters. Gas charged. 300mm length. Pair.',
    12, 24, 5,
    1450.00, 2400.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-SHK-RR-SC-300', 7, 10, 'S1-02', 'SKU-SHK-RR-SC-300', 'OEM-UNI-SHK-SC-300',
    6, 'India', 2, 'active'
  );

  -- ============================================================================
  -- WHEELS & TIRES
  -- ============================================================================

  -- Part 25: Tire Front 90/90-12 (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'WHL-TIR-FR-12', 'Tire Front 90/90-12', cat7_id, 'Wheels & Tires',
    'MRF', 'Universal Scooter', 'Wheels & Tires',
    'MRF Zapper front tire for scooters. 90/90-12 tubeless type.',
    20, 40, 8,
    1450.00, 2200.00, 1900.00,
    sup8_id, 'Tire World Wholesale', '+91 98765 22233', 'rahul@tireworld.com',
    'TWW-TIR-FR-90-90-12', 4, 15, 'W1-01', 'SKU-TIR-FR-90-90-12',
    24, 'India', 1, 'active'
  ) RETURNING id INTO p25_id;

  -- Part 26: Tire Rear 100/90-10 (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'WHL-TIR-RR-10', 'Tire Rear 100/90-10', cat7_id, 'Wheels & Tires',
    'MRF', 'Universal Scooter', 'Wheels & Tires',
    'MRF Zapper rear tire for scooters. 100/90-10 tubeless type.',
    20, 40, 8,
    1650.00, 2500.00, 2150.00,
    sup8_id, 'Tire World Wholesale', '+91 98765 22233', 'rahul@tireworld.com',
    'TWW-TIR-RR-100-90-10', 4, 15, 'W1-02', 'SKU-TIR-RR-100-90-10',
    24, 'India', 1, 'active'
  );

  -- Part 27: Tire Front 2.75-18 (Commuter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'WHL-TIR-FR-18', 'Tire Front 2.75-18', cat7_id, 'Wheels & Tires',
    'MRF', 'Universal Commuter 100cc', 'Wheels & Tires',
    'MRF Nylogrip front tire for 100cc commuters. 2.75-18 tube type.',
    25, 50, 10,
    1250.00, 1900.00, 1650.00,
    sup8_id, 'Tire World Wholesale', '+91 98765 22233', 'rahul@tireworld.com',
    'TWW-TIR-FR-2-75-18', 4, 20, 'W1-03', 'SKU-TIR-FR-2-75-18',
    24, 'India', 1, 'active'
  );

  -- Part 28: Tube 2.75-18 (Butyl Tube)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'WHL-TUB-2-75-18', 'Tube 2.75-18', cat7_id, 'Wheels & Tires',
    'MRF', 'Universal 18 inch', 'Wheels & Tires',
    'MRF butyl tube for 18 inch tires. 2.75 size. TR-4 valve.',
    60, 120, 25,
    180.00, 320.00, 270.00,
    sup8_id, 'Tire World Wholesale', '+91 98765 22233', 'rahul@tireworld.com',
    'TWW-TUB-2-75-18', 2, 50, 'W1-04', 'SKU-TUB-2-75-18', 'OEM-MRF-TUB-2-75',
    6, 'India', 1, 'active'
  );

  -- Part 29: Rim Bend Front 18 inch
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'WHL-RIM-FR-18', 'Rim Bend Front 18 inch', cat7_id, 'Wheels & Tires',
    'Universal', 'Universal 100-150cc', 'Wheels & Tires',
    'Steel rim bend for 18 inch front wheel. 1.85 inch width. Black finish.',
    15, 30, 6,
    850.00, 1400.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-RIM-FR-18-1-85', 5, 12, 'W1-05', 'SKU-RIM-FR-18-1-85',
    12, 'India', 1, 'active'
  );

  -- ============================================================================
  -- BODY & FRAME
  -- ============================================================================

  -- Part 30: Handle Bar Universal
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BOD-HDL-BAR-UNI', 'Handle Bar Universal', cat8_id, 'Body & Frame',
    'Universal', 'Universal Commuter', 'Body & Frame',
    'Universal handle bar for commuter motorcycles. 700mm width. Rise type.',
    20, 40, 8,
    450.00, 850.00, 700.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-HDL-700-RISE', 4, 15, 'B1-01', 'SKU-HDL-700-RISE',
    6, 'India', 1, 'active'
  ) RETURNING id INTO p30_id;

  -- Part 31: Mirror Set (Pair)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BOD-MIR-SET', 'Mirror Set (Pair)', cat8_id, 'Body & Frame',
    'Universal', 'Universal Motorcycle', 'Body & Frame',
    'Universal mirror set (left + right). 10mm thread. Convex glass. Black housing.',
    40, 80, 16,
    150.00, 280.00, 220.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-MIR-SET-10MM', 3, 30, 'B1-02', 'SKU-MIR-SET-10MM',
    3, 'India', 1, 'active'
  );

  -- Part 32: Indicator Front (Amber)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BOD-IND-FR-AMB', 'Indicator Front Amber', cat8_id, 'Body & Frame',
    'Universal', 'Universal Motorcycle', 'Body & Frame',
    'Front indicator lamp amber color. 12V 21W bulb. 2-bolt mount. Pack of 2.',
    35, 70, 14,
    120.00, 220.00, 180.00,
    sup4_id, 'ElectroParts Wholesale', '+91 98765 76543', 'anil@electroparts.com',
    'EPW-IND-FR-AMB-2', 3, 25, 'B1-03', 'SKU-IND-FR-AMB-2', 'OEM-UNI-IND-FR-AMB',
    3, 'India', 2, 'active'
  );

  -- Part 33: Foot Rest Rubber Pair
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BOD-FOT-RST-PR', 'Foot Rest Rubber Pair', cat8_id, 'Body & Frame',
    'Universal', 'Universal Motorcycle', 'Body & Frame',
    'Foot rest rubber pair. Standard M8 thread. Anti-vibration design.',
    60, 120, 24,
    55.00, 100.00, 80.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-FOT-RST-PR', 2, 50, 'B1-04', 'SKU-FOT-RST-PR',
    3, 'India', 2, 'active'
  );

  -- Part 34: Grab Rail (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BOD-GRB-SC', 'Grab Rail Scooter', cat8_id, 'Body & Frame',
    'Universal', 'Honda Activa / Dio', 'Body & Frame',
    'Chrome grab rail for scooters. 2-bolt mount. Enhanced passenger safety.',
    15, 30, 6,
    650.00, 1100.00,
    sup2_id, 'Mysore Auto Spares', '+91 98765 54321', 'srinivas@mysoreautospares.com',
    'MAS-GRB-SC-CHRM', 5, 10, 'B1-05', 'SKU-GRB-SC-CHRM', 'OEM-HON-50800-KNN-900',
    6, 'India', 1, 'active'
  );

  -- ============================================================================
  -- FUEL SYSTEM
  -- ============================================================================

  -- Part 35: Fuel Petcock Universal
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'FUL-PET-UNI', 'Fuel Petcock Universal', cat9_id, 'Fuel System',
    'Universal', 'Universal Commuter', 'Fuel System',
    'Universal fuel petcock with reserve. 2-bolt mounting. Inline filter included.',
    25, 50, 10,
    280.00, 550.00, 450.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-PET-UNI-FUL', 3, 20, 'F1-01', 'SKU-PET-UNI-FUL',
    6, 'India', 1, 'active'
  ) RETURNING id INTO p35_id;

  -- Part 36: Carburetor Clean & Repair Kit
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'FUL-CRB-KIT', 'Carburetor Repair Kit', cat9_id, 'Fuel System',
    'Universal', 'Universal 100-150cc', 'Fuel System',
    'Complete carburetor repair kit. Includes gaskets, jets, float valve, and O-rings.',
    30, 60, 12,
    220.00, 450.00, 360.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-CRB-KIT-100', 3, 25, 'F1-02', 'SKU-CRB-KIT-100',
    3, 'India', 1, 'active'
  );

  -- ============================================================================
  -- LUBRICANTS
  -- ============================================================================

  -- Part 37: Engine Oil 10W-40 Synthetic (1L)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'LUB-OIL-10W40', 'Engine Oil 10W-40 Synthetic (1L)', cat10_id, 'Lubricants',
    'Motul', 'Universal 4-Stroke', 'Engine',
    'Motul 7100 4T 10W-40 full synthetic engine oil. 1 liter bottle. Ester technology.',
    60, 120, 24,
    550.00, 750.00, 650.00,
    sup3_id, 'Lubricants Express', '+91 98765 65432', 'priya@lubexpress.com',
    'LXP-OIL-MOT-10W40-1L', 2, 48, 'L1-01', 'SKU-OIL-10W40-1L', 'OEM-MOT-7100-10W40',
    24, 'France', 1, 'active'
  );

  -- Part 38: Engine Oil 20W-50 Mineral (1L)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'LUB-OIL-20W50', 'Engine Oil 20W-50 Mineral (1L)', cat10_id, 'Lubricants',
    'Castrol', 'Universal 4-Stroke', 'Engine',
    'Castrol Activ 20W-50 mineral engine oil. 1 liter bottle. X-tra protection formula.',
    80, 160, 32,
    320.00, 480.00, 400.00,
    sup3_id, 'Lubricants Express', '+91 98765 65432', 'priya@lubexpress.com',
    'LXP-OIL-CAS-20W50-1L', 2, 60, 'L1-02', 'SKU-OIL-20W50-1L',
    24, 'India', 1, 'active'
  );

  -- Part 39: Fork Oil (350ml)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'LUB-FRK-OIL', 'Fork Oil (350ml)', cat10_id, 'Lubricants',
    'Motul', 'Universal Fork', 'Suspension',
    'Motul fork oil 10W. 350ml bottle. Suitable for most front forks.',
    40, 80, 16,
    280.00, 480.00, 400.00,
    sup3_id, 'Lubricants Express', '+91 98765 65432', 'priya@lubexpress.com',
    'LXP-FRK-10W-350', 3, 30, 'L1-03', 'SKU-FRK-OIL-10W',
    24, 'France', 1, 'active'
  );

  -- Part 40: Chain Lube (400ml)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'LUB-CHN-LUB', 'Chain Lube & Cleaner (400ml)', cat10_id, 'Lubricants',
    'Motul', 'Universal Chain', 'Transmission',
    'Motul chain lubricant with excellent adhesion. 400ml aerosol spray. White color.',
    50, 100, 20,
    320.00, 580.00, 480.00,
    sup3_id, 'Lubricants Express', '+91 98765 65432', 'priya@lubexpress.com',
    'LXP-CHN-LUB-400', 2, 40, 'L1-04', 'SKU-CHN-LUB-400',
    12, 'France', 1, 'active'
  ) RETURNING id INTO p40_id;

  -- Part 41: 2T Oil (1L)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'LUB-2T-OIL', '2T Engine Oil (1L)', cat10_id, 'Lubricants',
    'Castrol', 'Universal 2-Stroke', 'Engine',
    'Castrol Power 1 Ultimate 2T oil. 1 liter bottle. Fully synthetic. Smoke-free formula.',
    20, 40, 8,
    420.00, 650.00, 550.00,
    sup3_id, 'Lubricants Express', '+91 98765 65432', 'priya@lubexpress.com',
    'LXP-2T-CAS-1L', 3, 15, 'L1-05', 'SKU-2T-OIL-1L',
    24, 'India', 1, 'active'
  );

  -- ============================================================================
  -- EXHAUST
  -- ============================================================================

  -- Part 42: Exhaust Silencer (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'EXH-SIL-SC', 'Exhaust Silencer Scooter', cat11_id, 'Exhaust',
    'Universal', 'Honda Activa / Dio', 'Exhaust',
    'Complete exhaust silencer for scooters. Chrome finish. Heat shield included.',
    10, 20, 4,
    1650.00, 2800.00,
    sup2_id, 'Mysore Auto Spares', '+91 98765 54321', 'srinivas@mysoreautospares.com',
    'MAS-SIL-SC-CHRM', 7, 8, 'E1-01', 'SKU-SIL-SC-CHRM',
    6, 'India', 1, 'active'
  );

  -- Part 43: Exhaust Gasket
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'EXH-GSK-UNI', 'Exhaust Gasket Universal', cat11_id, 'Exhaust',
    'Universal', 'Universal Motorcycle', 'Exhaust',
    'Exhaust port gasket. Fiberglass material. High temperature resistant. Universal fitment.',
    60, 120, 24,
    25.00, 55.00, 40.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-GSK-EXH-FIB', 2, 50, 'E1-02', 'SKU-GSK-EXH-FIB',
    3, 'India', 1, 'active'
  );

  -- ============================================================================
  -- ACCESSORIES
  -- ============================================================================

  -- Part 44: Mobile Phone Mount (Handle Bar)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ACC-PHN-MNT', 'Mobile Phone Mount Handle Bar', cat12_id, 'Accessories',
    'Universal', 'Universal Motorcycle', 'Accessories',
    'Universal mobile phone mount for handle bar. Fits phones up to 6.5 inch. 360 degree rotation.',
    25, 50, 10,
    250.00, 550.00, 450.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-PHN-MNT-UNI', 3, 20, 'A1-01', 'SKU-PHN-MNT-UNI',
    6, 'India', 1, 'active'
  );

  -- Part 45: Cargo Carrier (Rack)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ACC-CRG-RACK', 'Cargo Carrier Rear Rack', cat12_id, 'Accessories',
    'Universal', 'Universal Scooter', 'Accessories',
    'Heavy-duty rear cargo carrier rack for scooters. Powder coated black. Max load 15kg.',
    15, 30, 6,
    1450.00, 2400.00,
    sup2_id, 'Mysore Auto Spares', '+91 98765 54321', 'srinivas@mysoreautospares.com',
    'MAS-RACK-RR-SC', 5, 10, 'A1-02', 'SKU-RACK-RR-SC',
    12, 'India', 1, 'active'
  ) RETURNING id INTO p45_id;

  -- Part 46: Floor Mat (Scooter)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ACC-FLR-MAT', 'Floor Mat Scooter', cat12_id, 'Accessories',
    'Universal', 'Universal Scooter', 'Accessories',
    'Anti-slip floor mat for scooters. Rubber material. Easy to clean. Custom fitment.',
    35, 70, 14,
    180.00, 350.00, 280.00,
    sup2_id, 'Mysore Auto Spares', '+91 98765 54321', 'srinivas@mysoreautospares.com',
    'MAS-MAT-FLR-SC', 3, 25, 'A1-03', 'SKU-MAT-FLR-SC',
    3, 'India', 1, 'active'
  );

  -- Part 47: Helmet Lock
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ACC-HEL-LCK', 'Helmet Lock Universal', cat12_id, 'Accessories',
    'Universal', 'Universal Motorcycle', 'Accessories',
    'Universal helmet lock with 2 keys. Cable type. Can be mounted on handle bar or body.',
    30, 60, 12,
    320.00, 650.00, 520.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-HEL-LCK-CBL', 4, 20, 'A1-04', 'SKU-HEL-LCK-CBL',
    6, 'India', 1, 'active'
  );

  -- Part 48: Number Plate (Front/Rear)
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'ACC-NUM-PLT', 'Number Plate Set (Front + Rear)', cat12_id, 'Accessories',
    'Universal', 'Universal Motorcycle', 'Accessories',
    'ABS plastic number plate set. Includes front and rear plates with reflectors. As per RTO norms.',
    50, 100, 20,
    120.00, 240.00, 180.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-NUM-PLT-SET', 2, 40, 'A1-05', 'SKU-NUM-PLT-SET',
    6, 'India', 1, 'active'
  );

  -- Part 49: Steering Cone Set
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku, oem_part_number,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BOD-STC-CONE', 'Steering Cone Set', cat8_id, 'Body & Frame',
    'Universal', 'Universal Commuter', 'Body & Frame',
    'Complete steering cone set with ball bearings. Upper and lower cones included. Greased.',
    25, 50, 10,
    350.00, 650.00, 520.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-STC-CONE-SET', 4, 15, 'B1-06', 'SKU-STC-CONE-SET', 'OEM-UNI-CONE-SET',
    6, 'India', 1, 'active'
  );

  -- Part 50: Speedometer Cable
  INSERT INTO public.parts (
    garage_id, part_number, part_name, category_id, category, make, model, used_for,
    description, on_hand_stock, warehouse_stock, low_stock_threshold,
    purchase_price, selling_price, wholesale_price,
    primary_supplier_id, supplier, supplier_phone, supplier_email, vendor_sku,
    lead_time_days, minimum_order_quantity, location, sku,
    warranty_months, country_of_origin, quantity_per_package, status
  )
  VALUES (
    v_garage_id, 'BOD-SPD-CBL', 'Speedometer Cable Universal', cat8_id, 'Body & Frame',
    'Universal', 'Universal Commuter', 'Body & Frame',
    'Universal speedometer cable. 900mm length. Square ends. Fits most commuters.',
    40, 80, 16,
    120.00, 240.00, 180.00,
    sup10_id, 'QuickParts Distribution', '+91 98765 44455', 'deepak@quickparts.com',
    'QPD-SPD-CBL-900', 2, 30, 'B1-07', 'SKU-SPD-CBL-900',
    3, 'India', 1, 'active'
  );

  parts_created := 50;
  RAISE NOTICE 'Created 50 parts';

  -- ============================================================================
  -- SECTION 4: PARTS FITMENT (Linking parts to motorcycles)
  -- ============================================================================
  RAISE NOTICE 'Creating parts fitment data...';

  -- Fitment for Piston Kit (Hero Honda 100cc)
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT p1_id, id, v_garage_id, 'Fits Hero Honda CD 100, Splendor, Passion with standard bore. Verify piston size before installation.'
  FROM public.motorcycles
  WHERE make IN ('Hero', 'Hero Honda') AND model LIKE '%Splendor%'
  LIMIT 3;
  fitment_created := fitment_created + 3;

  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT p1_id, id, v_garage_id, 'Fits Hero Honda CD 100, Passion. Standard bore 47.0mm.'
  FROM public.motorcycles
  WHERE (make = 'Hero' OR make = 'Hero Honda') AND model LIKE '%Passion%'
  LIMIT 2;
  fitment_created := fitment_created + 2;

  -- Fitment for Brake Caliper (200cc bikes)
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT p10_id, id, v_garage_id, 'Fits most 200-250cc Indian motorcycles with axial caliper mount. Verify bracket compatibility.'
  FROM public.motorcycles
  WHERE model LIKE '%200%' OR model LIKE '%250%'
  LIMIT 5;
  fitment_created := fitment_created + 5;

  -- Fitment for Engine Oil (Universal 4-stroke) - use part_id directly from part_number
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT (SELECT id FROM public.parts WHERE part_number = 'LUB-OIL-10W40' LIMIT 1), id, v_garage_id, 'Universal fitment for all 4-stroke motorcycles and scooters. Check manufacturer recommended viscosity.'
  FROM public.motorcycles
  WHERE engine_displacement_cc BETWEEN 100 AND 250
  LIMIT 10;
  fitment_created := fitment_created + 10;

  -- Fitment for Spark Plug (Standard) - use part_id directly from part_number
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT (SELECT id FROM public.parts WHERE part_number = 'ELC-SPK-STD' LIMIT 1), id, v_garage_id, 'Standard spark plug for 100-150cc motorcycles. Verify heat range and thread reach.'
  FROM public.motorcycles
  WHERE engine_displacement_cc BETWEEN 100 AND 150
  LIMIT 8;
  fitment_created := fitment_created + 8;

  -- Fitment for Brake Pads (Scooter) - use part_id directly from part_number
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT (SELECT id FROM public.parts WHERE part_number = 'BRK-PAD-FR-SC' LIMIT 1), id, v_garage_id, 'Front brake pads for 110-125cc scooters with drum brakes.'
  FROM public.motorcycles
  WHERE model IN ('Activa 6G', 'Dio', 'Jupiter', 'Access 125', 'Activa 5G', 'Activa 4G')
  LIMIT 6;
  fitment_created := fitment_created + 6;

  -- Fitment for Chain & Sprockets (125-180cc)
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT p20_id, id, v_garage_id, '428 pitch chain and sprockets for 125-180cc motorcycles. Verify front and rear sprocket tooth count.'
  FROM public.motorcycles
  WHERE engine_displacement_cc BETWEEN 125 AND 180 AND category NOT IN ('Scooter', 'Moped')
  LIMIT 8;
  fitment_created := fitment_created + 8;

  -- Fitment for Air Filter (Scooter) - use part_id directly from part_number
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT (SELECT id FROM public.parts WHERE part_number = 'FLT-AIR-SC-FOAM' LIMIT 1), id, v_garage_id, 'Foam air filter for scooters. Washable and reusable.'
  FROM public.motorcycles
  WHERE model LIKE '%Activa%' OR model LIKE '%Dio%' OR model LIKE '%Jupiter%'
  LIMIT 5;
  fitment_created := fitment_created + 5;

  -- Fitment for Tires (Scooter)
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT p25_id, id, v_garage_id, 'Front tire 90/90-12 tubeless. Fits most scooters. Verify rim size.'
  FROM public.motorcycles
  WHERE model LIKE '%Activa%' OR model LIKE '%Dio%' OR model LIKE '%Jupiter%' OR model LIKE '%Access%'
  LIMIT 6;
  fitment_created := fitment_created + 6;

  -- Fitment for Battery (Scooter) - use part_id directly from part_number
  INSERT INTO public.parts_fitment (part_id, motorcycle_id, garage_id, fitment_notes)
  SELECT (SELECT id FROM public.parts WHERE part_number = 'ELC-BAT-5AH' LIMIT 1), id, v_garage_id, '12V 5Ah maintenance-free battery. Fits Honda Activa, Dio, TVS Jupiter, Suzuki Access.'
  FROM public.motorcycles
  WHERE model IN ('Activa 6G', 'Dio', 'Jupiter', 'Access 125')
  LIMIT 4;
  fitment_created := fitment_created + 4;

  RAISE NOTICE 'Created % parts fitment records', fitment_created;

  -- ============================================================================
  -- SECTION 5: PARTS BACKUP SUPPLIERS
  -- ============================================================================
  RAISE NOTICE 'Creating backup suppliers for critical parts...';

  -- Backup suppliers for Engine Oil (most critical)
  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT (SELECT id FROM public.parts WHERE part_number = 'LUB-OIL-10W40' LIMIT 1), v_garage_id, 'MRF Lubricants', '+91 98765 99999', 'orders@mrflubes.com',
    'MRF-OIL-10W40-1L', 3, 24, true;
  backup_suppliers_created := backup_suppliers_created + 1;

  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT (SELECT id FROM public.parts WHERE part_number = 'LUB-OIL-10W40' LIMIT 1), v_garage_id, 'Shell Lubricants India', '+91 98765 88888', 'india@shell.com',
    'SHEL-ADV-10W40-1L', 5, 36, false;
  backup_suppliers_created := backup_suppliers_created + 1;

  -- Backup suppliers for Brake Pads
  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT (SELECT id FROM public.parts WHERE part_number = 'BRK-PAD-FR-SC' LIMIT 1), v_garage_id, 'Bosch India', '+91 98765 77777', 'parts@bosch.in',
    'BOSCH-PAD-SC-110', 4, 25, true;
  backup_suppliers_created := backup_suppliers_created + 1;

  -- Backup suppliers for Battery
  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT (SELECT id FROM public.parts WHERE part_number = 'ELC-BAT-5AH' LIMIT 1), v_garage_id, 'Amaron Batteries', '+91 98765 66666', 'sales@amaron.com',
    'AMARON-5AH-MF', 2, 15, true;
  backup_suppliers_created := backup_suppliers_created + 1;

  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT (SELECT id FROM public.parts WHERE part_number = 'ELC-BAT-5AH' LIMIT 1), v_garage_id, 'Tata Green Batteries', '+91 98765 55555', 'batteries@tatagreen.com',
    'TGT-5AH-MF', 3, 20, false;
  backup_suppliers_created := backup_suppliers_created + 1;

  -- Backup suppliers for Spark Plug
  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT (SELECT id FROM public.parts WHERE part_number = 'ELC-SPK-STD' LIMIT 1), v_garage_id, 'Bosch Spark Plugs', '+91 98765 44444', 'sparkplugs@bosch.in',
    'BOSCH-SPK-STD', 3, 50, true;
  backup_suppliers_created := backup_suppliers_created + 1;

  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT (SELECT id FROM public.parts WHERE part_number = 'ELC-SPK-STD' LIMIT 1), v_garage_id, 'Denso India', '+91 98765 33333', 'parts@denso.in',
    'DENSO-SPK-STD', 4, 40, false;
  backup_suppliers_created := backup_suppliers_created + 1;

  -- Backup suppliers for Chain
  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT (SELECT id FROM public.parts WHERE part_number = 'TRN-CHN-428-HD' LIMIT 1), v_garage_id, 'RK Chains India', '+91 98765 22222', 'india@rkchains.com',
    'RK-428-O-116', 5, 15, false;
  backup_suppliers_created := backup_suppliers_created + 1;

  -- Backup suppliers for Tires
  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT p25_id, v_garage_id, 'CEAT Tyres', '+91 98765 11111', 'orders@ceat tyres.com',
    'CEAT-90-90-12-FR', 4, 20, true;
  backup_suppliers_created := backup_suppliers_created + 1;

  INSERT INTO public.parts_backup_suppliers (
    part_id, garage_id, supplier_name, supplier_phone, supplier_email,
    vendor_sku, lead_time_days, minimum_order_quantity, is_preferred
  )
  SELECT p25_id, v_garage_id, 'Apollo Tyres', '+91 98765 00000', 'sales@apolloatyres.com',
    'APOL-90-90-12', 5, 25, false;
  backup_suppliers_created := backup_suppliers_created + 1;

  RAISE NOTICE 'Created % backup supplier records', backup_suppliers_created;

  -- ============================================================================
  -- SUMMARY REPORT
  -- ============================================================================
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'INVENTORY MANAGEMENT SEED DATA CREATED SUCCESSFULLY!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Summary of data created:';
  RAISE NOTICE '  - Parts Suppliers: %', suppliers_created;
  RAISE NOTICE '  - Parts Categories: %', categories_created;
  RAISE NOTICE '  - Parts: %', parts_created;
  RAISE NOTICE '  - Parts Fitment Records: %', fitment_created;
  RAISE NOTICE '  - Backup Suppliers: %', backup_suppliers_created;
  RAISE NOTICE '';
  RAISE NOTICE 'Parts Categories Created:';
  RAISE NOTICE '  1. Engine - Internal engine components';
  RAISE NOTICE '  2. Brakes - Brake system components';
  RAISE NOTICE '  3. Electrical - Battery, lights, ignition';
  RAISE NOTICE '  4. Filters - Air, oil, fuel filters';
  RAISE NOTICE '  5. Transmission - Chain, sprocket, transmission';
  RAISE NOTICE '  6. Suspension - Front forks, rear shocks';
  RAISE NOTICE '  7. Wheels & Tires - Wheels, tires, tubes';
  RAISE NOTICE '  8. Body & Frame - Body panels, mirrors, cosmetic';
  RAISE NOTICE '  9. Fuel System - Fuel pump, carburetor';
  RAISE NOTICE '  10. Lubricants - Engine oil, transmission oil';
  RAISE NOTICE '  11. Exhaust - Exhaust systems, mufflers';
  RAISE NOTICE '  12. Accessories - General accessories';
  RAISE NOTICE '';
  RAISE NOTICE 'To verify the data:';
  RAISE NOTICE '  -- Check suppliers count';
  RAISE NOTICE '  SELECT COUNT(*) FROM public.parts_suppliers WHERE garage_id = ''%'';', v_garage_id;
  RAISE NOTICE '  -- Check parts count';
  RAISE NOTICE '  SELECT COUNT(*) FROM public.parts WHERE garage_id = ''%'';', v_garage_id;
  RAISE NOTICE '  -- Check fitment count';
  RAISE NOTICE '  SELECT COUNT(*) FROM public.parts_fitment WHERE garage_id = ''%'';', v_garage_id;
  RAISE NOTICE '  -- View parts by category';
  RAISE NOTICE '  SELECT category, COUNT(*) as part_count FROM public.parts';
  RAISE NOTICE '    WHERE garage_id = ''%'' GROUP BY category ORDER BY part_count DESC;', v_garage_id;
  RAISE NOTICE '  -- View low stock items';
  RAISE NOTICE '  SELECT part_name, on_hand_stock, low_stock_threshold, stock_status';
  RAISE NOTICE '    FROM public.parts WHERE garage_id = ''%'' AND stock_status != ''in-stock'';', v_garage_id;
  RAISE NOTICE '============================================================================';

EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Error creating seed data: %', SQLERRM;
    RAISE NOTICE 'Please check:';
    RAISE NOTICE '  1. Garage ID is correct (run: SELECT garage_uid FROM public.garages;)';
    RAISE NOTICE '  2. All required tables exist (parts_suppliers, parts_categories, parts, etc.)';
    RAISE NOTICE '  3. Motorcycles table is populated with vehicle data';
    RAISE NOTICE '  4. Proper permissions to insert data';
    RAISE;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (Run these to verify the data)
-- ============================================================================

-- Check supplier count
-- SELECT COUNT(*) as total_suppliers FROM public.parts_suppliers WHERE garage_id = 'YOUR_v_garage_id';

-- Check category count
-- SELECT COUNT(*) as total_categories FROM public.parts_categories WHERE garage_id = 'YOUR_v_garage_id';

-- Check parts count
-- SELECT COUNT(*) as total_parts FROM public.parts WHERE garage_id = 'YOUR_v_garage_id';

-- Check fitment count
-- SELECT COUNT(*) as total_fitment FROM public.parts_fitment WHERE garage_id = 'YOUR_v_garage_id';

-- View parts by category
-- SELECT
--   category,
--   COUNT(*) as part_count,
--   SUM(on_hand_stock) as total_stock,
--   SUM(purchase_price * on_hand_stock) as stock_value
-- FROM public.parts
-- WHERE garage_id = 'YOUR_v_garage_id'
-- GROUP BY category
-- ORDER BY part_count DESC;

-- View low stock items
-- SELECT
--   part_number,
--   part_name,
--   category,
--   on_hand_stock,
--   low_stock_threshold,
--   stock_status
-- FROM public.parts
-- WHERE garage_id = 'YOUR_v_garage_id'
--   AND stock_status != 'in-stock'
-- ORDER BY on_hand_stock ASC;

-- View suppliers with ratings
-- SELECT
--   supplier_name,
--   supplier_code,
--   rating,
--   is_preferred,
--   payment_terms,
--   credit_limit
-- FROM public.parts_suppliers
-- WHERE garage_id = 'YOUR_v_garage_id'
-- ORDER BY rating DESC, is_preferred DESC;

-- View parts fitment summary
-- SELECT
--   p.part_name,
--   p.category,
--   COUNT(pf.motorcycle_id) as fitment_count,
--   STRING_AGG(m.make || ' ' || m.model, ', ' ORDER BY m.make, m.model) as compatible_vehicles
-- FROM public.parts p
-- LEFT JOIN public.parts_fitment pf ON p.id = pf.part_id
-- LEFT JOIN public.motorcycles m ON pf.motorcycle_id = m.id
-- WHERE p.garage_id = 'YOUR_v_garage_id'
-- GROUP BY p.id, p.part_name, p.category
-- HAVING COUNT(pf.motorcycle_id) > 0
-- ORDER BY fitment_count DESC
-- LIMIT 20;

-- View backup suppliers
-- SELECT
--   p.part_name,
--   p.part_number,
--   bs.supplier_name,
--   bs.is_preferred,
--   bs.lead_time_days
-- FROM public.parts p
-- JOIN public.parts_backup_suppliers bs ON p.id = bs.part_id
-- WHERE p.garage_id = 'YOUR_v_garage_id'
-- ORDER BY p.part_name, bs.is_preferred DESC, bs.lead_time_days;
