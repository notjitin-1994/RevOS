# RevvOs Architecture

Technical architecture and implementation details for RevvOs.

> **Last Updated:** January 2026
> **Framework:** Next.js 14 (App Router)

---

## Table of Contents

1. [Tech Stack](#tech-stack)
2. [Project Structure](#project-structure)
3. [Data Layer](#data-layer)
4. [API Layer](#api-layer)
5. [Authentication](#authentication)
6. [State Management](#state-management)
7. [Component Architecture](#component-architecture)
8. [Routing & Navigation](#routing--navigation)
9. [Performance Optimizations](#performance-optimizations)

---

## Tech Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14+ | React framework with App Router |
| **React** | 18+ | UI library |
| **TypeScript** | 5+ | Type safety |
| **Tailwind CSS** | 3+ | Styling |
| **Framer Motion** | Latest | Animations |
| **Lucide React** | Latest | Icons |

### Backend

| Technology | Purpose |
|------------|---------|
| **Next.js API Routes** | Serverless API endpoints |
| **Supabase** | Database, auth, storage |
| **Prisma** | Database ORM (migrations) |

### Validation & Forms

| Technology | Purpose |
|------------|---------|
| **Zod** | Schema validation |
| **React Hook Form** | Form management |
| **Validator.js** | Email/phone validation |

### Development

| Technology | Purpose |
|------------|---------|
| **ESLint** | Linting |
| **TypeScript** | Type checking |
| **Vitest** | Testing |

---

## Project Structure

```
RevvOs/
├── app/                          # Next.js App Router
│   ├── (auth)/                   # Auth routes (future)
│   ├── login/                    # Login page
│   │   └── page.tsx             # Split layout login
│   ├── dashboard/               # Dashboard hub
│   │   └── page.tsx             # Main dashboard
│   ├── inventory/               # Inventory management
│   │   ├── page.tsx             # Parts list
│   │   ├── add/                 # Add part form
│   │   │   └── page.tsx         # 8-tab form with auto-save
│   │   └── [partId]/            # Part details
│   │       └── page.tsx
│   ├── job-cards/               # Job card management
│   │   ├── page.tsx             # Job cards list
│   │   ├── create/              # Create job card
│   │   └── [id]/                # Job card details
│   │       └── page.tsx
│   ├── vehicle-catalog/         # Vehicle registry
│   │   ├── page.tsx             # Vehicle catalog
│   │   ├── add/                 # Add vehicle
│   │   └── [id]/                # Vehicle details
│   ├── customer-management/     # Customer CRM
│   │   ├── page.tsx             # Customer list
│   │   ├── add/                 # Add customer
│   │   └── [id]/                # Customer details
│   ├── employee-management/     # Employee directory
│   │   ├── page.tsx             # Employee list
│   │   ├── add/                 # Add employee
│   │   └── [loginId]/           # Employee profile
│   ├── calendar/                # Calendar (future)
│   ├── settings/                # Settings
│   │   └── page.tsx
│   ├── layout.tsx               # Root layout
│   ├── globals.css              # Global styles
│   └── page.tsx                 # Home (redirects to login)
│
├── components/                   # React components
│   ├── auth/                    # Authentication components
│   │   ├── login-form.tsx       # Main login form
│   │   ├── password-input.tsx   # Reusable password input
│   │   ├── login-logo.tsx       # Brand header
│   │   ├── forgot-password-modal.tsx
│   │   ├── forgot-login-id-modal.tsx
│   │   └── system-diagnostic-panel.tsx
│   ├── ui/                      # Reusable UI components
│   │   ├── button.tsx
│   │   ├── input.tsx
│   │   ├── card.tsx
│   │   └── ...
│   ├── dashboard/               # Dashboard components
│   ├── inventory/               # Inventory components
│   ├── job-cards/               # Job card components
│   └── ...
│
├── lib/                         # Business logic
│   ├── hooks/                   # Custom React hooks
│   │   ├── use-auth.ts          # Authentication hook
│   │   └── useFormAutoSave.ts   # Auto-save hook
│   ├── schemas/                 # Zod validation schemas
│   │   ├── login.ts
│   │   ├── forgot-password.ts
│   │   ├── forgot-login-id.ts
│   │   └── ...
│   ├── supabase/                # Supabase queries
│   │   ├── server.ts            # Supabase client
│   │   ├── types.ts             # Database types
│   │   └── job-card-queries.ts  # Job card queries
│   └── utils.ts                 # Utility functions
│
├── app/api/                     # API routes
│   ├── employees/               # Employee endpoints
│   │   └── route.ts
│   ├── inventory/               # Inventory endpoints
│   │   ├── add/
│   │   ├── list/
│   │   └── part/
│   ├── job-cards/               # Job card endpoints
│   │   ├── list/
│   │   ├── create/
│   │   └── [id]/
│   └── ...
│
├── prisma/                      # Database schema
│   ├── schema.prisma            # Prisma schema
│   └── migrations/              # SQL migrations
│       └── create_job_cards_system.sql
│
├── public/                      # Static assets
│   └── images/
│
├── docs/                        # Feature documentation
│   ├── JOB_CARDS_IMPLEMENTATION.md
│   ├── PART_DATA_FIELDS_REFERENCE.md
│   └── ...
│
├── design-language/             # Design system docs
│   ├── color-design.txt
│   ├── typography-design.txt
│   └── ...
│
├── tests/                       # Test files
│   ├── setup.ts
│   ├── helpers.ts
│   └── api/employees/
│       ├── validation.test.ts
│       ├── security.test.ts
│       └── ...
│
├── tailwind.config.ts           # Tailwind configuration
├── tsconfig.json                # TypeScript configuration
├── next.config.js               # Next.js configuration
├── vitest.config.ts             # Vitest configuration
└── package.json                 # Dependencies
```

---

## Data Layer

### Database: Supabase (PostgreSQL)

**Key Tables:**

| Table | Purpose |
|-------|---------|
| `users` | User accounts and authentication |
| `garages` | Garage/business accounts |
| `employees` | Employee profiles |
| `customers` | Customer information |
| `customer_vehicles` | Vehicle registry |
| `parts` | Parts catalog |
| `job_cards` | Service job cards |
| `job_card_checklist_items` | Job tasks |
| `job_card_time_entries` | Time tracking |
| `job_card_parts` | Parts usage |
| `makes` | Vehicle makes (Honda, Yamaha, etc.) |
| `models` | Vehicle models |

**Row Level Security (RLS):**
- ✅ Enabled on all tables
- ✅ Garage-level data isolation
- ✅ Role-based access policies

**Database Functions:**
- `generate_job_card_number(garage_id)` - Auto-generate job card numbers
- `update_job_card_financials(job_card_id)` - Recalculate costs
- `update_mechanic_metrics(mechanic_id, date)` - Calculate productivity

---

## API Layer

### API Route Structure

```
/app/api/
├── employees/
│   ├── route.ts              # GET (list), POST (create)
│   └── route.secure.ts       # Secure implementation
├── inventory/
│   ├── add/route.ts          # POST (add part)
│   ├── list/route.ts         # GET (list parts)
│   └── part/[id]/route.ts    # GET, PUT, DELETE
├── job-cards/
│   ├── list/route.ts         # GET (list with filters)
│   ├── create/route.ts       # POST (create job card)
│   └── [id]/
│       ├── route.ts          # GET, PUT, DELETE
│       ├── checklist/route.ts # GET, POST
│       └── ...
└── ...
```

### API Response Format

**Success Response:**
```typescript
{
  success: true,
  data: { ... },
  message?: string
}
```

**Error Response:**
```typescript
{
  success: false,
  error: string,
  details?: unknown
}
```

---

## Authentication

### Authentication Flow

```
1. User enters Login ID + Password
   ↓
2. Client validation (Zod)
   ↓
3. POST /api/auth/login
   ↓
4. Supabase auth.signInWithPassword()
   ↓
5. Session stored in cookies
   ↓
6. Redirect to dashboard
```

### Session Management

- **Session Storage:** Supabase cookies (httpOnly)
- **Session Duration:** Configurable (default: 7 days)
- **Session Refresh:** Automatic token refresh

### Recovery Flows

**Forgot Password:**
1. User enters login ID
2. System sends OTP to email
3. User verifies OTP
4. User creates new password

**Forgot Login ID:**
1. User enters email
2. System sends login ID to email

---

## State Management

### Client State

| Approach | Library | Usage |
|----------|---------|-------|
| **Local State** | React useState | Component-level state |
| **Form State** | React Hook Form | Form data and validation |
| **URL State** | Next.js useSearchParams | Filters, search params |
| **Auto-Save** | localStorage | Draft persistence (useFormAutoSave) |

### Server State

| Approach | Library | Usage |
|----------|---------|-------|
| **Server Components** | Next.js | Data fetching on server |
| **API Routes** | Next.js | Serverless endpoints |
| **Supabase** | @supabase/supabase-js | Database queries |

### No Global State Management

RevvOs does **NOT** use Redux, Zustand, or Jotai.
- ✅ Server Components for data fetching
- ✅ URL params for shared state
- ✅ React Context for auth only (if needed)

---

## Component Architecture

### Component Hierarchy Example

```
app/dashboard/page.tsx (Server Component)
└── DashboardLayout
    ├── Header
    ├── StatsGrid
    │   └── StatCard × 4
    ├── QuickActions
    │   └── QuickAction × 4
    ├── ScheduleSection
    ├── AnalyticsSection
    └── AIInsightsSection
```

### Component Patterns

**Server Components** (Default):
- Used for pages and data-heavy components
- No 'use client' directive
- Can fetch data directly from Supabase

**Client Components** ('use client'):
- Used for interactivity (forms, modals, animations)
- Minimize usage for better performance
- Use React Hook Form for forms

**Reusable Components:**
- Located in `components/ui/`
- Fully typed with TypeScript
- Follow design system strictly

---

## Routing & Navigation

### App Router Structure

**File-based Routing:**
- `app/dashboard/page.tsx` → `/dashboard`
- `app/inventory/add/page.tsx` → `/inventory/add`
- `app/job-cards/[id]/page.tsx` → `/job-cards/{id}`

**Dynamic Routes:**
- `[partId]` - Part details
- `[id]` - Job card details
- `[loginId]` - Employee profiles

**Navigation:**
- `<Link>` from `next/link` for client navigation
- `router.push()` for programmatic navigation
- `<a>` for external links

### Layouts

**Root Layout** (`app/layout.tsx`):
- Font loading (Barlow, Inter, JetBrains Mono)
- Global styles
- Metadata configuration

**Nested Layouts:**
- (Future) Auth layout for protected routes
- (Future) Dashboard layout with sidebar

---

## Performance Optimizations

### Image Optimization

```tsx
import Image from 'next/image'

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={50}
  priority // For above-fold images
/>
```

### Code Splitting

- **Automatic:** Next.js App Router splits by route
- **Dynamic Imports:** `next/dynamic` for heavy components
- **Client Components:** Only where necessary

### Font Optimization

```tsx
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap', // Prevents FOUT
})
```

### Caching Strategy

- **Static Data:** Next.js ISR (Incremental Static Regeneration)
- **Dynamic Data:** Supabase queries with cache headers
- **Client Data:** localStorage for drafts

### Lazy Loading

```tsx
// Heavy component
const HeavyChart = dynamic(() => import('./HeavyChart'), {
  loading: () => <Skeleton />,
  ssr: false,
})
```

---

## Security Architecture

### Client-Side Security

- ✅ Input validation with Zod schemas
- ✅ XSS protection via React escaping
- ✅ CSRF tokens (future)
- ✅ Content Security Policy (future)

### Server-Side Security

- ✅ Row Level Security (RLS) in Supabase
- ✅ Garage-level data isolation
- ✅ Role-based access control
- ⚠️ Rate limiting (planned)
- ⚠️ Request signing (planned)

### Authentication Security

- ✅ Password hashing (bcrypt)
- ✅ OTP expiration (5 minutes)
- ✅ Secure session cookies (httpOnly)
- ✅ Autocomplete attributes for password managers

### Known Vulnerabilities

**Employee Creation API** (`/api/employees/route.ts`):
- ⚠️ No authentication/authorization
- ⚠️ SQL injection vulnerabilities
- ⚠️ XSS vulnerabilities
- ✅ Secure implementation: `/api/employees/route.secure.ts`

**See:** [TESTING_README.md](./TESTING_README.md)

---

## Monitoring & Observability

### Logging

**Client-Side:**
- Console logging in development
- Error tracking (planned: Sentry)

**Server-Side:**
- API route logging (planned)
- Database query logging (Supabase dashboard)

### Analytics

- User analytics (planned)
- Performance monitoring (planned)
- Error tracking (planned)

---

## Deployment

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# Email (for recovery features)
NEXT_PUBLIC_REQUEST_EMAIL=your-email@example.com

# App
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Build Process

```bash
# Development
npm run dev

# Production build
npm run build
npm start

# Testing
npm test
npm run test:coverage
```

### Hosting

**Recommended Platforms:**
- Vercel (recommended for Next.js)
- Netlify
- AWS (Amplify)
- Self-hosted (Docker)

---

## Documentation Index

For more details, see:

- **Features:** [FEATURES.md](./FEATURES.md)
- **Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Getting Started:** [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Documentation Index:** [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

---

**RevvOs** - Automotive Garage Management System
**Version:** 1.0.0
**Last Updated:** January 2026
