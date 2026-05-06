# CLAUDE.md - Project Guidelines & Instructions

## Project Overview
WealthWatch is a full-stack **Smart Budget Management System** SPA. Users can track income and expenses (including miscellaneous entries), view interactive dashboard charts, manage categories, set up recurring transactions/transfers, and manage accounts — all secured with Supabase Auth and Row Level Security.

## Rules (detailed guides)
Detailed project knowledge is split into focused rule files in `.claude/rules/`:
- **[01-project-overview.md](.claude/rules/01-project-overview.md)** — Tech stack, directory structure, dev commands, generated assets
- **[02-design-and-ui.md](.claude/rules/02-design-and-ui.md)** — Brand tokens, glassmorphism theme, responsive patterns, onboarding, mandatory tool workflow
- **[03-architecture.md](.claude/rules/03-architecture.md)** — Data flow, auth, currency, backend patterns, signal stores
- **[04-data-features.md](.claude/rules/04-data-features.md)** — Transactions, categories, dashboard, calendar, accounts, transfers, recurring items
- **[05-api-endpoints.md](.claude/rules/05-api-endpoints.md)** — Full API endpoint reference table
- **[06-deployment.md](.claude/rules/06-deployment.md)** — Vercel deployment, env vars, build script, safety rules

## Quick Reference

### Key Directories
- `test/backend/src/` — Express API (app.ts, config, middleware, routes, controllers, services, types)
- `test/frontend/src/app/` — Angular app (core, shared, features, stores, layout)
- `test/supabase/migrations/` — SQL migrations (00001-00008)
- `production/` — Only modify when explicitly instructed

### Key Patterns
- All data flows through Express API — frontend never calls Supabase directly
- Angular Signals stores (not NgRx) — `TransactionStore`, `CategoryStore`, `DashboardStore`, `AccountStore`, `TransferStore`, `RecurringStore`
- Standalone components with `@if` / `@for` control flow (no `*ngIf` / `*ngFor` in new code)
- All stores reset on logout via `handleLogout()` / `forceLogout()`
- `createAuthenticatedClient(accessToken)` for all data queries (RLS requires user JWT)

### Critical Rules
- **Never push to production** from test/ without explicit instruction
- **`SUPABASE_SERVICE_ROLE_KEY`** must never be exposed to frontend
- **Backend returns `AccountWithBalance`** (with computed `balance`) from create/update, not just `AccountRow`
- **Recurring items** generate real transactions/transfers with `metadata: { recurring: true }` and advance `next_date`