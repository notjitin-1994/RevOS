# Parts Management API - Quick Reference Guide

## Database Functions (PostgreSQL RPC)

### allocate_parts_to_job_card()
Allocates parts to a job card with stock deduction and audit trail.

```sql
SELECT public.allocate_parts_to_job_card(
  'job-card-uuid'::UUID,
  '[{
    "partId": "part-uuid",
    "partName": "Brake Pad",
    "partNumber": "BP-001",
    "quantity": 2,
    "unitPrice": 150.00,
    "totalPrice": 300.00,
    "manufacturer": "Bosch",
    "category": "Brakes"
  }]'::JSONB,
  'user-uuid'::UUID,
  'John Doe'::VARCHAR
);
```

### deallocate_parts_from_job_card()
Returns unused parts to inventory.

```sql
SELECT public.deallocate_parts_from_job_card(
  'job-card-part-uuid'::UUID,
  2::INTEGER,  -- quantity to return (NULL = all)
  'user-uuid'::UUID,
  'John Doe'::VARCHAR
);
```

### update_job_card_part_status()
Updates part status with validation.

```sql
SELECT public.update_job_card_part_status(
  'job-card-part-uuid'::UUID,
  'used'::VARCHAR,
  2::INTEGER,      -- quantity used
  145.00::DECIMAL, -- actual price
  'user-uuid'::UUID
);
```

---

## TypeScript Functions

### createJobCard()
Now supports parts parameter.

```typescript
import { createJobCard } from '@/lib/supabase/job-card-queries'

const result = await createJobCard({
  garageId: 'garage-id',
  customerId: 'customer-id',
  vehicleId: 'vehicle-id',
  jobType: 'repair',
  priority: 'high',
  parts: [
    {
      partId: 'part-id',  // null for customer/external parts
      partName: 'Brake Pad',
      partNumber: 'BP-001',
      quantity: 2,
      unitPrice: 150.00,
      totalPrice: 300.00,
      manufacturer: 'Bosch',
      category: 'Brakes'
    }
  ],
  // ... other required fields
})
```

### allocatePartsToJobCard()
Add parts to existing job card.

```typescript
const result = await allocatePartsToJobCard(
  'job-card-id',
  parts: [
    { partId: 'part-id', partName: 'Oil Filter', /* ... */ }
  ],
  'user-id',
  'John Doe'
)
```

### updateJobCardPartStatus()
Update part status with validation.

```typescript
const result = await updateJobCardPartStatus(
  'job-card-part-id',
  'used',           // new status
  'user-id',        // who made the change
  2,                // quantity used
  145.00            // actual price paid
)
```

### checkPartsAvailability()
Check stock before allocation.

```typescript
const availability = await checkPartsAvailability(
  [
    { partId: 'part-1', quantity: 2 },
    { partId: 'part-2', quantity: 1 }
  ],
  'garage-id'
)
// Returns: [{ partId, available, currentStock, requestedQuantity }, ...]
```

### deallocatePartsFromJobCard()
Return unused parts to inventory.

```typescript
const result = await deallocatePartsFromJobCard(
  'job-card-part-id',
  2,              // quantity to return
  'user-id',
  'John Doe'
)
```

### getJobCardTransactionHistory()
Get audit trail for job card.

```typescript
const history = await getJobCardTransactionHistory('job-card-id')
```

---

## REST API Endpoints

### GET /api/job-cards/[jobCardId]/parts
Get all parts for a job card.

```bash
curl -X GET "https://your-domain.com/api/job-cards/job-card-id/parts"
```

**Response**:
```json
{
  "success": true,
  "parts": [...],
  "count": 5
}
```

---

### POST /api/job-cards/[jobCardId]/parts
Allocate additional parts to job card.

```bash
curl -X POST "https://your-domain.com/api/job-cards/job-card-id/parts" \
  -H "Content-Type: application/json" \
  -d '{
    "parts": [{
      "partId": "part-uuid",
      "partName": "Brake Pad",
      "partNumber": "BP-001",
      "quantity": 2,
      "unitPrice": 150.00,
      "totalPrice": 300.00
    }],
    "userId": "user-uuid",
    "userName": "John Doe",
    "checkAvailability": true
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Parts allocated successfully",
  "data": {
    "partsAllocated": 1,
    "partsFailed": 0,
    "totalEstimatedCost": 300.00
  }
}
```

---

### PATCH /api/job-cards/[jobCardId]/parts
Update part status or quantity.

```bash
curl -X PATCH "https://your-domain.com/api/job-cards/job-card-id/parts" \
  -H "Content-Type: application/json" \
  -d '{
    "jobCardPartId": "part-uuid",
    "newStatus": "used",
    "quantityUsed": 2,
    "actualUnitPrice": 145.00,
    "userId": "user-uuid"
  }'
```

**Response**:
```json
{
  "success": true,
  "message": "Part status updated successfully",
  "part": { /* updated part record */ }
}
```

---

### DELETE /api/job-cards/[jobCardId]/parts
Deallocate parts (return to inventory).

```bash
curl -X DELETE "https://your-domain.com/api/job-cards/job-card-id/parts?jobCardPartId=part-uuid&quantity=2&userId=user-uuid&userName=John%20Doe"
```

**Response**:
```json
{
  "success": true,
  "message": "Parts deallocated successfully",
  "data": {
    "quantityReturned": 2,
    "jobCardPartId": "part-uuid"
  }
}
```

---

## Part Status Lifecycle

```
allocated → ordered → received → used → returned
    ↓          ↓          ↓        ↑
    └─────── cancelled ──┴────────┘
```

**Valid Transitions**:
- `allocated` → ordered, used, returned, cancelled
- `ordered` → received, cancelled
- `received` → used, returned, cancelled
- `used` → returned
- `returned` → (terminal)
- `cancelled` → (terminal)

---

## Part Sources

- `inventory` - Part from garage inventory (stock deducted)
- `customer` - Customer-supplied part (no stock change)
- `external` - Special order from supplier (no stock change)
- `ordered` - Not in stock, needs to be ordered

---

## Transaction Types

- `allocation` - Part allocated to job card
- `deallocation` - Part returned from job card
- `usage` - Part actually used in repair
- `return` - Part returned to inventory
- `adjustment` - Manual inventory adjustment
- `transfer` - Transfer between locations
- `damage` - Part damaged/lost
- `expired` - Part expired

---

## Quick Tips

### Creating a Job Card with Customer-Supplied Parts
```typescript
parts: [{
  partId: null,  // null = customer part
  partName: 'Customer Brake Pads',
  partNumber: 'CUST-001',
  quantity: 1,
  unitPrice: 0,
  totalPrice: 0
}]
```

### Handling Out-of-Stock Parts
The system automatically sets status to 'ordered' if insufficient stock. No special handling needed.

### Checking Price Variance
Price variance is auto-calculated when actual_unit_price is set:
```
variance = actual_unit_price - estimated_unit_price
```

### Core Charges
Set `core_charge_amount` when allocating. The `has_core_charge` flag is auto-set.

### Disposal Fees
Set `disposal_fee_amount` for environmental fees. The `has_disposal_fee` flag is auto-set.

---

## Error Handling

All functions return:
```typescript
{
  success: boolean,
  error?: string,
  data?: any
}
```

Always check `success` before accessing `data`.

---

## Database Queries

### Get All Parts for Job Card with Costs
```sql
SELECT * FROM public.get_job_card_parts_with_costs('job-card-uuid');
```

### Get Transaction History for Part
```sql
SELECT * FROM public.get_part_transaction_history('part-uuid', 100);
```

### Get Low Stock Parts
```sql
SELECT part_name, part_number,
  (on_hand_stock + warehouse_stock) as total_stock,
  low_stock_threshold
FROM parts
WHERE (on_hand_stock + warehouse_stock) <= low_stock_threshold;
```

### Check Stock Before Allocation
```sql
SELECT part_id, part_name,
  (on_hand_stock + warehouse_stock) as available_stock
FROM parts
WHERE part_id IN ('part-1-uuid', 'part-2-uuid');
```

---

## Testing

Create a test job card:
```bash
curl -X POST "https://your-domain.com/api/job-cards/create" \
  -H "Content-Type: application/json" \
  -d @test-job-card-with-parts.json
```

Check parts were allocated:
```sql
SELECT * FROM job_card_parts WHERE job_card_id = 'test-job-card-id';
```

Check inventory transactions:
```sql
SELECT * FROM inventory_transactions WHERE job_card_id = 'test-job-card-id';
```

Verify stock deduction:
```sql
SELECT part_name, on_hand_stock, warehouse_stock
FROM parts
WHERE id = 'test-part-id';
```

---

## Support

For issues or questions:
1. Check implementation guide: `PARTS-MANAGEMENT-IMPLEMENTATION.md`
2. Review database migration files for details
3. Check Supabase logs for RPC function errors
4. Enable debug logging in TypeScript functions

---

Version: 1.0.0
Last Updated: 2025-01-23
