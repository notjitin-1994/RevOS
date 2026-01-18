# Part Details Page - Tab Structure Guide

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER SECTION                                                  │
│  ┌──────┐  Part Name                    ┌──────────────────┐   │
│  │ Image │  Part Number                 │  Stock Status    │   │
│  │      │  Description (truncated)      │  Total Units     │   │
│  └──────┘  [Category] [Type] [Make]     └──────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  TAB NAVIGATION                                                  │
│  [Overview] [Vehicle Fitment] [Vendor Info] [Lifecycle] [Tech]  │
├─────────────────────────────────────┬───────────────────────────┤
│                                     │                           │
│  MAIN CONTENT (2/3 width)           │  SIDEBAR (1/3 width)     │
│  (Tab-specific content)             │  - Quick Actions         │
│                                     │    - Edit Part           │
│  Overview Tab:                      │    - Delete Part         │
│  ┌─────────────────────────────┐   │                           │
│  │ 📷 Part Identification     │   │                           │
│  │   • Part Number (copy)     │   │                           │
│  │   • SKU (copy)             │   │                           │
│  │   • UPC/EAN (copy)         │   │                           │
│  │   • OEM Number (copy)      │   │                           │
│  │   • Alternate Parts        │   │                           │
│  └─────────────────────────────┘   │                           │
│  ┌─────────────────────────────┐   │                           │
│  │ 📦 Stock Information       │   │                           │
│  │   On-Hand | Warehouse | Low│   │                           │
│  └─────────────────────────────┘   │                           │
│  ┌─────────────────────────────┐   │                           │
│  │ 💰 Pricing Information      │   │                           │
│  │   Purchase | Selling | Margin│   │                           │
│  │   Wholesale | Core Charge   │   │                           │
│  └─────────────────────────────┘   │                           │
│  ┌─────────────────────────────┐   │                           │
│  │ 📐 Physical Attributes      │   │                           │
│  │   Weight | Dimensions      │   │                           │
│  │   Material | Color          │   │                           │
│  └─────────────────────────────┘   │                           │
│                                     │                           │
└─────────────────────────────────────┴───────────────────────────┘
```

## Tab Content Breakdown

### 1. Overview Tab
**Purpose**: Most frequently accessed information

| Section | Fields | Icons |
|---------|--------|-------|
| Part Identification | Part #, SKU, UPC/EAN, OEM #, Alt Parts, Type, Subtype | Barcode |
| Stock Information | On-Hand, Warehouse, Low Stock Threshold | Package |
| Pricing | Purchase, Selling, Margin, Wholesale, Core Charge, Updated | DollarSign |
| Physical | Weight, L×W×H, Material, Color, Qty/Pkg | Ruler, Weight |

### 2. Vehicle Fitment Tab (ACES Standard)
**Purpose**: Detailed compatibility information

| Field | Description | Example |
|-------|-------------|---------|
| Year Range | Start/End years | 2015 - 2024 |
| Engine Size | Displacement range | 150cc-1000cc |
| Engine Type | Configuration | 4-Stroke |
| Transmission | Type compatibility | Manual/Automatic |
| Submodel/Trim | Specific variant | All |
| Position | Location on vehicle | Left/Right, Front/Rear |
| Body Style | Vehicle type | All |
| Drive Type | 2WD/4WD/AWD | 2WD |
| Qty per Vehicle | How many needed | 1 |

### 3. Vendor Info Tab
**Purpose**: Supply chain management

| Section | Fields | Features |
|---------|--------|----------|
| Primary Supplier | Name, Phone, Email, Website, Vendor SKU | Clickable links |
| Order Details | Lead Time, Min Order Qty | Numeric display |
| Quality | Supplier Rating | 5-star visual |
| Backup Suppliers | Array of alternate vendors | Bulleted list |

### 4. Lifecycle Tab
**Purpose**: Inventory analytics and tracking

| Section | Fields | Metrics |
|---------|--------|---------|
| Inventory Metrics | Sales Velocity, Aging, Batch/Lot | units/month, days |
| Important Dates | Added, Restocked, Last Sold, Last Purchase, Expiration | Formatted dates |
| Tracking | Serial Number, Storage Location | Copyable fields |

### 5. Technical Tab
**Purpose**: Compliance and documentation

| Section | Fields | Display |
|---------|--------|---------|
| Quality & Compliance | Warranty, Country of Origin, Return Eligible, ISO Certs | Badges, icons |
| Digital Resources | Product Image, Tech Diagram, Install Instructions | External links |

## Color Coding System

### Status Colors
- **Green** (`status-success`) - In stock, eligible, good margin
- **Yellow** (`status-warning`) - Low stock, medium margin
- **Red** (`status-error`) - Out of stock, not eligible, poor margin

### Badge Colors
- **Blue** - Category tags
- **Purple** - Part type tags
- **Green** - Make/Brand tags
- **Red** - Hazardous material warning

### Section Headers
- **Gray background** - Visual separation
- **Icon** - Quick identification
- **Bold text** - Clear hierarchy

## Interactive Elements

### Copy to Clipboard
```
┌──────────────────────────────────┐
│ Part Number        [📋 Copy]     │
└──────────────────────────────────┘
```
- Hover over field to reveal copy button
- Click to copy
- Checkmark appears for 2 seconds

### Star Rating
```
⭐⭐⭐⭐⭐ 4.5/5
```
- Visual representation
- Numeric score
- Color-coded (yellow/gray)

### External Links
```
View Diagram [↗]
```
- Blue text
- Underline on hover
- External link icon

## Responsive Breakpoints

| Screen Size | Layout | Columns |
|-------------|--------|---------|
| Mobile (< 768px) | Single column | 1 col |
| Tablet (768-1024px) | Two columns | 2 cols |
| Desktop (> 1024px) | Main + Sidebar | 2/3 + 1/3 |

## Data Flow

```
User loads page
    ↓
Check authentication
    ↓
Fetch part data (mock → API)
    ↓
Set part state
    ↓
Render tabs (default: Overview)
    ↓
User interacts (click tabs, copy fields)
    ↓
Update activeTab / copiedField state
    ↓
AnimatePresence transition
    ↓
Display new tab content
```

## Key Features Summary

✅ 60+ data fields organized logically
✅ 5-tab progressive disclosure
✅ Copy-to-clipboard for IDs
✅ Visual star ratings
✅ Responsive on all devices
✅ Smooth animations
✅ Status indicators
✅ Hazardous material warnings
✅ External link handling
✅ Optional field handling
✅ Realistic mock data
✅ Production-ready error handling

---

**Ready for**: API Integration, Edit Functionality, Search/Filter, Reporting
