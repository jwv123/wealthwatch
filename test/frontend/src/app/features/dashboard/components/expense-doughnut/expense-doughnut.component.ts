import { Component, input, computed, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { CurrencyService } from '../../../../core/currency/currency.service';
import { ThemeStore } from '../../../../core/theme/theme.store';
import { Transaction } from '../../../../shared/models/transaction.model';

@Component({
  selector: 'ww-expense-doughnut',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    @if (chartData().labels.length > 0) {
    <div class="doughnut-container">
      <canvas baseChart [data]="chartData()" [options]="chartOptions()" [type]="'doughnut'"></canvas>
    </div>
    } @else {
    <p class="doughnut__empty ww-text-muted">No expense data to display</p>
    }
  `,
  styles: [`
    .doughnut-container {
      max-width: 350px;
      margin: 0 auto;
    }
    .doughnut__empty {
      text-align: center;
      padding: 2rem;
    }
  `],
})
export class ExpenseDoughnutComponent {
  private currencyService = inject(CurrencyService);
  transactions = input<Transaction[]>([]);

  private getCSSVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  chartData = computed(() => {
    const txns = this.transactions();
    const _theme = ThemeStore.resolved(); // dependency for theme reactivity
    const borderColor = this.getCSSVar('--ww-bg-card');
    const expenses = txns.filter((t) => t.type === 'expense');
    const byCategory = new Map<string, { sum: number; color: string; label: string }>();

    for (const t of expenses) {
      const key = t.category?.name ?? 'Uncategorized';
      const existing = byCategory.get(key) ?? {
        sum: 0,
        color: t.category?.color ?? '#795548',
        label: key,
      };
      existing.sum += Number(t.amount);
      byCategory.set(key, existing);
    }

    const entries = [...byCategory.values()];
    return {
      labels: entries.map((e) => e.label),
      datasets: [
        {
          data: entries.map((e) => e.sum),
          backgroundColor: entries.map((e) => e.color),
          borderColor,
          borderWidth: 2,
        },
      ],
    };
  });

  chartOptions = computed(() => {
    const _theme = ThemeStore.resolved(); // dependency for theme reactivity
    const symbol = this.currencyService.currencySymbol();
    const legendColor = this.getCSSVar('--ww-chart-legend');
    return {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { color: legendColor, font: { family: 'Montserrat' } },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.label}: ${symbol}${ctx.parsed.toFixed(2)}`,
          },
        },
      },
      cutout: '65%',
    };
  });
}