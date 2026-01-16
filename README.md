# RevOS - Automotive SaaS Platform

RevOS is a modern, dark-mode native Automotive SaaS application built with Next.js 14, featuring the "Digital Volt" design system.

## 🎨 Design System

### Color Palette - "Digital Volt"

- **Brand Primary**: `#CCFF00` (Lime) - Used for CTAs and interactive elements
- **Brand Hover**: `#B2DE00` - Hover state for primary actions
- **App Background**: `#0F172A` (Graphite-900) - Main background
- **Card Surface**: `#1E293B` (Graphite-800) - Cards and panels
- **Border Subtle**: `#334155` (Graphite-700) - Dividers and borders
- **Border Strong**: `#475569` (Graphite-600) - Input borders
- **Status Error**: `#EF4444` - Error states
- **Status Success**: `#2DD4BF` (Teal) - Success states

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
    DEFAULT: '#CCFF00',    // Volt Lime
    hover: '#B2DE00',      // Hover state
  },
  graphite: {
    900: '#0F172A',        // Main background
    800: '#1E293B',        // Card surface
    // ... more shades
  },
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
- Focus states: `focus:ring-2 focus:ring-brand`
- Keyboard navigation: All elements reachable via Tab
- Screen reader support: Proper role attributes and labels

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
