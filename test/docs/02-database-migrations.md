# WealthWatch — Database Migrations Guide

## Overview

WealthWatch uses three core tables with Row Level Security (RLS):

1. **profiles** — Linked to `auth.users`, stores user metadata
2. **categories** — Transaction classification (income/expense types)
3. **transactions** — Financial records with JSONB metadata for miscellaneous flags

## Migration Files

Run them in order:

| # | File | Purpose |
|---|------|---------|
| 1 | `00001_create_profiles.sql` | Profiles table, updated_at trigger, auto-create profile on signup |
| 2 | `00002_create_categories.sql` | Categories table with unique constraint on (user_id, name, type) |
| 3 | `00003_create_transactions.sql` | Transactions table with JSONB metadata, GIN index, foreign keys |
| 4 | `00004_enable_rls.sql` | Enable RLS on all three tables |
| 5 | `00005_create_rls_policies.sql` | Policies: users can only CRUD their own data |
| 6 | `00006_seed_categories.sql` | Seed default categories function, updated handle_new_user trigger |

## Step-by-Step

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) and create a new project. Note the project URL and keys from Settings > API.

### 2. Run migrations

**Option A: Using the Supabase CLI (local dev)**

```bash
supabase db push
```

**Option B: Using the Supabase Dashboard (production)**

1. Go to SQL Editor in your Supabase dashboard
2. Copy the contents of each migration file in order (00001 through 00006)
3. Paste and run each one

### 3. Verify tables

In the Supabase Table Editor, you should see:
- `profiles` with columns: id, email, display_name, avatar_url, default_currency, created_at, updated_at
- `categories` with columns: id, user_id, name, type, icon, color, is_default, created_at, updated_at
- `transactions` with columns: id, user_id, category_id, amount, type, description, date, metadata, created_at, updated_at

### 4. Verify RLS

```sql
-- Check RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';

-- All three should show rowsecurity = true
```

### 5. Test RLS policies

1. Create two test users via the Auth API
2. Log in as User A — create a transaction
3. Log in as User B — verify you cannot see User A's transactions
4. This confirms RLS is working correctly

> **Important:** All RLS policies use `auth.uid()` which requires the Supabase client to carry the user's JWT. The backend's `createAuthenticatedClient(accessToken)` creates a per-request client with the Authorization header set. If you test queries directly via the Supabase dashboard or with the anon key client, `auth.uid()` returns null and RLS will block all rows.

### The `metadata` JSONB column

The `transactions.metadata` column stores flexible key-value data:

```json
{
  "is_misc": true,
  "recurring": true,
  "recurrence_interval": "monthly",
  "tags": ["gift", "birthday"],
  "notes": "Birthday gift for Sarah"
}
```

This allows miscellaneous entries (gifts, one-off repairs) to be flagged without creating separate tables. The GIN index on this column enables efficient queries like:

```sql
SELECT * FROM transactions WHERE metadata->>'is_misc' = 'true';
```