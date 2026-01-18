# RevOS Color Mapping - Light Mode Design System

## Component-by-Component Color Reference

---

## Sidebar (Brand Accent Lime)

### Desktop Sidebar
| Element | Color Class | Hex Value | Usage |
|---------|-------------|-----------|-------|
| Background | `bg-brand` | `#CCFF00` | Main sidebar background |
| Border | `border-brand-hover` | `#B2DE00` | Right border divider |
| Icons | `text-graphite-900` | `#0F172A` | All navigation icons |
| Text Labels | `text-graphite-900` | `#0F172A` | Link labels |
| Logo | `text-graphite-900` | `#0F172A` | "RevOS" branding |
| Hover State | `hover:bg-brand-hover/30` | `30% opacity` | Interactive links |

### Mobile Sidebar
| Element | Color Class | Hex Value | Usage |
|---------|-------------|-----------|-------|
| Header Background | `bg-brand` | `#CCFF00` | Top bar with logo |
| Menu Icon | `text-graphite-900` | `#0F172A` | Hamburger menu |
| Overlay Background | `bg-brand` | `#CCFF00` | Full sidebar when open |
| Close Icon | `text-graphite-900` | `#0F172A` | X button |

---

## Page Backgrounds

| Page/Context | Background | Hex Value |
|--------------|------------|-----------|
| App Global (globals.css) | `#ecf0f5` | `#ecf0f5` |
| Settings Page | `#dfe5ef` | `#dfe5ef` |
| Loading State | `#dfe5ef` | `#dfe5ef` |
| Error State | `#dfe5ef` | `#dfe5ef` |

---

## Data Container Cards

### InfoCard Component
| Element | Before (Dark) | After (Light) | Hex |
|---------|---------------|---------------|-----|
| Card Background | `bg-graphite-800` | `bg-white` | `#FFFFFF` |
| Card Border | `border-graphite-700` | `border-gray-200` | `#E5E7EB` |
| Card Header | `bg-graphite-900` | `bg-gradient-to-r from-gray-50 to-white` | `#F9FAFB → #FFF` |
| Header Border | `border-graphite-700` | `border-gray-200` | `#E5E7EB` |
| Card Shadow | N/A | `shadow-card` | Custom |
| Backdrop | N/A | `backdrop-blur-sm` | CSS filter |

### Icon Containers (Card Headers)
| Element | Before (Dark) | After (Light) | Hex |
|---------|---------------|---------------|-----|
| Background | `bg-graphite-900` | `bg-gray-100` | `#F3F4F6` |
| Icon Color | `text-white` | `text-gray-700` | `#374151` |
| Border Radius | `rounded-xl` | `rounded-lg md:rounded-xl` | - |

---

## Text Colors

### Headings
| Element | Before (Dark) | After (Light) | Hex |
|---------|---------------|---------------|-----|
| H1 (Page Title) | `text-white` | `text-graphite-900` | `#0F172A` |
| H2 (Section Title) | `text-white` | `text-gray-900` | `#111827` |
| H3 (Card Title) | `text-white` | `text-gray-900` | `#111827` |
| Profile Name | `text-white` | `text-gray-900` | `#111827` |

### Body Text
| Element | Before (Dark) | After (Light) | Hex |
|---------|---------------|---------------|-----|
| Primary Text | `text-white` | `text-gray-700` | `#374151` |
| Secondary Text | `text-graphite-400` | `text-gray-600` | `#4B5563` |
| Label Text | `text-graphite-400` | `text-gray-600` | `#4B5563` |
| Muted Text | `text-graphite-300` | `text-gray-400` | `#9CA3AF` |
| Placeholder | `text-gray-500` | `text-gray-400` | `#9CA3AF` |

---

## Profile Cards

### Hero Card (Settings Page)
| Element | Color Class | Hex Value |
|---------|-------------|-----------|
| Background | `bg-white backdrop-blur-sm` | `#FFFFFF` |
| Border | `border-gray-200` | `#E5E7EB` |
| Accent Line | `from-brand via-brand/80 to-transparent` | `#CCFF00 → 80% → transparent` |
| Shadow | `shadow-2xl` | Custom |

### Avatar Container
| State | Background | Border | Icon |
|-------|------------|--------|------|
| Default | `bg-gradient-to-br from-gray-200 to-gray-100` | `border-2 border-gray-300` | `text-gray-700` |
| Hex | `#E5E7EB → #F3F4F6` | `#D1D5DB` | `#374151` |

### Status Badge
| Element | Color | Hex |
|---------|-------|-----|
| Background | `bg-gray-100` | `#F3F4F6` |
| Border | `border-gray-300` | `#D1D5DB` |
| Text | `text-gray-700` | `#374151` |
| Icon | `text-gray-700` | `#374151` |

### Mobile Profile Card (with Picture)
| Element | Color Class | Usage |
|---------|-------------|-------|
| Gradient Overlay | `bg-gradient-to-b from-black/10 via-black/20 to-black/40` | Text readability |
| Glass Card | `bg-white/10 backdrop-blur-md border border-white/20` | Overlay effect |
| Text | `text-white` | Profile name/info |
| Status Dot | `bg-gray-700` | Active indicator |

---

## Buttons

### Primary Buttons
| Element | Color Class | Hex |
|---------|-------------|-----|
| Background | `bg-gray-700` | `#374151` |
| Hover | `hover:bg-gray-600` | `#4B5563` |
| Text | `text-white` | `#FFFFFF` |
| Shadow | `shadow-lg shadow-gray-300/20` | Custom |

### Action Icons (Edit, Camera, etc.)
| State | Color | Hex |
|-------|-------|-----|
| Default | `text-gray-400` | `#9CA3AF` |
| Hover | `hover:text-gray-700` | `#374151` |
| Active | `active:text-gray-700` | `#374151` |

---

## Info Items (Editable Rows)

| Element | Color Class | Hex |
|---------|-------------|-----|
| Hover | `hover:bg-gray-100` | `#F3F4F6` |
| Active | `active:bg-gray-100` | `#F3F4F6` |
| Label Text | `text-gray-600` | `#4B5563` |
| Value Text | `text-gray-900` | `#111827` |
| Placeholder | `text-gray-400 italic` | `#9CA3AF` |

---

## Status Colors (Semantic)

### Status Badges & Indicators
| Status | Background | Text | Border |
|--------|------------|------|--------|
| Success | `bg-status-success/10` | `text-status-success` | `border-status-success/20` |
| Error | `bg-status-error/10` | `text-status-error` | `border-status-error/20` |
| Warning | `bg-status-warning/10` | `text-status-warning` | `border-status-warning/20` |
| Info | `bg-status-info/10` | `text-status-info` | `border-status-info/20` |

### Status Color Values
| Status | Hex | Usage |
|--------|-----|-------|
| Success | `#2DD4BF` (Teal) | Positive indicators |
| Error | `#EF4444` (Red) | Errors, alerts |
| Warning | `#F59E0B` (Orange) | Warnings, cautions |
| Info | `#38BDF8` (Blue) | Informational content |

---

## Form Elements

### Input Fields
| State | Background | Border | Text |
|-------|------------|--------|------|
| Default | `bg-white` | `border-gray-300` | `text-gray-900` |
| Focus | `bg-white` | `border-gray-400` | `text-gray-900` |
| Error | `bg-white` | `border-status-error` | `text-gray-900` |
| Disabled | `bg-gray-50` | `border-gray-200` | `text-gray-400` |
| Placeholder | - | - | `text-gray-400` |

### Labels
| Element | Color |
|---------|-------|
| Label Text | `text-gray-600` or `text-gray-700` |
| Font Weight | `font-medium` |

---

## Loading States

| Element | Color | Hex |
|---------|-------|-----|
| Background | `#dfe5ef` | `#dfe5ef` |
| Outer Ring | `border-gray-300` | `#D1D5DB` |
| Spinning Part | `border-t-gray-600` | `#4B5563` |
| Loading Text | `text-graphite-600` | `#475569` |

---

## Error States

### Error Card
| Element | Color | Hex |
|---------|-------|-----|
| Background | `bg-white/70 backdrop-blur-sm` | 70% white |
| Border | `border-red-500/50` | 50% red |
| Icon Background | `bg-red-500/10` | 10% red |
| Icon | `text-red-500` | `#EF4444` |
| Title | `text-graphite-900` | `#0F172A` |
| Message | `text-graphite-600` | `#475569` |

---

## Border Reference

| Border Type | Color Class | Hex | Usage |
|-------------|-------------|-----|-------|
| Subtle | `border-gray-200` | `#E5E7EB` | Cards, dividers |
| Default | `border-gray-300` | `#D1D5DB` | Input fields |
| Medium | `border-gray-400` | `#9CA3AF` | Focus states |
| Strong | `border-gray-600` | `#4B5563` | Emphasized dividers |
| Graphite Dark | `border-graphite-900` | `#0F172A` | Rare usage |

---

## Shadow Reference

| Shadow Class | Description |
|--------------|-------------|
| `shadow-card` | Standard elevation for data cards |
| `shadow-2xl` | Hero/profile cards, modals |
| `shadow-lg` | Elevated elements, dropdowns |
| `shadow-gray-300/20` | Subtle shadow on light backgrounds |

---

## Glassmorphism Effects

### Profile Overlays (Mobile)
| Element | Color |
|---------|-------|
| Card Background | `bg-white/10 backdrop-blur-sm` |
| Card Border | `border-white/20` |
| Edit Button | `bg-black/30 backdrop-blur-sm` |
| Gradient Overlay | `from-black/10 via-black/20 to-black/40` |

---

## Decorative Elements

### Accent Lines
| Element | Color |
|---------|-------|
| Brand Gradient | `from-brand via-brand/80 to-transparent` |
| Separator Line | `bg-graphite-600` (1px width) |

---

## Focus Ring (Accessibility)

```css
*:focus-visible {
  outline: none;
  ring-2 ring-brand;
  ring-offset-2 ring-offset-graphite-900;
}
```

| Element | Color |
|---------|-------|
| Ring | `ring-brand` (#CCFF00) |
| Offset | `ring-offset-graphite-900` (#0F172A) |

---

## Complete Color Palette Summary

### Brand Colors
| Name | Class | Hex | Usage |
|------|-------|-----|-------|
| Brand Lime | `brand` | `#CCFF00` | Sidebar background |
| Brand Hover | `brand-hover` | `#B2DE00` | Sidebar border, hover states |

### Graphite Scale
| Shade | Class | Hex | Usage |
|-------|-------|-----|-------|
| 900 | `graphite-900` | `#0F172A` | Darkest text, sidebar icons |
| 700 | `graphite-700` | `#334155` | Borders (rare) |
| 600 | `graphite-600` | `#475569` | Muted text |
| 400 | `graphite-400` | `#94A3B8` | Light muted |

### Gray Scale (Primary for Light Mode)
| Shade | Class | Hex | Usage |
|-------|-------|-----|-------|
| 900 | `gray-900` | `#111827` | Headings, primary text |
| 700 | `gray-700` | `#374151` | Body text, icons |
| 600 | `gray-600` | `#4B5563` | Secondary text, labels |
| 400 | `gray-400` | `#9CA3AF` | Muted text, placeholders |
| 300 | `gray-300` | `#D1D5DB` | Light borders |
| 200 | `gray-200` | `#E5E7EB` | Card borders, dividers |
| 100 | `gray-100` | `#F3F4F6` | Icon containers, light bg |

### Status Scale
| Color | Class | Hex | Usage |
|-------|-------|-----|-------|
| Success | `status-success` | `#2DD4BF` | Positive outcomes |
| Error | `status-error` | `#EF4444` | Negative/alerts |
| Warning | `status-warning` | `#F59E0B` | Caution |
| Info | `status-info` | `#38BDF8` | Informational |

### Background Colors
| Context | Hex |
|---------|-----|
| App Global | `#ecf0f5` |
| Settings Page | `#dfe5ef` |
| Card Surface | `#FFFFFF` |
| Icon Container | `#F3F4F6` |

---

## Design Tokens

```typescript
// Design token reference for RevOS light mode
const tokens = {
  colors: {
    brand: {
      DEFAULT: '#CCFF00',
      hover: '#B2DE00',
    },
    background: {
      app: '#ecf0f5',
      settings: '#dfe5ef',
      card: '#FFFFFF',
      icon: '#F3F4F6',
    },
    text: {
      heading: '#111827', // gray-900
      primary: '#374151', // gray-700
      secondary: '#4B5563', // gray-600
      muted: '#9CA3AF', // gray-400
      sidebar: '#0F172A', // graphite-900
    },
    border: {
      subtle: '#E5E7EB', // gray-200
      default: '#D1D5DB', // gray-300
      medium: '#9CA3AF', // gray-400
      strong: '#4B5563', // gray-600
    },
    status: {
      success: '#2DD4BF',
      error: '#EF4444',
      warning: '#F59E0B',
      info: '#38BDF8',
    },
  },
}
```
