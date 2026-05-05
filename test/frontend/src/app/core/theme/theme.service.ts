import { Injectable } from '@angular/core';
import { ThemeStore } from './theme.store';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  mode = ThemeStore.mode;
  resolved = ThemeStore.resolved;
  isDark = ThemeStore.isDark;

  setMode(mode: 'light' | 'dark' | 'system'): void {
    ThemeStore.setMode(mode);
  }

  initialize(): void {
    ThemeStore.initialize();
  }
}