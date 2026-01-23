# Real-Time Update Testing Guide

## Implementation Summary

The kanban board has been updated to support real-time updates using optimistic updates patterns from TanStack Query v5.

### Changes Made

#### 1. `/app/job-cards/hooks/use-job-cards.ts`
- **Changed**: `staleTime: 1000 * 60 * 5` (5 minutes) → `staleTime: 0`
- **Reason**: For collaborative kanban boards, data should be considered stale immediately to ensure real-time updates
- **Impact**: Queries will automatically refetch when the window regains focus or when new data is detected

#### 2. `/app/job-cards/hooks/use-job-card-mutations.ts`

**Enhanced `useUpdateJobCardStatus` mutation with:**
- `onMutate`: Cancels outgoing queries, snapshots previous data, optimistically updates cache
- `onError`: Rolls back to previous state if mutation fails
- `onSettled`: Always refetches to ensure server state consistency

**Enhanced `useUpdateJobCard` mutation with:**
- Same optimistic update pattern
- Proper TypeScript types for all variables
- Handles all update fields with partial updates

### Optimistic Update Pattern (Best Practice)

```typescript
onMutate: async (variables) => {
  // 1. Cancel outgoing refetches
  await queryClient.cancelQueries({ queryKey: ['job-cards'] })

  // 2. Snapshot previous value
  const previousData = queryClient.getQueryData(['job-cards'])

  // 3. Optimistically update cache
  queryClient.setQueryData(['job-cards'], (old) => {
    // Update logic here
  })

  // 4. Return context with snapshot
  return { previousData }
}

onError: (error, variables, context) => {
  // 5. Rollback on error
  if (context?.previousData) {
    queryClient.setQueryData(['job-cards'], context.previousData)
  }
}

onSettled: () => {
  // 6. Always refetch to ensure server state
  queryClient.invalidateQueries({ queryKey: ['job-cards'] })
}
```

## Testing Scenarios

### Scenario 1: Drag and Drop (Optimistic Update)

**Steps:**
1. Open the kanban board at `/job-cards`
2. Drag a card from one column to another
3. Observe the card immediately appears in the new column (optimistic update)
4. If API succeeds, card stays in new column
5. If API fails, card snaps back to original column (rollback)

**Expected Behavior:**
- Card moves instantly (no loading spinner)
- UI is immediately responsive
- Network failures trigger automatic rollback
- Console logs show mutation progress

**Console Logs to Watch:**
```
🔄 [Mutation] Updating job card {id} to status: {status}
✅ [Mutation] Status updated successfully
```

### Scenario 2: New Draft Card Creation

**Steps:**
1. Create a new draft job card
2. Submit the form
3. Wait for redirect to `/job-cards`
4. Verify new card appears immediately

**Expected Behavior:**
- After redirect, new card is visible in the "draft" column
- No page refresh needed
- Queries are invalidated before redirect (already implemented in create page)

### Scenario 3: Multi-User Real-Time Updates

**Steps:**
1. Open `/job-cards` in two different browser windows (or incognito)
2. In Window A, move a card to a new status
3. In Window B, observe the card moving (should happen when window regains focus or after refetch)

**Expected Behavior:**
- With `staleTime: 0`, Window B should refetch when it regains focus
- Both windows eventually show consistent state
- No manual refresh needed

### Scenario 4: Error Handling and Rollback

**Steps:**
1. Open browser DevTools Network tab
2. Throttle network to "Slow 3G" or offline
3. Drag a card to a new column
4. Observe optimistic update (card moves)
5. Wait for API to fail
6. Observe rollback (card snaps back)

**Expected Behavior:**
- Card moves immediately
- After error, card returns to original column
- Error is logged to console
- User sees error notification (if implemented)

## Performance Considerations

### With `staleTime: 0`:
- **Pros**: Real-time data, always fresh
- **Cons**: More frequent network requests
- **Mitigation**: TanStack Query automatically deduplicates requests

### With Optimistic Updates:
- **Pros**: Instant UI feedback, better UX
- **Cons**: Slightly more complex code
- **Mitigation**: Proper rollback handling ensures data integrity

## Key Benefits

1. **Instant Feedback**: Users see changes immediately without waiting for API
2. **Error Resilience**: Failed updates automatically rollback
3. **Real-Time Collaboration**: Changes from other users appear quickly
4. **No Page Refresh**: All updates happen via cache mutations
5. **Type Safety**: Full TypeScript support prevents bugs

## Monitoring and Debugging

### Console Logs
All mutations log their progress:
- `🔄 [Mutation]` - Starting mutation
- `✅ [Mutation]` - Success
- `❌ [Mutation]` - Error with rollback

### React Query DevTools
If you have React Query DevTools installed:
- Open DevTools (usually `__REACT_QUERY_DEVTOOLS__` in console)
- Watch the `job-cards` query
- Observe cache updates and refetches
- See mutation states (pending, success, error)

## File Checklist

- [x] `/app/job-cards/hooks/use-job-cards.ts` - Stale time updated
- [x] `/app/job-cards/hooks/use-job-card-mutations.ts` - Optimistic updates added
- [x] `/app/job-cards/create/page.tsx` - Query invalidation verified (already implemented)
- [x] `/app/job-cards/components/kanban/KanbanDragDropContext.tsx` - No changes needed (uses mutations correctly)

## Next Steps (Optional Enhancements)

1. **Add loading indicators**: Show subtle loading state while mutation is in progress
2. **Error notifications**: Display toast notifications for failed updates
3. **Real-time subscriptions**: Add Supabase real-time for true multi-user sync
4. **Optimistic UI for create**: Extend pattern to create operations
5. **Conflict resolution**: Handle cases where multiple users update same card

## Troubleshooting

### Cards not updating immediately
- Check browser console for errors
- Verify React Query DevTools show cache updates
- Ensure `staleTime: 0` is set in `use-job-cards.ts`

### Rollback not working on errors
- Verify `onError` handler is implemented
- Check that context is properly returned from `onMutate`
- Test with network throttling enabled

### New cards not appearing after creation
- Verify create page calls `invalidateQueries` before redirect
- Check that redirect happens after invalidation completes
- Look for errors in the create mutation

## Summary

The implementation follows TanStack Query best practices for optimistic updates:
- Immediate UI feedback
- Automatic rollback on errors
- Proper cache management
- Type-safe implementation
- Real-time collaboration support

This provides a significantly improved user experience compared to waiting for API responses before updating the UI.
