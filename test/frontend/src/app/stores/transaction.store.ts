import { signal, computed } from '@angular/core';
import { Transaction } from '../shared/models/transaction.model';

interface TransactionFilter {
  type: 'all' | 'income' | 'expense';
  categoryId: string | null;
  dateFrom: string | null;
  dateTo: string | null;
}

interface TransactionState {
  transactions: Transaction[];
  isLoading: boolean;
  error: string | null;
  filter: TransactionFilter;
}

const initialState: TransactionState = {
  transactions: [],
  isLoading: false,
  error: null,
  filter: { type: 'all', categoryId: null, dateFrom: null, dateTo: null },
};

const _state = signal<TransactionState>(initialState);

export const TransactionStore = {
  transactions: computed(() => _state().transactions),
  isLoading: computed(() => _state().isLoading),
  error: computed(() => _state().error),
  filter: computed(() => _state().filter),

  filteredTransactions: computed(() => {
    const { transactions, filter } = _state();
    return transactions.filter((t) => {
      if (filter.type !== 'all' && t.type !== filter.type) return false;
      if (filter.categoryId && t.category_id !== filter.categoryId) return false;
      if (filter.dateFrom && t.date < filter.dateFrom) return false;
      if (filter.dateTo && t.date > filter.dateTo) return false;
      return true;
    });
  }),

  totalIncome: computed(() =>
    _state()
      .transactions.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  ),

  totalExpenses: computed(() =>
    _state()
      .transactions.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  ),

  netBalance: computed(() =>
    _state()
      .transactions.filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + Number(t.amount), 0) -
    _state()
      .transactions.filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + Number(t.amount), 0)
  ),

  setTransactions: (transactions: Transaction[]) =>
    _state.update((s) => ({ ...s, transactions, isLoading: false })),

  addTransaction: (transaction: Transaction) =>
    _state.update((s) => ({
      ...s,
      transactions: [transaction, ...s.transactions],
    })),

  updateTransaction: (id: string, updates: Partial<Transaction>) =>
    _state.update((s) => ({
      ...s,
      transactions: s.transactions.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeTransaction: (id: string) =>
    _state.update((s) => ({
      ...s,
      transactions: s.transactions.filter((t) => t.id !== id),
    })),

  setFilter: (filter: Partial<TransactionFilter>) =>
    _state.update((s) => ({
      ...s,
      filter: { ...s.filter, ...filter },
    })),

  setLoading: (isLoading: boolean) =>
    _state.update((s) => ({ ...s, isLoading })),

  setError: (error: string | null) =>
    _state.update((s) => ({ ...s, error })),

  reset: () => _state.set(initialState),
};