# Getting Started with RevOS

Quick start guide to set up and run RevOS locally.

> **Last Updated:** January 2026
> **Version:** 1.0

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Installation](#installation)
3. [Environment Setup](#environment-setup)
4. [Database Setup](#database-setup)
5. [Running the App](#running-the-app)
6. [Verification](#verification)
7. [Troubleshooting](#troubleshooting)
8. [Next Steps](#next-steps)

---

## Prerequisites

Before you begin, ensure you have:

- **Node.js** 18+ installed
- **npm** or **yarn** or **pnpm** package manager
- **Git** for version control
- **Supabase** account (for database)

### Check Your Versions

```bash
node --version   # Should be v18+
npm --version    # Should be 9+
git --version    # Should be 2.x+
```

---

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-org/revos.git
cd revos
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

**Expected packages installed:**
- next (14+)
- react (18+)
- typescript (5+)
- tailwindcss (3+)
- @supabase/supabase-js
- zod
- react-hook-form
- framer-motion
- lucide-react

---

## Environment Setup

### 1. Create Environment File

```bash
cp .env.local.example .env.local
```

### 2. Configure Environment Variables

Edit `.env.local` with your values:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Email Configuration (for account recovery)
NEXT_PUBLIC_REQUEST_EMAIL=your-email@example.com

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com)
2. Create a new project or select existing
3. Go to **Settings** → **API**
4. Copy:
   - Project URL → `NEXT_PUBLIC_SUPABASE_URL`
   - anon/public key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## Database Setup

### Option A: Use Supabase Dashboard (Recommended)

1. Open your Supabase project
2. Go to **SQL Editor**
3. Create tables using migration scripts:

```sql
-- Example: Create job cards system
\i https://raw.githubusercontent.com/your-org/revos/main/prisma/migrations/create_job_cards_system.sql
```

**Required Tables:**
- `users` (created by Supabase Auth)
- `garages`
- `employees`
- `customers`
- `customer_vehicles`
- `parts`
- `job_cards`
- `job_card_checklist_items`
- And more...

### Option B: Use Prisma Migrations

```bash
# Generate Prisma client
npx prisma generate

# Run migrations
npx prisma migrate dev

# Or push schema (development only)
npx prisma db push
```

### Option C: Use Seed Data

```bash
# Run seed script
npm run seed

# Or manually
node prisma/seeds/seed.js
```

---

## Running the App

### Development Mode

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

**App will be available at:** http://localhost:3000

### Production Build

```bash
# Build for production
npm run build

# Start production server
npm start
```

---

## Verification

### 1. Check the App Loads

Open http://localhost:3000 in your browser

**Expected:**
- ✅ Login page appears
- ✅ No console errors
- ✅ Styling looks correct (light gray background)

### 2. Test Login

**Demo Credentials** (if available):
```
Login ID: demo
Password: demo123
```

Or create a new account via the UI.

### 3. Check Database Connection

Open browser console (F12) and verify:
- ✅ No Supabase connection errors
- ✅ Can load data from database

### 4. Verify Key Features

- [ ] Login page loads
- [ ] Dashboard accessible after login
- [ ] Inventory list loads
- [ ] Job cards list loads
- [ ] Can navigate to all sections

---

## Troubleshooting

### Port Already in Use

**Error:** `Port 3000 is already in use`

**Solution:**
```bash
# Use different port
npm run dev -- -p 3001
```

### Module Not Found Errors

**Error:** `Cannot find module 'xxx'`

**Solution:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### TypeScript Errors

**Error:** TypeScript compilation errors

**Solution:**
```bash
# Check TypeScript version
npm list typescript

# Should be 5+
# If not, install latest
npm install typescript@latest --save-dev
```

### Supabase Connection Errors

**Error:** `Failed to fetch` or `CORS error`

**Solution:**
1. Check `NEXT_PUBLIC_SUPABASE_URL` is correct
2. Check `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
3. Verify Supabase project is active (not paused)
4. Check CORS settings in Supabase dashboard

### Tailwind Classes Not Working

**Error:** Styles not applied

**Solution:**
```bash
# Restart dev server
# Ctrl+C to stop
npm run dev

# Clear Next.js cache
rm -rf .next
npm run dev
```

### Database Tables Not Found

**Error:** `relation "xxx" does not exist`

**Solution:**
1. Run migration scripts in Supabase SQL Editor
2. Verify tables were created:
   ```sql
   SELECT table_name
   FROM information_schema.tables
   WHERE table_schema = 'public'
   ORDER BY table_name;
   ```

---

## Next Steps

### 1. Explore the Features

- **Dashboard:** Overview of garage operations
- **Inventory:** Parts catalog and stock management
- **Job Cards:** Service job tracking
- **Vehicles:** Vehicle registry
- **Customers:** Customer management
- **Employees:** Employee directory

### 2. Read the Documentation

- **[FEATURES.md](./FEATURES.md)** - Complete feature list
- **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** - Design tokens and patterns
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical architecture
- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - All documentation

### 3. Configure Your Garage

1. Add your garage information in Settings
2. Add employees (admin, mechanics, etc.)
3. Set up service scope (makes/models you support)
4. Add initial inventory
5. Create customer profiles

### 4. Customize the App

**Design System:**
- Edit `tailwind.config.ts` for colors
- Edit `app/globals.css` for global styles
- Edit `app/layout.tsx` for fonts

**Business Logic:**
- Add custom validation rules in `lib/schemas/`
- Extend API routes in `app/api/`
- Add custom hooks in `lib/hooks/`

### 5. Set Up Production

**Choose a Platform:**
- **Vercel** (recommended): Zero-config deployment
- **Netlify:** Easy Next.js hosting
- **Self-hosted:** Docker deployment

**Environment Variables:**
Don't forget to set production environment variables!

**Database:**
Use Supabase production project (not local).

---

## Common Commands

```bash
# Development
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Start production server

# Testing
npm test             # Run tests in watch mode
npm run test:run     # Run tests once
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage

# Database
npx prisma generate  # Generate Prisma client
npx prisma migrate dev # Run migrations
npx prisma db push   # Push schema (dev only)
npx prisma studio    # Open Prisma Studio

# Linting
npm run lint         # Run ESLint
npm run lint:fix     # Fix ESLint errors
```

---

## Need Help?

### Documentation

- **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** - Complete documentation index
- **[FEATURES.md](./FEATURES.md)** - Feature documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Technical documentation

### Feature-Specific Guides

- **Auto-Save:** [AUTO_SAVE_IMPLEMENTATION.md](./AUTO_SAVE_IMPLEMENTATION.md)
- **Recovery Features:** [RECOVERY_FEATURES_SUMMARY.md](./RECOVERY_FEATURES_SUMMARY.md)
- **Job Cards:** [docs/JOB_CARDS_IMPLEMENTATION.md](./docs/JOB_CARDS_IMPLEMENTATION.md)

### Support

For issues or questions:
1. Check the troubleshooting section above
2. Search existing GitHub issues
3. Create a new issue with details
4. Contact the RevOS team

---

## Quick Reference

**Default Ports:**
- Development: `3000`
- Production: `3000`

**Default Login (if seeded):**
- Login ID: `admin`
- Password: `admin123`

**Key URLs:**
- App: http://localhost:3000
- Dashboard: http://localhost:3000/dashboard
- Login: http://localhost:3000/login
- Supabase: https://supabase.com/dashboard

**File Locations:**
- Config: `tailwind.config.ts`, `tsconfig.json`
- Styles: `app/globals.css`
- Layout: `app/layout.tsx`
- API Routes: `app/api/`
- Components: `components/`

---

**RevOS** - Automotive Garage Management System
**Version:** 1.0.0
**Last Updated:** January 2026

Happy coding! 🚀
