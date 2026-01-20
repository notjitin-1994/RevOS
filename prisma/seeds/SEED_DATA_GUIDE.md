# Comprehensive Seed Data Guide

This guide explains how to use the comprehensive seed data for the RevvOs Garage Management System.

---

## Files Created

| File | Description |
|------|-------------|
| `prisma/migrations/add_job_cards_missing_columns.sql` | Migration to add missing columns and tables |
| `prisma/seeds/comprehensive_seed_data.sql` | Main seed data file with all dummy data |
| `prisma/seeds/verify_seed_data.sql` | Verification script to check data integrity |

---

## What Data Is Included

### 1. **Users & Employees (8 users)**
- 1 Owner (Rajesh Mehta)
- 1 Admin (Sneha Patel)
- 2 Service Advisors (Vikram Singh, Priya Sharma)
- 3 Mechanics (Amit Kumar, Rahul Verma, Suresh Iyengar)
- 1 Technician (Dinesh Rao)

### 2. **Customers (8 customers)**
- Regular customers with multiple vehicles
- New customers
- VIP customers
- Corporate customers
- Senior citizens
- Students

### 3. **Customer Vehicles (12 vehicles)**
- Honda (Activa 6G, Dio, Activa 7G)
- TVS (Jupiter)
- Suzuki (Access 125)
- Hero (Splendor+, Glamour)
- Bajaj (Pulsar NS200, CT100, Chetak Electric)
- Royal Enfield (Classic 350)
- Yamaha (Fascino)

### 4. **Parts Inventory**
| Item | Count |
|------|-------|
| Categories | 10 |
| Suppliers | 4 |
| Parts | 20 |
| Fitment records | Multiple |
| Backup suppliers | 2 |
| Transactions | 2 |

### 5. **Job Cards (6 job cards)**

| Job Card # | Status | Vehicle | Description |
|------------|--------|---------|-------------|
| JC-2025-0001 | in_progress | Honda Activa 6G | Timing belt replacement |
| JC-2025-0002 | queued | TVS Jupiter | Brake system service |
| JC-2025-0003 | ready | Bajaj Pulsar NS200 | General service (completed) |
| JC-2025-0004 | parts_waiting | Honda Dio | Electrical system repair |
| JC-2025-0005 | in_progress | Bajaj Chetak EV | Battery health check |
| JC-2025-0006 | ready | Honda Activa 125 | Tire replacement |

### 6. **Job Card Relations**
| Item | Count |
|------|-------|
| Checklist Items | 10 |
| Subtasks | 6 |
| Job Card Parts | 6 |
| Time Entries | 2 |
| Activity Log | 7 |
| Status History | 12 |
| Communications | 5 |
| Mechanic Daily Metrics | 5 |

---

## How to Use

### Step 1: Get Your Garage ID

Run this query in Supabase SQL Editor:

```sql
SELECT garage_uid, garage_name FROM public.garages;
```

Copy your `garage_uid` - you'll need it for the next step.

### Step 2: Update the Seed File

1. Open `prisma/seeds/comprehensive_seed_data.sql`
2. Find this line near the top:

```sql
GARAGE_ID UUID := '00000000-0000-0000-0000-000000000000'; -- REPLACE THIS!
```

3. Replace the placeholder UUID with your actual `garage_uid`

### Step 3: Run the Seed Data

1. Open Supabase SQL Editor
2. Create a new query
3. Copy the entire contents of `comprehensive_seed_data.sql`
4. Paste it into the SQL Editor
5. Click "Run"

You should see output like:

```
NOTICE:  Starting comprehensive seed data for garage: <your-uuid>
NOTICE:  Step 1: Creating users and employees...
NOTICE:  Step 2: Creating customers...
...
NOTICE:  ============================================================================
NOTICE:  COMPREHENSIVE SEED DATA CREATED SUCCESSFULLY!
NOTICE:  ============================================================================
```

### Step 4: Verify the Data

1. Open `prisma/seeds/verify_seed_data.sql`
2. Update the garage_id placeholder (same as Step 2)
3. Run the verification script in Supabase SQL Editor

This will show you:
- Count of all records in each table
- Sample data from each table
- Relationship integrity checks
- Any orphaned records or foreign key issues

---

## Database Schema Overview

### Core Tables

```
garages
├── garage_auth (authentication)
│   └── users (employees/customer data)
├── customers
│   └── customer_vehicles
├── parts_suppliers
├── parts_categories
│   └── parts
│       ├── parts_fitment (→ motorcycles)
│       ├── parts_backup_suppliers (→ parts_suppliers)
│       └── parts_transactions
└── job_cards
    ├── job_card_checklist_items
    │   ├── job_card_subtasks
    │   ├── job_card_task_checklist
    │   └── job_card_time_entries
    ├── job_card_parts (→ parts)
    ├── job_card_activity_log
    ├── job_card_status_history
    └── job_card_communications
```

### Key Relationships

| From | To | Relationship |
|------|-----|--------------|
| `customers.garage_id` | `garages.garage_uid` | Many-to-One |
| `customer_vehicles.customer_id` | `customers.id` | Many-to-One |
| `job_cards.customer_id` | `customers.id` | Many-to-One |
| `job_cards.vehicle_id` | `customer_vehicles.id` | Many-to-One |
| `job_cards.lead_mechanic_id` | `users.user_uid` | Many-to-One |
| `job_cards.service_advisor_id` | `users.user_uid` | Many-to-One |
| `job_card_checklist_items.job_card_id` | `job_cards.id` | Many-to-One |
| `job_card_subtasks.parent_task_id` | `job_card_checklist_items.id` | Many-to-One |
| `parts.primary_supplier_id` | `parts_suppliers.id` | Many-to-One |
| `parts_fitment.part_id` | `parts.id` | Many-to-One |
| `parts_fitment.motorcycle_id` | `motorcycles.id` | Many-to-One |

---

## Data Flow Example

### Creating a Job Card

1. **Customer** (Ramesh Gupta) brings **Vehicle** (Honda Activa 6G) for service
2. **Service Advisor** (Vikram Singh) creates **Job Card** (JC-2025-0001)
3. **Job Card** has:
   - Customer reported issues (array)
   - Work requested items (array)
   - Technical diagnosis items (array)
4. **Mechanic** (Amit Kumar) assigned, creates **Checklist Items**
5. Each **Checklist Item** can have:
   - **Subtasks** (e.g., "Drain coolant", "Remove belt")
   - **Time Entries** (for billing)
   - Links to issues/diagnosis
6. **Parts** are allocated from inventory via **Job Card Parts**
7. **Activity Log** tracks all changes
8. **Status History** tracks status changes
9. **Communications** track customer interactions

---

## Common Queries

### Get All Active Job Cards

```sql
SELECT
  jc.job_card_number,
  c.first_name || ' ' || c.last_name as customer_name,
  cv.make || ' ' || cv.model as vehicle,
  jc.status,
  jc.priority,
  jc.promised_date
FROM public.job_cards jc
JOIN public.customers c ON jc.customer_id = c.id
JOIN public.customer_vehicles cv ON jc.vehicle_id = cv.id
WHERE jc.garage_id = 'YOUR_GARAGE_ID'
  AND jc.deleted_at IS NULL
ORDER BY jc.created_at DESC;
```

### Get Parts with Low Stock

```sql
SELECT
  part_number,
  part_name,
  category,
  on_hand_stock,
  low_stock_threshold,
  stock_status
FROM public.parts
WHERE garage_id = 'YOUR_GARAGE_ID'
  AND stock_status IN ('low-stock', 'out-of-stock')
ORDER BY stock_status, part_name;
```

### Get Mechanic Performance

```sql
SELECT
  u.first_name || ' ' || u.last_name as mechanic_name,
  COUNT(DISTINCT ci.job_card_id) as total_jobs,
  SUM(ci.actual_minutes) / 60.0 as total_hours,
  SUM(ci.labor_cost) as total_revenue
FROM public.users u
JOIN public.job_card_checklist_items ci ON u.user_uid = ci.assigned_to
JOIN public.job_cards jc ON ci.job_card_id = jc.id
WHERE jc.garage_id = 'YOUR_GARAGE_ID'
  AND ci.status = 'completed'
GROUP BY u.user_uid, u.first_name, u.last_name
ORDER BY total_revenue DESC;
```

---

## Troubleshooting

### Error: "Invalid garage_id"

**Solution**: Make sure you replaced the placeholder UUID with your actual garage_id from the garages table.

### Error: "Foreign key violation"

**Solution**: Run the migrations first to ensure all tables exist:
1. Run `add_job_cards_missing_columns.sql`
2. Then run the seed data

### Missing motorcycle data

**Solution**: The seed data expects the `motorcycles` table to be populated. Run:
```sql
SELECT 'Motorcycles table has % records', COUNT(*) FROM public.motorcycles;
```

If the count is 0, import the motorcycle seed data first.

### Parts fitment not working

**Solution**: Make sure the `motorcycles` table has matching makes/models:
```sql
SELECT make, model FROM public.motorcycles WHERE make = 'Honda';
```

---

## Next Steps

After running the seed data:

1. **Test the application** - Login with the owner account:
   - Email: `owner@revosgarage.com`
   - You'll need to set a password via Supabase Auth

2. **Explore job cards** - View the job cards at:
   - `/job-cards` - List view
   - `/job-cards/[id]` - Detail view (use IDs from database)

3. **Check parts inventory** - Verify parts are showing correctly

4. **Test workflows**:
   - Create new job card
   - Add checklist items
   - Allocate parts
   - Track time
   - Update status

---

## Resetting Data

To clear all seed data and start fresh:

```sql
-- WARNING: This will delete ALL data for the garage
-- Replace with your garage_id

DELETE FROM public.mechanic_daily_metrics WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.job_card_communications WHERE job_card_id IN (SELECT id FROM public.job_cards WHERE garage_id = 'YOUR_GARAGE_ID');
DELETE FROM public.job_card_status_history WHERE job_card_id IN (SELECT id FROM public.job_cards WHERE garage_id = 'YOUR_GARAGE_ID');
DELETE FROM public.job_card_activity_log WHERE job_card_id IN (SELECT id FROM public.job_cards WHERE garage_id = 'YOUR_GARAGE_ID');
DELETE FROM public.job_card_time_entries WHERE checklist_item_id IN (SELECT id FROM public.job_card_checklist_items WHERE garage_id = 'YOUR_GARAGE_ID');
DELETE FROM public.job_card_subtasks WHERE job_card_id IN (SELECT id FROM public.job_cards WHERE garage_id = 'YOUR_GARAGE_ID');
DELETE FROM public.job_card_checklist_items WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.job_card_parts WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.job_cards WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.parts_transactions WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.parts_backup_suppliers WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.parts_fitment WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.parts WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.parts_suppliers WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.parts_categories WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.customer_vehicles WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.customers WHERE garage_id = 'YOUR_GARAGE_ID';
DELETE FROM public.users WHERE garage_uid = 'YOUR_GARAGE_ID';
DELETE FROM public.garage_auth WHERE garage_id = 'YOUR_GARAGE_ID';
```

---

## Support

For issues or questions:
1. Check the verification script output
2. Review foreign key relationships
3. Ensure all migrations have been run
4. Check Supabase logs for errors
