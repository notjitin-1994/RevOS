# Job Card Data Collection - Complete Summary

## Overview

This document summarizes the comprehensive revamp of the job card data collection system to ensure **ALL data collected from the UI is saved to the database** without fail.

## Changes Made

### 1. Database Migrations Required

#### Migration 1: Checklist Items Enhancements
**File**: `prisma/migrations/20260123_add_checklist_item_subtasks_and_linking.sql`

This migration adds the following columns to the `job_card_checklist_items` table:

#### Migration 2: Technical Diagnosis Column
**File**: `prisma/migrations/20260123_add_technical_diagnosis_column.sql`

This migration adds the `technical_diagnosis` column to the `job_cards` table to store technician's diagnosis information.

| Column | Type | Description |
|--------|------|-------------|
| `subtasks` | JSONB | Array of subtasks with structure: `[{ id, name, description, estimatedMinutes, completed, displayOrder }]` |
| `linked_to_customer_issues` | JSONB | Array of indices linking to customerReportIssues array |
| `linked_to_service_scope` | JSONB | Array of indices linking to workRequestedItems array |
| `linked_to_technical_diagnosis` | JSONB | Array of indices linking to technicalDiagnosisItems array |

### 2. TypeScript Type Updates

#### File: `app/job-cards/lib/utils/collect-job-card-data.ts`

**Updated `ChecklistItem` interface** (already had these fields, now they're properly used):
- `subtasks` - Array of subtask objects
- `linkedToCustomerIssues` - Number array of indices
- `linkedToServiceScope` - Number array of indices
- `linkedToTechnicalDiagnosis` - Number array of indices

**Updated `CollectedJobCardData` interface**:
- Removed duplicate `customerName`, `customerPhone`, `customerEmail` fields (customer data already in `customers` table)
- Removed duplicate `vehicleMake`, `vehicleModel`, `vehicleYear`, `vehicleLicensePlate`, `vehicleVin` fields (vehicle data already in `customer_vehicles` table)
- Added subtasks and linking arrays to checklist items type definition

**Updated `collectJobCardData` function**:
- Now properly maps and passes through `subtasks` with all nested fields
- Now properly maps and passes through `linkedToCustomerIssues`
- Now properly maps and passes through `linkedToServiceScope`
- Now properly maps and passes through `linkedToTechnicalDiagnosis`

#### File: `lib/supabase/job-card-queries.ts`

**Updated `DbChecklistItem` interface**:
- Added `subtasks` field (JSONB array or null)
- Added `linked_to_customer_issues` field (number array or null)
- Added `linked_to_service_scope` field (number array or null)
- Added `linked_to_technical_diagnosis` field (number array or null)

**Updated `ChecklistItemData` interface**:
- Added `subtasks` field (optional array)
- Added `linkedToCustomerIssues` field (optional number array)
- Added `linkedToServiceScope` field (optional number array)
- Added `linkedToTechnicalDiagnosis` field (optional number array)

**Updated `transformChecklistItem` function**:
- Now transforms all subtasks and linking fields from DB to frontend format

**Updated `createJobCard` function**:
- Uncommented all previously commented-out fields (priority, timer fields, cost fields)
- Added `subtasks`, `linked_to_customer_issues`, `linked_to_service_scope`, `linked_to_technical_diagnosis` to itemsToInsert mapping

**Updated `updateJobCard` function**:
- Uncommented all previously commented-out fields
- Added all subtasks and linking fields to itemsToInsert mapping

## Data Flow Summary

### What Data is Being Collected and Saved

#### Job Card Table (`job_cards`)
| Field | Source | Status |
|-------|--------|--------|
| `garage_id` | garageId | ✓ Saved |
| `customer_id` | selectedCustomer.id | ✓ Saved |
| `vehicle_id` | selectedVehicle.id | ✓ Saved |
| `job_type` | jobType | ✓ Saved |
| `priority` | priority | ✓ Saved |
| `status` | draft/queued | ✓ Saved |
| `customer_complaint` | customerReportIssues (joined with ' | ') | ✓ Saved |
| `work_requested` | workRequestedItems (joined with ' | ') | ✓ Saved |
| `customer_notes` | customerNotes | ✓ Saved |
| `current_mileage` | currentMileage | ✓ Saved |
| `technical_diagnosis` | technicalDiagnosisItems (joined with ' | ') | ✓ Saved |
| `promised_date` | promisedDate | ✓ Saved |
| `promised_time` | promisedTime | ✓ Saved |
| `lead_mechanic_id` | leadMechanicId | ✓ Saved |
| `technician_notes` | technicianNotes | ✓ Saved |
| `service_advisor_id` | serviceAdvisorId | ✓ Saved |
| `created_by` | userId | ✓ Saved |

**Note**: Customer and vehicle details are NOT duplicated. The job card only stores the foreign keys (`customer_id` and `vehicle_id`). The actual customer and vehicle data reside in the `customers` and `customer_vehicles` tables respectively.

#### Checklist Items Table (`job_card_checklist_items`)
| Field | Source | Status |
|-------|--------|--------|
| `mechanic_id` | leadMechanicId | ✓ Saved |
| `item_name` | itemName | ✓ Saved |
| `description` | description | ✓ Saved |
| `category` | category | ✓ Saved |
| `status` | 'pending' | ✓ Saved |
| `priority` | priority | ✓ Saved (was commented out) |
| `estimated_minutes` | estimatedMinutes | ✓ Saved |
| `actual_minutes` | 0 (initial) | ✓ Saved |
| `is_timer_running` | false (initial) | ✓ Saved (was commented out) |
| `timer_started_at` | null (initial) | ✓ Saved (was commented out) |
| `total_time_spent` | 0 (initial) | ✓ Saved (was commented out) |
| `labor_rate` | laborRate | ✓ Saved (was commented out) |
| `labor_cost` | 0 (initial) | ✓ Saved (was commented out) |
| `display_order` | displayOrder | ✓ Saved |
| `mechanic_notes` | null (initial) | ✓ Saved |
| **`subtasks`** | **subtasks array** | ✓ **NOW SAVED** |
| **`linked_to_customer_issues`** | **linkedToCustomerIssues** | ✓ **NOW SAVED** |
| **`linked_to_service_scope`** | **linkedToServiceScope** | ✓ **NOW SAVED** |
| **`linked_to_technical_diagnosis`** | **linkedToTechnicalDiagnosis** | ✓ **NOW SAVED** |

#### Parts Table (`job_card_parts`)
| Field | Source | Status |
|-------|--------|--------|
| `part_id` | partId | ✓ Saved |
| `part_name` | partName | ✓ Saved |
| `part_number` | partNumber | ✓ Saved |
| `quantity_requested` | quantity | ✓ Saved |
| `unit_price` | unitPrice | ✓ Saved |
| `total_price` | totalPrice | ✓ Saved |

**Note**: `manufacturer` and `category` are NOT collected by the UI currently, so they are not saved.

## Migration Instructions

### Step 1: Run Both SQL Migrations

**Option 1: Supabase Dashboard**
1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run each migration file in order:

**Migration 1: Checklist Items Enhancements**
```
File: prisma/migrations/20260123_add_checklist_item_subtasks_and_linking.sql
```

**Migration 2: Technical Diagnosis Column**
```
File: prisma/migrations/20260123_add_technical_diagnosis_column.sql
```

**Option 2: psql command line**
```bash
# Run checklist items migration
psql "postgresql://user:password@host:5432/postgres" -f prisma/migrations/20260123_add_checklist_item_subtasks_and_linking.sql

# Run technical diagnosis migration
psql "postgresql://user:password@host:5432/postgres" -f prisma/migrations/20260123_add_technical_diagnosis_column.sql
```

### Step 2: Verify the Migrations

Run these queries to verify the new columns exist:

**Check job_cards table:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'job_cards'
  AND column_name = 'technical_diagnosis';
```

Expected output:
```
     column_name     | data_type | is_nullable
---------------------+-----------+-------------
 technical_diagnosis | text      | YES
```

**Check job_card_checklist_items table:**
```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'job_card_checklist_items'
  AND column_name IN ('subtasks', 'linked_to_customer_issues', 'linked_to_service_scope', 'linked_to_technical_diagnosis')
ORDER BY column_name;
```

Expected output:
```
             column_name             | data_type | is_nullable
-------------------------------------+-----------+-------------
 linked_to_customer_issues           | jsonb     | YES
 linked_to_service_scope             | jsonb     | YES
 linked_to_technical_diagnosis       | jsonb     | YES
 subtasks                            | jsonb     | YES
```

### Step 3: Test the Data Flow

1. Create a new job card with:
   - A task with subtasks
   - A task linked to customer issues
   - A task linked to service scope items
   - A task linked to technical diagnosis items
2. Save the job card
3. Query the database to verify the data was saved:

```sql
SELECT
  item_name,
  subtasks,
  linked_to_customer_issues,
  linked_to_service_scope,
  linked_to_technical_diagnosis
FROM job_card_checklist_items
WHERE job_card_id = 'YOUR_JOB_CARD_ID';
```

## Files Modified

| File | Description |
|------|-------------|
| `prisma/migrations/20260123_add_checklist_item_subtasks_and_linking.sql` | Checklist items subtasks and linking migration |
| `prisma/migrations/20260123_add_technical_diagnosis_column.sql` | Technical diagnosis column migration |
| `app/job-cards/lib/utils/collect-job-card-data.ts` | Data collection function and types |
| `lib/supabase/job-card-queries.ts` | Database queries and types |

## Important Notes

1. **Data Snapshot Pattern**: The job_cards table stores a **snapshot** (denormalized copy) of customer and vehicle data at the time of job card creation. This is intentional - it preserves historical data even if the customer or vehicle records are updated later. The database has NOT NULL constraints on these snapshot fields, so they must always be provided:
   - `customer_name`, `customer_phone`, `customer_email` (email is optional)
   - `vehicle_make`, `vehicle_model`, `vehicle_year`, `vehicle_license_plate`, `vehicle_vin` (vin is optional)

2. **Foreign Keys Still Exist**: The job cards table also has foreign keys (`customer_id`, `vehicle_id`) pointing to the main customer and vehicle tables for referential integrity.

3. **Backwards Compatibility**: The new JSONB columns default to empty arrays (`'[]'::jsonb`), so existing code will continue to work.

4. **Gin Indexes**: The migration adds GIN indexes to the JSONB columns for efficient querying.

5. **Future Enhancements**: If you want to collect `manufacturer` and `category` for parts, you would need to:
   - Update the `selectedParts` state in `page.tsx` to include these fields
   - Update the `PartItem` interface in `collect-job-card-data.ts`
   - Update the parts collection to pass these fields
