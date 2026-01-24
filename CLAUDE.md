# RevvOS - AI Assistant Configuration

Configures Claude Code for the RevvOS automotive garage management system with MCP servers, skills, and agents.

## Project Overview

**RevvOS** - Workshop management with Next.js 14, TypeScript, Supabase, Tailwind CSS, React Hook Form, Zod, TanStack Query, DnD Kit, FullCalendar, Framer Motion, Zustand, Vitest.

**Design:** Light mode, Graphite (#0F172A) primary, white surfaces, mobile-first, WCAG 2.1 AA.

---

## MCP Servers Quick Reference

| MCP | Use For | Key Tools |
|-----|---------|-----------|
| **context7** | Library docs | `resolve-library-id`, `get-library-docs` |
| **filesystem** | File operations | `read_multiple_files`, `search_files`, `directory_tree` |
| **playwright-extended** | Browser automation | `navigate`, `screenshot`, `click`, `get_visible_html` |
| **playwright** | Accessibility testing | `browser_snapshot`, `browser_click`, `browser_fill_form` |
| **memory** | Knowledge graph | `create_entities`, `create_relations`, `search_nodes` |
| **sequential-thinking** | Complex reasoning | Multi-step thought analysis |
| **web_reader** | Web docs | `webReader` (markdown output) |
| **fetch** | HTTP requests | Simple URL fetching |
| **docker** | Containers | `create-container`, `deploy-compose` |
| **mobile** | Android/iOS testing | `mobile_take_screenshot`, `mobile_list_elements_on_screen` |
| **ios-simulator** | iOS testing | `screenshot`, `ui_tap`, `ui_swipe`, `launch_app` |
| **time** | Time zones | `get_current_time`, `convert_time` |
| **4.5v_mcp** | Image analysis | `analyze_image` (UI/design) |

### MCP Usage Patterns

**Context7 (Library Docs):**
```bash
# Step 1: Resolve ID
mcp__context7__resolve-library-id libraryName: "next"
# Step 2: Get docs
mcp__context7__get-library-docs context7CompatibleLibraryID: "/vercel/next.js" topic: "server actions" tokens: 5000
```

**Filesystem (Batch Operations):**
```bash
# Read multiple files
mcp__filesystem__read_multiple_files paths: ["app/page.tsx", "app/layout.tsx"]
# Search files
mcp__filesystem__search_files path: "app" pattern: "job-card" excludePatterns: ["node_modules"]
```

**Playwright (E2E Testing):**
```bash
mcp__playwright-extended__playwright_navigate url: "http://localhost:3000"
mcp__playwright-extended__playwright_screenshot name: "homepage" fullPage: true
mcp__playwright-extended__playwright_console_logs type: "error"
```

**Memory (Knowledge Graph):**
```bash
# Create entities
mcp__memory__create_entities entities: [{name: "JobCard" entityType: "DatabaseTable" observations: ["Stores job card info"]}]
# Create relations
mcp__memory__create_relations relations: [{from: "JobCard" to: "Vehicle" relationType: "references"}]
# Search context
mcp__memory__search_nodes query: "job card status"
```

---

## Skills - Trigger Conditions

### Architecture & Design

| Skill | Purpose | RevvOS Triggers |
|-------|---------|-----------------|
| **architecture-patterns** | Backend architecture (Clean, DDD, Hexagonal) | "Structure service layer", "Refactor module", "Organize business logic" |
| **design-system-patterns** | Design tokens, theming, components | "Create component variant", "Add color", "Brand tokens", "Mobile/desktop" |
| **c4-architecture** | Architecture diagrams | "Draw architecture", "C4 diagram", "System context", "Module relationships" |
| **api-design-principles** | API design | "Create endpoint", "Structure API", "REST design", "Response format" |

### Authentication & Security

| Skill | Purpose | RevvOS Triggers |
|-------|---------|-----------------|
| **auth-implementation-patterns** | JWT, OAuth2, RBAC, sessions | "Add permissions", "Secure API", "Employee access", "RBAC", "JWT" |
| **better-auth-best-practices** | Better Auth integration | "Use Better Auth", "Migrate to Better Auth" |
| **security-engineer** | Security audits | "Security audit", "Vulnerability check", "Review for security", Pre-deployment |

### Database & Data

| Skill | Purpose | RevvOS Triggers |
|-------|---------|-----------------|
| **database-schema-designer** | Schema design, normalization, indexing | "Create table", "Schema design", "Add field", "PostgreSQL", Supabase migrations |
| **context7** | Library documentation | "API for...", "How to use...", "Latest docs", "Show examples" |

### Frontend

| Skill | Purpose | RevvOS Triggers |
|-------|---------|-----------------|
| **react-query** | TanStack Query, caching, optimistic updates | "Implement caching", "React Query", "useQuery/useMutation", Real-time sync |
| **testing-library** | React Testing Library | "Component test", "RTL", "Test interaction" |
| **bats-testing-patterns** | Shell script testing | "Test script", "Test migration", Files: `scripts/*.sh` |

### Code Quality

| Skill | Purpose | RevvOS Triggers |
|-------|---------|-----------------|
| **code-quality-engineer** | Quality analysis, technical debt | "Code quality", "Technical debt", "Hotspots", `/debt` |
| **code-review-excellence** | Code review practices | "Review PR", "Check code", "Code review" |

### Documentation

| Skill | Purpose | RevvOS Triggers |
|-------|---------|-----------------|
| **doc-coauthoring** | Structured documentation | "Write docs", "Create spec", "Technical proposal" |
| **architecture-decision-records** | ADR documentation | "Document decision", "ADR", "Why we chose X" |

### Testing & QA

| Skill | Purpose | RevvOS Triggers |
|-------|---------|-----------------|
| **browser-qa-agent** | Playwright E2E tests | "E2E test", "Playwright", "Test user flow" |
| **mobile-qa-engineer** | Mobile testing | "Mobile test", "iOS/Android", "Touch targets", Responsive |

### Other Skills

| Skill | Purpose | RevvOS Triggers |
|-------|---------|-----------------|
| **async-python-patterns** | Python asyncio | Files: `scripts/*.py`, "Python async" |
| **backend-to-frontend-handoff-docs** | API documentation | "API handoff", "API docs for frontend" |
| **changelog-automation** | Changelog generation | "Changelog", "Release notes" |
| **command-creator** | Slash commands | "Create command", "Slash command" |
| **crafting-effective-readmes** | README files | "Update README", "Create README" |
| **data-storytelling** | Data visualization | "Dashboard metrics", "Analytics presentation" |
| **deployment-pipeline-design** | CI/CD pipelines | "CI/CD", "Deployment pipeline", "GitOps" |

---

## Agents - When to Use

### Core Development

| Agent | Purpose | When to Use | NOT for |
|-------|---------|-------------|---------|
| **master-developer** | Production-grade implementation | Complex features, critical logic, refactors | Simple fixes, reading files, basic questions |
| **Plan** | Architecture planning | "How to implement...", multiple approaches | Single-file changes, obvious solutions |
| **Explore** | Codebase exploration | Find files, search code, understand structure | Single file lookups, known locations |
| **project-architect** | Architecture analysis | Impact analysis, dependency review, refactors | Simple code changes, new features |

### Research & Analysis

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **research-agent** | Comprehensive research | Compare libraries, best practices, deep investigation |
| **general-purpose** | General tasks | Complex queries, multiple searches, unsure which agent |

### Specialized

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **file-operations-manager** | Bulk file operations | Multi-file ops, directory structures, scaffolding |
| **code-quality-engineer** | Quality analysis | Technical debt, hotspots, anti-patterns, pre-deployment |
| **security-engineer** | Security audits | Vulnerability assessment, auth review, OWASP Top 10 |
| **devops-engineer** | DevOps/Docker | Docker setup, containers, deployment scripts |

### Testing & QA

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **browser-qa-agent** | Playwright E2E | End-to-end tests, user flows, visual regression |
| **mobile-qa-engineer** | Mobile testing | iOS/Android testing, responsive design, touch interactions |

### Design & Docs

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| **prompt-architect** | Prompt engineering | Create agent prompts, optimize prompts |
| **claude-code-guide** | Claude Code help | "Can Claude Code...", how to use features |

### Agent Selection Quick Reference

```
Build feature → master-developer
Plan work → Plan
Find files → Explore
Analyze architecture → project-architect
Research → research-agent
File ops → file-operations-manager
Code quality → code-quality-engineer
Security → security-engineer
Docker → devops-engineer
E2E tests → browser-qa-agent
Mobile tests → mobile-qa-engineer
Claude help → claude-code-guide
General → general-purpose
```

### Agent Patterns

**Sequential:** Explore → Plan → master-developer → code-quality-engineer → security-engineer

**Parallel:** Launch multiple independent agents simultaneously

**Background:** Use `run_in_background: true` for long-running tasks

---

## Project Patterns

### File Structure
```
app/
├── job-cards/           # Job card tracking
│   ├── [id]/           # Detail/edit
│   ├── components/     # kanban/, timeline/, shared/
│   ├── hooks/          # Custom hooks
│   └── types/          # TypeScript types
├── inventory/           # Inventory management
├── vehicle-catalog/     # Vehicle registry
├── customer-management/ # Customer CRM
└── employee-management/ # Employee directory

lib/
├── hooks/              # use-auth, useFormAutoSave
├── schemas/            # Zod validation
└── supabase/           # Supabase queries
```

### Key Conventions
- **Type Safety:** Always TypeScript with proper types
- **Validation:** Zod for forms and APIs
- **Auto-Save:** Check existing patterns first
- **Real-Time:** Supabase subscriptions for collaboration
- **Error Handling:** Graceful with user-friendly messages
- **Loading States:** Skeletons during async ops
- **Mobile First:** 44x44px minimum touch targets

### Component Patterns
- **Forms:** React Hook Form + Zod + auto-save
- **Data Fetching:** TanStack Query with caching
- **UI:** Radix UI primitives + Tailwind CSS
- **API Routes:** Zod validation, proper status codes

### Testing
- **Framework:** Vitest (93 test cases)
- **Run:** `npm test`, `npm run test:coverage`
- **Focus:** Security, API validation, form validation

### Styling
- Tailwind CSS utilities
- Design system colors
- `clsx` + `tailwind-merge` for conditional classes
- Prefer composition over custom CSS

---

## Common Tasks

### Adding Features
1. Research: `context7` for latest docs
2. Plan: `architecture-patterns`
3. Schema: `database-schema-designer`
4. Types: `app/feature/types/`
5. Validation: `lib/schemas/`
6. API: Routes with Zod
7. Components: Follow design system
8. Testing: `playwright-extended` for E2E
9. Docs: `doc-coauthoring`

### Debugging
1. Console: `playwright-extended__playwright_console_logs`
2. Supabase logs
3. TypeScript errors
4. Vitest regression
5. Real-time subscriptions

### Performance
- TanStack Query caching
- Pagination for large lists
- React.memo for expensive components
- Lazy loading
- Optimize assets

---

## Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
NEXT_PUBLIC_REQUEST_EMAIL=your-email@example.com
NEXT_PUBLIC_APP_URL=https://your-domain.com
```

## Quick Commands

```bash
npm run dev              # Dev server
npm run build            # Production build
npm test                 # Watch tests
npm run test:coverage    # Coverage report
npx prisma studio        # Prisma Studio
npm run update-logos     # Update vehicle logos
```

---

## Working Guidelines

**Before changes:**
1. `filesystem` to read related files
2. `context7` for latest docs
3. `memory` to search existing knowledge
4. Follow established structure
5. Consider security

**When implementing:**
1. `sequential-thinking` for complex planning
2. TypeScript + Zod validation
3. Graceful error handling
4. Loading states
5. Test with `playwright-extended`
6. Update `memory` with observations

**When reviewing:**
1. `code-review-excellence`
2. `security-engineer` for vulnerabilities
3. Verify type safety
4. Design system consistency
5. `playwright` for accessibility
6. `mobile` or `ios-simulator` for mobile

**When debugging:**
1. `playwright-extended` to reproduce
2. Check console logs
3. `filesystem` to search files
4. `sequential-thinking` to analyze
5. `memory` to recall context

---

**Note:** Uses Next.js 14 patterns (Server Components, Server Actions, App Router). Prefer Supabase client patterns over direct SQL. Leverage MCPs for efficiency and context across sessions.
