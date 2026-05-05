# WealthWatch — Backend API Documentation

## Architecture

The backend is an Express.js server using TypeScript. All data flows through the Express API, which then communicates with Supabase (respecting RLS policies).

### Middleware Chain

```
Request → Helmet → CORS → JSON Parser → Rate Limiter → [Auth Middleware] → Route Handler → Response
```

- **Helmet**: Sets security headers
- **CORS**: Allows requests from the configured frontend origin
- **JSON Parser**: Parses request bodies
- **Rate Limiter**: Limits requests per window (default: 100 per 15 minutes)
- **Auth Middleware**: Extracts JWT from `Authorization: Bearer <token>`, validates with Supabase `getUser()`, attaches `userId`, `userEmail`, and `accessToken` to request
- **Zod Validation**: Validates request bodies against schemas

### Supabase Client Strategy

The backend uses two Supabase client strategies:

1. **`supabaseClient` (anon key)** — Used only for auth operations: `signInWithPassword`, `signUp`, `refreshSession`, and `getUser` (token validation in auth middleware). Cannot satisfy RLS policies because `auth.uid()` returns null.

2. **`createAuthenticatedClient(accessToken)`** — Creates a per-request Supabase client with the user's JWT in the Authorization header. Used for ALL data queries (transactions, categories, reports, profiles). This is required because RLS policies on all tables use `auth.uid()` to restrict data access to the authenticated user's own rows. Without the user's JWT, `auth.uid()` returns null and queries return empty results.

Controllers create an authenticated client via `createAuthenticatedClient(req.accessToken)` and pass it to services as the first parameter. Services never use the global `supabaseClient` for data queries.

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development`, `production`, or `test` |
| `PORT` | Yes | Server port (default: 3001) |
| `SUPABASE_URL` | Yes | Supabase project URL |
| `SUPABASE_ANON_KEY` | Yes | Supabase anon/public key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Supabase service role key (admin) |
| `JWT_SECRET` | Yes | Secret for JWT verification |
| `CORS_ORIGIN` | Yes | Allowed frontend origin |
| `RATE_LIMIT_WINDOW_MS` | No | Rate limit window (default: 900000) |
| `RATE_LIMIT_MAX` | No | Max requests per window (default: 100) |

## API Endpoints

### Health Check

```
GET /api/health → { status: "ok", timestamp: "..." }
```

### Auth

| Method | Endpoint | Auth | Body | Response |
|--------|----------|------|------|----------|
| POST | `/api/auth/login` | No | `{ email, password }` | `{ access_token, refresh_token, user }` |
| POST | `/api/auth/register` | No | `{ email, password, display_name? }` | `{ access_token, refresh_token, user }` |
| POST | `/api/auth/logout` | Yes | — | `{ message: "Logged out successfully" }` |
| POST | `/api/auth/refresh` | No | `{ refresh_token }` | `{ access_token, refresh_token, user }` |

> **Note:** The refresh endpoint returns the same formatted response as login/register (flat `access_token`, `refresh_token`, `user`), not the raw Supabase session object. The frontend error interceptor uses this to seamlessly refresh expired tokens.

### Categories

| Method | Endpoint | Auth | Query Params | Response |
|--------|----------|------|-------------|----------|
| GET | `/api/categories` | Yes | `?type=income\|expense` | `Category[]` |
| POST | `/api/categories` | Yes | `{ name, type, icon?, color? }` | `Category` |
| PATCH | `/api/categories/:id` | Yes | `{ name?, type?, icon?, color? }` | `Category` |
| DELETE | `/api/categories/:id` | Yes | — | `{ message: "Category deleted" }` |

Note: Default categories (`is_default: true`) cannot be deleted.

### Transactions

| Method | Endpoint | Auth | Query Params | Response |
|--------|----------|------|-------------|----------|
| GET | `/api/transactions` | Yes | `?type=income\|expense&from=YYYY-MM-DD&to=YYYY-MM-DD&categoryId=uuid` | `Transaction[]` (with joined `category`) |
| POST | `/api/transactions` | Yes | `{ category_id?, amount, type, description, date, metadata? }` | `Transaction` |
| PATCH | `/api/transactions/:id` | Yes | `{ category_id?, amount?, type?, description?, date?, metadata? }` | `Transaction` |
| DELETE | `/api/transactions/:id` | Yes | — | `{ message: "Transaction deleted" }` |

### Reports

| Method | Endpoint | Auth | Query Params | Response |
|--------|----------|------|-------------|----------|
| GET | `/api/reports/summary` | Yes | `?year=2026` | `{ totalIncome, totalExpenses, netBalance, byCategory, year }` |
| GET | `/api/reports/monthly` | Yes | `?year=2026` | `{ year, months: [{ month, income, expenses }] }` |

### Error Responses

All errors follow this format:

```json
{
  "error": "Description of what went wrong",
  "details": [
    { "field": "amount", "message": "Amount must be positive" }
  ]
}
```

Status codes: `400` (validation), `401` (unauthorized), `404` (not found), `500` (server error).

### AuthRequest Interface

All authenticated route handlers receive an `AuthRequest` with three fields from the auth middleware:

```typescript
interface AuthRequest extends Request {
  userId: string;      // from validated JWT
  userEmail: string;   // from validated JWT
  accessToken: string; // raw JWT for creating authenticated Supabase clients
}
```

Controllers use `createAuthenticatedClient(req.accessToken)` to create a Supabase client that satisfies RLS policies, then pass it to services as the first parameter.

## Running the Server

```bash
cd test/backend
npm install
npm run dev    # Development with hot reload
npm run build  # Compile TypeScript to dist/
npm start      # Run compiled JS
```

## Testing with curl

```bash
# Register
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret12"}'

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"secret12"}'

# Create transaction (use token from login)
curl -X POST http://localhost:3001/api/transactions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"amount":2500,"type":"income","description":"Salary","date":"2026-04-01"}'

# Get transactions
curl http://localhost:3001/api/transactions \
  -H "Authorization: Bearer YOUR_TOKEN"
```