import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WwCurrencyPipe } from '../../../../shared/pipes/currency.pipe';

@Component({
  selector: 'ww-net-balance-card',
  standalone: true,
  imports: [CommonModule, WwCurrencyPipe],
  template: `
    <div class="ww-card dashboard__card" [class.dashboard__card--negative]="balance < 0">
      <span class="dashboard__card-label">Net Balance</span>
      <span class="dashboard__card-value" [class.ww-text-income]="balance >= 0" [class.ww-text-expense]="balance < 0">
        {{ balance | wwCurrency }}
      </span>
    </div>
  `,
  styles: [`
    .dashboard__card {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .dashboard__card--negative {
      border-left: 3px solid var(--ww-red);
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
  `],
})
export class NetBalanceCardComponent {
  @Input() balance: number = 0;
}