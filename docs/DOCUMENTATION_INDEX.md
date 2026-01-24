# RevvOS Documentation Index

Complete index of all RevvOS documentation.

> **Last Updated:** January 2026
> **Documentation Structure:** Organized by purpose (guides, features, testing, planning, design)

---

## 📚 Quick Start

| Document | Description | For |
|----------|-------------|-----|
| **[../README.md](../README.md)** | Project overview and quick start | Everyone |
| **[guides/GETTING_STARTED.md](./guides/GETTING_STARTED.md)** | Setup and installation guide | New developers |
| **[features/FEATURES.md](./features/FEATURES.md)** | Complete feature list | Everyone |
| **[design/DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md)** | Design tokens and patterns | Designers, Developers |
| **[guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md)** | Technical architecture | Developers |

---

## 🎨 Design Documentation

### Core Design Documents

| Document | Description |
|----------|-------------|
| **[design/DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md)** | Complete design system reference with colors, typography, spacing, and component patterns |

### Design Language Files

Located in `/docs/design/` directory:

| File | Description |
|------|-------------|
| `color-design.txt` | Color philosophy and palette |
| `typography-design.txt` | Typography system and font usage |
| `mobile-style.txt` | Mobile design patterns |
| `style-guide.txt` | General style guidelines |
| `iconography-design.txt` | Icon system and usage |

### Dashboard Design

| File | Description |
|------|-------------|
| `features/DASHBOARD_COLOR_CHANGES.md` | Dashboard color implementation notes |
| `features/DASHBOARD_COLOR_MAPPING.md` | Color mapping reference |

---

## 🚀 Feature Documentation

### Authentication & Security

| Document | Description |
|----------|-------------|
| **[features/RECOVERY_FEATURES_SUMMARY.md](./features/RECOVERY_FEATURES_SUMMARY.md)** | Overview of forgot password and login ID recovery |
| **[features/FORGOT_PASSWORD_IMPLEMENTATION.md](./features/FORGOT_PASSWORD_IMPLEMENTATION.md)** | Complete forgot password technical guide |
| **[features/FORGOT_PASSWORD_QUICK_GUIDE.md](./features/FORGOT_PASSWORD_QUICK_GUIDE.md)** | Quick reference for forgot password |
| **[features/FORGOT_LOGIN_ID_IMPLEMENTATION.md](./features/FORGOT_LOGIN_ID_IMPLEMENTATION.md)** | Complete forgot login ID technical guide |
| **[features/FORGOT_LOGIN_ID_QUICK_GUIDE.md](./features/FORGOT_LOGIN_ID_QUICK_GUIDE.md)** | Quick reference for forgot login ID |

### Inventory & Parts

| Document | Description |
|----------|-------------|
| **[features/AUTO_SAVE_IMPLEMENTATION.md](./features/AUTO_SAVE_IMPLEMENTATION.md)** | Auto-save feature technical guide |
| **[features/AUTO_SAVE_QUICK_GUIDE.md](./features/AUTO_SAVE_QUICK_GUIDE.md)** | Auto-save quick reference |
| **[features/PARTS-MANAGEMENT-IMPLEMENTATION.md](./features/PARTS-MANAGEMENT-IMPLEMENTATION.md)** | Parts management implementation |
| **[features/PARTS-API-QUICK-REFERENCE.md](./features/PARTS-API-QUICK-REFERENCE.md)** | Parts API reference |
| `../docs/PART_DATA_FIELDS_REFERENCE.md` | Complete part data field definitions |
| `../docs/PART_DETAILS_PAGE_REDESIGN.md` | Part details page design notes |
| `../docs/PART_DETAILS_TABS_GUIDE.md` | Part details tabs implementation guide |

### Job Cards

| Document | Description |
|----------|-------------|
| **[features/GANTT_CALENDAR_IMPLEMENTATION.md](./features/GANTT_CALENDAR_IMPLEMENTATION.md)** | Gantt calendar implementation |
| **[features/JOB_CARD_DATA_COLLECTION_SUMMARY.md](./features/JOB_CARD_DATA_COLLECTION_SUMMARY.md)** | Job card data structure |
| `../docs/JOB_CARDS_IMPLEMENTATION.md` | Complete job cards system guide |
| `../docs/JOB_CARDS_TESTING_GUIDE.md` | Job cards testing checklist |

### Vehicles & Service Scope

| Document | Description |
|----------|-------------|
| `../docs/IMPLEMENTATION_SUMMARY_REQUEST_MODAL.md` | Request make/model modal guide |
| `../docs/REQUEST_MAKE_MODEL_FEATURE.md` | Make/model request feature specs |
| `../docs/VEHICLE_REGISTRY_SUMMARY.md` | Vehicle registry overview |
| `../docs/vehicle-registry-integration-analysis.md` | Vehicle registry technical analysis |

### Other Features

| Document | Description |
|----------|-------------|
| `../docs/SMART_DROPDOWN_SORTING.md` | Smart sorting implementation |
| `planning/RevOS-features.md` | Original feature specifications document |

---

## 🧪 Testing & Security

### Security Documentation

| Document | Description |
|----------|-------------|
| **[testing/TESTING_README.md](./testing/TESTING_README.md)** | Employee API testing overview |
| **[testing/SECURITY_TEST_REPORT.md](./testing/SECURITY_TEST_REPORT.md)** | Comprehensive security analysis |
| **[testing/SECURITY_CHECKLIST.md](./testing/SECURITY_CHECKLIST.md)** | Pre-deployment security checklist |
| **[testing/TEST_CASES_SUMMARY.md](./testing/TEST_CASES_SUMMARY.md)** | Detailed test case results |
| **[testing/VERIFICATION.md](./testing/VERIFICATION.md)** | Verification checklist |

### Bug Fixes

| Document | Description |
|----------|-------------|
| `testing/EMPLOYEE_VISIBILITY_FIX.md` | Employee visibility bug fix notes |
| `testing/STOCK_STATUS_FIX_INSTRUCTIONS.md` | Stock status fix instructions |

---

## 📂 Documentation Directory Structure

The `/docs/` directory contains detailed feature documentation organized by purpose:

```
docs/
├── guides/                    # Setup and technical guides
│   ├── GETTING_STARTED.md
│   └── ARCHITECTURE.md
│
├── features/                  # Feature implementation docs
│   ├── FEATURES.md
│   ├── AUTO_SAVE_*.md
│   ├── FORGOT_*.md
│   ├── RECOVERY_FEATURES_SUMMARY.md
│   ├── PARTS-*.md
│   ├── GANTT_CALENDAR_IMPLEMENTATION.md
│   ├── JOB_CARD_DATA_COLLECTION_SUMMARY.md
│   ├── DASHBOARD_*.md
│   └── ...
│
├── testing/                   # Testing and security docs
│   ├── TESTING_README.md
│   ├── SECURITY_TEST_REPORT.md
│   ├── SECURITY_CHECKLIST.md
│   ├── TEST_CASES_SUMMARY.md
│   ├── VERIFICATION.md
│   └── ...
│
├── planning/                  # Implementation planning docs
│   ├── RevOS-features.md
│   ├── implementation-plan.md
│   ├── IMPLEMENTATION-SUMMARY.md
│   ├── roadmap.md
│   ├── ROADMAP-performance-optimization.md
│   └── PHASE_*.md (legacy phase documentation)
│
└── design/                    # Design system documentation
    ├── DESIGN_SYSTEM.md
    ├── color-design.txt
    ├── typography-design.txt
    ├── mobile-style.txt
    ├── style-guide.txt
    └── iconography-design.txt
```

---

## 🗂️ File Organization

### Root Level Files (Minimal)

**Essential Files Only:**
- `README.md` - Project overview
- `CLAUDE.md` - AI assistant configuration
- `.env.local.example` - Environment template
- Configuration files: `package.json`, `next.config.js`, `tailwind.config.ts`, `tsconfig.json`

### Database Organization

```
database/
├── migrations/                # Database migrations (from prisma)
└── scripts/                   # SQL utility scripts
    ├── change-password-fix.sql
    ├── fix-*.sql
    ├── check-*.sql
    ├── debug-*.sql
    └── seed-*.sql
```

---

## 📖 Reading Guides

### For New Developers

**Start here:**
1. [../README.md](../README.md) - Project overview
2. [guides/GETTING_STARTED.md](./guides/GETTING_STARTED.md) - Setup instructions
3. [features/FEATURES.md](./features/FEATURES.md) - What the app does
4. [guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md) - How it's built

**Then:**
- [design/DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md) - Design patterns
- Feature-specific docs as needed

### For Designers

**Start here:**
1. [design/DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md) - Complete design system
2. `design/` directory - Design philosophy

**Then:**
- Feature documentation for specific UI patterns

### For Frontend Developers

**Start here:**
1. [guides/GETTING_STARTED.md](./guides/GETTING_STARTED.md) - Setup
2. [guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md) - Technical overview
3. [design/DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md) - Component patterns

**Then:**
- Feature implementation docs:
  - [features/AUTO_SAVE_IMPLEMENTATION.md](./features/AUTO_SAVE_IMPLEMENTATION.md)
  - [../docs/JOB_CARDS_IMPLEMENTATION.md](../docs/JOB_CARDS_IMPLEMENTATION.md)
  - [features/FORGOT_PASSWORD_IMPLEMENTATION.md](./features/FORGOT_PASSWORD_IMPLEMENTATION.md)

### For Backend Developers

**Start here:**
1. [guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md) - Data layer and API
2. [testing/TESTING_README.md](./testing/TESTING_README.md) - Security considerations
3. [testing/SECURITY_TEST_REPORT.md](./testing/SECURITY_TEST_REPORT.md) - Known vulnerabilities

**Then:**
- API route documentation in `app/api/` directories
- Database migration files in `database/migrations/`

### For QA/Testers

**Start here:**
1. [features/FEATURES.md](./features/FEATURES.md) - Feature overview
2. [testing/TESTING_README.md](./testing/TESTING_README.md) - Testing approach
3. [testing/VERIFICATION.md](./testing/VERIFICATION.md) - Verification checklist

**Then:**
- Feature-specific testing guides:
  - [../docs/JOB_CARDS_TESTING_GUIDE.md](../docs/JOB_CARDS_TESTING_GUIDE.md)
  - [testing/TEST_CASES_SUMMARY.md](./testing/TEST_CASES_SUMMARY.md)

### For DevOps

**Start here:**
1. [guides/GETTING_STARTED.md](./guides/GETTING_STARTED.md) - Setup and deployment
2. [guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md) - Deployment section

**Then:**
- Environment configuration in `.env.local.example`
- Build scripts in `package.json`

---

## 🔍 Search by Topic

### Authentication & Authorization
- [features/RECOVERY_FEATURES_SUMMARY.md](./features/RECOVERY_FEATURES_SUMMARY.md)
- [features/FORGOT_PASSWORD_IMPLEMENTATION.md](./features/FORGOT_PASSWORD_IMPLEMENTATION.md)
- [features/FORGOT_LOGIN_ID_IMPLEMENTATION.md](./features/FORGOT_LOGIN_ID_IMPLEMENTATION.md)
- [guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md#authentication)

### Auto-Save & Persistence
- [features/AUTO_SAVE_IMPLEMENTATION.md](./features/AUTO_SAVE_IMPLEMENTATION.md)
- [features/AUTO_SAVE_QUICK_GUIDE.md](./features/AUTO_SAVE_QUICK_GUIDE.md)

### Design Patterns
- [design/DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md)
- `design/` directory

### Database
- [guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md#data-layer)
- [../docs/JOB_CARDS_IMPLEMENTATION.md](../docs/JOB_CARDS_IMPLEMENTATION.md#database-schema)

### API Endpoints
- [guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md#api-layer)
- [../docs/JOB_CARDS_IMPLEMENTATION.md](../docs/JOB_CARDS_IMPLEMENTATION.md#api-endpoints)

### Testing
- [testing/TESTING_README.md](./testing/TESTING_README.md)
- [testing/SECURITY_TEST_REPORT.md](./testing/SECURITY_TEST_REPORT.md)
- [testing/TEST_CASES_SUMMARY.md](./testing/TEST_CASES_SUMMARY.md)
- [../docs/JOB_CARDS_TESTING_GUIDE.md](../docs/JOB_CARDS_TESTING_GUIDE.md)

### Security
- [testing/TESTING_README.md](./testing/TESTING_README.md)
- [testing/SECURITY_TEST_REPORT.md](./testing/SECURITY_TEST_REPORT.md)
- [testing/SECURITY_CHECKLIST.md](./testing/SECURITY_CHECKLIST.md)

---

## 📝 Document Status

| Document | Status | Last Updated |
|----------|--------|--------------|
| README.md | ✅ Current | Jan 2026 |
| guides/GETTING_STARTED.md | ✅ Current | Jan 2026 |
| features/FEATURES.md | ✅ Current | Jan 2026 |
| design/DESIGN_SYSTEM.md | ✅ Updated to Graphite | Jan 2026 |
| guides/ARCHITECTURE.md | ✅ Current | Jan 2026 |
| features/AUTO_SAVE_*.md | ✅ Current | Jan 2026 |
| features/FORGOT_*.md | ✅ Current | Jan 2026 |
| testing/TESTING_README.md | ✅ Current | Jan 2026 |
| ../docs/* | ✅ Current | Varies |
| planning/* | ⚠️ Legacy Reference | Varies |

---

## 🤝 Contributing to Documentation

### Adding New Documentation

1. Create documentation in appropriate directory (guides/, features/, testing/, planning/, design/)
2. Update this index (`docs/DOCUMENTATION_INDEX.md`)
3. Follow naming conventions:
   - Use `UPPER_CASE.md` for main documents
   - Use `kebab-case.md` for feature docs
   - Use `*_QUICK_GUIDE.md` for quick references

### Documentation Standards

- ✅ Use clear, concise language
- ✅ Include code examples where applicable
- ✅ Add "Last Updated" date
- ✅ Use proper Markdown formatting
- ✅ Include Table of Contents for long documents
- ✅ Link to related documentation

---

## 📞 Need Help?

### Can't Find What You're Looking For?

1. Search the repository code
2. Check inline code comments
3. Review related documentation
4. Ask the team

### Documentation Issues?

Found an error or outdated information?
1. Note the specific document and section
2. Create an issue or PR
3. Include suggested changes

---

## 🔗 Quick Links

**Main Docs:**
- [../README.md](../README.md)
- [guides/GETTING_STARTED.md](./guides/GETTING_STARTED.md)
- [features/FEATURES.md](./features/FEATURES.md)
- [design/DESIGN_SYSTEM.md](./design/DESIGN_SYSTEM.md)
- [guides/ARCHITECTURE.md](./guides/ARCHITECTURE.md)

**Implementation Guides:**
- [features/AUTO_SAVE_IMPLEMENTATION.md](./features/AUTO_SAVE_IMPLEMENTATION.md)
- [features/RECOVERY_FEATURES_SUMMARY.md](./features/RECOVERY_FEATURES_SUMMARY.md)
- [../docs/JOB_CARDS_IMPLEMENTATION.md](../docs/JOB_CARDS_IMPLEMENTATION.md)

**Testing:**
- [testing/TESTING_README.md](./testing/TESTING_README.md)
- [testing/SECURITY_TEST_REPORT.md](./testing/SECURITY_TEST_REPORT.md)

---

**RevvOS** - Automotive Garage Management System
**Version:** 1.0.0
**Documentation Last Updated:** January 2026
**Documentation Structure:** Reorganized for clarity and maintainability

For the latest updates, check the repository wiki or releases page.
