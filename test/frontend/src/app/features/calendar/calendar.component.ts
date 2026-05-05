import { Component, OnInit, signal, computed, inject, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { Transaction } from '../../shared/models/transaction.model';
import { WwCurrencyPipe } from '../../shared/pipes/currency.pipe';
import { WwDateFormatPipe } from '../../shared/pipes/date-format.pipe';
import { TransactionsService } from '../transactions/services/transactions.service';

interface CalendarCell {
  key: string;
  day: number | null;
  isToday: boolean;
  income: number;
  expenses: number;
  transactions: Transaction[];
}

@Component({
  selector: 'ww-calendar',
  standalone: true,
  imports: [WwCurrencyPipe, WwDateFormatPipe],
  template: `
    <div class="calendar-page">
      <div class="calendar-page__header">
        <h1>Calendar</h1>
        <div class="calendar-nav">
          <button class="ww-btn" (click)="prevMonth()">&lt;</button>
          <span class="calendar-nav__label">{{ monthLabel() }} {{ viewYear() }}</span>
          <button class="ww-btn" (click)="nextMonth()">&gt;</button>
        </div>
      </div>

      @if (isLoading()) {
        <div class="calendar-loading">Loading...</div>
      }

      <div class="calendar-grid">
        <div class="calendar-grid__header">
          @for (day of weekDays; track day) {
            <div class="calendar-grid__day-name">{{ day }}</div>
          }
        </div>
        <div class="calendar-grid__body">
          @for (cell of calendarCells(); track cell.key) {
            <div class="calendar-cell"
                 [class.calendar-cell--empty]="!cell.day"
                 [class.calendar-cell--today]="cell.isToday"
                 [class.calendar-cell--selected]="cell.key === selectedDay()"
                 (click)="onDayClick(cell)">
              @if (cell.day) {
                <div class="calendar-cell__day-number">{{ cell.day }}</div>
                <div class="calendar-cell__amounts">
                  @if (cell.income > 0) {
                    <span class="calendar-cell__income">+{{ cell.income | wwCurrency }}</span>
                  }
                  @if (cell.expenses > 0) {
                    <span class="calendar-cell__expense">-{{ cell.expenses | wwCurrency }}</span>
                  }
                </div>
                @if ((cell.income > 0 || cell.expenses > 0)) {
                  <div class="calendar-cell__dot-indicator">
                    @if (cell.income > 0 && cell.expenses > 0) {
                      <span class="calendar-cell__dot calendar-cell__dot--income"></span>
                      <span class="calendar-cell__dot calendar-cell__dot--expense"></span>
                    } @else if (cell.income > 0) {
                      <span class="calendar-cell__dot calendar-cell__dot--income"></span>
                    } @else {
                      <span class="calendar-cell__dot calendar-cell__dot--expense"></span>
                    }
                  </div>
                }
              }
            </div>
          }
        </div>
      </div>

      @if (selectedDayTransactions().length > 0) {
        <div class="calendar-detail ww-card" #detailSection>
          <h3>{{ selectedDay() | wwDateFormat }}</h3>
          <table class="calendar-detail__table calendar-detail__desktop">
            <thead>
              <tr>
                <th>Description</th>
                <th>Category</th>
                <th>Type</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              @for (t of selectedDayTransactions(); track t.id) {
                <tr>
                  <td>{{ t.description }}</td>
                  <td>{{ t.category?.name || 'Uncategorized' }}</td>
                  <td>
                    <span class="type-badge"
                          [class.type-badge--income]="t.type === 'income'"
                          [class.type-badge--expense]="t.type === 'expense'">
                      {{ t.type }}
                    </span>
                  </td>
                  <td [class.ww-text-income]="t.type === 'income'"
                      [class.ww-text-expense]="t.type === 'expense'">
                    {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | wwCurrency }}
                  </td>
                </tr>
              }
            </tbody>
          </table>
          <div class="calendar-detail__mobile">
            @for (t of selectedDayTransactions(); track t.id) {
              <div class="detail-card">
                <div class="detail-card__row">
                  <span class="detail-card__desc">{{ t.description }}</span>
                  <span [class.ww-text-income]="t.type === 'income'"
                        [class.ww-text-expense]="t.type === 'expense'"
                        class="detail-card__amount">
                    {{ t.type === 'income' ? '+' : '-' }}{{ t.amount | wwCurrency }}
                  </span>
                </div>
                <div class="detail-card__meta">
                  <span class="type-badge"
                        [class.type-badge--income]="t.type === 'income'"
                        [class.type-badge--expense]="t.type === 'expense'">
                    {{ t.type }}
                  </span>
                  <span>{{ t.category?.name || 'Uncategorized' }}</span>
                </div>
              </div>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .calendar-page__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .calendar-nav {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .calendar-nav__label {
      font-family: var(--ww-font-heading);
      font-weight: 600;
      font-size: 1.125rem;
      color: var(--ww-text-header);
      min-width: 140px;
      text-align: center;
    }
    .calendar-loading {
      text-align: center;
      padding: 2rem;
      color: var(--ww-text-main);
    }
    .calendar-grid__header {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background-color: var(--ww-border);
      border: 1px solid var(--ww-border);
      border-radius: var(--ww-radius) var(--ww-radius) 0 0;
      overflow: hidden;
    }
    .calendar-grid__day-name {
      padding: 0.5rem;
      text-align: center;
      font-size: 0.75rem;
      text-transform: uppercase;
      font-weight: 600;
      color: var(--ww-text-main);
      background-color: var(--ww-bg-card);
    }
    .calendar-grid__body {
      display: grid;
      grid-template-columns: repeat(7, 1fr);
      gap: 1px;
      background-color: var(--ww-border);
      border: 1px solid var(--ww-border);
      border-top: none;
      border-radius: 0 0 var(--ww-radius) var(--ww-radius);
      overflow: hidden;
    }
    .calendar-cell {
      background-color: var(--ww-bg-card);
      padding: 0.375rem;
      min-height: 70px;
      cursor: pointer;
      transition: background-color 0.15s;
    }
    .calendar-cell:hover {
      background-color: var(--ww-bg-page);
    }
    .calendar-cell--empty {
      cursor: default;
      background-color: var(--ww-bg-page);
      min-height: auto;
    }
    .calendar-cell--empty:hover {
      background-color: var(--ww-bg-page);
    }
    .calendar-cell--today {
      border: 2px solid var(--ww-blue);
    }
    .calendar-cell--selected {
      background-color: rgba(var(--ww-blue-rgb), 0.08);
    }
    .calendar-cell__day-number {
      font-size: 0.8125rem;
      font-weight: 600;
      color: var(--ww-text-header);
      margin-bottom: 0.25rem;
    }
    .calendar-cell__amounts {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    .calendar-cell__income {
      font-family: var(--ww-font-data);
      font-size: 0.6875rem;
      color: var(--ww-green);
    }
    .calendar-cell__expense {
      font-family: var(--ww-font-data);
      font-size: 0.6875rem;
      color: var(--ww-red);
    }
    .calendar-cell__dot-indicator {
      display: none;
    }
    .calendar-detail {
      margin-top: 1.5rem;
    }
    .calendar-detail h3 {
      margin-bottom: 1rem;
    }
    .calendar-detail__table {
      width: 100%;
      border-collapse: collapse;
    }
    .calendar-detail__table th {
      text-align: left;
      padding: 0.75rem 1rem;
      border-bottom: 2px solid var(--ww-border);
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ww-text-main);
    }
    .calendar-detail__table td {
      padding: 0.75rem 1rem;
      border-bottom: 1px solid var(--ww-border);
      font-size: 0.875rem;
    }
    .type-badge {
      display: inline-block;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      font-size: 0.6875rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .type-badge--income {
      background-color: rgba(var(--ww-blue-rgb), 0.08);
      color: var(--ww-green);
    }
    .type-badge--expense {
      background-color: rgba(var(--ww-blue-rgb), 0.08);
      color: var(--ww-red);
    }
    .calendar-detail__mobile {
      display: none;
    }
    .detail-card {
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--ww-border);
    }
    .detail-card:last-child {
      border-bottom: none;
    }
    .detail-card__row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.5rem;
      margin-bottom: 0.375rem;
    }
    .detail-card__desc {
      font-size: 0.875rem;
      font-weight: 500;
    }
    .detail-card__amount {
      font-family: var(--ww-font-data);
      font-size: 0.875rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .detail-card__meta {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.75rem;
      color: var(--ww-text-main);
    }
    @media (max-width: 768px) {
      .calendar-grid__day-name {
        padding: 0.375rem 0.25rem;
        font-size: 0.625rem;
      }
      .calendar-cell {
        min-height: 44px;
        padding: 0.25rem;
        position: relative;
      }
      .calendar-cell__amounts {
        display: none;
      }
      .calendar-cell__dot-indicator {
        display: flex;
        gap: 2px;
        justify-content: center;
        margin-top: 2px;
      }
      .calendar-cell__dot {
        width: 5px;
        height: 5px;
        border-radius: 50%;
      }
      .calendar-cell__dot--income {
        background-color: var(--ww-green);
      }
      .calendar-cell__dot--expense {
        background-color: var(--ww-red);
      }
      .calendar-cell__day-number {
        font-size: 0.6875rem;
      }
      .calendar-nav__label {
        min-width: 100px;
        font-size: 1rem;
      }
      .calendar-detail {
        margin-top: 1rem;
        padding: 1rem;
      }
      .calendar-detail h3 {
        font-size: 1rem;
        margin-bottom: 0.75rem;
      }
      .calendar-detail__table th,
      .calendar-detail__table td {
        padding: 0.5rem;
        font-size: 0.75rem;
      }
      .calendar-detail__desktop {
        display: none;
      }
      .calendar-detail__mobile {
        display: block;
      }
      .detail-card {
        padding: 0.75rem 0.5rem;
        border-bottom: 1px solid var(--ww-border);
      }
      .detail-card__desc {
        font-size: 0.8125rem;
        color: var(--ww-text-header);
      }
      .detail-card__amount {
        font-size: 0.8125rem;
      }
      .detail-card__meta {
        font-size: 0.6875rem;
      }
    }
  `],
})
export class CalendarComponent implements OnInit, AfterViewChecked {
  private transactionsService = inject(TransactionsService);

  @ViewChild('detailSection') detailSection!: ElementRef<HTMLElement>;
  private shouldScrollToDetail = false;

  viewMonth = signal(new Date().getMonth());
  viewYear = signal(new Date().getFullYear());
  selectedDay = signal<string | null>(null);
  calendarTransactions = signal<Transaction[]>([]);
  isLoading = signal(false);

  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  monthLabel = computed(() =>
    new Date(this.viewYear(), this.viewMonth()).toLocaleString('default', { month: 'long' })
  );

  calendarCells = computed((): CalendarCell[] => {
    const year = this.viewYear();
    const month = this.viewMonth();
    const txns = this.calendarTransactions();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const today = new Date();

    // Build map of date string -> aggregated data
    const dayMap = new Map<string, { income: number; expenses: number; transactions: Transaction[] }>();
    for (const t of txns) {
      if (!dayMap.has(t.date)) {
        dayMap.set(t.date, { income: 0, expenses: 0, transactions: [] });
      }
      const entry = dayMap.get(t.date)!;
      entry.transactions.push(t);
      if (t.type === 'income') entry.income += Number(t.amount);
      else entry.expenses += Number(t.amount);
    }

    const cells: CalendarCell[] = [];

    // Empty cells before day 1
    for (let i = 0; i < firstDay; i++) {
      cells.push({ key: `empty-${i}`, day: null, isToday: false, income: 0, expenses: 0, transactions: [] });
    }

    // Day cells
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const data = dayMap.get(dateStr) ?? { income: 0, expenses: 0, transactions: [] };
      const isToday = year === today.getFullYear() && month === today.getMonth() && d === today.getDate();
      cells.push({ key: dateStr, day: d, isToday, ...data });
    }

    return cells;
  });

  selectedDayTransactions = computed((): Transaction[] => {
    const day = this.selectedDay();
    if (!day) return [];
    const cell = this.calendarCells().find(c => c.key === day);
    return cell?.transactions ?? [];
  });

  ngOnInit(): void {
    this.loadMonth();
  }

  private loadMonth(): void {
    const year = this.viewYear();
    const month = this.viewMonth();
    const from = `${year}-${String(month + 1).padStart(2, '0')}-01`;
    const lastDay = new Date(year, month + 1, 0).getDate();
    const to = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

    this.isLoading.set(true);
    this.transactionsService.list({ from, to }).subscribe({
      next: (data) => {
        this.calendarTransactions.set(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      },
    });
  }

  prevMonth(): void {
    const m = this.viewMonth();
    const y = this.viewYear();
    if (m === 0) {
      this.viewMonth.set(11);
      this.viewYear.set(y - 1);
    } else {
      this.viewMonth.set(m - 1);
    }
    this.selectedDay.set(null);
    this.loadMonth();
  }

  nextMonth(): void {
    const m = this.viewMonth();
    const y = this.viewYear();
    if (m === 11) {
      this.viewMonth.set(0);
      this.viewYear.set(y + 1);
    } else {
      this.viewMonth.set(m + 1);
    }
    this.selectedDay.set(null);
    this.loadMonth();
  }

  onDayClick(cell: CalendarCell): void {
    if (!cell.day) return;
    const key = cell.key;
    this.selectedDay.update(prev => prev === key ? null : key);
    this.shouldScrollToDetail = true;
  }

  ngAfterViewChecked(): void {
    if (this.shouldScrollToDetail && this.detailSection) {
      this.detailSection.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      this.shouldScrollToDetail = false;
    }
  }
}