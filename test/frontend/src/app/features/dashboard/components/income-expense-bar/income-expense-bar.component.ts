import { Component, input, computed, inject } from '@angular/core';
import { BaseChartDirective } from 'ng2-charts';
import { CurrencyService } from '../../../../core/currency/currency.service';
import { ThemeStore } from '../../../../core/theme/theme.store';
import { Transaction } from '../../../../shared/models/transaction.model';

export type ChartScope = 'month' | 'year' | 'all';

@Component({
  selector: 'ww-income-expense-bar',
  standalone: true,
  imports: [BaseChartDirective],
  template: `
    @if (chartData().labels.length > 0) {
    <div class="bar-container">
      <canvas baseChart [data]="chartData()" [options]="chartOptions()" [type]="'bar'"></canvas>
    </div>
    } @else {
    <p class="bar__empty ww-text-muted">No transaction data to display</p>
    }
  `,
  styles: [`
    .bar-container {
      width: 100%;
      min-height: 250px;
    }
    .bar__empty {
      text-align: center;
      padding: 2rem;
    }
  `],
})
export class IncomeExpenseBarComponent {
  private currencyService = inject(CurrencyService);

  transactions = input<Transaction[]>([]);
  scope = input<ChartScope>('year');
  year = input<number | null>(new Date().getFullYear());

  private getCSSVar(name: string): string {
    return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  }

  chartData = computed(() => {
    const txns = this.transactions();
    const currentScope = this.scope();
    const currentYear = this.year() ?? new Date().getFullYear();
    const _theme = ThemeStore.resolved(); // dependency for theme reactivity
    const green = this.getCSSVar('--ww-green');
    const red = this.getCSSVar('--ww-red');

    if (currentScope === 'all') {
      const yearMap = new Map<number, { income: number; expenses: number }>();
      for (const t of txns) {
        const yr = new Date(t.date + 'T00:00:00').getFullYear();
        if (!yearMap.has(yr)) yearMap.set(yr, { income: 0, expenses: 0 });
        const entry = yearMap.get(yr)!;
        if (t.type === 'income') entry.income += Number(t.amount);
        else entry.expenses += Number(t.amount);
      }
      const sorted = [...yearMap.entries()].sort((a, b) => a[0] - b[0]);
      return {
        labels: sorted.map(([yr]) => String(yr)),
        datasets: [
          {
            label: 'Income',
            data: sorted.map(([, d]) => d.income),
            backgroundColor: green,
            borderRadius: 4,
          },
          {
            label: 'Expenses',
            data: sorted.map(([, d]) => d.expenses),
            backgroundColor: red,
            borderRadius: 4,
          },
        ],
      };
    }

    const months: string[] = [];
    const incomeData: number[] = [];
    const expenseData: number[] = [];

    for (let m = 0; m < 12; m++) {
      const monthStr = `${currentYear}-${String(m + 1).padStart(2, '0')}`;
      const monthName = new Date(currentYear, m).toLocaleString('default', { month: 'short' });
      const monthTxns = txns.filter((t) => t.date.startsWith(monthStr));

      months.push(monthName);
      incomeData.push(
        monthTxns.filter((t) => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0)
      );
      expenseData.push(
        monthTxns.filter((t) => t.type === 'expense').reduce((s, t) => s + Number(t.amount), 0)
      );
    }

    return {
      labels: months,
      datasets: [
        {
          label: 'Income',
          data: incomeData,
          backgroundColor: green,
          borderRadius: 4,
        },
        {
          label: 'Expenses',
          data: expenseData,
          backgroundColor: red,
          borderRadius: 4,
        },
      ],
    };
  });

  chartOptions = computed(() => {
    const _theme = ThemeStore.resolved(); // dependency for theme reactivity
    const symbol = this.currencyService.currencySymbol();
    const gridColor = this.getCSSVar('--ww-chart-grid');
    const labelColor = this.getCSSVar('--ww-chart-label');
    const legendColor = this.getCSSVar('--ww-chart-legend');
    return {
      responsive: true,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: labelColor, font: { family: 'Montserrat' } },
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: labelColor,
            font: { family: 'JetBrains Mono' },
            callback: (value: string | number) => `${symbol}${Number(value).toLocaleString()}`,
          },
        },
      },
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { color: legendColor, font: { family: 'Montserrat' } },
        },
        tooltip: {
          callbacks: {
            label: (ctx: any) => `${ctx.dataset.label}: ${symbol}${ctx.parsed.y.toFixed(2)}`,
          },
        },
      },
    };
  });
}