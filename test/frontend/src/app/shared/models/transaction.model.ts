import { Category } from './category.model';

export interface Transaction {
  id: string;
  user_id: string;
  category_id: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  metadata: TransactionMetadata;
  created_at: string;
  updated_at: string;
  category?: Category;
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
  category_id?: string | null;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: string;
  metadata?: Partial<TransactionMetadata>;
}

export interface UpdateTransactionDTO {
  category_id?: string | null;
  amount?: number;
  type?: 'income' | 'expense';
  description?: string;
  date?: string;
  metadata?: Partial<TransactionMetadata>;
}