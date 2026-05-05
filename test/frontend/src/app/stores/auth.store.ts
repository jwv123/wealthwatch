import { signal, computed } from '@angular/core';
import { Profile } from '../shared/models/profile.model';

interface AuthState {
  user: Profile | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  user: null,
  token: null,
  isLoading: true,
  error: null,
};

const _state = signal<AuthState>(initialState);

export const AuthStore = {
  user: computed(() => _state().user),
  token: computed(() => _state().token),
  isLoading: computed(() => _state().isLoading),
  error: computed(() => _state().error),
  isAuthenticated: computed(() => _state().user !== null),

  setUser: (user: Profile | null) =>
    _state.update((s) => ({ ...s, user, isLoading: false, error: null })),

  setToken: (token: string | null) =>
    _state.update((s) => ({ ...s, token })),

  setLoading: (isLoading: boolean) =>
    _state.update((s) => ({ ...s, isLoading })),

  setError: (error: string | null) =>
    _state.update((s) => ({ ...s, error, isLoading: false })),

  reset: () => _state.set({ ...initialState, isLoading: false }),
};