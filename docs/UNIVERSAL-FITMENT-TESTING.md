# Universal Fitment Feature - Testing Guide

## Overview
This document outlines the testing procedures for the new universal fitment feature that allows parts to be marked as "Universal" (fits all vehicles) instead of requiring individual vehicle selection.

## Files Modified

### 1. Components Created/Modified
- **NEW**: `/components/inventory/vehicle-fitment-selector.tsx` - Selection component with universal toggle
- **UPDATED**: `/components/inventory/vehicle-fitment-display.tsx` - Display component now supports universal parts

### 2. Pages Modified
- **UPDATED**: `/app/inventory/add/page.tsx` - Add Part page now uses VehicleFitmentSelector

### 3. API Modified
- **UPDATED**: `/app/api/inventory/add/route.ts` - API now saves `is_universal_fitment` column

### 4. Database Migration
- **NEW**: `/prisma/migrations/20260122_add_universal_fitment_column.sql` - Adds `is_universal_fitment` column to parts table

## Testing Checklist

### Phase 1: Database Migration
- [ ] Run the migration SQL file
- [ ] Verify `is_universal_fitment` column exists in `parts` table
- [ ] Verify indexes were created
- [ ] Check that all existing parts have `is_universal_fitment = FALSE`

```sql
-- Verification query
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns
WHERE table_name = 'parts' AND column_name = 'is_universal_fitment';
```

### Phase 2: Component Testing

#### VehicleFitmentSelector Component

**Test Case 1: Universal Toggle Display**
- [ ] Component renders with universal checkbox at top
- [ ] Universal checkbox shows correct state (checked/unchecked)
- [ ] When checked, shows "X vehicles" badge with total count
- [ ] When unchecked, shows individual vehicle selection UI

**Test Case 2: Switching to Universal**
- [ ] Check "Universal Part" checkbox
- [ ] Verify individual selection is disabled/hidden
- [ ] Verify individual vehicle selections are cleared
- [ ] See "Universal Part" display with total vehicle count
- [ ] Uncheck universal - verify individual selection reappears

**Test Case 3: Individual Vehicle Selection**
- [ ] Leave universal unchecked
- [ ] Expand a make (e.g., Honda)
- [ ] See vehicle badges with checkboxes
- [ ] Click individual vehicle to select/deselect
- [ ] Use "Select All" button - all vehicles selected
- [ ] Use "Clear All" button - all vehicles deselected

**Test Case 4: Make-Level Selection**
- [ ] Click checkbox next to make name (e.g., Honda)
- [ ] All vehicles under that make should be selected
- [ ] Checkbox shows "All selected" state
- [ ] Click again to deselect all in make
- [ ] Checkbox shows unchecked state

**Test Case 5: Search Functionality**
- [ ] Type in search box (e.g., "Honda")
- [ ] Results filter to show only matching makes/models
- [ ] Clear search to show all vehicles
- [ ] Search with no results shows "No vehicles match" message
- [ ] Search works with make, model, category, and year

**Test Case 6: Selected Vehicles Summary**
- [ ] Select multiple vehicles from different makes
- [ ] See summary badges at top showing selected vehicles
- [ ] Click "×" on badge to remove individual vehicle
- [ ] Selection count updates correctly
- [ ] Make accordion shows "X selected" indicator

**Test Case 7: Edge Cases**
- [ ] No vehicles in catalog - show appropriate message
- [ ] 100+ vehicles - accordion handles efficiently
- [ ] Switch between universal and individual multiple times
- [ ] Select vehicles then check universal - selections cleared

### Phase 3: Add Part Page Integration

**Test Case 8: Add Part Flow - Universal Part**
1. Navigate to `/inventory/add`
2. Fill in basic info:
   - Part Number: `UNI-001`
   - Part Name: `Universal Engine Oil 10W-40`
   - Category: `Fluids`
   - Used For: `Engine`
3. Go to "Fitment" tab
4. Check "Universal Part" checkbox
5. Verify "Fits all X motorcycles" message
6. Save part
7. Verify part is created with `is_universal_fitment = TRUE`
8. Verify no entries in `parts_fitment` table

**Test Case 9: Add Part Flow - Specific Fitment**
1. Navigate to `/inventory/add`
2. Fill in basic info:
   - Part Number: `SPEC-001`
   - Part Name: `Honda Brake Pads`
   - Category: `Brakes`
   - Used For: `Brakes`
3. Go to "Fitment" tab
4. Leave "Universal Part" unchecked
5. Select specific vehicles:
   - Expand Honda
   - Select "Activa 6G"
   - Select "CB300F"
6. Save part
7. Verify part is created with `is_universal_fitment = FALSE`
8. Verify 2 entries in `parts_fitment` table

**Test Case 10: Form Auto-Save**
- [ ] Fill form data
- [ ] Toggle universal checkbox
- [ ] Refresh page
- [ ] Verify universal state is restored from localStorage
- [ ] Verify individual selections are restored

### Phase 4: API Testing

**Test Case 11: Create Universal Part API**
```bash
curl -X POST http://localhost:3000/api/inventory/add \
  -H "Content-Type: application/json" \
  -d '{
    "garageId": "your-garage-id",
    "partNumber": "UNI-TEST-001",
    "partName": "Test Universal Part",
    "category": "Fluids",
    "usedFor": "Engine",
    "isUniversalFitment": true,
    "compatibleVehicles": [],
    "purchasePrice": 100,
    "sellingPrice": 150
  }'
```

Expected response:
```json
{
  "success": true,
  "part": { ... },
  "message": "Part added successfully"
}
```

Verify:
- [ ] Part created in `parts` table
- [ ] `is_universal_fitment = TRUE`
- [ ] No entries in `parts_fitment`

**Test Case 12: Create Specific Fitment Part API**
```bash
curl -X POST http://localhost:3000/api/inventory/add \
  -H "Content-Type: application/json" \
  -d '{
    "garageId": "your-garage-id",
    "partNumber": "SPEC-TEST-001",
    "partName": "Test Specific Part",
    "category": "Brakes",
    "usedFor": "Brakes",
    "isUniversalFitment": false,
    "compatibleVehicles": ["vehicle-id-1", "vehicle-id-2"],
    "purchasePrice": 200,
    "sellingPrice": 300
  }'
```

Verify:
- [ ] Part created in `parts` table
- [ ] `is_universal_fitment = FALSE`
- [ ] 2 entries in `parts_fitment` table

**Test Case 13: Error Handling**
- [ ] Send request with both `isUniversalFitment: true` AND `compatibleVehicles` populated
- [ ] API should ignore compatibleVehicles when universal is true
- [ ] Part created successfully as universal

### Phase 5: Display Testing

**Test Case 14: VehicleFitmentDisplay - Universal Part**
- [ ] Navigate to part detail page for universal part
- [ ] Pass `isUniversalPart={true}` and `totalVehicleCount={156}` to VehicleFitmentDisplay
- [ ] Verify "Universal Part" special display is shown
- [ ] Verify shows "Compatible with all 156 motorcycles"
- [ ] Verify shows "Fits All Makes & Models" badge
- [ ] No accordion sections shown

**Test Case 15: VehicleFitmentDisplay - Specific Part**
- [ ] Navigate to part detail page for specific part
- [ ] Pass `isUniversalPart={false}` and vehicles array to VehicleFitmentDisplay
- [ ] Verify standard accordion display is shown
- [ ] Grouped by make with expandable sections
- [ ] Search functionality works
- [ ] Year ranges shown on badges

## Performance Testing

**Test Case 16: Large Catalog**
- [ ] Load page with 500+ vehicles
- [ ] Verify rendering is smooth (< 2 seconds)
- [ ] Search response time (< 300ms)
- [ ] Accordion expand/collapse is smooth
- [ ] Select All / Clear All works efficiently

**Test Case 17: Memory Usage**
- [ ] Open DevTools Performance tab
- [ ] Monitor memory while interacting with component
- [ ] Expand/collapse accordions multiple times
- [ ] Search and filter repeatedly
- [ ] Verify no significant memory leaks

## Accessibility Testing

**Test Case 18: Keyboard Navigation**
- [ ] Tab through all interactive elements
- [ ] Use Enter/Space to toggle checkboxes
- [ ] Use arrow keys for navigation
- [ ] All interactive elements have focus indicators

**Test Case 19: Screen Reader**
- [ ] Use NVDA/VoiceOver
- [ ] Verify checkbox state is announced
- [ ] Verify "X selected" messages are read
- [ ] Verify accordion expanded/collapsed state is announced
- [ ] Verify search input has appropriate label

## Browser Compatibility

**Test Case 20: Cross-Browser**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest)
- [ ] Edge (latest)
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## Regression Testing

**Test Case 21: Existing Parts**
- [ ] View existing parts (created before this feature)
- [ ] Verify they still display correctly
- [ ] Verify they have `is_universal_fitment = FALSE` (default)
- [ ] Can edit existing parts and add fitment

**Test Case 22: Parts with Fitment**
- [ ] View part with existing vehicle fitment
- [ ] Verify all vehicles are displayed correctly
- [ ] Can add/remove vehicles
- [ ] Can convert to universal (clears existing fitment)

## Manual Test Scenarios

### Scenario 1: Oil Filter (Universal)
1. Create new part: Engine Oil Filter
2. Mark as universal
3. Save
4. View part - should show "Fits all 156 motorcycles"
5. Search for part - should appear in results

### Scenario 2: Brake Pads (Specific)
1. Create new part: Honda Brake Pads
2. Select 3 Honda models
3. Save
4. View part - should show only 3 Honda models
5. Try to add to job card for non-Honda - should warn

### Scenario 3: Universal to Specific Conversion
1. Create universal part
2. Edit part
3. Uncheck universal
4. Select specific vehicles
5. Save
6. Verify fitment updated correctly

### Scenario 4: Specific to Universal Conversion
1. Create part with 5 specific vehicles
2. Edit part
3. Check universal
4. Verify warning about clearing existing fitment
5. Save
6. Verify now universal, fitment records removed

## Common Issues & Troubleshooting

### Issue 1: Universal checkbox not working
**Symptoms**: Checking universal doesn't hide individual selection
**Solution**: Check React state updates, verify onChange handler is called

### Issue 2: Selections not clearing when switching to universal
**Symptoms**: Individual selections remain after checking universal
**Solution**: Verify onUniversalChange callback clears compatibleVehicles array

### Issue 3: Database column not found
**Symptoms**: Error "column is_universal_fitment does not exist"
**Solution**: Run migration SQL file to add column

### Issue 4: API not saving universal flag
**Symptoms**: Part saved but `is_universal_fitment` is NULL/FALSE
**Solution**: Check API route includes `is_universal_fitment` in partData object

### Issue 5: Display not showing universal badge
**Symptoms**: Universal part shows regular fitment list
**Solution**: Verify `isUniversalPart` prop is passed to VehicleFitmentDisplay

## Success Criteria

All test cases pass:
- ✅ Component renders correctly in all states
- ✅ Universal toggle works as expected
- ✅ Individual selection/clearing works
- ✅ Search and filter functionality works
- ✅ API correctly saves universal flag
- ✅ Display correctly shows universal vs specific parts
- ✅ No console errors or warnings
- ✅ Performance is acceptable (< 2s load time)
- ✅ Accessible via keyboard and screen reader
- ✅ Works across all supported browsers

## Sign-off

- [ ] Developer testing completed
- [ ] QA testing completed
- [ ] Product owner approval
- [ ] Documentation updated
- [ ] Feature flagged as ready for production

## Notes

- Universal parts should NOT have entries in `parts_fitment` table
- When converting from specific to universal, existing fitment records should be deleted
- When converting from universal to specific, user must manually select vehicles
- Consider adding a migration script to identify parts that should be universal (e.g., oils, filters)
