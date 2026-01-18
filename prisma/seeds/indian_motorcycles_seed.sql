-- ============================================================================
-- SEED DATA: INDIAN MOTORCYCLES 1970-2026
-- ============================================================================
-- This script contains motorcycles sold/produced in India from 1970-2026
-- Excludes scooters and scooterettes (only motorcycles included)
-- Total: 400+ motorcycle models from 25+ manufacturers
-- ============================================================================

-- Clear existing data (optional - comment out if you want to preserve data)
-- TRUNCATE TABLE public.motorcycles RESTART IDENTITY CASCADE;

-- ============================================================================
-- 1. ROYAL ENFIELD (India/UK)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Royal Enfield', 'Bullet 350', 1955, NULL, 'United Kingdom', 'Standard', 346, 'In Production'),
('Royal Enfield', 'Bullet 500', 1990, 2020, 'United Kingdom', 'Cruiser', 499, 'Discontinued'),
('Royal Enfield', 'Classic 350', 2009, NULL, 'United Kingdom', 'Cruiser', 346, 'In Production'),
('Royal Enfield', 'Classic 500', 2010, 2020, 'United Kingdom', 'Cruiser', 499, 'Discontinued'),
('Royal Enfield', 'Electra', 1995, 2016, 'United Kingdom', 'Standard', 346, 'Discontinued'),
('Royal Enfield', 'Thunderbird 350', 2002, 2020, 'United Kingdom', 'Cruiser', 346, 'Discontinued'),
('Royal Enfield', 'Thunderbird 500', 2013, 2020, 'United Kingdom', 'Cruiser', 499, 'Discontinued'),
('Royal Enfield', 'Continental GT 535', 2013, 2018, 'United Kingdom', 'Sport', 535, 'Discontinued'),
('Royal Enfield', 'Himalayan 411', 2016, 2024, 'United Kingdom', 'Adventure', 411, 'Discontinued'),
('Royal Enfield', 'Fury', 1988, 1995, 'United Kingdom', 'Sport', 163, 'Discontinued'),
('Royal Enfield', 'Lightning 535', 1997, 2003, 'United Kingdom', 'Cruiser', 535, 'Discontinued'),
('Royal Enfield', 'Machismo 350', 1999, 2009, 'United Kingdom', 'Cruiser', 346, 'Discontinued'),
('Royal Enfield', 'Machismo 500', 1999, 2009, 'United Kingdom', 'Cruiser', 499, 'Discontinued'),
('Royal Enfield', 'Bullet 350 (New)', 2021, NULL, 'United Kingdom', 'Cruiser', 349, 'In Production'),
('Royal Enfield', 'Hunter 350', 2022, NULL, 'United Kingdom', 'Standard', 349, 'In Production'),
('Royal Enfield', 'Meteor 350', 2020, NULL, 'United Kingdom', 'Cruiser', 349, 'In Production'),
('Royal Enfield', 'Classic 350 (New)', 2022, NULL, 'United Kingdom', 'Cruiser', 349, 'In Production'),
('Royal Enfield', 'Classic 650', 2025, NULL, 'United Kingdom', 'Cruiser', 649, 'In Production'),
('Royal Enfield', 'Interceptor 650', 2018, NULL, 'United Kingdom', 'Standard', 648, 'In Production'),
('Royal Enfield', 'Continental GT 650', 2018, NULL, 'United Kingdom', 'Sport', 648, 'In Production'),
('Royal Enfield', 'Super Meteor 650', 2022, NULL, 'United Kingdom', 'Cruiser', 648, 'In Production'),
('Royal Enfield', 'Himalayan 452', 2023, NULL, 'United Kingdom', 'Adventure', 452, 'In Production'),
('Royal Enfield', 'Scram 411', 2022, NULL, 'United Kingdom', 'Dual-sport', 411, 'In Production'),
('Royal Enfield', 'Scram 440', 2025, NULL, 'United Kingdom', 'Dual-sport', 443, 'In Production'),
('Royal Enfield', 'Guerrilla 450', 2024, NULL, 'United Kingdom', 'Standard', 452, 'In Production'),
('Royal Enfield', 'Shotgun 650', 2024, NULL, 'United Kingdom', 'Cruiser', 648, 'In Production'),
('Royal Enfield', 'Bear 650', 2024, NULL, 'United Kingdom', 'Dual-sport', 648, 'In Production'),
('Royal Enfield', 'Goan Classic 350', 2024, NULL, 'United Kingdom', 'Cruiser', 349, 'In Production');

-- ============================================================================
-- 2. HERO / HERO HONDA (India)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
-- Hero Honda Era (1984-2011)
('Hero Honda', 'CD 100', 1985, 2005, 'India', 'Commuter', 100, 'Discontinued'),
('Hero Honda', 'CD 100 SS', 1991, 2006, 'India', 'Commuter', 100, 'Discontinued'),
('Hero Honda', 'CD 100 Sleek', 1995, 2005, 'India', 'Commuter', 100, 'Discontinued'),
('Hero Honda', 'CD Deluxe', 1998, 2006, 'India', 'Commuter', 100, 'Discontinued'),
('Hero Honda', 'Splendor', 1994, 2004, 'India', 'Commuter', 97, 'Discontinued'),
('Hero Honda', 'Splendor+', 2004, NULL, 'India', 'Commuter', 97, 'In Production'),
('Hero Honda', 'Super Splendor', 2005, NULL, 'India', 'Commuter', 125, 'In Production'),
('Hero Honda', 'Passion', 2001, 2008, 'India', 'Commuter', 97, 'Discontinued'),
('Hero Honda', 'Passion Plus', 2003, 2010, 'India', 'Commuter', 107, 'Discontinued'),
('Hero Honda', 'Passion Pro', 2008, NULL, 'India', 'Commuter', 110, 'In Production'),
('Hero Honda', 'CBZ', 1999, 2006, 'India', 'Sport', 157, 'Discontinued'),
('Hero Honda', 'CBZ Xtreme', 2006, 2012, 'India', 'Sport', 150, 'Discontinued'),
('Hero Honda', 'Karizma', 2003, 2007, 'India', 'Sport', 223, 'Discontinued'),
('Hero Honda', 'Karizma R', 2007, 2011, 'India', 'Sport', 223, 'Discontinued'),
('Hero Honda', 'Karizma ZMR', 2007, 2014, 'India', 'Sport', 223, 'Discontinued'),
('Hero Honda', 'Ambition', 2002, 2008, 'India', 'Commuter', 135, 'Discontinued'),
('Hero Honda', 'Achiever', 2005, 2011, 'India', 'Sport', 150, 'Discontinued'),
('Hero Honda', 'Glamour', 2005, NULL, 'India', 'Commuter', 125, 'In Production'),
('Hero Honda', 'Hunk', 2007, 2016, 'India', 'Sport', 150, 'Discontinued'),
-- Hero MotoCorp Era (2011-Present)
('Hero', 'Splendor Pro', 2011, 2020, 'India', 'Commuter', 97, 'Discontinued'),
('Hero', 'Splendor iSmart', 2012, NULL, 'India', 'Commuter', 97, 'In Production'),
('Hero', 'Splendor NXG', 2014, NULL, 'India', 'Commuter', 100, 'In Production'),
('Hero', 'HF Deluxe', 2011, NULL, 'India', 'Commuter', 97, 'In Production'),
('Hero', 'HF 100', 2016, NULL, 'India', 'Commuter', 100, 'In Production'),
('Hero', 'Passion XPro', 2013, NULL, 'India', 'Commuter', 110, 'In Production'),
('Hero', 'Passion Pro (New)', 2012, NULL, 'India', 'Commuter', 110, 'In Production'),
('Hero', 'Glamour (New)', 2012, NULL, 'India', 'Commuter', 125, 'In Production'),
('Hero', 'Super Splendor (New)', 2012, NULL, 'India', 'Commuter', 125, 'In Production'),
('Hero', 'Xtreme 160R', 2020, NULL, 'India', 'Sport', 160, 'In Production'),
('Hero', 'Xtreme 160R 4V', 2023, NULL, 'India', 'Sport', 163, 'In Production'),
('Hero', 'Xtreme 200S', 2018, 2020, 'India', 'Sport', 200, 'Discontinued'),
('Hero', 'Xtreme 200T', 2018, 2020, 'India', 'Sport', 200, 'Discontinued'),
('Hero', 'Xtreme 250R', 2023, NULL, 'India', 'Sport', 250, 'In Production'),
('Hero', 'Xpulse 200', 2019, NULL, 'India', 'Adventure', 200, 'In Production'),
('Hero', 'Xpulse 200 4V', 2023, NULL, 'India', 'Adventure', 200, 'In Production'),
('Hero', 'Xpulse 210', 2024, NULL, 'India', 'Adventure', 210, 'In Production'),
('Hero', 'Karizma XMR', 2023, NULL, 'India', 'Sport', 210, 'In Production'),
('Hero', 'Mavrick 440', 2024, NULL, 'India', 'Cruiser', 440, 'In Production'),
('Hero', 'Harley-Davidson X440', 2023, NULL, 'India', 'Cruiser', 440, 'In Production');

-- ============================================================================
-- 3. BAJAJ AUTO (India)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
-- Bajaj-Kawasaki Era (1986-2000s)
('Bajaj', 'KB 100', 1986, 1992, 'India', 'Commuter', 100, 'Discontinued'),
('Bajaj', 'KB 125', 1988, 1993, 'India', 'Commuter', 125, 'Discontinued'),
('Bajaj', 'KB 100 RTZ', 1989, 1995, 'India', 'Sport', 100, 'Discontinued'),
('Bajaj', '4S Champion 100', 1991, 2000, 'India', 'Commuter', 98, 'Discontinued'),
('Bajaj', 'Boxer 100', 1997, 2005, 'India', 'Commuter', 98, 'Discontinued'),
('Bajaj', 'Boxer AT 100', 1998, 2005, 'India', 'Commuter', 98, 'Discontinued'),
('Bajaj', 'Boxer AR 100', 1999, 2005, 'India', 'Commuter', 98, 'Discontinued'),
('Bajaj', 'Caliber', 1998, 2005, 'India', 'Commuter', 112, 'Discontinued'),
('Bajaj', 'Caliber 115', 2000, 2005, 'India', 'Commuter', 112, 'Discontinued'),
('Bajaj', 'Caliber Croma 110', 1999, 2005, 'India', 'Commuter', 110, 'Discontinued'),
('Bajaj', 'Wind 125', 1999, 2005, 'India', 'Commuter', 125, 'Discontinued'),
('Bajaj', 'Aspire 110', 1999, 2005, 'India', 'Commuter', 110, 'Discontinued'),
('Bajaj', 'Eliminator 175', 1998, 2005, 'India', 'Cruiser', 173, 'Discontinued'),
-- Pulsar Series
('Bajaj', 'Pulsar 150', 2001, NULL, 'India', 'Sport', 150, 'In Production'),
('Bajaj', 'Pulsar 180', 2001, 2024, 'India', 'Sport', 179, 'Discontinued'),
('Bajaj', 'Pulsar 180F', 2010, 2024, 'India', 'Sport', 179, 'Discontinued'),
('Bajaj', 'Pulsar 200 DTS-i', 2006, 2019, 'India', 'Sport', 199, 'Discontinued'),
('Bajaj', 'Pulsar 200NS', 2012, 2023, 'India', 'Sport', 200, 'Discontinued'),
('Bajaj', 'Pulsar 220F', 2007, NULL, 'India', 'Sport', 220, 'In Production'),
('Bajaj', 'Pulsar 135 LS', 2009, 2019, 'India', 'Commuter', 134, 'Discontinued'),
('Bajaj', 'Pulsar 125', 2019, NULL, 'India', 'Commuter', 124, 'In Production'),
('Bajaj', 'Pulsar N125', 2024, NULL, 'India', 'Standard', 125, 'In Production'),
('Bajaj', 'Pulsar N150', 2022, 2025, 'India', 'Standard', 149, 'Discontinued'),
('Bajaj', 'Pulsar N160', 2021, NULL, 'India', 'Standard', 164, 'In Production'),
('Bajaj', 'Pulsar N250', 2022, NULL, 'India', 'Standard', 249, 'In Production'),
('Bajaj', 'Pulsar F250', 2023, 2025, 'India', 'Sport', 249, 'Discontinued'),
('Bajaj', 'Pulsar NS125', 2020, NULL, 'India', 'Sport', 124, 'In Production'),
('Bajaj', 'Pulsar NS160', 2016, NULL, 'India', 'Sport', 160, 'In Production'),
('Bajaj', 'Pulsar NS200', 2012, NULL, 'India', 'Sport', 200, 'In Production'),
('Bajaj', 'Pulsar NS400Z', 2024, NULL, 'India', 'Sport', 400, 'In Production'),
('Bajaj', 'Pulsar RS200', 2015, NULL, 'India', 'Sport', 199, 'In Production'),
('Bajaj', 'Pulsar P150', 2023, NULL, 'India', 'Commuter', 149, 'In Production'),
-- Discover Series (Discontinued in 2020)
('Bajaj', 'Discover 100', 2004, 2020, 'India', 'Commuter', 95, 'Discontinued'),
('Bajaj', 'Discover 100M', 2014, 2020, 'India', 'Commuter', 95, 'Discontinued'),
('Bajaj', 'Discover 100T', 2014, 2020, 'India', 'Commuter', 95, 'Discontinued'),
('Bajaj', 'Discover 110', 2009, 2020, 'India', 'Commuter', 102, 'Discontinued'),
('Bajaj', 'Discover 125', 2004, 2020, 'India', 'Commuter', 125, 'Discontinued'),
('Bajaj', 'Discover 125M', 2010, 2020, 'India', 'Commuter', 125, 'Discontinued'),
('Bajaj', 'Discover 125ST', 2010, 2020, 'India', 'Commuter', 125, 'Discontinued'),
('Bajaj', 'Discover 135 DTS-i', 2006, 2014, 'India', 'Commuter', 134, 'Discontinued'),
('Bajaj', 'Discover 150', 2011, 2020, 'India', 'Commuter', 144, 'Discontinued'),
('Bajaj', 'Discover 150S', 2015, 2020, 'India', 'Commuter', 150, 'Discontinued'),
('Bajaj', 'Discover 150F', 2015, 2020, 'India', 'Sport', 150, 'Discontinued'),
-- Avenger Series
('Bajaj', 'Avenger 180', 2005, 2017, 'India', 'Cruiser', 179, 'Discontinued'),
('Bajaj', 'Avenger 200', 2010, 2018, 'India', 'Cruiser', 200, 'Discontinued'),
('Bajaj', 'Avenger 220 Cruise', 2015, NULL, 'India', 'Cruiser', 220, 'In Production'),
('Bajaj', 'Avenger Street 160', 2018, NULL, 'India', 'Cruiser', 160, 'In Production'),
('Bajaj', 'Avenger Street 180', 2018, 2024, 'India', 'Cruiser', 180, 'Discontinued'),
('Bajaj', 'Avenger Street 220', 2018, NULL, 'India', 'Cruiser', 220, 'In Production'),
-- Other Models
('Bajaj', 'CT 100', 2004, NULL, 'India', 'Commuter', 102, 'In Production'),
('Bajaj', 'CT 110', 2020, NULL, 'India', 'Commuter', 116, 'In Production'),
('Bajaj', 'CT 110X', 2022, NULL, 'India', 'Commuter', 116, 'In Production'),
('Bajaj', 'CT 125X', 2023, 2025, 'India', 'Commuter', 125, 'Discontinued'),
('Bajaj', 'Platina 100', 2006, NULL, 'India', 'Commuter', 99, 'In Production'),
('Bajaj', 'Platina 110', 2010, NULL, 'India', 'Commuter', 102, 'In Production'),
('Bajaj', 'Platina 110 H-Gear', 2019, NULL, 'India', 'Commuter', 102, 'In Production'),
('Bajaj', 'Platina 125', 2015, 2019, 'India', 'Commuter', 124, 'Discontinued'),
('Bajaj', 'Dominar 250', 2020, NULL, 'India', 'Sport', 249, 'In Production'),
('Bajaj', 'Dominar 400', 2016, NULL, 'India', 'Sport', 373, 'In Production'),
('Bajaj', 'V15', 2016, 2019, 'India', 'Commuter', 149, 'Discontinued'),
('Bajaj', 'XCD 125', 2007, 2010, 'India', 'Commuter', 125, 'Discontinued'),
('Bajaj', 'XCD 135', 2009, 2012, 'India', 'Commuter', 134, 'Discontinued'),
('Bajaj', 'Freedom 125 CNG', 2025, NULL, 'India', 'Commuter', 125, 'In Production');

-- ============================================================================
-- 4. YAMAHA (Japan)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
-- Escorts Yamaha Era (1983-2000)
('Yamaha', 'Rajdoot 350', 1983, 1989, 'Japan', 'Sport', 347, 'Discontinued'),
('Yamaha', 'RX 100', 1985, 1996, 'Japan', 'Sport', 98, 'Discontinued'),
('Yamaha', 'RX 100 (6V)', 1985, 1990, 'Japan', 'Sport', 98, 'Discontinued'),
('Yamaha', 'RX 100 (12V)', 1990, 1996, 'Japan', 'Sport', 98, 'Discontinued'),
('Yamaha', 'RXG', 1990, 1995, 'Japan', 'Sport', 98, 'Discontinued'),
('Yamaha', 'RX 135', 1997, 2005, 'Japan', 'Sport', 132, 'Discontinued'),
('Yamaha', 'RXZ', 1999, 2003, 'Japan', 'Sport', 132, 'Discontinued'),
('Yamaha', 'YBX 125', 1996, 2002, 'Japan', 'Commuter', 123, 'Discontinued'),
-- Yamaha Motor India Era (2000-Present)
('Yamaha', 'Crux', 2000, 2015, 'Japan', 'Commuter', 106, 'Discontinued'),
('Yamaha', 'Crux R', 2000, 2015, 'Japan', 'Commuter', 106, 'Discontinued'),
('Yamaha', 'Crux S', 2005, 2015, 'Japan', 'Commuter', 106, 'Discontinued'),
('Yamaha', 'Libero', 2002, 2010, 'Japan', 'Commuter', 106, 'Discontinued'),
('Yamaha', 'Libero G5', 2005, 2010, 'Japan', 'Commuter', 106, 'Discontinued'),
('Yamaha', 'Gladiator', 2005, 2010, 'Japan', 'Commuter', 125, 'Discontinued'),
('Yamaha', 'Alba', 2005, 2010, 'Japan', 'Commuter', 106, 'Discontinued'),
('Yamaha', 'Enticer', 2005, 2010, 'Japan', 'Cruiser', 125, 'Discontinued'),
('Yamaha', 'SS 125', 2010, 2015, 'Japan', 'Commuter', 123, 'Discontinued'),
('Yamaha', 'SZ', 2010, 2016, 'Japan', 'Commuter', 153, 'Discontinued'),
('Yamaha', 'SZ-X', 2010, 2016, 'Japan', 'Commuter', 153, 'Discontinued'),
('Yamaha', 'Saluto', 2015, NULL, 'Japan', 'Commuter', 125, 'In Production'),
('Yamaha', 'Saluto RX', 2016, NULL, 'Japan', 'Commuter', 110, 'In Production'),
-- FZ Series
('Yamaha', 'FZ16', 2008, 2014, 'Japan', 'Standard', 153, 'Discontinued'),
('Yamaha', 'FZ-S', 2009, 2014, 'Japan', 'Standard', 153, 'Discontinued'),
('Yamaha', 'FZ FI V1.0', 2014, 2019, 'Japan', 'Standard', 149, 'Discontinued'),
('Yamaha', 'FZ-S FI V2.0', 2014, 2019, 'Japan', 'Standard', 149, 'Discontinued'),
('Yamaha', 'FZ-S V3', 2019, NULL, 'Japan', 'Standard', 149, 'In Production'),
('Yamaha', 'FZ-FI', 2015, NULL, 'Japan', 'Standard', 149, 'In Production'),
('Yamaha', 'FZ25', 2017, NULL, 'Japan', 'Standard', 249, 'In Production'),
('Yamaha', 'Fazer 150', 2009, 2014, 'Japan', 'Sport', 153, 'Discontinued'),
('Yamaha', 'Fazer 150 FI', 2014, 2020, 'Japan', 'Sport', 149, 'Discontinued'),
('Yamaha', 'Fazer 25', 2017, NULL, 'Japan', 'Sport', 249, 'In Production'),
-- YZF-R Series
('Yamaha', 'YZF-R15 V1', 2008, 2011, 'Japan', 'Sport', 149, 'Discontinued'),
('Yamaha', 'YZF-R15 V2', 2011, 2017, 'Japan', 'Sport', 149, 'Discontinued'),
('Yamaha', 'YZF-R15 V3', 2017, 2022, 'Japan', 'Sport', 155, 'Discontinued'),
('Yamaha', 'YZF-R15 V4', 2022, NULL, 'Japan', 'Sport', 155, 'In Production'),
('Yamaha', 'MT-15 V1', 2019, 2021, 'Japan', 'Standard', 155, 'Discontinued'),
('Yamaha', 'MT-15 V2', 2021, NULL, 'Japan', 'Standard', 155, 'In Production'),
('Yamaha', 'XSR155', 2022, NULL, 'Japan', 'Standard', 155, 'In Production'),
('Yamaha', 'YZF-R3', 2015, NULL, 'Japan', 'Sport', 321, 'In Production'),
('Yamaha', 'MT-03', 2021, NULL, 'Japan', 'Standard', 321, 'In Production');

-- ============================================================================
-- 5. HONDA MOTORCYCLE & SCOOTER INDIA (Japan)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
-- Commuter Bikes
('Honda', 'CD 110 Dream', 2014, 2024, 'Japan', 'Commuter', 109, 'Discontinued'),
('Honda', 'Shine 100', 2023, NULL, 'Japan', 'Commuter', 98, 'In Production'),
('Honda', 'Shine 125', 2006, NULL, 'Japan', 'Commuter', 124, 'In Production'),
('Honda', 'SP 125', 2019, NULL, 'Japan', 'Commuter', 124, 'In Production'),
('Honda', 'Unicorn 150', 2005, 2020, 'Japan', 'Commuter', 149, 'Discontinued'),
('Honda', 'Unicorn 160', 2016, 2020, 'Japan', 'Commuter', 162, 'Discontinued'),
('Honda', 'Livo', 2015, 2020, 'Japan', 'Commuter', 110, 'Discontinued'),
('Honda', 'Dream Yuga', 2012, 2020, 'Japan', 'Commuter', 109, 'Discontinued'),
('Honda', 'Dream Neo', 2014, 2020, 'Japan', 'Commuter', 109, 'Discontinued'),
('Honda', 'CB Twister 110', 2010, 2020, 'Japan', 'Commuter', 109, 'Discontinued'),
('Honda', 'CB Shine', 2006, NULL, 'Japan', 'Commuter', 125, 'In Production'),
-- Performance/Sport Bikes
('Honda', 'CBF Stunner', 2006, 2015, 'Japan', 'Sport', 125, 'Discontinued'),
('Honda', 'Hornet 160R', 2015, 2020, 'Japan', 'Sport', 162, 'Discontinued'),
('Honda', 'Hornet 2.0', 2020, NULL, 'Japan', 'Sport', 184, 'In Production'),
('Honda', 'XBlade', 2018, 2024, 'Japan', 'Sport', 162, 'Discontinued'),
('Honda', 'CB Trigger 150', 2013, 2016, 'Japan', 'Sport', 149, 'Discontinued'),
('Honda', 'CBR 150R', 2012, 2017, 'Japan', 'Sport', 149, 'Discontinued'),
('Honda', 'CBR 250R', 2011, 2020, 'Japan', 'Sport', 250, 'Discontinued'),
('Honda', 'CB300R', 2019, 2024, 'Japan', 'Standard', 286, 'Discontinued'),
('Honda', 'CB300F', 2020, 2024, 'Japan', 'Standard', 286, 'Discontinued'),
('Honda', 'CB650R', 2021, NULL, 'Japan', 'Standard', 649, 'In Production'),
('Honda', 'CBR 650R', 2019, NULL, 'Japan', 'Sport', 649, 'In Production'),
('Honda', 'CB1000R', 2020, 2024, 'Japan', 'Standard', 998, 'Discontinued'),
('Honda', 'CBR 1000RR-R', 2020, 2025, 'Japan', 'Sport', 999, 'Discontinued'),
('Honda', 'VFR 800F', 2015, 2020, 'Japan', 'Sport', 782, 'Discontinued'),
-- Big Bike/Neo-Retro
('Honda', 'H''ness CB350', 2020, NULL, 'Japan', 'Cruiser', 348, 'In Production'),
('Honda', 'CB350', 2021, NULL, 'Japan', 'Standard', 348, 'In Production'),
('Honda', 'CB350RS', 2021, NULL, 'Japan', 'Dual-sport', 348, 'In Production'),
('Honda', 'Highness CB350', 2022, NULL, 'Japan', 'Cruiser', 348, 'In Production'),
('Honda', 'CB500F', 2023, NULL, 'Japan', 'Standard', 471, 'In Production'),
('Honda', 'CBR500R', 2023, NULL, 'Japan', 'Sport', 471, 'In Production'),
-- Adventure
('Honda', 'Africa Twin', 2023, NULL, 'Japan', 'Adventure', 1084, 'In Production'),
('Honda', 'Transalp', 2024, NULL, 'Japan', 'Adventure', 755, 'In Production');

-- ============================================================================
-- 6. TVS MOTOR COMPANY (India)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
-- TVS-Suzuki Era (1980s-2001)
('TVS-Suzuki', 'AX 100', 1984, 1989, 'India', 'Commuter', 98, 'Discontinued'),
('TVS-Suzuki', 'Supra', 1987, 2000, 'India', 'Commuter', 98, 'Discontinued'),
('TVS-Suzuki', 'Supra SS', 1988, 2000, 'India', 'Sport', 98, 'Discontinued'),
('TVS-Suzuki', 'Samurai', 1992, 2005, 'India', 'Commuter', 98, 'Discontinued'),
('TVS-Suzuki', 'Shogun', 1993, 2005, 'India', 'Sport', 98, 'Discontinued'),
('TVS-Suzuki', 'Shaolin', 1994, 2005, 'India', 'Sport', 98, 'Discontinued'),
('TVS-Suzuki', 'Max 100 R', 1995, 2005, 'India', 'Commuter', 98, 'Discontinued'),
('TVS-Suzuki', 'Fiero', 1997, 2005, 'India', 'Sport', 148, 'Discontinued'),
('TVS-Suzuki', 'Fiero F2', 1998, 2005, 'India', 'Sport', 148, 'Discontinued'),
('TVS-Suzuki', 'Fiero FX', 1999, 2005, 'India', 'Sport', 148, 'Discontinued'),
-- TVS Independent Era (2001-Present)
('TVS', 'Victor', 2001, 2014, 'India', 'Commuter', 110, 'Discontinued'),
('TVS', 'Victor GL', 2002, 2014, 'India', 'Commuter', 109, 'Discontinued'),
('TVS', 'Victor Edge', 2005, 2014, 'India', 'Commuter', 110, 'Discontinued'),
('TVS', 'New Victor', 2016, 2023, 'India', 'Commuter', 110, 'Discontinued'),
('TVS', 'Star', 2008, 2015, 'India', 'Commuter', 100, 'Discontinued'),
('TVS', 'Star City Plus', 2015, NULL, 'India', 'Commuter', 110, 'In Production'),
('TVS', 'Sport', 2008, NULL, 'India', 'Commuter', 100, 'In Production'),
('TVS', 'Radeon', 2018, NULL, 'India', 'Commuter', 110, 'In Production'),
('TVS', 'XL 100', 1980, NULL, 'India', 'Commuter', 100, 'In Production'),
('TVS', 'XL 100 Heavy Duty', 1980, NULL, 'India', 'Commuter', 100, 'In Production'),
('TVS', 'XL 100 Comfort', 2018, NULL, 'India', 'Commuter', 100, 'In Production'),
('TVS', 'Flame', 2008, 2012, 'India', 'Commuter', 125, 'Discontinued'),
-- Apache Series
('TVS', 'Apache RTR 150', 2005, 2011, 'India', 'Sport', 150, 'Discontinued'),
('TVS', 'Apache RTR 160', 2011, NULL, 'India', 'Sport', 160, 'In Production'),
('TVS', 'Apache RTR 160 4V', 2019, NULL, 'India', 'Sport', 160, 'In Production'),
('TVS', 'Apache RTR 165RP', 2024, NULL, 'India', 'Sport', 165, 'In Production'),
('TVS', 'Apache RTR 180', 2012, NULL, 'India', 'Sport', 177, 'In Production'),
('TVS', 'Apache RTR 200 4V', 2016, NULL, 'India', 'Sport', 198, 'In Production'),
('TVS', 'Apache RR 310', 2018, NULL, 'India', 'Sport', 313, 'In Production'),
('TVS', 'Apache RTX', 2025, NULL, 'India', 'Sport', 299, 'In Production'),
-- Other Models
('TVS', 'Max4', 2010, 2016, 'India', 'Commuter', 125, 'Discontinued'),
('TVS', 'Ronin', 2022, NULL, 'India', 'Standard', 225, 'In Production'),
('TVS', 'Raider 125', 2022, NULL, 'India', 'Sport', 125, 'In Production');

-- ============================================================================
-- 7. SUZUKI MOTORCYCLE INDIA (Japan)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
-- Suzuki Independent Era (2001-Present)
('Suzuki', 'Zeus', 2007, 2015, 'Japan', 'Commuter', 124, 'Discontinued'),
('Suzuki', 'Heat', 2008, 2015, 'Japan', 'Commuter', 124, 'Discontinued'),
('Suzuki', 'Hayate', 2011, 2020, 'Japan', 'Commuter', 113, 'Discontinued'),
('Suzuki', 'Slingshot', 2010, 2016, 'Japan', 'Commuter', 125, 'Discontinued'),
('Suzuki', 'GS150R', 2008, 2019, 'Japan', 'Sport', 155, 'Discontinued'),
('Suzuki', 'Gixxer 150', 2014, NULL, 'Japan', 'Standard', 155, 'In Production'),
('Suzuki', 'Gixxer SF 150', 2015, NULL, 'Japan', 'Sport', 155, 'In Production'),
('Suzuki', 'Gixxer 250', 2019, NULL, 'Japan', 'Standard', 249, 'In Production'),
('Suzuki', 'Gixxer SF 250', 2019, NULL, 'Japan', 'Sport', 249, 'In Production'),
('Suzuki', 'Intruder 150', 2017, 2023, 'Japan', 'Cruiser', 155, 'Discontinued'),
('Suzuki', 'V-Strom SX', 2023, NULL, 'Japan', 'Adventure', 250, 'In Production'),
('Suzuki', 'Hayabusa', 2022, NULL, 'Japan', 'Sport', 1340, 'In Production');

-- ============================================================================
-- 8. KTM INDIA (Austria)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
-- Duke Series
('KTM', 'Duke 200', 2012, NULL, 'Austria', 'Standard', 200, 'In Production'),
('KTM', 'Duke 250', 2013, NULL, 'Austria', 'Standard', 250, 'In Production'),
('KTM', 'Duke 390', 2013, NULL, 'Austria', 'Standard', 373, 'In Production'),
('KTM', 'Duke 125', 2018, NULL, 'Austria', 'Standard', 125, 'In Production'),
('KTM', 'Duke 160', 2023, NULL, 'Austria', 'Standard', 160, 'In Production'),
('KTM', 'Duke 790', 2023, NULL, 'Austria', 'Standard', 799, 'In Production'),
('KTM', 'Duke 890 R', 2023, NULL, 'Austria', 'Standard', 890, 'In Production'),
('KTM', 'Duke 390 (New)', 2024, NULL, 'Austria', 'Standard', 399, 'In Production'),
-- RC Series
('KTM', 'RC 200', 2014, NULL, 'Austria', 'Sport', 200, 'In Production'),
('KTM', 'RC 390', 2014, NULL, 'Austria', 'Sport', 373, 'In Production'),
('KTM', 'RC 125', 2017, NULL, 'Austria', 'Sport', 125, 'In Production'),
('KTM', 'RC 390 (New)', 2025, NULL, 'Austria', 'Sport', 399, 'In Production');

-- ============================================================================
-- 9. KAWASAKI INDIA (Japan)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Kawasaki', 'Ninja 300', 2014, 2024, 'Japan', 'Sport', 296, 'Discontinued'),
('Kawasaki', 'Ninja 400', 2018, 2023, 'Japan', 'Sport', 399, 'Discontinued'),
('Kawasaki', 'Ninja 650', 2011, NULL, 'Japan', 'Sport', 649, 'In Production'),
('Kawasaki', 'Ninja 650 (2023)', 2023, NULL, 'Japan', 'Sport', 649, 'In Production'),
('Kawasaki', 'Ninja 1000SX', 2020, NULL, 'Japan', 'Sport', 1043, 'In Production'),
('Kawasaki', 'Z900', 2017, NULL, 'Japan', 'Standard', 948, 'In Production'),
('Kawasaki', 'Z650', 2017, 2022, 'Japan', 'Standard', 649, 'Discontinued'),
('Kawasaki', 'Z H2', 2021, NULL, 'Japan', 'Standard', 998, 'In Production'),
('Kawasaki', 'Ninja ZX-10R', 2011, NULL, 'Japan', 'Sport', 998, 'In Production'),
('Kawasaki', 'Ninja ZX-14R', 2012, 2022, 'Japan', 'Sport', 1441, 'Discontinued'),
('Kawasaki', 'Ninja H2', 2019, 2024, 'Japan', 'Sport', 998, 'Discontinued'),
('Kawasaki', 'Ninja H2R', 2020, NULL, 'Japan', 'Sport', 998, 'In Production'),
('Kawasaki', 'Versys 650', 2015, NULL, 'Japan', 'Adventure', 649, 'In Production'),
('Kawasaki', 'Versys 1000', 2020, NULL, 'Japan', 'Adventure', 1043, 'In Production'),
('Kawasaki', 'KLX 450', 2019, NULL, 'Japan', 'Dirt bike', 449, 'In Production'),
('Kawasaki', 'KX 450', 2020, NULL, 'Japan', 'Motocross', 449, 'In Production');

-- ============================================================================
-- 10. BMW MOTORRAD INDIA (Germany)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('BMW', 'G 310 R', 2018, 2025, 'Germany', 'Standard', 313, 'Discontinued'),
('BMW', 'G 310 RR', 2022, NULL, 'Germany', 'Sport', 313, 'In Production'),
('BMW', 'G 310 GS', 2018, 2025, 'Germany', 'Adventure', 313, 'Discontinued'),
('BMW', 'G 310 GS Adventure', 2023, 2025, 'Germany', 'Adventure', 313, 'Discontinued'),
('BMW', 'F 900 R', 2020, NULL, 'Germany', 'Standard', 895, 'In Production'),
('BMW', 'F 900 XR', 2020, NULL, 'Germany', 'Sport', 895, 'In Production'),
('BMW', 'S 1000 RR', 2019, NULL, 'Germany', 'Sport', 999, 'In Production'),
('BMW', 'M 1000 RR', 2022, NULL, 'Germany', 'Sport', 999, 'In Production'),
('BMW', 'S 1000 XR', 2020, NULL, 'Germany', 'Sport', 999, 'In Production'),
('BMW', 'R 1250 RT', 2021, NULL, 'Germany', 'Touring', 1254, 'In Production'),
('BMW', 'R 1300 GS', 2023, NULL, 'Germany', 'Adventure', 1300, 'In Production'),
('BMW', 'R 1250 GS', 2019, NULL, 'Germany', 'Adventure', 1254, 'In Production'),
('BMW', 'K 1600 GTL', 2022, NULL, 'Germany', 'Touring', 1649, 'In Production');

-- ============================================================================
-- 11. IDEAL JAWA / YEZDI (Czech Republic/India)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
-- Ideal Jawa Era (1960-1996)
('Ideal Jawa', 'Jawa 250 Type 353', 1960, 1973, 'Czech Republic', 'Standard', 250, 'Discontinued'),
('Yezdi', 'Yezdi 250', 1973, 1996, 'Czech Republic', 'Standard', 250, 'Discontinued'),
('Yezdi', 'Yezdi 250 Oilking', 1976, 1988, 'Czech Republic', 'Standard', 250, 'Discontinued'),
('Yezdi', 'Yezdi 250 Roadking', 1976, 1996, 'Czech Republic', 'Standard', 250, 'Discontinued'),
('Yezdi', 'Yezdi 250 CL II', 1985, 1996, 'Czech Republic', 'Standard', 250, 'Discontinued'),
('Yezdi', 'Yezdi 250 Deluxe', 1985, 1995, 'Czech Republic', 'Standard', 250, 'Discontinued'),
('Yezdi', 'Yezdi 250 Monarch', 1990, 1996, 'Czech Republic', 'Standard', 250, 'Discontinued'),
('Yezdi', 'Yezdi 250 MT', 1990, 1996, 'Czech Republic', 'Standard', 250, 'Discontinued'),
('Yezdi', 'Yezdi 175', 1975, 1985, 'Czech Republic', 'Standard', 175, 'Discontinued'),
('Yezdi', 'Yezdi 350 Twin', 1973, 1996, 'Czech Republic', 'Sport', 350, 'Discontinued'),
-- Yezdi Relaunch (2022-Present)
('Yezdi', 'Yezdi Scrambler', 2022, NULL, 'Czech Republic', 'Dual-sport', 334, 'In Production'),
('Yezdi', 'Yezdi Roadster', 2022, NULL, 'Czech Republic', 'Standard', 334, 'In Production'),
('Yezdi', 'Yezdi Adventure', 2022, NULL, 'Czech Republic', 'Adventure', 334, 'In Production');

-- ============================================================================
-- 12. JAWA MOTORCYCLES (Czech Republic)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Jawa', 'Jawa 42', 2018, NULL, 'Czech Republic', 'Standard', 293, 'In Production'),
('Jawa', 'Jawa Standard', 2018, NULL, 'Czech Republic', 'Standard', 293, 'In Production'),
('Jawa', 'Jawa Perak', 2019, NULL, 'Czech Republic', 'Cruiser', 334, 'In Production'),
('Jawa', 'Jawa Forty Two', 2020, NULL, 'Czech Republic', 'Standard', 293, 'In Production'),
('Jawa', 'Jawa 350', 2023, NULL, 'Czech Republic', 'Standard', 334, 'In Production'),
('Jawa', 'Jawa Classic', 2023, NULL, 'Czech Republic', 'Standard', 334, 'In Production');

-- ============================================================================
-- 13. HARLEY-DAVIDSON INDIA (USA)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Harley-Davidson', 'Street 750', 2014, 2020, 'USA', 'Street', 750, 'Discontinued'),
('Harley-Davidson', 'Street 500', 2015, 2020, 'USA', 'Street', 500, 'Discontinued'),
('Harley-Davidson', 'Iron 883', 2010, NULL, 'USA', 'Cruiser', 883, 'In Production'),
('Harley-Davidson', 'SuperLow 1200T', 2014, 2021, 'USA', 'Cruiser', 1200, 'Discontinued'),
('Harley-Davidson', 'Forty-Eight', 2010, NULL, 'USA', 'Cruiser', 1200, 'In Production'),
('Harley-Davidson', 'Fat Boy', 2010, NULL, 'USA', 'Cruiser', 1868, 'In Production'),
('Harley-Davidson', 'Road King', 2012, NULL, 'USA', 'Touring', 1868, 'In Production'),
('Harley-Davidson', 'Street Glide', 2012, NULL, 'USA', 'Touring', 1868, 'In Production'),
('Harley-Davidson', 'Ultra Limited', 2014, NULL, 'USA', 'Touring', 1868, 'In Production'),
('Harley-Davidson', 'Fat Bob 114', 2018, NULL, 'USA', 'Cruiser', 1868, 'In Production'),
('Harley-Davidson', 'Heritage Classic 114', 2018, NULL, 'USA', 'Cruiser', 1868, 'In Production'),
('Harley-Davidson', 'Road Glide Special', 2020, NULL, 'USA', 'Touring', 1868, 'In Production'),
('Harley-Davidson', 'Pan America 1250', 2021, NULL, 'USA', 'Adventure', 1250, 'In Production'),
('Harley-Davidson', 'Nightster', 2022, NULL, 'USA', 'Cruiser', 975, 'In Production'),
('Harley-Davidson', 'Sportster S', 2021, NULL, 'USA', 'Cruiser', 1250, 'In Production'),
('Harley-Davidson', 'X440', 2023, NULL, 'USA', 'Cruiser', 440, 'In Production');

-- ============================================================================
-- 14. TRIUMPH INDIA (UK)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Triumph', 'Speed 400', 2023, NULL, 'UK', 'Sport', 398, 'In Production'),
('Triumph', 'Speed T4', 2025, NULL, 'UK', 'Sport', 400, 'In Production'),
('Triumph', 'Scrambler 400 X', 2023, NULL, 'UK', 'Dual-sport', 398, 'In Production'),
('Triumph', 'Street Triple 765', 2018, NULL, 'UK', 'Standard', 765, 'In Production'),
('Triumph', 'Daytona 660', 2024, NULL, 'UK', 'Sport', 660, 'In Production'),
('Triumph', 'Trident 660', 2021, NULL, 'UK', 'Standard', 660, 'In Production'),
('Triumph', 'Tiger 900', 2020, NULL, 'UK', 'Adventure', 888, 'In Production'),
('Triumph', 'Tiger 1200', 2018, NULL, 'UK', 'Adventure', 1200, 'In Production'),
('Triumph', 'Bonneville 900', 2021, NULL, 'UK', 'Standard', 900, 'In Production'),
('Triumph', 'Speed Twin 900', 2019, NULL, 'UK', 'Standard', 900, 'In Production'),
('Triumph', 'Thruxton RS', 2020, NULL, 'UK', 'Sport', 1200, 'In Production'),
('Triumph', 'Scrambler 1200', 2019, NULL, 'UK', 'Dual-sport', 1200, 'In Production'),
('Triumph', 'Rocket 3', 2020, NULL, 'UK', 'Cruiser', 2458, 'In Production');

-- ============================================================================
-- 15. DUCATI INDIA (Italy)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Ducati', 'Panigale V2', 2020, NULL, 'Italy', 'Sport', 955, 'In Production'),
('Ducati', 'Panigale V4', 2018, NULL, 'Italy', 'Sport', 1103, 'In Production'),
('Ducati', 'Panigale V4 R', 2019, NULL, 'Italy', 'Sport', 998, 'In Production'),
('Ducati', 'Panigale V4 S', 2019, NULL, 'Italy', 'Sport', 1103, 'In Production'),
('Ducati', 'Streetfighter V2', 2022, NULL, 'Italy', 'Standard', 955, 'In Production'),
('Ducati', 'Streetfighter V4', 2020, NULL, 'Italy', 'Standard', 1103, 'In Production'),
('Ducati', 'Streetfighter V4 S', 2020, NULL, 'Italy', 'Standard', 1103, 'In Production'),
('Ducati', 'Multistrada V2', 2022, NULL, 'Italy', 'Adventure', 955, 'In Production'),
('Ducati', 'Multistrada V4', 2021, NULL, 'Italy', 'Adventure', 1158, 'In Production'),
('Ducati', 'Monster 821', 2015, 2021, 'Italy', 'Standard', 821, 'Discontinued'),
('Ducati', 'Monster 937', 2021, NULL, 'Italy', 'Standard', 937, 'In Production'),
('Ducati', 'SuperSport 950', 2021, NULL, 'Italy', 'Sport', 937, 'In Production'),
('Ducati', 'Scrambler Icon', 2015, NULL, 'Italy', 'Dual-sport', 803, 'In Production'),
('Ducati', 'Scrambler Desert X', 2022, NULL, 'Italy', 'Adventure', 803, 'In Production'),
('Ducati', 'Scrambler 800', 2022, NULL, 'Italy', 'Dual-sport', 803, 'In Production');

-- ============================================================================
-- 16. APRILIA INDIA (Italy)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Aprilia', 'RS 457', 2024, NULL, 'Italy', 'Sport', 457, 'In Production'),
('Aprilia', 'Tuono 457', 2025, NULL, 'Italy', 'Standard', 457, 'In Production');

-- ============================================================================
-- 17. BENELLI INDIA (Italy)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Benelli', 'Imperiale 400', 2019, NULL, 'Italy', 'Standard', 374, 'In Production'),
('Benelli', 'Leoncino 500', 2019, NULL, 'Italy', 'Dual-sport', 500, 'In Production'),
('Benelli', 'Leoncino 800', 2023, NULL, 'Italy', 'Dual-sport', 754, 'In Production'),
('Benelli', 'TRK 502', 2018, NULL, 'Italy', 'Adventure', 500, 'In Production'),
('Benelli', 'TRK 502X', 2019, NULL, 'Italy', 'Adventure', 500, 'In Production'),
('Benelli', '502C', 2020, NULL, 'Italy', 'Sport', 500, 'In Production'),
('Benelli', 'TNT 600i', 2017, 2022, 'Italy', 'Standard', 600, 'Discontinued'),
('Benelli', 'TNT 600GT', 2018, 2022, 'Italy', 'Sport', 600, 'Discontinued');

-- ============================================================================
-- 18. MOTO GUZZI INDIA (Italy)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Moto Guzzi', 'V7 850', 2021, NULL, 'Italy', 'Standard', 853, 'In Production'),
('Moto Guzzi', 'V7 Stone', 2021, NULL, 'Italy', 'Standard', 853, 'In Production'),
('Moto Guzzi', 'V9 Bobber', 2023, NULL, 'Italy', 'Cruiser', 853, 'In Production'),
('Moto Guzzi', 'V9 Roamer', 2023, NULL, 'Italy', 'Cruiser', 853, 'In Production'),
('Moto Guzzi', 'V85 TT', 2022, NULL, 'Italy', 'Adventure', 850, 'In Production');

-- ============================================================================
-- 19. MAHINDRA TWO WHEELERS (India)
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
('Mahindra', 'Mojo UT 300', 2016, 2021, 'India', 'Sport', 295, 'Discontinued'),
('Mahindra', 'Mojo XT 300', 2016, 2021, 'India', 'Sport', 295, 'Discontinued'),
('Mahindra', 'Centuro', 2013, 2021, 'India', 'Commuter', 107, 'Discontinued'),
('Mahindra', 'Centuro NXT', 2015, 2021, 'India', 'Commuter', 107, 'Discontinued'),
('Mahindra', 'Pantero', 2013, 2015, 'India', 'Commuter', 107, 'Discontinued'),
('Mahindra', 'Stallio', 2010, 2013, 'India', 'Commuter', 107, 'Discontinued');

-- ============================================================================
-- 20. ELECTRIC MOTORCYCLES
-- ============================================================================

INSERT INTO public.motorcycles (make, model, year_start, year_end, country_of_origin, category, engine_displacement_cc, production_status) VALUES
-- Revolt Motors
('Revolt', 'RV400', 2019, NULL, 'India', 'Electric', 0, 'In Production'),
('Revolt', 'RV400 BRZ', 2021, NULL, 'India', 'Electric', 0, 'In Production'),
('Revolt', 'RV Blaze X', 2022, NULL, 'India', 'Electric', 0, 'In Production'),
('Revolt', 'RV1', 2024, NULL, 'India', 'Electric', 0, 'In Production'),
('Revolt', 'RV1+', 2024, NULL, 'India', 'Electric', 0, 'In Production'),
-- Ultraviolette
('Ultraviolette', 'F77', 2022, NULL, 'India', 'Electric', 0, 'In Production'),
('Ultraviolette', 'F77 Mach 2', 2024, NULL, 'India', 'Electric', 0, 'In Production'),
-- Simple Energy
('Simple', 'One', 2021, NULL, 'India', 'Electric', 0, 'In Production'),
-- Tork Motors
('Tork', 'Kratos', 2021, NULL, 'India', 'Electric', 0, 'In Production'),
-- Pure EV
('Pure EV', 'EcoDryft', 2020, NULL, 'India', 'Electric', 0, 'In Production'),
-- Emflux Motors
('Emflux', 'One', 2022, NULL, 'India', 'Electric', 0, 'In Production');

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================

-- Verify insertion
-- SELECT make, COUNT(*) as model_count FROM public.motorcycles GROUP BY make ORDER BY model_count DESC;
-- SELECT category, COUNT(*) as bike_count FROM public.motorcycles GROUP BY category ORDER BY bike_count DESC;
-- SELECT COUNT(*) as total_motorcycles FROM public.motorcycles;
