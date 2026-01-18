# Part Details Page - Data Fields Reference

## Quick Reference: All 60+ Fields

### Part Identification (9 fields)

| Field | Type | Required | Example | UI Location |
|-------|------|----------|---------|-------------|
| `id` | string | Yes | "uuid-123" | Hidden |
| `partNumber` | string | Yes | "OIL-001" | Overview, Copyable |
| `sku` | string? | No | "SKU-OIL-10W40" | Overview, Copyable |
| `upcEan` | string? | No | "8901234567890" | Overview, Copyable |
| `oemPartNumber` | string? | No | "OEM-999-888" | Overview, Copyable |
| `alternatePartNumbers` | string[]? | No | ["ALT-123", "X-789"] | Overview, Badges |
| `partName` | string | Yes | "Engine Oil 10W-40" | Header |
| `category` | string | Yes | "Engine" | Header, Badge |
| `partType` | string? | No | "Fluid" | Header, Badge |
| `partSubtype` | string? | No | "Motor Oil" | Overview |
| `make` | string? | No | "Universal" | Header, Badge |
| `model` | string? | No | "CBR600RR" | Overview |
| `usedFor` | string | Yes | "Engine Lubrication" | Overview |
| `description` | string? | No | "Premium synthetic..." | Header (truncated) |

---

### Stock Information (3 fields)

| Field | Type | Required | Example | UI Location |
|-------|------|----------|---------|-------------|
| `onHandStock` | number | Yes | 25 | Overview, Header |
| `warehouseStock` | number | Yes | 50 | Overview, Header |
| `lowStockThreshold` | number | Yes | 10 | Overview, Alert |
| `status` | enum | Yes | "in-stock" | Header, Banner |

**Status values**: `'in-stock'` | `'low-stock'` | `'out-of-stock'`

---

### Pricing (6 fields)

| Field | Type | Required | Example | UI Location |
|-------|------|----------|---------|-------------|
| `purchasePrice` | number | Yes | 450.00 | Overview |
| `sellingPrice` | number | Yes | 650.00 | Overview |
| `margin` | number | Yes | 30.8 | Overview (calculated) |
| `wholesalePrice` | number? | No | 550.00 | Overview |
| `coreCharge` | number? | No | 50.00 | Overview |
| `priceLastUpdated` | string? | No | "2024-01-15" | Overview |

**Note**: `margin` is typically calculated: `((sellingPrice - purchasePrice) / sellingPrice) * 100`

---

### Vehicle Fitment - Object (9 fields)

| Field | Type | Required | Example | UI Location |
|-------|------|----------|---------|-------------|
| `fitment.yearStart` | number? | No | 2015 | Fitment Tab |
| `fitment.yearEnd` | number? | No | 2024 | Fitment Tab |
| `fitment.engineSize` | string? | No | "150cc-1000cc" | Fitment Tab |
| `fitment.engineType` | string? | No | "4-Stroke" | Fitment Tab |
| `fitment.transmissionType` | string? | No | "Manual/Auto" | Fitment Tab |
| `fitment.submodel` | string? | No | "All" | Fitment Tab |
| `fitment.position` | string? | No | "Front" | Fitment Tab |
| `fitment.bodyStyle` | string? | No | "Sport" | Fitment Tab |
| `fitment.driveType` | string? | No | "2WD" | Fitment Tab |
| `fitment.quantityPerVehicle` | number? | No | 1 | Fitment Tab |

---

### Physical Attributes (6 fields)

| Field | Type | Required | Example | UI Location |
|-------|------|----------|---------|-------------|
| `weight` | number? | No | 0.95 (kg) | Overview |
| `dimensions.length` | number? | No | 25 (cm) | Overview |
| `dimensions.width` | number? | No | 10 (cm) | Overview |
| `dimensions.height` | number? | No | 10 (cm) | Overview |
| `material` | string? | No | "Synthetic Stock" | Overview |
| `color` | string? | No | "Amber" | Overview |
| `quantityPerPackage` | number? | No | 1 | Overview |
| `isHazardous` | boolean? | No | true | Header (badge) |

---

### Vendor Information (10 fields)

| Field | Type | Required | Example | UI Location |
|-------|------|----------|---------|-------------|
| `supplier` | string? | No | "AutoParts Ltd" | Vendor Tab |
| `supplierPhone` | string? | No | "+91 98765 43210" | Vendor Tab |
| `supplierEmail` | string? | No | "orders@..." | Vendor Tab (link) |
| `supplierWebsite` | string? | No | "https://..." | Vendor Tab (link) |
| `secondarySuppliers` | string[]? | No | ["Global Moto", "SpeedParts"] | Vendor Tab |
| `vendorSku` | string? | No | "APL-OIL-SYN" | Vendor Tab, Copyable |
| `leadTimeDays` | number? | No | 3 | Vendor Tab |
| `minimumOrderQuantity` | number? | No | 12 | Vendor Tab |
| `supplierRating` | number? | No | 4.5 | Vendor Tab (stars) |
| `location` | string? | No | "A1-01" | Lifecycle Tab |

---

### Lifecycle & Tracking (8 fields)

| Field | Type | Required | Example | UI Location |
|-------|------|----------|---------|-------------|
| `dateAdded` | string? | No | "2023-06-15" | Lifecycle Tab |
| `lastRestocked` | string? | No | "2024-01-10" | Lifecycle Tab |
| `lastSoldDate` | string? | No | "2024-01-16" | Lifecycle Tab |
| `lastPurchaseDate` | string? | No | "2024-01-08" | Lifecycle Tab |
| `salesVelocity` | number? | No | 15 (units/mo) | Lifecycle Tab |
| `daysInInventory` | number? | No | 215 (days) | Lifecycle Tab |
| `batchNumber` | string? | No | "BATCH-2024-001" | Lifecycle Tab |
| `expirationDate` | string? | No | "2026-01-10" | Lifecycle Tab |
| `serialNumber` | string? | No | "SN-123456789" | Lifecycle Tab, Copyable |

---

### Quality & Compliance (4 fields)

| Field | Type | Required | Example | UI Location |
|-------|------|----------|---------|-------------|
| `warrantyMonths` | number? | No | 24 | Technical Tab |
| `countryOfOrigin` | string? | No | "India" | Technical Tab |
| `isoCertifications` | string[]? | No | ["ISO 9001:2015"] | Technical Tab (badges) |
| `returnEligible` | boolean? | No | true | Technical Tab (icon) |

---

### Digital Assets (3 fields)

| Field | Type | Required | Example | UI Location |
|-------|------|----------|---------|-------------|
| `productImageUrl` | string? | No | "https://example..." | Header, Technical |
| `technicalDiagramUrl` | string? | No | "https://example..." | Technical (link) |
| `installationInstructionsUrl` | string? | No | "https://example..." | Technical (link) |

---

## Field Visibility Rules

### Always Visible (Header)
- `partName`
- `partNumber`
- `category`
- `partType` (if exists)
- `make` (if exists)
- `isHazardous` (badge, if true)
- `productImageUrl` (if exists)
- `status`
- Total stock count

### Conditional Display
- Fields marked `?` are optional
- `null` or `undefined` values are not rendered
- Empty arrays are not rendered
- Boolean values show icon indicator

---

## Data Types & Validation

### Strings
- `partNumber`: Max 50 chars, alphanumeric + hyphens
- `sku`: Max 100 chars
- `upcEan`: 12 or 13 digits (UPC-A or EAN-13)
- `oemPartNumber`: Max 50 chars
- `email`: Must be valid email format
- `phone`: International format preferred
- `website`: Must start with `http://` or `https://`

### Numbers
- All prices: Positive numbers, 2 decimal places
- `weight`: Positive number, up to 3 decimals (kg)
- `dimensions`: Positive integers (cm)
- `supplierRating`: 0-5, can include 0.5 increments
- `leadTimeDays`: Positive integer
- `salesVelocity`: Positive integer or decimal
- `daysInInventory`: Positive integer

### Dates
- ISO 8601 format: `YYYY-MM-DD`
- Displayed as: `DD Mon YYYY` (e.g., "15 Jan 2024")

### Arrays
- `alternatePartNumbers`: 1-10 items
- `secondarySuppliers`: 1-5 items
- `isoCertifications`: 1-5 items

---

## Calculation Fields

### Margin
```
margin = ((sellingPrice - purchasePrice) / sellingPrice) * 100
```

### Total Stock
```
totalStock = onHandStock + warehouseStock
```

### Stock Status
```
if (totalStock === 0) → 'out-of-stock'
else if (totalStock <= lowStockThreshold) → 'low-stock'
else → 'in-stock'
```

---

## Copyable Fields

These fields have copy-to-clipboard functionality:
1. Part Number
2. SKU
3. UPC/EAN
4. OEM Part Number
5. Vendor SKU
6. Serial Number
7. Batch Number

**UX Pattern**:
- Hover over field → Copy button appears
- Click copy → Checkmark shows for 2 seconds
- Toast/feedback optional (currently checkmark only)

---

## Icons by Field Type

| Icon | Usage | Lucide Component |
|------|-------|------------------|
| 📷 Identification | `Barcode` |
| 📦 Stock | `Package` |
| 💰 Pricing | `DollarSign` |
| 📐 Physical | `Ruler`, `Weight` |
| ⚙️ Fitment | `Settings` |
| 🚚 Vendor | `Truck` |
| 📈 Lifecycle | `TrendingUp`, `Calendar` |
| 🛡️ Quality | `Shield`, `Award` |
| 📄 Technical | `FileText`, `ImageIcon` |
| 📍 Location | `MapPin` |

---

## Future Field Additions

Consider adding:
- `taxRate` - For tax calculations
- `discountPercentage` - For promotional pricing
- `reorderPoint` - Separate from low stock threshold
- `leadTimeVariance` - Min/max days
- `supplierNotes` - Freeform text
- `internalNotes` - Staff-only notes
- `tags` - Flexible categorization
- `relatedParts` - Cross-sell/up-sell
- `supersededBy` - Part replacement tracking
- `lastAuditDate` - Inventory audit trail

---

**Total Fields**: 60+
**Required Fields**: 12
**Optional Fields**: 48+
**Tab Organization**: 5 tabs
**File**: `/app/inventory/[partId]/page.tsx`
