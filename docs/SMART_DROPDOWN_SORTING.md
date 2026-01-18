# Smart Dropdown Sorting Feature

## Overview

This feature implements **frequency-based dropdown sorting** that automatically learns which options are most commonly used and presents them first. The system gets smarter over time as more parts are added.

## How It Works

### 1. **Initial State**
When first installed, all dropdown options appear in their default order (alphabetical).

### 2. **Learning Phase**
Every time a part is added/edited, the system records which options were selected for:
- Category (Engine, Brakes, Body, etc.)
- Used For (Engine, Brakes, Electrical, etc.)
- Make/Brand (Motul, Castrol, Bosch, etc.)

### 3. **Smart Sorting**
After collecting usage data, dropdowns automatically reorder to show:
1. **Most used options first** (sorted by usage count, descending)
2. **Recently used options next** (when counts are equal, sorted by last used date)
3. **Unused options last** (in their original order)

### 4. **Visual Indicators**
- Options with usage counts show the count in parentheses: `Engine (15)`
- Helper text "Sorted by popularity" appears when smart sorting is active
- Loading state shows while fetching personalized rankings

## Example

**Before any usage:**
```
Category Dropdown:
- Accessories
- Body
- Brakes
- Engine
- Exhaust
...
```

**After adding 10 Engine parts, 5 Brake parts, 2 Body parts:**
```
Category Dropdown:
- Engine (10)      ← Most used
- Brakes (5)       ← Second most used
- Body (2)         ← Third most used
- Accessories      ← Never used
- Exhaust          ← Never used
...
```

## Installation

### 1. Run the SQL Migration

```bash
psql -U your_user -d your_database -f scripts/add-inventory-field-usage-tracking.sql
```

This creates:
- `inventory_field_usage` table to track usage
- `increment_field_usage()` function to record usage
- Indexes for fast lookups

### 2. Verify the Setup

The API endpoints are already implemented:
- `GET /api/inventory/field-options` - Fetch smart-sorted options
- `POST /api/inventory/field-options` - Record usage

### 3. Test the Feature

1. Go to the Add Part page (`/inventory/add`)
2. Observe the Category and Used For dropdowns
3. Add several parts with different categories
4. Reload the page
5. Notice that dropdowns now show most-used options first

## Technical Details

### Database Schema

```sql
CREATE TABLE inventory_field_usage (
  id UUID PRIMARY KEY,
  garage_id UUID NOT NULL,
  field_name VARCHAR(100) NOT NULL,      -- e.g., 'category', 'usedFor'
  field_value VARCHAR(255) NOT NULL,     -- e.g., 'Engine', 'Brakes'
  usage_count INTEGER NOT NULL DEFAULT 1,
  last_used_at TIMESTAMP,
  UNIQUE(garage_id, field_name, field_value)
);
```

### API Endpoints

#### GET `/api/inventory/field-options?field=category&garageId=xxx`

Returns options sorted by usage frequency:

```json
{
  "success": true,
  "options": [
    { "value": "Engine", "label": "Engine", "usageCount": 15, "lastUsed": "2024-01-18T10:30:00Z" },
    { "value": "Brakes", "label": "Brakes", "usageCount": 8, "lastUsed": "2024-01-18T09:15:00Z" },
    { "value": "Body", "label": "Body", "usageCount": 0 }
  ]
}
```

#### POST `/api/inventory/field-options`

Records usage when a part is added:

```json
{
  "garageId": "uuid",
  "field": "category",
  "value": "Engine"
}
```

### Frontend Implementation

**State Management:**
```typescript
const [categoryOptions, setCategoryOptions] = useState<FieldOption[]>([])
const [usedForOptions, setUsedForOptions] = useState<FieldOption[]>([])
```

**Loading Options:**
```typescript
const loadFieldOptions = async () => {
  const response = await fetch(`/api/inventory/field-options?field=category&garageId=${garageId}`)
  const result = await response.json()
  setCategoryOptions(result.options)
}
```

**Recording Usage:**
```typescript
// Fire-and-forget after part is saved
fetch('/api/inventory/field-options', {
  method: 'POST',
  body: JSON.stringify({ garageId, field: 'category', value: selectedCategory })
})
```

## Benefits

### 1. **Time Savings**
- Mechanics spend less time scrolling through dropdowns
- Most common options are immediately visible
- Reduces clicks per form fill

### 2. **Data Quality**
- Encourages consistency in option selection
- Reduces typos (users select from top options)
- Provides insights into actual usage patterns

### 3. **Continuous Improvement**
- System gets smarter with every part added
- No manual configuration needed
- Automatically adapts to each garage's preferences

### 4. **Multi-Tenant**
- Each garage has independent usage tracking
- Ranking is personalized per garage
- No cross-contamination of data

## Extending the Feature

### Add More Fields

To track usage for additional dropdown fields:

1. **Add to API endpoint** (`/api/inventory/field-options/route.ts`):
```typescript
const ALL_OPTIONS = {
  category: [...],
  usedFor: [...],
  partType: ['Oil Filter', 'Air Filter', 'Chain Kit', ...], // New field
}
```

2. **Track usage** (in Add Part page):
```typescript
await fetch('/api/inventory/field-options', {
  method: 'POST',
  body: JSON.stringify({ garageId, field: 'partType', value: selectedValue })
})
```

3. **Display in UI**:
```typescript
const [partTypeOptions, setPartTypeOptions] = useState<FieldOption[]>([])
```

### Advanced Features (Future Enhancements)

- **Global vs Personal Rankings**: Mix of garage-wide and user-specific preferences
- **Time-based Decay**: Reduce weight of old usage data
- **Seasonal Adjustments**: Track usage patterns by month/season
- **Related Suggestions**: Suggest options based on other field selections (e.g., if "Engine" category selected, prioritize engine-related brands)
- **Usage Analytics Dashboard**: Show which parts/categories are most popular

## Troubleshooting

### Dropdowns not sorting?
- Check browser console for API errors
- Verify `garageId` is set in sessionStorage
- Ensure SQL migration was run successfully

### Options showing in wrong order?
- Clear cache and reload
- Check that usage data is being recorded (query `inventory_field_usage` table)

### Performance issues?
- The API uses indexed queries for fast lookups
- Consider caching results client-side for 5-10 minutes
- Usage tracking is async (fire-and-forget) so it doesn't block UI

## Monitoring

Check usage statistics directly:

```sql
-- Most used categories across all garages
SELECT field_value, SUM(usage_count) as total_usage
FROM inventory_field_usage
WHERE field_name = 'category'
GROUP BY field_value
ORDER BY total_usage DESC
LIMIT 10;

-- Per-garage usage patterns
SELECT garage_id, field_value, usage_count
FROM inventory_field_usage
WHERE field_name = 'category'
ORDER BY usage_count DESC;
```

## Future Roadmap

- [ ] Add usage tracking to part Brand/Manufacturer field
- [ ] Implement "Recently Used" section within dropdowns
- [ ] Add keyboard shortcuts for frequently used options
- [ ] Export usage analytics for business insights
- [ ] A/B test different sorting strategies
- [ ] Machine learning to predict likely options based on context
