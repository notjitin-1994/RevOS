# Job Card System - Quick Testing Guide

## Prerequisites

Before testing, ensure:
- [ ] You have a valid garage account
- [ ] You're logged into RevvOS
- [ ] Database migration has been run
- [ ] At least one customer exists in the system
- [ ] At least one vehicle exists for that customer

## Step 1: Verify Database Setup

Run this query in Supabase SQL Editor:

```sql
-- Check all job card tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name LIKE 'job_card%'
ORDER BY table_name;

-- Should return 8 tables:
-- job_card_attachments
-- job_card_comments
-- job_card_checklist_items
-- job_card_parts
-- job_card_status_history
-- job_card_time_entries
-- job_cards
-- mechanic_daily_metrics

-- Test job card number generation
SELECT generate_job_card_number('YOUR_GARAGE_ID_HERE');
```

## Step 2: Test API via Browser Console

Open browser DevTools (F12) on any RevvOS page and run:

### Get Your Garage ID
```javascript
const user = JSON.parse(sessionStorage.getItem('user'));
console.log('Garage ID:', user.garageId);
const garageId = user.garageId;
```

### List Job Cards
```javascript
fetch(`/api/job-cards/list?garageId=${garageId}`)
  .then(r => r.json())
  .then(data => console.log('Job Cards:', data));
```

### Create a Test Job Card
First, get a customer and vehicle ID:

```javascript
// Get customers
fetch(`/api/customers/list?garageId=${garageId}`)
  .then(r => r.json())
  .then(data => {
    console.log('Customers:', data.customers);
    // Use first customer's ID
    const customerId = data.customers[0]?.id;
    console.log('Using customer:', customerId);
  });

// Get vehicles
fetch(`/api/vehicles/list?garageId=${garageId}`)
  .then(r => r.json())
  .then(data => {
    console.log('Vehicles:', data.vehicles);
    // Use first vehicle's ID
    const vehicleId = data.vehicles[0]?.id;
    console.log('Using vehicle:', vehicleId);
  });
```

Then create a job card (replace IDs with actual values):

```javascript
fetch('/api/job-cards/create', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    garageId: garageId,
    customerId: 'CUSTOMER_ID_HERE',
    vehicleId: 'VEHICLE_ID_HERE',
    jobType: 'repair',
    priority: 'medium',
    customerComplaint: 'Test complaint from API',
    workRequested: 'Test work requested',
    currentMileage: 10000
  })
})
.then(r => r.json())
.then(data => console.log('Created:', data));
```

## Step 3: Test UI

### Navigate to Job Cards Page
```
http://localhost:3000/job-cards
```

**Expected to see:**
- Page header with "Job Card Management"
- "Create Job Card" button
- Stats cards (Total Jobs, In Progress, Ready, Pending)
- Search input
- Status filter dropdown
- Sort dropdown
- Empty state message OR list of job cards

### Test Search
1. Type in search box: job #, customer name, vehicle, plate
2. Verify results filter in real-time
3. Clear search to see all results

### Test Status Filter
1. Click status dropdown
2. Select different statuses
3. Verify results update
4. Select "All Status" to reset

### Test Sorting
1. Change sort dropdown
2. Verify items reorder correctly
3. Check newest/oldest, priority, status sorts

### Test Pagination
1. If >10 items, verify pagination controls appear
2. Click Next/Previous buttons
3. Click page numbers
4. Verify URL doesn't change (client-side pagination)

### Test Mobile Responsiveness
1. Resize browser to mobile width (<768px)
2. Verify cards appear instead of table
3. Verify all info is accessible
4. Verify touch targets are large enough (44px min)

### Test Empty State
If no job cards exist:
1. Verify empty state message appears
2. Verify "Create a job card" link works
3. Verify helpful messaging is shown

## Step 4: Test Job Card Detail

Once job cards exist, test detail view:

```javascript
// Get first job card's ID from list
fetch(`/api/job-cards/list?garageId=${garageId}`)
  .then(r => r.json())
  .then(data => {
    const firstJobCard = data.jobCards[0];
    if (firstJobCard) {
      console.log('Navigate to:', `/job-cards/${firstJobCard.id}`);

      // Get job card details
      return fetch(`/api/job-cards/${firstJobCard.id}`);
    }
  })
  .then(r => r?.json())
  .then(data => console.log('Job Card Details:', data));
```

Navigate to: `http://localhost:3000/job-cards/[ID_FROM_ABOVE]`

**Note:** Detail page is not yet implemented - this will show 404 until created.

## Step 5: Test Checklist & Time Tracking

### Add Checklist Item
```javascript
// Replace with actual job card ID
const jobCardId = 'JOB_CARD_ID_HERE';

fetch(`/api/job-cards/${jobCardId}/checklist`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    itemName: 'Test Checklist Item',
    description: 'This is a test item',
    category: 'Engine',
    priority: 'medium',
    estimatedMinutes: 60,
    displayOrder: 1
  })
})
.then(r => r.json())
.then(data => console.log('Checklist Item:', data));
```

### Start Timer
```javascript
// Replace with actual checklist item ID and mechanic ID
const checklistItemId = 'CHECKLIST_ITEM_ID_HERE';
const mechanicId = 'MECHANIC_ID_HERE';

fetch(`/api/checklist/${checklistItemId}/start`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mechanicId: mechanicId
  })
})
.then(r => r.json())
.then(data => console.log('Timer Started:', data));
```

### Stop Timer
Wait a few seconds, then:

```javascript
// Get the time entry ID from the start response above
const timeEntryId = 'TIME_ENTRY_ID_HERE';

fetch(`/api/checklist/${timeEntryId}/stop`, {
  method: 'POST'
})
.then(r => r.json())
.then(data => console.log('Timer Stopped:', data));
```

### Verify Time Entry
```javascript
fetch(`/api/job-cards/${jobCardId}/checklist`)
  .then(r => r.json())
  .then(data => {
    const item = data.checklistItems[0];
    console.log('Total Time Spent:', item.totalTimeSpent, 'seconds');
    console.log('Actual Minutes:', item.actualMinutes);
    console.log('Timer Running:', item.isTimerRunning);
  });
```

## Step 6: Test Status Updates

```javascript
const jobCardId = 'JOB_CARD_ID_HERE';
const userId = 'YOUR_USER_ID_HERE';

fetch(`/api/job-cards/${jobCardId}`, {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    status: 'in_progress',
    userId: userId,
    reason: 'Started working on vehicle'
  })
})
.then(r => r.json())
.then(data => console.log('Status Updated:', data));
```

## Common Issues & Solutions

### Issue: "Garage ID is required"
**Solution:** Make sure you're logged in and garageId exists in sessionStorage

### Issue: "Customer/Vehicle not found"
**Solution:** Create a customer and vehicle first via Customer Management

### Issue: "Failed to create job card"
**Solution:**
1. Check browser console for detailed error
2. Verify database tables exist
3. Check Supabase logs

### Issue: Timer won't start
**Solution:**
1. Verify checklist item exists
2. Check mechanic ID is valid
3. Verify no timer is already running for this item

## Expected Data Flow

```
1. User logs in → garageId in sessionStorage
2. Load job-cards page → calls /api/job-cards/list?garageId=X
3. API calls getJobCardsByGarageId()
4. Supabase queries job_cards table with RLS
5. Data returned to UI → displayed in table/cards
6. User clicks "Create Job Card"
7. Form opens → select customer & vehicle
8. Submit → calls /api/job-cards/create
9. API calls createJobCard() → inserts into DB
10. Trigger generates job_card_number
11. Returns new job card → UI refreshes
```

## Performance Benchmarks

Expected response times:
- List job cards: <200ms
- Get single job card: <100ms
- Create job card: <300ms
- Start timer: <100ms
- Stop timer: <100ms
- Status update: <150ms

## Next Steps After Testing

1. ✅ If all tests pass → System is ready for use
2. ❌ If issues found → Check troubleshooting guide
3. 📝 Document any bugs found
4. 🚀 Proceed to detail page implementation

## Manual Testing Checklist

Print and check off:

**API Tests:**
- [ ] List job cards returns 200
- [ ] Create job card returns 201
- [ ] Get single job card returns details
- [ ] Update job card works
- [ ] Delete job card soft deletes
- [ ] Status update creates history entry
- [ ] Add checklist item works
- [ ] Start timer creates time entry
- [ ] Stop timer calculates duration

**UI Tests:**
- [ ] Page loads without errors
- [ ] Stats display correctly
- [ ] Search filters results
- [ ] Status filter works
- [ ] Sort options work
- [ ] Pagination works
- [ ] Mobile layout responsive
- [ ] Click job card navigates to detail
- [ ] Empty state shows helpful message
- [ ] Loading state shows spinner
- [ ] Error state shows friendly message

**Integration Tests:**
- [ ] Job card links to customer
- [ ] Job card links to vehicle
- [ ] Job card assigns mechanic
- [ ] Checklist items update progress
- [ ] Time entries update totals
- [ ] Status changes track history
- [ ] Financial totals calculate correctly

## Questions?

Refer to:
- Implementation Guide: `/docs/JOB_CARDS_IMPLEMENTATION.md`
- Database Schema: `/prisma/migrations/create_job_cards_system.sql`
- API Routes: `/app/api/job-cards/*`
- Query Functions: `/lib/supabase/job-card-queries.ts`
