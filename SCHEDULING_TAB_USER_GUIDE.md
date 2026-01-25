# RevvOS Scheduling Tab - Quick User Guide

## Getting Started

### Access the Scheduling Tab
1. Navigate to any job card: `/job-cards/[id]`
2. Click the **"Schedule"** tab in the navigation bar
3. The scheduling interface will load with current job card data

---

## Components Overview

### 1. Promised Date Picker (Large Card)
**Purpose**: Select when the vehicle will be ready for pickup.

**Features**:
- 📅 **Interactive Calendar**
  - Click available dates (green highlight)
  - Avoid high-demand dates (yellow highlight)
  - Past dates and weekends are disabled

- ⚡ **Quick Select**
  - "Tomorrow" - schedules for next business day
  - "Next Week" - schedules 7 days out

- 📊 **Estimated Completion**
  - Shows completion date based on selected service date
  - Displays estimated service duration

**How to Use**:
1. Browse the calendar for available dates
2. Click a date to select it
3. Or use quick select buttons for common options
4. View the estimated completion date in the footer

---

### 2. Time Slot Picker (Large Card)
**Purpose**: Select a specific pickup time slot.

**Features**:
- 🎨 **Color-Coded Availability**
  - 🟢 **Green** (< 60% load): Good availability, multiple technicians free
  - 🟡 **Yellow** (60-90% load): Limited availability, few technicians free
  - 🔴 **Red** (> 90% load): Unavailable, all technicians busy

- 🕐 **15-Minute Increments**
  - Slots from 8:00 AM to 5:00 PM
  - Grouped by Morning and Afternoon

- 💡 **Smart Tooltips**
  - Hover over any slot to see:
    - Number of available technicians
    - Estimated wait time (if unavailable)
    - Current load percentage

**How to Use**:
1. Scroll through available time slots
2. Hover over slots to see availability details
3. Click an available (green or yellow) slot to select
4. Your selection is highlighted with a brand accent color

---

### 3. Service Duration Estimator (Medium Card)
**Purpose**: Calculate how long the service will take.

**Features**:
- 🎚️ **Complexity Selector**
  - **Simple** (×1.0): Routine maintenance, quick repairs
  - **Moderate** (×1.5): Standard repairs, some disassembly
  - **Complex** (×2.0): Major repairs, extensive work

- 👨‍🔧 **Skill Level Selector**
  - **Junior** (×1.3): Apprentice technician
  - **Senior** (×1.0): Experienced technician
  - **Master** (×0.8): Expert technician (faster!)

- ⏱️ **Real-Time Calculation**
  - Shows estimated duration in hours and minutes
  - Includes buffer time
  - Breakdown panel shows detailed calculation

**How to Use**:
1. Select the service complexity level
2. Choose the technician skill level
3. View the estimated duration in hours
4. Click "Duration Breakdown" to see calculation details
5. Duration updates automatically as you change options

---

### 4. Technician Availability (Medium Card)
**Purpose**: View and assign technicians to the job.

**Features**:
- 👤 **Technician Cards**
  - Avatar with initials
  - Name and specialization
  - Skills tags (up to 3 shown)

- 📊 **Utilization Bar**
  - Animated progress indicator
  - Current jobs / max capacity
  - Color-coded by availability

- 🚦 **Status Badges**
  - **Available** (< 70% utilization): Green
  - **Busy** (70-90% utilization): Yellow
  - **Unavailable** (≥ 90% utilization): Red

**How to Use**:
1. Review all technicians and their current workload
2. Check their skills match the service requirements
3. Click a technician card to assign them
4. Selected card is highlighted with brand color
5. View utilization to avoid overloading

---

### 5. Schedule Summary Card
**Purpose**: Review all scheduling decisions before saving.

**Features**:
- 📋 **Complete Overview**
  - Selected date (weekday, day, month)
  - Selected time (12-hour format)
  - Estimated duration
  - Assigned technician
  - Calculated completion date

- ✨ **Real-Time Updates**
  - Updates as you make selections
  - Shows estimated completion date
  - Displays service duration

---

## Workflow Example

### Scenario: Scheduling a Brake Repair

**Step 1: Select Date**
- Click on "Tomorrow" quick button
- Calendar shows available date in green
- Estimated completion displays automatically

**Step 2: Choose Time**
- Browse to morning slots (8AM - 12PM)
- Find a green slot at 9:00 AM
- Click to select
- Tooltip shows "3 technicians available"

**Step 3: Estimate Duration**
- Set complexity to "Moderate" (standard brake job)
- Select "Senior" technician level
- Estimated duration: **2h 30m** (includes buffer)
- Expand breakdown to see: Base 90min × 1.5 complexity + 30min buffer

**Step 4: Assign Technician**
- Review technician list
- Find "John Smith" - Engine Specialist
- See he's "Available" (33% utilization, 1/3 jobs)
- Click his card to assign

**Step 5: Review & Save**
- Summary card shows:
  - Date: Tue, Jan 27
  - Time: 9:00 AM
  - Duration: 2h 30m
  - Technician: John Smith
  - Completion: Tue, Jan 27 at 11:30 AM
- Click **"Save Changes"** to confirm
- Or click **"Cancel"** to discard

---

## Tips & Best Practices

### 🎯 Selecting the Best Time
- **Green slots** have the most technician availability
- **Morning slots** are better for complex jobs (full day ahead)
- **Avoid yellow/red slots** if you need flexibility

### ⚖️ Balancing Workload
- Check technician utilization before assigning
- Avoid assigning to technicians at 90%+ capacity
- Distribute work evenly across the team

### 📊 Duration Planning
- Use **Moderate** complexity for most standard repairs
- Use **Simple** only for routine maintenance (oil change, tire rotation)
- Use **Complex** for major engine/transmission work
- Master technicians work faster but may cost more

### 🔄 Rescheduling
- Click any date/time to change your selection
- Changes update the summary card in real-time
- Cancel to discard all unsaved changes

### 📱 Mobile Usage
- Use landscape mode for better calendar view
- Time slots are optimized for touch (56px height)
- Swipe horizontally to see more tabs

---

## Keyboard Shortcuts

- **Tab**: Navigate between interactive elements
- **Arrow Keys**: Navigate calendar days
- **Enter**: Select focused date/time slot
- **Escape**: Close dropdowns/modals

---

## Status Colors Reference

| Color | Availability | Load | Action |
|-------|--------------|------|--------|
| 🟢 Green | Available | < 60% | Safe to schedule |
| 🟡 Yellow | Limited | 60-90% | Use if necessary |
| 🔴 Red | Unavailable | > 90% | Do not schedule |
| 🔵 Blue | Today/Selected | - | Current date/time |

---

## Common Questions

**Q: Can I schedule on weekends?**
A: No, weekends are disabled as the garage is closed.

**Q: What if all time slots are red?**
A: Select a different date with better availability.

**Q: How is buffer time calculated?**
A: Simple: 15min, Moderate: 30min, Complex: 60min.

**Q: Can I assign multiple technicians?**
A: Currently one lead technician per job. Future updates may support this.

**Q: What happens if I click Save?**
A: The scheduling data is saved to the job card and becomes visible to all users.

**Q: Can I change the schedule after saving?**
A: Yes, simply make new selections and click Save again.

---

## Getting Help

If you encounter issues:
1. Check browser console for errors
2. Refresh the page and try again
3. Contact support if the problem persists

---

**Last Updated**: January 25, 2026
**Version**: 1.0.0
