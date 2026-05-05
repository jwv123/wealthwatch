# WealthWatch

**Smart Budget Management System** — A full-stack SPA for tracking income, expenses, and categories with interactive dashboard charts, calendar view, and multi-currency support. Secured with Supabase Auth and Row Level Security.

## Features

- **Dashboard** — Summary cards (net balance, income, expenses) with period toggle (month / year / all time). Interactive bar and doughnut charts via Chart.js.
- **Transactions** — Full CRUD with month/year filtering, miscellaneous entries (tags, notes, recurring flags via JSONB metadata).
- **Calendar** — Monthly grid view with daily income/expense totals, color-coded dot indicators on mobile, expandable day detail cards.
- **Categories** — CRUD for all categories, auto-seeded defaults on signup, one-click "Reset to Default".
- **Settings** — Currency selector with auto-save (500ms debounce), display name editing, danger zone for deleting all transactions.
- **Auth** — Supabase email/password auth with confirmation flow, persistent sessions via JWT + refresh tokens.
- **Onboarding** — 6-step spotlight tutorial that auto-starts on first login.
- **Theme** — Glassmorphism light/dark mode with FOUC prevention.
- **Responsive** — Mobile-first with sidebar drawer, table-to-card patterns, and touch-friendly calendar.

## Tech Stack

| Layer | Technology |
|--------|-----------|
| Frontend | Angular 19 (standalone components), TypeScript, SCSS, Angular Signals, ng2-charts v6 |
| Backend | Node.js + Express (TypeScript), Zod validation, JWT auth, rate limiting |
| Database & Auth | Supabase (PostgreSQL, Auth with RLS, Storage) |
| State | Signal-based stores (AuthStore, TransactionStore, CategoryStore, DashboardStore) |

## Project Structure

```
wealthwatch/
├── api/                    # Vercel serverless functions
│   ├── index.ts            # Express API handler
│   └── test.ts             # Health-check endpoint
├── brand-assets/           # Logo + brand-assets-guideline.md
├── build-vercel.sh         # Vercel build script
├── vercel.json             # Vercel deployment config
├── test/
│   ├── backend/            # Express API
│   │   └── src/            # app.ts, config, middleware, routes, controllers, services, types
│   ├── frontend/           # Angular app
│   │   └── src/app/        # core, shared, features, stores, layout
│   ├── supabase/           # SQL migrations (6 files)
│   └── docs/               # Setup, migrations, API, frontend, deployment, brand guides
└── production/             # Production build only (never auto-deployed)
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm
- Supabase CLI (for local dev)

### 1. Clone and install

```bash
git clone https://github.com/jwv123/wealthwatch.git
cd wealthwatch
```

### 2. Set up environment variables

Create `test/backend/.env`:

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=your-jwt-secret
CORS_ORIGIN=http://localhost:4200
```

### 3. Run database migrations

```bash
supabase start
supabase db push
```

### 4. Start development servers

```bash
# Backend (port 3001)
cd test/backend && npm install && npm run dev

# Frontend (port 4200) — in a separate terminal
cd test/frontend && npm install && npm start
```

Or run both concurrently from the project root:

```bash
npm run dev
```

### 5. Open the app

Navigate to `http://localhost:4200`

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/login` | No | Sign in |
| POST | `/api/auth/register` | No | Sign up |
| POST | `/api/auth/logout` | Yes | Sign out |
| POST | `/api/auth/refresh` | No | Refresh token |
| GET | `/api/auth/profile` | Yes | Get user profile (incl. default_currency) |
| PATCH | `/api/auth/profile` | Yes | Update profile fields |
| GET/POST/PATCH/DELETE | `/api/categories` | Yes | CRUD |
| POST | `/api/categories/reset-defaults` | Yes | Reset categories to defaults |
| GET/POST/PATCH/DELETE | `/api/transactions` | Yes | CRUD with filters |
| POST | `/api/transactions/delete-all` | Yes | Delete all user transactions |
| GET | `/api/reports/summary` | Yes | Net balance, totals by category |
| GET | `/api/reports/monthly` | Yes | Income vs expense per month |

## Deployment (Vercel)

Both frontend and backend deploy as a single Vercel project.

### Environment variables

Set these in the Vercel project dashboard:

| Variable | Description |
|----------|-------------|
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_ANON_KEY` | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key |
| `JWT_SECRET` | JWT signing secret |
| `CORS_ORIGIN` | Vercel deployment URL (e.g. `https://wealthwatch.vercel.app`) |
| `NODE_ENV` | `production` |

### Deploy

1. Push to GitHub
2. Connect the repo to Vercel
3. Set the environment variables above
4. Deploy — Vercel runs `build-vercel.sh` automatically

The frontend uses a relative `/api` URL in production, so both apps share the same domain with no CORS issues.

## Brand

| Token | Color | Usage |
|-------|-------|-------|
| Success Green | `#2ECC71` | Income indicators, CTAs, growth arrows |
| Trust Navy | `#0B3954` | Headings, navigation, primary logo |
| Analysis Blue | `#2A5C82` | Secondary actions, active states |
| Soft Red | `#E74C3C` | Alerts, over-budget, expense indicators |

Typography: **Montserrat** (headings/body) + **JetBrains Mono** (data/monospace). See `brand-assets/brand-assets-guideline.md` for full spec.

## License

Private — All rights reserved.