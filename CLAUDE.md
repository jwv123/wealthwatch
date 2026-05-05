# CLAUDE.md - Project Guidelines & Instructions

## Project Overview
WealthWatch is a full-stack **Smart Budget Management System** SPA. Users can track income and expenses (including miscellaneous entries), view interactive dashboard charts, and manage categories — all secured with Supabase Auth and Row Level Security.

## Tech Stack
- **Frontend:** Angular 19 (standalone components), TypeScript, SCSS, RxJS, Angular Signals for reactive state, ng2-charts v6 (Chart.js) for visualizations.
- **Backend:** Node.js + Express (TypeScript) with Zod validation, JWT auth middleware, rate limiting, and Supabase client.
- **Database & Auth:** Supabase (PostgreSQL, Auth with RLS, Storage).
- **State Management:** Angular Signals stores (AuthStore, TransactionStore, CategoryStore, DashboardStore) — no NgRx or BehaviorSubject services.
- **Currency:** `CurrencyService` holds the reactive `currency` and `currencySymbol` signals derived from `AuthStore.user().default_currency`. `WwCurrencyPipe` is impure and injects `CurrencyService` — all `{{ value | wwCurrency }}` calls automatically use the selected currency without passing a parameter.

## Directory Structure
```
wealthwatch/
├── brand-assets/           # Logo + brand-assets-guideline.md
├── kie-media-generator/    # KIE AI MCP skill for image/video generation
├── test/                   # ALL development and changes occur here
│   ├── backend/            # Express API (src/ with config, middleware, routes, controllers, services, types)
│   ├── frontend/           # Angular app (src/app/ with core, shared, features, stores, layout; core/currency for CurrencyService; features/calendar for CalendarComponent)
│   ├── supabase/           # SQL migrations (00001-00006)
│   └── docs/               # 6 documentation guides (setup, migrations, API, frontend, deployment, brand)
└── production/             # Only modify when explicitly instructed
```

## Mandatory Tool Workflow
Before making any code changes or generating UI components, you **must** perform the following steps in order:
1. **Analyze Assets:** Read `brand-assets/brand-assets-guideline.md` to extract the color palette, typography, and design principles.
2. **Design & Image Generation:** Invoke the **front-end design plugin** and the **KIE.AI MCP server** (skill at `kie-media-generator/SKILL.md`) to conceptualize layouts and generate visual assets.
3. **Apply Logic:** Use design outputs and brand guidelines to inform implementation within `test/`.

## Brand Design Tokens (from brand-assets-guideline.md)
- **Primary Colors:** Success Green `#2ECC71`, Trust Navy `#0B3954`, Analysis Blue `#2A5C82`
- **Neutrals:** Rich Slate `#555555`, Off-White `#F8F9FA`, Border Silver `#E1E4E8`
- **Alert:** Soft Red `#E74C3C` for over-budget/negative states
- **Typography:** Montserrat (headings Semi-Bold Navy, body Regular Slate), JetBrains Mono (data/monospace)
- **UI:** 4-6px border-radius, soft shadows `0 4px 6px -1px rgba(0,0,0,0.1)`, SVG icons preferred
- **CSS Variables:** All defined with `--ww-*` prefix in `frontend/src/styles.scss`

## Architecture Decisions
- **All data flows through Express API** — the Angular frontend never calls Supabase directly; it goes through the backend which handles auth, validation, and RLS-compliant queries.
- **Signals stores** are the single source of truth. Components read signals in templates; services mutate stores after HTTP responses.
- **Standalone components** — no NgModules. All components use `standalone: true` with explicit imports.
- **Angular 19 control flow** — use `@if` / `@for` instead of `*ngIf` / `*ngFor`. Do not import `CommonModule` or `NgIf`/`NgFor` in new components. Some older components (TransactionListComponent, RecentTransactionsComponent) still use `CommonModule` with `*ngIf`/`*ngFor` — these can be migrated when touched.
- **ng2-charts v6** — uses standalone `BaseChartDirective` (not `NgChartsModule`). Charts require `baseChart` attribute on `<canvas>`. Registration via `provideCharts({ registerables: [...] })` in app config.
- **Auth initialization** — `APP_INITIALIZER` in `app.config.ts` calls `AuthService.tryRestoreSession()` before the app bootstraps, resolving the auth state (token check + profile fetch). Without this, `AuthStore.isLoading` stays `true` and login/register buttons remain disabled.
- **AuthStore.reset()** sets `isLoading: false` — after logout, loading is complete, not in-progress. The initial `isLoading: true` state is only resolved by the `APP_INITIALIZER`.
- **HTTP interceptors** — Functional interceptors (`HttpInterceptorFn`) must be registered with `provideHttpClient(withInterceptors([...]))`, NOT with `withInterceptorsFromDi()` + `HTTP_INTERCEPTORS` providers. The latter is for class-based interceptors only and silently breaks the HTTP pipeline for functional ones.
- **Auth response transformation** — The backend `formatAuthResponse()` in `auth.controller.ts` flattens Supabase's `{ user, session: { access_token, refresh_token } }` into `{ access_token, refresh_token, user }`. When Supabase returns `session: null` (email confirmation required), it responds with `{ confirmationRequired: true, user }` instead. The frontend handles both cases.
- **Currency persistence** — The user's `default_currency` is stored in the `profiles` table (defaults to `'USD'`). After login, `AuthService.handleLogin()` immediately calls `getProfile()` to load the real profile including the saved currency. The Settings page (`/settings`) lets users change currency via a dropdown that auto-saves with a 500ms debounce. `CurrencyService.updateCurrency()` PATCHes `/api/auth/profile` and updates `AuthStore` on success.
- **WwCurrencyPipe is impure** — It injects `CurrencyService` and reads the reactive `currency()` signal as the default. Template calls like `{{ value | wwCurrency }}` automatically reflect the selected currency. An explicit second parameter (`{{ value | wwCurrency:'EUR' }}`) still overrides.
- **Chart options are computed signals** — `chartOptions` in both `IncomeExpenseBarComponent` and `ExpenseDoughnutComponent` are `computed()` signals that read `CurrencyService.currencySymbol()`. Templates reference them as `[options]="chartOptions()"`.
- **Email confirmation** — The remote Supabase project has email confirmation enabled. Registration returns `session: null` (no tokens). The frontend redirects to `/login?confirmed=pending` with a confirmation message instead of attempting auto-login. `AuthService.handleLogin()` guards against undefined tokens.
- **Lazy-loaded routes** — dashboard, transactions, calendar, categories, settings are all loaded on demand.
- **JSONB `metadata` column** on transactions supports `is_misc`, `recurring`, `tags`, `notes` for miscellaneous entries.
- **Default categories** are auto-seeded via a PostgreSQL trigger when a new user signs up.
- **Transaction month/year filtering** — The transactions page has month and year `<select>` dropdowns that compute `dateFrom`/`dateTo` and set them via `TransactionStore.setFilter()`. "All Time" clears both to null. The store's `filteredTransactions` computed already applies these filters — no backend changes were needed.
- **Dashboard period toggle** — `DashboardStore` (signal-based) manages `scope` (`'month' | 'year' | 'all'`), `selectedYear`, `selectedMonth`, and the fetched `summary`/`monthly` report data. The dashboard reads summary cards from `DashboardStore.summary()` instead of `TransactionStore.totalIncome()` etc. Charts receive `filteredTransactions()` (date-filtered via `DashboardStore.dateFrom()`/`dateTo()`) instead of raw `TransactionStore.transactions()`. The `IncomeExpenseBarComponent` accepts `scope` and `year` inputs; when `scope === 'all'`, it groups by year instead of month.
- **Dashboard reports API "all time"** — When `GET /reports/summary` or `GET /reports/monthly` is called without a `year` query param, the backend returns all-time data (no date range filter). For `getMonthly` all-time, results are grouped by year (each "month" entry is a year string). `year` is returned as `null` for all-time responses.
- **Calendar component** — `CalendarComponent` at `/calendar` has its own local state (`viewMonth`, `viewYear`, `selectedDay`, `calendarTransactions`) to avoid conflicts with the global `TransactionStore` filter. It fetches transactions per month via `TransactionsService.list({ from, to })`. The calendar grid shows income/expense totals per day; clicking a day expands a detail card with that day's transactions. Month navigation with prev/next buttons.
- **Backend controller types** — `AuthRequest` interface is defined in `src/types/express.ts` (a `.ts` file, not `.d.ts` — `ts-node-dev` doesn't reliably pick up `.d.ts` module augmentation). Controllers import `AuthRequest` from `../types/express`. Route files cast handlers via `as unknown as RequestHandler` to bridge the type mismatch.
- **Supabase admin operations** — `logout` and other `auth.admin.*` calls must use `supabaseAdmin` (service role key), not `supabaseClient` (anon key).

## UI & Responsiveness
- **Glassmorphism theme** — Cards, sidebar, and navbar use `backdrop-filter: blur()` with semi-transparent backgrounds via `--ww-glass-*` CSS variables. Light/dark mode toggled via `ThemeStore` with `data-theme` attribute on `<html>`. FOUC prevented by inline script in `index.html` and `APP_INITIALIZER`.
- **Sidebar mobile drawer** — On desktop (≥769px), hamburger toggles collapse/expand (60px icon-only mode). On mobile (≤768px), hamburger opens sidebar as a fixed overlay drawer with a semi-transparent backdrop. `MainLayoutComponent` manages `sidebarCollapsed` (desktop) and `mobileDrawerOpen` (mobile) signals. `SidebarComponent` accepts `[collapsed]` and `[mobileOpen]` inputs and emits `(navClick)` to close the drawer on navigation.
- **Table-to-card responsive pattern** — Tables (transaction list, recent transactions, calendar detail) show a desktop `<table>` above 768px and a stacked card layout below. The pattern uses two sibling containers (`.xxx__desktop` and `.xxx__mobile`) toggled via `@media (max-width: 768px) { display: none / display: block }`.
- **Calendar mobile** — Grid cells shrink to 44px min-height on mobile, day names use smaller font, income/expense amounts are hidden in cells. Color-coded dot indicators (green=income, red=expense) appear below day numbers on mobile to signal that a day has transactions. Clicking a day auto-scrolls to the detail card (`scrollIntoView`) which uses a stacked card layout (`.calendar-detail__mobile`) with explicit `--ww-text-header` color on descriptions. Calendar nav header wraps with `flex-wrap`.
- **Dashboard responsive** — Summary cards go to single column at 768px. Charts go to single column at 900px. Period toggle stacks vertically on mobile.
- **Auth pages** — Login and register have `padding: 1rem` for safe mobile margins. Cards are `max-width: 400px` and `width: 100%`.
- **Onboarding tutorial** — Spotlight overlay pattern with `box-shadow: 0 0 0 9999px` cutout. 6 steps: welcome → dashboard → transactions → calendar → categories → settings. `OnboardingStore` (signal-based) manages `isActive`, `currentStep`, `hasCompleted`. Auto-starts on first login (checks `ww-onboarding-completed` localStorage). Re-triggerable from Settings. Mobile: tooltip uses `calc(100vw - 2rem)` with `max-width: 300px`.
- **Categories CRUD** — All categories (including defaults) can be edited and deleted. Inline edit via `CategoryFormComponent` with `[category]` input. "Reset to Default" button calls `POST /categories/reset-defaults` which deletes all user categories and re-seeds via `seed_default_categories` RPC.
- **Settings danger zone** — "Delete All Transactions" button with double `confirm()` dialog calls `POST /transactions/delete-all`.
- **Animated auth logo** — Login and register pages use an inline animated SVG (shield + magnifying glass + coins + growth arrow) with CSS keyframe animations. Wordmark is split-branded: "Wealth" in Trust Navy (`--ww-navy`), "Watch" in Success Green (`--ww-green`), with a fade-in animation.

## API Endpoints
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Sign in |
| POST | `/api/auth/register` | No | Sign up |
| POST | `/api/auth/logout` | Yes | Sign out |
| POST | `/api/auth/refresh` | No | Refresh token |
| GET | `/api/auth/profile` | Yes | Get current user profile (including default_currency) |
| PATCH | `/api/auth/profile` | Yes | Update profile fields (default_currency, display_name) |
| GET/POST/PATCH/DELETE | `/api/categories` | Yes | CRUD |
| POST | `/api/categories/reset-defaults` | Yes | Reset all categories to defaults |
| GET/POST/PATCH/DELETE | `/api/transactions` | Yes | CRUD with filters (`type`, `from`, `to`, `categoryId`) |
| POST | `/api/transactions/delete-all` | Yes | Delete all user transactions |
| GET | `/api/reports/summary` | Yes | Net balance, totals by category (omit `year` for all-time) |
| GET | `/api/reports/monthly` | Yes | Income vs expense per month (omit `year` for all-time, grouped by year) |

## Deployment & Safety
- **No Automatic Production Pushes:** Never copy, move, or deploy code from `test/` to `production/` unless explicitly instructed.
- **Environment Variables:** Supabase keys and API secrets are in `.env` files (never committed). Backend validates env vars with Zod on startup.
- **`SUPABASE_SERVICE_ROLE_KEY`** must never be exposed to the frontend — backend only.
- **Angular environments** use file replacement at build time (`environment.ts` → `environment.production.ts`).

## Deployment (Vercel)
- **Both frontend and backend deploy to Vercel** as a single project.
- **Backend** runs as a Vercel serverless function via `api/[...path].ts`, which imports the Express app from `test/backend/dist/app.js`.
- **Frontend** is served as a static Angular SPA. Build output: `test/frontend/dist/wealthwatch/browser/`.
- **`vercel.json`** configures builds and routes: `/api/*` → serverless function, everything else → `index.html` (SPA rewrite).
- **App separation** — `test/backend/src/app.ts` creates and exports the Express app; `test/backend/src/index.ts` imports it and calls `app.listen()` for local dev only. The Vercel entry point imports `app` directly without starting a server.
- **API URL** — In production, the frontend uses a relative URL (`/api`) since both are on the same domain, avoiding CORS entirely. `environment.production.ts` has `apiBaseUrl: '/api'`.
- **Environment variables** — Set in Vercel dashboard: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JWT_SECRET`, `CORS_ORIGIN` (set to the Vercel deployment URL), `NODE_ENV=production`.
- **Rate limiter caveat** — `express-rate-limit` uses in-memory storage; each serverless cold start has a fresh store. Rate limiting is per-invocation, not global. For production-grade rate limiting, use Vercel Edge Middleware or Upstash Redis.
- **Build command** — `npm run build` at project root (runs `build:backend` then `build:frontend`).

## Development Commands
- **Backend:** `cd test/backend && npm run dev` (starts Express on port 3001 with hot reload)
- **Frontend:** `cd test/frontend && npm start` (starts Angular dev server on port 4200)
- **Supabase:** `supabase start` for local dev, `supabase db push` to apply migrations
- **Build frontend:** `ng build --configuration production`
- **Build backend:** `cd test/backend && npm run build` (compiles TypeScript to `dist/`)
- **Build all:** `npm run build` at project root (compiles backend + builds frontend)
- **Root scripts:** `npm run dev` runs both backend and frontend concurrently

## Generated Visual Assets
Dashboard hero and empty state illustrations were generated via KIE AI Nano Banana 2. Download URLs are in `test/frontend/src/assets/images/ASSETS.md`. The brand logo is at `test/frontend/src/assets/images/logo.png`.