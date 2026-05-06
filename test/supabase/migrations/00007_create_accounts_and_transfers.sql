-- ===========================
-- Accounts table
-- ===========================
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('checking', 'savings', 'credit_card', 'cash', 'investment', 'loan')),
  initial_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  color TEXT,
  icon TEXT,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, name)
);

CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);

CREATE TRIGGER set_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===========================
-- Transfers table
-- ===========================
CREATE TABLE IF NOT EXISTS public.transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL DEFAULT '',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_account_id <> to_account_id)
);

CREATE INDEX idx_transfers_user_id ON public.transfers(user_id);
CREATE INDEX idx_transfers_from_account ON public.transfers(from_account_id);
CREATE INDEX idx_transfers_to_account ON public.transfers(to_account_id);
CREATE INDEX idx_transfers_date ON public.transfers(date);

CREATE TRIGGER set_transfers_updated_at
  BEFORE UPDATE ON public.transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===========================
-- Add account_id to transactions
-- ===========================
-- Step 1: Add nullable column
ALTER TABLE public.transactions
  ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE CASCADE;

-- Step 2: Create default "Main" account for every existing user
INSERT INTO public.accounts (user_id, name, type, initial_balance, currency, color, icon, is_default)
SELECT
  p.id,
  'Main',
  'checking',
  0,
  p.default_currency,
  '#3498DB',
  'wallet',
  TRUE
FROM public.profiles p;

-- Step 3: Backfill existing transactions to the default account
UPDATE public.transactions t
SET account_id = a.id
FROM public.accounts a
WHERE t.user_id = a.user_id
  AND a.is_default = TRUE
  AND t.account_id IS NULL;

-- Step 4: Make account_id NOT NULL
ALTER TABLE public.transactions
  ALTER COLUMN account_id SET NOT NULL;

CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);

-- ===========================
-- RLS policies for accounts
-- ===========================
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own accounts"
  ON public.accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own accounts"
  ON public.accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own accounts"
  ON public.accounts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own accounts"
  ON public.accounts FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================
-- RLS policies for transfers
-- ===========================
ALTER TABLE public.transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own transfers"
  ON public.transfers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own transfers"
  ON public.transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transfers"
  ON public.transfers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own transfers"
  ON public.transfers FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================
-- Seed default account for new users
-- ===========================
CREATE OR REPLACE FUNCTION public.seed_default_account(p_user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO public.accounts (user_id, name, type, initial_balance, currency, color, icon, is_default)
  VALUES (
    p_user_id,
    'Main',
    'checking',
    0,
    COALESCE((SELECT default_currency FROM public.profiles WHERE id = p_user_id), 'USD'),
    '#3498DB',
    'wallet',
    TRUE
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update the new-user trigger to also seed the default account
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );

  PERFORM public.seed_default_categories(NEW.id);
  PERFORM public.seed_default_account(NEW.id);

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;