# WealthWatch — Frontend Setup Guide

## Angular Workspace

The frontend is an Angular 19 standalone component application using:

- **Angular Signals** for reactive state management
- **ng2-charts** (Chart.js) for doughnut and bar charts
- **@supabase/supabase-js** for auth client
- **RxJS** for HTTP observables
- **SCSS** with brand-compliant CSS custom properties

## Project Structure

```
frontend/src/
├── app/
│   ├── app.component.ts          # Root component
│   ├── app.config.ts             # Providers (router, HTTP, charts, interceptors)
│   ├── app.routes.ts             # Lazy-loaded route definitions
│   ├── core/
│   │   ├── auth/                 # AuthService, AuthGuard, UnauthGuard
│   │   ├── interceptors/         # AuthInterceptor (Bearer token), ErrorInterceptor (401 → token refresh → forceLogout)
│   │   ├── currency/            # CurrencyService, WwCurrencyPipe
│   │   └── theme/               # ThemeService, ThemeStore
│   ├── shared/
│   │   ├── components/          # Navbar, Sidebar, LoadingSpinner, etc.
│   │   ├── pipes/               # wwCurrency, wwDateFormat
│   │   ├── directives/          # clickOutside
│   │   └── models/              # TypeScript interfaces
│   ├── stores/                  # AuthStore, TransactionStore, CategoryStore (Signals)
│   ├── features/
│   │   ├── auth/                # Login, Register
│   │   ├── dashboard/           # Dashboard, NetBalance, Charts, RecentTransactions
│   │   ├── transactions/        # TransactionForm, TransactionList, TransactionDetail
│   │   └── categories/          # CategoryForm, CategoryList
│   └── layout/                  # MainLayout (sidebar + content)
├── assets/
│   ├── icons/                   # SVG icons
│   └── images/                  # Logo, illustrations
├── environments/
│   ├── environment.ts           # Dev config
│   └── environment.production.ts # Prod config (replaced at build time)
├── styles.scss                  # Global styles + CSS variables
├── main.ts                      # Bootstrap
└── index.html                   # Entry HTML
```

## Key Patterns

### Angular Signals Stores

All state is managed through standalone signal stores (not NgRx or services with BehaviorSubjects):

```typescript
// Example: TransactionStore
export const TransactionStore = {
  transactions: computed(() => _state().transactions),
  totalIncome: computed(() => /* sum of income */),
  netBalance: computed(() => /* income - expenses */),
  setTransactions: (t: Transaction[]) => _state.update(...),
  addTransaction: (t: Transaction) => _state.update(...),
  // ...
};
```

Components read signals directly in templates, and services mutate stores after HTTP responses.

### Auth Flow

1. `AuthService.login()` calls `POST /api/auth/login`
2. On success, `AuthService.handleLogin()` (now async) sets tokens in `AuthStore` and `localStorage`, then awaits `getProfile()` to load the real user profile (including `default_currency`) before resolving
3. `AuthInterceptor` attaches `Authorization: Bearer <token>` to all outgoing requests
4. `ErrorInterceptor` catches 401s and attempts token refresh before forcing logout:
   - On 401, tries `AuthService.refreshToken()` with the stored refresh token
   - While refresh is in-flight, subsequent 401s are queued and retried with the new token
   - Only if refresh fails (or no refresh token exists) does it call `forceLogout()` which resets all stores (Auth, Transaction, Category, Dashboard), clears localStorage, and redirects to `/login`
   - Auth endpoints (`/auth/login`, `/auth/register`, `/auth/refresh`) are excluded from refresh attempts
5. On app init, `APP_INITIALIZER` calls `AuthService.tryRestoreSession()` which checks `localStorage` for existing tokens and fetches the user profile before the app bootstraps
6. `handleLogout()` resets all data stores (Auth, Transaction, Category, Dashboard) and clears `localStorage` to prevent stale data from appearing across sessions

### Chart Integration

Charts use `ng2-charts` with manually registered Chart.js controllers:

```typescript
// app.config.ts
provideCharts([
  DoughnutController, ArcElement,
  BarController, CategoryScale, LinearScale,
  Tooltip, Legend,
])
```

Chart colors use brand tokens: Income = `#2ECC71` (Success Green), Expenses = `#E74C3C` (Alert Red).

### Misc Transactions

Transactions with `metadata.is_misc === true` are flagged in the UI with a "Misc" badge. The transaction form has a toggle to mark entries as miscellaneous, which also reveals a notes field.

## Running the Frontend

```bash
cd test/frontend
npm install
npm start     # Dev server at http://localhost:4200
npm run build # Production build to dist/wealthwatch/
```

## Adding New Components

All components use Angular standalone components (no NgModules). To add a new feature:

1. Create component files in `src/app/features/<feature>/`
2. Add lazy-loaded route in `app.routes.ts`
3. Use signals stores for state, services for HTTP calls
4. Follow brand styles using `--ww-*` CSS variables