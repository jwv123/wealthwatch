# WealthWatch — Project Setup Guide

## Prerequisites

- **Node.js** 20+ and **npm** 10+
- **Angular CLI** 19+: `npm install -g @angular/cli`
- **Supabase CLI**: `npm install -g supabase`
- A **Supabase account** (free tier works)

## Initial Setup

### 1. Clone and install dependencies

```bash
cd test
npm run install:all
```

### 2. Set up Supabase

```bash
# Log in to Supabase
supabase login

# Initialize local development (from test/ directory)
supabase init

# Start local Supabase stack
supabase start
```

This will output your local Supabase credentials:
- `API URL`: typically `http://localhost:54321`
- `anon key`: for frontend use
- `service_role key`: for backend admin operations only

### 3. Run database migrations

```bash
supabase db push
```

Or run each migration file in order from `supabase/migrations/`.

### 4. Configure environment variables

#### Backend

Copy `test/backend/.env.example` to `test/backend/.env` and fill in your Supabase credentials:

```env
NODE_ENV=development
PORT=3001
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key
JWT_SECRET=your-local-jwt-secret
CORS_ORIGIN=http://localhost:4200
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX=100
```

#### Frontend

Edit `test/frontend/src/environments/environment.ts` with your local Supabase credentials:

```typescript
export const environment = {
  production: false,
  supabase: {
    url: 'http://localhost:54321',
    anonKey: 'your-local-anon-key',
  },
  apiBaseUrl: 'http://localhost:3001/api',
};
```

### 5. Start development servers

```bash
# Terminal 1: Backend
cd test/backend
npm run dev

# Terminal 2: Frontend
cd test/frontend
npm start
```

The Angular dev server runs at `http://localhost:4200` and the API at `http://localhost:3001`.

### 6. Verify setup

1. Open `http://localhost:4200` — you should see the WealthWatch login page
2. Register a new account
3. Verify the user appears in the Supabase Auth dashboard
4. Verify default categories were seeded for the new user