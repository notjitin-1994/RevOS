# RevvOs - Automotive Garage Management System

RevvOs is a comprehensive **workshop management solution** designed to streamline automotive service operations. Built with Next.js 14, featuring a modern light mode design with graphite accents and lime highlights.

## ✨ Key Features

- 📊 **Dashboard** - Central hub with analytics, quick actions, and AI insights
- 🔧 **Job Cards** - Complete service job tracking from creation to delivery
- 📦 **Inventory Management** - Parts catalog with auto-save and stock tracking
- 🚗 **Vehicle Registry** - Customer vehicle database with service history
- 👥 **Customer Management** - CRM with service history and job card tracking
- 👷 **Employee Management** - Role-based access control (RBAC)
- 📅 **Calendar & Scheduling** - Work slot and activity tracking (coming soon)
- 📧 **Marketing Tools** - Promotional campaigns and customer engagement
- 🔐 **Authentication** - Login ID-based auth with account recovery

## 🎨 Design System

RevvOs uses a **light mode** design system with professional gray tones and lime accents.

### Quick Design Reference

| Element | Color | Tailwind |
|---------|-------|----------|
| **Brand Primary** | `#CCFF00` (Lime) | `bg-brand` |
| **App Background** | `#CFD0D4` (Light Gray) | `bg-[#CFD0D4]` |
| **Card Surface** | `#FFFFFF` (White) | `bg-white` |
| **Text Primary** | `#374151` | `text-gray-700` |
| **Text Heading** | `#111827` | `text-gray-900` |
| **Sidebar Text** | `#0F172A` | `text-graphite-900` |
| **Success** | `#2DD4BF` (Teal) | `text-teal-500` |
| **Error** | `#EF4444` (Red) | `text-red-500` |

### Typography

- **Display Font**: Barlow (H1-H3 headings)
- **UI Font**: Inter (Body text and UI elements)
- **Mono Font**: JetBrains Mono (VINs, part numbers, data)

📖 **For complete design system:** See [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (for database)

### Quick Install

```bash
# Clone the repository
git clone https://github.com/your-org/revos.git
cd revos

# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

📖 **For detailed setup instructions:** See [GETTING_STARTED.md](./GETTING_STARTED.md)

## 📁 Project Structure

```
RevvOs/
├── app/                      # Next.js App Router
│   ├── (auth)/              # Auth routes (future)
│   ├── login/               # Login page
│   ├── dashboard/           # Dashboard hub
│   ├── inventory/           # Inventory management
│   ├── job-cards/           # Job card tracking
│   ├── vehicle-catalog/     # Vehicle registry
│   ├── customer-management/ # Customer CRM
│   ├── employee-management/ # Employee directory
│   ├── calendar/            # Calendar (coming soon)
│   ├── settings/            # Settings
│   ├── layout.tsx           # Root layout with fonts
│   ├── globals.css          # Global styles
│   └── page.tsx             # Home (redirects to login)
│
├── components/              # React components
│   ├── auth/               # Authentication components
│   ├── ui/                 # Reusable UI components
│   ├── dashboard/          # Dashboard components
│   ├── inventory/          # Inventory components
│   └── ...
│
├── lib/                    # Business logic
│   ├── hooks/              # Custom React hooks
│   │   ├── use-auth.ts     # Authentication hook
│   │   └── useFormAutoSave.ts # Auto-save hook
│   ├── schemas/            # Zod validation schemas
│   ├── supabase/           # Supabase queries
│   └── utils.ts            # Utility functions
│
├── app/api/                # API routes
│   ├── employees/          # Employee endpoints
│   ├── inventory/          # Inventory endpoints
│   ├── job-cards/          # Job card endpoints
│   └── ...
│
├── prisma/                 # Database schema
│   ├── schema.prisma       # Prisma schema
│   └── migrations/         # SQL migrations
│
├── docs/                   # Feature documentation
├── design-language/        # Design system docs
├── tests/                  # Test files
│
├── tailwind.config.ts      # Tailwind configuration
├── tsconfig.json           # TypeScript configuration
└── package.json            # Dependencies
```

## 🛠️ Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| **Framework** | Next.js 14 | React framework with App Router |
| **Language** | TypeScript 5+ | Type safety |
| **Styling** | Tailwind CSS | Utility-first CSS |
| **Database** | Supabase (PostgreSQL) | Database, auth, storage |
| **Validation** | Zod | Schema validation |
| **Forms** | React Hook Form | Form management |
| **Animation** | Framer Motion | Smooth animations |
| **Icons** | Lucide React | Icon library |
| **Fonts** | Barlow, Inter, JetBrains Mono | Typography |

## 📚 Documentation

### Core Documentation

| Document | Description |
|----------|-------------|
| **[GETTING_STARTED.md](./GETTING_STARTED.md)** | Setup and installation guide |
| **[FEATURES.md](./FEATURES.md)** | Complete feature list |
| **[DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)** | Design tokens and patterns |
| **[ARCHITECTURE.md](./ARCHITECTURE.md)** | Technical architecture |
| **[DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)** | Complete documentation index |

### Feature Documentation

| Topic | Document |
|-------|----------|
| Auto-Save Feature | [AUTO_SAVE_IMPLEMENTATION.md](./AUTO_SAVE_IMPLEMENTATION.md) |
| Account Recovery | [RECOVERY_FEATURES_SUMMARY.md](./RECOVERY_FEATURES_SUMMARY.md) |
| Job Cards | [docs/JOB_CARDS_IMPLEMENTATION.md](./docs/JOB_CARDS_IMPLEMENTATION.md) |
| Testing | [TESTING_README.md](./TESTING_README.md) |
| Security | [SECURITY_TEST_REPORT.md](./SECURITY_TEST_REPORT.md) |

## 🔐 Authentication

RevvOs uses **Login ID** based authentication (not email).

**Features:**
- ✅ Login ID authentication
- ✅ Password with show/hide toggle
- ✅ "Initialize System" button
- ✅ Forgot Password (3-step OTP flow)
- ✅ Forgot Login ID (email-based recovery)

**See Also:**
- [FORGOT_PASSWORD_IMPLEMENTATION.md](./FORGOT_PASSWORD_IMPLEMENTATION.md)
- [FORGOT_LOGIN_ID_IMPLEMENTATION.md](./FORGOT_LOGIN_ID_IMPLEMENTATION.md)

## 🧪 Testing

The project includes comprehensive security testing:

- **93 test cases** covering validation, security, and edge cases
- **Vitest** as the test runner
- Security analysis for employee creation API

**See:** [TESTING_README.md](./TESTING_README.md)

## 🎨 Design Principles

- **"Grease-Proof Interface"** - High contrast for garage environments
- **"Industrial Smoothness"** - Hydraulic easing (ease-out), no bouncy springs
- **Light Mode Native** - Clean white cards on light gray background
- **Mobile-First** - Minimum touch targets of 44x44px
- **Type Safety** - Full TypeScript coverage

## 📱 Mobile Optimization

- Input font size: `text-base` (16px) to prevent iOS auto-zoom
- Touch targets: Minimum 44x44px
- Safe area support for iPhone Home bar
- Responsive design (mobile cards, desktop tables)
- Tactile feedback with `active:scale-[0.98]`

## ♿ Accessibility

- WCAG 2.1 AA compliant
- Semantic HTML: `<form>`, `<label>`, `<button>`
- ARIA attributes: `aria-invalid`, `aria-describedby`, `aria-pressed`
- Focus states with visible rings
- Keyboard navigation support
- Screen reader compatibility
- High contrast ratios (4.5:1 minimum)

## 🔒 Security

**Implemented:**
- ✅ Input validation with Zod schemas
- ✅ Row Level Security (RLS) in Supabase
- ✅ Garage-level data isolation
- ✅ Role-based access control (RBAC)
- ✅ Password hashing (bcrypt)
- ✅ OTP expiration (5 minutes)

**Known Issues:**
- ⚠️ Employee creation API has vulnerabilities (see [TESTING_README.md](./TESTING_README.md))
- ⚠️ Rate limiting (planned)
- ⚠️ CSRF protection (planned)

## 🚀 Deployment

### Build for Production

```bash
npm run build
npm start
```

### Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_REQUEST_EMAIL=your-email@example.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

### Recommended Platforms

- **Vercel** (recommended for Next.js)
- **Netlify**
- **AWS Amplify**
- **Self-hosted** (Docker)

## 🔧 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm start                # Start production server

# Testing
npm test                 # Run tests in watch mode
npm run test:coverage    # Run tests with coverage

# Database
npx prisma generate      # Generate Prisma client
npx prisma migrate dev    # Run migrations
npx prisma studio        # Open Prisma Studio
```

## 📄 License

Copyright © 2026 RevvOs. All rights reserved.

## 🤝 Contributing

This is a private project. For questions or support, please contact the RevvOs team.

---

**RevvOs** - Automotive Garage Management System
**Version:** 1.0.0
**Last Updated:** January 2026

For complete documentation, see [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)
