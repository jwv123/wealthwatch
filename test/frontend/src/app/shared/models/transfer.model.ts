import { Account } from './account.model';

export interface Transfer {
  id: string;
  user_id: string;
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description: string;
  date: string;
  created_at: string;
  updated_at: string;
  from_account?: Account;
  to_account?: Account;
}

export interface CreateTransferDTO {
  from_account_id: string;
  to_account_id: string;
  amount: number;
  description: string;
  date: string;
}

export interface UpdateTransferDTO {
  from_account_id?: string;
  to_account_id?: string;
  amount?: number;
  description?: string;
  date?: string;
}