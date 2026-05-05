import { SupabaseClient } from '@supabase/supabase-js';
import { TransactionRow } from '../types/database';

interface TransactionFilters {
  type?: 'income' | 'expense';
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
}

export async function getUserTransactions(
  client: SupabaseClient,
  userId: string,
  filters: TransactionFilters = {}
): Promise<TransactionRow[]> {
  let query = client
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (filters.type) query = query.eq('type', filters.type);
  if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
  if (filters.dateTo) query = query.lte('date', filters.dateTo);
  if (filters.categoryId) query = query.eq('category_id', filters.categoryId);

  const { data, error } = await query;
  if (error) throw { statusCode: 500, message: error.message };
  return data;
}

export async function createTransaction(
  client: SupabaseClient,
  userId: string,
  payload: Omit<TransactionRow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category'>
): Promise<TransactionRow> {
  const { data, error } = await client
    .from('transactions')
    .insert({ ...payload, user_id: userId })
    .select('*, category:categories(*)')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
}

export async function updateTransaction(
  client: SupabaseClient,
  userId: string,
  transactionId: string,
  updates: Partial<Omit<TransactionRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<TransactionRow> {
  const { data, error } = await client
    .from('transactions')
    .update(updates)
    .eq('id', transactionId)
    .eq('user_id', userId)
    .select('*, category:categories(*)')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  if (!data) throw { statusCode: 404, message: 'Transaction not found' };
  return data;
}

export async function deleteTransaction(client: SupabaseClient, userId: string, transactionId: string): Promise<void> {
  const { error } = await client
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId);

  if (error) throw { statusCode: 400, message: error.message };
}

export async function deleteAllTransactions(client: SupabaseClient, userId: string): Promise<void> {
  const { error } = await client
    .from('transactions')
    .delete()
    .eq('user_id', userId);

  if (error) throw { statusCode: 500, message: error.message };
}