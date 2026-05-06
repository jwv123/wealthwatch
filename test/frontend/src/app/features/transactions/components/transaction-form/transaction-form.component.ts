import { Component, EventEmitter, Output, computed } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryStore } from '../../../../stores/category.store';
import { AccountStore } from '../../../../stores/account.store';
import { CreateTransactionDTO } from '../../../../shared/models/transaction.model';

@Component({
  selector: 'ww-transaction-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <div class="ww-card transaction-form">
      <h3>New Transaction</h3>
      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="transaction-form__fields">
        <div class="transaction-form__type-toggle">
          <button type="button" class="ww-btn" [class.ww-btn-success]="form.get('type')?.value === 'income'"
                  (click)="form.patchValue({ type: 'income' })">Income</button>
          <button type="button" class="ww-btn" [class.ww-btn-danger]="form.get('type')?.value === 'expense'"
                  (click)="form.patchValue({ type: 'expense' })">Expense</button>
        </div>

        <div class="transaction-form__field">
          <label class="ww-label">Account</label>
          <select class="ww-input" formControlName="account_id">
            @for (acc of AccountStore.accounts(); track acc.id) {
            <option [value]="acc.id">{{ acc.name }}</option>
            }
          </select>
        </div>

        <div class="transaction-form__row">
          <div class="transaction-form__field">
            <label class="ww-label">Amount</label>
            <input class="ww-input" type="number" step="0.01" formControlName="amount" placeholder="0.00" />
          </div>
          <div class="transaction-form__field">
            <label class="ww-label">Date</label>
            <input class="ww-input" type="date" formControlName="date" />
          </div>
        </div>

        <div class="transaction-form__field">
          <label class="ww-label">Description</label>
          <input class="ww-input" type="text" formControlName="description" placeholder="e.g. Monthly rent" />
        </div>

        <div class="transaction-form__field">
          <label class="ww-label">Category</label>
          <select class="ww-input" formControlName="category_id">
            <option value="">Select category</option>
            @for (cat of categories(); track cat.id) {
            <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>
        </div>

        <div class="transaction-form__misc-toggle">
          <label>
            <input type="checkbox" formControlName="is_misc" />
            Mark as miscellaneous
          </label>
        </div>

        @if (form.get('is_misc')?.value) {
        <div class="transaction-form__misc-fields">
          <div class="transaction-form__field">
            <label class="ww-label">Notes</label>
            <input class="ww-input" type="text" formControlName="notes" placeholder="e.g. Birthday gift" />
          </div>
        </div>
        }

        <button class="ww-btn ww-btn-primary" type="submit" [disabled]="form.invalid">Save Transaction</button>
      </form>
    </div>
  `,
  styles: [`
    .transaction-form h3 {
      margin-bottom: 1rem;
    }
    .transaction-form__fields {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .transaction-form__type-toggle {
      display: flex;
      gap: 0.5rem;
    }
    .transaction-form__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .transaction-form__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .transaction-form__misc-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
    }
    @media (max-width: 768px) {
      .transaction-form__row {
        grid-template-columns: 1fr;
      }
    }
  `],
})
export class TransactionFormComponent {
  @Output() save = new EventEmitter<CreateTransactionDTO>();
  CategoryStore = CategoryStore;
  AccountStore = AccountStore;

  categories = CategoryStore.categories;
  defaultAccountId = computed(() => AccountStore.defaultAccount()?.id ?? '');

  form: FormGroup;

  constructor(private fb: FormBuilder) {
    const today = new Date().toISOString().split('T')[0];
    this.form = this.fb.group({
      type: ['expense'],
      account_id: [this.defaultAccountId(), Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      description: ['', [Validators.required, Validators.maxLength(255)]],
      date: [today, Validators.required],
      category_id: [null],
      is_misc: [false],
      notes: [''],
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const { is_misc, notes, ...rest } = this.form.value;

    const metadata: any = {};
    if (is_misc) {
      metadata.is_misc = true;
      if (notes) metadata.notes = notes;
    }

    this.save.emit({
      ...rest,
      amount: Number(rest.amount),
      account_id: rest.account_id,
      category_id: rest.category_id || null,
      metadata,
    });
  }
}