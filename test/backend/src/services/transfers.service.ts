import { SupabaseClient } from '@supabase/supabase-js';
import { TransferRow } from '../types/database';

interface TransferFilters {
  dateFrom?: string;
  dateTo?: string;
}

export async function getUserTransfers(
  client: SupabaseClient,
  userId: string,
  filters: TransferFilters = {}
): Promise<TransferRow[]> {
  let query = client
    .from('transfers')
    .select('*, from_account:accounts!transfers_from_account_id_fkey(*), to_account:accounts!transfers_to_account_id_fkey(*)')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (filters.dateFrom) query = query.gte('date', filters.dateFrom);
  if (filters.dateTo) query = query.lte('date', filters.dateTo);

  const { data, error } = await query;
  if (error) throw { statusCode: 500, message: error.message };
  return data;
}

export async function createTransfer(
  client: SupabaseClient,
  userId: string,
  payload: { from_account_id: string; to_account_id: string; amount: number; description?: string; date: string }
): Promise<TransferRow> {
  if (payload.from_account_id === payload.to_account_id) {
    throw { statusCode: 400, message: 'Source and destination accounts must be different' };
  }

  const { data: accounts, error: accountsError } = await client
    .from('accounts')
    .select('id, currency')
    .eq('user_id', userId)
    .in('id', [payload.from_account_id, payload.to_account_id]);

  if (accountsError) throw { statusCode: 500, message: accountsError.message };
  if (!accounts || accounts.length !== 2) {
    throw { statusCode: 400, message: 'Both accounts must exist and belong to you' };
  }

  const { data, error } = await client
    .from('transfers')
    .insert({ ...payload, user_id: userId })
    .select('*, from_account:accounts!transfers_from_account_id_fkey(*), to_account:accounts!transfers_to_account_id_fkey(*)')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
}

export async function updateTransfer(
  client: SupabaseClient,
  userId: string,
  transferId: string,
  updates: Partial<Pick<TransferRow, 'from_account_id' | 'to_account_id' | 'amount' | 'description' | 'date'>>
): Promise<TransferRow> {
  if (updates.from_account_id && updates.to_account_id && updates.from_account_id === updates.to_account_id) {
    throw { statusCode: 400, message: 'Source and destination accounts must be different' };
  }

  const { data, error } = await client
    .from('transfers')
    .update(updates)
    .eq('id', transferId)
    .eq('user_id', userId)
    .select('*, from_account:accounts!transfers_from_account_id_fkey(*), to_account:accounts!transfers_to_account_id_fkey(*)')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  if (!data) throw { statusCode: 404, message: 'Transfer not found' };
  return data;
}

export async function deleteTransfer(client: SupabaseClient, userId: string, transferId: string): Promise<void> {
  const { error } = await client
    .from('transfers')
    .delete()
    .eq('id', transferId)
    .eq('user_id', userId);

  if (error) throw { statusCode: 400, message: error.message };
}