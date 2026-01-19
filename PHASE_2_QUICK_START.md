# Phase 2 Quick Start Guide
## Timeline and Calendar Views for Job Card Management

---

## Overview

Phase 2 adds two new powerful views to manage your job cards:
- **Timeline View** - Visual Gantt chart showing job cards over time
- **Calendar View** - Interactive calendar with drag-to-reschedule

---

## Accessing the New Views

### Step 1: Navigate to Job Cards
1. Go to the main menu
2. Click on "Job Card Management"
3. You'll see three tabs at the top:
   - **Kanban Board** (original Phase 1 view)
   - **Timeline View** (NEW)
   - **Calendar View** (NEW)

### Step 2: Choose Your View
- Click **"Timeline View"** to see job cards as a Gantt chart
- Click **"Calendar View"** to see job cards on a calendar

---

## Timeline View Features

### 📊 Visual Timeline
The Timeline view displays your job cards as horizontal bars on a timeline, making it easy to:
- See when jobs are scheduled
- Identify overlapping jobs
- Track progress at a glance
- Spot overdue jobs immediately

### 🎛️ View Modes
1. **Day View**
   - Shows hourly timeline
   - Best for detailed daily planning
   - Use: Click "Day" button in header

2. **Week View**
   - Shows 7-day timeline
   - Best for weekly planning
   - Use: Click "Week" button in header

3. **Month View**
   - Shows full month timeline
   - Best for high-level overview
   - Use: Click "Month" button in header (default)

### 📅 Date Navigation
- **Previous**: Click left arrow (←) to go back
- **Next**: Click right arrow (→) to go forward
- **Today**: Click "Today" button to jump to current date

### 📈 Statistics Cards
At the top of the timeline, you'll see:
- **Total Jobs** - Total number of job cards
- **Due Soon** - Jobs due in next 3 days
- **Overdue** - Jobs past their promised date
- **Completed** - Jobs with 100% progress

### 🎨 Task Bars
Each job card appears as a colored bar:
- **Gray** - Draft status
- **Blue** - Queued
- **Amber** - In Progress
- **Red** - Parts Waiting
- **Purple** - Quality Check
- **Green** - Ready
- **Dark Green** - Delivered

### 🖱️ Interactions
- **Click a task** → Opens job card details
- **Hover over task** → See tooltip with full information
- **Red pulsing dot** → Task is overdue

---

## Calendar View Features

### 📅 Interactive Calendar
The Calendar view displays job cards as events on a familiar calendar interface, making it easy to:
- See jobs by date
- Plan capacity
- Schedule new jobs
- Reschedule existing jobs

### 🎛️ View Modes
1. **Month View** (default)
   - Traditional calendar grid
   - Shows up to 3 events per day
   - Click "More" to see all events for busy days

2. **Week View**
   - Column layout for 7 days
   - Shows all events for the week
   - More space per event

3. **Day View**
   - Single day focus
   - All events for one day
   - Maximum detail per event

### 📅 Date Navigation
- **Previous**: Click left arrow (←) to go back
- **Next**: Click right arrow (→) to go forward
- **Today**: Click "Today" button to jump to current date

### 🎨 Event Colors
Events are color-coded by **priority**:
- **Red** - Urgent priority
- **Orange** - High priority
- **Yellow** - Medium priority
- **Green** - Low priority

Event borders indicate **status**:
- Same color coding as Timeline view

### 🖱️ Drag-to-Reschedule (POWERFUL FEATURE!)
You can easily reschedule jobs by dragging:
1. Click and hold on a job card event
2. Drag it to a new date
3. Release to drop
4. The promised date is automatically updated!

### ↔️ Resize Events
You can also adjust duration:
1. Hover over the edge of an event
2. Click and drag to resize
3. Release to set new duration
4. The promised date is automatically updated!

### 📝 Event Display
Each event shows:
- Job card number
- Vehicle make and model
- Color-coded by priority

---

## Common Use Cases

### 1. Check Today's Schedule
```
1. Open Calendar View
2. Click "Today" button
3. Switch to "Day View"
4. See all jobs scheduled for today
```

### 2. Plan Next Week
```
1. Open Calendar View
2. Click "Week View"
3. Use arrows to navigate to next week
4. See all jobs for the week
5. Drag events to balance workload
```

### 3. Find Overdue Jobs
```
1. Open Timeline View
2. Look for "Overdue" statistic card
3. Scan for tasks with red pulsing dots
4. Click tasks to take action
```

### 4. Reschedule a Job
```
Method 1 - Calendar Drag:
1. Open Calendar View
2. Find the job on the calendar
3. Drag it to the new date
4. Done!

Method 2 - Job Card Details:
1. Click on the job
2. Edit promised date
3. Save
```

### 5. Check Team Capacity
```
1. Open Calendar View
2. Switch to "Month View"
3. Look for days with many events
4. Use "Week View" to see details
5. Plan accordingly
```

### 6. Track Job Progress
```
1. Open Timeline View
2. Look at progress bars on tasks
3. See percentage complete
4. Identify stuck jobs
```

---

## Tips and Tricks

### ⚡ Keyboard Shortcuts
- **Tab** - Navigate between tabs
- **Enter/Space** - Open selected job card
- **Escape** - Close modals

### 🎯 Best Practices
1. **Set Promised Dates** - Jobs without promised dates won't show in Calendar
2. **Use Calendar View** - For date-based planning and rescheduling
3. **Use Timeline View** - For progress tracking and overlap detection
4. **Use Kanban View** - For status management and workflow
5. **Check Statistics** - Always check the stats cards at a glance

### 🐛 Troubleshooting

**Problem**: Job cards not showing in Calendar
**Solution**: Make sure the job card has a "Promised Date" set

**Problem**: Timeline looks crowded
**Solution**: Switch to Week or Day view for more space

**Problem**: Can't drag events in Calendar
**Solution**: Make sure you're in edit mode and have permission

**Problem**: Wrong date after dragging
**Solution**: The date updates automatically - wait a moment for refresh

---

## Feature Comparison

| Feature | Kanban Board | Timeline | Calendar |
|---------|--------------|----------|----------|
| Status Management | ✅ Best | ⚠️ Limited | ❌ No |
| Progress Tracking | ✅ Yes | ✅ Yes | ⚠️ Limited |
| Date Planning | ❌ No | ✅ Good | ✅ Best |
| Drag-to-Reschedule | ❌ No | ❌ No | ✅ Yes |
| Overdue Detection | ✅ Yes | ✅ Yes | ✅ Yes |
| Workload Balancing | ⚠️ Manual | ✅ Visual | ✅ Visual |
| Task Dependencies | ❌ No | ⚠️ Planned | ❌ No |

---

## Integration with Existing Features

### ✅ Works With Phase 1
- All Kanban features still work
- Same data sources
- Same filters and search
- Same mutations and updates

### ✅ Uses Existing Data
- Job cards from database
- Customer information
- Vehicle details
- Mechanic assignments
- Status tracking

### ✅ Updates in Real-Time
- Changes reflect immediately
- No page refresh needed
- Synchronized across views

---

## Future Enhancements (Phase 3)

What's coming next:
- 🔹 **Swimlanes** - Group by mechanic or priority
- 🔹 **WIP Limits** - Enforce work-in-progress limits
- 🔹 **Keyboard Shortcuts** - Full keyboard navigation
- 🔹 **Advanced Filters** - Saved filter presets
- 🔹 **Task Dependencies** - Visualize relationships
- 🔹 **Resource Management** - Mechanic workload balancing

---

## Need Help?

### Documentation
- See `IMPLEMENTATION_PLAN.md` for technical details
- See `PHASE_2_IMPLEMENTATION_SUMMARY.md` for complete overview

### Support
- Check the status cards for quick diagnostics
- Use browser console for error messages
- Report issues with job card number and steps

---

## Summary

Phase 2 brings powerful new visualization tools to job card management:
- **Timeline View** for progress tracking and overlap detection
- **Calendar View** for date planning and drag-to-reschedule
- Both views fully integrated with existing Kanban board
- Real-time updates and synchronized data
- Mobile-friendly and accessible

Start using these views today to improve your job card management workflow!

**Ready to get started?** Navigate to Job Card Management and try the new views! 🚀
