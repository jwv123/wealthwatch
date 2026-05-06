import { Account } from './account.model';
import { Category } from './category.model';

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringTransaction {
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
  account?: Account;
  category?: Category;
}

export interface RecurringTransfer {
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
  from_account?: Account;
  to_account?: Account;
}

export interface CreateRecurringTransactionDTO {
  account_id: string;
  category_id?: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  frequency: RecurringFrequency;
  interval_value?: number;
  day_of_month?: number | null;
  start_date: string;
  end_date?: string | null;
  is_active?: boolean;
}

export interface UpdateRecurringTransactionDTO {
  account_id?: string;
  category_id?: string | null;
  amount?: number;
  type?: 'income' | 'expense';
  description?: string;
  frequency?: RecurringFrequency;
  interval_value?: number;
  day_of_month?: number | null;
  start_date?: string;
  end_date?: string | null;
  is_active?: boolean;
  next_date?: string;
}

export interface CreateRecurringTransferDTO {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description?: string;
  frequency: RecurringFrequency;
  interval_value?: number;
  day_of_month?: number | null;
  start_date: string;
  end_date?: string | null;
  is_active?: boolean;
}

export interface UpdateRecurringTransferDTO {
  from_account_id?: string;
  to_account_id?: string;
  amount?: number;
  description?: string;
  frequency?: RecurringFrequency;
  interval_value?: number;
  day_of_month?: number | null;
  start_date?: string;
  end_date?: string | null;
  is_active?: boolean;
  next_date?: string;
}

export interface ProcessDueResult {
  transactionsGenerated: number;
  transfersGenerated: number;
}