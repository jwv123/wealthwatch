import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionStore } from '../../../../stores/transaction.store';
import { AccountStore } from '../../../../stores/account.store';
import { TransactionsService } from '../../services/transactions.service';
import { WwCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { WwDateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'ww-transaction-list',
  standalone: true,
  imports: [CommonModule, WwCurrencyPipe, WwDateFormatPipe],
  template: `
    <div class="transaction-list ww-card">
      <div class="transaction-list__desktop" *ngIf="TransactionStore.filteredTransactions().length > 0; else noData">
        <table class="transaction-list__table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Account</th>
              <th>Category</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let t of TransactionStore.filteredTransactions()">
              <td>{{ t.date | wwDateFormat }}</td>
              <td>
                {{ t.description }}
                <span class="misc-badge" *ngIf="t.metadata?.is_misc">Misc</span>
                <span class="recurring-badge" *ngIf="t.metadata?.recurring">Recurring</span>
              </td>
              <td>{{ getAccountName(t.account_id) }}</td>
              <td>{{ t.category?.name || 'Uncategorized' }}</td>
              <td>
                <span class="type-badge" [class.type-badge--income]="t.type === 'income'" [class.type-badge--expense]="t.type === 'expense'">
                  {{ t.type }}
                </span>
              </td>
              <td [class.ww-text-income]="t.type === 'income'" [class.ww-text-expense]="t.type === 'expense'">
                {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | wwCurrency }}
              </td>
              <td>
                <button class="ww-btn ww-btn-danger btn-sm" (click)="onDelete(t.id)">Delete</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="transaction-list__mobile" *ngIf="TransactionStore.filteredTransactions().length > 0">
        @for (t of TransactionStore.filteredTransactions(); track t.id) {
          <div class="transaction-card">
            <div class="transaction-card__row">
              <span class="transaction-card__desc">
                {{ t.description }}
                @if (t.metadata?.is_misc) {
                  <span class="misc-badge">Misc</span>
                }
                @if (t.metadata?.recurring) {
                  <span class="recurring-badge">Recurring</span>
                }
              </span>
              <span [class.ww-text-income]="t.type === 'income'" [class.ww-text-expense]="t.type === 'expense'"
                    class="transaction-card__amount">
                {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | wwCurrency }}
              </span>
            </div>
            <div class="transaction-card__meta">
              <span class="type-badge" [class.type-badge--income]="t.type === 'income'" [class.type-badge--expense]="t.type === 'expense'">
                {{ t.type }}
              </span>
              <span>{{ getAccountName(t.account_id) }}</span>
              <span>{{ t.category?.name || 'Uncategorized' }}</span>
              <span>{{ t.date | wwDateFormat }}</span>
            </div>
            <button class="ww-btn ww-btn-danger btn-sm transaction-card__delete" (click)="onDelete(t.id)">Delete</button>
          </div>
        }
      </div>
      <ng-template #noData>
        <p class="transaction-list__empty ww-text-muted">No transactions found</p>
      </ng-template>
    </div>
  `,
  styles: [`
    .transaction-list__mobile {
      display: none;
    }
    .transaction-list__desktop {
      display: block;
    }
    .transaction-list__table {
      width: 100%;
      border-collapse: collapse;
    }
    .transaction-list__table th {
      text-align: left;
      padding: 0.75rem 1rem;
      border-bottom: 2px solid var(--ww-border);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ww-text-main);
    }
    .transaction-list__table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--ww-border);
      font-size: 0.875rem;
    }
    .transaction-list__empty {
      text-align: center;
      padding: 2rem;
    }
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.75rem;
    }
    .recurring-badge {
      display: inline-block;
      background-color: rgba(var(--ww-blue-rgb), 0.08);
      color: var(--ww-blue);
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 3px;
      margin-left: 0.5rem;
      text-transform: uppercase;
      font-weight: 600;
      letter-spacing: 0.03em;
    }
    .misc-badge {
      display: inline-block;
      background-color: var(--ww-blue);
      color: #fff;
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 3px;
      margin-left: 0.5rem;
      text-transform: uppercase;
    }
    .type-badge {
      display: inline-block;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 3px;
      text-transform: capitalize;
    }
    .type-badge--income {
      background-color: rgba(46, 204, 113, 0.15);
      color: var(--ww-green);
    }
    .type-badge--expense {
      background-color: rgba(231, 76, 60, 0.15);
      color: var(--ww-red);
    }
    .transaction-card {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--ww-border);
    }
    .transaction-card:last-child {
      border-bottom: none;
    }
    .transaction-card__row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.375rem;
    }
    .transaction-card__desc {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .transaction-card__amount {
      font-family: var(--ww-font-data);
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .transaction-card__meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--ww-text-main);
      margin-bottom: 0.5rem;
      flex-wrap: wrap;
    }
    .transaction-card__delete {
      font-size: 0.6875rem;
    }
    @media (max-width: 768px) {
      .transaction-list__desktop {
        display: none;
      }
      .transaction-list__mobile {
        display: block;
      }
    }
  `],
})
export class TransactionListComponent {
  TransactionStore = TransactionStore;
  AccountStore = AccountStore;

  constructor(private transactionsService: TransactionsService) {}

  getAccountName(accountId: string): string {
    return AccountStore.byId().get(accountId)?.name ?? 'Unknown';
  }

  onDelete(id: string): void {
    if (!confirm('Delete this transaction?')) return;
    this.transactionsService.delete(id).subscribe({
      next: () => TransactionStore.removeTransaction(id),
      error: () => TransactionStore.setError('Failed to delete transaction'),
    });
  }
}