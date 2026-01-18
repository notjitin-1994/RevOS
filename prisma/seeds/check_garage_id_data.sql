-- Check if there's any existing data in the customers or customer_vehicles tables
SELECT 'customers table count:' as info, COUNT(*) as count FROM public.customers;
SELECT 'customer_vehicles table count:' as info, COUNT(*) as count FROM public.customer_vehicles;

-- Check the garage_id values in customers table
SELECT 'Sample garage_id values from customers:' as info;
SELECT DISTINCT garage_id, LEFT(garage_id::text, 36) as garage_id_sample
FROM public.customers
LIMIT 5;

-- Check the garage_id values in customer_vehicles table
SELECT 'Sample garage_id values from customer_vehicles:' as info;
SELECT DISTINCT garage_id, LEFT(garage_id::text, 36) as garage_id_sample
FROM public.customer_vehicles
LIMIT 5;

-- Check if there are any NULL values
SELECT 'NULL garage_id in customers:' as info, COUNT(*) FROM public.customers WHERE garage_id IS NULL;
SELECT 'NULL garage_id in customer_vehicles:' as info, COUNT(*) FROM public.customer_vehicles WHERE garage_id IS NULL;
