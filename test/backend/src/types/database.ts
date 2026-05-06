export interface ProfileRow {
  id: string;
  email: string;
  display_name: string | null;
  avatar_url: string | null;
  default_currency: string;
  created_at: string;
  updated_at: string;
}

export interface CategoryRow {
  id: string;
  user_id: string;
  name: string;
  type: 'income' | 'expense';
  icon: string | null;
  color: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountRow {
  id: string;
  user_id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';
  initial_balance: number;
  currency: string;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AccountWithBalance extends AccountRow {
  balance: number;
}

export interface TransferRow {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  from_account?: AccountRow;
  to_account?: AccountRow;
}

export interface TransactionRow {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category?: CategoryRow;
  account?: AccountRow;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransactionRow {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  frequency: RecurringFrequency;
  interval_value: number;
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  next_date: string;
  is_active: boolean;
  last_generated_at: string | null;
  created_at: string;
  updated_at: string;
  account?: AccountRow;
  category?: CategoryRow;
}

export interface RecurringTransferRow {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description: string;
  frequency: RecurringFrequency;
  interval_value: number;
  day_of_month: number | null;
  start_date: string;
  end_date: string | null;
  next_date: string;
  is_active: boolean;
  last_generated_at: string | null;
  created_at: string;
  updated_at: string;
  from_account?: AccountRow;
  to_account?: AccountRow;
}