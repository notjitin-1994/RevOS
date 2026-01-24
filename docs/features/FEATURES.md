# RevvOS Features

Complete feature list for the RevvOS Automotive Garage Management System.

> **Last Updated:** January 2026
> **Version:** 1.0

---

## Table of Contents

1. [Core Modules](#core-modules)
2. [Authentication & Security](#authentication--security)
3. [Inventory Management](#inventory-management)
4. [Job Cards](#job-cards)
5. [Vehicle Management](#vehicle-management)
6. [Customer Management](#customer-management)
7. [Employee Management](#employee-management)
8. [Dashboard & Analytics](#dashboard--analytics)
9. [Calendar & Scheduling](#calendar--scheduling)
10. [Marketing Tools](#marketing-tools)
11. [Coming Soon](#coming-soon)

---

## Core Modules

### 1. Dashboard (`/dashboard`)

**The central hub** for all garage operations with:

- **Quick Actions:** One-click access to create jobs, customers, vehicles, parts
- **Stats Overview:** Active jobs, revenue (MTD), total customers, low stock alerts
- **Today's Schedule:** Upcoming appointments and job queue
- **Data Analytics:** Revenue charts, service distribution
- **AI Insights:** Intelligent recommendations for optimization
- **Marketing Center:** Promotional campaigns and customer engagement

**Navigation:**
- Desktop: Animated collapsible sidebar
- Mobile: Horizontally scrollable bottom navbar

---

## Authentication & Security

### Login System (`/login`)

**Features:**
- ✅ Login ID authentication (not email-based)
- ✅ Password with show/hide toggle
- ✅ "Initialize System" button (custom branding)
- ✅ Form validation with Zod
- ✅ Split layout: Login form + System diagnostic panel
- ✅ Glassmorphic design with graphite accents
- ✅ Mobile-optimized with safe area support
- ✅ WCAG 2.1 AA compliant accessibility

**Recovery Features:**
- ✅ **Forgot Password** - 3-step OTP-based password reset
  - Step 1: Request reset (enter login ID)
  - Step 2: Verify OTP (6-digit code sent to email)
  - Step 3: Create new password
- ✅ **Forgot Login ID** - Email-based login ID retrieval

**Security:**
- Autocomplete attributes for password managers
- Proper input types (`type="password"`)
- Client-side validation with Zod schemas
- Password strength requirements
- OTP expiration (5 minutes)

**See Also:**
- [FORGOT_PASSWORD_IMPLEMENTATION.md](./FORGOT_PASSWORD_IMPLEMENTATION.md)
- [FORGOT_LOGIN_ID_IMPLEMENTATION.md](./FORGOT_LOGIN_ID_IMPLEMENTATION.md)
- [RECOVERY_FEATURES_SUMMARY.md](./RECOVERY_FEATURES_SUMMARY.md)

---

## Inventory Management

### Parts Catalog (`/inventory`)

**Features:**
- ✅ List all parts with search and filters
- ✅ Part detail pages with comprehensive information
- ✅ 8-tab "Add Part" form with auto-save
- ✅ Stock tracking (on-hand, warehouse, low-stock alerts)
- ✅ Pricing management (purchase, selling, wholesale prices)
- ✅ Make/Model compatibility tracking
- ✅ Vendor/supplier management
- ✅ Batch/lot tracking
- ✅ Warranty periods
- ✅ Technical diagrams and installation instructions

**Auto-Save Feature:**
- ✅ Silent background auto-save (2-second debounce)
- ✅ localStorage persistence across sessions
- ✅ Automatic restoration on page load
- ✅ Draft cleanup after successful submission
- ✅ Reusable hook for other forms

**See Also:**
- [AUTO_SAVE_IMPLEMENTATION.md](./AUTO_SAVE_IMPLEMENTATION.md)
- [docs/PART_DATA_FIELDS_REFERENCE.md](./docs/PART_DATA_FIELDS_REFERENCE.md)

**API Endpoints:**
- `POST /api/inventory/add` - Add new part
- `GET /api/inventory/list` - List all parts
- `GET /api/inventory/part/[id]` - Get part details

---

## Job Cards

### Job Card Management (`/job-cards`)

**Status:** ✅ Phase 1 Complete (List + Create)

**Implemented Features:**
- ✅ Job cards list page with search, filters, pagination
- ✅ Status badges (Draft, Queued, In Progress, Parts Waiting, Quality Check, Ready, Delivered)
- ✅ Priority levels (Urgent, High, Medium, Low)
- ✅ Progress bars showing checklist completion
- ✅ Mechanic assignment
- ✅ Customer and vehicle information display
- ✅ Mobile-responsive (cards on mobile, table on desktop)

**Database Schema:**
- `job_cards` - Main job card table
- `job_card_checklist_items` - Checklist with time tracking
- `job_card_time_entries` - Detailed time logs
- `job_card_parts` - Parts allocation and usage
- `job_card_attachments` - Photos and documents
- `job_card_comments` - Communication thread
- `job_card_status_history` - Audit trail
- `mechanic_daily_metrics` - Productivity tracking

**Features in Development:**
- ⏳ Job card detail page with tabbed interface
- ⏳ Real-time timer controls
- ⏳ Parts allocation UI
- ⏳ Status history timeline
- ⏳ Comments thread

**See Also:**
- [docs/JOB_CARDS_IMPLEMENTATION.md](./docs/JOB_CARDS_IMPLEMENTATION.md)

**API Endpoints:**
- `GET /api/job-cards/list` - List job cards
- `POST /api/job-cards/create` - Create job card
- `GET /api/job-cards/[id]` - Get job card details
- `PATCH /api/job-cards/[id]` - Update status
- `POST /api/checklist/[id]/start` - Start timer
- `POST /api/checklist/[id]/stop` - Stop timer

---

## Vehicle Management

### Vehicle Registry (`/vehicles`, `/vehicle-catalog`)

**Features:**
- ✅ Vehicle catalog with make/model/year
- ✅ Add new vehicles to registry
- ✅ Vehicle detail pages
- ✅ Engine number and VIN tracking
- ✅ Customer-to-vehicle associations
- ✅ Service history per vehicle

**Service Scope Management:**
- Make (manufacturer): Honda, Yamaha, Kawasaki, etc.
- Model linked to make: CBR650R, MT-07, Ninja 400, etc.
- Year ranges for each model

**Request Feature:**
- ✅ Users can request new makes/models to be added
- ✅ Modal-based form with email submission
- ✅ 3-step form: Your Info → Make/Model Info → Additional Notes

**See Also:**
- [docs/IMPLEMENTATION_SUMMARY_REQUEST_MODAL.md](./docs/IMPLEMENTATION_SUMMARY_REQUEST_MODAL.md)
- [docs/REQUEST_MAKE_MODEL_FEATURE.md](./docs/REQUEST_MAKE_MODEL_FEATURE.md)

---

## Customer Management

### Customer CRM (`/customer-management`)

**Features:**
- ✅ Customer list with search
- ✅ Add new customers
- ✅ Customer profile pages
- ✅ Personal details: Name, phone, email, address
- ✅ Vehicle associations (one-to-many)
- ✅ Service history per customer
- ✅ Job card history linked to customer

**Service History:**
- Labor history: Services performed
- Parts history: Components replaced
- Chronological job card log

---

## Employee Management

### Employee Directory (`/employee-management`)

**Features:**
- ✅ Employee list with search
- ✅ Add new employees
- ✅ Employee profile pages
- ✅ Role-based access control (RBAC)

**Roles & Permissions:**

| Role | Access Level | Permissions |
|------|--------------|-------------|
| **Owner** | Super Admin | Full access to all modules, financial reports, employee management |
| **Admin** | Managerial | Manage inventory, scheduling, customers, job cards. No delete financial history |
| **Mechanic** | Operational | Assigned job cards, calendar (view), inventory (view/request) |
| **Customer** | Client Portal | Own bike profile, service history, job card status (read-only) |

**Security:**
- ✅ Comprehensive security testing completed (93 test cases)
- ⚠️ Critical vulnerabilities identified in employee creation API
- ✅ Secure implementation provided (`route.secure.ts`)
- See: [TESTING_README.md](./TESTING_README.md)

**API Endpoints:**
- `POST /api/employees` - Create employee
- `GET /api/employees/list` - List employees

---

## Dashboard & Analytics

### Analytics Dashboard

**Features:**
- ✅ Revenue overview with charts
- ✅ Service distribution breakdown
- ✅ Active jobs count
- ✅ Total customers
- ✅ Low stock alerts
- ✅ AI-powered insights:
  - Peak hours identification
  - Low stock warnings
  - Revenue growth tracking
  - Customer retention metrics

---

## Calendar & Scheduling

### Calendar (`/calendar`)

**Features:**
- ⏳ Employee scheduler
- ⏳ Work slot tracking
- ⏳ Activity/task assignment
- ⏳ Time tracking for efficiency analysis

**Planned Features:**
- Shift management
- Bay allocation
- Mechanic availability tracking

---

## Marketing Tools

### Marketing Center (`/marketing`)

**Features:**
- ✅ Promotional SMS/Email campaigns
- ✅ Service reminders & follow-ups
- ✅ Customer loyalty programs
- ✅ Campaign management dashboard

---

## Coming Soon

### Planned Features

- ⏳ **Analytics Dashboard** - Full business intelligence suite
- ⏳ **Advanced Scheduling** - Bay allocation, mechanic optimization
- ⏳ **Invoicing System** - Auto-generate invoices from job cards
- ⏳ **Payment Processing** - Integrated payment gateway
- ⏳ **Customer Portal** - Self-service for customers
- ⏳ **Mobile App** - Native iOS/Android apps
- ⏳ **Reports** - PDF export for job cards, invoices, reports
- ⏳ **Integrations** - Accounting software, parts suppliers

---

## Feature Request

Have a feature request or suggestion? Please:

1. Check existing [GitHub Issues](https://github.com/your-repo/issues)
2. Create a new issue with the `feature-request` label
3. Describe the use case and expected behavior

---

## Documentation Index

For detailed implementation guides, see:

- **Design System:** [DESIGN_SYSTEM.md](./DESIGN_SYSTEM.md)
- **Getting Started:** [GETTING_STARTED.md](./GETTING_STARTED.md)
- **Architecture:** [ARCHITECTURE.md](./ARCHITECTURE.md)
- **Documentation Index:** [DOCUMENTATION_INDEX.md](./DOCUMENTATION_INDEX.md)

For feature-specific documentation:
- **Auto-Save:** [AUTO_SAVE_IMPLEMENTATION.md](./AUTO_SAVE_IMPLEMENTATION.md)
- **Recovery Features:** [RECOVERY_FEATURES_SUMMARY.md](./RECOVERY_FEATURES_SUMMARY.md)
- **Job Cards:** [docs/JOB_CARDS_IMPLEMENTATION.md](./docs/JOB_CARDS_IMPLEMENTATION.md)
- **Testing:** [TESTING_README.md](./TESTING_README.md)

---

**RevvOS** - Automotive Garage Management System
**Version:** 1.0.0
**Last Updated:** January 2026
