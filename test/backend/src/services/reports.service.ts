import { SupabaseClient } from '@supabase/supabase-js';

export async function getSummary(client: SupabaseClient, userId: string, year?: number) {
  const isAllTime = year === undefined;

  let query = client
    .from('transactions')
    .select('*, category:categories(*)')
    .eq('user_id', userId);

  if (!isAllTime) {
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
  }

  const { data: transactions, error } = await query;

  if (error) throw { statusCode: 500, message: error.message };

  const totalIncome = transactions
    .filter((t: any) => t.type === 'income')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const totalExpenses = transactions
    .filter((t: any) => t.type === 'expense')
    .reduce((sum: number, t: any) => sum + Number(t.amount), 0);

  const byCategory: Record<string, { name: string; color: string; total: number; type: string }> = {};
  for (const t of transactions) {
    const key = t.category?.name ?? 'Uncategorized';
    if (!byCategory[key]) {
      byCategory[key] = {
        name: key,
        color: t.category?.color ?? '#795548',
        total: 0,
        type: t.type,
      };
    }
    byCategory[key].total += Number(t.amount);
  }

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    byCategory: Object.values(byCategory),
    year: isAllTime ? null : year!,
  };
}

export async function getMonthly(client: SupabaseClient, userId: string, year?: number) {
  const isAllTime = year === undefined;

  let query = client
    .from('transactions')
    .select('type, amount, date')
    .eq('user_id', userId);

  if (!isAllTime) {
    query = query.gte('date', `${year}-01-01`).lte('date', `${year}-12-31`);
  }

  const { data: transactions, error } = await query;

  if (error) throw { statusCode: 500, message: error.message };

  if (isAllTime) {
    const yearMap = new Map<number, { income: number; expenses: number }>();
    for (const t of transactions) {
      const yr = new Date(t.date + 'T00:00:00').getFullYear();
      if (!yearMap.has(yr)) yearMap.set(yr, { income: 0, expenses: 0 });
      const entry = yearMap.get(yr)!;
      if (t.type === 'income') entry.income += Number(t.amount);
      else entry.expenses += Number(t.amount);
    }
    const sorted = [...yearMap.entries()].sort((a, b) => a[0] - b[0]);
    return {
      year: null,
      months: sorted.map(([yr, data]) => ({
        month: String(yr),
        income: data.income,
        expenses: data.expenses,
      })),
    };
  }

  const months: { month: string; income: number; expenses: number }[] = [];
  for (let m = 0; m < 12; m++) {
    const monthStr = `${year}-${String(m + 1).padStart(2, '0')}`;
    const monthName = new Date(year!, m).toLocaleString('default', { month: 'short' });
    const monthTransactions = transactions.filter((t: any) => t.date.startsWith(monthStr));
    months.push({
      month: monthName,
      income: monthTransactions
        .filter((t: any) => t.type === 'income')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0),
      expenses: monthTransactions
        .filter((t: any) => t.type === 'expense')
        .reduce((sum: number, t: any) => sum + Number(t.amount), 0),
    });
  }

  return { year: year!, months };
}