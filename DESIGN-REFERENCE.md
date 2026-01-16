# RevOS Design Reference

## Color Palette - "Digital Volt"

### Brand Colors
```
Brand Primary (Lime)
Hex: #CCFF00
Tailwind: bg-brand
Use: Primary CTAs, Active States
Text: text-graphite-900 (#0F172A)

Brand Hover
Hex: #B2DE00
Tailwind: bg-brand-hover
Use: Hover state for primary buttons
Text: text-graphite-900 (#0F172A)
```

### Neutral Colors (Graphite Scale)
```
Graphite-900 (Main Background)
Hex: #0F172A
Tailwind: bg-graphite-900
Use: Global body background

Graphite-800 (Card Surface)
Hex: #1E293B
Tailwind: bg-graphite-800
Use: Cards, panels, modals

Graphite-700 (Elevated Surface)
Hex: #334155
Tailwind: bg-graphite-700
Use: Dropdowns, popovers, dividers

Graphite-600 (Border Strong)
Hex: #475569
Tailwind: border-graphite-600
Use: Input borders, checkboxes

Graphite-400 (Muted Text)
Hex: #94A3B8
Tailwind: text-graphite-400
Use: Secondary text, labels
```

### Status Colors
```
Error
Hex: #EF4444
Tailwind: text-status-error
Use: Critical failures, destructive actions

Warning
Hex: #F59E0B
Tailwind: text-status-warning
Use: Pending actions, low stock alerts

Success (Teal - NOT Green)
Hex: #2DD4BF
Tailwind: text-status-success
Use: Completion, validation, success states

Info
Hex: #38BDF8
Tailwind: text-status-info
Use: Links, help text, information
```

## Typography System

### Display Font - Barlow
```
Use: Headings (H1-H3)
Weights: 500 (Medium), 600 (Semibold), 700 (Bold)
Example:
<h1 className="font-display font-bold text-3xl text-white">
  Page Title
</h1>
```

### UI Font - Inter
```
Use: Body text, UI elements, buttons
Weights: 400 (Regular), 500 (Medium), 600 (Semibold)
Example:
<p className="font-sans text-base text-white">
  Body text goes here
</p>
```

### Data Font - JetBrains Mono
```
Use: VINs, part numbers, prices, IP addresses
Weights: 400 (Regular), 500 (Medium)
Example:
<span className="font-mono text-sm text-white">
  1HGCM82633A004352
</span>
```

## Spacing Scale (4px Grid)

```
gap-1   = 4px   - Tightest grouping (icon + text)
gap-2   = 8px   - Component internal spacing
gap-4   = 16px  - Standard component spacing
gap-6   = 24px  - Container padding (p-6)
gap-8   = 32px  - Section separation
```

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

### Secondary Button
```tsx
<button className="
  px-6 py-3 rounded-lg
  border border-graphite-600
  text-white font-medium
  hover:bg-graphite-800
  transition-colors
">
  Cancel
</button>
```

### Input Field
```tsx
<input
  className="
    w-full px-4 py-3
    text-base bg-graphite-800 text-white
    border border-graphite-600 rounded-lg
    placeholder:text-graphite-400
    focus:ring-2 focus:ring-brand
    transition-all duration-200
  "
  {...register('fieldName')}
/>
```

### Error Message
```tsx
<div role="alert" className="flex items-start gap-2 text-sm text-status-error">
  <svg className="w-4 h-4 mt-0.5" /* AlertCircle icon */ />
  <span>Error message here</span>
</div>
```

### Card
```tsx
<div className="
  bg-graphite-800
  border border-graphite-700
  rounded-xl p-6
  shadow-card
">
  {/* Card content */}
</div>
```

## Status Badge
```tsx
<span className="
  inline-flex items-center px-2.5 py-0.5
  rounded-full text-xs font-medium
  bg-status-success/10
  text-status-success
  border border-status-success/20
">
  <CheckCircle className="w-3 h-3 mr-1" />
  Success
</span>
```

## Mobile Optimization

### Input Font Size
```tsx
// Use text-base (16px) to prevent iOS auto-zoom
<input className="text-base ..." />
```

### Touch Targets
```tsx
// Minimum 44x44px for mobile
<button className="min-h-[44px] min-w-[44px]">
  <Icon className="w-5 h-5" />
</button>
```

### Safe Area
```tsx
// iPhone Home bar support
<div className="pb-safe">
  {/* Content */}
</div>
```

## Accessibility Patterns

### Label + Input
```tsx
<label htmlFor="inputId" className="block text-sm font-medium text-white">
  Label Text
</label>
<input
  id="inputId"
  aria-invalid={error ? 'true' : 'false'}
  aria-describedby={error ? 'inputId-error' : undefined}
/>
{error && (
  <span id="inputId-error" role="alert">
    {error}
  </span>
)}
```

### Icon Button
```tsx
<button
  aria-label="Descriptive label"
  aria-pressed={isPressed}
  className="min-h-[44px] min-w-[44px]"
>
  <Icon aria-hidden="true" />
</button>
```

### Focus Styles
```tsx
// Custom focus ring (already in globals.css)
*:focus-visible {
  @apply outline-none ring-2 ring-brand ring-offset-2 ring-offset-graphite-900;
}
```

## Depth & Elevation

```
Level 0 (Base)
bg-graphite-900
Use: App background

Level 1 (Card)
bg-graphite-800 + border border-graphite-700
Use: Cards, panels

Level 2 (Elevated)
bg-graphite-700 + shadow-card
Use: Modals, dropdowns

Glow Effect
shadow-glow (0 0 15px rgba(204, 255, 0, 0.3))
Use: Active states, primary buttons
```

## Motion & Transitions

### Standard Transition
```tsx
className="transition-all duration-200 ease-out"
```

### Hover Effect
```tsx
className="hover:bg-brand-hover hover:shadow-glow"
```

### Active/Press Effect
```tsx
className="active:scale-[0.98]"
```

### Loading Spinner
```tsx
<svg className="animate-spin h-5 w-5">
  {/* Spinner SVG */}
</svg>
```

## Design Philosophy

### "Grease-Proof Interface"
- High contrast (WCAG AA compliant)
- High legibility
- Large touch targets for garage environments
- Clear visual hierarchy

### "Industrial Smoothness"
- Hydraulic easing (ease-out)
- Fast start, smooth stop
- No bouncy springs
- 200ms standard duration

### "Digital Volt"
- Dark mode native
- Lime accent color for energy/action
- Cool blue-greys for reduced eye strain
- Glow effects for depth

## Quick Reference

### DO's
✅ Use text-graphite-900 on bg-brand
✅ Use font-display for H1-H3
✅ Use font-mono for VINs/part numbers
✅ Use text-base (16px) for inputs
✅ Use Teal for success states
✅ Use 44x44px minimum touch targets

### DON'Ts
❌ Use white text on Lime backgrounds
❌ Use green for success (use Teal)
❌ Use pure black (#000000)
❌ Use font-sans for headings
❌ Use text-sm on mobile inputs (causes zoom)
❌ Skip ARIA attributes

## Component Examples

### Login Form Structure
```tsx
<div className="bg-graphite-800 border border-graphite-700 rounded-xl p-6">
  {/* Logo/Brand */}
  {/* Form */}
  {/* Submit Button */}
</div>
```

### Input with Error
```tsx
<div className="space-y-2">
  <label>Label</label>
  <input aria-invalid={error} />
  {error && <div role="alert">{error}</div>}
</div>
```

### Password Input with Toggle
```tsx
<div className="relative">
  <input type={show ? 'text' : 'password'} />
  <button
    aria-label={show ? 'Hide' : 'Show'}
    aria-pressed={show}
    onClick={toggle}
  >
    {show ? <EyeOff /> : <Eye />}
  </button>
</div>
```

This reference guide provides all the essential design tokens and patterns for building consistent, on-brand UI components in RevOS.
