import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, switchMap, filter, catchError, EMPTY } from 'rxjs';
import { CurrencyService } from '../../core/currency/currency.service';
import { AuthStore } from '../../stores/auth.store';
import { ThemeStore } from '../../core/theme/theme.store';
import { OnboardingStore } from '../../stores/onboarding.store';
import { TransactionStore } from '../../stores/transaction.store';
import { TransactionsService } from '../transactions/services/transactions.service';
import { CURRENCIES } from './currencies';

@Component({
  selector: 'ww-settings',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="settings">
      <h1 class="settings__title">Settings</h1>

      <div class="ww-card settings__section">
        <h2 class="settings__section-title">Appearance</h2>
        <p class="settings__description">
          Choose how WealthWatch looks. Dark mode is easier on the eyes in low light.
        </p>

        <div class="theme-toggle">
          <button class="theme-toggle__btn"
                  [class.theme-toggle__btn--active]="ThemeStore.mode() === 'light'"
                  (click)="setTheme('light')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/>
              <line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
              <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
            </svg>
            Light
          </button>
          <button class="theme-toggle__btn"
                  [class.theme-toggle__btn--active]="ThemeStore.mode() === 'dark'"
                  (click)="setTheme('dark')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
            </svg>
            Dark
          </button>
          <button class="theme-toggle__btn"
                  [class.theme-toggle__btn--active]="ThemeStore.mode() === 'system'"
                  (click)="setTheme('system')">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24"
                 fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/>
              <line x1="8" y1="21" x2="16" y2="21"/>
              <line x1="12" y1="17" x2="12" y2="21"/>
            </svg>
            System
          </button>
        </div>
      </div>

      <div class="ww-card settings__section">
        <h2 class="settings__section-title">Currency</h2>
        <p class="settings__description">
          Choose the default currency for displaying monetary values.
        </p>

        <label class="ww-label" for="currency-select">Default Currency</label>
        <select
          id="currency-select"
          class="ww-input settings__select"
          [formControl]="currencyControl"
          [class.settings__select--saving]="isSaving()"
        >
          @for (c of currencies; track c.code) {
            <option [value]="c.code">{{ c.code }} - {{ c.name }}</option>
          }
        </select>

        @if (isSaving()) {
          <span class="settings__status settings__status--saving">Saving...</span>
        }

        @if (saveError()) {
          <span class="settings__status settings__status--error">{{ saveError() }}</span>
        }
      </div>

      <div class="ww-card settings__section">
        <h2 class="settings__section-title">Tutorial</h2>
        <p class="settings__description">
          Walk through the app features again with the onboarding tutorial.
        </p>
        <button class="ww-btn ww-btn-primary settings__restart-btn"
                (click)="restartTutorial()">
          Restart Tutorial
        </button>
      </div>

      <div class="ww-card settings__section settings__section--danger">
        <h2 class="settings__section-title">Danger Zone</h2>
        <p class="settings__description">
          Permanently delete all your transaction data. This cannot be undone.
        </p>
        <button class="ww-btn ww-btn-danger settings__danger-btn"
                (click)="deleteAllTransactions()"
                [disabled]="isDeleting()">
          {{ isDeleting() ? 'Deleting...' : 'Delete All Transactions' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .settings__title {
      margin-bottom: 1.5rem;
    }
    .settings__section {
      max-width: 480px;
    }
    @media (max-width: 768px) {
      .settings__section {
        max-width: 100%;
      }
      .theme-toggle {
        flex-wrap: wrap;
      }
    }
    .settings__section-title {
      font-size: 1.125rem;
      margin-bottom: 0.5rem;
    }
    .settings__description {
      font-size: 0.875rem;
      color: var(--ww-text-main);
      margin-bottom: 1rem;
    }
    .settings__select {
      margin-top: 0.25rem;
      cursor: pointer;
    }
    .settings__select--saving {
      opacity: 0.6;
    }
    .settings__status {
      display: block;
      font-size: 0.75rem;
      margin-top: 0.5rem;
    }
    .settings__status--saving {
      color: var(--ww-blue);
    }
    .settings__status--error {
      color: var(--ww-red);
    }
    .theme-toggle {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    .theme-toggle__btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border: 1px solid var(--ww-border);
      border-radius: var(--ww-radius);
      background: var(--ww-glass-bg);
      backdrop-filter: blur(var(--ww-glass-blur));
      -webkit-backdrop-filter: blur(var(--ww-glass-blur));
      color: var(--ww-text-main);
      font-family: var(--ww-font-body);
      font-size: 0.8125rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .theme-toggle__btn:hover {
      border-color: var(--ww-blue);
      color: var(--ww-blue);
    }
    .theme-toggle__btn--active {
      border-color: var(--ww-blue);
      background: rgba(var(--ww-blue-rgb), 0.12);
      color: var(--ww-blue);
      font-weight: 600;
    }
    .settings__restart-btn {
      margin-top: 0.75rem;
    }
    .settings__section--danger {
      border: 1px solid var(--ww-red);
      border-color: rgba(var(--ww-blue-rgb), 0.08);
    }
    .settings__danger-btn {
      margin-top: 0.75rem;
    }
  `],
})
export class SettingsComponent {
  private currencyService = inject(CurrencyService);
  private transactionsService = inject(TransactionsService);
  ThemeStore = ThemeStore;

  isSaving = signal(false);
  saveError = signal<string | null>(null);
  isDeleting = signal(false);
  currencies = CURRENCIES;

  currencyControl = new FormControl(this.currencyService.currency(), { nonNullable: true });

  constructor() {
    this.currencyControl.valueChanges.pipe(
      debounceTime(500),
      distinctUntilChanged(),
      filter(() => this.currencyControl.valid),
      switchMap((code) => {
        this.isSaving.set(true);
        this.saveError.set(null);
        return this.currencyService.updateCurrency(code).pipe(
          catchError(() => {
            this.saveError.set('Failed to update currency. Please try again.');
            this.isSaving.set(false);
            return EMPTY;
          })
        );
      })
    ).subscribe(() => {
      this.isSaving.set(false);
    });
  }

  setTheme(mode: 'light' | 'dark' | 'system'): void {
    ThemeStore.setMode(mode);
  }

  restartTutorial(): void {
    OnboardingStore.start();
  }

  deleteAllTransactions(): void {
    if (!confirm('Are you sure you want to delete ALL your transactions? This cannot be undone.')) return;
    if (!confirm('This will permanently remove every transaction record. Proceed?')) return;
    this.isDeleting.set(true);
    this.transactionsService.deleteAll().subscribe({
      next: () => {
        TransactionStore.setTransactions([]);
        this.isDeleting.set(false);
      },
      error: () => {
        this.isDeleting.set(false);
      },
    });
  }
}