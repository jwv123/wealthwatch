export type AccountType = 'checking' | 'savings' | 'credit_card' | 'cash' | 'investment' | 'loan';

export interface Account {
  id: string;
  user_id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  currency: string;
  color: string | null;
  icon: string | null;
  is_default: boolean;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreateAccountDTO {
  name: string;
  type: AccountType;
  initial_balance?: number;
  currency?: string;
  color?: string;
  icon?: string;
}

export interface UpdateAccountDTO {
  name?: string;
  type?: AccountType;
  initial_balance?: number;
  color?: string;
  icon?: string;
  is_default?: boolean;
}