# RevOS - Automotive SaaS Platform

RevOS is a modern **light mode** Automotive SaaS application built with Next.js 14, featuring the "Precision Volt" design system.

## 🎨 Design System

### Color Palette - "Precision Volt" (Light Mode)

#### Brand Colors
- **Brand Primary**: `#CCFF00` (Lime) - Sidebar background, accent elements
- **Brand Hover**: `#B2DE00` - Hover state for sidebar and interactive elements

#### Background Colors
- **App Background**: `#ecf0f5` (Light gray-blue) - Main application background
- **Settings Background**: `#dfe5ef` - Settings page background
- **Card Surface**: `#FFFFFF` (White) - Data cards and panels
- **Icon Container**: `#F3F4F6` (Gray-100) - Icon backgrounds

#### Text Colors
- **Heading**: `#111827` (Gray-900) - Main headings
- **Primary Text**: `#374151` (Gray-700) - Body text, icons
- **Secondary Text**: `#4B5563` (Gray-600) - Labels, descriptions
- **Muted Text**: `#9CA3AF` (Gray-400) - Placeholder, disabled text
- **Sidebar Text**: `#0F172A` (Graphite-900) - Sidebar icons and labels

#### Border Colors
- **Border Subtle**: `#E5E7EB` (Gray-200) - Card borders, dividers
- **Border Default**: `#D1D5DB` (Gray-300) - Input fields
- **Border Medium**: `#9CA3AF` (Gray-400) - Focus states
- **Border Strong**: `#4B5563` (Gray-600) - Emphasized dividers

#### Status Colors
- **Status Success**: `#2DD4BF` (Teal) - Success states
- **Status Error**: `#EF4444` (Red) - Error states
- **Status Warning**: `#F59E0B` (Orange) - Warning states
- **Status Info**: `#38BDF8` (Blue) - Informational states

### Typography

- **Display Font**: Barlow (for headings H1-H3)
- **UI Font**: Inter (for body text and UI elements)
- **Mono Font**: JetBrains Mono (for VINs, part numbers, and data)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

1. Install dependencies:
```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Run the development server:
```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

## 📁 Project Structure

```
RevOS/
├── app/                      # Next.js App Router
│   ├── login/               # Login page
│   │   └── page.tsx         # Login page component
│   ├── layout.tsx           # Root layout with fonts
│   ├── globals.css          # Global styles and Tailwind directives
│   └── page.tsx             # Home page (redirects to login)
├── components/              # React components
│   └── auth/               # Authentication components
│       ├── login-form.tsx  # Main login form component
│       ├── password-input.tsx # Reusable password input
│       └── login-logo.tsx  # Brand/logo header
├── lib/                     # Utility functions and hooks
│   ├── schemas/            # Zod validation schemas
│   │   └── login.ts        # Login form schema
│   └── hooks/              # Custom React hooks
│       └── use-auth.ts     # Authentication hook
├── public/                  # Static assets
├── tailwind.config.ts      # Tailwind CSS configuration
├── tsconfig.json           # TypeScript configuration
├── next.config.js          # Next.js configuration
└── package.json            # Dependencies and scripts
```

## 🎯 Features

### Login Page

- ✅ **Login ID Input** (not email) - Text input with alphanumeric validation
- ✅ **Password Input** - With show/hide toggle
- ✅ **Form Validation** - Using Zod schema and React Hook Form
- ✅ **Accessibility** - WCAG 2.1 AA compliant (ARIA attributes, keyboard navigation)
- ✅ **Mobile Responsive** - Optimized for all screen sizes
- ✅ **Dark Mode** - Native dark mode with "Digital Volt" color scheme
- ✅ **Security** - Proper autocomplete attributes and input types
- ✅ **Loading States** - Visual feedback during authentication
- ✅ **Error Handling** - Clear validation and API error messages

### Design Principles

- **"Grease-Proof Interface"** - High contrast, high legibility for garage environments
- **"Industrial Smoothness"** - Hydraulic easing (ease-out), no bouncy springs
- **Light Mode Native** - Clean white cards on light gray-blue background with brand accent lime sidebar
- **Mobile-First** - Minimum touch targets of 44x44px
- **Type Safety** - Full TypeScript coverage

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Form Management**: React Hook Form
- **Validation**: Zod
- **Icons**: Lucide React
- **Fonts**: Barlow (Display), Inter (UI), JetBrains Mono (Data)

## 📝 Component Documentation

### LoginForm

Main login form component with validation and error handling.

```tsx
import { LoginForm } from '@/components/auth/login-form'

<LoginForm />
```

### PasswordInput

Reusable password input with show/hide toggle.

```tsx
import { PasswordInput } from '@/components/auth/password-input'

<PasswordInput
  id="password"
  name="password"
  label="Password"
  placeholder="Enter your password"
  register={register('password')}
  error={errors.password?.message}
/>
```

### LoginLogo

Brand header component with logo and welcome message.

```tsx
import { LoginLogo } from '@/components/auth/login-logo'

<LoginLogo />
```

## 🔐 Authentication

The `useAuth` hook provides authentication functionality:

```tsx
import { useAuth } from '@/lib/hooks/use-auth'

const { login, isLoading, error } = useAuth()

await login({ loginId: 'user123', password: 'password' })
```

## 🎨 Customization

### Colors

Edit `tailwind.config.ts` to customize the color palette:

```typescript
colors: {
  brand: {
    DEFAULT: '#CCFF00',    // Lime (sidebar background)
    hover: '#B2DE00',      // Hover state
  },
  graphite: {
    900: '#0F172A',        // Darkest text, sidebar icons
    700: '#334155',        // Borders (rare)
    600: '#475569',        // Muted text
    400: '#94A3B8',        // Light muted
  },
  gray: {
    900: '#111827',        // Headings, primary text
    700: '#374151',        // Body text, icons
    600: '#4B5563',        // Secondary text, labels
    400: '#9CA3AF',        // Muted text, placeholders
    200: '#E5E7EB',        // Card borders, dividers
    100: '#F3F4F6',        // Icon containers, light backgrounds
  },
  status: {
    success: '#2DD4BF',    // Positive states
    error: '#EF4444',      // Error states
    warning: '#F59E0B',    // Warning states
    info: '#38BDF8',       // Informational states
  },
}
```

### Light Mode Background

Edit `app/globals.css` to change the main app background:

```css
body {
  @apply bg-[#ecf0f5];  /* Light gray-blue */
}
```

### Fonts

Edit `app/layout.tsx` to customize font loading:

```typescript
const barlow = Barlow({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-barlow',
})
```

## 📱 Mobile Optimization

- Input font size: `text-base` (16px) to prevent iOS auto-zoom
- Touch targets: Minimum 44x44px
- Safe area support for iPhone Home bar
- Tactile feedback with `active:scale-[0.98]`

## ♿ Accessibility

- Semantic HTML: `<form>`, `<label>`, `<button>`
- ARIA attributes: `aria-invalid`, `aria-describedby`, `aria-pressed`, `aria-label`
- Focus states: `focus:ring-2 focus:ring-brand focus:ring-offset-2 focus:ring-offset-graphite-900`
- Keyboard navigation: All elements reachable via Tab
- Screen reader support: Proper role attributes and labels
- WCAG 2.1 AA compliant contrast ratios
- Minimum touch targets: 44x44px for mobile accessibility

## 🔒 Security Considerations

- `autocomplete="username"` on Login ID field
- `autocomplete="current-password"` on password field
- `type="password"` for password input
- Passwords never logged or exposed
- Input validation with Zod schemas
- XSS protection via React's built-in escaping

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create a `.env.local` file:

```env
# Add your environment variables here
NEXT_PUBLIC_API_URL=https://api.example.com
```

## 📄 License

Copyright © 2025 RevOS. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or support, please contact the RevOS team.
