# RevOS Application - Light Mode Design Documentation

## Date: 2025-01-17

## Summary
RevOS now features a modern **light mode** design system. The interface uses a light background with brand accent lime sidebar and white data cards with dark graphite text.

---

## Overall Color Palette

### Main Background
- **App Background**: `#ecf0f5` (Light gray-blue) - Set in `globals.css`
- **Settings Background**: `#dfe5ef` (Light blue-gray)

### Sidebar (Brand Accent)
- **Background**: `bg-brand` (#CCFF00 - Lime)
- **Border**: `border-brand-hover` (#B2DE00)
- **Icons**: `text-graphite-900` (#0F172A)
- **Text Labels**: `text-graphite-900` (#0F172A)
- **Logo Text**: `text-graphite-900`

### Data Container Cards
- **Card Background**: `bg-white` (#FFFFFF)
- **Card Border**: `border-gray-200` (#E5E7EB)
- **Card Header**: `bg-gradient-to-r from-gray-50 to-white`
- **Header Divider**: `border-gray-200`

---

## Text Colors

### Headings
- **H1, H2, H3**: `text-gray-900` or `text-graphite-900`
- **Section Titles**: `text-lg md:text-lg font-semibold text-gray-900`

### Body Text
- **Primary Text**: `text-gray-700`
- **Secondary Text**: `text-gray-600`
- **Muted/Label Text**: `text-gray-600`
- **Placeholder Text**: `text-gray-400`

### Interactive Elements
- **Links**: Inherit or `text-gray-700`
- **Hover States**: `text-gray-900` (darker on hover)

---

## Icon Styling

### Icon Background Containers
- **Default**: `bg-gray-100` (#F3F4F6)
- **Emergency/Error**: `bg-status-error/10`
- **Active State**: `active:bg-gray-200`

### Icon Colors
- **Default**: `text-gray-700`
- **Hover/Active**: `text-gray-700` or `text-graphite-900`
- **Status Icons**: Uses status color scale (success, error, warning, info)

---

## Button Styling

### Primary Buttons
- **Background**: `bg-gray-700` to `bg-gray-600` (hover)
- **Text**: `text-white`
- **Example**: "Back to Login" button in settings

### Action Buttons
- **Edit Icons**: `text-gray-400` → `hover:text-gray-700`
- **Active States**: `active:text-gray-700`

### Touch Targets
- Minimum 44x44px for mobile accessibility

---

## Card Components

### InfoCard Component
```tsx
// Base styling
bg-white backdrop-blur-sm rounded-xl md:rounded-2xl border border-gray-200
shadow-card overflow-hidden

// Header
bg-gradient-to-r from-gray-50 to-white
border-b border-gray-200

// Icon container
bg-gray-100 rounded-lg md:rounded-xl
```

### Editable Info Items
```tsx
// Container
py-3 md:py-4 px-3 -mx-3 rounded-xl
cursor-pointer min-h-[44px]
hover:bg-gray-100
active:bg-gray-100
```

---

## Profile Cards

### Hero Card (Settings)
- **Background**: `bg-white backdrop-blur-sm`
- **Border**: `border-gray-200`
- **Shadow**: `shadow-2xl`
- **Accent Line**: `bg-gradient-to-r from-brand via-brand/80 to-transparent`

### Avatar Container
- **Default State**: `bg-gradient-to-br from-gray-200 to-gray-100`
- **Border**: `border-2 border-gray-300`
- **Icon**: `text-gray-700`

### Status Badges
- **Background**: `bg-gray-100` or `bg-gray-200/50` (glass effect)
- **Border**: `border-gray-300`
- **Text**: `text-gray-700`
- **Icon**: `text-gray-700`

---

## Form Elements

### Inputs
- **Background**: `bg-white`
- **Border**: `border-gray-300` (default) → `border-gray-400` (focus/active)
- **Text**: `text-gray-900`
- **Placeholder**: `text-gray-400`

### Labels
- **Color**: `text-gray-600` or `text-gray-700`
- **Font Weight**: `font-medium`

---

## Status Colors (Semantic)

| Status | Hex | Usage |
|--------|-----|-------|
| Success | `#2DD4BF` (Teal) | Positive outcomes |
| Error | `#EF4444` (Red) | Errors, alerts |
| Warning | `#F59E0B` (Orange) | Warnings |
| Info | `#38BDF8` (Blue) | Informational |

**Usage**: Status colors are used sparingly for semantic meaning only, not as decorative elements.

---

## Brand Color Usage

### Brand (#CCFF00 - Lime)
- **Sidebar Background**: Full opacity
- **Sidebar Border**: `border-brand-hover` (#B2DE00)
- **Accent Lines**: `from-brand via-brand/80 to-transparent`
- **Primary CTAs**: Strategic usage

### Brand Opacity Variants
- `brand/10` (10%) - Subtle backgrounds
- `brand/20` (20%) - Borders, hover states

---

## Graphite Color Scale

| Shade | Hex | Usage |
|-------|-----|-------|
| graphite-900 | `#0F172A` | Darkest text, sidebar icons/text |
| graphite-700 | `#334155` | Borders (some cases) |
| graphite-600 | `#475569` | Muted text, borders |
| graphite-400 | `#94A3B8` | Light muted text |

---

## Gray Color Scale (Light Mode)

| Shade | Hex | Usage |
|-------|-----|-------|
| gray-900 | `#111827` | Headings, primary text |
| gray-700 | `#374151` | Body text, icons |
| gray-600 | `#4B5563` | Secondary text, labels |
| gray-400 | `#9CA3AF` | Muted text, placeholders |
| gray-300 | `#D1D5DB` | Light borders, disabled |
| gray-200 | `#E5E7EB` | Borders, dividers |
| gray-100 | `#F3F4F6` | Light backgrounds, icon containers |

---

## Shadows

| Shadow Class | Usage |
|--------------|-------|
| `shadow-card` | Standard card shadow |
| `shadow-2xl` | Hero cards, profile cards |
| `shadow-lg` | Elevated elements |
| `shadow-gray-300/20` | Subtle shadows on gray backgrounds |

---

## Glassmorphism Effects

### Profile Card Overlays (Mobile)
- **Background**: `bg-white/10 backdrop-blur-sm`
- **Border**: `border-white/20`
- **Button**: `bg-black/30 backdrop-blur-sm`

### Backdrop Blur
- Used on card overlays and modals
- `backdrop-blur-sm` for subtle blur
- `backdrop-blur-md` for stronger blur

---

## Active & Hover States

### Interactive Elements
- **Link Hover**: `hover:bg-gray-100`
- **Button Active**: `active:bg-gray-200`
- **Icon Hover**: `hover:text-gray-700`
- **Edit Icon**: `text-gray-400 hover:text-gray-700 transition-colors`

### Scale Transitions
- **Touch Feedback**: `active:scale-[0.98]` or `active:scale-90`
- **Hover Grow**: `hover:scale-1.05`

---

## Focus States (Accessibility)

### Focus Ring
```css
*:focus-visible {
  outline-none;
  ring-2 ring-brand;
  ring-offset-2;
  ring-offset-graphite-900;
}
```

---

## Loading States

### Spinner
- **Outer Ring**: `border-4 border-gray-300`
- **Spinning Part**: `border-4 border-t-gray-600 border-r-transparent border-b-transparent`
- **Loading Text**: `text-graphite-600 font-medium`

### Background
- `backgroundColor: '#dfe5ef'`

---

## Error States

### Error Card
- **Background**: `bg-white/70 backdrop-blur-sm`
- **Border**: `border-red-500/50`
- **Icon**: `bg-red-500/10`
- **Icon Color**: `text-red-500`

### Error Text
- **Title**: `text-graphite-900` (for "Error Loading Settings")
- **Message**: `text-graphite-600`

---

## Responsive Breakpoints

| Breakpoint | Width | Usage |
|------------|-------|-------|
| `sm:` | 640px | Small devices |
| `md:` | 768px | Tablets (hidden/block for desktop/mobile) |
| `lg:` | 1024px | Small laptops |
| `xl:` | 1280px | Desktops |

---

## Files Affected by Light Mode Update

- `app/settings/page.tsx` - Settings page with light mode
- `components/ui/sidebar.tsx` - Lime sidebar with graphite icons
- `components/layout/app-sidebar.tsx` - Sidebar link styling
- `app/globals.css` - Base background color `#ecf0f5`

---

## Design Principles

### Light Mode Philosophy
1. **Clean & Crisp**: White cards on light gray-blue background
2. **High Contrast**: Dark graphite text on white/light backgrounds
3. **Brand Accent**: Lime sidebar provides brand identity
4. **Semantic Colors**: Status colors used only for meaning
5. **Accessibility**: WCAG 2.1 AA compliant contrast ratios

### Visual Hierarchy
- **Level 1**: Page background (lightest)
- **Level 2**: White cards (main containers)
- **Level 3**: Gray-100 icon containers
- **Level 4**: Gray-900 text (darkest, most prominent)

---

## Migration Notes

### From Dark Mode to Light Mode
- **Backgrounds**: `bg-graphite-800` → `bg-white`
- **Text**: `text-white` → `text-gray-900` or `text-graphite-900`
- **Borders**: `border-graphite-700` → `border-gray-200`
- **Icon Backgrounds**: `bg-graphite-900` → `bg-gray-100`
- **Body Text**: `text-graphite-400` → `text-gray-600`

---

## Testing Checklist

- [x] All text is readable on light backgrounds
- [x] Contrast ratios meet WCAG 2.1 AA standards
- [x] Sidebar brand color (#CCFF00) provides sufficient contrast with graphite-900 text
- [x] Interactive states (hover, active) are clearly visible
- [x] Error states maintain accessibility
- [x] Mobile responsive design maintained
- [x] All functionality preserved from dark mode
