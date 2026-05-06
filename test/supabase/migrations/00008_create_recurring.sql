-- ===========================
-- Recurring transactions table
-- ===========================
CREATE TABLE IF NOT EXISTS public.recurring_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval_value INTEGER NOT NULL DEFAULT 1 CHECK (interval_value >= 1),
  day_of_month INTEGER CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  next_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_recurring_transactions_user_id ON public.recurring_transactions(user_id);
CREATE INDEX idx_recurring_transactions_next_date ON public.recurring_transactions(next_date) WHERE is_active = TRUE;
CREATE INDEX idx_recurring_transactions_account_id ON public.recurring_transactions(account_id);

CREATE TRIGGER set_recurring_transactions_updated_at
  BEFORE UPDATE ON public.recurring_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===========================
-- Recurring transfers table
-- ===========================
CREATE TABLE IF NOT EXISTS public.recurring_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  from_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount > 0),
  description TEXT NOT NULL DEFAULT '',
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
  interval_value INTEGER NOT NULL DEFAULT 1 CHECK (interval_value >= 1),
  day_of_month INTEGER CHECK (day_of_month IS NULL OR (day_of_month >= 1 AND day_of_month <= 31)),
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  next_date DATE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_generated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (from_account_id <> to_account_id)
);

CREATE INDEX idx_recurring_transfers_user_id ON public.recurring_transfers(user_id);
CREATE INDEX idx_recurring_transfers_next_date ON public.recurring_transfers(next_date) WHERE is_active = TRUE;
CREATE INDEX idx_recurring_transfers_from_account ON public.recurring_transfers(from_account_id);
CREATE INDEX idx_recurring_transfers_to_account ON public.recurring_transfers(to_account_id);

CREATE TRIGGER set_recurring_transfers_updated_at
  BEFORE UPDATE ON public.recurring_transfers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- ===========================
-- RLS policies for recurring_transactions
-- ===========================
ALTER TABLE public.recurring_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring_transactions"
  ON public.recurring_transactions FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own recurring_transactions"
  ON public.recurring_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring_transactions"
  ON public.recurring_transactions FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring_transactions"
  ON public.recurring_transactions FOR DELETE
  USING (auth.uid() = user_id);

-- ===========================
-- RLS policies for recurring_transfers
-- ===========================
ALTER TABLE public.recurring_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own recurring_transfers"
  ON public.recurring_transfers FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can create own recurring_transfers"
  ON public.recurring_transfers FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own recurring_transfers"
  ON public.recurring_transfers FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own recurring_transfers"
  ON public.recurring_transfers FOR DELETE
  USING (auth.uid() = user_id);