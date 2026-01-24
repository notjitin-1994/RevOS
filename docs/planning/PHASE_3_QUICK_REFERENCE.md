# Phase 3 Quick Reference: Developer Guide

**Job Card Tracking System - Phase 3 Features**

---

## Quick Start

### 1. Swimlanes
```typescript
// Enable swimlanes
import { useJobCardStore } from './lib/stores/job-card-store'

const { swimlaneType, setSwimlaneType } = useJobCardStore()

// Group by priority
setSwimlaneType('priority')

// Group by mechanic
setSwimlaneType('mechanic')

// No swimlanes (default)
setSwimlaneType('none')
```

### 2. WIP Limits
```typescript
// Configure WIP limit in KanbanColumn
<KanbanColumn
  wipLimit={5}  // Maximum number of jobs
  count={currentCount}
>
  {/* cards */}
</KanbanColumn>

// Toggle WIP warnings
const { showWIPWarnings, toggleWIPWarnings } = useJobCardStore()
toggleWIPWarnings()  // Switch on/off
```

### 3. Keyboard Shortcuts
```typescript
// Setup shortcuts
import { useKeyboardShortcuts, useJobCardShortcuts } from './hooks/use-keyboard-shortcuts'

const { shortcuts } = useJobCardShortcuts({
  onViewModeChange: (mode) => console.log('View:', mode),
  onCreateNew: () => console.log('Create new'),
  onSearchFocus: () => searchRef.current?.focus(),
  onFilterToggle: () => console.log('Toggle filters'),
})

useKeyboardShortcuts({ shortcuts, isEnabled: true })
```

---

## File Locations

### Core Files
```
app/job-cards/
├── lib/
│   ├── stores/
│   │   └── job-card-store.ts           # Zustand store (swimlane state)
│   └── utils/
│       └── swimlane-utils.ts           # Grouping functions
├── components/
│   ├── kanban/
│   │   ├── KanbanSwimlane.tsx          # Swimlane board
│   │   └── KanbanColumn.tsx            # WIP warnings
│   └── shared/
│       └── KeyboardShortcutsHelp.tsx   # Help modal
├── hooks/
│   └── use-keyboard-shortcuts.ts       # Shortcuts hook
└── page.tsx                            # Main integration
```

---

## API Reference

### Swimlane Utilities

#### `groupJobCardsByPriority(jobCards)`
Groups job cards by priority level.

```typescript
import { groupJobCardsByPriority } from './lib/utils/swimlane-utils'

const groups = groupJobCardsByPriority(jobCards)
// Returns: {
//   urgent: JobCardViewData[],
//   high: JobCardViewData[],
//   medium: JobCardViewData[],
//   low: JobCardViewData[]
// }
```

#### `groupJobCardsByMechanic(jobCards)`
Groups job cards by lead mechanic.

```typescript
const groups = groupJobCardsByMechanic(jobCards)
// Returns: Record<string, JobCardViewData[]>
// Key is mechanic ID or 'unassigned'
```

#### `getSwimlaneLabel(type, group)`
Gets display label with emoji.

```typescript
const label = getSwimlaneLabel('priority', 'urgent')
// Returns: "🔴 Urgent"

const label = getSwimlaneLabel('mechanic', 'mechanic-123')
// Returns: "👨‍🔧 mechanic-123"
```

#### `getSwimlaneStats(cards)`
Calculates statistics.

```typescript
const stats = getSwimlaneStats(cards)
// Returns: {
//   total: number,
//   inProgress: number,
//   completed: number,
//   urgent: number
// }
```

### Keyboard Shortcuts

#### `useKeyboardShortcuts(config)`
Main hook for keyboard shortcuts.

```typescript
interface ShortcutConfig {
  key: string              // e.g., 'k', 'Enter', 'Escape'
  ctrlKey?: boolean         // Requires Ctrl/Cmd
  shiftKey?: boolean        // Requires Shift
  action: () => void        // Callback
  description: string       // Help text
  global?: boolean          // Works in inputs
}

useKeyboardShortcuts({
  shortcuts: [...],
  isEnabled: true
})
```

#### `useJobCardShortcuts(handlers)`
Pre-configured job card shortcuts.

```typescript
const { shortcuts } = useJobCardShortcuts({
  onViewModeChange: (mode) => setViewMode(mode),
  onCreateNew: () => router.push('/job-cards/create'),
  onSearchFocus: () => searchRef.current?.focus(),
  onFilterToggle: () => filterRef.current?.focus(),
})
```

#### `formatShortcut(shortcut)`
Formats shortcut for display.

```typescript
const formatted = formatShortcut({
  key: 'k',
  ctrlKey: true
})
// Returns: "Ctrl+K"
```

---

## WIP Limits Configuration

### Default Limits
```typescript
const WIP_LIMITS: Record<string, number> = {
  in_progress: 5,
  parts_waiting: 3,
  quality_check: 3,
  // Other statuses have no limit
}
```

### Usage in Component
```tsx
<KanbanColumn
  wipLimit={WIP_LIMITS[column.status]}
  count={columnCards.length}
  // ... other props
>
  {columnCards.map(card => <KanbanCard key={card.id} {...card} />)}
</KanbanColumn>
```

---

## Component Props

### KanbanSwimlane
```typescript
interface KanbanSwimlaneProps {
  jobCards: JobCardViewData[]        // All job cards to display
  columns: Array<{                   // Column definitions
    id: string
    title: string
    status: string
    color: string
    bgColor: string
    borderColor: string
  }>
}
```

### KanbanColumn (Enhanced)
```typescript
interface KanbanColumnProps {
  id: string
  title: string
  status: string
  color: string
  bgColor: string
  borderColor: string
  count: number                      // Current card count
  wipLimit?: number                   // Max cards before warning
  children: React.ReactNode          // KanbanCard components
}
```

### KeyboardShortcutsHelp
```typescript
interface KeyboardShortcutsHelpProps {
  shortcuts: Array<{                 // From getShortcutHelp()
    keys: string                     // e.g., "Ctrl+K"
    description: string              // Action description
  }>
  onClose: () => void                // Close modal
}
```

---

## Store State

### JobCardUIState (Phase 3 Additions)
```typescript
interface JobCardUIState {
  // Existing Phase 1-2 state...
  viewMode: ViewMode
  statusFilter: JobCardStatus | 'all'
  searchQuery: string

  // Phase 3 additions
  swimlaneType: SwimlaneType         // 'priority' | 'mechanic' | 'none'
  setSwimlaneType: (type: SwimlaneType) => void

  // WIP warnings (from Phase 1)
  showWIPWarnings: boolean
  toggleWIPWarnings: () => void
}
```

---

## Styling Patterns

### WIP Limit States
```typescript
// Normal
className="bg-gray-50 border-gray-300"

// Near Limit (at limit - 1)
className="bg-yellow-50 border-yellow-400"

// Over Limit (at or over limit)
className="bg-red-50 border-red-400"
```

### Swimlane Headers
```typescript
// Priority swimlanes
"🔴 Urgent"  // Red
"🟠 High"    // Orange
"🟡 Medium"  // Yellow
"🟢 Low"     // Green

// Mechanic swimlanes
"👨‍🔧 [Mechanic Name]"  // Assigned
"👤 Unassigned"          // No mechanic
```

### Keyboard Shortcuts Display
```tsx
<kbd className="px-2 py-1 bg-gray-100 border border-gray-300 rounded">
  Ctrl+K
</kbd>
```

---

## Common Patterns

### Adding a New Swimlane Type

1. **Update type:**
```typescript
// swimlane-utils.ts
export function groupJobCardsByCustom(jobCards: JobCardViewData[]) {
  // Your grouping logic
}
```

2. **Add label function:**
```typescript
export function getSwimlaneLabel(type: SwimlaneType, group: string) {
  if (type === 'custom') {
    return `Custom: ${group}`
  }
  // ... existing cases
}
```

3. **Update KanbanSwimlane:**
```typescript
if (swimlaneType === 'custom') {
  const groups = groupJobCardsByCustom(jobCards)
  return sortSwimlaneGroups('custom', groups)
}
```

4. **Add selector option:**
```tsx
<option value="custom">Group by Custom</option>
```

### Adding a New Keyboard Shortcut

```typescript
const { shortcuts } = useJobCardShortcuts({
  // ... existing handlers
})

// Add custom shortcut
shortcuts.push({
  key: 's',
  ctrlKey: true,
  action: () => console.log('Custom action'),
  description: 'My custom shortcut'
})
```

---

## Debugging

### Check Swimlane State
```typescript
const { swimlaneType } = useJobCardStore()
console.log('Current swimlane:', swimlaneType)
```

### Check WIP Status
```typescript
const isOverLimit = wipLimit && count >= wipLimit
const isNearLimit = wipLimit && count >= wipLimit - 1

console.log({
  count,
  wipLimit,
  isOverLimit,
  isNearLimit
})
```

### Check Keyboard Shortcuts
```typescript
useKeyboardShortcuts({
  shortcuts,
  isEnabled: true,
  // Add debug logging
})

// In browser console
// Press keys and check if actions fire
```

---

## Testing

### Swimlane Tests
```typescript
describe('Swimlane Utils', () => {
  it('groups by priority', () => {
    const jobCards = [
      { priority: 'urgent', /* ... */ },
      { priority: 'low', /* ... */ }
    ]
    const groups = groupJobCardsByPriority(jobCards)
    expect(groups.urgent).toHaveLength(1)
    expect(groups.low).toHaveLength(1)
  })
})
```

### Keyboard Shortcut Tests
```typescript
describe('Keyboard Shortcuts', () => {
  it('triggers action on key press', () => {
    const action = jest.fn()
    useKeyboardShortcuts({
      shortcuts: [{ key: 'k', action }]
    })

    fireEvent.keyDown(window, { key: 'k' })
    expect(action).toHaveBeenCalled()
  })
})
```

---

## Performance Tips

1. **Memoize Grouped Data**
```typescript
const groupedSwimlanes = useMemo(() => {
  return groupJobCardsByPriority(jobCards)
}, [jobCards])
```

2. **Debounce Search**
```typescript
import { useDebouncedValue } from './hooks/use-debounced-value'

const debouncedSearch = useDebouncedValue(searchQuery, 300)
```

3. **Virtualize Long Lists**
```typescript
import { useVirtualizer } from '@tanstack/react-virtual'

// For columns with 100+ cards
```

---

## Accessibility Checklist

- [x] All shortcuts documented in help modal
- [x] WIP warnings use `role="alert"`
- [x] Swimlane headers have proper labels
- [x] Keyboard doesn't trigger in inputs
- [x] Focus management works correctly
- [x] Color contrast meets WCAG AA
- [x] Screen reader announcements

---

## Migration from Phase 2

### No Breaking Changes
Phase 3 is fully backward compatible with Phase 2.

### Optional Adoption
- Swimlanes: Default is `none` (no change)
- WIP Limits: Can be toggled on/off
- Keyboard Shortcuts: Can be disabled

### Store Migration
```typescript
// Phase 2 store still works
const { viewMode, searchQuery } = useJobCardStore()

// Phase 3 additions are optional
const { swimlaneType, setSwimlaneType } = useJobCardStore()
```

---

## Support

### Issues
1. Check browser console for errors
2. Verify all files are present
3. Ensure dependencies are installed
4. Check Zustand dev tools for state

### Resources
- Implementation Plan: `implementation-plan.md`
- Phase 3 Summary: `PHASE_3_IMPLEMENTATION_SUMMARY.md`
- Code Examples: See component files

---

**Last Updated:** January 19, 2026
**Phase 3 Status:** ✅ Complete
