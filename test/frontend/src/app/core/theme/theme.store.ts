import { signal, computed } from '@angular/core';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  mode: ThemeMode;
  resolved: 'light' | 'dark';
}

const STORAGE_KEY = 'ww-theme';

function getSystemPreference(): 'light' | 'dark' {
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function getInitialMode(): ThemeMode {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') return getSystemPreference();
  return mode;
}

const _state = signal<ThemeState>({
  mode: getInitialMode(),
  resolved: resolveTheme(getInitialMode()),
});

export const ThemeStore = {
  mode: computed(() => _state().mode),
  resolved: computed(() => _state().resolved),
  isDark: computed(() => _state().resolved === 'dark'),

  setMode(mode: ThemeMode): void {
    const resolved = resolveTheme(mode);
    _state.update((s) => ({ ...s, mode, resolved }));
    localStorage.setItem(STORAGE_KEY, mode);
    document.documentElement.setAttribute('data-theme', resolved);
  },

  initialize(): void {
    const resolved = resolveTheme(_state().mode);
    document.documentElement.setAttribute('data-theme', resolved);
    _state.update((s) => ({ ...s, resolved }));

    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
      if (_state().mode === 'system') {
        const newResolved = getSystemPreference();
        _state.update((s) => ({ ...s, resolved: newResolved }));
        document.documentElement.setAttribute('data-theme', newResolved);
      }
    });
  },
};