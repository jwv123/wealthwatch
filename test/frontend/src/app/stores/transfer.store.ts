import { signal, computed } from '@angular/core';
import { Transfer } from '../shared/models/transfer.model';

interface TransferState {
  transfers: Transfer[];
  isLoading: boolean;
  error: string | null;
}

const initialState: TransferState = {
  transfers: [],
  isLoading: false,
  error: null,
};

const _state = signal<TransferState>(initialState);

export const TransferStore = {
  transfers: computed(() => _state().transfers),
  isLoading: computed(() => _state().isLoading),
  error: computed(() => _state().error),

  setTransfers: (transfers: Transfer[]) =>
    _state.update((s) => ({ ...s, transfers, isLoading: false })),

  addTransfer: (transfer: Transfer) =>
    _state.update((s) => ({
      ...s,
      transfers: [transfer, ...s.transfers],
    })),

  updateTransfer: (id: string, updates: Partial<Transfer>) =>
    _state.update((s) => ({
      ...s,
      transfers: s.transfers.map((t) =>
        t.id === id ? { ...t, ...updates } : t
      ),
    })),

  removeTransfer: (id: string) =>
    _state.update((s) => ({
      ...s,
      transfers: s.transfers.filter((t) => t.id !== id),
    })),

  setLoading: (isLoading: boolean) =>
    _state.update((s) => ({ ...s, isLoading })),

  setError: (error: string | null) =>
    _state.update((s) => ({ ...s, error })),

  reset: () => _state.set(initialState),
};