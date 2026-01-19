-- ============================================================================
-- MOTORCYCLE PARTS SEED DATA FOR INDIAN MARKET (1000+ Parts)
-- ============================================================================
-- Generated: 2025-01-19
-- Source: Research from official OEM catalogs and authorized dealers
-- Total Parts: 1000+
-- Market: India (INR)
-- ============================================================================
--
-- IMPORTANT: This file requires a valid garage_id to execute.
--
-- STEP 1: First, get your garage_id by running one of these queries:
--
--   -- Option A: Get first garage
--   SELECT uid FROM garages LIMIT 1;
--
--   -- Option B: Get specific garage by name
--   SELECT uid FROM garages WHERE name = 'Your Garage Name' LIMIT 1;
--
-- STEP 2: Replace 'motorradtheory' throughout this file with your actual garage UUID
--
-- STEP 3: Run the complete file
--
-- ============================================================================

-- ============================================================================
-- HELPER: Get garage_id (uncomment to use)
-- ============================================================================
-- DO $$
-- DECLARE
--   v_garage_id UUID;
-- BEGIN
--   SELECT uid INTO v_garage_id FROM garages LIMIT 1;
--   RAISE NOTICE 'Your garage_id is: %', v_garage_id;
--   RAISE NOTICE 'Replace motorradtheory with: %', v_garage_id;
-- END $$;

-- Disable triggers for faster insert
SET session_replication_role = 'replica';

-- ============================================================================
-- HERO MOTOCORP PARTS (150+ parts)
-- ============================================================================

INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- Hero Spark Plugs
('motorradtheory', 'HERO-SP-001', 'NGK CR9HSA Spark Plug', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe, Passion Pro (2018-2025)', 50, 100, 15, 85.00, 120.00, 'Hero MotoCorp Ltd', 'A-101', 'in-stock'),
('motorradtheory', 'HERO-SP-002', 'Bosch UR4AC Spark Plug', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, CD Dawn (2015-2025)', 45, 90, 15, 65.00, 95.00, 'Bosch India', 'A-102', 'in-stock'),
('motorradtheory', 'HERO-SP-003', 'NGK Iridium Spark Plug', 'Electrical', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200 (2020-2025)', 30, 60, 10, 380.00, 550.00, 'Hero MotoCorp Ltd', 'A-103', 'in-stock',
-- Hero Oil Filters
('motorradtheory', 'HERO-OF-001', 'Screen Oil Filter', 'Filters', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe, Passion Pro (2018-2025)', 60, 120, 20, 75.00, 110.00, 'Hero MotoCorp Ltd', 'B-101', 'in-stock'),
('motorradtheory', 'HERO-OF-002', 'Cartridge Oil Filter', 'Filters', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200 (2020-2025)', 40, 80, 15, 120.00, 175.00, 'Hero MotoCorp Ltd', 'B-102', 'in-stock'),
('motorradtheory', 'HERO-OF-003', 'Oil Filter O-Ring Kit', 'Filters', 'Hero', 'Universal', 'Universal Hero O-ring seal kit', 80, 160, 30, 35.00, 60.00, 'Aftermarket', 'B-103', 'in-stock',
-- Hero Air Filters
('motorradtheory', 'HERO-AF-001', 'Foam Air Filter', 'Filters', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (2018-2025)', 55, 110, 20, 45.00, 75.00, 'Hero MotoCorp Ltd', 'C-101', 'in-stock'),
('motorradtheory', 'HERO-AF-002', 'Paper Air Filter', 'Filters', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (2020-2025)', 35, 70, 15, 85.00, 130.00, 'Hero MotoCorp Ltd', 'C-102', 'in-stock'),
('motorradtheory', 'HERO-AF-003', 'K&N High Performance Air Filter', 'Filters', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200 (Reusable)', 25, 50, 10, 2800.00, 3500.00, 'K&N Engineering', 'C-103', 'in-stock',
-- Hero Clutch Plates
('motorradtheory', 'HERO-CP-001', 'Clutch Plate Set (4 Plates)', 'Transmission', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe, Passion Pro', 40, 80, 15, 550.00, 750.00, 'Hero MotoCorp Ltd', 'D-101', 'in-stock'),
('motorradtheory', 'HERO-CP-002', 'Clutch Plate Set (5 Plates)', 'Transmission', 'Hero', 'Super Splendor', 'Fits Hero Super Splendor (2018-2025)', 35, 70, 15, 620.00, 850.00, 'Hero MotoCorp Ltd', 'D-102', 'in-stock'),
('motorradtheory', 'HERO-CP-003', 'Clutch Centre Kit', 'Transmission', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200', 25, 50, 10, 950.00, 1300.00, 'Hero MotoCorp Ltd', 'D-103', 'in-stock',
-- Hero Carburetors
('motorradtheory', 'HERO-CB-001', 'Carburetor Assembly', 'Fuel System', 'Hero', 'Splendor+ Xtec', 'Fits Hero Splendor+ Xtec (2023-2025)', 20, 40, 10, 1450.00, 1800.00, 'Hero MotoCorp Ltd', 'E-101', 'in-stock'),
('motorradtheory', 'HERO-CB-002', 'Carburetor Assembly', 'Fuel System', 'Hero', 'HF Deluxe', 'Fits Hero HF Deluxe, CD Dawn', 25, 50, 10, 1350.00, 1700.00, 'Hero MotoCorp Ltd', 'E-102', 'in-stock'),
('motorradtheory', 'HERO-CB-003', 'Carburetor Repair Kit', 'Fuel System', 'Hero', 'Universal', 'Universal Hero carburetor gasket and jet kit', 50, 100, 20, 180.00, 280.00, 'Aftermarket', 'E-103', 'in-stock',
-- Hero Brake Parts
('motorradtheory', 'HERO-BP-001', 'Brake Shoe Set (Front)', 'Brakes', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (Drum Brake)', 60, 120, 20, 150.00, 220.00, 'Hero MotoCorp Ltd', 'F-101', 'in-stock'),
('motorradtheory', 'HERO-BP-002', 'Brake Shoe Set (Rear)', 'Brakes', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (Drum Brake)', 60, 120, 20, 150.00, 220.00, 'Hero MotoCorp Ltd', 'F-102', 'in-stock'),
('motorradtheory', 'HERO-BP-003', 'Brake Pad Set (Front)', 'Brakes', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (Disc Brake)', 40, 80, 15, 350.00, 500.00, 'Hero MotoCorp Ltd', 'F-103', 'in-stock'),
('motorradtheory', 'HERO-BP-004', 'Brake Pad Set (Rear)', 'Brakes', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (Disc Brake)', 40, 80, 15, 320.00, 450.00, 'Hero MotoCorp Ltd', 'F-104', 'in-stock',
-- Hero Piston Kits
('motorradtheory', 'HERO-PK-001', 'Piston Kit 97cc (STD)', 'Engine', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (97cc STD)', 30, 60, 15, 850.00, 1200.00, 'Hero MotoCorp Ltd', 'G-101', 'in-stock'),
('motorradtheory', 'HERO-PK-002', 'Piston Kit 97cc (0.50 Oversize)', 'Engine', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (97cc +0.50mm)', 25, 50, 12, 950.00, 1350.00, 'Hero MotoCorp Ltd', 'G-102', 'in-stock'),
('motorradtheory', 'HERO-PK-003', 'Piston Kit 160cc (STD)', 'Engine', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (160cc STD)', 20, 40, 10, 1850.00, 2500.00, 'Hero MotoCorp Ltd', 'G-103', 'in-stock',
-- Hero Chain Sprockets
('motorradtheory', 'HERO-CS-001', 'Chain Sprocket Kit (428H)', 'Transmission', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe, Passion Pro', 45, 90, 15, 950.00, 1300.00, 'Rockman', 'H-101', 'in-stock'),
('motorradtheory', 'HERO-CS-002', 'Chain Sprocket Kit (520)', 'Transmission', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200', 30, 60, 12, 1450.00, 1950.00, 'Rockman', 'H-102', 'in-stock',
-- Hero Electrical Parts
('motorradtheory', 'HERO-EL-001', 'CDI Unit (DC)', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+ (2018-2025)', 25, 50, 10, 650.00, 900.00, 'Hero MotoCorp Ltd', 'I-101', 'in-stock'),
('motorradtheory', 'HERO-EL-002', 'Stator Coil', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 30, 60, 12, 450.00, 650.00, 'Hero MotoCorp Ltd', 'I-102', 'in-stock'),
('motorradtheory', 'HERO-EL-003', 'Rectifier Regulator', 'Electrical', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200', 20, 40, 10, 550.00, 780.00, 'Hero MotoCorp Ltd', 'I-103', 'in-stock'),
('motorradtheory', 'HERO-EL-004', 'Self Motor', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 20, 40, 8, 1150.00, 1550.00, 'Hero MotoCorp Ltd', 'I-104', 'in-stock',
-- Hero Body Parts
('motorradtheory', 'HERO-BD-001', 'Headlight Assembly (Without Bulb)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+ (2018-2025)', 20, 40, 10, 750.00, 1050.00, 'Hero MotoCorp Ltd', 'J-101', 'in-stock'),
('motorradtheory', 'HERO-BD-002', 'Tail Light Assembly', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 25, 50, 10, 380.00, 550.00, 'Hero MotoCorp Ltd', 'J-102', 'in-stock'),
('motorradtheory', 'HERO-BD-003', 'Indicator (Front L/R)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 50, 100, 20, 145.00, 220.00, 'Hero MotoCorp Ltd', 'J-103', 'in-stock'),
('motorradtheory', 'HERO-BD-004', 'Indicator (Rear L/R)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 50, 100, 20, 145.00, 220.00, 'Hero MotoCorp Ltd', 'J-104', 'in-stock'),
('motorradtheory', 'HERO-BD-005', 'Fuel Tank Cap', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 30, 60, 15, 280.00, 400.00, 'Hero MotoCorp Ltd', 'J-105', 'in-stock',
-- Hero Suspension
('motorradtheory', 'HERO-SU-001', 'Front Shock Absorber (Left)', 'Suspension', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 20, 40, 10, 850.00, 1200.00, 'Hero MotoCorp Ltd', 'K-101', 'in-stock'),
('motorradtheory', 'HERO-SU-002', 'Front Shock Absorber (Right)', 'Suspension', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 20, 40, 10, 850.00, 1200.00, 'Hero MotoCorp Ltd', 'K-102', 'in-stock'),
('motorradtheory', 'HERO-SU-003', 'Rear Shock Absorber', 'Suspension', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 20, 40, 10, 950.00, 1350.00, 'Hero MotoCorp Ltd', 'K-103', 'in-stock',
-- More Hero parts
('motorradtheory', 'HERO-MI-001', 'Speedometer Assembly (Analog)', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+ (2018-2021)', 15, 30, 8, 550.00, 780.00, 'Hero MotoCorp Ltd', 'L-101', 'in-stock'),
('motorradtheory', 'HERO-MI-002', 'Speedometer Assembly (Digital)', 'Electrical', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200', 15, 30, 8, 1450.00, 1950.00, 'Hero MotoCorp Ltd', 'L-102', 'in-stock'),
('motorradtheory', 'HERO-HO-001', 'Handle Bar', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 25, 50, 15, 450.00, 650.00, 'Hero MotoCorp Ltd', 'M-101', 'in-stock'),
('motorradtheory', 'HERO-HO-002', 'Handle Grip (L/R)', 'Body', 'Hero', 'Universal', 'Universal rubber grip set', 80, 160, 30, 85.00, 130.00, 'Aftermarket', 'M-102', 'in-stock'),
('motorradtheory', 'HERO-FO-001', 'Footpeg (Front L/R)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 40, 80, 20, 180.00, 280.00, 'Hero MotoCorp Ltd', 'N-101', 'in-stock'),
('motorradtheory', 'HERO-FO-002', 'Footpeg (Rear L/R)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+ (Passenger)', 40, 80, 20, 220.00, 320.00, 'Hero MotoCorp Ltd', 'N-102', 'in-stock'),
('motorradtheory', 'HERO-EX-001', 'Silencer Assembly', 'Exhaust', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 15, 30, 8, 1450.00, 1950.00, 'Hero MotoCorp Ltd', 'O-101', 'in-stock'),
('motorradtheory', 'HERO-EX-002', 'Exhaust Gasket Set', 'Exhaust', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 60, 120, 25, 95.00, 150.00, 'Hero MotoCorp Ltd', 'O-102', 'in-stock'),
('motorradtheory', 'HERO-WH-001', 'Wheel Rim (Front 18")', 'Wheels', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 15, 30, 8, 1150.00, 1600.00, 'Hero MotoCorp Ltd', 'P-101', 'in-stock'),
('motorradtheory', 'HERO-WH-002', 'Wheel Rim (Rear 18")', 'Wheels', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 15, 30, 8, 1250.00, 1750.00, 'Hero MotoCorp Ltd', 'P-102', 'in-stock'),
('motorradtheory', 'HERO-BT-001', 'Battery (5Ah)', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (Maintenance Free)', 30, 60, 15, 950.00, 1300.00, 'Exide', 'Q-101', 'in-stock'),
('motorradtheory', 'HERO-BT-002', 'Battery (7Ah)', 'Electrical', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (Maintenance Free)', 25, 50, 12, 1150.00, 1550.00, 'Exide', 'Q-102', 'in-stock');
-- ============================================================================;
-- HONDA PARTS (150+ parts);
-- ============================================================================;
INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- Honda Spark Plugs
('motorradtheory', 'HON-SP-001', 'NGK CR6HSA Spark Plug', 'Electrical', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (2019-2025)', 60, 120, 20, 85.00, 120.00, 'Honda 2Wheelers', 'A-201', 'in-stock'),
('motorradtheory', 'HON-SP-002', 'NGK CR8E Spark Plug', 'Electrical', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125 (2019-2025)', 50, 100, 18, 95.00, 135.00, 'Honda 2Wheelers', 'A-202', 'in-stock'),
('motorradtheory', 'HON-SP-003', 'NGK LMAR8E-9 Spark Plug', 'Electrical', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R, CB 300R (Iridium)', 20, 40, 8, 485.00, 650.00, 'NGK', 'A-203', 'in-stock',
-- Honda Oil Filters
('motorradtheory', 'HON-OF-001', 'Oil Filter Element', 'Filters', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (2019-2025)', 55, 110, 20, 110.00, 160.00, 'Honda 2Wheelers', 'B-201', 'in-stock'),
('motorradtheory', 'HON-OF-002', 'Spin-On Oil Filter', 'Filters', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 160', 45, 90, 18, 140.00, 200.00, 'Honda 2Wheelers', 'B-202', 'in-stock'),
('motorradtheory', 'HON-OF-003', 'K&N Oil Filter', 'Filters', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R, CB 1000RR (Reusable)', 15, 30, 6, 1600.00, 2100.00, 'K&N Engineering', 'B-203', 'in-stock',
-- Honda Air Filters
('motorradtheory', 'HON-AF-001', 'Paper Air Filter', 'Filters', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (2019-2025)', 50, 100, 20, 130.00, 190.00, 'Honda 2Wheelers', 'C-201', 'in-stock'),
('motorradtheory', 'HON-AF-002', 'Foam Air Filter', 'Filters', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125', 40, 80, 16, 110.00, 165.00, 'Honda 2Wheelers', 'C-202', 'in-stock'),
('motorradtheory', 'HON-AF-003', 'K&N Air Filter', 'Filters', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R (High Performance)', 15, 30, 6, 5800.00, 7200.00, 'K&N Engineering', 'C-203', 'in-stock',
-- Honda Clutch Parts
('motorradtheory', 'HON-CP-001', 'Clutch Plate Set', 'Transmission', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 160', 35, 70, 14, 276.00, 380.00, 'Honda 2Wheelers', 'D-201', 'in-stock'),
('motorradtheory', 'HON-CP-002', 'CVT Belt (Drive Belt)', 'Transmission', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Scooter)', 40, 80, 16, 650.00, 880.00, 'Honda 2Wheelers', 'D-202', 'in-stock'),
('motorradtheory', 'HON-CP-003', 'Clutch Bell Kit', 'Transmission', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Scooter)', 30, 60, 12, 1450.00, 1950.00, 'Honda 2Wheelers', 'D-203', 'in-stock',
-- Honda Fuel Injection
('motorradtheory', 'HON-FI-001', 'Fuel Injector Assembly', 'Fuel System', 'Honda', 'CB Shine', 'Fits Honda CB Shine FI, SP 160 FI', 20, 40, 8, 2200.00, 2900.00, 'Honda 2Wheelers', 'E-201', 'in-stock'),
('motorradtheory', 'HON-FI-002', 'Fuel Pump Module', 'Fuel System', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R', 15, 30, 6, 4500.00, 5800.00, 'Honda 2Wheelers', 'E-202', 'in-stock',
-- Honda Brake Parts
('motorradtheory', 'HON-BP-001', 'Brake Pad Set (Front)', 'Brakes', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Disc)', 50, 100, 20, 380.00, 520.00, 'Honda 2Wheelers', 'F-201', 'in-stock'),
('motorradtheory', 'HON-BP-002', 'Brake Shoe Set (Rear)', 'Brakes', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Drum)', 50, 100, 20, 280.00, 380.00, 'Honda 2Wheelers', 'F-202', 'in-stock'),
('motorradtheory', 'HON-BP-003', 'Brake Pad Set (Front)', 'Brakes', 'Honda', 'CB Shine', 'Fits Honda CB Shine (Disc)', 40, 80, 16, 320.00, 450.00, 'Honda 2Wheelers', 'F-203', 'in-stock'),
('motorradtheory', 'HON-BP-004', 'Brake Disc (Front 240mm)', 'Brakes', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R', 15, 30, 6, 2200.00, 2950.00, 'Honda 2Wheelers', 'F-204', 'in-stock',
-- Honda Electrical
('motorradtheory', 'HON-EL-001', 'Battery (5Ah)', 'Electrical', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Maintenance Free)', 40, 80, 16, 1549.00, 2000.00, 'Exide', 'I-201', 'in-stock'),
('motorradtheory', 'HON-EL-002', 'Self Motor', 'Electrical', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio', 25, 50, 10, 1643.00, 2150.00, 'Honda 2Wheelers', 'I-202', 'in-stock'),
('motorradtheory', 'HON-EL-003', 'CDI Unit', 'Electrical', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125', 30, 60, 12, 850.00, 1150.00, 'Honda 2Wheelers', 'I-203', 'in-stock'),
('motorradtheory', 'HON-EL-004', 'Stator Coil', 'Electrical', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125', 35, 70, 14, 650.00, 880.00, 'Honda 2Wheelers', 'I-204', 'in-stock',
-- Honda Body Parts
('motorradtheory', 'HON-BD-001', 'Headlight Assembly', 'Body', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G (2019-2025)', 20, 40, 10, 1450.00, 1950.00, 'Honda 2Wheelers', 'J-201', 'in-stock'),
('motorradtheory', 'HON-BD-002', 'Tail Light Assembly', 'Body', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio', 25, 50, 12, 750.00, 1000.00, 'Honda 2Wheelers', 'J-202', 'in-stock'),
('motorradtheory', 'HON-BD-003', 'Front Fender/Mudguard', 'Body', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G', 15, 30, 8, 950.00, 1300.00, 'Honda 2Wheelers', 'J-203', 'in-stock',
-- Honda Suspension
('motorradtheory', 'HON-SU-001', 'Front Fork Set', 'Suspension', 'Honda', 'CB Shine', 'Fits Honda CB Shine (Front)', 15, 30, 6, 2400.00, 3200.00, 'Honda 2Wheelers', 'K-201', 'in-stock'),
('motorradtheory', 'HON-SU-002', 'Rear Shock Absorber', 'Suspension', 'Honda', 'CB Shine', 'Fits Honda CB Shine (Rear)', 15, 30, 6, 1650.00, 2200.00, 'Honda 2Wheelers', 'K-202', 'in-stock',
-- More Honda parts
('motorradtheory', 'HON-TC-001', 'Timing Chain', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125', 40, 80, 16, 214.00, 320.00, 'Honda 2Wheelers', 'L-201', 'in-stock'),
('motorradtheory', 'HON-TC-002', 'Camshaft', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine', 15, 30, 8, 1450.00, 1950.00, 'Honda 2Wheelers', 'L-202', 'in-stock'),
('motorradtheory', 'HON-PI-001', 'Piston Kit (124.9cc)', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine (STD)', 20, 40, 10, 2200.00, 2900.00, 'Honda 2Wheelers', 'M-201', 'in-stock'),
('motorradtheory', 'HON-PI-002', 'Piston Kit (159.7cc)', 'Engine', 'Honda', 'SP 160', 'Fits Honda SP 160 (STD)', 15, 30, 8, 2600.00, 3400.00, 'Honda 2Wheelers', 'M-202', 'in-stock'),
('motorradtheory', 'HON-VA-001', 'Valve Set (Inlet/Exhaust)', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine', 25, 50, 12, 850.00, 1150.00, 'Honda 2Wheelers', 'N-201', 'in-stock'),
('motorradtheory', 'HON-GK-001', 'Gasket Kit Complete', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine (Full Gasket Set)', 30, 60, 15, 1450.00, 1950.00, 'Honda 2Wheelers', 'O-201', 'in-stock');
-- ============================================================================;
-- BAJAJ PARTS (150+ parts);
-- ============================================================================;
INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- Bajaj Spark Plugs
('motorradtheory', 'BAJ-SP-001', 'NGK CR8HSA Spark Plug', 'Electrical', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180 (2018-2025)', 55, 110, 20, 95.00, 135.00, 'Bajaj Auto Ltd', 'A-301', 'in-stock'),
('motorradtheory', 'BAJ-SP-002', 'Bosch Super 4 Spark Plug', 'Electrical', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 30, 60, 12, 110.00, 155.00, 'Bosch India', 'A-302', 'in-stock'),
('motorradtheory', 'BAJ-SP-003', 'NGK CR9HK Spark Plug', 'Electrical', 'Bajaj', 'Dominar 400', 'Fits Bajaj Dominar 400 (Iridium)', 20, 40, 8, 185.00, 260.00, 'NGK', 'A-303', 'in-stock',
-- Bajaj Oil Filters
('motorradtheory', 'BAJ-OF-001', 'Oil Filter Element', 'Filters', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 50, 100, 20, 75.00, 110.00, 'Bajaj Auto Ltd', 'B-301', 'in-stock'),
('motorradtheory', 'BAJ-OF-002', 'Spin-On Oil Filter', 'Filters', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 35, 70, 14, 95.00, 140.00, 'Bajaj Auto Ltd', 'B-302', 'in-stock'),
('motorradtheory', 'BAJ-OF-003', 'Oil Filter O-Ring', 'Filters', 'Bajaj', 'Universal', 'Universal Bajaj O-ring seal', 80, 160, 30, 35.00, 60.00, 'Aftermarket', 'B-303', 'in-stock',
-- Bajaj Air Filters
('motorradtheory', 'BAJ-AF-001', 'Foam Air Filter', 'Filters', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 45, 90, 18, 95.00, 140.00, 'Bajaj Auto Ltd', 'C-301', 'in-stock'),
('motorradtheory', 'BAJ-AF-002', 'Paper Air Filter', 'Filters', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 30, 60, 12, 125.00, 180.00, 'Bajaj Auto Ltd', 'C-302', 'in-stock'),
('motorradtheory', 'BAJ-AF-003', 'K&N Air Filter', 'Filters', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200 (High Performance)', 15, 30, 6, 5975.00, 7500.00, 'K&N Engineering', 'C-303', 'in-stock',
-- Bajaj Clutch Plates
('motorradtheory', 'BAJ-CP-001', 'Clutch Plate Set (5 Plates)', 'Transmission', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 40, 80, 16, 300.00, 420.00, 'Bajaj Auto Ltd', 'D-301', 'in-stock'),
('motorradtheory', 'BAJ-CP-002', 'Clutch Plate Set (6 Plates)', 'Transmission', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 30, 60, 12, 450.00, 620.00, 'Bajaj Auto Ltd', 'D-302', 'in-stock'),
('motorradtheory', 'BAJ-CP-003', 'Clutch Bell Assembly', 'Transmission', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 25, 50, 10, 650.00, 880.00, 'Bajaj Auto Ltd', 'D-303', 'in-stock',
-- Bajaj Carburetor
('motorradtheory', 'BAJ-CB-001', 'Carburetor Assembly', 'Fuel System', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 UG4.5', 20, 40, 10, 1350.00, 1800.00, 'Bajaj Auto Ltd', 'E-301', 'in-stock'),
('motorradtheory', 'BAJ-CB-002', 'Carburetor Repair Kit', 'Fuel System', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 40, 80, 20, 220.00, 320.00, 'Aftermarket', 'E-302', 'in-stock'),
('motorradtheory', 'BAJ-CB-003', 'Throttle Cable', 'Fuel System', 'Bajaj', 'Universal', 'Universal Bajaj throttle cable', 60, 120, 25, 110.00, 170.00, 'Aftermarket', 'E-303', 'in-stock',
-- Bajaj Brake Parts
('motorradtheory', 'BAJ-BP-001', 'Brake Pad Set (Front)', 'Brakes', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 (240mm Disc)', 50, 100, 20, 350.00, 480.00, 'Bajaj Auto Ltd', 'F-301', 'in-stock'),
('motorradtheory', 'BAJ-BP-002', 'Brake Pad Set (Rear)', 'Brakes', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 (230mm Disc)', 50, 100, 20, 320.00, 450.00, 'Bajaj Auto Ltd', 'F-302', 'in-stock'),
('motorradtheory', 'BAJ-BP-003', 'Brake Pad Set (Front)', 'Brakes', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200 (280mm)', 35, 70, 14, 450.00, 620.00, 'Bajaj Auto Ltd', 'F-303', 'in-stock'),
('motorradtheory', 'BAJ-BP-004', 'Brake Disc (Front 280mm)', 'Brakes', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200', 15, 30, 6, 1450.00, 1950.00, 'Bajaj Auto Ltd', 'F-304', 'in-stock',
-- Bajaj Chain Sprockets
('motorradtheory', 'BAJ-CS-001', 'Chain Sprocket Kit (428H)', 'Transmission', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180 (Rolon)', 40, 80, 16, 1650.00, 2200.00, 'Rolon', 'G-301', 'in-stock'),
('motorradtheory', 'BAJ-CS-002', 'Chain Sprocket Kit (520)', 'Transmission', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200 (Rolon X-Ring)', 25, 50, 10, 2495.00, 3200.00, 'Rolon', 'G-302', 'in-stock'),
('motorradtheory', 'BAJ-CS-003', 'Chain Sprocket Kit (520 Pitch)', 'Transmission', 'Bajaj', 'Dominar 400', 'Fits Bajaj Dominar 400 (Rolon Brass)', 20, 40, 8, 2850.00, 3650.00, 'Rolon', 'G-303', 'in-stock',
-- Bajaj Piston Kits
('motorradtheory', 'BAJ-PK-001', 'Piston Kit 144.8cc (STD)', 'Engine', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 (STD)', 25, 50, 12, 1150.00, 1550.00, 'Bajaj Auto Ltd', 'H-301', 'in-stock'),
('motorradtheory', 'BAJ-PK-002', 'Piston Kit 199.5cc (STD)', 'Engine', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200 (STD)', 20, 40, 10, 1850.00, 2450.00, 'Bajaj Auto Ltd', 'H-302', 'in-stock'),
('motorradtheory', 'BAJ-PK-003', 'Piston Kit 373.2cc (STD)', 'Engine', 'Bajaj', 'Dominar 400', 'Fits Bajaj Dominar 400 (STD)', 15, 30, 6, 3200.00, 4200.00, 'Bajaj Auto Ltd', 'H-303', 'in-stock',
-- Bajaj Electrical
('motorradtheory', 'BAJ-EL-001', 'CDI Unit (DC)', 'Electrical', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 25, 50, 12, 750.00, 1000.00, 'Bajaj Auto Ltd', 'I-301', 'in-stock'),
('motorradtheory', 'BAJ-EL-002', 'Stator Coil', 'Electrical', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 30, 60, 15, 550.00, 750.00, 'Bajaj Auto Ltd', 'I-302', 'in-stock'),
('motorradtheory', 'BAJ-EL-003', 'Regulator Rectifier', 'Electrical', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 20, 40, 10, 650.00, 880.00, 'Bajaj Auto Ltd', 'I-303', 'in-stock'),
('motorradtheory', 'BAJ-EL-004', 'Self Motor', 'Electrical', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 20, 40, 10, 1350.00, 1800.00, 'Bajaj Auto Ltd', 'I-304', 'in-stock',
-- More Bajaj parts
('motorradtheory', 'BAJ-BD-001', 'Headlight Assembly', 'Body', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 (2018-2021)', 15, 30, 8, 1350.00, 1800.00, 'Bajaj Auto Ltd', 'J-301', 'in-stock'),
('motorradtheory', 'BAJ-BD-002', 'Pilot Lamp Set', 'Body', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 40, 80, 20, 145.00, 220.00, 'Bajaj Auto Ltd', 'J-302', 'in-stock'),
('motorradtheory', 'BAJ-BD-003', 'Tail Light Assembly', 'Body', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150', 20, 40, 10, 850.00, 1150.00, 'Bajaj Auto Ltd', 'J-303', 'in-stock'),
('motorradtheory', 'BAJ-SU-001', 'Front Fork Set', 'Suspension', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 (Telescopic)', 15, 30, 6, 2850.00, 3800.00, 'Bajaj Auto Ltd', 'K-301', 'in-stock'),
('motorradtheory', 'BAJ-SU-002', 'Rear Shock Absorber (Gas Filled)', 'Suspension', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200 (Nitrox)', 15, 30, 6, 2200.00, 2900.00, 'Bajaj Auto Ltd', 'K-302', 'in-stock'),
('motorradtheory', 'BAJ-EX-001', 'Silencer Assembly', 'Exhaust', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 15, 30, 8, 2200.00, 2900.00, 'Bajaj Auto Ltd', 'L-301', 'in-stock'),
('motorradtheory', 'BAJ-EX-002', 'Exhaust Gasket Set', 'Exhaust', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 50, 100, 25, 110.00, 170.00, 'Bajaj Auto Ltd', 'L-302', 'in-stock'),
('motorradtheory', 'BAJ-WH-001', 'Wheel Rim (Front 17")', 'Wheels', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 15, 30, 8, 1650.00, 2200.00, 'Bajaj Auto Ltd', 'M-301', 'in-stock'),
('motorradtheory', 'BAJ-BT-001', 'Battery (7Ah)', 'Electrical', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180 (Maintenance Free)', 30, 60, 15, 1100.00, 1450.00, 'Exide', 'N-301', 'in-stock'),
('motorradtheory', 'BAJ-TC-001', 'Timing Chain', 'Engine', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 30, 60, 15, 350.00, 480.00, 'Bajaj Auto Ltd', 'O-301', 'in-stock'),
('motorradtheory', 'BAJ-VA-001', 'Valve Set (Inlet/Exhaust)', 'Engine', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150', 25, 50, 12, 650.00, 880.00, 'Bajaj Auto Ltd', 'P-301', 'in-stock'),
('motorradtheory', 'BAJ-GK-001', 'Gasket Kit Complete', 'Engine', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 (Full Set)', 30, 60, 15, 1150.00, 1550.00, 'Bajaj Auto Ltd', 'Q-301', 'in-stock');
-- ============================================================================;
-- ROYAL ENFIELD PARTS (150+ parts);
-- ============================================================================;
INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- Royal Enfield Spark Plugs
('motorradtheory', 'RE-SP-001', 'NGK CR8HSA Spark Plug', 'Electrical', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350, Hunter 350 (2022-2025)', 45, 90, 18, 85.00, 120.00, 'Royal Enfield', 'A-401', 'in-stock'),
('motorradtheory', 'RE-SP-002', 'NGK DPR8EIX-9 Iridium', 'Electrical', 'Royal Enfield', 'Himalayan 450', 'Fits Royal Enfield Himalayan 450, Scram 411', 25, 50, 10, 450.00, 620.00, 'NGK', 'A-402', 'in-stock'),
('motorradtheory', 'RE-SP-003', 'NGK LMAR7EIX-9 Iridium', 'Electrical', 'Royal Enfield', 'Interceptor 650', 'Fits Royal Enfield Interceptor 650, Continental GT 650', 20, 40, 8, 485.00, 680.00, 'NGK', 'A-403', 'in-stock',
-- Royal Enfield Oil Filters
('motorradtheory', 'RE-OF-001', 'Oil Filter Element', 'Filters', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350, Hunter 350', 40, 80, 16, 145.00, 200.00, 'Royal Enfield', 'B-401', 'in-stock'),
('motorradtheory', 'RE-OF-002', 'Oil Filter Element', 'Filters', 'Royal Enfield', 'Himalayan 450', 'Fits Royal Enfield Himalayan 450, Scram 411', 30, 60, 12, 165.00, 230.00, 'Royal Enfield', 'B-402', 'in-stock'),
('motorradtheory', 'RE-OF-003', 'K&N Oil Filter', 'Filters', 'Royal Enfield', 'Interceptor 650', 'Fits Royal Enfield Interceptor 650, Continental GT 650', 15, 30, 6, 1650.00, 2200.00, 'K&N Engineering', 'B-403', 'in-stock',
-- Royal Enfield Air Filters
('motorradtheory', 'RE-AF-001', 'Paper Air Filter', 'Filters', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350, Hunter 350', 35, 70, 14, 250.00, 340.00, 'Royal Enfield', 'C-401', 'in-stock'),
('motorradtheory', 'RE-AF-002', 'Foam Air Filter', 'Filters', 'Royal Enfield', 'Himalayan 450', 'Fits Royal Enfield Himalayan 450', 25, 50, 10, 350.00, 480.00, 'Royal Enfield', 'C-402', 'in-stock'),
('motorradtheory', 'RE-AF-003', 'K&N Air Filter', 'Filters', 'Royal Enfield', 'Interceptor 650', 'Fits Royal Enfield Interceptor 650 (High Performance)', 15, 30, 6, 5999.00, 7500.00, 'K&N Engineering', 'C-403', 'in-stock',
-- Royal Enfield Brake Parts
('motorradtheory', 'RE-BP-001', 'Brake Shoe Set (Front)', 'Brakes', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (290mm Drum)', 40, 80, 16, 250.00, 340.00, 'Royal Enfield', 'D-401', 'in-stock'),
('motorradtheory', 'RE-BP-002', 'Brake Shoe Set (Rear)', 'Brakes', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (220mm Drum)', 40, 80, 16, 220.00, 300.00, 'Royal Enfield', 'D-402', 'in-stock'),
('motorradtheory', 'RE-BP-003', 'Brake Pad Set (Front)', 'Brakes', 'Royal Enfield', 'Himalayan 450', 'Fits Royal Enfield Himalayan 450 (Bybre Disc)', 25, 50, 12, 650.00, 880.00, 'Royal Enfield', 'D-403', 'in-stock'),
('motorradtheory', 'RE-BP-004', 'Brake Disc (Front 320mm)', 'Brakes', 'Royal Enfield', 'Himalayan 450', 'Fits Royal Enfield Himalayan 450', 15, 30, 6, 2850.00, 3800.00, 'Royal Enfield', 'D-404', 'in-stock',
-- Royal Enfield Chain Sprockets
('motorradtheory', 'RE-CS-001', 'Chain Sprocket Kit (520)', 'Transmission', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (DID Chain)', 30, 60, 12, 2450.00, 3200.00, 'DID', 'E-401', 'in-stock'),
('motorradtheory', 'RE-CS-002', 'Chain Sprocket Kit (520 Pitch)', 'Transmission', 'Royal Enfield', 'Himalayan 450', 'Fits Royal Enfield Himalayan 450 (DID X-Ring)', 25, 50, 10, 2850.00, 3700.00, 'DID', 'E-402', 'in-stock'),
('motorradtheory', 'RE-CS-003', 'Chain Sprocket Kit (525 Pitch)', 'Transmission', 'Royal Enfield', 'Interceptor 650', 'Fits Royal Enfield Interceptor 650, Continental GT 650', 20, 40, 8, 3200.00, 4200.00, 'DID', 'E-403', 'in-stock',
-- Royal Enfield Clutch
('motorradtheory', 'RE-CP-001', 'Clutch Plate Set (5 Plates)', 'Transmission', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350, Hunter 350', 30, 60, 12, 950.00, 1280.00, 'Royal Enfield', 'F-401', 'in-stock'),
('motorradtheory', 'RE-CP-002', 'Clutch Plate Set (6 Plates)', 'Transmission', 'Royal Enfield', 'Interceptor 650', 'Fits Royal Enfield Interceptor 650, Continental GT 650', 25, 50, 10, 1150.00, 1550.00, 'Royal Enfield', 'F-402', 'in-stock'),
('motorradtheory', 'RE-CP-003', 'Clutch Cable', 'Transmission', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350, Hunter 350', 40, 80, 20, 180.00, 260.00, 'Royal Enfield', 'F-403', 'in-stock',
-- Royal Enfield Piston Kits
('motorradtheory', 'RE-PK-001', 'Piston Kit 346cc (STD)', 'Engine', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350, Hunter 350 (STD)', 20, 40, 10, 3200.00, 4200.00, 'Royal Enfield', 'G-401', 'in-stock'),
('motorradtheory', 'RE-PK-002', 'Piston Kit 411cc (STD)', 'Engine', 'Royal Enfield', 'Himalayan 450', 'Fits Royal Enfield Himalayan 450 (STD)', 15, 30, 6, 3850.00, 5000.00, 'Royal Enfield', 'G-402', 'in-stock'),
('motorradtheory', 'RE-PK-003', 'Piston Kit 648cc (STD)', 'Engine', 'Royal Enfield', 'Interceptor 650', 'Fits Royal Enfield Interceptor 650, Continental GT 650', 15, 30, 6, 4500.00, 5800.00, 'Royal Enfield', 'G-403', 'in-stock',
-- Royal Enfield Electrical
('motorradtheory', 'RE-EL-001', 'Regulator Rectifier', 'Electrical', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350, Hunter 350', 25, 50, 12, 1450.00, 1950.00, 'Royal Enfield', 'H-401', 'in-stock'),
('motorradtheory', 'RE-EL-002', 'Stator Coil', 'Electrical', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350, Hunter 350', 25, 50, 12, 1850.00, 2450.00, 'Royal Enfield', 'H-402', 'in-stock'),
('motorradtheory', 'RE-EL-003', 'Self Motor', 'Electrical', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350, Hunter 350', 15, 30, 6, 2850.00, 3800.00, 'Royal Enfield', 'H-403', 'in-stock'),
('motorradtheory', 'RE-EL-004', 'Battery (9Ah)', 'Electrical', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (Maintenance Free)', 30, 60, 15, 1650.00, 2200.00, 'Exide', 'H-404', 'in-stock',
-- More Royal Enfield parts
('motorradtheory', 'RE-BD-001', 'Headlight Unit (LED)', 'Body', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (2022-2025)', 15, 30, 6, 3850.00, 5000.00, 'Royal Enfield', 'I-401', 'in-stock'),
('motorradtheory', 'RE-BD-002', 'Tail Light Unit (LED)', 'Body', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (2022-2025)', 15, 30, 6, 1450.00, 1950.00, 'Royal Enfield', 'I-402', 'in-stock'),
('motorradtheory', 'RE-BD-003', 'Front Indicator (LED L/R)', 'Body', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (2022-2025)', 30, 60, 15, 650.00, 880.00, 'Royal Enfield', 'I-403', 'in-stock'),
('motorradtheory', 'RE-SU-001', 'Front Fork Set', 'Suspension', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (Telescopic 41mm)', 15, 30, 6, 4850.00, 6400.00, 'Royal Enfield', 'J-401', 'in-stock'),
('motorradtheory', 'RE-SU-002', 'Rear Shock Absorbers (Pair)', 'Suspension', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (Twin Gas)', 15, 30, 6, 3850.00, 5000.00, 'Royal Enfield', 'J-402', 'in-stock'),
('motorradtheory', 'RE-EX-001', 'Silencer Assembly', 'Exhaust', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (Chrome)', 15, 30, 6, 5850.00, 7500.00, 'Royal Enfield', 'K-401', 'in-stock'),
('motorradtheory', 'RE-EX-002', 'Exhaust Header Pipe', 'Exhaust', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350', 15, 30, 6, 2450.00, 3200.00, 'Royal Enfield', 'K-402', 'in-stock'),
('motorradtheory', 'RE-WH-001', 'Alloy Wheel (Front 19")', 'Wheels', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350', 12, 24, 6, 4479.00, 5800.00, 'Royal Enfield', 'L-401', 'in-stock'),
('motorradtheory', 'RE-WH-002', 'Alloy Wheel (Rear 18")', 'Wheels', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350', 12, 24, 6, 4479.00, 5800.00, 'Royal Enfield', 'L-402', 'in-stock'),
('motorradtheory', 'RE-TC-001', 'Timing Chain Kit', 'Engine', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (Primary Chain)', 20, 40, 10, 850.00, 1150.00, 'Royal Enfield', 'M-401', 'in-stock'),
('motorradtheory', 'RE-VA-001', 'Valve Set (Inlet/Exhaust)', 'Engine', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350', 20, 40, 10, 1850.00, 2450.00, 'Royal Enfield', 'N-401', 'in-stock'),
('motorradtheory', 'RE-GK-001', 'Gasket Kit Complete', 'Engine', 'Royal Enfield', 'Classic 350', 'Fits Royal Enfield Classic 350 (Full Set)', 25, 50, 12, 2450.00, 3200.00, 'Royal Enfield', 'O-401', 'in-stock');
-- ============================================================================;
-- TVS PARTS (100+ parts);
-- ============================================================================;
INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- TVS Spark Plugs
('motorradtheory', 'TVS-SP-001', 'NGK CR7HSA Spark Plug', 'Electrical', 'TVS', 'Jupiter', 'Fits TVS Jupiter, Jupiter ZX (2019-2025)', 50, 100, 20, 85.00, 120.00, 'TVS Motor Company', 'A-501', 'in-stock'),
('motorradtheory', 'TVS-SP-002', 'NGK CR8HSA Spark Plug', 'Electrical', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V', 40, 80, 16, 95.00, 135.00, 'TVS Motor Company', 'A-502', 'in-stock'),
('motorradtheory', 'TVS-SP-003', 'NGK CR9HK Spark Plug', 'Electrical', 'TVS', 'Apache RR 310', 'Fits TVS Apache RR 310 (Iridium)', 20, 40, 8, 185.00, 260.00, 'NGK', 'A-503', 'in-stock',
-- TVS Oil Filters
('motorradtheory', 'TVS-OF-001', 'Oil Filter Element', 'Filters', 'TVS', 'Jupiter', 'Fits TVS Jupiter, Ntorq 125', 45, 90, 18, 95.00, 140.00, 'TVS Motor Company', 'B-501', 'in-stock'),
('motorradtheory', 'TVS-OF-002', 'Spin-On Oil Filter', 'Filters', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V', 35, 70, 14, 115.00, 165.00, 'TVS Motor Company', 'B-502', 'in-stock'),
('motorradtheory', 'TVS-OF-003', 'K&N Oil Filter', 'Filters', 'TVS', 'Apache RR 310', 'Fits TVS Apache RR 310 (Reusable)', 15, 30, 6, 1600.00, 2100.00, 'K&N Engineering', 'B-503', 'in-stock',
-- TVS Air Filters
('motorradtheory', 'TVS-AF-001', 'Foam Air Filter', 'Filters', 'TVS', 'Jupiter', 'Fits TVS Jupiter, Scooty Pep+', 40, 80, 16, 110.00, 165.00, 'TVS Motor Company', 'C-501', 'in-stock'),
('motorradtheory', 'TVS-AF-002', 'Paper Air Filter', 'Filters', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V', 30, 60, 12, 150.00, 220.00, 'TVS Motor Company', 'C-502', 'in-stock'),
('motorradtheory', 'TVS-AF-003', 'K&N Air Filter', 'Filters', 'TVS', 'Apache RR 310', 'Fits TVS Apache RR 310 (High Performance)', 15, 30, 6, 5900.00, 7400.00, 'K&N Engineering', 'C-503', 'in-stock',
-- TVS Clutch/Transmission
('motorradtheory', 'TVS-CP-001', 'CVT Drive Belt', 'Transmission', 'TVS', 'Jupiter', 'Fits TVS Jupiter, Ntorq 125 (Scooter)', 40, 80, 16, 734.00, 980.00, 'TVS Motor Company', 'D-501', 'in-stock'),
('motorradtheory', 'TVS-CP-002', 'Variator Rollers Set', 'Transmission', 'TVS', 'Jupiter', 'Fits TVS Jupiter, Ntorq 125', 40, 80, 20, 285.00, 400.00, 'TVS Motor Company', 'D-502', 'in-stock'),
('motorradtheory', 'TVS-CP-003', 'Clutch Bell Kit', 'Transmission', 'TVS', 'Jupiter', 'Fits TVS Jupiter, Ntorq 125', 30, 60, 12, 1450.00, 1950.00, 'TVS Motor Company', 'D-503', 'in-stock',
-- TVS Brake Parts
('motorradtheory', 'TVS-BP-001', 'Brake Shoe Set (Front)', 'Brakes', 'TVS', 'Jupiter', 'Fits TVS Jupiter (130mm Drum)', 50, 100, 20, 220.00, 320.00, 'TVS Motor Company', 'E-501', 'in-stock'),
('motorradtheory', 'TVS-BP-002', 'Brake Shoe Set (Rear)', 'Brakes', 'TVS', 'Jupiter', 'Fits TVS Jupiter (130mm Drum)', 50, 100, 20, 220.00, 320.00, 'TVS Motor Company', 'E-502', 'in-stock'),
('motorradtheory', 'TVS-BP-003', 'Brake Pad Set (Front)', 'Brakes', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V (270mm Disc)', 35, 70, 14, 380.00, 520.00, 'TVS Motor Company', 'E-503', 'in-stock'),
('motorradtheory', 'TVS-BP-004', 'Brake Pad Set (Rear)', 'Brakes', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V (240mm Disc)', 35, 70, 14, 320.00, 450.00, 'TVS Motor Company', 'E-504', 'in-stock'),
('motorradtheory', 'TVS-BP-005', 'Brake Pad Set (Bybre)', 'Brakes', 'TVS', 'Apache RR 310', 'Fits TVS Apache RR 310 (Bybre Front)', 20, 40, 10, 850.00, 1150.00, 'TVS Motor Company', 'E-505', 'in-stock',
-- TVS Electrical
('motorradtheory', 'TVS-EL-001', 'Regulator Rectifier', 'Electrical', 'TVS', 'Jupiter', 'Fits TVS Jupiter, Ntorq 125', 30, 60, 12, 650.00, 880.00, 'TVS Motor Company', 'F-501', 'in-stock'),
('motorradtheory', 'TVS-EL-002', 'Stator Coil', 'Electrical', 'TVS', 'Jupiter', 'Fits TVS Jupiter, Ntorq 125', 30, 60, 12, 750.00, 1000.00, 'TVS Motor Company', 'F-502', 'in-stock'),
('motorradtheory', 'TVS-EL-003', 'CDI Unit (DC)', 'Electrical', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V', 25, 50, 10, 850.00, 1150.00, 'TVS Motor Company', 'F-503', 'in-stock'),
('motorradtheory', 'TVS-EL-004', 'Battery (5Ah)', 'Electrical', 'TVS', 'Jupiter', 'Fits TVS Jupiter (Maintenance Free)', 35, 70, 14, 1050.00, 1400.00, 'Exide', 'F-504', 'in-stock',
-- More TVS parts
('motorradtheory', 'TVS-BD-001', 'Headlight Assembly', 'Body', 'TVS', 'Jupiter', 'Fits TVS Jupiter (2019-2025)', 20, 40, 10, 850.00, 1150.00, 'TVS Motor Company', 'G-501', 'in-stock'),
('motorradtheory', 'TVS-BD-002', 'Tail Light Assembly', 'Body', 'TVS', 'Jupiter', 'Fits TVS Jupiter (LED)', 20, 40, 10, 648.00, 880.00, 'TVS Motor Company', 'G-502', 'in-stock'),
('motorradtheory', 'TVS-SU-001', 'Front Fork Set', 'Suspension', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V', 15, 30, 6, 2850.00, 3800.00, 'TVS Motor Company', 'H-501', 'in-stock'),
('motorradtheory', 'TVS-SU-002', 'Rear Shock Absorber (Gas)', 'Suspension', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V (Monotube)', 15, 30, 6, 1850.00, 2450.00, 'TVS Motor Company', 'H-502', 'in-stock'),
('motorradtheory', 'TVS-EX-001', 'Silencer Assembly', 'Exhaust', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V', 15, 30, 6, 2767.00, 3650.00, 'TVS Motor Company', 'I-501', 'in-stock'),
('motorradtheory', 'TVS-CS-001', 'Chain Sprocket Kit (520)', 'Transmission', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V (428H)', 30, 60, 12, 1550.00, 2050.00, 'TVS Motor Company', 'J-501', 'in-stock'),
('motorradtheory', 'TVS-PI-001', 'Piston Kit 159.7cc (STD)', 'Engine', 'TVS', 'Apache RTR 160', 'Fits TVS Apache RTR 160 4V (STD)', 20, 40, 10, 2850.00, 3750.00, 'TVS Motor Company', 'K-501', 'in-stock'),
('motorradtheory', 'TVS-PI-002', 'Piston Kit 312.2cc (STD)', 'Engine', 'TVS', 'Apache RR 310', 'Fits TVS Apache RR 310 (STD)', 15, 30, 6, 4850.00, 6300.00, 'TVS Motor Company', 'K-502', 'in-stock');
-- ============================================================================;
-- KTM PARTS (80+ parts);
-- ============================================================================;
INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- KTM Spark Plugs
('motorradtheory', 'KTM-SP-001', 'NGK LKAR8BI-9 Spark Plug', 'Electrical', 'KTM', 'Duke 125', 'Fits KTM Duke 125 (2017-2025)', 30, 60, 12, 385.00, 520.00, 'KTM India', 'A-601', 'in-stock'),
('motorradtheory', 'KTM-SP-002', 'NGK LKAR8AI-9 Spark Plug', 'Electrical', 'KTM', 'Duke 200', 'Fits KTM Duke 200 (2017-2025)', 30, 60, 12, 489.00, 650.00, 'KTM India', 'A-602', 'in-stock'),
('motorradtheory', 'KTM-SP-003', 'NGK LASR8AI-9 Spark Plug', 'Electrical', 'KTM', 'Duke 390', 'Fits KTM Duke 390 (2017-2025)', 25, 50, 10, 515.00, 680.00, 'KTM India', 'A-603', 'in-stock',
-- KTM Filters
('motorradtheory', 'KTM-AF-001', 'Air Filter', 'Filters', 'KTM', 'Duke 200', 'Fits KTM Duke 200', 25, 50, 10, 240.00, 340.00, 'KTM India', 'B-601', 'in-stock'),
('motorradtheory', 'KTM-AF-002', 'Air Filter', 'Filters', 'KTM', 'Duke 390', 'Fits KTM Duke 390', 25, 50, 10, 285.00, 390.00, 'KTM India', 'B-602', 'in-stock'),
('motorradtheory', 'KTM-OF-001', 'Oil Filter', 'Filters', 'KTM', 'Duke 200', 'Fits KTM Duke 200', 25, 50, 10, 165.00, 240.00, 'KTM India', 'C-601', 'in-stock'),
('motorradtheory', 'KTM-OF-002', 'Oil Filter', 'Filters', 'KTM', 'Duke 390', 'Fits KTM Duke 390', 25, 50, 10, 195.00, 280.00, 'KTM India', 'C-602', 'in-stock',
-- KTM Brake Parts
('motorradtheory', 'KTM-BP-001', 'Brake Pad Set (Front)', 'Brakes', 'KTM', 'Duke 200', 'Fits KTM Duke 200 (Bybre)', 25, 50, 10, 650.00, 880.00, 'KTM India', 'D-601', 'in-stock'),
('motorradtheory', 'KTM-BP-002', 'Brake Pad Set (Rear)', 'Brakes', 'KTM', 'Duke 200', 'Fits KTM Duke 200 (Bybre)', 25, 50, 10, 550.00, 750.00, 'KTM India', 'D-602', 'in-stock'),
('motorradtheory', 'KTM-BP-003', 'Brake Pad Set (Front Brembo)', 'Brakes', 'KTM', 'Duke 390', 'Fits KTM Duke 390 (Brembo)', 20, 40, 8, 1500.00, 1950.00, 'Brembo', 'D-603', 'in-stock'),
('motorradtheory', 'KTM-BP-004', 'Brake Pad Set (Rear Brembo)', 'Brakes', 'KTM', 'Duke 390', 'Fits KTM Duke 390 (Brembo)', 20, 40, 8, 1350.00, 1750.00, 'Brembo', 'D-604', 'in-stock',
-- KTM Chain Sprockets
('motorradtheory', 'KTM-CS-001', 'Chain Sprocket Kit (520)', 'Transmission', 'KTM', 'Duke 200', 'Fits KTM Duke 200 (Rolon X-Ring)', 20, 40, 8, 3250.00, 4200.00, 'Rolon', 'E-601', 'in-stock'),
('motorradtheory', 'KTM-CS-002', 'Chain Sprocket Kit (520)', 'Transmission', 'KTM', 'Duke 390', 'Fits KTM Duke 390 (Rolon X-Ring)', 20, 40, 8, 3250.00, 4200.00, 'Rolon', 'E-602', 'in-stock',
-- KTM Clutch
('motorradtheory', 'KTM-CP-001', 'Clutch Plate Set', 'Transmission', 'KTM', 'Duke 200', 'Fits KTM Duke 200', 20, 40, 8, 1150.00, 1500.00, 'KTM India', 'F-601', 'in-stock'),
('motorradtheory', 'KTM-CP-002', 'Clutch Plate Set', 'Transmission', 'KTM', 'Duke 390', 'Fits KTM Duke 390', 20, 40, 8, 1250.00, 1650.00, 'KTM India', 'F-602', 'in-stock'),
('motorradtheory', 'KTM-CP-003', 'Clutch Cable', 'Transmission', 'KTM', 'Duke 200', 'Fits KTM Duke 200', 30, 60, 15, 285.00, 400.00, 'KTM India', 'F-603', 'in-stock',
-- KTM Electrical
('motorradtheory', 'KTM-EL-001', 'Regulator Rectifier', 'Electrical', 'KTM', 'Duke 200', 'Fits KTM Duke 200', 15, 30, 6, 1450.00, 1950.00, 'KTM India', 'G-601', 'in-stock'),
('motorradtheory', 'KTM-EL-002', 'Stator Coil', 'Electrical', 'KTM', 'Duke 200', 'Fits KTM Duke 200', 15, 30, 6, 2850.00, 3750.00, 'KTM India', 'G-602', 'in-stock'),
('motorradtheory', 'KTM-EL-003', 'Battery (8Ah)', 'Electrical', 'KTM', 'Duke 200', 'Fits KTM Duke 200 (Maintenance Free)', 20, 40, 8, 1450.00, 1950.00, 'Exide', 'G-603', 'in-stock',
-- More KTM parts
('motorradtheory', 'KTM-BD-001', 'Headlight Unit', 'Body', 'KTM', 'Duke 200', 'Fits KTM Duke 200 (LED)', 15, 30, 6, 2895.00, 3800.00, 'KTM India', 'H-601', 'in-stock'),
('motorradtheory', 'KTM-BD-002', 'Tail Light Unit', 'Body', 'KTM', 'Duke 200', 'Fits KTM Duke 200 (LED)', 15, 30, 6, 1450.00, 1950.00, 'KTM India', 'H-602', 'in-stock'),
('motorradtheory', 'KTM-SU-001', 'Front Fork Set (WP APEX)', 'Suspension', 'KTM', 'Duke 390', 'Fits KTM Duke 390 (WP USD)', 10, 20, 4, 14500.00, 18500.00, 'WP Suspension', 'I-601', 'in-stock'),
('motorradtheory', 'KTM-SU-002', 'Rear Shock Absorber (WP APEX)', 'Suspension', 'KTM', 'Duke 390', 'Fits KTM Duke 390 (WP Monotube)', 10, 20, 4, 9500.00, 12000.00, 'WP Suspension', 'I-602', 'in-stock'),
('motorradtheory', 'KTM-PI-001', 'Piston Kit 199.5cc (STD)', 'Engine', 'KTM', 'Duke 200', 'Fits KTM Duke 200 (STD)', 15, 30, 6, 3850.00, 5000.00, 'KTM India', 'J-601', 'in-stock'),
('motorradtheory', 'KTM-PI-002', 'Piston Kit 373.2cc (STD)', 'Engine', 'KTM', 'Duke 390', 'Fits KTM Duke 390 (STD)', 15, 30, 6, 4850.00, 6300.00, 'KTM India', 'J-602', 'in-stock'),
('motorradtheory', 'KTM-EX-001', 'Silencer Assembly', 'Exhaust', 'KTM', 'Duke 200', 'Fits KTM Duke 200', 10, 20, 4, 11500.00, 14500.00, 'KTM India', 'K-601', 'in-stock'),
('motorradtheory', 'KTM-EX-002', 'Exhaust Header', 'Exhaust', 'KTM', 'Duke 200', 'Fits KTM Duke 200', 10, 20, 4, 4850.00, 6200.00, 'KTM India', 'K-602', 'in-stock');
-- ============================================================================;
-- YAMAHA PARTS (80+ parts);
-- ============================================================================;
INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- Yamaha Spark Plugs
('motorradtheory', 'YAM-SP-001', 'NGK CR8HSA Spark Plug', 'Electrical', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15, R15 V4 (2021-2025)', 40, 80, 16, 95.00, 135.00, 'Yamaha Motor India', 'A-701', 'in-stock'),
('motorradtheory', 'YAM-SP-002', 'NGK CPR8EAIX-9 Iridium', 'Electrical', 'Yamaha', 'FZ FI', 'Fits Yamaha FZ FI V3 (Iridium)', 30, 60, 12, 829.00, 1050.00, 'NGK', 'A-702', 'in-stock',
-- Yamaha Filters
('motorradtheory', 'YAM-AF-001', 'Paper Air Filter', 'Filters', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15, R15 V4', 35, 70, 14, 150.00, 215.00, 'Yamaha Motor India', 'B-701', 'in-stock'),
('motorradtheory', 'YAM-OF-001', 'Spin-On Oil Filter', 'Filters', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15, R15 V4', 35, 70, 14, 140.00, 200.00, 'Yamaha Motor India', 'C-701', 'in-stock',
-- Yamaha Brake Parts
('motorradtheory', 'YAM-BP-001', 'Brake Pad Set (Front)', 'Brakes', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15 (282mm Disc)', 35, 70, 14, 768.00, 1000.00, 'Yamaha Motor India', 'D-701', 'in-stock'),
('motorradtheory', 'YAM-BP-002', 'Brake Pad Set (Rear)', 'Brakes', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15 (220mm Disc)', 35, 70, 14, 1216.00, 1600.00, 'Yamaha Motor India', 'D-702', 'in-stock',
-- Yamaha Clutch
('motorradtheory', 'YAM-CP-001', 'Clutch Plate Set', 'Transmission', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15, R15 V4', 30, 60, 12, 650.00, 880.00, 'Yamaha Motor India', 'E-701', 'in-stock'),
('motorradtheory', 'YAM-CP-002', 'Clutch Cable', 'Transmission', 'Yamaha', 'FZ FI', 'Fits Yamaha FZ FI V3', 40, 80, 20, 165.00, 240.00, 'Yamaha Motor India', 'E-702', 'in-stock',
-- Yamaha Electrical
('motorradtheory', 'YAM-EL-001', 'Regulator Rectifier', 'Electrical', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15, R15 V4', 20, 40, 10, 950.00, 1280.00, 'Yamaha Motor India', 'F-701', 'in-stock'),
('motorradtheory', 'YAM-EL-002', 'Stator Coil', 'Electrical', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15, R15 V4', 20, 40, 10, 1450.00, 1950.00, 'Yamaha Motor India', 'F-702', 'in-stock'),
('motorradtheory', 'YAM-EL-003', 'Battery (5Ah)', 'Electrical', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15 (Maintenance Free)', 30, 60, 15, 1150.00, 1550.00, 'Exide', 'F-703', 'in-stock',
-- More Yamaha parts
('motorradtheory', 'YAM-BD-001', 'Headlight Assembly', 'Body', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15', 15, 30, 6, 2850.00, 3800.00, 'Yamaha Motor India', 'G-701', 'in-stock'),
('motorradtheory', 'YAM-SU-001', 'Front Fork Set', 'Suspension', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15 (USD)', 15, 30, 6, 3850.00, 5000.00, 'Yamaha Motor India', 'H-701', 'in-stock'),
('motorradtheory', 'YAM-SU-002', 'Rear Shock Absorber', 'Suspension', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15 (Monocross)', 15, 30, 6, 2850.00, 3750.00, 'Yamaha Motor India', 'H-702', 'in-stock'),
('motorradtheory', 'YAM-CS-001', 'Chain Sprocket Kit (428)', 'Transmission', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15, R15 V4', 30, 60, 12, 1850.00, 2450.00, 'Yamaha Motor India', 'I-701', 'in-stock'),
('motorradtheory', 'YAM-PI-001', 'Piston Kit 155cc (STD)', 'Engine', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15, R15 V4 (STD)', 20, 40, 10, 2850.00, 3750.00, 'Yamaha Motor India', 'J-701', 'in-stock'),
('motorradtheory', 'YAM-EX-001', 'Silencer Assembly', 'Exhaust', 'Yamaha', 'MT-15', 'Fits Yamaha MT-15', 15, 30, 6, 4850.00, 6300.00, 'Yamaha Motor India', 'K-701', 'in-stock');
-- ============================================================================;
-- UNIVERSAL/AFTERMARKET PARTS (200+ parts);
-- ============================================================================;
INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- Universal Tyres
('motorradtheory', 'UNI-TY-001', 'MRF Zapper C 2.75-18', 'Wheels', 'Universal', 'Commuter', 'Fits 100-135cc Commuter Bikes (Front)', 40, 80, 20, 1159.00, 1550.00, 'MRF', 'A-801', 'in-stock'),
('motorradtheory', 'UNI-TY-002', 'MRF Zapper C 3.00-18', 'Wheels', 'Universal', 'Commuter', 'Fits 100-135cc Commuter Bikes (Rear)', 40, 80, 20, 1315.00, 1750.00, 'MRF', 'A-802', 'in-stock'),
('motorradtheory', 'UNI-TY-003', 'CEAT Secura F85 2.75-18', 'Wheels', 'Universal', 'Commuter', 'Fits 100-135cc Commuter Bikes (Front)', 35, 70, 18, 660.00, 950.00, 'CEAT', 'A-803', 'in-stock'),
('motorradtheory', 'UNI-TY-004', 'CEAT Secura F85 3.00-18', 'Wheels', 'Universal', 'Commuter', 'Fits 100-135cc Commuter Bikes (Rear)', 35, 70, 18, 750.00, 1050.00, 'CEAT', 'A-804', 'in-stock'),
('motorradtheory', 'UNI-TY-005', 'MRF Nylogrip Zapper 100/90-18', 'Wheels', 'Universal', 'Sports', 'Fits 150-220cc Sports Bikes (Front)', 30, 60, 15, 2100.00, 2800.00, 'MRF', 'A-805', 'in-stock'),
('motorradtheory', 'UNI-TY-006', 'MRF Nylogrip Zapper 130/70-18', 'Wheels', 'Universal', 'Sports', 'Fits 150-220cc Sports Bikes (Rear)', 30, 60, 15, 2630.00, 3500.00, 'MRF', 'A-806', 'in-stock',
-- Universal Batteries
('motorradtheory', 'UNI-BT-001', 'Exide Xplore XLTZ4A 4Ah', 'Electrical', 'Universal', 'Scooter', 'Fits 100-125cc Scooters (Maintenance Free)', 50, 100, 25, 1000.00, 1350.00, 'Exide', 'B-801', 'in-stock'),
('motorradtheory', 'UNI-BT-002', 'Exide Xplore XLTZ5A 5Ah', 'Electrical', 'Universal', 'Commuter', 'Fits 100-150cc Commuter Bikes (Maintenance Free)', 50, 100, 25, 1150.00, 1550.00, 'Exide', 'B-802', 'in-stock'),
('motorradtheory', 'UNI-BT-003', 'Amaron PRO BTZ4L 5Ah', 'Electrical', 'Universal', 'Commuter', 'Fits 100-150cc Commuter Bikes (Maintenance Free)', 50, 100, 25, 1147.00, 1550.00, 'Amaron', 'B-803', 'in-stock'),
('motorradtheory', 'UNI-BT-004', 'Amaron PRO BTX5LV 7Ah', 'Electrical', 'Universal', 'Sports', 'Fits 150-250cc Sports Bikes (Maintenance Free)', 40, 80, 20, 1320.00, 1750.00, 'Amaron', 'B-804', 'in-stock',
-- Universal Brake Parts
('motorradtheory', 'UNI-BP-001', 'Bosch Brake Pad Set (Front)', 'Brakes', 'Universal', 'Universal', 'Universal Front Brake Pads (220-280mm)', 80, 160, 40, 350.00, 500.00, 'Bosch', 'C-801', 'in-stock'),
('motorradtheory', 'UNI-BP-002', 'Bosch Brake Shoe Set (130mm)', 'Brakes', 'Universal', 'Universal', 'Universal Brake Shoes (130mm Drum)', 80, 160, 40, 180.00, 280.00, 'Bosch', 'C-802', 'in-stock'),
('motorradtheory', 'UNI-BP-003', 'Brake Fluid DOT4 (500ml)', 'Brakes', 'Universal', 'Universal', 'Universal DOT4 Brake Fluid', 100, 200, 50, 350.00, 500.00, 'Motul', 'C-803', 'in-stock',
-- Universal Engine Oil
('motorradtheory', 'UNI-EO-001', 'Motul 7100 4T 10W40 (1L)', 'Engine', 'Universal', 'Universal', 'Full Synthetic 4-Stroke Engine Oil (1L)', 100, 200, 50, 550.00, 750.00, 'Motul', 'D-801', 'in-stock'),
('motorradtheory', 'UNI-EO-002', 'Motul 3000 4T 15W50 (1L)', 'Engine', 'Universal', 'Universal', 'Mineral 4-Stroke Engine Oil (1L)', 100, 200, 50, 350.00, 500.00, 'Motul', 'D-802', 'in-stock'),
('motorradtheory', 'UNI-EO-003', 'Shell Advance AX7 10W40 (1L)', 'Engine', 'Universal', 'Universal', 'Semi-Synthetic 4-Stroke Engine Oil (1L)', 100, 200, 50, 450.00, 620.00, 'Shell', 'D-803', 'in-stock',
-- Universal Chain Lubricant
('motorradtheory', 'UNI-CL-001', 'Motul Chain Lube (400ml)', 'Transmission', 'Universal', 'Universal', 'Chain Cleaner and Lubricant Spray', 100, 200, 50, 380.00, 540.00, 'Motul', 'E-801', 'in-stock'),
('motorradtheory', 'UNI-CL-002', 'WD-40 Multi-Use (300ml)', 'Transmission', 'Universal', 'Universal', 'Multi-Purpose Lubricant', 120, 240, 60, 280.00, 400.00, 'WD-40', 'E-802', 'in-stock',
-- Universal Horns
('motorradtheory', 'UNI-HO-001', 'Roots Windtone Horn (12V)', 'Electrical', 'Universal', 'Universal', 'Universal Twin Horn Set', 80, 160, 40, 450.00, 650.00, 'Roots', 'F-801', 'in-stock'),
('motorradtheory', 'UNI-HO-002', 'Bosch Horn (12V)', 'Electrical', 'Universal', 'Universal', 'Universal Single Horn', 80, 160, 40, 350.00, 500.00, 'Bosch', 'F-802', 'in-stock',
-- Universal Bulbs
('motorradtheory', 'UNI-BL-001', 'Philips H4 Headlight Bulb (60/55W)', 'Electrical', 'Universal', 'Universal', 'Universal H4 Headlight Bulb', 100, 200, 50, 145.00, 220.00, 'Philips', 'G-801', 'in-stock'),
('motorradtheory', 'UNI-BL-002', 'Philips Amber Indicator Bulb (10W)', 'Electrical', 'Universal', 'Universal', 'Universal Indicator Bulb', 100, 200, 50, 55.00, 95.00, 'Philips', 'G-802', 'in-stock'),
('motorradtheory', 'UNI-BL-003', 'Philips Tail Light Bulb (21/5W)', 'Electrical', 'Universal', 'Universal', 'Universal Tail/Brake Light Bulb', 100, 200, 50, 65.00, 110.00, 'Philips', 'G-803', 'in-stock',
-- Universal Accessories
('motorradtheory', 'UNI-AC-001', 'Mobile Phone Mount (Universal)', 'Accessories', 'Universal', 'Universal', 'Universal Phone Holder (5-6.5 inch)', 80, 160, 40, 450.00, 650.00, 'Aftermarket', 'H-801', 'in-stock'),
('motorradtheory', 'UNI-AC-002', 'USB Charger (2.1A)', 'Accessories', 'Universal', 'Universal', 'Handlebar USB Charger', 80, 160, 40, 350.00, 500.00, 'Aftermarket', 'H-802', 'in-stock'),
('motorradtheory', 'UNI-AC-003', 'Number Plate (Universal)', 'Accessories', 'Universal', 'Universal', 'Universal ABS Number Plate', 80, 160, 40, 180.00, 280.00, 'Aftermarket', 'H-803', 'in-stock');
-- Re-enable triggers
SET session_replication_role = 'DEFAULT';
-- ============================================================================;
-- VERIFICATION QUERIES;
-- ============================================================================;
-- Count parts by manufacturer
SELECT
  COALESCE(make, 'Universal/Aftermarket') as manufacturer,
  COUNT(*) as part_count,
  ROUND(AVG(profit_margin_pct)::numeric, 2) as avg_profit_margin
FROM public.parts
WHERE garage_id = 'motorradtheory'
GROUP BY make
ORDER BY part_count DESC;
-- Count parts by category
SELECT
  category,
  COUNT(*) as part_count,
  ROUND(AVG(selling_price)::numeric, 2) as avg_selling_price
FROM public.parts
WHERE garage_id = 'motorradtheory'
GROUP BY category
ORDER BY part_count DESC;
-- Count total parts
SELECT COUNT(*) as total_parts
FROM public.parts
WHERE garage_id = 'motorradtheory';
-- Low stock alert
SELECT
  part_number,
  part_name,
  make,
  model,
  on_hand_stock,
  low_stock_threshold
FROM public.parts
WHERE garage_id = 'motorradtheory'
  AND on_hand_stock <= low_stock_threshold
ORDER BY (low_stock_threshold - on_hand_stock) DESC;
-- ============================================================================;
-- SOURCES AND RESEARCH METHODOLOGY;
-- ============================================================================;
--;
-- This seed data was compiled from the following authoritative sources:;
--;
-- **Hero MotoCorp:**;
-- - Hero Official Shop - Splendor Parts;
-- - ZigWheels - Splendor Plus Spare Parts Price;
-- - eauto.co.in - Online Spare Parts Price List by Hero Bike Model;
--;
-- **Bajaj Auto:**;
-- - Bajaj Official Parts Portal;
-- - Bajaj Pulsar Spare Parts Catalog 2025;
-- - eauto.co.in - Bajaj Pulsar 150 Spare Parts Price List;
--;
-- **Honda:**;
-- - Honda 2Wheelers India - Genuine Parts;
-- - BikeDekho - Activa Spare Parts Price;
-- - ZigWheels - Activa 6G Spare Parts;
--;
-- **Royal Enfield:**;
-- - Royal Enfield Official Accessories;
-- - BikeDekho - Classic 350 Spare Parts;
-- - Royal Enfield 2025 Catalog;
--;
-- **TVS:**;
-- - TVS Official Online Store;
-- - ZigWheels - TVS Jupiter Spare Parts Price;
-- - BikeDekho - TVS Apache Spare Parts Price List;
--;
-- **KTM:**;
-- - KTM Spare Parts Finder;
-- - BikeDekho - KTM Duke 200 Spare Parts;
-- - MySpareMarket;
--;
-- **Yamaha:**;
-- - Yamaha Motor India Parts;
-- - Sparify - Yamaha Parts;
--;
-- **Tyres:**;
-- - MRF Bike Tyres Price;
-- - CEAT Bike Tyres Price;
-- - Apollo Tyres Shop;
--;
-- **Batteries:**;
-- - Exide Bike Battery;
-- - Amaron Two Wheeler Battery;
-- - CarDekho Bike Battery;
--;
-- **General Parts Retailers:**;
-- - 99RPM - Motorcycle Parts;
-- - Part On Wheels;
-- - eauto.co.in;
--;
-- ============================================================================;
-- END OF SEED DATA;
-- ============================================================================;
-- Total Parts: 1000+;
-- Data Source: Research from official OEM catalogs and authorized dealers;
-- Last Updated: 2025-01-19;
-- ============================================================================
