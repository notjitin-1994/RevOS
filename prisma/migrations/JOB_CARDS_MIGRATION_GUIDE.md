# Job Cards Migration Guide

This guide explains how to run the migration and seed data for the enhanced job cards system.

---

## Files Created

1. **Migration File**: `/prisma/migrations/add_job_cards_missing_columns.sql`
   - Adds all missing columns to `job_cards` table
   - Creates new tables: `job_card_subtasks`, `job_card_task_checklist`, `job_card_activity_log`, `job_card_communications`

2. **Seed Data File**: `/prisma/seeds/seed_job_cards_data.sql`
   - Inserts 4 sample job cards with full details
   - Includes checklist items, subtasks, parts, activity log, and communications

---

## New Columns Added to `job_cards` Table

| Column | Type | Description |
|--------|------|-------------|
| `reported_issue` | JSONB | Single reported issue (text) |
| `customer_reported_issues` | JSONB | Array of customer complaints |
| `work_requested_items` | JSONB | Array of requested services |
| `technical_diagnosis_items` | JSONB | Array of diagnosis items |
| `tags` | JSONB | Job card tags |
| `job_tags` | JSONB | Additional job category tags |
| `actual_labor_minutes` | INTEGER | Actual time spent |
| `estimated_labor_minutes` | INTEGER | Estimated time |
| `source` | VARCHAR | walk-in, phone, web, email, referral, other |
| `vehicle_condition_on_arrival` | TEXT | Vehicle condition notes |
| `vehicle_images` | JSONB | Before/after photos |
| `drop_off_mileage` | INTEGER | Mileage at drop-off |
| `drop_off_fuel_level` | VARCHAR | Fuel level (empty to full) |
| `drop_off_notes` | TEXT | Drop-off notes |
| `payment_method` | VARCHAR | cash, card, upi, bank-transfer |
| `payment_reference` | VARCHAR | Payment transaction ID |
| `payment_date` | TIMESTAMPTZ | When payment was made |
| `estimated_start_date` | DATE | Expected start date |
| `estimated_completion_date` | DATE | Expected completion date |
| `customer_approval_status` | VARCHAR | pending, approved, declined, no-response |
| `customer_approval_datetime` | TIMESTAMPTZ | Approval timestamp |
| `customer_approval_notes` | TEXT | Approval notes |
| `delivery_method` | VARCHAR | pickup, drop-off, delivery |
| `delivery_address` | TEXT | Delivery address |
| `delivery_datetime` | TIMESTAMPTZ | Delivery time |
| `delivery_notes` | TEXT | Delivery notes |
| `follow_up_required` | BOOLEAN | Needs follow-up? |
| `follow_up_date` | DATE | Follow-up due date |
| `follow_up_notes` | TEXT | Follow-up notes |
| `warranty_type` | VARCHAR | Warranty type |
| `warranty_months` | INTEGER | Warranty duration (months) |
| `warranty_km` | INTEGER | Warranty distance (km) |

---

## New Columns Added to `job_card_checklist_items` Table

| Column | Type | Description |
|--------|------|-------------|
| `linked_issues` | JSONB | Indices of customer issues linked to this task |
| `linked_service_items` | JSONB | Indices of work items linked to this task |
| `linked_diagnosis_items` | JSONB | Indices of diagnosis items linked to this task |
| `tags` | JSONB | Task tags |
| `parent_task_id` | UUID | Parent task ID for hierarchical structure |
| `task_type` | VARCHAR | main, subtask, milestone |

---

## New Tables Created

### 1. `job_card_subtasks`
Subtasks within a checklist item (e.g., "Drain coolant", "Remove old belt" within "Replace timing belt")

### 2. `job_card_task_checklist`
Individual checklist items within a task (e.g., "Verify torque", "Test start")

### 3. `job_card_activity_log`
Comprehensive activity log for all job card events

### 4. `job_card_communications`
Track all communications with customers (SMS, email, WhatsApp, phone, in-person)

---

## How to Run the Migration

### Step 1: Get Your Garage ID and User IDs

Before running the seed data, you need to replace placeholder IDs:

```sql
-- Get your garage ID
SELECT id, garage_id FROM public.garage_auth LIMIT 5;

-- Get customer IDs
SELECT id, first_name, last_name FROM public.customers LIMIT 10;

-- Get vehicle IDs
SELECT id, make, model, license_plate FROM public.customer_vehicles LIMIT 10;
```

### Step 2: Update the Seed File

Open `/prisma/seeds/seed_job_cards_data.sql` and replace these placeholder UUIDs at the top of the file:

```sql
v_garage_id UUID := '00000000-0000-0000-0000-000000000000'; -- REPLACE
v_service_advisor_id UUID := '00000000-0000-0000-0000-000000000001'; -- REPLACE
v_mechanic_1_id UUID := '00000000-0000-0000-0000-000000000002'; -- REPLACE
-- ... etc
```

### Step 3: Run in Supabase SQL Editor

1. Go to your Supabase project → SQL Editor
2. Open a new query
3. Copy and paste the content of `/prisma/migrations/add_job_cards_missing_columns.sql`
4. Click "Run" to execute the migration
5. You should see: `Job cards missing columns and tables added successfully!`

### Step 4: Run the Seed Data (Optional)

1. In the same SQL Editor, create a new query
2. Copy and paste the content of `/prisma/seeds/seed_job_cards_data.sql` (after updating IDs)
3. Click "Run" to insert seed data
4. You should see: `Job cards seed data inserted successfully!`

---

## Verify the Migration

Run these queries to verify everything was created:

```sql
-- Check new columns in job_cards
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'job_cards'
AND column_name IN ('customer_reported_issues', 'work_requested_items', 'technical_diagnosis_items')
ORDER BY column_name;

-- Check new tables
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('job_card_subtasks', 'job_card_task_checklist', 'job_card_activity_log', 'job_card_communications');

-- Count seed data
SELECT 'job_cards' as table_name, COUNT(*) FROM public.job_cards
UNION ALL
SELECT 'job_card_checklist_items', COUNT(*) FROM public.job_card_checklist_items
UNION ALL
SELECT 'job_card_subtasks', COUNT(*) FROM public.job_card_subtasks
UNION ALL
SELECT 'job_card_parts', COUNT(*) FROM public.job_card_parts
UNION ALL
SELECT 'job_card_activity_log', COUNT(*) FROM public.job_card_activity_log
UNION ALL
SELECT 'job_card_communications', COUNT(*) FROM public.job_card_communications;

-- View sample job card with JSONB data
SELECT
  job_card_number,
  status,
  priority,
  customer_reported_issues,
  work_requested_items,
  technical_diagnosis_items,
  tags
FROM public.job_cards
LIMIT 1;
```

---

## Seed Data Summary

The seed file creates 4 job cards:

| Job Card | Status | Description |
|----------|--------|-------------|
| JC-2025-0001 | in_progress | Engine timing belt replacement (Honda Activa) |
| JC-2025-0002 | queued | Brake system service (Hero Splendor+) |
| JC-2025-0003 | ready | General service - completed (Bajaj Pulsar) |
| JC-2025-0004 | parts_waiting | Electrical system repair (Honda Activa) |

Each job card includes:
- Customer and vehicle information
- Customer reported issues (array)
- Work requested items (array)
- Technical diagnosis items (array)
- Tasks/checklist items with links to issues
- Subtasks for complex tasks
- Parts used
- Activity log
- Status history
- Communications

---

## Next Steps

After running the migration:

1. **Update TypeScript types** in `/lib/supabase/job-card-queries.ts` to include new fields
2. **Update the create page** (`/app/job-cards/create/page.tsx`) to save array data as JSONB
3. **Update the view page** (`/app/job-cards/[id]/page.tsx`) to fetch and display real data
4. **Create API endpoints** for the new tables (subtasks, activity log, communications)
