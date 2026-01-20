-- ============================================================================
-- SEED DATA VERIFICATION SCRIPT
-- ============================================================================
-- Run this after comprehensive_seed_data.sql to verify all data was created
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'VERIFYING SEED DATA...';
  RAISE NOTICE '============================================================================';
END $$;

-- ============================================================================
-- 1. VERIFY USERS/EMPLOYEES
-- ============================================================================
SELECT '===== USERS/EMPLOYEES =====' as section;
SELECT
  user_role,
  COUNT(*) as count,
  STRING_AGG(DISTINCT first_name || ' ' || last_name, ', ') as names
FROM public.users
WHERE garage_uid = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY user_role
ORDER BY user_role;

-- ============================================================================
-- 2. VERIFY CUSTOMERS
-- ============================================================================
SELECT '===== CUSTOMERS =====' as section;
SELECT
  COUNT(*) as total_customers,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active_customers
FROM public.customers
WHERE garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id;

-- ============================================================================
-- 3. VERIFY CUSTOMER VEHICLES
-- ============================================================================
SELECT '===== CUSTOMER VEHICLES =====' as section;
SELECT
  c.first_name || ' ' || c.last_name as customer_name,
  COUNT(*) as vehicle_count,
  STRING_AGG(cv.make || ' ' || cv.model || ' (' || cv.license_plate || ')', ', ') as vehicles
FROM public.customer_vehicles cv
JOIN public.customers c ON cv.customer_id = c.id
WHERE cv.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY c.id, c.first_name, c.last_name
ORDER BY vehicle_count DESC
LIMIT 5;

-- ============================================================================
-- 4. VERIFY PARTS CATEGORIES
-- ============================================================================
SELECT '===== PARTS CATEGORIES =====' as section;
SELECT
  category_name,
  description,
  display_order
FROM public.parts_categories
WHERE garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
ORDER BY display_order;

-- ============================================================================
-- 5. VERIFY PARTS SUPPLIERS
-- ============================================================================
SELECT '===== PARTS SUPPLIERS =====' as section;
SELECT
  supplier_code,
  supplier_name,
  contact_person,
  phone,
  is_preferred,
  rating
FROM public.parts_suppliers
WHERE garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
ORDER BY is_preferred DESC, supplier_name;

-- ============================================================================
-- 6. VERIFY PARTS INVENTORY
-- ============================================================================
SELECT '===== PARTS INVENTORY SUMMARY =====' as section;
SELECT
  category,
  COUNT(*) as part_count,
  SUM(on_hand_stock) as total_on_hand,
  SUM(warehouse_stock) as total_warehouse,
  SUM(purchase_price * on_hand_stock) as total_inventory_value
FROM public.parts
WHERE garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY category
ORDER BY category;

-- Low stock items
SELECT '===== LOW STOCK ITEMS =====' as section;
SELECT
  part_number,
  part_name,
  category,
  on_hand_stock,
  low_stock_threshold,
  stock_status
FROM public.parts
WHERE garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
  AND stock_status IN ('low-stock', 'out-of-stock')
ORDER BY on_hand_stock ASC;

-- ============================================================================
-- 7. VERIFY PARTS FITMENT
-- ============================================================================
SELECT '===== PARTS FITMENT =====' as section;
SELECT
  p.part_number,
  p.part_name,
  COUNT(pf.motorcycle_id) as fitment_count,
  STRING_AGG(m.make || ' ' || m.model, ', ') as fits
FROM public.parts p
LEFT JOIN public.parts_fitment pf ON p.id = pf.part_id
LEFT JOIN public.motorcycles m ON pf.motorcycle_id = m.id
WHERE p.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY p.part_number, p.part_name
HAVING COUNT(pf.motorcycle_id) > 0
ORDER BY fitment_count DESC
LIMIT 10;

-- ============================================================================
-- 8. VERIFY JOB CARDS
-- ============================================================================
SELECT '===== JOB CARDS SUMMARY =====' as section;
SELECT
  status,
  priority,
  job_type,
  COUNT(*) as count
FROM public.job_cards
WHERE garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY status, priority, job_type
ORDER BY status, priority;

-- ============================================================================
-- 9. VERIFY CHECKLIST ITEMS
-- ============================================================================
SELECT '===== CHECKLIST ITEMS SUMMARY =====' as section;
SELECT
  jc.job_card_number,
  COUNT(ci.id) as total_items,
  COUNT(CASE WHEN ci.status = 'completed' THEN 1 END) as completed,
  COUNT(CASE WHEN ci.status = 'in_progress' THEN 1 END) as in_progress,
  COUNT(CASE WHEN ci.status = 'pending' THEN 1 END) as pending
FROM public.job_cards jc
LEFT JOIN public.job_card_checklist_items ci ON jc.id = ci.job_card_id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY jc.job_card_number
ORDER BY jc.job_card_number;

-- ============================================================================
-- 10. VERIFY SUBTASKS
-- ============================================================================
SELECT '===== SUBTASKS =====' as section;
SELECT
  jc.job_card_number,
  ci.item_name as parent_task,
  COUNT(st.id) as subtask_count,
  COUNT(CASE WHEN st.completed = true THEN 1 END) as completed
FROM public.job_cards jc
JOIN public.job_card_checklist_items ci ON jc.id = ci.job_card_id
LEFT JOIN public.job_card_subtasks st ON ci.id = st.parent_task_id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY jc.job_card_number, ci.item_name
HAVING COUNT(st.id) > 0;

-- ============================================================================
-- 11. VERIFY JOB CARD PARTS
-- ============================================================================
SELECT '===== JOB CARD PARTS =====' as section;
SELECT
  jc.job_card_number,
  COUNT(jcp.id) as total_parts,
  COUNT(CASE WHEN jcp.status = 'used' THEN 1 END) as used,
  COUNT(CASE WHEN jcp.status = 'received' THEN 1 END) as received,
  COUNT(CASE WHEN jcp.status = 'ordered' THEN 1 END) as ordered,
  SUM(jcp.quantity_used) as total_quantity_used
FROM public.job_cards jc
LEFT JOIN public.job_card_parts jcp ON jc.id = jcp.job_card_id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY jc.job_card_number
ORDER BY jc.job_card_number;

-- ============================================================================
-- 12. VERIFY ACTIVITY LOG
-- ============================================================================
SELECT '===== ACTIVITY LOG =====' as section;
SELECT
  jc.job_card_number,
  COUNT(al.id) as activity_count,
  STRING_AGG(DISTINCT al.activity_type, ', ') as activity_types
FROM public.job_cards jc
LEFT JOIN public.job_card_activity_log al ON jc.id = al.job_card_id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY jc.job_card_number
ORDER BY jc.job_card_number;

-- ============================================================================
-- 13. VERIFY STATUS HISTORY
-- ============================================================================
SELECT '===== STATUS HISTORY =====' as section;
SELECT
  jc.job_card_number,
  COUNT(sh.id) as status_changes,
  STRING_AGG(old_status || '→' || new_status, ', ') as transitions
FROM public.job_cards jc
LEFT JOIN public.job_card_status_history sh ON jc.id = sh.job_card_id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY jc.job_card_number
ORDER BY jc.job_card_number;

-- ============================================================================
-- 14. VERIFY COMMUNICATIONS
-- ============================================================================
SELECT '===== COMMUNICATIONS =====' as section;
SELECT
  jc.job_card_number,
  COUNT(com.id) as communication_count,
  STRING_AGG(DISTINCT com.communication_type || '-' || com.direction, ', ') as comm_types
FROM public.job_cards jc
LEFT JOIN public.job_card_communications com ON jc.id = com.job_card_id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY jc.job_card_number
ORDER BY jc.job_card_number;

-- ============================================================================
-- 15. VERIFY TIME ENTRIES
-- ============================================================================
SELECT '===== TIME ENTRIES =====' as section;
SELECT
  jc.job_card_number,
  COUNT(te.id) as time_entries,
  SUM(te.duration_seconds) / 3600.0 as total_hours_logged
FROM public.job_cards jc
LEFT JOIN public.job_card_checklist_items ci ON jc.id = ci.job_card_id
LEFT JOIN public.job_card_time_entries te ON ci.id = te.checklist_item_id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
GROUP BY jc.job_card_number
ORDER BY jc.job_card_number;

-- ============================================================================
-- 16. VERIFY MECHANIC DAILY METRICS
-- ============================================================================
SELECT '===== MECHANIC DAILY METRICS =====' as section;
SELECT
  u.first_name || ' ' || u.last_name as mechanic_name,
  mdm.metric_date,
  mdm.jobs_completed,
  mdm.jobs_in_progress,
  mdm.total_hours_worked,
  mdm.total_labor_cost
FROM public.mechanic_daily_metrics mdm
JOIN public.users u ON mdm.mechanic_id = u.user_uid
WHERE mdm.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
ORDER BY mdm.metric_date DESC, u.first_name, u.last_name;

-- ============================================================================
-- 17. RELATIONSHIP INTEGRITY CHECKS
-- ============================================================================
SELECT '===== FOREIGN KEY VERIFICATION =====' as section;

-- Check orphaned job cards (no customer)
SELECT 'Orphaned job cards (no customer):' as check_name,
  COUNT(*) as count
FROM public.job_cards jc
LEFT JOIN public.customers c ON jc.customer_id = c.id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
  AND c.id IS NULL;

-- Check orphaned vehicles (no customer)
SELECT 'Orphaned vehicles (no customer):' as check_name,
  COUNT(*) as count
FROM public.customer_vehicles cv
LEFT JOIN public.customers c ON cv.customer_id = c.id
WHERE cv.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
  AND c.id IS NULL;

-- Check orphaned checklist items (no job card)
SELECT 'Orphaned checklist items (no job card):' as check_name,
  COUNT(*) as count
FROM public.job_card_checklist_items ci
LEFT JOIN public.job_cards jc ON ci.job_card_id = jc.id
WHERE ci.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
  AND jc.id IS NULL;

-- Check orphaned job card parts (no job card)
SELECT 'Orphaned job card parts (no job card):' as check_name,
  COUNT(*) as count
FROM public.job_card_parts jcp
LEFT JOIN public.job_cards jc ON jcp.job_card_id = jc.id
WHERE jcp.garage_id = '00000000-0000-0000-0000-000000000000'  -- Replace with your garage_id
  AND jc.id IS NULL;

-- ============================================================================
-- 18. COMPREHENSIVE COUNT SUMMARY
-- ============================================================================
SELECT '===== COMPREHENSIVE TABLE COUNTS =====' as section;
SELECT
  'Users (employees)' as table_name, COUNT(*) as record_count, 'garage_uid = garage_id' as condition_used
FROM public.users
WHERE garage_uid = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Customers', COUNT(*), 'garage_id'
FROM public.customers
WHERE garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Customer Vehicles', COUNT(*), 'garage_id'
FROM public.customer_vehicles
WHERE garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Parts Categories', COUNT(*), 'garage_id'
FROM public.parts_categories
WHERE garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Parts Suppliers', COUNT(*), 'garage_id'
FROM public.parts_suppliers
WHERE garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Parts', COUNT(*), 'garage_id'
FROM public.parts
WHERE garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Parts Fitment', COUNT(*), 'garage_id'
FROM public.parts_fitment
WHERE garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Parts Backup Suppliers', COUNT(*), 'garage_id'
FROM public.parts_backup_suppliers
WHERE garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Parts Transactions', COUNT(*), 'garage_id'
FROM public.parts_transactions
WHERE garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Job Cards', COUNT(*), 'garage_id'
FROM public.job_cards
WHERE garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Job Card Checklist Items', COUNT(*), 'garage_id'
FROM public.job_card_checklist_items ci
JOIN public.job_cards jc ON ci.job_card_id = jc.id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Job Card Subtasks', COUNT(*), 'garage_id'
FROM public.job_card_subtasks st
JOIN public.job_cards jc ON st.job_card_id = jc.id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Job Card Parts', COUNT(*), 'garage_id'
FROM public.job_card_parts jcp
JOIN public.job_cards jc ON jcp.job_card_id = jc.id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Job Card Time Entries', COUNT(*), 'garage_id'
FROM public.job_card_time_entries te
JOIN public.job_card_checklist_items ci ON te.checklist_item_id = ci.id
JOIN public.job_cards jc ON ci.job_card_id = jc.id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Job Card Activity Log', COUNT(*), 'garage_id'
FROM public.job_card_activity_log al
JOIN public.job_cards jc ON al.job_card_id = jc.id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Job Card Status History', COUNT(*), 'garage_id'
FROM public.job_card_status_history sh
JOIN public.job_cards jc ON sh.job_card_id = jc.id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Job Card Communications', COUNT(*), 'garage_id'
FROM public.job_card_communications com
JOIN public.job_cards jc ON com.job_card_id = jc.id
WHERE jc.garage_id = '00000000-0000-0000-0000-000000000000'
UNION ALL
SELECT 'Mechanic Daily Metrics', COUNT(*), 'garage_id'
FROM public.mechanic_daily_metrics mdm
WHERE mdm.garage_id = '00000000-0000-0000-0000-000000000000'
ORDER BY table_name;

-- ============================================================================
-- FINAL MESSAGE
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'VERIFICATION COMPLETE!';
  RAISE NOTICE '============================================================================';
  RAISE NOTICE 'Make sure to replace the placeholder garage_id in this script';
  RAISE NOTICE 'with your actual garage_id from the garages table.';
  RAISE NOTICE '============================================================================';
END $$;
