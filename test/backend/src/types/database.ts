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

export interface TransactionRow {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  category?: CategoryRow;
}