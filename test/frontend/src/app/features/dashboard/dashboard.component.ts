import { Component, OnInit, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { TransactionStore } from '../../stores/transaction.store';
import { CategoryStore } from '../../stores/category.store';
import { DashboardStore, PeriodScope } from '../../stores/dashboard.store';
import { DashboardService } from './services/dashboard.service';
import { WwCurrencyPipe } from '../../shared/pipes/currency.pipe';
import { NetBalanceCardComponent } from './components/net-balance-card/net-balance-card.component';
import { ExpenseDoughnutComponent } from './components/expense-doughnut/expense-doughnut.component';
import { IncomeExpenseBarComponent } from './components/income-expense-bar/income-expense-bar.component';
import { RecentTransactionsComponent } from './components/recent-transactions/recent-transactions.component';

@Component({
  selector: 'ww-dashboard',
  standalone: true,
  imports: [
    RouterLink,
    WwCurrencyPipe,
    NetBalanceCardComponent,
    ExpenseDoughnutComponent,
    IncomeExpenseBarComponent,
    RecentTransactionsComponent,
  ],
  template: `
    <div class="dashboard">
      <h1 class="dashboard__title">Dashboard</h1>

      @if (hasTransactions()) {
      <div class="dashboard__period-toggle">
        <div class="period-toggle__btn-group">
          @for (s of scopes; track s.value) {
            <button class="ww-btn"
                    [class.ww-btn-primary]="DashboardStore.scope() === s.value"
                    (click)="setScope(s.value)">
              {{ s.label }}
            </button>
          }
        </div>

        @if (DashboardStore.scope() === 'month') {
          <div class="period-toggle__selectors">
            <select class="ww-input" (change)="onMonthChange($event)">
              @for (m of months; track m.value) {
                <option [value]="m.value" [selected]="m.value === DashboardStore.selectedMonth()">
                  {{ m.label }}
                </option>
              }
            </select>
            <select class="ww-input" (change)="onYearChange($event)">
              @for (y of years; track y) {
                <option [value]="y" [selected]="y === DashboardStore.selectedYear()">{{ y }}</option>
              }
            </select>
          </div>
        }

        @if (DashboardStore.scope() === 'year') {
          <select class="ww-input" (change)="onYearChange($event)">
            @for (y of years; track y) {
              <option [value]="y" [selected]="y === DashboardStore.selectedYear()">{{ y }}</option>
            }
          </select>
        }
      </div>

      <div class="dashboard__summary">
        <div class="ww-card dashboard__card">
          <span class="dashboard__card-label">Total Income</span>
          <span class="dashboard__card-value ww-text-income">
            {{ summaryIncome() | wwCurrency }}
          </span>
        </div>
        <div class="ww-card dashboard__card">
          <span class="dashboard__card-label">Total Expenses</span>
          <span class="dashboard__card-value ww-text-expense">
            {{ summaryExpenses() | wwCurrency }}
          </span>
        </div>
        <ww-net-balance-card [balance]="summaryNetBalance()" />
      </div>

      <div class="dashboard__charts">
        <div class="ww-card dashboard__chart-card">
          <h3>Expense Breakdown</h3>
          <ww-expense-doughnut [transactions]="filteredTransactions()" />
        </div>
        <div class="ww-card dashboard__chart-card">
          <h3>Income vs Expenses</h3>
          <ww-income-expense-bar
            [transactions]="filteredTransactions()"
            [scope]="DashboardStore.scope()"
            [year]="DashboardStore.selectedYear()" />
        </div>
      </div>

      <div class="ww-card">
        <h3>Recent Transactions</h3>
        <ww-recent-transactions [transactions]="TransactionStore.transactions()" />
      </div>
      } @else {
      <div class="dashboard__empty ww-card">
        <svg class="dashboard__empty-icon" xmlns="http://www.w3.org/2000/svg" width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4"/>
          <path d="M4 6v12c0 1.1.9 2 2 2h14v-4"/>
          <path d="M18 12a2 2 0 0 0 0 4h4v-4z"/>
          <circle cx="7" cy="12" r="0.5" fill="currentColor"/>
        </svg>
        <h2 class="dashboard__empty-title">No transactions yet</h2>
        <p class="dashboard__empty-text">Start tracking your finances by adding your first income or expense.</p>
        <a routerLink="/transactions" class="ww-btn ww-btn-primary dashboard__empty-btn">
          Add Transaction
        </a>
      </div>
      }
    </div>
  `,
  styles: [`
    .dashboard__title {
      margin-bottom: 1.5rem;
    }
    .dashboard__period-toggle {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
    }
    .period-toggle__btn-group {
      display: flex;
      border: 1px solid var(--ww-border);
      border-radius: var(--ww-radius);
      overflow: hidden;
    }
    .period-toggle__btn-group .ww-btn {
      border-radius: 0;
      border-right: 1px solid var(--ww-border);
      padding: 0.5rem 1rem;
      font-size: 0.8125rem;
      background-color: var(--ww-bg-card);
      color: var(--ww-text-main);
    }
    .period-toggle__btn-group .ww-btn:last-child {
      border-right: none;
    }
    .period-toggle__btn-group .ww-btn-primary {
      background-color: var(--ww-blue);
      color: #fff;
    }
    .period-toggle__selectors {
      display: flex;
      gap: 0.5rem;
    }
    .period-toggle__selectors .ww-input {
      max-width: 150px;
    }
    .dashboard__summary {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .dashboard__card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .dashboard__card-label {
      font-size: 0.8125rem;
      color: var(--ww-text-main);
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .dashboard__card-value {
      font-size: 1.5rem;
      font-weight: 600;
      font-family: var(--ww-font-data);
    }
    .dashboard__charts {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .dashboard__chart-card h3 {
      margin-bottom: 1rem;
    }
    @media (max-width: 900px) {
      .dashboard__charts {
        grid-template-columns: 1fr;
      }
    }
    @media (max-width: 768px) {
      .dashboard__summary {
        grid-template-columns: 1fr;
      }
      .dashboard__period-toggle {
        flex-direction: column;
        align-items: flex-start;
      }
    }
    .dashboard__empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      padding: 3rem 1.5rem;
      max-width: 420px;
      margin: 2rem auto;
    }
    .dashboard__empty-icon {
      color: var(--ww-blue);
      opacity: 0.6;
      margin-bottom: 1.25rem;
    }
    .dashboard__empty-title {
      font-size: 1.25rem;
      margin-bottom: 0.5rem;
    }
    .dashboard__empty-text {
      font-size: 0.875rem;
      color: var(--ww-text-main);
      margin-bottom: 1.5rem;
      line-height: 1.5;
    }
    .dashboard__empty-btn {
      text-decoration: none;
    }
  `],
})
export class DashboardComponent implements OnInit {
  TransactionStore = TransactionStore;
  DashboardStore = DashboardStore;

  private dashboardService = inject(DashboardService);
  private http = inject(HttpClient);

  scopes: { value: PeriodScope; label: string }[] = [
    { value: 'month', label: 'Monthly' },
    { value: 'year', label: 'Yearly' },
    { value: 'all', label: 'All Time' },
  ];

  months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
  }));

  years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);

  summaryIncome = computed(() => DashboardStore.summary()?.totalIncome ?? 0);
  summaryExpenses = computed(() => DashboardStore.summary()?.totalExpenses ?? 0);
  summaryNetBalance = computed(() => DashboardStore.summary()?.netBalance ?? 0);

  hasTransactions = computed(() => TransactionStore.transactions().length > 0);

  filteredTransactions = computed(() => {
    const txns = TransactionStore.transactions();
    const from = DashboardStore.dateFrom();
    const to = DashboardStore.dateTo();
    if (!from && !to) return txns;
    return txns.filter((t) => {
      if (from && t.date < from) return false;
      if (to && t.date > to) return false;
      return true;
    });
  });

  ngOnInit(): void {
    this.loadTransactions();
    this.loadCategories();
    this.loadReports();
  }

  setScope(scope: PeriodScope): void {
    DashboardStore.setScope(scope);
    this.loadReports();
  }

  onMonthChange(event: Event): void {
    DashboardStore.setMonth(parseInt((event.target as HTMLSelectElement).value));
    this.loadReports();
  }

  onYearChange(event: Event): void {
    DashboardStore.setYear(parseInt((event.target as HTMLSelectElement).value));
    this.loadReports();
  }

  private loadReports(): void {
    const scope = DashboardStore.scope();
    const year = DashboardStore.selectedYear();

    DashboardStore.setLoading(true);

    if (scope === 'all') {
      this.dashboardService.getSummary().subscribe({
        next: (data) => DashboardStore.setSummary(data),
        error: () => DashboardStore.setError('Failed to load summary'),
      });
      this.dashboardService.getMonthly().subscribe({
        next: (data) => DashboardStore.setMonthly(data),
        error: () => DashboardStore.setError('Failed to load monthly data'),
      });
    } else {
      this.dashboardService.getSummary(year).subscribe({
        next: (data) => DashboardStore.setSummary(data),
        error: () => DashboardStore.setError('Failed to load summary'),
      });
      this.dashboardService.getMonthly(year).subscribe({
        next: (data) => DashboardStore.setMonthly(data),
        error: () => DashboardStore.setError('Failed to load monthly data'),
      });
    }
  }

  private loadTransactions(): void {
    TransactionStore.setLoading(true);
    this.http.get<any[]>(`${environment.apiBaseUrl}/transactions`).subscribe({
      next: (data) => TransactionStore.setTransactions(data),
      error: () => TransactionStore.setError('Failed to load transactions'),
    });
  }

  private loadCategories(): void {
    CategoryStore.setLoading(true);
    this.http.get<any[]>(`${environment.apiBaseUrl}/categories`).subscribe({
      next: (data) => CategoryStore.setCategories(data),
      error: () => CategoryStore.setError('Failed to load categories'),
    });
  }
}