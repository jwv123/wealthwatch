import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../../shared/models/transaction.model';
import { WwCurrencyPipe } from '../../../../shared/pipes/currency.pipe';
import { WwDateFormatPipe } from '../../../../shared/pipes/date-format.pipe';

@Component({
  selector: 'ww-transaction-detail',
  standalone: true,
  imports: [CommonModule, WwCurrencyPipe, WwDateFormatPipe],
  template: `
    <div class="ww-card transaction-detail" *ngIf="transaction">
      <h3>Transaction Details</h3>
      <div class="transaction-detail__grid">
        <div class="transaction-detail__field">
          <span class="transaction-detail__label">Description</span>
          <span>{{ transaction.description }}</span>
        </div>
        <div class="transaction-detail__field">
          <span class="transaction-detail__label">Amount</span>
          <span [class.ww-text-income]="transaction.type === 'income'" [class.ww-text-expense]="transaction.type === 'expense'">
            {{ transaction.amount | wwCurrency }}
          </span>
        </div>
        <div class="transaction-detail__field">
          <span class="transaction-detail__label">Type</span>
          <span>{{ transaction.type }}</span>
        </div>
        <div class="transaction-detail__field">
          <span class="transaction-detail__label">Category</span>
          <span>{{ transaction.category?.name || 'Uncategorized' }}</span>
        </div>
        <div class="transaction-detail__field">
          <span class="transaction-detail__label">Date</span>
          <span>{{ transaction.date | wwDateFormat }}</span>
        </div>
        <div class="transaction-detail__field" *ngIf="transaction.metadata?.is_misc">
          <span class="transaction-detail__label">Misc</span>
          <span class="misc-badge">Yes</span>
        </div>
        <div class="transaction-detail__field" *ngIf="transaction.metadata?.notes">
          <span class="transaction-detail__label">Notes</span>
          <span>{{ transaction.metadata.notes }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .transaction-detail__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
      margin-top: 1rem;
    }
    .transaction-detail__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .transaction-detail__label {
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ww-text-main);
    }
    .misc-badge {
      display: inline-block;
      background-color: var(--ww-blue);
      color: #fff;
      font-size: 0.625rem;
      padding: 0.125rem 0.375rem;
      border-radius: 3px;
    }
  `],
})
export class TransactionDetailComponent {
  @Input() transaction: Transaction | null = null;
}