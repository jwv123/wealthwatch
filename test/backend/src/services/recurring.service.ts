import { SupabaseClient } from '@supabase/supabase-js';
import { RecurringTransactionRow, RecurringTransferRow } from '../types/database';

// ─── Date computation ─────────────────────────────────────────────

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function addMonths(date: Date, months: number, dayOfMonth?: number | null): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  if (dayOfMonth != null) {
    const maxDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(dayOfMonth, maxDay));
  }
  return result;
}

function addYears(date: Date, years: number, dayOfMonth?: number | null): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  if (dayOfMonth != null) {
    const maxDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate();
    result.setDate(Math.min(dayOfMonth, maxDay));
  }
  return result;
}

function skipWeekend(date: Date): Date {
  const day = date.getDay();
  if (day === 6) return addDays(date, 2); // Saturday → Monday
  if (day === 0) return addDays(date, 1); // Sunday → Monday
  return date;
}

export function computeNextDate(
  currentDate: string,
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly',
  intervalValue: number,
  dayOfMonth: number | null
): string {
  const date = new Date(currentDate + 'T00:00:00');

  let next: Date;
  switch (frequency) {
    case 'daily':
      next = addDays(date, intervalValue);
      next = skipWeekend(next);
      break;
    case 'weekly':
      // Weekly preserves the weekday from start_date, no weekend skip needed
      next = addDays(date, intervalValue * 7);
      break;
    case 'monthly':
      next = addMonths(date, intervalValue, dayOfMonth ?? date.getDate());
      next = skipWeekend(next);
      break;
    case 'yearly':
      next = addYears(date, intervalValue, dayOfMonth ?? date.getDate());
      next = skipWeekend(next);
      break;
    default:
      throw new Error(`Unknown frequency: ${frequency}`);
  }

  return next.toISOString().split('T')[0];
}

// ─── Recurring Transactions CRUD ───────────────────────────────────

interface RecurringTransactionFilters {
  isActive?: boolean;
}

export async function getUserRecurringTransactions(
  client: SupabaseClient,
  userId: string,
  filters: RecurringTransactionFilters = {}
): Promise<RecurringTransactionRow[]> {
  let query = client
    .from('recurring_transactions')
    .select('*, account:accounts(*), category:categories(*)')
    .eq('user_id', userId)
    .order('next_date', { ascending: true });

  if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive);

  const { data, error } = await query;
  if (error) throw { statusCode: 500, message: error.message };
  return data;
}

export async function createRecurringTransaction(
  client: SupabaseClient,
  userId: string,
  payload: {
    account_id: string;
    category_id?: string | null;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval_value?: number;
    day_of_month?: number | null;
    start_date: string;
    end_date?: string | null;
    is_active?: boolean;
  }
): Promise<RecurringTransactionRow> {
  const intervalValue = payload.interval_value ?? 1;
  const nextDate = computeNextDate(payload.start_date, payload.frequency, intervalValue, payload.day_of_month ?? null);

  const insertData: Record<string, unknown> = {
    user_id: userId,
    account_id: payload.account_id,
    category_id: payload.category_id ?? null,
    amount: payload.amount,
    type: payload.type,
    description: payload.description,
    frequency: payload.frequency,
    interval_value: intervalValue,
    day_of_month: payload.day_of_month ?? null,
    start_date: payload.start_date,
    end_date: payload.end_date ?? null,
    next_date: nextDate,
    is_active: payload.is_active ?? true,
  };

  const { data, error } = await client
    .from('recurring_transactions')
    .insert(insertData)
    .select('*, account:accounts(*), category:categories(*)')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
}

export async function updateRecurringTransaction(
  client: SupabaseClient,
  userId: string,
  id: string,
  updates: Partial<{
    account_id: string;
    category_id: string | null;
    amount: number;
    type: 'income' | 'expense';
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval_value: number;
    day_of_month: number | null;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
    next_date: string;
  }>
): Promise<RecurringTransactionRow> {
  // If frequency/interval/day_of_month/start_date changed, recompute next_date
  if (updates.frequency || updates.interval_value || updates.day_of_month !== undefined || updates.start_date) {
    const { data: current } = await client
      .from('recurring_transactions')
      .select('frequency, interval_value, day_of_month, start_date, next_date')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (current) {
      const freq = (updates.frequency ?? current.frequency) as 'daily' | 'weekly' | 'monthly' | 'yearly';
      const interval = updates.interval_value ?? current.interval_value;
      const day = updates.day_of_month !== undefined ? updates.day_of_month : current.day_of_month;
      const startDate = updates.start_date ?? current.start_date;

      updates.next_date = computeNextDate(startDate, freq, interval, day);
    }
  }

  const { data, error } = await client
    .from('recurring_transactions')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, account:accounts(*), category:categories(*)')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  if (!data) throw { statusCode: 404, message: 'Recurring transaction not found' };
  return data;
}

export async function deleteRecurringTransaction(client: SupabaseClient, userId: string, id: string): Promise<void> {
  const { error } = await client
    .from('recurring_transactions')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw { statusCode: 400, message: error.message };
}

// ─── Recurring Transfers CRUD ──────────────────────────────────────

interface RecurringTransferFilters {
  isActive?: boolean;
}

export async function getUserRecurringTransfers(
  client: SupabaseClient,
  userId: string,
  filters: RecurringTransferFilters = {}
): Promise<RecurringTransferRow[]> {
  let query = client
    .from('recurring_transfers')
    .select('*, from_account:accounts!recurring_transfers_from_account_id_fkey(*), to_account:accounts!recurring_transfers_to_account_id_fkey(*)')
    .eq('user_id', userId)
    .order('next_date', { ascending: true });

  if (filters.isActive !== undefined) query = query.eq('is_active', filters.isActive);

  const { data, error } = await query;
  if (error) throw { statusCode: 500, message: error.message };
  return data;
}

export async function createRecurringTransfer(
  client: SupabaseClient,
  userId: string,
  payload: {
    from_account_id: string;
    to_account_id: string;
    amount: number;
    description?: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval_value?: number;
    day_of_month?: number | null;
    start_date: string;
    end_date?: string | null;
    is_active?: boolean;
  }
): Promise<RecurringTransferRow> {
  if (payload.from_account_id === payload.to_account_id) {
    throw { statusCode: 400, message: 'Source and destination accounts must be different' };
  }

  // Verify both accounts exist and belong to user
  const { data: accounts, error: accountsError } = await client
    .from('accounts')
    .select('id')
    .eq('user_id', userId)
    .in('id', [payload.from_account_id, payload.to_account_id]);

  if (accountsError) throw { statusCode: 500, message: accountsError.message };
  if (!accounts || accounts.length !== 2) {
    throw { statusCode: 400, message: 'Both accounts must exist and belong to you' };
  }

  const intervalValue = payload.interval_value ?? 1;
  const nextDate = computeNextDate(payload.start_date, payload.frequency, intervalValue, payload.day_of_month ?? null);

  const insertData: Record<string, unknown> = {
    user_id: userId,
    from_account_id: payload.from_account_id,
    to_account_id: payload.to_account_id,
    amount: payload.amount,
    description: payload.description ?? '',
    frequency: payload.frequency,
    interval_value: intervalValue,
    day_of_month: payload.day_of_month ?? null,
    start_date: payload.start_date,
    end_date: payload.end_date ?? null,
    next_date: nextDate,
    is_active: payload.is_active ?? true,
  };

  const { data, error } = await client
    .from('recurring_transfers')
    .insert(insertData)
    .select('*, from_account:accounts!recurring_transfers_from_account_id_fkey(*), to_account:accounts!recurring_transfers_to_account_id_fkey(*)')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  return data;
}

export async function updateRecurringTransfer(
  client: SupabaseClient,
  userId: string,
  id: string,
  updates: Partial<{
    from_account_id: string;
    to_account_id: string;
    amount: number;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
    interval_value: number;
    day_of_month: number | null;
    start_date: string;
    end_date: string | null;
    is_active: boolean;
    next_date: string;
  }>
): Promise<RecurringTransferRow> {
  if (updates.from_account_id && updates.to_account_id && updates.from_account_id === updates.to_account_id) {
    throw { statusCode: 400, message: 'Source and destination accounts must be different' };
  }

  // If schedule fields changed, recompute next_date
  if (updates.frequency || updates.interval_value || updates.day_of_month !== undefined || updates.start_date) {
    const { data: current } = await client
      .from('recurring_transfers')
      .select('frequency, interval_value, day_of_month, start_date, next_date')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (current) {
      const freq = (updates.frequency ?? current.frequency) as 'daily' | 'weekly' | 'monthly' | 'yearly';
      const interval = updates.interval_value ?? current.interval_value;
      const day = updates.day_of_month !== undefined ? updates.day_of_month : current.day_of_month;
      const startDate = updates.start_date ?? current.start_date;

      updates.next_date = computeNextDate(startDate, freq, interval, day);
    }
  }

  const { data, error } = await client
    .from('recurring_transfers')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, from_account:accounts!recurring_transfers_from_account_id_fkey(*), to_account:accounts!recurring_transfers_to_account_id_fkey(*)')
    .single();

  if (error) throw { statusCode: 400, message: error.message };
  if (!data) throw { statusCode: 404, message: 'Recurring transfer not found' };
  return data;
}

export async function deleteRecurringTransfer(client: SupabaseClient, userId: string, id: string): Promise<void> {
  const { error } = await client
    .from('recurring_transfers')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) throw { statusCode: 400, message: error.message };
}

// ─── Process Due Items ─────────────────────────────────────────────

const MAX_ITERATIONS = 12;

export async function processDueItems(
  client: SupabaseClient,
  userId: string
): Promise<{ transactionsGenerated: number; transfersGenerated: number }> {
  const today = new Date().toISOString().split('T')[0];
  let transactionsGenerated = 0;
  let transfersGenerated = 0;

  // Process recurring transactions
  const { data: dueTransactions, error: txError } = await client
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('next_date', today);

  if (txError) throw { statusCode: 500, message: txError.message };

  if (dueTransactions) {
    for (const item of dueTransactions) {
      // Verify account still exists
      const { data: account } = await client
        .from('accounts')
        .select('id')
        .eq('id', item.account_id)
        .eq('user_id', userId)
        .single();

      if (!account) {
        // Account was deleted — deactivate the recurring item
        await client
          .from('recurring_transactions')
          .update({ is_active: false })
          .eq('id', item.id);
        continue;
      }

      let currentDate = item.next_date;
      let iterations = 0;

      while (currentDate <= today && iterations < MAX_ITERATIONS) {
        // Check end_date
        if (item.end_date && currentDate > item.end_date) break;

        // Create the transaction
        await client
          .from('transactions')
          .insert({
            user_id: userId,
            account_id: item.account_id,
            category_id: item.category_id,
            amount: item.amount,
            type: item.type,
            description: item.description,
            date: currentDate,
            metadata: { recurring: true, recurring_transaction_id: item.id },
          });

        transactionsGenerated++;
        iterations++;

        // Advance next_date
        const nextDate = computeNextDate(
          currentDate,
          item.frequency,
          item.interval_value,
          item.day_of_month
        );

        currentDate = nextDate;
      }

      // Update the recurring item with the final next_date and last_generated_at
      const finalNextDate = currentDate;
      await client
        .from('recurring_transactions')
        .update({
          next_date: finalNextDate,
          last_generated_at: new Date().toISOString(),
        })
        .eq('id', item.id);
    }
  }

  // Process recurring transfers
  const { data: dueTransfers, error: tfError } = await client
    .from('recurring_transfers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('next_date', today);

  if (tfError) throw { statusCode: 500, message: tfError.message };

  if (dueTransfers) {
    for (const item of dueTransfers) {
      // Verify both accounts still exist
      const { data: accounts } = await client
        .from('accounts')
        .select('id')
        .eq('user_id', userId)
        .in('id', [item.from_account_id, item.to_account_id]);

      if (!accounts || accounts.length !== 2) {
        // One or both accounts deleted — deactivate
        await client
          .from('recurring_transfers')
          .update({ is_active: false })
          .eq('id', item.id);
        continue;
      }

      let currentDate = item.next_date;
      let iterations = 0;

      while (currentDate <= today && iterations < MAX_ITERATIONS) {
        if (item.end_date && currentDate > item.end_date) break;

        await client
          .from('transfers')
          .insert({
            user_id: userId,
            from_account_id: item.from_account_id,
            to_account_id: item.to_account_id,
            amount: item.amount,
            description: item.description,
            date: currentDate,
          });

        transfersGenerated++;
        iterations++;

        const nextDate = computeNextDate(
          currentDate,
          item.frequency,
          item.interval_value,
          item.day_of_month
        );

        currentDate = nextDate;
      }

      const finalNextDate = currentDate;
      await client
        .from('recurring_transfers')
        .update({
          next_date: finalNextDate,
          last_generated_at: new Date().toISOString(),
        })
        .eq('id', item.id);
    }
  }

  return { transactionsGenerated, transfersGenerated };
}

// Process all users' due items (for cron)
export async function processAllDueItems(
  supabaseAdmin: SupabaseClient
): Promise<{ usersProcessed: number; transactionsGenerated: number; transfersGenerated: number }> {
  const today = new Date().toISOString().split('T')[0];

  // Get all distinct user_ids that have due recurring items
  const { data: txUsers } = await supabaseAdmin
    .from('recurring_transactions')
    .select('user_id')
    .eq('is_active', true)
    .lte('next_date', today);

  const { data: tfUsers } = await supabaseAdmin
    .from('recurring_transfers')
    .select('user_id')
    .eq('is_active', true)
    .lte('next_date', today);

  const userIds = new Set([
    ...(txUsers?.map(r => r.user_id) ?? []),
    ...(tfUsers?.map(r => r.user_id) ?? []),
  ]);

  // We can't create authenticated clients for each user in a cron job,
  // so we use supabaseAdmin (service role) which bypasses RLS.
  // The processDueItems function needs to work with admin client too.
  let totalTransactions = 0;
  let totalTransfers = 0;

  for (const userId of userIds) {
    try {
      const result = await processDueItemsWithAdmin(supabaseAdmin, userId, today);
      totalTransactions += result.transactionsGenerated;
      totalTransfers += result.transfersGenerated;
    } catch {
      // Continue processing other users even if one fails
    }
  }

  return {
    usersProcessed: userIds.size,
    transactionsGenerated: totalTransactions,
    transfersGenerated: totalTransfers,
  };
}

// Variant that uses admin client (bypasses RLS) for cron processing
async function processDueItemsWithAdmin(
  admin: SupabaseClient,
  userId: string,
  today: string
): Promise<{ transactionsGenerated: number; transfersGenerated: number }> {
  let transactionsGenerated = 0;
  let transfersGenerated = 0;

  const { data: dueTransactions } = await admin
    .from('recurring_transactions')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('next_date', today);

  if (dueTransactions) {
    for (const item of dueTransactions) {
      const { data: account } = await admin
        .from('accounts')
        .select('id')
        .eq('id', item.account_id)
        .single();

      if (!account) {
        await admin.from('recurring_transactions').update({ is_active: false }).eq('id', item.id);
        continue;
      }

      let currentDate = item.next_date;
      let iterations = 0;

      while (currentDate <= today && iterations < MAX_ITERATIONS) {
        if (item.end_date && currentDate > item.end_date) break;

        await admin.from('transactions').insert({
          user_id: userId,
          account_id: item.account_id,
          category_id: item.category_id,
          amount: item.amount,
          type: item.type,
          description: item.description,
          date: currentDate,
          metadata: { recurring: true, recurring_transaction_id: item.id },
        });

        transactionsGenerated++;
        iterations++;

        currentDate = computeNextDate(currentDate, item.frequency, item.interval_value, item.day_of_month);
      }

      await admin.from('recurring_transactions').update({
        next_date: currentDate,
        last_generated_at: new Date().toISOString(),
      }).eq('id', item.id);
    }
  }

  const { data: dueTransfers } = await admin
    .from('recurring_transfers')
    .select('*')
    .eq('user_id', userId)
    .eq('is_active', true)
    .lte('next_date', today);

  if (dueTransfers) {
    for (const item of dueTransfers) {
      const { data: accounts } = await admin
        .from('accounts')
        .select('id')
        .eq('user_id', userId)
        .in('id', [item.from_account_id, item.to_account_id]);

      if (!accounts || accounts.length !== 2) {
        await admin.from('recurring_transfers').update({ is_active: false }).eq('id', item.id);
        continue;
      }

      let currentDate = item.next_date;
      let iterations = 0;

      while (currentDate <= today && iterations < MAX_ITERATIONS) {
        if (item.end_date && currentDate > item.end_date) break;

        await admin.from('transfers').insert({
          user_id: userId,
          from_account_id: item.from_account_id,
          to_account_id: item.to_account_id,
          amount: item.amount,
          description: item.description,
          date: currentDate,
        });

        transfersGenerated++;
        iterations++;

        currentDate = computeNextDate(currentDate, item.frequency, item.interval_value, item.day_of_month);
      }

      await admin.from('recurring_transfers').update({
        next_date: currentDate,
        last_generated_at: new Date().toISOString(),
      }).eq('id', item.id);
    }
  }

  return { transactionsGenerated, transfersGenerated };
}