# RevvOS Performance Optimization Roadmap

**Generated:** 2026-01-22
**Next.js Version:** 14.2.35
**Status:** Ready for Implementation
**Target Audience:** Development Team / AI Agents

---

## Executive Summary

This roadmap identifies **47 specific optimization opportunities** across the RevvOS codebase that can significantly improve:
- ⚡ **Initial Page Load Time** (Target: < 2s)
- 📦 **JavaScript Bundle Size** (Target: < 200 KB First Load JS)
- 🎯 **Time to Interactive** (Target: < 3s)
- 🖼️ **Core Web Vitals** (LCP, FID, CLS all "Good")
- 🔄 **API Response Times** (Target: < 200ms p95)

**Current State Assessment:**
- ✅ **Good:** Image optimization (Next.js Image component configured)
- ✅ **Good:** Some dynamic imports implemented (job-cards page)
- ✅ **Good:** Modern formats enabled (AVIF, WebP)
- ⚠️ **Needs Work:** Excessive client components (55 files)
- ⚠️ **Needs Work:** Large component files (5378 lines in one file)
- ⚠️ **Needs Work:** Bundle size optimization opportunities
- ⚠️ **Needs Work:** Server component usage could be improved
- ❌ **Critical:** No bundle analyzer configured
- ❌ **Critical:** Framer Motion used everywhere (53 files)
- ❌ **Critical:** Missing React.memo optimizations

---

## Priority System

- 🔴 **CRITICAL** - Immediate impact on user experience, implement ASAP
- 🟠 **HIGH** - Significant improvements, implement in current sprint
- 🟡 **MEDIUM** - Moderate improvements, implement in next sprint
- 🟢 **LOW** - Nice-to-have, implement when time permits

---

## Table of Contents

1. [Bundle Size Optimization](#1-bundle-size-optimization)
2. [Server vs Client Component Strategy](#2-server-vs-client-component-strategy)
3. [Code Splitting & Lazy Loading](#3-code-splitting--lazy-loading)
4. [Animation & Rendering Performance](#4-animation--rendering-performance)
5. [Data Fetching & Caching](#5-data-fetching--caching)
6. [Database & API Optimization](#6-database--api-optimization)
7. [Font & Asset Optimization](#7-font--asset-optimization)
8. [Build & Configuration](#8-build--configuration)
9. [Monitoring & Measurement](#9-monitoring--measurement)

---

## 1. Bundle Size Optimization

### 🔴 CRITICAL: Install and Configure Bundle Analyzer

**Impact:** 10/10 | **Effort:** Low | **File:** `next.config.js`

**Problem:** Currently no visibility into bundle composition. Cannot identify which dependencies are bloating the bundle.

**Solution:**
```bash
npm install --save-dev @next/bundle-analyzer
```

Update `next.config.js`:
```javascript
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... existing config
}

module.exports = withBundleAnalyzer(nextConfig)
```

**Usage:**
```bash
ANALYZE=true npm run build
```

**Expected Outcome:** Visual breakdown of bundle sizes, identify top 5 largest dependencies

**Reference:** [Next.js Bundle Analyzer](https://nextjs.org/docs/app/guides/package-bundling)

---

### 🟠 HIGH: Optimize Framer Motion Imports (53 files using it)

**Impact:** 9/10 | **Effort:** Medium | **Files:** 53 files across codebase

**Problem:** Framer Motion (~200KB) is imported in 53 files. Many use it for simple animations that could be done with CSS.

**Current Usage Analysis:**
```
Files using framer-motion:
- components/auth/login-form.tsx
- app/job-cards/components/kanban/*.tsx (multiple)
- app/job-cards/components/timeline/*.tsx
- app/job-cards/components/calendar/*.tsx
- All dashboard components
- All page components with animations
```

**Action Items:**

1. **Replace simple animations with CSS transitions**
   - Fade-in, slide-up: Use CSS `@keyframes`
   - Hover effects: Use CSS `:hover`
   - Loading states: Use CSS animations

2. **Use dynamic imports for Framer Motion** where needed
   ```tsx
   // Before
   import { motion } from 'framer-motion'

   // After
   const motion = dynamic(() =>
     import('framer-motion').then(mod => mod.motion),
     { ssr: true }
   )
   ```

3. **Create lightweight animation components**
   Create `components/ui/animations.tsx` with CSS-only versions

**Files to Refactor (Priority Order):**
1. `components/dashboard/hub-card.tsx` - Simple card animations
2. `components/dashboard/dashboard-header.tsx` - Fade animations
3. `components/dashboard/dashboard-overview.tsx` - Stagger animations
4. `app/vehicle-catalog/components/service-scope-client.tsx` - List animations
5. All skeleton components (use CSS instead)

**Expected Outcome:** Reduce bundle by 50-100KB on initial load

**Reference:** [The 10KB Next.js App - Bundle Optimization](https://medium.com/better-dev-nextjs-react/the-10kb-next-js-app-extreme-bundle-optimization-techniques-d8047c482aea)

---

### 🟠 HIGH: Optimize Icon Library Imports

**Impact:** 7/10 | **Effort:** Low | **File:** `next.config.js`

**Problem:** `lucide-react` imports entire icon set tree-shaking may not be optimal.

**Current State:**
- 53 files importing from `lucide-react`
- Each file imports 5-15 icons on average

**Solution:**

Add to `next.config.js`:
```javascript
const nextConfig = {
  experimental: {
    optimizePackageImports: ['lucide-react', '@tabler/icons-react'],
  },
}
```

**Alternative:** Consider using individual icon imports:
```tsx
// Instead of: import { Search, Calendar, User } from 'lucide-react'
// Use specific imports if tree-shaking isn't working well
```

**Expected Outcome:** 10-20KB bundle reduction

---

### 🟡 MEDIUM: Review Large Component Files

**Impact:** 6/10 | **Effort:** High | **Multiple Files**

**Problem:** Several extremely large files that should be split:

| File | Lines | Issue |
|------|-------|-------|
| `app/job-cards/create/page.tsx` | 5,378 | Massive file, needs splitting |
| `app/job-cards/[id]/page.tsx` | 1,712 | Large detail page |
| `app/employee-management/page.tsx` | 1,596 | List page |
| `lib/validation/garage-validation.ts` | 1,240 | Validation schemas |
| `lib/supabase/job-card-queries.ts` | 1,210 | Database queries |

**Action Plan:**

1. **Split `app/job-cards/create/page.tsx` (5,378 lines)**
   - Extract form sections to separate components
   - Extract validation logic
   - Extract API call handlers
   - Target: Each component < 300 lines

2. **Split validation schemas**
   - Group by domain (employee, customer, vehicle, inventory)
   - Create separate files in `lib/validation/{domain}/`

3. **Split query files**
   - `lib/supabase/queries/job-cards/` directory
   - One file per query type (list, detail, create, update, delete)

**Expected Outcome:** Better code splitting, smaller individual bundles

---

## 2. Server vs Client Component Strategy

### 🔴 CRITICAL: Excessive Client Components (55 files)

**Impact:** 10/10 | **Effort:** High | **Files:** All `'use client'` files

**Problem:** 55 files marked as Client Components, many don't need to be. This sends unnecessary JavaScript to the client.

**Analysis:**
```
Current 'use client' files:
- 55 total files
- Many are static pages with no interactivity
- Some are data-fetching pages that could be Server Components
```

**Server Component Criteria:**
- ✅ Data fetching and rendering
- ✅ Static content and layouts
- ✅ Forms (with Server Actions)
- ❌ Browser APIs (window, document, localStorage)
- ❌ Event handlers (onClick, onChange)
- ❌ React hooks (useState, useEffect)
- ❌ Context providers

**Action Items:**

#### Phase 1: Quick Wins (Convert 20+ files)

**Files to Convert to Server Components:**

1. `app/vehicle-catalog/page.tsx`
   - Currently: Server (good!)
   - Keep as is

2. `app/employee-management/page.tsx` (1,596 lines)
   - Currently: Client component
   - Should be: Server component with client children for search/filter
   - Plan:
     ```
     employee-management/
     ├── page.tsx (Server - data fetching)
     └── components/
         ├── employee-list-client.tsx (Client - search/filter)
         └── employee-table-server.tsx (Server - rendering)
     ```

3. `app/customer-management/page.tsx`
   - Similar pattern to employee-management
   - Split server/client boundary

4. `app/inventory/page.tsx`
   - Convert to Server Component
   - Extract interactive parts to client components

5. `app/vehicles/page.tsx`
   - Convert to Server Component

6. `app/suppliers/add/page.tsx`
   - Forms can use Server Actions
   - Remove `'use client'` if possible

**Pattern to Follow:**
```tsx
// ❌ BEFORE: All Client
'use client'
export default function Page() {
  const [data, setData] = useState([])
  useEffect(() => { fetchData() }, [])
  return <div>{data.map(...)}</div>
}

// ✅ AFTER: Server + Client separation
// page.tsx (Server Component)
import { ClientList } from './client-list'
export default async function Page() {
  const data = await fetchData()
  return <ClientList initialData={data} />
}

// client-list.tsx (Client Component)
'use client'
export function ClientList({ initialData }) {
  const [filter, setFilter] = useState('')
  // ... interactive filter logic
}
```

**Expected Outcome:** 30-40% reduction in client-side JavaScript

**References:**
- [Next.js Server vs Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [Server Components Performance Analysis](https://www.developerway.com/posts/react-server-components-performance)

---

### 🟠 HIGH: Optimize Dashboard Page (249 lines)

**Impact:** 8/10 | **Effort:** Medium | **File:** `app/dashboard/page.tsx`

**Current State:** Server Component (good!) but can optimize

**Optimizations:**
1. ✅ Already using Server Component
2. ✅ Already fetching data server-side
3. ⚠️ Multiple sequential database calls
4. ⚠️ No caching configured

**Improvements:**
```typescript
// Current: Sequential calls
const stats = await getAllDashboardStats(garageId)
const calendarJobCards = await getDashboardCalendarJobCards(garageId)

// Optimized: Parallel calls
const [stats, calendarJobCards] = await Promise.all([
  getAllDashboardStats(garageId),
  getDashboardCalendarJobCards(garageId)
])
```

Add caching:
```typescript
export const revalidate = 60 // Revalidate every 60 seconds
// OR
export const dynamic = 'force-dynamic' // For always-fresh data
```

---

### 🟡 MEDIUM: Refactor Job Cards Page (1,125 lines)

**Impact:** 7/10 | **Effort:** High | **File:** `app/job-cards/page.tsx`

**Current Issues:**
- Client component with complex state management
- Uses `useEffect` for data fetching
- Session storage access for garage ID
- Dynamic imports already in place (good!)

**Refactoring Plan:**

1. **Move data fetching to Server Component**
   ```typescript
   // app/job-cards/page.tsx (Server Component)
   import { JobCardsClient } from './job-cards-client'
   import { getJobCards } from '@/lib/supabase/job-card-queries'

   export default async function JobCardsPage() {
     const supabase = await createClient()
     const { data: { user } } = await supabase.auth.getUser()

     const garageId = await getGarageId(user.id)
     const initialJobCards = await getJobCards(garageId)

     return <JobCardsClient initialData={initialJobCards} garageId={garageId} />
   }
   ```

2. **Extract client-side logic**
   ```typescript
   // app/job-cards/job-cards-client.tsx (Client Component)
   'use client'
   export function JobCardsClient({ initialData, garageId }) {
     // Interactive state, filters, etc.
   }
   ```

**Expected Outcome:** Faster initial load, progressive enhancement

---

## 3. Code Splitting & Lazy Loading

### 🟠 HIGH: Lazy Load Heavy Route Groups

**Impact:** 8/10 | **Effort:** Medium | **Files:** Route groups

**Problem:** All routes load shared chunks immediately. Some features (job-cards calendar, analytics) are heavy but rarely used.

**Solution: Route Group Splitting**

Create route groups for lazy loading:
```
app/
├── (public)/           # Auth routes (login, etc.)
├── (main)/             # Main app routes
│   ├── dashboard/
│   ├── vehicles/
│   └── customers/
├── (advanced)/         # Heavy features
│   ├── job-cards/
│   └── inventory/
└── (admin)/            # Admin settings
    ├── settings/
    └── employee-management/
```

Update `next.config.js`:
```javascript
const nextConfig = {
  experimental: {
    // Optimize chunks by route groups
    optimizePackageImports: ['lucide-react', '@tabler/icons-react'],
  },
  // ... other config
}
```

**Expected Outcome:** Smaller initial chunks for main routes

---

### 🟡 MEDIUM: Lazy Load Modals and Overlays

**Impact:** 6/10 | **Effort:** Medium | **Files:** Multiple modal files

**Problem:** Modals imported normally, included in initial bundle

**Files to Optimize:**
1. `components/auth/forgot-password-modal.tsx`
2. `components/auth/forgot-login-id-modal.tsx`
3. `components/settings/edit-employee-modal.tsx`
4. `components/settings/edit-user-modal.tsx`
5. `app/vehicle-catalog/components/request-make-model-modal.tsx`

**Solution:**
```tsx
// Before
import { ForgotPasswordModal } from './forgot-password-modal'

// After
const ForgotPasswordModal = dynamic(
  () => import('./forgot-password-modal'),
  {
    loading: () => <ModalSkeleton />,
    ssr: false
  }
)
```

**Expected Outcome:** 20-30KB bundle reduction

---

### 🟡 MEDIUM: Lazy Load Third-Party Libraries

**Impact:** 7/10 | **Effort:** Low | **Files:** Usage sites

**Libraries to Lazy Load:**
1. **@fullcalendar** (6 packages, heavy)
   - `app/job-cards/components/calendar/CalendarView.tsx`
   - Already using dynamic import (good!)

2. **react-modern-gantt** (if used)
   - Lazy load when needed

3. **@dnd-kit** (drag and drop)
   - Only load when in kanban view
   - Already partially implemented

**Current Good Implementation:**
```tsx
// app/job-cards/page.tsx (lines 39-62)
const TimelineView = dynamic(() => import('./components/timeline/TimelineView'), {
  loading: () => <div>...</div>,
  ssr: false
})

const CalendarView = dynamic(() => import('./components/calendar/CalendarView'), {
  loading: () => <div>...</div>,
  ssr: false
})
```

**Expand this pattern to other views**

---

## 4. Animation & Rendering Performance

### 🔴 CRITICAL: Replace Framer Motion with CSS (Simple Animations)

**Impact:** 9/10 | **Effort:** High | **Files:** 40+ files

**Problem:** Framer Motion used for simple CSS animations throughout

**Action Plan:**

#### Phase 1: Create CSS Animation Library

Create `app/globals.css` additions:
```css
/* Fade In Animations */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

/* Utility classes */
.animate-fade-in {
  animation: fadeIn 0.3s ease-out;
}

.animate-fade-in-up {
  animation: fadeInUp 0.4s ease-out;
}

.animate-fade-in-down {
  animation: fadeInDown 0.4s ease-out;
}

.animate-scale-in {
  animation: scaleIn 0.2s ease-out;
}

/* Stagger delays */
.animate-delay-100 { animation-delay: 0.1s; }
.animate-delay-200 { animation-delay: 0.2s; }
.animate-delay-300 { animation-delay: 0.3s; }
```

#### Phase 2: Replace Framer Motion (Priority Files)

**Files to Refactor:**

1. **Dashboard Components**
   - `components/dashboard/hub-card.tsx`
   ```tsx
   // Before
   <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>

   // After
   <div className="animate-fade-in-up">
   ```

2. **Skeleton Components**
   - All files in `components/ui/skeleton/`
   - Use CSS animations instead of Framer Motion

3. **Card Components**
   - Vehicle catalog cards
   - Employee list cards
   - Customer cards

4. **Modal Components**
   - Keep Framer Motion for complex modals (polished feel)
   - Use CSS for simple overlays

**Expected Outcome:**
- Remove Framer Motion from 30+ files
- 50-80KB bundle reduction
- Faster rendering (CSS GPU acceleration)

---

### 🟠 HIGH: Add React.memo for Expensive Components

**Impact:** 7/10 | **Effort:** Medium | **Files:** Multiple list components

**Problem:** List components re-render unnecessarily when parent state changes

**Components to Optimize:**

1. **Kanban Cards**
   ```tsx
   // app/job-cards/components/kanban/KanbanCard.tsx
   export const KanbanCard = React.memo(({ jobCard, onStatusChange }) => {
     // Component implementation
   }, (prevProps, nextProps) => {
     // Custom comparison
     return prevProps.jobCard.id === nextProps.jobCard.id &&
            prevProps.jobCard.status === nextProps.jobCard.status
   })
   ```

2. **List Items**
   - Vehicle list items
   - Employee list items
   - Customer list items

3. **Calendar Events**
   ```tsx
   // app/job-cards/components/calendar/EventWithProgress.tsx
   export const EventWithProgress = React.memo(({ event }) => {
     // ...
   })
   ```

**Expected Outcome:** Reduced unnecessary re-renders, smoother interactions

---

### 🟡 MEDIUM: Virtualize Long Lists

**Impact:** 6/10 | **Effort:** High | **Files:** List pages

**Problem:** All items rendered at once in large lists (100+ items)

**Files to Optimize:**
1. `app/employee-management/page.tsx` (1,596 lines)
2. `app/customer-management/page.tsx`
3. `app/inventory/page.tsx`
4. `app/vehicles/page.tsx`

**Solution: Implement react-window or react-virtuoso**

```bash
npm install react-virtuoso
```

```tsx
// Example implementation
import { Virtuoso } from 'react-virtuoso'

export function EmployeeList({ employees }) {
  return (
    <Virtuoso
      style={{ height: '600px' }}
      data={employees}
      itemContent={(index, employee) => (
        <EmployeeListItem key={employee.id} employee={employee} />
      )}
    />
  )
}
```

**Expected Outcome:**
- Constant render time regardless of list size
- Smoother scrolling with 1000+ items

---

## 5. Data Fetching & Caching

### 🟠 HIGH: Implement React Query for Client Data

**Impact:** 8/10 | **Effort:** High | **Files:** Multiple client components

**Current State:**
- `@tanstack/react-query` installed (v5.90.19)
- Query provider exists: `app/job-cards/lib/providers/query-provider.tsx`
- Underutilized in the application

**Problem:** Manual fetching with `useEffect` in many components

**Action Plan:**

#### Phase 1: Create Query Hooks

Create `lib/queries/` directory with:
```typescript
// lib/queries/job-cards.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getJobCards, updateJobCardStatus } from '@/lib/supabase/job-card-queries'

export function useJobCards(garageId: string) {
  return useQuery({
    queryKey: ['job-cards', garageId],
    queryFn: () => getJobCards(garageId),
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
  })
}

export function useUpdateJobCardStatus() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateJobCardStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] })
    },
  })
}
```

#### Phase 2: Replace useEffect Patterns

**Before:**
```tsx
const [data, setData] = useState([])
const [loading, setLoading] = useState(true)

useEffect(() => {
  fetchData().then(result => {
    setData(result)
    setLoading(false)
  })
}, [])
```

**After:**
```tsx
const { data, isLoading } = useJobCards(garageId)
```

**Benefits:**
- Automatic caching
- Background refetching
- Optimistic updates
- No stale data issues

**Expected Outcome:** 40-60% faster subsequent page loads

---

### 🟠 HIGH: Implement Server-Side Caching

**Impact:** 8/10 | **Effort:** Medium | **Files:** Server Components and API routes

**Problem:** No caching strategy for frequently accessed, slow-changing data

**Data to Cache:**
1. **Vehicle Catalog** (makes, models, years)
   - Changes rarely
   - Cache: 1 hour

2. **Employee List**
   - Changes infrequently
   - Cache: 5 minutes

3. **Service Parts/Inventory**
   - Changes moderately
   - Cache: 1 minute

**Implementation:**

```typescript
// Approach 1: Route-level caching
export const revalidate = 300 // 5 minutes

// Approach 2: Fetch-level caching
const data = await fetch(url, {
  next: { revalidate: 60 } // 1 minute
})

// Approach 3: On-demand revalidation
// Tag-based revalidation
fetch(url, { next: { tags: ['job-cards'] } })
```

**Files to Update:**
1. `app/vehicle-catalog/page.tsx`
   ```typescript
   export const revalidate = 3600 // 1 hour
   ```

2. `app/employee-management/page.tsx`
   ```typescript
   export const revalidate = 300 // 5 minutes
   ```

3. `app/inventory/page.tsx`
   ```typescript
   export const revalidate = 60 // 1 minute
   ```

**Expected Outcome:**
- 70-90% faster response times for cached data
- Reduced database load

---

### 🟡 MEDIUM: Optimize Database Queries (N+1 Issues)

**Impact:** 6/10 | **Effort:** High | **Files:** `lib/supabase/*.ts`

**Problem:** Potential N+1 query issues in data fetching

**Files to Review:**
1. `lib/supabase/job-card-queries.ts` (1,210 lines)
2. `lib/supabase/customer-queries.ts` (652 lines)
3. `lib/supabase/motorcycle-queries.ts` (385 lines)

**Optimization Strategy:**

1. **Use Supabase joins** instead of separate queries
   ```typescript
   // BEFORE: N+1 query
   const jobCards = await supabase.from('job_cards').select('*')
   for (const card of jobCards) {
     const customer = await supabase.from('customers').select('*').eq('id', card.customer_id)
   }

   // AFTER: Single query with join
   const jobCards = await supabase
     .from('job_cards')
     .select(`
       *,
       customer:customers(*),
       vehicle:motorcycles(*),
       mechanic:employees(*)
     `)
   ```

2. **Add database indexes** for common query patterns
   - job_cards(garage_id, status, created_at)
   - customers(garage_id, created_at)
   - motorcycles(garage_id, make, model)

3. **Use pagination** for large lists
   ```typescript
   const { data } = await supabase
     .from('job_cards')
     .select('*', { count: 'exact' })
     .range(0, 19)
   ```

**Expected Outcome:**
- 5-10x faster queries for nested data
- Reduced database roundtrips

---

## 6. Database & API Optimization

### 🟠 HIGH: Add Request Validation and Sanitization

**Impact:** 7/10 | **Effort:** Medium | **Files:** API routes

**Current State:** API routes in `app/api/**/*.ts`

**Problem:** Missing consistent validation layer

**Action Items:**

1. **Centralize validation schemas**
   Create `lib/api/validation.ts`:
   ```typescript
   import { z } from 'zod'

   export const jobCardSchema = z.object({
     title: z.string().min(1).max(200),
     description: z.string().max(1000).optional(),
     status: z.enum(['draft', 'queued', 'in_progress', 'parts_waiting', 'quality_check', 'ready', 'delivered']),
     // ... other fields
   })
   ```

2. **Add validation middleware**
   ```typescript
   // lib/api/middleware.ts
   export function validateRequest(schema: z.ZodSchema) {
     return async (req: Request) => {
       const body = await req.json()
       const validated = schema.parse(body)
       return validated
     }
   }
   ```

3. **Apply to all API routes**
   - `app/api/job-cards/create/route.ts`
   - `app/api/vehicles/add/route.ts`
   - `app/api/customers/[id]/route.ts`
   - etc.

**Expected Outcome:**
- Faster failure on invalid input
- Reduced database load from bad requests
- Better error messages

---

### 🟡 MEDIUM: Implement Response Caching Headers

**Impact:** 6/10 | **Effort:** Low | **Files:** API routes

**Problem:** No caching headers on GET requests

**Solution:**
```typescript
// app/api/job-cards/list/route.ts
export async function GET(request: Request) {
  const data = await getJobCards()

  return NextResponse.json(data, {
     headers: {
       'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30'
     }
  })
}
```

**Apply to:**
- `app/api/vehicles/list/route.ts`
- `app/api/customers/list/route.ts`
- `app/api/employees/list/route.ts`
- `app/api/inventory/list/route.ts`

**Expected Outcome:** 30-50% faster API responses for repeated requests

---

## 7. Font & Asset Optimization

### 🟠 HIGH: Optimize Font Loading

**Impact:** 7/10 | **Effort:** Low | **File:** `app/layout.tsx`

**Current State:**
```typescript
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow',
  display: 'swap',
})

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
})

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-manrope',
  display: 'swap',
})
```

**Optimizations:**

1. **Preload critical fonts**
   Add to `app/layout.tsx`:
   ```typescript
   export const metadata = {
     // ... existing metadata
     viewport: {
       width: 'device-width',
       initialScale: 1,
     },
   }

   // Add font preload in head or through next.config.js
   ```

2. **Use `font-style: normal`** for faster loads

3. **Consider reducing font families**
   - 4 font families is a lot
   - Consider merging Inter and Manrope (similar sans-serif)
   - Keep Barlow for headings only
   - Keep JetBrains Mono for code only

4. **Subset fonts to used characters**
   ```typescript
   const barlow = Barlow({
     subsets: ['latin'],
     // Add only needed weights
     weight: ['600', '700'], // Remove 500 if not used much
     variable: '--font-barlow',
     display: 'swap',
     // Add preconnect
     preload: true,
   })
   ```

**Expected Outcome:**
- 200-500ms faster font display
- Reduced layout shift

---

### 🟡 MEDIUM: Optimize Static Assets

**Impact:** 5/10 | **Effort:** Low | **Directory:** `public/`

**Current Assets:**
```
public/
├── bg-animation/
├── login-bg.jpg (248KB)
├── wp8647308-bike-garage-wallpapers.jpg (248KB) - UNUSED
└── logos/ (empty)
```

**Action Items:**

1. **Remove unused assets**
   ```bash
   rm public/wp8647308-bike-garage-wallpapers.jpg
   ```

2. **Optimize background images**
   - Convert `login-bg.jpg` to WebP/AVIF
   - Compress to < 100KB
   - Consider using gradient CSS instead

3. **Add image compression script**
   ```bash
   npm install --save-dev imagemin imagemin-webp
   ```

4. **Enable CDN for static assets** (if using Vercel/Vercel CDN is automatic)

**Expected Outcome:** Faster image loads, reduced bandwidth

---

## 8. Build & Configuration

### 🟡 MEDIUM: Optify Next.js Configuration

**Impact:** 6/10 | **Effort:** Low | **File:** `next.config.js`

**Current Config:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [...],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [25, 50, 75, 90],
    minimumCacheTTL: 86400,
  },
}
```

**Add Optimizations:**
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Enable SWC minification (faster than Terser)
  swcMinify: true,

  // Experimental optimizations
  experimental: {
    // Optimize package imports
    optimizePackageImports: [
      'lucide-react',
      '@tabler/icons-react',
      '@radix-ui/react-context-menu',
      '@radix-ui/react-popover',
      '@radix-ui/react-tabs',
    ],

    // Enable turbo (if ready)
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },

  // Compression
  compress: true,

  // Production source maps (disable for smaller builds)
  productionBrowserSourceMaps: false,

  // Images
  images: {
    remotePatterns: [...],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [25, 50, 75, 90],
    minimumCacheTTL: 86400,
    // Add image optimization
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: '/:all*(svg|jpg|jpeg|png|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}
```

**Expected Outcome:**
- 5-10% faster builds
- Smaller production bundles
- Better caching

---

### 🟢 LOW: Enable TypeScript Incremental Build

**Impact:** 4/10 | **Effort:** Low | **File:** `tsconfig.json`

**Add to `tsconfig.json`:**
```json
{
  "compilerOptions": {
    "incremental": true,
    "tsBuildInfoFile": ".tsbuildinfo"
  }
}
```

**Expected Outcome:** Faster subsequent builds

---

## 9. Monitoring & Measurement

### 🔴 CRITICAL: Set Up Performance Monitoring

**Impact:** 10/10 | **Effort:** Medium | **Tools:** Vercel Analytics / Lighthouse CI

**Problem:** No visibility into production performance

**Action Plan:**

#### Phase 1: Core Web Vitals Monitoring

1. **Install Web Vitals Reporter**
   ```bash
   npm install next-web-vitals
   ```

2. **Create analytics hook**
   ```typescript
   // lib/hooks/use-web-vitals.ts
   'use client'
   import { useReportWebVitals } from 'next-web-vitals'

   export function useWebVitals() {
     useReportWebVitals((metric) => {
       // Send to analytics (Vercel, Google Analytics, etc.)
       console.log(metric)

       // Example: send to Vercel Analytics
       // va.track('Web Vitals', metric)
     })
   }
   ```

3. **Add to root layout**
   ```tsx
   // app/layout.tsx
   import { useWebVitals } from '@/lib/hooks/use-web-vitals'

   export default function RootLayout({ children }) {
     useWebVitals()
     return <html>...</html>
   }
   ```

#### Phase 2: Lighthouse CI

Create `.github/workflows/lighthouse.yml`:
```yaml
name: Lighthouse CI
on: [push, pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Lighthouse CI
        uses: treosh/lighthouse-ci-action@v9
        with:
          urls: |
            http://localhost:3000
            http://localhost:3000/dashboard
            http://localhost:3000/job-cards
```

#### Phase 3: Vercel Analytics (if using Vercel)

1. Install:
   ```bash
   npm install @vercel/analytics
   ```

2. Add to layout:
   ```tsx
   import { Analytics } from '@vercel/analytics/react'

   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           {children}
           <Analytics />
         </body>
       </html>
     )
   }
   ```

**Expected Outcome:** Continuous performance visibility

**References:**
- [Next.js Web Vitals](https://nextjs.org/docs/app/building-your-application/optimizing/third-party-libraries)
- [Vercel Analytics](https://vercel.com/docs/analytics)

---

### 🟠 HIGH: Establish Performance Budgets

**Impact:** 8/10 | **Effort:** Low | **File:** `package.json`

**Add to `package.json`:**
```json
{
  "scripts": {
    "build": "next build",
    "build:check": "npm run build && npx bundle-wizard",
    "lighthouse": "lhci autorun",
    "performance-budget": "npx next-bundle-analysis"
  }
}
```

**Budgets to Set:**
```javascript
// .bundlewatchrc
module.exports = {
  files: [
    {
      path: '.next/static/chunks/**/*.js',
      maxSize: '200 KB'
    },
    {
      path: '.next/static/chunks/pages/**/*.{js,css}',
      maxSize: '100 KB'
    }
  ]
}
```

**Expected Outcome:** Catch performance regressions early

---

## Implementation Priority Order

### Sprint 1 (Week 1-2) - Critical & High Impact

1. ✅ **Install Bundle Analyzer** - 2 hours
2. ✅ **Optimize Framer Motion (Phase 1)** - 1 week
   - Create CSS animation library
   - Replace in top 20 files
3. ✅ **Convert Client to Server Components** - 1 week
   - Focus on 10 easiest wins
4. ✅ **Add React Query** - 3 days
   - Set up provider
   - Create query hooks
   - Replace 5 major useEffect patterns
5. ✅ **Performance Monitoring** - 2 days
   - Web Vitals reporting
   - Bundle analyzer

**Expected Impact:** 40-50% improvement in initial load time

### Sprint 2 (Week 3-4) - Optimization

6. ✅ **Split Large Components** - 1 week
   - job-cards/create/page.tsx
   - Validation files
   - Query files
7. ✅ **Server-Side Caching** - 3 days
   - Add revalidation
   - Cache headers
8. ✅ **Database Query Optimization** - 1 week
   - Fix N+1 queries
   - Add indexes
9. ✅ **Font Optimization** - 2 days
10. ✅ **Lazy Load Modals** - 3 days

**Expected Impact:** 30-40% improvement in API response times

### Sprint 3 (Week 5-6) - Refinement

11. ✅ **Virtualize Long Lists** - 1 week
12. ✅ **Add React.memo** - 3 days
13. ✅ **Asset Optimization** - 2 days
14. ✅ **Next.js Config Tuning** - 1 day
15. ✅ **Performance Budgets** - 1 day

**Expected Impact:** 20-30% improvement in rendering performance

---

## Success Metrics

Track these metrics before and after implementation:

### Bundle Size
- **Current:** First Load JS: 87.7 KB (homepage)
- **Target:** First Load JS: < 150 KB (largest pages)

### Page Load Times
- **Current:** Unknown (add monitoring first)
- **Target:** TTI < 3s on 4G

### Core Web Vitals
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1
- **FCP (First Contentful Paint):** < 1.8s
- **TBT (Total Blocking Time):** < 200ms

### API Performance
- **Current:** Unknown
- **Target:** p95 < 200ms for all endpoints

---

## Testing Strategy

### Performance Testing

1. **Load Testing** (k6 or artillery)
   - Test job cards list (100+ concurrent)
   - Test dashboard page
   - Test API endpoints

2. **Lighthouse CI**
   - Run on every PR
   - Block regressions

3. **Bundle Analysis**
   - Run after major changes
   - Track bundle growth

### Regression Testing

After each optimization, verify:
- [ ] Functionality still works
- [ ] No console errors
- [ ] Visual regression (screenshots)
- [ ] Performance metrics improved

---

## Rollback Plan

If issues arise:

1. **Bundle analyzer shows regression** → Revert last optimization
2. **Page errors increase** → Check Server Component conversions
3. **UI feels slower** → Review React.memo usage
4. **Data appears stale** → Adjust cache revalidation times

**Git Strategy:**
- Create feature branch: `perf/optimize-{feature}`
- Test thoroughly in staging
- Merge to main with full test suite

---

## Additional Resources

### Research Sources
- [Next.js Official Documentation - Package Bundling](https://nextjs.org/docs/app/guides/package-bundling)
- [Next.js Server vs Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
- [The 10KB Next.js App - Extreme Optimization](https://medium.com/better-dev-nextjs-react/the-10kb-next-js-app-extreme-bundle-optimization-techniques-d8047c482aea)
- [Code Splitting in Next.js](https://blazity.com/blog/code-splitting-next-js)
- [React Server Components Performance](https://www.developerway.com/posts/react-server-components-performance)
- [Syncfusion - Bundle Optimization](https://www.syncfusion.com/blogs/post/optimize-next-js-app-bundle)
- [Dev.to - Reducing Bundle Size](https://dev.to/maurya-sachin/reducing-javascript-bundle-size-in-nextjs-practical-guide-for-faster-apps-h0)

### Tools & Libraries
- **@next/bundle-analyzer** - Bundle visualization
- **@vercel/analytics** - Production monitoring
- **next-web-vitals** - Web Vitals tracking
- **react-virtuoso** - List virtualization
- **@tanstack/react-query** - Data fetching (already installed)

---

## Conclusion

This roadmap provides a systematic approach to optimizing RevvOS performance. The optimizations are prioritized by impact and effort, with clear implementation guidance for each item.

**Key Takeaways:**
1. **Focus on Server Components** - Biggest impact for least effort
2. **Replace Framer Motion** - 50-80KB bundle savings
3. **Implement Caching** - 40-60% faster subsequent loads
4. **Monitor Everything** - Can't improve what you don't measure

**Next Steps:**
1. Review roadmap with team
2. Set up performance monitoring (Week 1)
3. Sprint planning for top 5 items
4. Create tracking dashboard for metrics
5. Iterate based on real-world data

**Estimated Total Effort:** 6-8 weeks for full implementation
**Expected Performance Improvement:** 60-80% overall

---

**Document Version:** 1.0
**Last Updated:** 2026-01-22
**Maintained By:** Development Team
**Review Date:** 2026-02-22
