# Job Card Tracking System - Implementation Plan

**RevvOS Automotive Garage Management System**

**Version:** 1.0  
**Date:** January 19, 2026  
**Status:** Ready for Implementation

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technology Stack Selection](#technology-stack-selection)
3. [Component Architecture](#component-architecture)
4. [Step-by-Step Implementation Guide](#step-by-step-implementation-guide)
5. [Best Practices](#best-practices)
6. [Risk Mitigation](#risk-mitigation)
7. [Testing Strategy](#testing-strategy)
8. [Migration Approach](#migration-approach)
9. [References](#references)

---

## Executive Summary

This implementation plan provides a comprehensive roadmap for overhauling the Job Card Tracking System in RevvOS. The current system has a solid foundation with well-defined workflows but lacks modern interactive features like drag-and-drop, timeline views, and real-time updates.

### Key Objectives

- **Modernize the Kanban Board** with drag-and-drop functionality
- **Add Timeline/Gantt View** for better project management visualization
- **Enhance Calendar View** with drag-to-reschedule and resource views
- **Improve Performance** using Next.js 15 features and modern state management
- **Ensure Accessibility** compliance with WCAG 2.1 AA standards
- **Optimize Mobile Experience** for technicians on the shop floor

### Project Timeline

- **Phase 1:** 1-2 weeks (Foundation & Drag-and-Drop)
- **Phase 2:** 2-3 weeks (Timeline & Calendar Enhancements)
- **Phase 3:** 2-3 weeks (Advanced Features)
- **Phase 4:** 1-2 weeks (Polish & Analytics)
- **Total:** 6-10 weeks

---

## Technology Stack Selection

### 1. Drag-and-Drop Library

#### **Recommendation: @dnd-kit/core** ✅

**Rationale:**

Based on extensive 2025 research, **@dnd-kit/core** is the clear winner:

- **Active Maintenance:** Unlike react-beautiful-dnd which was deprecated in October 2024
- **Lightweight:** Only ~10KB with zero dependencies
- **Versatile:** Supports lists, grids, trees, and complex layouts
- **Modern:** Built specifically for React 18+ with hooks
- **Accessibility:** Built-in keyboard navigation and screen reader support
- **Performance:** Optimized for minimal re-renders

**Comparison with Alternatives:**

| Feature | @dnd-kit/core | react-beautiful-dnd | react-dnd |
|---------|---------------|---------------------|-----------|
| Status | ✅ Active | ❌ Deprecated | ⚠️ Less Active |
| Bundle Size | ~10 KB | ~35 KB | ~20 KB |
| TypeScript | First-class | Good | Requires setup |
| Accessibility | Excellent | Good | Manual required |
| Learning Curve | Medium | Easy | Steep |

**Installation:**
\`\`\`bash
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
\`\`\`

**Key Packages:**
- \`@dnd-kit/core\` - Core drag-and-drop functionality
- \`@dnd-kit/sortable\` - Sortable lists (for Kanban reordering)
- \`@dnd-kit/utilities\` - Accessibility and utilities

---

### 2. Timeline/Gantt Chart Library

#### **Recommendation: React-Modern-Gantt** ✅

**Rationale:**

Based on 2025 research, React-Modern-Gantt offers the best balance:

- **Open Source:** No licensing fees
- **Modern:** Built for React 18+
- **Interactive:** Drag-to-reschedule, progress editing
- **Customizable:** Highly flexible styling
- **Lightweight:** Smaller bundle than commercial alternatives

**Alternative (Commercial): Bryntum Gantt**
- Use if budget permits and enterprise features are needed
- Excellent documentation and long-term support
- Advanced features like critical path, resource management

**Installation:**
\`\`\`bash
npm install react-modern-gantt
\`\`\`

**Key Features for Implementation:**
- Task dependencies visualization
- Edit mode for task updates
- Progress tracking with \`showProgress\` prop
- Duration bars with drag-to-resize
- Timeline zoom levels (day/week/month)

---

### 3. State Management

#### **Recommendation: Zustand** ✅

**Rationale:**

Based on 2025 research comparing Zustand vs Jotai vs Redux:

- **Simplicity:** Minimal boilerplate, easy to learn
- **Performance:** 40% faster implementation time than Recoil
- **Bundle Size:** 15% smaller than alternatives
- **TypeScript:** First-class support
- **Next.js Compatible:** Works perfectly with Server Components
- **DevTools:** Excellent debugging experience

**When to Use:**
- Client-side UI state (view modes, filters, UI preferences)
- Temporary state (drag-and-drop, form interactions)
- Cross-component state sharing

**Comparison:**

| Feature | Zustand | Jotai | Redux Toolkit |
|---------|---------|-------|---------------|
| Bundle Size | ~1KB | ~3KB | ~12KB |
| Learning Curve | Low | Medium | High |
| Best For | Medium apps | Fine-grained state | Large teams |
| Server Components | ✅ Yes | ✅ Yes | ⚠️ Complex |

**Installation:**
\`\`\`bash
npm install zustand
\`\`\`

**Note on Server State:**
- Use **@tanstack/react-query** for server state (job cards, customers, etc.)
- Zustand for client state only
- This separation follows 2025 best practices

---

### 4. Server State Management

#### **Recommendation: @tanstack/react-query (TanStack Query v5)** ✅

**Rationale:**

Based on 2025 research:

- **Caching:** Automatic caching and revalidation
- **Next.js 15 Support:** Works seamlessly with Server Components
- **TypeScript:** Excellent type inference
- **DevTools:** Powerful debugging interface
- **Optimistic Updates:** Built-in support for better UX

**Important Note (2025 Perspective):**
With Next.js 15's Server Components, you may not need React Query for everything. Use it for:
- Interactive data that changes frequently
- Real-time updates
- Complex caching requirements
- Background data synchronization

**Installation:**
\`\`\`bash
npm install @tanstack/react-query
\`\`\`

**Usage Pattern:**
\`\`\`typescript
// lib/hooks/use-job-cards.ts
import { useQuery } from '@tanstack/react-query'
import { getJobCardsByGarageId } from '@/lib/supabase/job-card-queries'

export function useJobCards(garageId: string, filters?: JobCardFilters) {
  return useQuery({
    queryKey: ['job-cards', garageId, filters],
    queryFn: () => getJobCardsByGarageId(garageId, filters),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
\`\`\`

---

### 5. Additional Libraries

#### **Form Handling: react-hook-form** (Already Installed)
- ✅ Already in package.json
- ✅ Works great with Zustand
- ✅ Minimal re-renders

#### **Data Validation: Zod** (Already Installed)
- ✅ Already in package.json
- ✅ TypeScript-first
- ✅ Use for API validation

#### **Animations: Framer Motion** (Already Installed)
- ✅ Already in package.json
- ✅ Use for drag animations, page transitions
- ✅ Performance optimized

#### **Icons: Lucide React** (Already Installed)
- ✅ Already in package.json
- ✅ Tree-shakeable
- ✅ Modern icon set

#### **Calendar: @fullcalendar/react** (New Addition)
\`\`\`bash
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
\`\`\`
- For enhanced calendar view
- Drag-to-reschedule
- Resource views

#### **Skeleton Screens: react-loading-skeleton**
\`\`\`bash
npm install react-loading-skeleton
\`\`\`
- For better loading states
- React 19 compatible

---

## Component Architecture

### File Structure

\`\`\`
/app/job-cards
├── page.tsx                          # Main view with tabs
├── [id]/
│   └── page.tsx                      # Job card detail
├── create/
│   └── page.tsx                      # Create job card
├── components/
│   ├── kanban/
│   │   ├── KanbanBoard.tsx           # Main kanban container
│   │   ├── KanbanColumn.tsx          # Individual column
│   │   ├── KanbanCard.tsx            # Card component
│   │   ├── KanbanDragDropContext.tsx # DnD provider wrapper
│   │   ├── KanbanHeader.tsx          # Header with stats
│   │   └── KanbanToolbar.tsx         # Filters & search
│   ├── timeline/
│   │   ├── TimelineView.tsx          # Main timeline container
│   │   ├── GanttChart.tsx            # Gantt chart component
│   │   ├── TaskBar.tsx               # Individual task bar
│   │   ├── TimelineHeader.tsx        # Date navigator
│   │   └── DependencyLine.tsx        # Task dependencies
│   ├── calendar/
│   │   ├── CalendarView.tsx          # Main calendar container
│   │   ├── MonthView.tsx             # Month grid
│   │   ├── WeekView.tsx              # Week columns
│   │   ├── DayView.tsx               # Day schedule
│   │   ├── CalendarToolbar.tsx       # View switcher
│   │   └── CalendarEvent.tsx         # Event popover
│   ├── shared/
│   │   ├── JobCardActions.tsx        # Action buttons (edit, delete, etc.)
│   │   ├── StatusBadge.tsx           # Status indicator
│   │   ├── PriorityBadge.tsx         # Priority indicator
│   │   ├── JobCardSkeleton.tsx       # Loading skeleton
│   │   ├── EmptyState.tsx            # Empty state illustration
│   │   ├── ErrorState.tsx            # Error boundary fallback
│   │   └── QuickStatusChange.tsx     # Inline status dropdown
│   └── filters/
│       ├── FilterPanel.tsx           # Advanced filters
│       ├── StatusFilter.tsx          # Status multi-select
│       ├── MechanicFilter.tsx        # Mechanic assignment filter
│       ├── DateRangeFilter.tsx       # Date range picker
│       └── SavedFilters.tsx          # Filter presets
├── hooks/
│   ├── use-job-cards.ts              # Job cards data hook
│   ├── use-job-card-mutations.ts     # Mutations (update, delete)
│   ├── use-kanban-dnd.ts             # Drag-and-drop logic
│   ├── use-calendar-drag.ts          # Calendar drag-to-reschedule
│   ├── use-keyboard-shortcuts.ts     # Keyboard navigation
│   └── use-job-card-filter.ts        # Filter logic
├── lib/
│   ├── stores/
│   │   ├── job-card-store.ts         # Zustand store (UI state)
│   │   └── filter-store.ts           # Filter state store
│   ├── utils/
│   │   ├── kanban-utils.ts           # Column calculations
│   │   ├── calendar-utils.ts         # Date helpers
│   │   └── timeline-utils.ts         # Gantt calculations
│   └── constants/
│       ├── status-constants.ts       # Status definitions
│       └── priority-constants.ts     # Priority levels
└── types/
    ├── job-card.types.ts             # TypeScript types
    ├── kanban.types.ts               # Kanban-specific types
    └── timeline.types.ts             # Timeline types
\`\`\`

---

## Step-by-Step Implementation Guide

### Phase 1: Foundation & Drag-and-Drop (Week 1-2)

#### **Step 1.1: Install Dependencies**

\`\`\`bash
# Drag and drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# State management
npm install zustand

# Server state
npm install @tanstack/react-query

# Loading states
npm install react-loading-skeleton

# Calendar (optional for Phase 2)
npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid @fullcalendar/interaction
\`\`\`

#### **Step 1.2: Setup Zustand Store**

Create \`app/job-cards/lib/stores/job-card-store.ts\`:

\`\`\`typescript
import { create } from 'zustand'
import { JobCardStatus, Priority } from '@/lib/supabase/job-card-queries'

interface JobCardUIState {
  // View mode
  viewMode: 'kanban' | 'timeline' | 'calendar'
  setViewMode: (mode: 'kanban' | 'timeline' | 'calendar') => void
  
  // Filters
  statusFilter: JobCardStatus | 'all'
  setStatusFilter: (status: JobCardStatus | 'all') => void
  mechanicFilter: string | null
  setMechanicFilter: (mechanicId: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void
  
  // UI preferences
  cardDensity: 'comfortable' | 'compact'
  setCardDensity: (density: 'comfortable' | 'compact') => void
  showWIPWarnings: boolean
  toggleWIPWarnings: () => void
  
  // Drag and drop state
  isDragging: boolean
  setIsDragging: (isDragging: boolean) => void
  draggedCardId: string | null
  setDraggedCardId: (id: string | null) => void
}

export const useJobCardStore = create<JobCardUIState>((set) => ({
  viewMode: 'kanban',
  setViewMode: (mode) => set({ viewMode: mode }),
  
  statusFilter: 'all',
  setStatusFilter: (status) => set({ statusFilter: status }),
  mechanicFilter: null,
  setMechanicFilter: (mechanicId) => set({ mechanicFilter: mechanicId }),
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  cardDensity: 'comfortable',
  setCardDensity: (density) => set({ cardDensity: density }),
  showWIPWarnings: true,
  toggleWIPWarnings: () => set((state) => ({ showWIPWarnings: !state.showWIPWarnings })),
  
  isDragging: false,
  setIsDragging: (isDragging) => set({ isDragging }),
  draggedCardId: null,
  setDraggedCardId: (id) => set({ draggedCardId: id }),
}))
\`\`\`

#### **Step 1.3: Setup React Query Provider**

Create \`app/job-cards/lib/providers/query-provider.tsx\`:

\`\`\`typescript
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'

export function JobCardQueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            refetchOnWindowFocus: false,
            retry: 1,
          },
        },
      })
  )

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
}
\`\`\`

Update \`app/job-cards/layout.tsx\`:

\`\`\`typescript
import { JobCardQueryProvider } from './lib/providers/query-provider'

export default function JobCardsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <JobCardQueryProvider>{children}</JobCardQueryProvider>
}
\`\`\`

#### **Step 1.4: Create Custom Hooks**

Create \`app/job-cards/hooks/use-job-cards.ts\`:

\`\`\`typescript
'use client'

import { useQuery } from '@tanstack/react-query'
import { getJobCardsByGarageId, type JobCardFilters } from '@/lib/supabase/job-card-queries'

export function useJobCards(garageId: string, filters?: JobCardFilters) {
  return useQuery({
    queryKey: ['job-cards', garageId, filters],
    queryFn: () => getJobCardsByGarageId(garageId, filters),
    enabled: !!garageId,
  })
}
\`\`\`

Create \`app/job-cards/hooks/use-job-card-mutations.ts\`:

\`\`\`typescript
'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateJobCard, updateJobCardStatus } from '@/lib/supabase/job-card-queries'

export function useUpdateJobCardStatus() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ 
      jobCardId, 
      newStatus, 
      userId 
    }: { 
      jobCardId: string
      newStatus: string
      userId: string
    }) => updateJobCardStatus(jobCardId, newStatus as any, userId),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] })
    },
  })
}

export function useUpdateJobCard() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ jobCardId, updates }: { jobCardId: string; updates: any }) =>
      updateJobCard(jobCardId, updates),
    
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['job-cards'] })
    },
  })
}
\`\`\`

#### **Step 1.5: Implement Drag-and-Drop Kanban**

Create \`app/job-cards/components/kanban/KanbanDragDropContext.tsx\`:

\`\`\`typescript
'use client'

import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  TouchSensor,
} from '@dnd-kit/core'
import { useJobCardStore } from '../../lib/stores/job-card-store'
import { useUpdateJobCardStatus } from '../../hooks/use-job-card-mutations'

interface KanbanDragDropContextProps {
  children: React.ReactNode
  garageId: string
  userId: string
}

export function KanbanDragDropContext({ 
  children, 
  garageId,
  userId 
}: KanbanDragDropContextProps) {
  const { setIsDragging, setDraggedCardId } = useJobCardStore()
  const updateStatus = useUpdateJobCardStatus()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 8,
      },
    })
  )

  const handleDragStart = (event: DragStartEvent) => {
    setIsDragging(true)
    setDraggedCardId(event.active.id as string)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setIsDragging(false)
    setDraggedCardId(null)
    
    const { active, over } = event
    
    if (!over) return
    
    const activeId = active.id as string
    const newStatus = over.id as string
    
    // Update via mutation
    updateStatus.mutate({
      jobCardId: activeId,
      newStatus,
      userId,
    })
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      {children}
    </DndContext>
  )
}
\`\`\`

### Phase 2: Timeline & Calendar Enhancements (Week 3-5)

#### **Step 2.1: Implement Timeline/Gantt View**

Create \`app/job-cards/components/timeline/TimelineView.tsx\`:

\`\`\`typescript
'use client'

import { useState } from 'react'
import GanttChart from 'react-modern-gantt'
import { useJobCards } from '../../hooks/use-job-cards'

export function TimelineView() {
  const { data: jobCards } = useJobCards(garageId)
  const [viewMode, setViewMode] = useState<'day' | 'week'>('week')

  // Transform job cards to Gantt tasks
  const tasks = jobCards?.map((jobCard) => ({
    id: jobCard.id,
    name: \`\${jobCard.jobCardNumber} - \${jobCard.customerName}\`,
    start: new Date(jobCard.createdAt),
    end: new Date(jobCard.promisedDate || jobCard.createdAt),
    progress: jobCard.progressPercentage,
    dependencies: [],
    color: getTaskColor(jobCard.status),
  })) || []

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <TimelineHeader viewMode={viewMode} setViewMode={setViewMode} />
      <GanttChart
        tasks={tasks}
        viewMode={viewMode}
        onTaskUpdate={handleTaskUpdate}
        showProgress={true}
        editMode={true}
      />
    </div>
  )
}
\`\`\`

#### **Step 2.2: Enhanced Calendar with Drag-to-Reschedule**

Create \`app/job-cards/components/calendar/CalendarView.tsx\`:

\`\`\`typescript
'use client'

import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import { useJobCards } from '../../hooks/use-job-cards'
import { useUpdateJobCard } from '../../hooks/use-job-card-mutations'
import { useMemo } from 'react'

export function CalendarView() {
  const { data: jobCards } = useJobCards(garageId)
  const updateJobCard = useUpdateJobCard()

  // Transform job cards to calendar events
  const events = useMemo(() => {
    return jobCards?.map((jobCard) => ({
      id: jobCard.id,
      title: \`\${jobCard.jobCardNumber} - \${jobCard.vehicleMake} \${jobCard.vehicleModel}\`,
      start: jobCard.promisedDate || jobCard.createdAt,
      backgroundColor: getEventColor(jobCard.priority),
      borderColor: getEventColor(jobCard.status),
      extendedProps: {
        jobCard,
      },
    })) || []
  }, [jobCards])

  const handleEventDrop = async (info: any) => {
    const newDate = info.event.start.toISOString()
    
    updateJobCard.mutate({
      jobCardId: info.event.id,
      updates: {
        promisedDate: newDate,
      },
    })
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6">
      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: 'prev,next today',
          center: 'title',
          right: 'dayGridMonth,timeGridWeek,timeGridDay',
        }}
        events={events}
        editable={true}
        droppable={true}
        eventDrop={handleEventDrop}
        eventResize={handleEventDrop}
        height="auto"
      />
    </div>
  )
}
\`\`\`

### Phase 3: Advanced Features (Week 6-8)

#### **Step 3.1: Add Swimlanes**

Create \`app/job-cards/components/kanban/KanbanSwimlane.tsx\`:

\`\`\`typescript
'use client'

import { KanbanBoard } from './KanbanBoard'
import { useJobCardStore } from '../../lib/stores/job-card-store'

type SwimlaneType = 'priority' | 'mechanic' | 'none'

export function KanbanSwimlane() {
  const { swimlaneType } = useJobCardStore()
  
  if (swimlaneType === 'none') {
    return <KanbanBoard />
  }

  // Group job cards by swimlane type
  const groupedJobCards = groupJobCards(jobCards, swimlaneType)

  return (
    <div className="space-y-6">
      {Object.entries(groupedJobCards).map(([group, cards]) => (
        <div key={group}>
          <h3 className="text-lg font-semibold mb-4">{group}</h3>
          <KanbanBoard jobCards={cards} />
        </div>
      ))}
    </div>
  )
}
\`\`\`

#### **Step 3.2: Implement WIP Limits**

\`\`\`typescript
// Add to column component
const wipLimit = column.status === 'in_progress' ? 5 : undefined
const isOverLimit = wipLimit && columnCards.length >= wipLimit

if (isOverLimit) {
  return (
    <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
      <AlertCircle className="h-5 w-5 text-red-600 mb-2" />
      <p className="text-sm text-red-800 font-semibold">
        WIP Limit Exceeded ({columnCards.length}/{wipLimit})
      </p>
    </div>
  )
}
\`\`\`

#### **Step 3.3: Add Keyboard Shortcuts**

Create \`app/job-cards/hooks/use-keyboard-shortcuts.ts\`:

\`\`\`typescript
'use client'

import { useEffect } from 'react'

export function useKeyboardShortcuts(
  shortcuts: Record<string, () => void>
) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is typing in an input
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      const key = e.key.toLowerCase()
      
      // Check for modifier keys
      const modifierKey = e.metaKey || e.ctrlKey
      const shortcut = modifierKey ? \`cmd+\${key}\` : key

      if (shortcuts[shortcut]) {
        e.preventDefault()
        shortcuts[shortcut]()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Usage
useKeyboardShortcuts({
  'k': () => setViewMode('kanban'),
  't': () => setViewMode('timeline'),
  'c': () => setViewMode('calendar'),
  'n': () => router.push('/job-cards/create'),
  '/': () => searchInputRef.current?.focus(),
})
\`\`\`

### Phase 4: Polish & Optimization (Week 9-10)

#### **Step 4.1: Add Skeleton Screens**

Create \`app/job-cards/components/shared/JobCardSkeleton.tsx\`:

\`\`\`typescript
'use client'

import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export function JobCardSkeleton() {
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <Skeleton height={20} width={100} className="mb-3" />
      <Skeleton height={16} width={150} className="mb-3" />
      <Skeleton height={8} count={2} className="mb-3" />
      <Skeleton height={4} width="100%" className="mb-2" />
      <Skeleton height={4} width={60} />
    </div>
  )
}
\`\`\`

---

## Best Practices

### 1. Server Components vs Client Components

**Rule of Thumb (Next.js 15, 2025):** Use Server Components by default

**Server Components (Default):**
- Data fetching
- Static layouts
- SEO-critical content
- Components that don't need interactivity

**Client Components (with 'use client'):**
- Interactivity (onClick, onChange)
- Browser APIs (localStorage, window)
- Hooks (useState, useEffect)
- Third-party libraries with context

### 2. Data Fetching Patterns

**2025 Best Practice:** Use React Query for client-side, Server Components for initial data

### 3. Error Handling

**Use Error Boundaries for React Errors:**
\`\`\`typescript
<ErrorBoundary fallback={<ErrorFallback />}>
  <JobCardsPage />
</ErrorBoundary>
\`\`\`

### 4. Loading States

**Use Skeleton Screens (2025 Best Practice):**
\`\`\`typescript
{isLoading ? (
  <KanbanSkeleton />
) : error ? (
  <ErrorState error={error} />
) : (
  <KanbanBoard jobCards={jobCards} />
)}
\`\`\`

### 5. Accessibility (WCAG 2.1 AA)

**Keyboard Navigation:**
- All drag-and-drop must have keyboard alternatives
- Use Tab, Arrow keys, Enter, Space
- Provide visible focus indicators

**ARIA Labels:**
\`\`\`typescript
<div
  role="button"
  aria-label="Move job card to In Progress"
  tabIndex={0}
>
  Move to In Progress
</div>
\`\`\`

### 6. Performance Optimization

**Code Splitting:**
\`\`\`typescript
const TimelineView = dynamic(() => import('./components/timeline/TimelineView'), {
  loading: () => <Skeleton />,
  ssr: false,
})
\`\`\`

**Memoization:**
\`\`\`typescript
export const KanbanCard = React.memo(({ jobCard }: KanbanCardProps) => {
  // Component logic
}, (prev, next) => prev.jobCard.id === next.jobCard.id)
\`\`\`

---

## Risk Mitigation

### Risk 1: Performance Degradation with Large Datasets

**Mitigation:**
- Implement pagination or infinite scroll
- Use virtual scrolling for kanban columns
- Cache data with React Query
- Use Server Components for initial render

### Risk 2: Drag-and-Drop Accessibility Issues

**Mitigation:**
- Provide keyboard alternatives
- Use @dnd-kit's built-in accessibility
- Test with screen readers
- Add ARIA labels

### Risk 3: State Synchronization Issues

**Mitigation:**
- Use single source of truth (React Query)
- Implement optimistic updates
- Use Zustand for UI state only
- Test race conditions

### Risk 4: Mobile Experience Challenges

**Mitigation:**
- Test on actual devices
- Use touch-friendly drag targets (>44px)
- Implement swipe gestures
- Optimize for portrait mode

### Risk 5: Breaking Changes During Migration

**Mitigation:**
- Use feature flags
- Migrate incrementally
- Keep old code during transition
- Comprehensive testing

---

## Testing Strategy

### Unit Tests (Vitest + React Testing Library)

\`\`\`typescript
// __tests__/components/kanban/KanbanCard.test.tsx
import { render, screen } from '@testing-library/react'
import { KanbanCard } from '@/components/kanban/KanbanCard'

describe('KanbanCard', () => {
  it('renders job card number', () => {
    const jobCard = {
      id: '1',
      jobCardNumber: 'JC-2025-0001',
      status: 'queued',
      priority: 'high',
    }
    
    render(<KanbanCard jobCard={jobCard} />)
    
    expect(screen.getByText('JC-2025-0001')).toBeInTheDocument()
  })
})
\`\`\`

### Integration Tests

\`\`\`typescript
// __tests__/integration/kanban-drag-drop.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { KanbanBoard } from '@/components/kanban/KanbanBoard'

describe('Kanban Drag and Drop', () => {
  it('moves card between columns on drop', async () => {
    const { container } = render(<KanbanBoard />)
    
    const queuedCard = screen.getByText('JC-2025-0001')
    const inProgressColumn = screen.getByTestId('column-in_progress')
    
    fireEvent.dragStart(queuedCard)
    fireEvent.drop(inProgressColumn)
    
    await waitFor(() => {
      expect(updateJobCardStatus).toHaveBeenCalledWith('1', 'in_progress')
    })
  })
})
\`\`\`

### E2E Tests (Playwright)

\`\`\`typescript
// e2e/job-cards.spec.ts
import { test, expect } from '@playwright/test'

test('kanban board drag and drop', async ({ page }) => {
  await page.goto('/job-cards')
  
  const queuedColumn = page.locator('[data-testid="column-queued"]')
  const inProgressColumn = page.locator('[data-testid="column-in_progress"]')
  
  const cardCountBefore = await inProgressColumn.locator('.kanban-card').count()
  
  const card = queuedColumn.locator('.kanban-card').first()
  await card.dragTo(inProgressColumn)
  
  const cardCountAfter = await inProgressColumn.locator('.kanban-card').count()
  expect(cardCountAfter).toBe(cardCountBefore + 1)
})
\`\`\`

---

## Migration Approach

### Phase 1: Preparation (Week 1)

1. **Create Feature Branch**
   \`\`\`bash
   git checkout -b feature/job-cards-overhaul
   \`\`\`

2. **Install Dependencies**
   \`\`\`bash
   npm install @dnd-kit/core @dnd-kit/sortable zustand @tanstack/react-query
   \`\`\`

3. **Setup Feature Flags**
   \`\`\`typescript
   // lib/feature-flags.ts
   export const FEATURES = {
     NEW_KANBAN: process.env.NEXT_PUBLIC_NEW_KANBAN === 'true',
     TIMELINE_VIEW: process.env.NEXT_PUBLIC_TIMELINE_VIEW === 'true',
     ENHANCED_CALENDAR: process.env.NEXT_PUBLIC_ENHANCED_CALENDAR === 'true',
   } as const
   \`\`\`

### Phase 2: Core Functionality (Week 2-3)

1. **Implement New Components Alongside Old**
   - Keep \`app/job-cards/page.tsx\` (old)
   - Create \`app/job-cards/new/page.tsx\` (new)
   - Use feature flag to toggle

2. **Database Schema Verification**
   - Ensure all columns exist
   - Add missing indexes
   - Create migration if needed

\`\`\`sql
-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_cards_status 
  ON public.job_cards(status, garage_id);
  
CREATE INDEX IF NOT EXISTS idx_job_cards_promised_date 
  ON public.job_cards(promised_date);
  
CREATE INDEX IF NOT EXISTS idx_job_cards_mechanic 
  ON public.job_cards(lead_mechanic_id);
\`\`\`

### Phase 3: Testing & QA (Week 4)

1. **Unit Tests**
   \`\`\`bash
   npm run test:unit
   \`\`\`

2. **Integration Tests**
   \`\`\`bash
   npm run test:integration
   \`\`\`

3. **E2E Tests**
   \`\`\`bash
   npx playwright test
   \`\`\`

4. **Accessibility Audit**
   \`\`\`bash
   npx pa11y https://localhost:3000/job-cards
   \`\`\`

### Phase 4: Gradual Rollout (Week 5)

1. **Alpha Testing** (Internal Team)
   - Enable for 5 users
   - Collect feedback
   - Fix bugs

2. **Beta Testing** (Selected Garages)
   - Enable for 50 users
   - Monitor performance
   - Gather feedback

3. **Full Rollout**
   \`\`\`bash
   # Enable feature flag
   NEXT_PUBLIC_NEW_KANBAN=true npm run build
   \`\`\`

### Phase 5: Cleanup (Week 6)

1. **Remove Old Code**
   \`\`\`bash
   rm app/job-cards/old-page.tsx
   rm app/job-cards/old-components/
   \`\`\`

2. **Remove Feature Flags**
   \`\`\`typescript
   // Delete lib/feature-flags.ts
   \`\`\`

3. **Update Documentation**
   - Update README
   - Update API docs
   - Create user guide

---

## Performance Targets

### Core Web Vitals

- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

### Loading Performance

- Initial render: < 1s
- Time to interactive: < 3s
- Drag-and-drop latency: < 100ms

### Bundle Size Targets

- Main bundle: < 200KB (gzipped)
- Each component: < 50KB (gzipped)
- Total JavaScript: < 500KB (gzipped)

---

## Success Metrics

### User Engagement

- **Drag-and-drop usage:** > 80% of status changes
- **Timeline view adoption:** > 30% of users
- **Average session duration:** Increase by 20%

### Performance

- **Page load time:** Decrease by 30%
- **Time to first status change:** < 5 seconds
- **Error rate:** < 0.1%

### Business Impact

- **Job cards moved per day:** Increase by 15%
- **User satisfaction score:** > 4.5/5
- **Support tickets related to job cards:** Decrease by 25%

---

## References

### Research Sources

1. **Drag-and-Drop Libraries**
   - [Top 5 Drag-and-Drop Libraries for React in 2026](https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react)
   - [@dnd-kit Official Documentation](https://dndkit.com/)
   - [react-beautiful-dnd Deprecation Notice](https://github.com/atlassian/react-beautiful-dnd/issues/2672)

2. **Gantt Chart Libraries**
   - [Best JavaScript Gantt Chart Libraries 2025–2026 Guide](https://www.anychart.com/blog/2025/11/05/best-javascript-gantt-chart-libraries/)
   - [Top 5 React Gantt Chart Libraries in 2025](https://www.linkedin.com/posts/svar-widgets_top-5-react-gantt-chart-libraries-in-2025-activity-7308084712877531138-vZEE)
   - [MikaStiebitz/React-Modern-Gantt GitHub](https://github.com/MikaStiebitz/React-Modern-Gantt)

3. **State Management**
   - [React State Management in 2026: Redux vs Zustand vs Jotai](https://inhaq.com/blog/react-state-management-2026-redux-vs-zustand-vs-jotai/)
   - [Do You Need State Management in 2025?](https://dev.to/saswatapal/do-you-need-state-management-in-2025-react-context-vs-zustand-vs-jotai-vs-redux-1ho)
   - [Mental Models of State Management](https://leapcell.io/blog/mental-models-of-state-management-jotai-zustand-s-atomic-approach-versus-redux-s-single-source)

4. **Next.js 15 & Server Components**
   - [Getting Started: Server and Client Components](https://nextjs.org/docs/app/getting-started/server-and-client-components)
   - [Mastering Next.js 15 in 2025](https://medium.com/@beenakumawat004/mastering-next-js-15-in-2025-the-future-of-react-development-8a6f1e2d6bee)
   - [React Server Components in Next.js 15: A Deep Dive](https://dzone.com/articles/react-server-components-next-js-15)

5. **Testing**
   - [Next.js Vitest Testing Guide](https://nextjs.org/docs/app/guides/testing/vitest)
   - [Best Practices for React UI Testing in 2026](https://trio.dev/best-practices-for-react-ui-testing/)
   - [React & Next.js in 2025 - Modern Best Practices](https://strapi.io/blog/react-and-next-js-in-2025-modern-best-practices)

6. **TanStack Query**
   - [Mastering React Query in Next.js 15](https://fygs.dev/blog/mastering-react-query-nextjs15)
   - [TanStack Query SSR Documentation](https://tanstack.com/query/v4/docs/react/guides/ssr)
   - [You Might Not Need React Query](https://tkdodo.eu/blog/you-might-not-need-react-query)

7. **Accessibility**
   - [WCAG 2.1 AA Standards](https://www.w3.org/WAI/WCAG21/quickref/?levels=aaa)
   - [@dnd-kit Accessibility Guide](https://docs.dndkit.com/main/guides/accessibility)

8. **Loading States**
   - [Skeletons: The Pinnacle of Loading States in React 19](https://balevdev.medium.com/skeletons-the-pinnacle-of-loading-states-in-react-19-427cbb5a1f48)

9. **Error Handling**
   - [Next.js Error Handling Best Practices](https://devanddeliver.com/blog/frontend/next-js-15-error-handling-best-practices-for-code-and-routes)
   - [Getting Started: Error Handling](https://nextjs.org/docs/app/getting-started/error-handling)

10. **RevvOS Roadmap**
    - [Job Card Tracking System Roadmap](/roadmap.md)
    - Current implementation analysis
    - Database schema review

---

## Conclusion

This implementation plan provides a comprehensive, research-backed roadmap for modernizing the Job Card Tracking System in RevvOS. By following this guide, you'll create a best-in-class automotive garage management system that:

- ✅ Uses modern drag-and-drop (@dnd-kit)
- ✅ Includes Timeline/Gantt visualization
- ✅ Enhances calendar with drag-to-reschedule
- ✅ Follows Next.js 15 best practices
- ✅ Implements proper state management (Zustand + React Query)
- ✅ Ensures WCAG 2.1 AA accessibility
- ✅ Optimizes performance and mobile experience
- ✅ Provides comprehensive testing strategy

The phased approach allows for incremental implementation, reducing risk while delivering value early. Each phase builds upon the previous one, ensuring a stable and maintainable codebase.

**Next Steps:**
1. Review and approve this plan
2. Set up feature flags
3. Begin Phase 1 implementation
4. Establish weekly review meetings
5. Track success metrics throughout rollout

---

**Document Version:** 1.0  
**Last Updated:** January 19, 2026  
**Status:** ✅ Ready for Implementation
