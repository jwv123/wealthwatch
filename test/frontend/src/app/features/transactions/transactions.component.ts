import { Component, OnInit, signal } from '@angular/core';
import { TransactionStore } from '../../stores/transaction.store';
import { CategoryStore } from '../../stores/category.store';
import { AccountStore } from '../../stores/account.store';
import { TransactionFormComponent } from './components/transaction-form/transaction-form.component';
import { TransactionListComponent } from './components/transaction-list/transaction-list.component';
import { TransactionsService } from './services/transactions.service';
import { AccountsService } from '../accounts/services/accounts.service';

@Component({
  selector: 'ww-transactions',
  standalone: true,
  imports: [TransactionFormComponent, TransactionListComponent],
  template: `
    <div class="transactions-page">
      <div class="transactions-page__header">
        <h1>Transactions</h1>
        <button class="ww-btn ww-btn-primary" (click)="showForm = !showForm">
          {{ showForm ? 'Cancel' : '+ Add Transaction' }}
        </button>
      </div>

      @if (showForm) {
        <ww-transaction-form (save)="onSave($event)" />
      }

      <div class="transactions-page__filters">
        <select class="ww-input" (change)="onAccountFilter($event)">
          <option value="">All Accounts</option>
          @for (acc of AccountStore.accounts(); track acc.id) {
            <option [value]="acc.id">{{ acc.name }}</option>
          }
        </select>
        <select class="ww-input" (change)="onTypeFilter($event)">
          <option value="all">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
        <select class="ww-input" (change)="onCategoryFilter($event)">
          <option value="">All Categories</option>
          @for (cat of CategoryStore.categories(); track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
          }
        </select>
        <select class="ww-input ww-input--month" (change)="onMonthFilter($event)">
          <option value="">All Time</option>
          @for (m of months; track m.value) {
            <option [value]="m.value" [selected]="m.value === selectedMonth()">{{ m.label }}</option>
          }
        </select>
        <select class="ww-input ww-input--year" (change)="onYearFilter($event)">
          @for (y of years; track y) {
            <option [value]="y" [selected]="y === selectedYear()">{{ y }}</option>
          }
        </select>
      </div>

      <ww-transaction-list />
    </div>
  `,
  styles: [`
    .transactions-page__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .transactions-page__filters {
      display: flex;
      gap: 1rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }
    .transactions-page__filters .ww-input {
      max-width: 200px;
    }
    .ww-input--month {
      max-width: 160px;
    }
    .ww-input--year {
      max-width: 110px;
    }
    @media (max-width: 768px) {
      .transactions-page__filters .ww-input {
        max-width: 100%;
      }
      .ww-input--month {
        max-width: 100%;
      }
      .ww-input--year {
        max-width: 100%;
      }
    }
  `],
})
export class TransactionsComponent implements OnInit {
  TransactionStore = TransactionStore;
  CategoryStore = CategoryStore;
  AccountStore = AccountStore;
  showForm = false;

  selectedMonth = signal<number | null>(new Date().getMonth());
  selectedYear = signal(new Date().getFullYear());

  months = Array.from({ length: 12 }, (_, i) => ({
    value: i,
    label: new Date(2000, i).toLocaleString('default', { month: 'long' }),
  }));

  years = Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i);

  constructor(
    private transactionsService: TransactionsService,
    private accountsService: AccountsService,
  ) {}

  ngOnInit(): void {
    this.loadTransactionsIfNeeded();
    this.loadAccountsIfNeeded();
  }

  private loadTransactionsIfNeeded(): void {
    if (TransactionStore.transactions().length > 0 && !TransactionStore.isLoading()) return;
    TransactionStore.setLoading(true);
    this.transactionsService.list().subscribe({
      next: (data) => TransactionStore.setTransactions(data),
      error: () => TransactionStore.setError('Failed to load transactions'),
    });
  }

  private loadAccountsIfNeeded(): void {
    if (AccountStore.accounts().length > 0 && !AccountStore.isLoading()) return;
    this.accountsService.list().subscribe({
      next: (data) => AccountStore.setAccounts(data),
      error: () => {},
    });
  }

  onSave(dto: any): void {
    this.transactionsService.create(dto).subscribe({
      next: (transaction) => {
        TransactionStore.addTransaction(transaction);
        this.showForm = false;
      },
      error: () => TransactionStore.setError('Failed to create transaction'),
    });
  }

  onAccountFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    TransactionStore.setFilter({ accountId: value || null });
  }

  onTypeFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as 'all' | 'income' | 'expense';
    TransactionStore.setFilter({ type: value });
  }

  onCategoryFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    TransactionStore.setFilter({ categoryId: value || null });
  }

  onMonthFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    if (value === '') {
      this.selectedMonth.set(null);
      TransactionStore.setFilter({ dateFrom: null, dateTo: null });
    } else {
      this.selectedMonth.set(parseInt(value));
      this.applyDateFilter();
    }
  }

  onYearFilter(event: Event): void {
    this.selectedYear.set(parseInt((event.target as HTMLSelectElement).value));
    if (this.selectedMonth() !== null) {
      this.applyDateFilter();
    }
  }

  private applyDateFilter(): void {
    const month = this.selectedMonth();
    const year = this.selectedYear();
    if (month === null) {
      TransactionStore.setFilter({ dateFrom: null, dateTo: null });
    } else {
      const dateFrom = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const dateTo = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;
      TransactionStore.setFilter({ dateFrom, dateTo });
    }
  }
}