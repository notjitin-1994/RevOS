# RevOS - Quick Reference Card

## 🚀 Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

## 🎨 Design System - Digital Volt

### Colors
```tsx
// Brand (Lime)
bg-brand          // #CCFF00 - Primary CTAs
bg-brand-hover    // #B2DE00 - Hover state
text-graphite-900 // #0F172A - Text on brand

// Graphite (Backgrounds)
bg-graphite-900   // #0F172A - Main background
bg-graphite-800   // #1E293B - Cards
border-graphite-700 // #334155 - Borders
border-graphite-600 // #475569 - Input borders

// Status
text-status-error   // #EF4444 - Red
text-status-success // #2DD4BF - Teal (NOT green)
text-status-warning // #F59E0B - Amber
text-status-info    // #38BDF8 - Blue
```

### Typography
```tsx
font-display // Barlow - Headings (H1-H3)
font-sans    // Inter - UI text
font-mono    // JetBrains Mono - Data (VINs, prices)
```

### Key Rules
- ✅ Text on brand buttons: `text-graphite-900`
- ✅ Success color: Teal (#2DD4BF), never green
- ✅ No pure black (#000000), use #0F172A
- ✅ Inputs: `text-base` (16px) to prevent iOS zoom

## 📁 File Locations

```
app/login/page.tsx              # Login page
components/auth/login-form.tsx  # Main form
components/auth/password-input.tsx  # Password input
components/auth/login-logo.tsx  # Brand header
lib/schemas/login.ts            # Zod schema
lib/hooks/use-auth.ts           # Auth hook
```

## 🔐 Login Form Features

- **Login ID** (not Email): `type="text"`, alphanumeric
- **Password**: Show/hide toggle, autocomplete
- **Button**: "Initialize System" (not "Sign in")
- **No**: Social login, signup link
- **Yes**: Mobile responsive, accessible, secure

## 🎯 Common Patterns

### Primary Button
```tsx
<button className="
  bg-brand hover:bg-brand-hover
  text-graphite-900 font-semibold
  px-6 py-3 rounded-lg
  shadow-glow
  transition-all duration-200 ease-out
">
  Initialize System
</button>
```

### Input Field
```tsx
<input
  className="
    w-full px-4 py-3 text-base
    bg-graphite-800 text-white
    border border-graphite-600 rounded-lg
    focus:ring-2 focus:ring-brand
    transition-all duration-200
  "
/>
```

### Card
```tsx
<div className="
  bg-graphite-800
  border border-graphite-700
  rounded-xl p-6 md:p-8
  shadow-card
">
  {/* Content */}
</div>
```

### Error Message
```tsx
<div role="alert" className="flex items-start gap-2 text-sm text-status-error">
  <svg className="w-4 h-4">{/* AlertCircle */}</svg>
  <span>Error message</span>
</div>
```

## ♿ Accessibility Requirements

- ✅ Semantic HTML (`<form>`, `<label>`, `<button>`)
- ✅ ARIA attributes (`aria-invalid`, `aria-describedby`)
- ✅ Focus rings (`focus:ring-2 focus:ring-brand`)
- ✅ Keyboard navigation (Tab through all elements)
- ✅ Screen reader support (proper labels and roles)

## 📱 Mobile Requirements

- ✅ Input font size: `text-base` (16px)
- ✅ Touch targets: Minimum 44x44px
- ✅ Safe area: `pb-safe` for iPhone Home bar
- ✅ Active states: `active:scale-[0.98]`

## 🔒 Security Requirements

- ✅ Login ID: `autocomplete="username"`
- ✅ Password: `autocomplete="current-password"`
- ✅ Password: `type="password"`
- ✅ Never log passwords
- ✅ Validate with Zod schema

## 🎨 Spacing Scale

```
gap-1 = 4px  - Icon + text
gap-2 = 8px  - Component internal
gap-4 = 16px - Standard spacing
gap-6 = 24px - Container padding
gap-8 = 32px - Section separation
```

## ✅ Verification Checklist

Before deploying, verify:
- [ ] Button says "Initialize System"
- [ ] Uses "Login ID" (not "Email")
- [ ] Password toggle works
- [ ] No social login/signup
- [ ] Mobile responsive
- [ ] Dark mode only
- [ ] Accessibility works
- [ ] TypeScript no errors

## 📚 Documentation

- **README.md** - Complete project documentation
- **SETUP.md** - Setup and troubleshooting
- **IMPLEMENTATION.md** - Implementation details
- **DESIGN-REFERENCE.md** - Design system guide
- **VERIFICATION.md** - Full verification checklist
- **PROJECT-SUMMARY.md** - Complete summary

## 🐛 Troubleshooting

### Port already in use
```bash
npm run dev -- -p 3001
```

### Module not found
```bash
rm -rf node_modules package-lock.json
npm install
```

### TypeScript errors
```bash
npm list typescript  # Should be 5+
```

### Tailwind not working
```bash
# Restart dev server
# Ctrl+C, then npm run dev
```

## 🎯 Quality Gates

- [ ] No TypeScript errors
- [ ] No console warnings
- [ ] All requirements met
- [ ] Accessibility verified
- [ ] Mobile tested
- [ ] Design system followed

## 📞 Support

For detailed information, see:
- Design system: DESIGN-REFERENCE.md
- Implementation: IMPLEMENTATION.md
- Verification: VERIFICATION.md

---

**RevOS - Automotive SaaS Platform**
**Design System: Digital Volt**
**Status: Production Ready**
