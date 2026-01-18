# Employee Visibility Issue - Fixed

## Problem
Employee data exists in the database's `users` table but was not showing up in the employee management UI at `/employee-management`.

## Root Cause
The API was filtering employees using case-sensitive comparison:
```typescript
.neq('user_role', 'Owner')  // Only excludes 'Owner' with capital O
```

But the database likely has `user_role` values like `'owner'` (lowercase), which weren't being filtered out correctly.

## Fix Applied

### 1. Updated API Route (app/api/employees/list/route.ts)
Changed the filter to be case-insensitive:
```typescript
.not('user_role', 'in', '("Owner","owner")')
```

This now excludes both `'Owner'` and `'owner'` from the employee list.

### 2. Added Debug Logging
The API now logs:
- The garage ID being queried
- Number of employees found
- Sample employee data (first 3 records)
- Any errors

## Next Steps

### 1. Check Your Database
Run the diagnostic script I created:
```bash
# File location: /home/jitin-m-nair/Desktop/RevOS/debug-employee-visibility.sql
```

This will show you:
- All users in your garage
- Their `user_role` values
- Whether they match the API's filter criteria

### 2. Verify the Fix

1. **Restart your development server:**
   ```bash
   npm run dev
   ```

2. **Open the employee management page:**
   - Go to `http://localhost:3000/employee-management`
   - Open browser DevTools (F12)
   - Go to Console tab

3. **Check the console logs:**
   - Look for "Fetching employees for garage ID: [your-garage-id]"
   - Look for "Query result:" showing count and sample data
   - Look for any errors

4. **Check the Network tab:**
   - Refresh the page
   - Look for the request to `/api/employees/list?garageId=...`
   - Check the Response to see if employees are returned

### 3. If Still Not Working

#### Option A: Check Browser Console
Look for errors like:
- "Failed to fetch employees"
- "Invalid user session"
- Any CORS or authentication errors

#### Option B: Check Your Session Data
In browser console, run:
```javascript
console.log(JSON.parse(sessionStorage.getItem('user')))
```
Verify the `garageId` matches what's in your database.

#### Option C: Run the SQL Diagnostic
1. Open Supabase SQL Editor
2. Copy and run the queries from `debug-employee-visibility.sql`
3. This will show you exactly what's in your database

### 4. Standardize user_role Values (Optional)

If your database has inconsistent casing, run this in Supabase SQL Editor:

```sql
UPDATE users
SET user_role = CASE
    WHEN LOWER(user_role) = 'owner' THEN 'owner'
    WHEN LOWER(user_role) = 'admin' THEN 'admin'
    WHEN LOWER(user_role) = 'manager' THEN 'manager'
    WHEN LOWER(user_role) = 'serviceadvisor' THEN 'service_advisor'
    WHEN LOWER(user_role) = 'mechanic' THEN 'mechanic'
    WHEN LOWER(user_role) = 'employee' THEN 'employee'
    ELSE user_role
END
WHERE user_role ~* '^(owner|admin|manager|service_advisor|mechanic|employee)$';
```

## Files Modified

1. **app/api/employees/list/route.ts**
   - Fixed case-sensitive filtering
   - Added debug logging

2. **debug-employee-visibility.sql** (new)
   - Diagnostic queries to identify the issue
   - Verification queries
   - Fix queries

## Expected Behavior After Fix

After applying this fix, the employee management page should show:
- All users with `user_role` in: `'admin'`, `'manager'`, `'service_advisor'`, `'mechanic'`, `'employee'`
- Excludes users with `user_role` of `'owner'` or `'Owner'`
- Both uppercase and lowercase variations of owner are excluded

## Common Issues and Solutions

| Issue | Solution |
|-------|----------|
| "Garage ID is required" | Check session storage has valid garageId |
| 0 employees returned | Run SQL diagnostic to check data exists |
| RLS policy errors | Check RLS policies in Supabase dashboard |
| CORS errors | Verify API route is properly configured |

## Support

If employees still don't appear after these fixes:
1. Check the browser console for errors
2. Run the SQL diagnostic script
3. Share the console output and SQL results for further debugging
