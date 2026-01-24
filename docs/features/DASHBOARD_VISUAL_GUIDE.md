# Dashboard Visual Guide

## Card Layout (6 Cards in Grid)

```
┌─────────────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────────────┐
│ 📋 [+] [📅]                │  │ 👥 [+] [📅]                │  │ 👤 [+] [🔍]                │
│ Service Center               │  │ Crew Station                 │  │ Client Hub                   │
│ Manage jobs, track progress  │  │ Oversee team, manage roles   │  │ Manage customers, history    │
│ ─────────────────────────    │  │ ─────────────────────────    │  │ ─────────────────────────    │
│ Total Jobs: 24               │  │ Total Employees: 8           │  │ Total Customers: 156         │
│ Active: 12                   │  │ Active: 7                    │  │ With Vehicles: 12            │
│ Ready for Delivery: 8        │  │ On Leave: 1                  │  │ New This Month: 5            │
├─────────────────────────────┤  ├─────────────────────────────┤  ├─────────────────────────────┤
│ → Open                      │  │ → Open                      │  │ → Open                      │
└─────────────────────────────┘  └─────────────────────────────┘  └─────────────────────────────┘

┌─────────────────────────────┐  ┌─────────────────────────────┐  ┌─────────────────────────────┐
│ 🏍️ [+] [🔍]                │  │ 📦 [+] [📉]                │  │ ₹₹                         │
│ Vehicle Registry             │  │ Parts Repository             │  │ Billing & Invoicing         │
│ Register vehicles, records   │  │ Monitor stock, parts         │  │ Manage invoices, payments   │
│ ─────────────────────────    │  │ ─────────────────────────    │  │ ─────────────────────────    │
│ Registered Vehicles: 89      │  │ Total Parts: 1,245           │  │ Pending Invoices: 0         │
│                              │  │ Low Stock: 15                │  │ Amount Due: ₹0              │
│                              │  │ Out of Stock: 3              │  │ Paid This Month: ₹0         │
├─────────────────────────────┤  ├─────────────────────────────┤  ├─────────────────────────────┤
│ → Open                      │  │ → Open                      │  │ → Open                      │
└─────────────────────────────┘  └─────────────────────────────┘  └─────────────────────────────┘
```

## Quick Overview Section (Below Cards)

```
┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐
│ 12          │  │ 7           │  │ 156         │  │ 15          │
│ Active Jobs │  │ Team Members│  │ Customers   │  │ Low Stock   │
│ 8 ready     │  │ 1 on leave  │  │ 5 new this  │  │ 3 out of    │
│             │  │             │  │ month       │  │ stock       │
└─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘
```

## Color Legend

- **Default (Gray-900)** - Total counts
- **Blue** - Active items, vehicles in garage
- **Green** - Positive states (active employees, ready delivery, new customers, paid)
- **Orange** - Warning states (low stock, on leave)
- **Red** - Critical states (out of stock, amount due)

## Icon Reference

| Card | Icon | Lucide Icon | Custom Component |
|------|------|-------------|------------------|
| Service Center | 📋 | ClipboardList | - |
| Crew Station | 👥 | Users | - |
| Client Hub | 👤 | UserPlus | - |
| Vehicle Registry | 🏍️ | - | MotorcycleIcon |
| Parts Repository | 📦 | Package | - |
| Billing & Invoicing | ₹₹ | IndianRupee | - |

## Quick Action Buttons

### Service Center
- **+ (FilePlus)** → New Job Card
- **📅 (Calendar)** → View Calendar

### Crew Station
- **+ (UserPlus)** → Add Employee
- **📅 (Calendar)** → View Schedule

### Client Hub
- **+ (UserPlus)** → Add Customer
- **🔍 (Search)** → Search Customers

### Vehicle Registry
- **+ (FilePlus)** → Register Vehicle
- **🔍 (Search)** → Search Vehicles

### Parts Repository
- **+ (FilePlus)** → Add Part
- **📉 (TrendingDown)** → View Low Stock

### Billing & Invoicing
- No quick actions (placeholder)

## Navigation Routes

| Card | Route |
|------|-------|
| Service Center | `/job-cards` |
| Crew Station | `/employee-management` |
| Client Hub | `/customer-management` |
| Vehicle Registry | `/vehicles` |
| Parts Repository | `/inventory` |
| Billing & Invoicing | `/settings` (placeholder) |

## Responsive Breakpoints

- **Mobile (< 768px):** 1 column
- **Tablet (768px - 1024px):** 2 columns
- **Desktop (> 1024px):** 3 columns

## Stats Display Format

Each stat displays as:
```
Label: Value
```

With optional color coding:
- No color = default (gray-900)
- Blue = `text-blue-600`
- Green = `text-green-600`
- Orange = `text-orange-600`
- Red = `text-red-600`

## Loading State

When stats are loading, each card shows:
```
[Spinner Icon]
```

Using Loader2 component from lucide-react with rotation animation.

## Error State

If stats fail to load:
```
Unable to load statistics: [error message]
```

Displayed in red box below header.
