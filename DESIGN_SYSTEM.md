# RevOS Design System

## Overview

RevOS uses a **light mode** design system with graphite accents and lime (brand) highlights. The design emphasizes clean, professional aesthetics suitable for automotive workshop environments.

> **Last Updated:** January 2026
> **Design System Name:** Precision Volt (Light Mode)

---

## Color Palette

### Brand Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Brand Primary** | `#CCFF00` | Primary CTAs, sidebar background, accent elements | `bg-brand` |
| **Brand Hover** | `#B2DE00` | Hover states for brand elements | `bg-brand-hover` |

### Background Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **App Background** | `#CFD0D4` | Main application background | `bg-[#CFD0D4]` |
| **Card Surface** | `#FFFFFF` | Data cards, panels, modals | `bg-white` |
| **Icon Container** | `#F3F4F6` | Icon backgrounds | `bg-gray-100` |

### Text Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Heading** | `#111827` | Main headings (H1-H3) | `text-gray-900` |
| **Primary Text** | `#374151` | Body text, icons | `text-gray-700` |
| **Secondary Text** | `#4B5563` | Labels, descriptions | `text-gray-600` |
| **Muted Text** | `#9CA3AF` | Placeholder, disabled text | `text-gray-400` |
| **Sidebar Text** | `#0F172A` | Sidebar icons and labels | `text-graphite-900` |

### Border Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Border Subtle** | `#E5E7EB` | Card borders, dividers | `border-gray-200` |
| **Border Default** | `#D1D5DB` | Input fields | `border-gray-300` |
| **Border Medium** | `#9CA3AF` | Focus states | `border-gray-400` |
| **Border Strong** | `#4B5563` | Emphasized dividers | `border-gray-600` |

### Graphite Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Graphite 900** | `#0F172A` | Darkest text, sidebar icons | `text-graphite-900`, `bg-graphite-900` |
| **Graphite 700** | `#334155` | Borders, elevated surfaces | `border-graphite-700` |
| **Graphite 600** | `#475569` | Input borders, muted text | `border-graphite-600` |

### Status Colors

| Color | Hex | Usage | Tailwind Class |
|-------|-----|-------|----------------|
| **Success** | `#2DD4BF` | Success states (Teal, never green) | `text-teal-500`, `bg-teal-500` |
| **Error** | `#EF4444` | Error states | `text-red-500`, `bg-red-500` |
| **Warning** | `#F59E0B` | Warning states | `text-amber-500`, `bg-amber-500` |
| **Info** | `#38BDF8` | Informational states | `text-sky-500`, `bg-sky-500` |

---

## Typography

### Font Families

| Usage | Font | Variable | Weights | Tailwind Class |
|-------|------|----------|---------|----------------|
| **Display** | Barlow | `--font-barlow` | 500, 600, 700 | `font-display` |
| **Body/UI** | Inter | `--font-inter` | 400, 500, 600 | `font-sans` |
| **Data/Mono** | JetBrains Mono | `--font-mono` | 400, 500 | `font-mono` |

### Typography Scale

| Element | Size | Weight | Line Height | Usage |
|---------|------|--------|-------------|-------|
| **H1** | 48px | 700 | 1.1 | Page titles |
| **H2** | 36px | 600 | 1.2 | Section headers |
| **H3** | 30px | 600 | 1.3 | Subsection headers |
| **Body** | 16px | 400 | 1.5 | Paragraph text |
| **Small** | 14px | 400 | 1.5 | Secondary text |
| **XS** | 12px | 500 | 1.4 | Labels, captions |

### Typography Rules

✅ **Use `font-display` for:** H1, H2, H3 headings
✅ **Use `font-sans` for:** Body text, UI elements, buttons
✅ **Use `font-mono` for:** VINs, part numbers, prices, phone numbers, technical data

---

## Spacing Scale

RevOS uses a **4px base unit** for spacing:

| Token | Value | Usage |
|-------|-------|-------|
| `gap-1` | 4px | Tightest grouping (icon + text) |
| `gap-2` | 8px | Component internal spacing |
| `gap-3` | 12px | Small gaps |
| `gap-4` | 16px | Standard component spacing |
| `gap-6` | 24px | Container padding (p-6) |
| `gap-8` | 32px | Section separation |
| `gap-12` | 48px | Large section gaps |

---

## Component Patterns

### Primary Button

```tsx
<button className="
  flex items-center justify-center gap-2
  bg-brand hover:bg-brand-hover
  text-graphite-900 font-semibold
  px-6 py-3 rounded-lg
  shadow-glow
  transition-all duration-200 ease-out
  active:scale-[0.98]
">
  <Icon className="w-5 h-5" />
  <span>Button Text</span>
</button>
```

**Rules:**
- Background: `bg-brand` (#CCFF00)
- Text: `text-graphite-900` (#0F172A) - **NEVER white**
- Hover: `bg-brand-hover` (#B2DE00)
- Press: `active:scale-[0.98]`

### Secondary Button

```tsx
<button className="
  px-6 py-3 rounded-lg
  border border-gray-300
  text-gray-700 font-medium
  hover:bg-gray-50
  transition-colors duration-200
">
  Cancel
</button>
```

### Input Field

```tsx
<input
  className="
    w-full px-4 py-3
    text-base bg-white
    border border-gray-300 rounded-lg
    text-gray-900
    placeholder:text-gray-400
    focus:ring-2 focus:ring-brand
    focus:border-transparent
    transition-all duration-200
  "
/>
```

**Rules:**
- Font size: `text-base` (16px) to prevent iOS auto-zoom
- Background: `bg-white`
- Border: `border-gray-300`
- Focus ring: `focus:ring-2 focus:ring-brand` (lime)
- Text: `text-gray-900`

### Card

```tsx
<div className="
  bg-white
  border border-gray-200
  rounded-xl
  p-6 shadow-card
">
  {/* Card content */}
</div>
```

### Error Message

```tsx
<div role="alert" className="
  flex items-start gap-2
  text-sm text-red-500
">
  <AlertCircle className="w-4 h-4 mt-0.5" />
  <span>Error message here</span>
</div>
```

---

## Depth & Elevation

### Box Shadows

| Shadow | CSS | Usage |
|--------|-----|-------|
| `shadow-card` | `0 4px 6px -1px rgba(0, 0, 0, 0.2)` | Cards, panels |
| `shadow-glow` | `0 0 15px rgba(204, 255, 0, 0.3)` | Brand glow effects |

### Elevation Levels

```
Level 0 (Base)
├─ bg-[#CFD0D4] (app background)

Level 1 (Card)
├─ bg-white + border-gray-200 + shadow-card

Level 2 (Elevated)
├─ bg-white + border-gray-300 + shadow-lg

Level 3 (Modal/Overlay)
├─ bg-white + border-gray-400 + shadow-xl
```

---

## Motion & Animation

### Transition Standards

| Property | Value | Usage |
|----------|-------|-------|
| **Duration** | `200ms` | Standard transitions |
| **Easing** | `ease-out` | Hydraulic easing (industrial feel) |
| **Hover** | Scale `1.02` | Subtle hover lift |
| **Press** | Scale `0.98` | Tactile press feedback |

### Standard Transition Class

```tsx
className="transition-all duration-200 ease-out"
```

### Hover Effect

```tsx
className="hover:scale-[1.02] hover:shadow-glow"
```

### Active/Press Effect

```tsx
className="active:scale-[0.98]"
```

---

## Mobile Optimization

### Touch Targets

**Minimum:** 44x44px for all interactive elements

```tsx
<button className="min-h-[44px] min-w-[44px]">
  <Icon className="w-5 h-5" />
</button>
```

### Input Font Size

**Always use `text-base` (16px)** on mobile inputs to prevent iOS auto-zoom:

```tsx
<input className="text-base ..." />  // ✅ Correct
<input className="text-sm ..." />   // ❌ Wrong - causes zoom
```

### Safe Area Support

For iPhone Home bar support:

```tsx
<div className="pb-safe">
  {/* Content */}
</div>
```

Utility classes defined in `globals.css`:
- `.pb-safe` - Bottom safe area
- `.pt-safe` - Top safe area
- `.px-safe` - Horizontal safe areas

---

## Accessibility

### Color Contrast

All text combinations meet **WCAG 2.1 AA** standards (4.5:1 contrast ratio):

- `text-gray-900` on `bg-white` ✅
- `text-gray-700` on `bg-white` ✅
- `text-graphite-900` on `bg-brand` ✅
- `text-teal-500` on `bg-white` ✅

### Focus Styles

Custom focus ring defined in `globals.css`:

```css
*:focus-visible {
  @apply outline-none ring-2 ring-brand ring-offset-2 ring-offset-graphite-900;
}
```

### Keyboard Navigation

All interactive elements must be:
- [ ] Reachable via Tab key
- [ ] Have visible focus states
- [ ] Have proper ARIA attributes
- [ ] Have semantic HTML

### ARIA Attributes

```tsx
// Input with error
<input
  aria-invalid={hasError}
  aria-describedby={hasError ? 'field-error' : undefined}
/>
{hasError && (
  <span id="field-error" role="alert">
    Error message
  </span>
)}

// Icon button
<button
  aria-label="Close modal"
  aria-pressed={isPressed}
>
  <X aria-hidden="true" />
</button>
```

---

## Design Philosophy

### "Grease-Proof Interface"
- High contrast for garage environments
- Large touch targets for gloved hands
- Clear visual hierarchy
- High legibility at a glance

### "Industrial Smoothness"
- Hydraulic easing (ease-out)
- No bouncy springs
- Fast start, smooth stop
- 200ms standard duration

### "Precision Volt"
- Light mode native (clean white cards)
- Lime accent for energy/action
- Professional gray tones
- Subtle glassmorphic effects

---

## DO's and DON'T's

### ✅ DO

- Use `text-graphite-900` on `bg-brand` buttons
- Use `font-display` for H1-H3 headings
- Use `font-mono` for VINs, part numbers, prices
- Use `text-base` (16px) for all input fields
- Use 44x44px minimum touch targets
- Use Teal (`#2DD4BF`) for success states
- Use `transition-all duration-200 ease-out`

### ❌ DON'T

- ❌ Use white text on Lime/Brand backgrounds
- ❌ Use green for success (use Teal)
- ❌ Use pure black (#000000) - use #0F172A
- ❌ Use `text-sm` on mobile inputs (causes zoom)
- ❌ Skip ARIA attributes
- ❌ Use bouncy springs
- ❌ Use bright green/red for status (use Teal/Red-500)

---

## Implementation Files

- **Tailwind Config:** `tailwind.config.ts`
- **Global Styles:** `app/globals.css`
- **Layout:** `app/layout.tsx` (font loading)

---

For component examples and patterns, see: [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
