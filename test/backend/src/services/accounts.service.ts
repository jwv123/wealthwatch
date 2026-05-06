import { SupabaseClient } from '@supabase/supabase-js';
import { AccountRow, AccountWithBalance } from '../types/database';

export async function getUserAccounts(
  client: SupabaseClient,
  userId: string
): Promise<AccountWithBalance[]> {
  const { data: accounts, error: accountsError } = await client
    .from('accounts')
    .select('*')
    .eq('user_id', userId)
    .order('is_default', { ascending: true });

  if (accountsError) throw { statusCode: 500, message: accountsError.message };

  const { data: transactions, error: txError } = await client
    .from('transactions')
    .select('account_id, type, amount')
    .eq('user_id', userId);

  if (txError) throw { statusCode: 500, message: txError.message };

  const { data: transfers, error: tfError } = await client
    .from('transfers')
    .select('from_account_id, to_account_id, amount')
    .eq('user_id', userId);

  if (tfError) throw { statusCode: 500, message: tfError.message };

  const incomeMap = new Map<string, number>();
  const expenseMap = new Map<string, number>();
  for (const t of transactions) {
    const amt = Number(t.amount);
    if (t.type === 'income') {
      incomeMap.set(t.account_id, (incomeMap.get(t.account_id) ?? 0) + amt);
    } else {
      expenseMap.set(t.account_id, (expenseMap.get(t.account_id) ?? 0) + amt);
    }
  }

  const transferInMap = new Map<string, number>();
  const transferOutMap = new Map<string, number>();
  for (const tf of transfers) {
    const amt = Number(tf.amount);
    transferInMap.set(tf.to_account_id, (transferInMap.get(tf.to_account_id) ?? 0) + amt);
    transferOutMap.set(tf.from_account_id, (transferOutMap.get(tf.from_account_id) ?? 0) + amt);
  }

  return (accounts as AccountRow[]).map((a): AccountWithBalance => {
    const balance =
      Number(a.initial_balance) +
      (incomeMap.get(a.id) ?? 0) -
      (expenseMap.get(a.id) ?? 0) +
      (transferInMap.get(a.id) ?? 0) -
      (transferOutMap.get(a.id) ?? 0);
    return { ...a, balance };
  });
}

export async function createAccount(
  client: SupabaseClient,
  userId: string,
  payload: {
    name: string;
    type: AccountRow['type'];
    initial_balance?: number;
    currency?: string;
    color?: string;
    icon?: string;
  }
): Promise<AccountWithBalance> {
  const { data, error } = await client
    .from('accounts')
    .insert({ ...payload, user_id: userId })
    .select('*')
    .single();

  if (error) throw { statusCode: 400, message: error.message };

  // A newly created account has no transactions or transfers yet, so balance = initial_balance
  return { ...(data as AccountRow), balance: Number((data as AccountRow).initial_balance) };
}

export async function updateAccount(
  client: SupabaseClient,
  userId: string,
  accountId: string,
  updates: Partial<Pick<AccountRow, 'name' | 'type' | 'initial_balance' | 'color' | 'icon' | 'is_default'>>
): Promise<AccountWithBalance> {
  if (updates.is_default === false) {
    const { data: current } = await client
      .from('accounts')
      .select('is_default')
      .eq('id', accountId)
      .eq('user_id', userId)
      .single();

    if (current?.is_default) {
      throw { statusCode: 400, message: 'Cannot remove default flag. Set another account as default first.' };
    }
  }

  if (updates.is_default === true) {
    await client
      .from('accounts')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('is_default', true);
  }

  const { data, error } = await client
    .from('accounts')
    .update(updates)
    .eq('id', accountId)
    .eq('user_id', userId)
    .select('*')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  if (!data) throw { statusCode: 404, message: 'Account not found' };

  // Recompute balance for the updated account
  const { data: transactions } = await client
    .from('transactions')
    .select('account_id, type, amount')
    .eq('user_id', userId)
    .eq('account_id', accountId);

  const { data: transfers } = await client
    .from('transfers')
    .select('from_account_id, to_account_id, amount')
    .eq('user_id', userId);

  const account = data as AccountRow;
  let income = 0;
  let expense = 0;
  for (const t of transactions ?? []) {
    if (t.type === 'income') income += Number(t.amount);
    else expense += Number(t.amount);
  }

  let transferIn = 0;
  let transferOut = 0;
  for (const tf of transfers ?? []) {
    if (tf.to_account_id === accountId) transferIn += Number(tf.amount);
    if (tf.from_account_id === accountId) transferOut += Number(tf.amount);
  }

  const balance = Number(account.initial_balance) + income - expense + transferIn - transferOut;
  return { ...account, balance };
}

export async function deleteAccount(client: SupabaseClient, userId: string, accountId: string): Promise<void> {
  const { data: account } = await client
    .from('accounts')
    .select('is_default')
    .eq('id', accountId)
    .eq('user_id', userId)
    .single();

  if (account?.is_default) {
    throw { statusCode: 400, message: 'Cannot delete the default account. Set another account as default first.' };
  }

  const { error } = await client
    .from('accounts')
    .delete()
    .eq('id', accountId)
    .eq('user_id', userId);

  if (error) throw { statusCode: 400, message: error.message };
}