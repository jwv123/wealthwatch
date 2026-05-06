import { signal, computed } from '@angular/core';
import { RecurringTransaction, RecurringTransfer } from '../shared/models/recurring.model';

interface RecurringState {
  recurringTransactions: RecurringTransaction[];
  recurringTransfers: RecurringTransfer[];
  isLoading: boolean;
  error: string | null;
}

const initialState: RecurringState = {
  recurringTransactions: [],
  recurringTransfers: [],
  isLoading: false,
  error: null,
};

const _state = signal<RecurringState>(initialState);

export const RecurringStore = {
  recurringTransactions: computed(() => _state().recurringTransactions),
  recurringTransfers: computed(() => _state().recurringTransfers),
  isLoading: computed(() => _state().isLoading),
  error: computed(() => _state().error),

  activeRecurringTransactions: computed(() =>
    _state().recurringTransactions.filter(r => r.is_active)
  ),
  activeRecurringTransfers: computed(() =>
    _state().recurringTransfers.filter(r => r.is_active)
  ),

  setRecurringTransactions: (items: RecurringTransaction[]) =>
    _state.update(s => ({ ...s, recurringTransactions: items, isLoading: false })),

  setRecurringTransfers: (items: RecurringTransfer[]) =>
    _state.update(s => ({ ...s, recurringTransfers: items, isLoading: false })),

  addRecurringTransaction: (item: RecurringTransaction) =>
    _state.update(s => ({
      ...s,
      recurringTransactions: [item, ...s.recurringTransactions],
    })),

  updateRecurringTransaction: (id: string, updates: Partial<RecurringTransaction>) =>
    _state.update(s => ({
      ...s,
      recurringTransactions: s.recurringTransactions.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeRecurringTransaction: (id: string) =>
    _state.update(s => ({
      ...s,
      recurringTransactions: s.recurringTransactions.filter(t => t.id !== id),
    })),

  addRecurringTransfer: (item: RecurringTransfer) =>
    _state.update(s => ({
      ...s,
      recurringTransfers: [item, ...s.recurringTransfers],
    })),

  updateRecurringTransfer: (id: string, updates: Partial<RecurringTransfer>) =>
    _state.update(s => ({
      ...s,
      recurringTransfers: s.recurringTransfers.map(t =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeRecurringTransfer: (id: string) =>
    _state.update(s => ({
      ...s,
      recurringTransfers: s.recurringTransfers.filter(t => t.id !== id),
    })),

  setLoading: (isLoading: boolean) =>
    _state.update(s => ({ ...s, isLoading })),

  setError: (error: string | null) =>
    _state.update(s => ({ ...s, error })),

  reset: () => _state.set(initialState),
};