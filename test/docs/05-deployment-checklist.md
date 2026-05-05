# WealthWatch — Deployment Checklist

## Pre-Deployment

- [ ] All tests pass (`npm test` in both backend and frontend)
- [ ] No hardcoded API URLs or credentials in source code
- [ ] `.env` files are in `.gitignore`
- [ ] Production environment variables are ready
- [ ] Angular production build succeeds: `ng build --configuration production`

---

## Frontend — Vercel

### 1. Build Configuration

Create `vercel.json` in `test/frontend/`:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

### 2. Environment Variables

In Vercel dashboard → Settings → Environment Variables:

| Key | Value |
|-----|-------|
| `SUPABASE_URL` | Your production Supabase URL |
| `SUPABASE_ANON_KEY` | Your production anon key |
| `API_BASE_URL` | Your backend API URL |

### 3. Build Settings

- **Framework Preset**: Angular
- **Build Command**: `ng build --configuration production`
- **Output Directory**: `dist/wealthwatch`
- **Install Command**: `npm install`

### 4. Deploy

```bash
cd test/frontend
vercel --prod
```

Or connect your Git repo for automatic deployments.

### 5. Post-Deploy Verification

- [ ] SPA routing works (all routes return the app, not 404)
- [ ] HTTPS redirect is active
- [ ] Login/register flow works
- [ ] API calls reach the backend (check Network tab)
- [ ] Charts render correctly

---

## Backend — VPS / Docker

### 1. Build

```bash
cd test/backend
npm install --only=production
npm run build
```

### 2. Dockerfile

Create `test/backend/Dockerfile`:

```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY dist/ ./dist/
EXPOSE 3001
CMD ["node", "dist/index.js"]
```

### 3. Build and Run

```bash
docker build -t wealthwatch-api .
docker run -d \
  -p 3001:3001 \
  -e NODE_ENV=production \
  -e SUPABASE_URL=https://your-project.supabase.co \
  -e SUPABASE_ANON_KEY=your-key \
  -e SUPABASE_SERVICE_ROLE_KEY=your-key \
  -e JWT_SECRET=your-secret \
  -e CORS_ORIGIN=https://your-frontend.vercel.app \
  wealthwatch-api
```

### 4. Reverse Proxy (Nginx example)

```nginx
server {
    listen 80;
    server_name api.wealthwatch.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### 5. TLS/SSL

- Use Let's Encrypt with Certbot, or Cloudflare for managed SSL
- Redirect all HTTP to HTTPS

### 6. Post-Deploy Verification

- [ ] `GET /api/health` returns `{ status: "ok" }`
- [ ] CORS headers include your frontend domain
- [ ] Rate limiting is active
- [ ] JWT validation works (test with invalid token → 401)
- [ ] Logs are being written and rotated

---

## Supabase — Production

### 1. Create Production Project

- Create a new project at [supabase.com](https://supabase.com)
- Note the project URL, anon key, and service role key

### 2. Run Migrations

- Copy each migration file (00001 through 00006) into the SQL Editor
- Run them in order

### 3. Verify RLS

```sql
-- Confirm RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- Test with two different users
-- User A should NOT see User B's data
```

### 4. SMTP Configuration

- Go to Authentication > Settings
- Configure SMTP for email verification (if enabling email confirmation)
- Or use Supabase's built-in email service for development

### 5. Database Backups

- Pro plan: Point-in-Time Recovery is enabled by default
- Free plan: Daily backups are available, verify in Dashboard > Database > Backups

### 6. Security

- [ ] Rotate `anon` and `service_role` keys if any were exposed during development
- [ ] Verify `service_role` key is ONLY used in the backend, never in frontend code
- [ ] Check that all tables have RLS enabled
- [ ] Test that unauthenticated requests are rejected
- [ ] Verify that authenticated data queries work (RLS policies use `auth.uid()`, which requires the backend's `createAuthenticatedClient(accessToken)` to pass the user's JWT — queries with the anon key alone will return empty results)
- [ ] Test the token refresh flow: let a session expire, verify the frontend automatically refreshes and data persists

---

## Environment Variables Summary

| Variable | Frontend | Backend | Secret? |
|----------|----------|---------|---------|
| `SUPABASE_URL` | Yes | Yes | No |
| `SUPABASE_ANON_KEY` | Yes | Yes | No (public) |
| `SUPABASE_SERVICE_ROLE_KEY` | No | Yes | **YES — never expose** |
| `JWT_SECRET` | No | Yes | **YES** |
| `CORS_ORIGIN` | No | Yes | No |
| `API_BASE_URL` | Yes | No | No |