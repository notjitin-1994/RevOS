-- ============================================================================
-- MOTORCYCLE PARTS SEED DATA FOR INDIAN MARKET
-- Garage ID: c9f656e3-bbac-454a-9b36-c646bcaf6c39
-- ============================================================================

-- Disable triggers for faster insert
SET session_replication_role = 'replica';

-- Hero MotoCorp Parts
INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- Hero Spark Plugs
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-SP-001', 'NGK CR9HSA Spark Plug', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe, Passion Pro (2018-2025)', 50, 100, 15, 85.00, 120.00, 'Hero MotoCorp Ltd', 'A-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-SP-002', 'Bosch UR4AC Spark Plug', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, CD Dawn (2015-2025)', 45, 90, 15, 65.00, 95.00, 'Bosch India', 'A-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-SP-003', 'NGK Iridium Spark Plug', 'Electrical', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200 (2020-2025)', 30, 60, 10, 380.00, 550.00, 'Hero MotoCorp Ltd', 'A-103', 'in-stock'),

-- Hero Oil Filters
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-OF-001', 'Screen Oil Filter', 'Filters', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe, Passion Pro (2018-2025)', 60, 120, 20, 75.00, 110.00, 'Hero MotoCorp Ltd', 'B-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-OF-002', 'Cartridge Oil Filter', 'Filters', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200 (2020-2025)', 40, 80, 15, 120.00, 175.00, 'Hero MotoCorp Ltd', 'B-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-OF-003', 'Oil Filter O-Ring Kit', 'Filters', 'Hero', 'Universal', 'Universal Hero O-ring seal kit', 80, 160, 30, 35.00, 60.00, 'Aftermarket', 'B-103', 'in-stock'),

-- Hero Air Filters
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-AF-001', 'Foam Air Filter', 'Filters', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (2018-2025)', 55, 110, 20, 45.00, 75.00, 'Hero MotoCorp Ltd', 'C-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-AF-002', 'Paper Air Filter', 'Filters', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (2020-2025)', 35, 70, 15, 85.00, 130.00, 'Hero MotoCorp Ltd', 'C-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-AF-003', 'K&N High Performance Air Filter', 'Filters', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200 (Reusable)', 25, 50, 10, 2800.00, 3500.00, 'K&N Engineering', 'C-103', 'in-stock'),

-- Hero Clutch Plates
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-CP-001', 'Clutch Plate Set (4 Plates)', 'Transmission', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe, Passion Pro', 40, 80, 15, 550.00, 750.00, 'Hero MotoCorp Ltd', 'D-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-CP-002', 'Clutch Plate Set (5 Plates)', 'Transmission', 'Hero', 'Super Splendor', 'Fits Hero Super Splendor (2018-2025)', 35, 70, 15, 620.00, 850.00, 'Hero MotoCorp Ltd', 'D-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-CP-003', 'Clutch Centre Kit', 'Transmission', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200', 25, 50, 10, 950.00, 1300.00, 'Hero MotoCorp Ltd', 'D-103', 'in-stock'),

-- Hero Carburetors
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-CB-001', 'Carburetor Assembly', 'Fuel System', 'Hero', 'Splendor+ Xtec', 'Fits Hero Splendor+ Xtec (2023-2025)', 20, 40, 10, 1450.00, 1800.00, 'Hero MotoCorp Ltd', 'E-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-CB-002', 'Carburetor Assembly', 'Fuel System', 'Hero', 'HF Deluxe', 'Fits Hero HF Deluxe, CD Dawn', 25, 50, 10, 1350.00, 1700.00, 'Hero MotoCorp Ltd', 'E-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-CB-003', 'Carburetor Repair Kit', 'Fuel System', 'Hero', 'Universal', 'Universal Hero carburetor gasket and jet kit', 50, 100, 20, 180.00, 280.00, 'Aftermarket', 'E-103', 'in-stock'),

-- Hero Brake Parts
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BP-001', 'Brake Shoe Set (Front)', 'Brakes', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (Drum Brake)', 60, 120, 20, 150.00, 220.00, 'Hero MotoCorp Ltd', 'F-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BP-002', 'Brake Shoe Set (Rear)', 'Brakes', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (Drum Brake)', 60, 120, 20, 150.00, 220.00, 'Hero MotoCorp Ltd', 'F-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BP-003', 'Brake Pad Set (Front)', 'Brakes', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (Disc Brake)', 40, 80, 15, 350.00, 500.00, 'Hero MotoCorp Ltd', 'F-103', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BP-004', 'Brake Pad Set (Rear)', 'Brakes', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (Disc Brake)', 40, 80, 15, 320.00, 450.00, 'Hero MotoCorp Ltd', 'F-104', 'in-stock'),

-- Hero Piston Kits
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-PK-001', 'Piston Kit 97cc (STD)', 'Engine', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (97cc STD)', 30, 60, 15, 850.00, 1200.00, 'Hero MotoCorp Ltd', 'G-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-PK-002', 'Piston Kit 97cc (0.50 Oversize)', 'Engine', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (97cc +0.50mm)', 25, 50, 12, 950.00, 1350.00, 'Hero MotoCorp Ltd', 'G-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-PK-003', 'Piston Kit 160cc (STD)', 'Engine', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (160cc STD)', 20, 40, 10, 1850.00, 2500.00, 'Hero MotoCorp Ltd', 'G-103', 'in-stock'),

-- Hero Chain Sprockets
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-CS-001', 'Chain Sprocket Kit (428H)', 'Transmission', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe, Passion Pro', 45, 90, 15, 950.00, 1300.00, 'Rockman', 'H-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-CS-002', 'Chain Sprocket Kit (520)', 'Transmission', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200', 30, 60, 12, 1450.00, 1950.00, 'Rockman', 'H-102', 'in-stock'),

-- Hero Electrical Parts
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-EL-001', 'CDI Unit (DC)', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+ (2018-2025)', 25, 50, 10, 650.00, 900.00, 'Hero MotoCorp Ltd', 'I-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-EL-002', 'Stator Coil', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 30, 60, 12, 450.00, 650.00, 'Hero MotoCorp Ltd', 'I-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-EL-003', 'Rectifier Regulator', 'Electrical', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200', 20, 40, 10, 550.00, 780.00, 'Hero MotoCorp Ltd', 'I-103', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-EL-004', 'Self Motor', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 20, 40, 8, 1150.00, 1550.00, 'Hero MotoCorp Ltd', 'I-104', 'in-stock'),

-- Hero Body Parts
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BD-001', 'Headlight Assembly (Without Bulb)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+ (2018-2025)', 20, 40, 10, 750.00, 1050.00, 'Hero MotoCorp Ltd', 'J-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BD-002', 'Tail Light Assembly', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 25, 50, 10, 380.00, 550.00, 'Hero MotoCorp Ltd', 'J-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BD-003', 'Indicator (Front L/R)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 50, 100, 20, 145.00, 220.00, 'Hero MotoCorp Ltd', 'J-103', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BD-004', 'Indicator (Rear L/R)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 50, 100, 20, 145.00, 220.00, 'Hero MotoCorp Ltd', 'J-104', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BD-005', 'Fuel Tank Cap', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 30, 60, 15, 280.00, 400.00, 'Hero MotoCorp Ltd', 'J-105', 'in-stock'),

-- Hero Suspension
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-SU-001', 'Front Shock Absorber (Left)', 'Suspension', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 20, 40, 10, 850.00, 1200.00, 'Hero MotoCorp Ltd', 'K-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-SU-002', 'Front Shock Absorber (Right)', 'Suspension', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 20, 40, 10, 850.00, 1200.00, 'Hero MotoCorp Ltd', 'K-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-SU-003', 'Rear Shock Absorber', 'Suspension', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 20, 40, 10, 950.00, 1350.00, 'Hero MotoCorp Ltd', 'K-103', 'in-stock'),

-- More Hero parts
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-MI-001', 'Speedometer Assembly (Analog)', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+ (2018-2021)', 15, 30, 8, 550.00, 780.00, 'Hero MotoCorp Ltd', 'L-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-MI-002', 'Speedometer Assembly (Digital)', 'Electrical', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R, XPulse 200', 15, 30, 8, 1450.00, 1950.00, 'Hero MotoCorp Ltd', 'L-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-HO-001', 'Handle Bar', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 25, 50, 15, 450.00, 650.00, 'Hero MotoCorp Ltd', 'M-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-HO-002', 'Handle Grip (L/R)', 'Body', 'Hero', 'Universal', 'Universal rubber grip set', 80, 160, 30, 85.00, 130.00, 'Aftermarket', 'M-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-FO-001', 'Footpeg (Front L/R)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 40, 80, 20, 180.00, 280.00, 'Hero MotoCorp Ltd', 'N-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-FO-002', 'Footpeg (Rear L/R)', 'Body', 'Hero', 'Splendor+', 'Fits Hero Splendor+ (Passenger)', 40, 80, 20, 220.00, 320.00, 'Hero MotoCorp Ltd', 'N-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-EX-001', 'Silencer Assembly', 'Exhaust', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 15, 30, 8, 1450.00, 1950.00, 'Hero MotoCorp Ltd', 'O-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-EX-002', 'Exhaust Gasket Set', 'Exhaust', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 60, 120, 25, 95.00, 150.00, 'Hero MotoCorp Ltd', 'O-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-WH-001', 'Wheel Rim (Front 18")', 'Wheels', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 15, 30, 8, 1150.00, 1600.00, 'Hero MotoCorp Ltd', 'P-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-WH-002', 'Wheel Rim (Rear 18")', 'Wheels', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe', 15, 30, 8, 1250.00, 1750.00, 'Hero MotoCorp Ltd', 'P-102', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BT-001', 'Battery (5Ah)', 'Electrical', 'Hero', 'Splendor+', 'Fits Hero Splendor+, HF Deluxe (Maintenance Free)', 30, 60, 15, 950.00, 1300.00, 'Exide', 'Q-101', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HERO-BT-002', 'Battery (7Ah)', 'Electrical', 'Hero', 'Xtreme 160R', 'Fits Hero Xtreme 160R (Maintenance Free)', 25, 50, 12, 1150.00, 1550.00, 'Exide', 'Q-102', 'in-stock'),

-- ============================================================================
-- HONDA PARTS (150+ parts)
-- ============================================================================

INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- Honda Spark Plugs
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-SP-001', 'NGK CR6HSA Spark Plug', 'Electrical', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (2019-2025)', 60, 120, 20, 85.00, 120.00, 'Honda 2Wheelers', 'A-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-SP-002', 'NGK CR8E Spark Plug', 'Electrical', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125 (2019-2025)', 50, 100, 18, 95.00, 135.00, 'Honda 2Wheelers', 'A-202', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-SP-003', 'NGK LMAR8E-9 Spark Plug', 'Electrical', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R, CB 300R (Iridium)', 20, 40, 8, 485.00, 650.00, 'NGK', 'A-203', 'in-stock'),

-- Honda Oil Filters
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-OF-001', 'Oil Filter Element', 'Filters', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (2019-2025)', 55, 110, 20, 110.00, 160.00, 'Honda 2Wheelers', 'B-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-OF-002', 'Spin-On Oil Filter', 'Filters', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 160', 45, 90, 18, 140.00, 200.00, 'Honda 2Wheelers', 'B-202', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-OF-003', 'K&N Oil Filter', 'Filters', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R, CB 1000RR (Reusable)', 15, 30, 6, 1600.00, 2100.00, 'K&N Engineering', 'B-203', 'in-stock'),

-- Honda Air Filters
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-AF-001', 'Paper Air Filter', 'Filters', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (2019-2025)', 50, 100, 20, 130.00, 190.00, 'Honda 2Wheelers', 'C-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-AF-002', 'Foam Air Filter', 'Filters', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125', 40, 80, 16, 110.00, 165.00, 'Honda 2Wheelers', 'C-202', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-AF-003', 'K&N Air Filter', 'Filters', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R (High Performance)', 15, 30, 6, 5800.00, 7200.00, 'K&N Engineering', 'C-203', 'in-stock'),

-- Honda Clutch Parts
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-CP-001', 'Clutch Plate Set', 'Transmission', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 160', 35, 70, 14, 276.00, 380.00, 'Honda 2Wheelers', 'D-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-CP-002', 'CVT Belt (Drive Belt)', 'Transmission', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Scooter)', 40, 80, 16, 650.00, 880.00, 'Honda 2Wheelers', 'D-202', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-CP-003', 'Clutch Bell Kit', 'Transmission', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Scooter)', 30, 60, 12, 1450.00, 1950.00, 'Honda 2Wheelers', 'D-203', 'in-stock'),

-- Honda Fuel Injection
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-FI-001', 'Fuel Injector Assembly', 'Fuel System', 'Honda', 'CB Shine', 'Fits Honda CB Shine FI, SP 160 FI', 20, 40, 8, 2200.00, 2900.00, 'Honda 2Wheelers', 'E-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-FI-002', 'Fuel Pump Module', 'Fuel System', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R', 15, 30, 6, 4500.00, 5800.00, 'Honda 2Wheelers', 'E-202', 'in-stock'),

-- Honda Brake Parts
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-BP-001', 'Brake Pad Set (Front)', 'Brakes', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Disc)', 50, 100, 20, 380.00, 520.00, 'Honda 2Wheelers', 'F-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-BP-002', 'Brake Shoe Set (Rear)', 'Brakes', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Drum)', 50, 100, 20, 280.00, 380.00, 'Honda 2Wheelers', 'F-202', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-BP-003', 'Brake Pad Set (Front)', 'Brakes', 'Honda', 'CB Shine', 'Fits Honda CB Shine (Disc)', 40, 80, 16, 320.00, 450.00, 'Honda 2Wheelers', 'F-203', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-BP-004', 'Brake Disc (Front 240mm)', 'Brakes', 'Honda', 'CBR 650R', 'Fits Honda CBR 650R', 15, 30, 6, 2200.00, 2950.00, 'Honda 2Wheelers', 'F-204', 'in-stock'),

-- Honda Electrical
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-EL-001', 'Battery (5Ah)', 'Electrical', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio (Maintenance Free)', 40, 80, 16, 1549.00, 2000.00, 'Exide', 'I-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-EL-002', 'Self Motor', 'Electrical', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio', 25, 50, 10, 1643.00, 2150.00, 'Honda 2Wheelers', 'I-202', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-EL-003', 'CDI Unit', 'Electrical', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125', 30, 60, 12, 850.00, 1150.00, 'Honda 2Wheelers', 'I-203', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-EL-004', 'Stator Coil', 'Electrical', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125', 35, 70, 14, 650.00, 880.00, 'Honda 2Wheelers', 'I-204', 'in-stock'),

-- Honda Body Parts
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-BD-001', 'Headlight Assembly', 'Body', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G (2019-2025)', 20, 40, 10, 1450.00, 1950.00, 'Honda 2Wheelers', 'J-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-BD-002', 'Tail Light Assembly', 'Body', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G, Dio', 25, 50, 12, 750.00, 1000.00, 'Honda 2Wheelers', 'J-202', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-BD-003', 'Front Fender/Mudguard', 'Body', 'Honda', 'Activa 6G', 'Fits Honda Activa 6G', 15, 30, 8, 950.00, 1300.00, 'Honda 2Wheelers', 'J-203', 'in-stock'),

-- Honda Suspension
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-SU-001', 'Front Fork Set', 'Suspension', 'Honda', 'CB Shine', 'Fits Honda CB Shine (Front)', 15, 30, 6, 2400.00, 3200.00, 'Honda 2Wheelers', 'K-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-SU-002', 'Rear Shock Absorber', 'Suspension', 'Honda', 'CB Shine', 'Fits Honda CB Shine (Rear)', 15, 30, 6, 1650.00, 2200.00, 'Honda 2Wheelers', 'K-202', 'in-stock'),

-- More Honda parts
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-TC-001', 'Timing Chain', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine, SP 125', 40, 80, 16, 214.00, 320.00, 'Honda 2Wheelers', 'L-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-TC-002', 'Camshaft', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine', 15, 30, 8, 1450.00, 1950.00, 'Honda 2Wheelers', 'L-202', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-PI-001', 'Piston Kit (124.9cc)', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine (STD)', 20, 40, 10, 2200.00, 2900.00, 'Honda 2Wheelers', 'M-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-PI-002', 'Piston Kit (159.7cc)', 'Engine', 'Honda', 'SP 160', 'Fits Honda SP 160 (STD)', 15, 30, 8, 2600.00, 3400.00, 'Honda 2Wheelers', 'M-202', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-VA-001', 'Valve Set (Inlet/Exhaust)', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine', 25, 50, 12, 850.00, 1150.00, 'Honda 2Wheelers', 'N-201', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'HON-GK-001', 'Gasket Kit Complete', 'Engine', 'Honda', 'CB Shine', 'Fits Honda CB Shine (Full Gasket Set)', 30, 60, 15, 1450.00, 1950.00, 'Honda 2Wheelers', 'O-201', 'in-stock'),

-- ============================================================================
-- BAJAJ PARTS (150+ parts)
-- ============================================================================

INSERT INTO public.parts (
  garage_id, part_number, part_name, category, make, model, used_for,
  on_hand_stock, warehouse_stock, low_stock_threshold,
  purchase_price, selling_price,
  supplier, location, stock_status
) VALUES
-- Bajaj Spark Plugs
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-SP-001', 'NGK CR8HSA Spark Plug', 'Electrical', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180 (2018-2025)', 55, 110, 20, 95.00, 135.00, 'Bajaj Auto Ltd', 'A-301', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-SP-002', 'Bosch Super 4 Spark Plug', 'Electrical', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 30, 60, 12, 110.00, 155.00, 'Bosch India', 'A-302', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-SP-003', 'NGK CR9HK Spark Plug', 'Electrical', 'Bajaj', 'Dominar 400', 'Fits Bajaj Dominar 400 (Iridium)', 20, 40, 8, 185.00, 260.00, 'NGK', 'A-303', 'in-stock'),

-- Bajaj Oil Filters
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-OF-001', 'Oil Filter Element', 'Filters', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 50, 100, 20, 75.00, 110.00, 'Bajaj Auto Ltd', 'B-301', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-OF-002', 'Spin-On Oil Filter', 'Filters', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 35, 70, 14, 95.00, 140.00, 'Bajaj Auto Ltd', 'B-302', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-OF-003', 'Oil Filter O-Ring', 'Filters', 'Bajaj', 'Universal', 'Universal Bajaj O-ring seal', 80, 160, 30, 35.00, 60.00, 'Aftermarket', 'B-303', 'in-stock'),

-- Bajaj Air Filters
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-AF-001', 'Foam Air Filter', 'Filters', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 45, 90, 18, 95.00, 140.00, 'Bajaj Auto Ltd', 'C-301', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-AF-002', 'Paper Air Filter', 'Filters', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 30, 60, 12, 125.00, 180.00, 'Bajaj Auto Ltd', 'C-302', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-AF-003', 'K&N Air Filter', 'Filters', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200 (High Performance)', 15, 30, 6, 5975.00, 7500.00, 'K&N Engineering', 'C-303', 'in-stock'),

-- Bajaj Clutch Plates
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-CP-001', 'Clutch Plate Set (5 Plates)', 'Transmission', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 40, 80, 16, 300.00, 420.00, 'Bajaj Auto Ltd', 'D-301', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-CP-002', 'Clutch Plate Set (6 Plates)', 'Transmission', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 30, 60, 12, 450.00, 620.00, 'Bajaj Auto Ltd', 'D-302', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-CP-003', 'Clutch Bell Assembly', 'Transmission', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 25, 50, 10, 650.00, 880.00, 'Bajaj Auto Ltd', 'D-303', 'in-stock'),

-- Bajaj Carburetor
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-CB-001', 'Carburetor Assembly', 'Fuel System', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 UG4.5', 20, 40, 10, 1350.00, 1800.00, 'Bajaj Auto Ltd', 'E-301', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-CB-002', 'Carburetor Repair Kit', 'Fuel System', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 40, 80, 20, 220.00, 320.00, 'Aftermarket', 'E-302', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-CB-003', 'Throttle Cable', 'Fuel System', 'Bajaj', 'Universal', 'Universal Bajaj throttle cable', 60, 120, 25, 110.00, 170.00, 'Aftermarket', 'E-303', 'in-stock'),

-- Bajaj Brake Parts
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-BP-001', 'Brake Pad Set (Front)', 'Brakes', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 (240mm Disc)', 50, 100, 20, 350.00, 480.00, 'Bajaj Auto Ltd', 'F-301', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-BP-002', 'Brake Pad Set (Rear)', 'Brakes', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 (230mm Disc)', 50, 100, 20, 320.00, 450.00, 'Bajaj Auto Ltd', 'F-302', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-BP-003', 'Brake Pad Set (Front)', 'Brakes', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200 (280mm)', 35, 70, 14, 450.00, 620.00, 'Bajaj Auto Ltd', 'F-303', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-BP-004', 'Brake Disc (Front 280mm)', 'Brakes', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200', 15, 30, 6, 1450.00, 1950.00, 'Bajaj Auto Ltd', 'F-304', 'in-stock'),

-- Bajaj Chain Sprockets
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-CS-001', 'Chain Sprocket Kit (428H)', 'Transmission', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180 (Rolon)', 40, 80, 16, 1650.00, 2200.00, 'Rolon', 'G-301', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-CS-002', 'Chain Sprocket Kit (520)', 'Transmission', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200 (Rolon X-Ring)', 25, 50, 10, 2495.00, 3200.00, 'Rolon', 'G-302', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-CS-003', 'Chain Sprocket Kit (520 Pitch)', 'Transmission', 'Bajaj', 'Dominar 400', 'Fits Bajaj Dominar 400 (Rolon Brass)', 20, 40, 8, 2850.00, 3650.00, 'Rolon', 'G-303', 'in-stock'),

-- Bajaj Piston Kits
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-PK-001', 'Piston Kit 144.8cc (STD)', 'Engine', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150 (STD)', 25, 50, 12, 1150.00, 1550.00, 'Bajaj Auto Ltd', 'H-301', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-PK-002', 'Piston Kit 199.5cc (STD)', 'Engine', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200 (STD)', 20, 40, 10, 1850.00, 2450.00, 'Bajaj Auto Ltd', 'H-302', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-PK-003', 'Piston Kit 373.2cc (STD)', 'Engine', 'Bajaj', 'Dominar 400', 'Fits Bajaj Dominar 400 (STD)', 15, 30, 6, 3200.00, 4200.00, 'Bajaj Auto Ltd', 'H-303', 'in-stock'),

-- Bajaj Electrical
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-EL-001', 'CDI Unit (DC)', 'Electrical', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 25, 50, 12, 750.00, 1000.00, 'Bajaj Auto Ltd', 'I-301', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-EL-002', 'Stator Coil', 'Electrical', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 30, 60, 15, 550.00, 750.00, 'Bajaj Auto Ltd', 'I-302', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-EL-003', 'Regulator Rectifier', 'Electrical', 'Bajaj', 'Pulsar NS200', 'Fits Bajaj Pulsar NS200, RS200', 20, 40, 10, 650.00, 880.00, 'Bajaj Auto Ltd', 'I-303', 'in-stock'),
('c9f656e3-bbac-454a-9b36-c646bcaf6c39', 'BAJ-EL-004', 'Self Motor', 'Electrical', 'Bajaj', 'Pulsar 150', 'Fits Bajaj Pulsar 150, 180', 20, 40, 10, 1350.00, 1800.00, 'Bajaj Auto Ltd', 'I-304', 'in-stock'),

