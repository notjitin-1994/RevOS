# Phase 1 Component API Reference
## Quick Reference for All New Components

---

## Components

### KanbanDragDropContext

**Purpose:** Wraps the kanban board to enable drag-and-drop functionality

**File:** `/app/job-cards/components/kanban/KanbanDragDropContext.tsx`

**Props:**
```typescript
interface KanbanDragDropContextProps {
  children: React.ReactNode  // The kanban board JSX
  garageId: string           // Current garage ID from session
  userId: string             // Current user ID from session
}
```

**Usage:**
```tsx
<KanbanDragDropContext garageId={garageId} userId={userId}>
  <YourKanbanBoard />
</KanbanDragDropContext>
```

**Features:**
- Drag-and-drop for mouse, touch, and keyboard
- Auto-updates job card status on drop
- Visual feedback during drag
- Accessibility support built-in

---

### KanbanColumn

**Purpose:** Droppable column that accepts job cards

**File:** `/app/job-cards/components/kanban/KanbanColumn.tsx`

**Props:**
```typescript
interface KanbanColumnProps {
  id: string              // Unique column ID
  title: string           // Display title
  status: string          // Job card status for this column
  color: string           // Tailwind text color class
  bgColor: string         // Tailwind background color class
  borderColor: string     // Tailwind border color class
  count: number           // Number of cards in column
  wipLimit?: number       // Optional WIP limit (shows warning when exceeded)
  children: React.ReactNode // Array of KanbanCard components
}
```

**Usage:**
```tsx
<KanbanColumn
  id="in_progress"
  title="In Progress"
  status="in_progress"
  color="text-status-warning"
  bgColor="bg-amber-50"
  borderColor="border-amber-300"
  count={cards.length}
  wipLimit={5}
>
  {cards.map(card => <KanbanCard key={card.id} {...cardData} />)}
</KanbanColumn>
```

**Features:**
- Drop target for draggable cards
- Visual highlight when dragging over
- Optional WIP limit with warnings
- Card count display
- Vertical scrolling for many cards

---

### KanbanCard

**Purpose:** Draggable job card that can be moved between columns

**File:** `/app/job-cards/components/kanban/KanbanCard.tsx`

**Props:**
```typescript
interface KanbanCardProps {
  id: string                      // Unique job card ID
  jobCardNumber: string           // Job card number (JC-2025-0001)
  status: string                  // Current status
  priority: string                // Priority level (low/medium/high/urgent)
  createdAt: string               // ISO creation date
  customer?: {                    // Optional customer info
    firstName: string
    lastName: string
    phoneNumber: string
  }
  vehicle?: {                     // Optional vehicle info
    year: number
    make: string
    model: string
    licensePlate: string
  }
  leadMechanic?: {                // Optional mechanic info
    firstName: string
    lastName: string
  }
  promisedDate?: string | null    // Optional promised date
  totalChecklistItems: number     // Total checklist items
  completedChecklistItems: number // Completed items
  progressPercentage: number      // Progress (0-100)
}
```

**Usage:**
```tsx
<KanbanCard
  id="123"
  jobCardNumber="JC-2025-0001"
  status="in_progress"
  priority="high"
  createdAt="2025-01-19T10:00:00Z"
  customer={{
    firstName: "Rajesh",
    lastName: "Kumar",
    phoneNumber: "+91 98765 43210"
  }}
  vehicle={{
    year: 2023,
    make: "Honda",
    model: "Activa 6G",
    licensePlate: "KA-03-EM-2345"
  }}
  leadMechanic={{
    firstName: "Amit",
    lastName: "Sharma"
  }}
  promisedDate="2025-01-20"
  totalChecklistItems={5}
  completedChecklistItems={3}
  progressPercentage={60}
/>
```

**Features:**
- Draggable between columns
- Keyboard accessible (Tab, Enter, Space)
- ARIA labels for screen readers
- Click to view details
- Progress bar visualization
- Hover effects

---

### StatusBadge

**Purpose:** Displays job card status with color-coded icon

**File:** `/app/job-cards/components/shared/StatusBadge.tsx`

**Props:**
```typescript
interface StatusBadgeProps {
  status: JobCardStatus  // Status value
  size?: 'sm' | 'md'    // Badge size (default: 'sm')
}
```

**Status Values:**
- `'draft'` - Gray
- `'queued'` - Blue
- `'in_progress'` - Amber
- `'parts_waiting'` - Red
- `'quality_check'` - Purple
- `'ready'` - Teal
- `'delivered'` - Teal
- `'cancelled'` - Gray

**Usage:**
```tsx
<StatusBadge status="in_progress" />
<StatusBadge status="queued" size="md" />
```

**Output:** Renders a badge with icon and label

---

### PriorityBadge

**Purpose:** Displays priority level with color coding

**File:** `/app/job-cards/components/shared/PriorityBadge.tsx`

**Props:**
```typescript
interface PriorityBadgeProps {
  priority: Priority      // Priority level
  size?: 'sm' | 'md'     // Badge size (default: 'sm')
}
```

**Priority Values:**
- `'urgent'` - Red
- `'high'` - Orange
- `'medium'` - Amber
- `'low'` - Blue

**Usage:**
```tsx
<PriorityBadge priority="high" />
<PriorityBadge priority="urgent" size="md" />
```

**Output:** Renders a badge with icon and label

---

### JobCardSkeleton

**Purpose:** Loading placeholder matching job card structure

**File:** `/app/job-cards/components/shared/JobCardSkeleton.tsx`

**Props:**
```typescript
interface JobCardSkeletonProps {
  count?: number  // Number of skeletons to render (default: 1)
}
```

**Usage:**
```tsx
<JobCardSkeleton />        // Single skeleton
<JobCardSkeleton count={3} />  // Three skeletons
```

**Output:** Animated loading skeletons matching card layout

---

## Hooks

### useJobCards

**Purpose:** Fetches job cards with automatic caching and refetching

**File:** `/app/job-cards/hooks/use-job-cards.ts`

**Signature:**
```typescript
function useJobCards(
  garageId: string,
  filters?: JobCardFilters
): UseQueryResult<JobCardData[], Error>
```

**Usage:**
```typescript
const { data, isLoading, error, refetch } = useJobCards(garageId, {
  status: 'in_progress',
  mechanicId: 'mech-1',
  search: 'oil change'
})
```

**Returns:**
- `data` - Array of job cards (or empty array if loading)
- `isLoading` - Boolean indicating if fetching
- `error` - Error object if fetch failed
- `refetch` - Function to manually refetch

**Features:**
- 5-minute stale time
- Automatic cache invalidation on mutations
- Filter support
- Error handling

---

### useUpdateJobCardStatus

**Purpose:** Mutation hook to update job card status

**File:** `/app/job-cards/hooks/use-job-card-mutations.ts`

**Signature:**
```typescript
function useUpdateJobCardStatus(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  { jobCardId: string; newStatus: string; userId: string }
>
```

**Usage:**
```typescript
const updateStatus = useUpdateJobCardStatus()

updateStatus.mutate({
  jobCardId: '123',
  newStatus: 'in_progress',
  userId: currentUser.id
})
```

**Returns:**
- `mutate` - Function to trigger mutation
- `isLoading` - Boolean during mutation
- `isSuccess` - Boolean if mutation succeeded
- `error` - Error object if mutation failed

**Features:**
- Automatic cache invalidation
- Error handling
- Status history tracking

---

### useUpdateJobCard

**Purpose:** Mutation hook to update any job card field

**File:** `/app/job-cards/hooks/use-job-card-mutations.ts`

**Signature:**
```typescript
function useUpdateJobCard(): UseMutationResult<
  { success: boolean; error?: string },
  Error,
  { jobCardId: string; updates: Partial<JobCardData> }
>
```

**Usage:**
```typescript
const updateJobCard = useUpdateJobCard()

updateJobCard.mutate({
  jobCardId: '123',
  updates: {
    priority: 'high',
    promisedDate: '2025-01-25',
    leadMechanicId: 'mech-2'
  }
})
```

**Returns:**
- `mutate` - Function to trigger mutation
- `isLoading` - Boolean during mutation
- `isSuccess` - Boolean if mutation succeeded
- `error` - Error object if mutation failed

**Features:**
- Automatic cache invalidation
- Partial updates supported
- Error handling

---

## Store

### useJobCardStore

**Purpose:** Zustand store for UI state management

**File:** `/app/job-cards/lib/stores/job-card-store.ts`

**Available State:**
```typescript
interface JobCardUIState {
  // View mode
  viewMode: 'kanban' | 'timeline' | 'calendar'
  setViewMode: (mode: ViewMode) => void

  // Filters
  statusFilter: JobCardStatus | 'all'
  setStatusFilter: (status: JobCardStatus | 'all') => void
  mechanicFilter: string | null
  setMechanicFilter: (mechanicId: string | null) => void
  searchQuery: string
  setSearchQuery: (query: string) => void

  // UI preferences
  cardDensity: 'comfortable' | 'compact'
  setCardDensity: (density: CardDensity) => void
  showWIPWarnings: boolean
  toggleWIPWarnings: () => void

  // Drag and drop state
  isDragging: boolean
  setIsDragging: (isDragging: boolean) => void
  draggedCardId: string | null
  setDraggedCardId: (id: string | null) => void

  // Column collapse
  collapsedColumns: Record<string, boolean>
  toggleColumnCollapse: (columnId: string) => void
}
```

**Usage Examples:**

```typescript
// Get state
const { viewMode, searchQuery, statusFilter } = useJobCardStore()

// Get actions
const { setViewMode, setSearchQuery, setStatusFilter } = useJobCardStore()

// Use them
setViewMode('timeline')
setSearchQuery('oil change')
setStatusFilter('in_progress')

// Toggle WIP warnings
const { showWIPWarnings, toggleWIPWarnings } = useJobCardStore()
toggleWIPWarnings()

// Collapse a column
const { toggleColumnCollapse } = useJobCardStore()
toggleColumnCollapse('in_progress')
```

**Features:**
- Global state (accessible from any component)
- No provider needed (unlike React Context)
- TypeScript support
- DevTools integration

---

## Type Definitions

### JobCardStatus
```typescript
type JobCardStatus =
  | 'draft'
  | 'queued'
  | 'in_progress'
  | 'parts_waiting'
  | 'quality_check'
  | 'ready'
  | 'delivered'
  | 'cancelled'
```

### Priority
```typescript
type Priority = 'low' | 'medium' | 'high' | 'urgent'
```

### ViewMode
```typescript
type ViewMode = 'kanban' | 'timeline' | 'calendar'
```

### CardDensity
```typescript
type CardDensity = 'comfortable' | 'compact'
```

### JobCardFilters
```typescript
interface JobCardFilters {
  status?: JobCardStatus
  mechanicId?: string
  customerId?: string
  dateFrom?: string
  dateTo?: string
  search?: string
}
```

---

## Color Classes Reference

### Status Colors
```typescript
const STATUS_COLORS = {
  draft: 'text-gray-600 bg-gray-50 border-gray-300',
  queued: 'text-status-info bg-blue-50 border-blue-300',
  in_progress: 'text-status-warning bg-amber-50 border-amber-300',
  parts_waiting: 'text-status-error bg-red-50 border-red-300',
  quality_check: 'text-purple-600 bg-purple-50 border-purple-300',
  ready: 'text-status-success bg-green-50 border-green-300',
  delivered: 'text-status-success bg-green-50 border-green-300',
}
```

### Priority Colors
```typescript
const PRIORITY_COLORS = {
  urgent: 'text-status-error bg-status-error/10 border-status-error/20',
  high: 'text-orange-600 bg-orange-100 border-orange-300',
  medium: 'text-status-warning bg-status-warning/10 border-status-warning/20',
  low: 'text-status-info bg-status-info/10 border-status-info/20',
}
```

---

## Quick Examples

### Basic Kanban Board
```tsx
<KanbanDragDropContext garageId={garageId} userId={userId}>
  <div className="flex gap-4">
    {columns.map(column => (
      <KanbanColumn key={column.id} {...columnProps}>
        {cards.map(card => <KanbanCard key={card.id} {...cardProps} />)}
      </KanbanColumn>
    ))}
  </div>
</KanbanDragDropContext>
```

### With Filtering
```tsx
const { searchQuery, statusFilter } = useJobCardStore()

const filteredCards = cards
  .filter(card => card.status === statusFilter || statusFilter === 'all')
  .filter(card => {
    if (!searchQuery) return true
    return card.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase())
  })
```

### With Loading State
```tsx
const { data, isLoading } = useJobCards(garageId)

{isLoading ? (
  <JobCardSkeleton count={3} />
) : (
  <KanbanDragDropContext>
    {/* Board */}
  </KanbanDragDropContext>
)}
```

### With Mutations
```tsx
const updateStatus = useUpdateJobCardStatus()

const handleDrop = (cardId: string, newStatus: string) => {
  updateStatus.mutate({
    jobCardId: cardId,
    newStatus,
    userId: currentUser.id
  })
}
```

---

## File Paths Quick Reference

```
/app/job-cards/
├── lib/
│   ├── stores/job-card-store.ts          ← Zustand store
│   └── providers/query-provider.tsx     ← React Query provider
├── hooks/
│   ├── use-job-cards.ts                 ← Data fetching hook
│   └── use-job-card-mutations.ts        ← Mutation hooks
├── components/
│   ├── kanban/
│   │   ├── KanbanDragDropContext.tsx    ← DnD wrapper
│   │   ├── KanbanColumn.tsx             ← Droppable column
│   │   └── KanbanCard.tsx               ← Draggable card
│   └── shared/
│       ├── StatusBadge.tsx              ← Status indicator
│       ├── PriorityBadge.tsx            ← Priority indicator
│       └── JobCardSkeleton.tsx          ← Loading skeleton
└── layout.tsx                            ← Provider wrapper
```

---

## Common Patterns

### Access Store State
```typescript
const store = useJobCardStore()
const { searchQuery, setSearchQuery } = store
```

### Use Multiple Hooks
```typescript
const { data, isLoading } = useJobCards(garageId)
const updateStatus = useUpdateJobCardStatus()
const { viewMode } = useJobCardStore()
```

### Conditional Rendering
```typescript
{isLoading ? (
  <JobCardSkeleton count={3} />
) : error ? (
  <ErrorState error={error} />
) : data.length === 0 ? (
  <EmptyState />
) : (
  <KanbanBoard />
)}
```

### Filter Cards
```typescript
const filteredCards = cards.filter(card => {
  const matchesStatus = statusFilter === 'all' || card.status === statusFilter
  const matchesSearch = !searchQuery ||
    card.jobCardNumber.toLowerCase().includes(searchQuery.toLowerCase())
  return matchesStatus && matchesSearch
})
```

---

## Best Practices

1. **Always wrap** kanban board with `KanbanDragDropContext`
2. **Use store** for UI state instead of `useState`
3. **Let React Query** handle data fetching
4. **Use mutations** for updates (automatic cache invalidation)
5. **Provide garageId and userId** to enable functionality
6. **Use skeletons** instead of spinners for better UX
7. **Test keyboard navigation** for accessibility
8. **Handle loading and error states** properly
9. **Keep component props minimal** (pass only what's needed)
10. **Use TypeScript types** for type safety

---

## Support

For issues or questions:
1. Check the Implementation Summary document
2. Review the Integration Guide
3. Check component TypeScript definitions
4. Look at usage examples in this document
5. Verify all dependencies are installed

