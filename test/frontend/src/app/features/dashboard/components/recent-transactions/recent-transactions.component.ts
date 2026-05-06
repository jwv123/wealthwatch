import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../../shared/models/transaction.model';
import { AccountStore } from '../../../../stores/account.store';
import { WwCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { WwDateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'ww-recent-transactions',
  standalone: true,
  imports: [CommonModule, WwCurrencyPipe, WwDateFormatPipe],
  template: `
    <div class="recent-desktop" *ngIf="transactions.length > 0; else noData">
      <table class="recent-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>Description</th>
            <th>Account</th>
            <th>Category</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let t of transactions | slice:0:10">
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
          </tr>
        </tbody>
      </table>
    </div>
    <div class="recent-mobile" *ngIf="transactions.length > 0">
      @for (t of transactions.slice(0, 10); track t.id) {
        <div class="recent-card">
          <div class="recent-card__row">
            <span class="recent-card__desc">
              {{ t.description }}
              @if (t.metadata?.is_misc) {
                <span class="misc-badge">Misc</span>
              }
              @if (t.metadata?.recurring) {
                <span class="recurring-badge">Recurring</span>
              }
            </span>
            <span [class.ww-text-income]="t.type === 'income'" [class.ww-text-expense]="t.type === 'expense'"
                  class="recent-card__amount">
              {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | wwCurrency }}
            </span>
          </div>
          <div class="recent-card__meta">
            <span class="type-badge" [class.type-badge--income]="t.type === 'income'" [class.type-badge--expense]="t.type === 'expense'">
              {{ t.type }}
            </span>
            <span>{{ getAccountName(t.account_id) }}</span>
            <span>{{ t.category?.name || 'Uncategorized' }}</span>
            <span>{{ t.date | wwDateFormat }}</span>
          </div>
        </div>
      }
    </div>
    <ng-template #noData>
      <p class="recent-table__empty ww-text-muted">No transactions yet. Add your first one!</p>
    </ng-template>
  `,
  styles: [`
    .recent-mobile {
      display: none;
    }
    .recent-desktop {
      display: block;
    }
    .recent-table {
      width: 100%;
      border-collapse: collapse;
    }
    .recent-table th {
      text-align: left;
      padding: 0.75rem 1rem;
      border-bottom: 2px solid var(--ww-border);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ww-text-main);
    }
    .recent-table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--ww-border);
      font-size: 0.875rem;
    }
    .recent-table__empty {
      text-align: center;
      padding: 2rem;
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
    .recent-card {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--ww-border);
    }
    .recent-card:last-child {
      border-bottom: none;
    }
    .recent-card__row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.375rem;
    }
    .recent-card__desc {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .recent-card__amount {
      font-family: var(--ww-font-data);
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .recent-card__meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--ww-text-main);
    }
    @media (max-width: 768px) {
      .recent-desktop {
        display: none;
      }
      .recent-mobile {
        display: block;
      }
    }
  `],
})
export class RecentTransactionsComponent {
  @Input() transactions: Transaction[] = [];
  AccountStore = AccountStore;

  getAccountName(accountId: string): string {
    return AccountStore.byId().get(accountId)?.name ?? 'Unknown';
  }
}