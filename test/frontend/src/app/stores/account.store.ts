import { signal, computed } from '@angular/core';
import { Account } from '../shared/models/account.model';

interface AccountState {
  accounts: Account[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AccountState = {
  accounts: [],
  isLoading: false,
  error: null,
};

const _state = signal<AccountState>(initialState);

export const AccountStore = {
  accounts: computed(() => _state().accounts),
  isLoading: computed(() => _state().isLoading),
  error: computed(() => _state().error),

  defaultAccount: computed(() =>
    _state().accounts.find((a) => a.is_default) ?? _state().accounts[0] ?? null
  ),

  byId: computed(() => {
    const map = new Map<string, Account>();
    _state().accounts.forEach((a) => map.set(a.id, a));
    return map;
  }),

  totalBalance: computed(() =>
    _state().accounts.reduce((sum, a) => sum + Number(a.balance), 0)
  ),

  setAccounts: (accounts: Account[]) =>
    _state.update((s) => ({ ...s, accounts, isLoading: false })),

  addAccount: (account: Account) =>
    _state.update((s) => ({
      ...s,
      accounts: [...s.accounts, account],
    })),

  updateAccount: (id: string, updates: Partial<Account>) =>
    _state.update((s) => ({
      ...s,
      accounts: s.accounts.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),

  removeAccount: (id: string) =>
    _state.update((s) => ({
      ...s,
      accounts: s.accounts.filter((a) => a.id !== id),
    })),

  setLoading: (isLoading: boolean) =>
    _state.update((s) => ({ ...s, isLoading })),

  setError: (error: string | null) =>
    _state.update((s) => ({ ...s, error })),

  reset: () => _state.set(initialState),
};