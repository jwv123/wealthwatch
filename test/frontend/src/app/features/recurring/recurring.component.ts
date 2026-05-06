import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RecurringStore } from '../../stores/recurring.store';
import { AccountStore } from '../../stores/account.store';
import { CategoryStore } from '../../stores/category.store';
import { RecurringService } from './services/recurring.service';
import {
  RecurringTransaction,
  RecurringTransfer,
  RecurringFrequency,
  CreateRecurringTransactionDTO,
  CreateRecurringTransferDTO,
} from '../../shared/models/recurring.model';
import { WwCurrencyPipe } from '../../shared/pipes/currency.pipe';
import { WwDateFormatPipe } from '../../shared/pipes/date-format.pipe';

const FREQUENCY_LABELS: Record<RecurringFrequency, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  yearly: 'Yearly',
};

function frequencyLabel(freq: RecurringFrequency, interval: number): string {
  if (interval === 1) return FREQUENCY_LABELS[freq];
  const unit = { daily: 'days', weekly: 'weeks', monthly: 'months', yearly: 'years' }[freq];
  return `Every ${interval} ${unit}`;
}

@Component({
  selector: 'ww-recurring',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WwCurrencyPipe, WwDateFormatPipe],
  template: `
    <div class="recurring-page">
      <div class="recurring-page__header">
        <h1>Recurring</h1>
      </div>

      @if (processResult()) {
        <div class="recurring-page__notice ww-card">
          {{ processResult()!.transactionsGenerated }} transaction(s) and {{ processResult()!.transfersGenerated }} transfer(s) generated from recurring items.
        </div>
      }

      <!-- Tab Switcher -->
      <div class="recurring-page__tabs">
        <button class="recurring-page__tab"
                [class.recurring-page__tab--active]="activeTab() === 'transactions'"
                (click)="activeTab.set('transactions')">
          Recurring Income & Expenses
        </button>
        <button class="recurring-page__tab"
                [class.recurring-page__tab--active]="activeTab() === 'transfers'"
                (click)="activeTab.set('transfers')">
          Recurring Transfers
        </button>
      </div>

      <!-- Transactions Tab -->
      @if (activeTab() === 'transactions') {
        <div class="recurring-page__section">
          <div class="recurring-page__section-header">
            <button class="ww-btn ww-btn-primary" (click)="toggleTransactionForm()">
              {{ showTransactionForm() ? 'Cancel' : '+ Add Recurring Transaction' }}
            </button>
          </div>

          @if (showTransactionForm()) {
            <div class="ww-card recurring-page__form-card">
              <h3>{{ editingTransaction() ? 'Edit Recurring Transaction' : 'New Recurring Transaction' }}</h3>
              <form [formGroup]="transactionForm" class="recurring-form" (ngSubmit)="onSaveTransaction()">
                <div class="recurring-form__toggle">
                  <button type="button"
                          class="recurring-form__toggle-btn"
                          [class.recurring-form__toggle-btn--active]="transactionForm.get('type')?.value === 'income'"
                          (click)="transactionForm.patchValue({ type: 'income' })">
                    Income
                  </button>
                  <button type="button"
                          class="recurring-form__toggle-btn"
                          [class.recurring-form__toggle-btn--active]="transactionForm.get('type')?.value === 'expense'"
                          (click)="transactionForm.patchValue({ type: 'expense' })">
                    Expense
                  </button>
                </div>
                <div class="recurring-form__row">
                  <div class="recurring-form__field">
                    <label class="ww-label">Account</label>
                    <select class="ww-input" formControlName="account_id">
                      <option value="">Select account</option>
                      @for (acc of AccountStore.accounts(); track acc.id) {
                        <option [value]="acc.id">{{ acc.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="recurring-form__field">
                    <label class="ww-label">Category</label>
                    <select class="ww-input" formControlName="category_id">
                      <option value="">None</option>
                      @for (cat of filteredCategories(); track cat.id) {
                        <option [value]="cat.id">{{ cat.name }}</option>
                      }
                    </select>
                  </div>
                </div>
                <div class="recurring-form__row">
                  <div class="recurring-form__field">
                    <label class="ww-label">Amount</label>
                    <input class="ww-input" type="number" formControlName="amount" step="0.01" min="0.01" placeholder="0.00" />
                  </div>
                  <div class="recurring-form__field">
                    <label class="ww-label">Description</label>
                    <input class="ww-input" formControlName="description" placeholder="e.g. Salary, Rent" />
                  </div>
                </div>
                <div class="recurring-form__row">
                  <div class="recurring-form__field">
                    <label class="ww-label">Frequency</label>
                    <select class="ww-input" formControlName="frequency">
                      @for (entry of frequencyEntries; track entry[0]) {
                        <option [value]="entry[0]">{{ entry[1] }}</option>
                      }
                    </select>
                  </div>
                  <div class="recurring-form__field">
                    <label class="ww-label">Every</label>
                    <input class="ww-input" type="number" formControlName="interval_value" min="1" max="99" />
                    <span class="recurring-form__hint">{{ intervalLabel() }}</span>
                  </div>
                </div>
                @if (transactionForm.get('frequency')?.value === 'monthly' || transactionForm.get('frequency')?.value === 'yearly') {
                  <div class="recurring-form__field">
                    <label class="ww-label">Day of Month (optional)</label>
                    <input class="ww-input" type="number" formControlName="day_of_month" min="1" max="31" placeholder="Leave empty for same day as start date" />
                  </div>
                }
                <div class="recurring-form__row">
                  <div class="recurring-form__field">
                    <label class="ww-label">Start Date</label>
                    <input class="ww-input" type="date" formControlName="start_date" />
                  </div>
                  <div class="recurring-form__field">
                    <label class="ww-label">End Date (optional)</label>
                    <input class="ww-input" type="date" formControlName="end_date" />
                    <span class="recurring-form__hint">Leave empty for no end date</span>
                  </div>
                </div>
                <div class="recurring-form__actions">
                  <button class="ww-btn ww-btn-primary" type="submit" [disabled]="transactionForm.invalid || isSaving()">
                    {{ isSaving() ? 'Saving...' : (editingTransaction() ? 'Update' : 'Create') }}
                  </button>
                  @if (editingTransaction()) {
                    <button class="ww-btn" type="button" (click)="cancelTransactionEdit()">Cancel</button>
                  }
                </div>
              </form>
            </div>
          }

          <!-- Transactions List -->
          @for (item of RecurringStore.recurringTransactions(); track item.id) {
            <div class="ww-card recurring-card" [class.recurring-card--inactive]="!item.is_active">
              <div class="recurring-card__row">
                <div class="recurring-card__main">
                  <div class="recurring-card__header">
                    <span class="recurring-card__desc">{{ item.description }}</span>
                    <span class="recurring-card__type-badge"
                          [class.recurring-card__type-badge--income]="item.type === 'income'"
                          [class.recurring-card__type-badge--expense]="item.type === 'expense'">
                      {{ item.type }}
                    </span>
                    @if (!item.is_active) {
                      <span class="recurring-card__status-badge recurring-card__status-badge--paused">Paused</span>
                    }
                  </div>
                  <div class="recurring-card__details">
                    <span>{{ item.account?.name ?? 'Unknown account' }}</span>
                    @if (item.category) {
                      <span class="recurring-card__sep">·</span>
                      <span>{{ item.category.name }}</span>
                    }
                    <span class="recurring-card__sep">·</span>
                    <span>{{ getFrequencyLabel(item.frequency, item.interval_value) }}</span>
                    @if (item.day_of_month) {
                      <span class="recurring-card__sep">·</span>
                      <span>on day {{ item.day_of_month }}</span>
                    }
                    <span class="recurring-card__sep">·</span>
                    <span>Next: {{ item.next_date | wwDateFormat }}</span>
                  </div>
                  @if (item.end_date) {
                    <div class="recurring-card__details">Ends: {{ item.end_date | wwDateFormat }}</div>
                  }
                </div>
                <div class="recurring-card__amount" [class.recurring-card__amount--income]="item.type === 'income'" [class.recurring-card__amount--expense]="item.type === 'expense'">
                  {{ item.type === 'income' ? '+' : '-' }}{{ item.amount | wwCurrency }}
                </div>
              </div>
              <div class="recurring-card__actions">
                <button class="ww-btn" style="border: 1px solid var(--ww-border); color: var(--ww-text-main)"
                        (click)="startEditTransaction(item)">Edit</button>
                <button class="ww-btn"
                        [style.border]="'1px solid ' + (item.is_active ? 'var(--ww-red)' : 'var(--ww-green)')"
                        [style.color]="item.is_active ? 'var(--ww-red)' : 'var(--ww-green)'"
                        (click)="toggleTransactionActive(item)">
                  {{ item.is_active ? 'Pause' : 'Resume' }}
                </button>
                <button class="ww-btn ww-btn-danger" (click)="onDeleteTransaction(item)">Delete</button>
              </div>
            </div>
          } @empty {
            @if (!RecurringStore.isLoading()) {
              <div class="ww-card" style="text-align: center; padding: 2rem;">
                <p style="color: var(--ww-text-main)">No recurring transactions yet. Create one to automate regular income or expenses.</p>
              </div>
            }
          }
        </div>
      }

      <!-- Transfers Tab -->
      @if (activeTab() === 'transfers') {
        <div class="recurring-page__section">
          <div class="recurring-page__section-header">
            <button class="ww-btn ww-btn-primary" (click)="toggleTransferForm()">
              {{ showTransferForm() ? 'Cancel' : '+ Add Recurring Transfer' }}
            </button>
          </div>

          @if (showTransferForm()) {
            <div class="ww-card recurring-page__form-card">
              <h3>{{ editingTransfer() ? 'Edit Recurring Transfer' : 'New Recurring Transfer' }}</h3>
              <form [formGroup]="transferForm" class="recurring-form" (ngSubmit)="onSaveTransfer()">
                <div class="recurring-form__row">
                  <div class="recurring-form__field">
                    <label class="ww-label">From Account</label>
                    <select class="ww-input" formControlName="from_account_id">
                      <option value="">Select account</option>
                      @for (acc of AccountStore.accounts(); track acc.id) {
                        <option [value]="acc.id">{{ acc.name }}</option>
                      }
                    </select>
                  </div>
                  <div class="recurring-form__field">
                    <label class="ww-label">To Account</label>
                    <select class="ww-input" formControlName="to_account_id">
                      <option value="">Select account</option>
                      @for (acc of AccountStore.accounts(); track acc.id) {
                        <option [value]="acc.id">{{ acc.name }}</option>
                      }
                    </select>
                  </div>
                </div>
                <div class="recurring-form__row">
                  <div class="recurring-form__field">
                    <label class="ww-label">Amount</label>
                    <input class="ww-input" type="number" formControlName="amount" step="0.01" min="0.01" placeholder="0.00" />
                  </div>
                  <div class="recurring-form__field">
                    <label class="ww-label">Description</label>
                    <input class="ww-input" formControlName="description" placeholder="e.g. Savings transfer" />
                  </div>
                </div>
                <div class="recurring-form__row">
                  <div class="recurring-form__field">
                    <label class="ww-label">Frequency</label>
                    <select class="ww-input" formControlName="frequency">
                      @for (entry of frequencyEntries; track entry[0]) {
                        <option [value]="entry[0]">{{ entry[1] }}</option>
                      }
                    </select>
                  </div>
                  <div class="recurring-form__field">
                    <label class="ww-label">Every</label>
                    <input class="ww-input" type="number" formControlName="interval_value" min="1" max="99" />
                    <span class="recurring-form__hint">{{ transferIntervalLabel() }}</span>
                  </div>
                </div>
                @if (transferForm.get('frequency')?.value === 'monthly' || transferForm.get('frequency')?.value === 'yearly') {
                  <div class="recurring-form__field">
                    <label class="ww-label">Day of Month (optional)</label>
                    <input class="ww-input" type="number" formControlName="day_of_month" min="1" max="31" placeholder="Leave empty for same day as start date" />
                  </div>
                }
                <div class="recurring-form__row">
                  <div class="recurring-form__field">
                    <label class="ww-label">Start Date</label>
                    <input class="ww-input" type="date" formControlName="start_date" />
                  </div>
                  <div class="recurring-form__field">
                    <label class="ww-label">End Date (optional)</label>
                    <input class="ww-input" type="date" formControlName="end_date" />
                    <span class="recurring-form__hint">Leave empty for no end date</span>
                  </div>
                </div>
                <div class="recurring-form__actions">
                  <button class="ww-btn ww-btn-success" type="submit" [disabled]="transferForm.invalid || isSaving()">
                    {{ isSaving() ? 'Saving...' : (editingTransfer() ? 'Update' : 'Create') }}
                  </button>
                  @if (editingTransfer()) {
                    <button class="ww-btn" type="button" (click)="cancelTransferEdit()">Cancel</button>
                  }
                </div>
              </form>
            </div>
          }

          @for (item of RecurringStore.recurringTransfers(); track item.id) {
            <div class="ww-card recurring-card" [class.recurring-card--inactive]="!item.is_active">
              <div class="recurring-card__row">
                <div class="recurring-card__main">
                  <div class="recurring-card__header">
                    <span class="recurring-card__desc">{{ item.description || 'Transfer' }}</span>
                    @if (!item.is_active) {
                      <span class="recurring-card__status-badge recurring-card__status-badge--paused">Paused</span>
                    }
                  </div>
                  <div class="recurring-card__details">
                    <span>{{ item.from_account?.name ?? 'Unknown' }} → {{ item.to_account?.name ?? 'Unknown' }}</span>
                    <span class="recurring-card__sep">·</span>
                    <span>{{ getFrequencyLabel(item.frequency, item.interval_value) }}</span>
                    <span class="recurring-card__sep">·</span>
                    <span>Next: {{ item.next_date | wwDateFormat }}</span>
                  </div>
                  @if (item.end_date) {
                    <div class="recurring-card__details">Ends: {{ item.end_date | wwDateFormat }}</div>
                  }
                </div>
                <div class="recurring-card__amount recurring-card__amount--income">
                  {{ item.amount | wwCurrency }}
                </div>
              </div>
              <div class="recurring-card__actions">
                <button class="ww-btn" style="border: 1px solid var(--ww-border); color: var(--ww-text-main)"
                        (click)="startEditTransfer(item)">Edit</button>
                <button class="ww-btn"
                        [style.border]="'1px solid ' + (item.is_active ? 'var(--ww-red)' : 'var(--ww-green)')"
                        [style.color]="item.is_active ? 'var(--ww-red)' : 'var(--ww-green)'"
                        (click)="toggleTransferActive(item)">
                  {{ item.is_active ? 'Pause' : 'Resume' }}
                </button>
                <button class="ww-btn ww-btn-danger" (click)="onDeleteTransfer(item)">Delete</button>
              </div>
            </div>
          } @empty {
            @if (!RecurringStore.isLoading()) {
              <div class="ww-card" style="text-align: center; padding: 2rem;">
                <p style="color: var(--ww-text-main)">No recurring transfers yet. Create one to automate regular transfers between accounts.</p>
              </div>
            }
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .recurring-page__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .recurring-page__notice {
      margin-bottom: 1rem;
      padding: 0.75rem 1rem;
      background: rgba(46, 204, 113, 0.08);
      border: 1px solid rgba(46, 204, 113, 0.2);
      border-radius: var(--ww-radius);
      color: var(--ww-green);
      font-size: 0.875rem;
    }
    .recurring-page__tabs {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      border-bottom: 2px solid var(--ww-border);
      padding-bottom: 0;
    }
    .recurring-page__tab {
      padding: 0.75rem 1.25rem;
      background: none;
      border: none;
      border-bottom: 2px solid transparent;
      margin-bottom: -2px;
      cursor: pointer;
      font-size: 0.9375rem;
      color: var(--ww-text-main);
      font-weight: 500;
      transition: color 0.2s, border-color 0.2s;
    }
    .recurring-page__tab:hover {
      color: var(--ww-navy);
    }
    .recurring-page__tab--active {
      color: var(--ww-blue);
      border-bottom-color: var(--ww-blue);
    }
    .recurring-page__section-header {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 1rem;
    }
    .recurring-page__form-card {
      margin-bottom: 1.5rem;
    }
    .recurring-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .recurring-form__toggle {
      display: flex;
      gap: 0;
      border-radius: var(--ww-radius);
      overflow: hidden;
      border: 1px solid var(--ww-border);
    }
    .recurring-form__toggle-btn {
      flex: 1;
      padding: 0.625rem;
      border: none;
      background: var(--ww-bg-card);
      color: var(--ww-text-main);
      cursor: pointer;
      font-size: 0.875rem;
      font-weight: 500;
      transition: background 0.2s, color 0.2s;
    }
    .recurring-form__toggle-btn--active {
      font-weight: 600;
    }
    .recurring-form__toggle-btn:first-child.recurring-form__toggle-btn--active {
      background: rgba(46, 204, 113, 0.12);
      color: var(--ww-green);
    }
    .recurring-form__toggle-btn:last-child.recurring-form__toggle-btn--active {
      background: rgba(231, 76, 60, 0.12);
      color: var(--ww-red);
    }
    .recurring-form__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .recurring-form__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .recurring-form__hint {
      font-size: 0.75rem;
      color: var(--ww-text-main);
      margin-top: 0.125rem;
    }
    .recurring-form__actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .recurring-card {
      margin-bottom: 0.75rem;
      transition: opacity 0.2s;
    }
    .recurring-card--inactive {
      opacity: 0.6;
    }
    .recurring-card__row {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 1rem;
    }
    .recurring-card__main {
      flex: 1;
      min-width: 0;
    }
    .recurring-card__header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
      margin-bottom: 0.25rem;
    }
    .recurring-card__desc {
      font-weight: 600;
      color: var(--ww-text-header);
    }
    .recurring-card__type-badge {
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .recurring-card__type-badge--income {
      background: rgba(46, 204, 113, 0.12);
      color: var(--ww-green);
    }
    .recurring-card__type-badge--expense {
      background: rgba(231, 76, 60, 0.12);
      color: var(--ww-red);
    }
    .recurring-card__status-badge {
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .recurring-card__status-badge--paused {
      background: rgba(85, 85, 85, 0.12);
      color: var(--ww-text-main);
    }
    .recurring-card__details {
      font-size: 0.8125rem;
      color: var(--ww-text-main);
      display: flex;
      flex-wrap: wrap;
      gap: 0;
    }
    .recurring-card__sep {
      margin: 0 0.375rem;
    }
    .recurring-card__amount {
      font-family: var(--ww-font-data);
      font-size: 1.125rem;
      font-weight: 600;
      white-space: nowrap;
    }
    .recurring-card__amount--income { color: var(--ww-green); }
    .recurring-card__amount--expense { color: var(--ww-red); }
    .recurring-card__actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.75rem;
    }
    @media (max-width: 768px) {
      .recurring-form__row {
        grid-template-columns: 1fr;
      }
      .recurring-card__row {
        flex-direction: column;
      }
      .recurring-page__tabs {
        flex-wrap: wrap;
      }
    }
  `],
})
export class RecurringComponent implements OnInit {
  RecurringStore = RecurringStore;
  AccountStore = AccountStore;
  CategoryStore = CategoryStore;

  activeTab = signal<'transactions' | 'transfers'>('transactions');
  showTransactionForm = signal(false);
  showTransferForm = signal(false);
  editingTransaction = signal<RecurringTransaction | null>(null);
  editingTransfer = signal<RecurringTransfer | null>(null);
  isSaving = signal(false);
  processResult = signal<{ transactionsGenerated: number; transfersGenerated: number } | null>(null);

  frequencyEntries = Object.entries(FREQUENCY_LABELS);

  transactionForm: FormGroup;
  transferForm: FormGroup;

  filteredCategories = computed(() => {
    const type = this.transactionForm.get('type')?.value as 'income' | 'expense';
    return CategoryStore.categories().filter(c => c.type === type);
  });

  constructor(
    private fb: FormBuilder,
    private recurringService: RecurringService,
  ) {
    const today = new Date().toISOString().split('T')[0];

    this.transactionForm = this.fb.group({
      account_id: ['', Validators.required],
      category_id: [null],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      type: ['expense', Validators.required],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      frequency: ['monthly', Validators.required],
      interval_value: [1, [Validators.required, Validators.min(1)]],
      day_of_month: [null],
      start_date: [today, Validators.required],
      end_date: [null],
    });

    this.transferForm = this.fb.group({
      from_account_id: ['', Validators.required],
      to_account_id: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: [''],
      frequency: ['monthly', Validators.required],
      interval_value: [1, [Validators.required, Validators.min(1)]],
      day_of_month: [null],
      start_date: [today, Validators.required],
      end_date: [null],
    });
  }

  ngOnInit(): void {
    this.loadData();
  }

  private loadData(): void {
    // Process due items first, then load lists
    this.recurringService.processDue().subscribe({
      next: (result) => {
        if (result.transactionsGenerated > 0 || result.transfersGenerated > 0) {
          this.processResult.set(result);
          setTimeout(() => this.processResult.set(null), 5000);
        }
      },
      error: () => {}, // Silently fail - not critical for page load
    });

    RecurringStore.setLoading(true);
    this.recurringService.listRecurringTransactions().subscribe({
      next: (data) => RecurringStore.setRecurringTransactions(data),
      error: () => RecurringStore.setError('Failed to load recurring transactions'),
    });
    this.recurringService.listRecurringTransfers().subscribe({
      next: (data) => RecurringStore.setRecurringTransfers(data),
      error: () => RecurringStore.setError('Failed to load recurring transfers'),
    });

    if (AccountStore.accounts().length === 0 || AccountStore.isLoading()) {
      AccountStore.setLoading(true);
      // Accounts are loaded by their own service
    }
  }

  // ─── Transaction CRUD ──────────────────────────────────────────

  startEditTransaction(item: RecurringTransaction): void {
    this.editingTransaction.set(item);
    this.showTransferForm.set(false);
    this.transactionForm.patchValue({
      account_id: item.account_id,
      category_id: item.category_id,
      amount: item.amount,
      type: item.type,
      description: item.description,
      frequency: item.frequency,
      interval_value: item.interval_value,
      day_of_month: item.day_of_month,
      start_date: item.start_date,
      end_date: item.end_date,
    });
    this.showTransactionForm.set(true);
  }

  cancelTransactionEdit(): void {
    this.editingTransaction.set(null);
    this.showTransactionForm.set(false);
    this.resetTransactionForm();
  }

  onSaveTransaction(): void {
    if (this.transactionForm.invalid) return;
    this.isSaving.set(true);
    const formVal = this.transactionForm.value;

    if (this.editingTransaction()) {
      const dto = {
        account_id: formVal.account_id,
        category_id: formVal.category_id || null,
        amount: formVal.amount,
        type: formVal.type,
        description: formVal.description,
        frequency: formVal.frequency,
        interval_value: formVal.interval_value,
        day_of_month: formVal.day_of_month || null,
        start_date: formVal.start_date,
        end_date: formVal.end_date || null,
      };
      this.recurringService.updateRecurringTransaction(this.editingTransaction()!.id, dto).subscribe({
        next: (updated) => {
          RecurringStore.updateRecurringTransaction(updated.id, updated);
          this.isSaving.set(false);
          this.cancelTransactionEdit();
        },
        error: () => {
          RecurringStore.setError('Failed to update recurring transaction');
          this.isSaving.set(false);
        },
      });
    } else {
      const dto: CreateRecurringTransactionDTO = {
        account_id: formVal.account_id,
        category_id: formVal.category_id || null,
        amount: formVal.amount,
        type: formVal.type,
        description: formVal.description,
        frequency: formVal.frequency,
        interval_value: formVal.interval_value,
        day_of_month: formVal.day_of_month || null,
        start_date: formVal.start_date,
        end_date: formVal.end_date || null,
      };
      this.recurringService.createRecurringTransaction(dto).subscribe({
        next: (item) => {
          RecurringStore.addRecurringTransaction(item);
          this.isSaving.set(false);
          this.showTransactionForm.set(false);
          this.resetTransactionForm();
        },
        error: () => {
          RecurringStore.setError('Failed to create recurring transaction');
          this.isSaving.set(false);
        },
      });
    }
  }

  onDeleteTransaction(item: RecurringTransaction): void {
    if (!confirm(`Delete "${item.description}"? Past generated transactions will not be affected.`)) return;
    this.recurringService.deleteRecurringTransaction(item.id).subscribe({
      next: () => RecurringStore.removeRecurringTransaction(item.id),
      error: () => RecurringStore.setError('Failed to delete recurring transaction'),
    });
  }

  toggleTransactionActive(item: RecurringTransaction): void {
    this.recurringService.updateRecurringTransaction(item.id, { is_active: !item.is_active }).subscribe({
      next: (updated) => RecurringStore.updateRecurringTransaction(updated.id, updated),
      error: () => RecurringStore.setError('Failed to toggle recurring transaction'),
    });
  }

  // ─── Transfer CRUD ────────────────────────────────────────────

  startEditTransfer(item: RecurringTransfer): void {
    this.editingTransfer.set(item);
    this.showTransactionForm.set(false);
    this.transferForm.patchValue({
      from_account_id: item.from_account_id,
      to_account_id: item.to_account_id,
      amount: item.amount,
      description: item.description,
      frequency: item.frequency,
      interval_value: item.interval_value,
      day_of_month: item.day_of_month,
      start_date: item.start_date,
      end_date: item.end_date,
    });
    this.showTransferForm.set(true);
  }

  cancelTransferEdit(): void {
    this.editingTransfer.set(null);
    this.showTransferForm.set(false);
    this.resetTransferForm();
  }

  onSaveTransfer(): void {
    if (this.transferForm.invalid) return;
    this.isSaving.set(true);
    const formVal = this.transferForm.value;

    if (this.editingTransfer()) {
      const dto = {
        from_account_id: formVal.from_account_id,
        to_account_id: formVal.to_account_id,
        amount: formVal.amount,
        description: formVal.description,
        frequency: formVal.frequency,
        interval_value: formVal.interval_value,
        day_of_month: formVal.day_of_month || null,
        start_date: formVal.start_date,
        end_date: formVal.end_date || null,
      };
      this.recurringService.updateRecurringTransfer(this.editingTransfer()!.id, dto).subscribe({
        next: (updated) => {
          RecurringStore.updateRecurringTransfer(updated.id, updated);
          this.isSaving.set(false);
          this.cancelTransferEdit();
        },
        error: () => {
          RecurringStore.setError('Failed to update recurring transfer');
          this.isSaving.set(false);
        },
      });
    } else {
      const dto: CreateRecurringTransferDTO = {
        from_account_id: formVal.from_account_id,
        to_account_id: formVal.to_account_id,
        amount: formVal.amount,
        description: formVal.description,
        frequency: formVal.frequency,
        interval_value: formVal.interval_value,
        day_of_month: formVal.day_of_month || null,
        start_date: formVal.start_date,
        end_date: formVal.end_date || null,
      };
      this.recurringService.createRecurringTransfer(dto).subscribe({
        next: (item) => {
          RecurringStore.addRecurringTransfer(item);
          this.isSaving.set(false);
          this.showTransferForm.set(false);
          this.resetTransferForm();
        },
        error: () => {
          RecurringStore.setError('Failed to create recurring transfer');
          this.isSaving.set(false);
        },
      });
    }
  }

  onDeleteTransfer(item: RecurringTransfer): void {
    if (!confirm(`Delete "${item.description || 'Transfer'}"? Past generated transfers will not be affected.`)) return;
    this.recurringService.deleteRecurringTransfer(item.id).subscribe({
      next: () => RecurringStore.removeRecurringTransfer(item.id),
      error: () => RecurringStore.setError('Failed to delete recurring transfer'),
    });
  }

  toggleTransferActive(item: RecurringTransfer): void {
    this.recurringService.updateRecurringTransfer(item.id, { is_active: !item.is_active }).subscribe({
      next: (updated) => RecurringStore.updateRecurringTransfer(updated.id, updated),
      error: () => RecurringStore.setError('Failed to toggle recurring transfer'),
    });
  }

  // ─── Helpers ──────────────────────────────────────────────────

  getFrequencyLabel(freq: RecurringFrequency, interval: number): string {
    return frequencyLabel(freq, interval);
  }

  intervalLabel(): string {
    const freq = this.transactionForm.get('frequency')?.value as RecurringFrequency;
    const interval = this.transactionForm.get('interval_value')?.value ?? 1;
    return interval === 1 ? FREQUENCY_LABELS[freq].toLowerCase() : frequencyLabel(freq, interval).toLowerCase();
  }

  transferIntervalLabel(): string {
    const freq = this.transferForm.get('frequency')?.value as RecurringFrequency;
    const interval = this.transferForm.get('interval_value')?.value ?? 1;
    return interval === 1 ? FREQUENCY_LABELS[freq].toLowerCase() : frequencyLabel(freq, interval).toLowerCase();
  }

  toggleTransactionForm(): void {
    this.showTransactionForm.set(!this.showTransactionForm());
    this.editingTransaction.set(null);
  }

  toggleTransferForm(): void {
    this.showTransferForm.set(!this.showTransferForm());
    this.editingTransfer.set(null);
  }

  private resetTransactionForm(): void {
    this.transactionForm.reset({
      account_id: '',
      category_id: null,
      amount: null,
      type: 'expense',
      description: '',
      frequency: 'monthly',
      interval_value: 1,
      day_of_month: null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
    });
  }

  private resetTransferForm(): void {
    this.transferForm.reset({
      from_account_id: '',
      to_account_id: '',
      amount: null,
      description: '',
      frequency: 'monthly',
      interval_value: 1,
      day_of_month: null,
      start_date: new Date().toISOString().split('T')[0],
      end_date: null,
    });
  }
}