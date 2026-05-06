import { Category } from './category.model';
import { Account } from './account.model';

export interface Transaction {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  metadata: TransactionMetadata;
  created_at: string;
  updated_at: string;
  category?: Category;
  account?: Account;
}

export interface TransactionMetadata {
  is_misc?: boolean;
  recurring?: boolean;
  recurrence_interval?: 'weekly' | 'monthly' | 'yearly';
  tags?: string[];
  notes?: string;
  [key: string]: unknown;
}

export interface CreateTransactionDTO {
  account_id: string;
  category_id?: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  metadata?: Partial<TransactionMetadata>;
}

export interface UpdateTransactionDTO {
  account_id?: string;
  category_id?: string | null;
  amount?: number;
  type?: 'income' | 'expense';
  description?: string;
  date?: string;
  metadata?: Partial<TransactionMetadata>;
}