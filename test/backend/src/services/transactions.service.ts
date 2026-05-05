import { supabaseClient } from '../config/supabase';
import { TransactionRow } from '../types/database';

interface TransactionFilters {
  type?: 'income' | 'expense';
  dateFrom?: string;
  dateTo?: string;
  categoryId?: string;
}

export async function getUserTransactions(
  userId: string,
  filters: TransactionFilters = {}
): Promise<TransactionRow[]> {
  let query = supabaseClient
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
  userId: string,
  payload: Omit<TransactionRow, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'category'>
): Promise<TransactionRow> {
  const { data, error } = await supabaseClient
    .from('transactions')
    .insert({ ...payload, user_id: userId })
    .select('*, category:categories(*)')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
}

export async function updateTransaction(
  userId: string,
  transactionId: string,
  updates: Partial<Omit<TransactionRow, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<TransactionRow> {
  const { data, error } = await supabaseClient
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

export async function deleteTransaction(userId: string, transactionId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('transactions')
    .delete()
    .eq('id', transactionId)
    .eq('user_id', userId);

  if (error) throw { statusCode: 400, message: error.message };
}

export async function deleteAllTransactions(userId: string): Promise<void> {
  const { error } = await supabaseClient
    .from('transactions')
    .delete()
    .eq('user_id', userId);

  if (error) throw { statusCode: 500, message: error.message };
}