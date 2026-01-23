# RevvOS Maintenance Scripts

This directory contains scripts for maintaining data integrity and managing the RevvOS motorcycle database.

## Data Integrity

### check-data-integrity.ts
Automated data integrity checker that identifies common data errors.

**Run:**
```bash
npm run check-data-integrity
```

**Checks performed:**
1. ✅ Models containing manufacturer names of other makes (e.g., "Ola" having "Ather 450X")
2. ✅ Duplicate model names within the same make
3. ✅ Same model names across different makes
4. ✅ Invalid year ranges (year_end < year_start)
5. ✅ Electric vehicles with engine displacement > 0
6. ✅ Inconsistent country of origin within makes
7. ✅ Mismatched production status and year_end

**Output:**
- Console report with severity levels (error, warning, info)
- Detailed suggestions for fixing each issue
- Exit code 1 if errors found (useful for CI/CD)

### data-integrity-check.sql
SQL version of the integrity checker. Can be run directly in Supabase SQL Editor or via psql.

**Run in Supabase:**
1. Open Supabase Dashboard → SQL Editor
2. Copy contents of `data-integrity-check.sql`
3. Execute the script
4. Review the results

## Usage Examples

### Before Adding New Data
Run the integrity check to ensure existing data is clean:
```bash
npm run check-data-integrity
```

### After Bulk Imports
Always run integrity checks after importing new data:
```bash
npm run check-data-integrity
```

### In CI/CD Pipeline
Add to your CI/CD pipeline to catch data issues early:
```yaml
- name: Check data integrity
  run: npm run check-data-integrity
```

## Preventing Data Errors

### Application Layer Validation
The `lib/supabase/motorcycle-queries.ts` file includes validation that **prevents** these errors at the source:

- ✅ Blocks models with other manufacturer names (e.g., adding "Ather 450X" to Ola make)
- ✅ Validates year ranges
- ✅ Ensures electric vehicles have 0cc engine displacement
- ✅ Checks production status matches year_end

### Best Practices

1. **Use the validation layer** - Always add models through the API, not direct SQL inserts
2. **Run integrity checks** - Before and after data changes
3. **Review warnings** - Even non-error warnings can indicate data quality issues
4. **Fix data at the source** - Correct seed files, not just the database

## Common Issues and Fixes

### Issue: "Model contains manufacturer name"
**Example:** Ola make has model "Ather 450X"

**Fix:**
```sql
-- Move the model to the correct make
UPDATE motorcycles
SET make = 'Ather'
WHERE make = 'Ola' AND model = 'Ather 450X';
```

### Issue: "Duplicate model within make"
**Example:** Hero has two entries for "Splendor Plus"

**Fix:**
```sql
-- First, identify the duplicates
SELECT id, make, model, year_start, year_end
FROM motorcycles
WHERE make = 'Hero' AND model = 'Splendor Plus'
ORDER BY created_at;

-- Delete the older/incorrect duplicate
DELETE FROM motorcycles
WHERE id = '<duplicate-id>';
```

### Issue: "Invalid year range"
**Example:** year_start (2020) > year_end (2015)

**Fix:**
```sql
-- Correct the year range
UPDATE motorcycles
SET year_start = 2010, year_end = 2015
WHERE id = '<model-id>';
```

---

# Make Logos Update Scripts

This directory also contains scripts to automatically fetch and update logos for all motorcycle makes in your RevvOS database.

## Overview

The scripts will:
1. Create a `makes` table for centralized make management
2. Add a `logo_url` column to the `motorcycles` table
3. Fetch and populate logo URLs for all makes
4. Update the motorcycles table with logo references

## Files Created

### SQL Migration Files

Located in `prisma/seeds/`:

1. **`03_add_make_logos.sql`** - Creates the `makes` table and adds `logo_url` column to `motorcycles` table
2. **`04_update_motorcycle_logos_function.sql`** - Creates a SQL function to sync logos from makes to motorcycles
3. **`05_populate_make_logos.sql`** - Pre-populated SQL with all logo URLs (can run independently)

### Script Files

1. **`scripts/update-make-logos.ts`** - TypeScript script that dynamically fetches logos from APIs
2. **`scripts/update-make-logos.sh`** - Bash script that runs all SQL migrations in order

## Usage

### Option 1: Quick SQL Update (Recommended)

This is the fastest way to add all logos at once:

1. **Run the bash script:**
   ```bash
   chmod +x scripts/update-make-logos.sh
   ./scripts/update-make-logos.sh
   ```

2. **Or manually in Supabase SQL Editor:**
   - Open Supabase Dashboard → SQL Editor
   - Run the SQL files in order:
     1. `prisma/seeds/03_add_make_logos.sql`
     2. `prisma/seeds/04_update_motorcycle_logos_function.sql`
     3. `prisma/seeds/05_populate_make_logos.sql`

### Option 2: Dynamic Fetch with TypeScript

This method fetches logos dynamically from Clearbit Logo API:

1. **Install tsx dependency:**
   ```bash
   npm install
   ```

2. **Run the script:**
   ```bash
   npm run update-logos
   ```

   Or directly:
   ```bash
   npx tsx scripts/update-make-logos.ts
   ```

## What Gets Updated

### New `makes` Table Structure:

```sql
CREATE TABLE makes (
  id UUID PRIMARY KEY,
  name VARCHAR(100) UNIQUE NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  logo_url TEXT,
  website_url TEXT,
  country_of_origin VARCHAR(100),
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Updated `motorcycles` Table:

- New column: `logo_url TEXT`

## Makes Covered

The scripts include logos for all makes in your database:

### Indian Manufacturers
- Bajaj Auto
- Hero MotoCorp (including Hero Honda legacy)
- TVS Motor Company
- Honda Motorcycle & Scooter India
- Royal Enfield
- Suzuki Motorcycle India
- Yamaha Motor India
- Kinetic Engineering
- LML (Lohia Machines)
- Yezdi / Jawa (Classic Legends)
- Rajdoot
- And many more...

### Electric Vehicle Manufacturers
- Ather Energy
- Ola Electric
- Simple Energy
- Revolt Motors
- TVS iQube
- Bajaj Chetak Electric
- Hero Electric
- Okinawa
- Ampere
- And many more...

## Logo Sources

The scripts use the Clearbit Logo API as the primary source:
- `https://logo.clearbit.com/domain.com`

Special domain mappings are handled for makes that don't match their company domain exactly.

## Verification

After running the scripts, verify the update:

```sql
-- Check makes table
SELECT name, logo_url, website_url FROM makes WHERE logo_url IS NOT NULL;

-- Check motorcycles table
SELECT make, logo_url FROM motorcycles WHERE logo_url IS NOT NULL LIMIT 10;

-- Count makes with logos
SELECT COUNT(*) FROM makes WHERE logo_url IS NOT NULL;
```

## Troubleshooting

### Issue: Logo not showing for a make

**Solution:** The logo might not be available on Clearbit. You can manually update:

```sql
UPDATE makes
SET logo_url = 'https://your-logo-url.com/logo.png'
WHERE name = 'Make Name';
```

### Issue: SQL script fails

**Solution:** Run each SQL file individually in Supabase SQL Editor to see detailed error messages.

### Issue: TypeScript script can't connect

**Solution:** Verify your `.env.local` has correct Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

## Next Steps

After updating logos, you can:

1. **Display logos in UI** - Update your components to use the `logo_url` field
2. **Add more makes** - Insert new makes with their logos into the `makes` table
3. **Update existing logos** - Run the scripts again to refresh logo URLs

## Database Schema Changes

The following changes are made to your database:

```sql
-- New table
CREATE TABLE makes (...);

-- New column on motorcycles table
ALTER TABLE motorcycles ADD COLUMN logo_url TEXT;

-- New function
CREATE FUNCTION update_motorcycle_logos_from_makes() ...
```

## API Rate Limits

The TypeScript script includes a 500ms delay between requests to be respectful to the Clearbit API. If you have many makes, the script may take several minutes to complete.

## Support

For issues or questions:
1. Check the Troubleshooting section above
2. Verify your database credentials in `.env.local`
3. Run SQL scripts manually in Supabase SQL Editor to see detailed errors
