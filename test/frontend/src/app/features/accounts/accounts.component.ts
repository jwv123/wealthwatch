import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AccountStore } from '../../stores/account.store';
import { TransferStore } from '../../stores/transfer.store';
import { AccountsService } from './services/accounts.service';
import { TransfersService } from '../transfers/services/transfers.service';
import { Account, AccountType, CreateAccountDTO } from '../../shared/models/account.model';
import { Transfer, CreateTransferDTO } from '../../shared/models/transfer.model';
import { WwCurrencyPipe } from '../../shared/pipes/currency.pipe';
import { WwDateFormatPipe } from '../../shared/pipes/date-format.pipe';

const ACCOUNT_TYPE_LABELS: Record<AccountType, string> = {
  checking: 'Checking',
  savings: 'Savings',
  credit_card: 'Credit Card',
  cash: 'Cash',
  investment: 'Investment',
  loan: 'Loan',
};

const ACCOUNT_TYPE_COLORS: Record<AccountType, string> = {
  checking: '#3498DB',
  savings: '#2ECC71',
  credit_card: '#9B59B6',
  cash: '#F39C12',
  investment: '#1ABC9C',
  loan: '#E74C3C',
};

@Component({
  selector: 'ww-accounts',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, WwCurrencyPipe, WwDateFormatPipe],
  template: `
    <div class="accounts-page">
      <div class="accounts-page__header">
        <h1>Accounts</h1>
        <div class="accounts-page__header-actions">
          <button class="ww-btn ww-btn-primary" (click)="showTransferForm = false; showForm = !showForm">
            {{ showForm ? 'Cancel' : '+ Add Account' }}
          </button>
          <button class="ww-btn" [class.ww-btn-success]="showTransferForm"
                  style="border: 1px solid var(--ww-green); color: var(--ww-green)"
                  (click)="showForm = false; showTransferForm = !showTransferForm">
            {{ showTransferForm ? 'Cancel' : '↔ Transfer' }}
          </button>
        </div>
      </div>

      @if (showForm) {
        <div class="ww-card accounts-page__form-card">
          <h3>{{ editingAccount() ? 'Edit Account' : 'New Account' }}</h3>
          <form [formGroup]="accountForm" class="accounts-form__fields" (ngSubmit)="onSaveAccount()">
            <div class="accounts-form__field">
              <label class="ww-label">Name</label>
              <input class="ww-input" formControlName="name" placeholder="e.g. Main Checking" />
            </div>
            <div class="accounts-form__field">
              <label class="ww-label">Type</label>
              <select class="ww-input" formControlName="type">
                @for (entry of accountTypeEntries; track entry[0]) {
                  <option [value]="entry[0]">{{ entry[1] }}</option>
                }
              </select>
            </div>
            @if (!editingAccount()) {
              <div class="accounts-form__field">
                <label class="ww-label">Initial Balance</label>
                <input class="ww-input" type="number" formControlName="initial_balance" step="0.01" />
              </div>
            }
            <div class="accounts-form__field">
              <label class="ww-label">Color</label>
              <input class="ww-input" type="color" formControlName="color" />
            </div>
            <div class="accounts-form__actions">
              <button class="ww-btn ww-btn-primary" type="submit" [disabled]="accountForm.invalid || isSaving()">
                {{ isSaving() ? 'Saving...' : 'Save' }}
              </button>
              @if (editingAccount()) {
                <button class="ww-btn" type="button" (click)="cancelEdit()">Cancel</button>
              }
            </div>
          </form>
        </div>
      }

      @if (showTransferForm) {
        <div class="ww-card accounts-page__form-card">
          <h3>Transfer Between Accounts</h3>
          <form [formGroup]="transferForm" class="accounts-form__fields" (ngSubmit)="onSaveTransfer()">
            <div class="accounts-form__field">
              <label class="ww-label">From Account</label>
              <select class="ww-input" formControlName="from_account_id">
                <option value="">Select account</option>
                @for (acc of AccountStore.accounts(); track acc.id) {
                  <option [value]="acc.id">{{ acc.name }} ({{ acc.balance | wwCurrency }})</option>
                }
              </select>
            </div>
            <div class="accounts-form__field">
              <label class="ww-label">To Account</label>
              <select class="ww-input" formControlName="to_account_id">
                <option value="">Select account</option>
                @for (acc of AccountStore.accounts(); track acc.id) {
                  <option [value]="acc.id">{{ acc.name }} ({{ acc.balance | wwCurrency }})</option>
                }
              </select>
            </div>
            <div class="accounts-form__row">
              <div class="accounts-form__field">
                <label class="ww-label">Amount</label>
                <input class="ww-input" type="number" formControlName="amount" step="0.01" min="0.01" />
              </div>
              <div class="accounts-form__field">
                <label class="ww-label">Date</label>
                <input class="ww-input" type="date" formControlName="date" />
              </div>
            </div>
            <div class="accounts-form__field">
              <label class="ww-label">Description</label>
              <input class="ww-input" formControlName="description" placeholder="Optional note" />
            </div>
            <div class="accounts-form__actions">
              <button class="ww-btn ww-btn-success" type="submit" [disabled]="transferForm.invalid || isTransferring()">
                {{ isTransferring() ? 'Transferring...' : 'Transfer' }}
              </button>
            </div>
          </form>
        </div>
      }

      <div class="accounts-page__list">
        @for (account of AccountStore.accounts(); track account.id) {
          <div class="ww-card account-card" [style.borderLeftColor]="account.color ?? getTypeColor(account.type)">
            <div class="account-card__header">
              <div class="account-card__info">
                <span class="account-card__name">{{ account.name }}</span>
                <span class="account-card__type-badge"
                      [style.backgroundColor]="getTypeBadgeBg(account.type)"
                      [style.color]="getTypeBadgeColor(account.type)">
                  {{ getTypeLabel(account.type) }}
                </span>
                @if (account.is_default) {
                  <span class="account-card__default-badge">Default</span>
                }
              </div>
              <div class="account-card__balance">
                {{ account.balance | wwCurrency }}
              </div>
            </div>
            <div class="account-card__actions">
              <button class="ww-btn" style="border: 1px solid var(--ww-border); color: var(--ww-text-main)"
                      (click)="startEdit(account)">Edit</button>
              @if (!account.is_default) {
                <button class="ww-btn ww-btn-danger" (click)="onDelete(account)">Delete</button>
              }
            </div>
          </div>
        } @empty {
          @if (!AccountStore.isLoading()) {
            <div class="ww-card" style="text-align: center; padding: 2rem;">
              <p style="color: var(--ww-text-main)">No accounts yet. Create your first account to get started.</p>
            </div>
          }
        }
      </div>

      @if (TransferStore.transfers().length > 0) {
        <div class="accounts-page__transfers">
          <h2>Recent Transfers</h2>
          @for (transfer of TransferStore.transfers(); track transfer.id) {
            <div class="ww-card transfer-card">
              <div class="transfer-card__info">
                <span class="transfer-card__desc">{{ transfer.description || 'Transfer' }}</span>
                <span class="transfer-card__route">
                  {{ getAccountName(transfer.from_account_id) }} → {{ getAccountName(transfer.to_account_id) }}
                </span>
                <span class="transfer-card__date">{{ transfer.date | wwDateFormat }}</span>
              </div>
              <div class="transfer-card__amount">
                {{ transfer.amount | wwCurrency }}
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    .accounts-page__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .accounts-page__header-actions {
      display: flex;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .accounts-page__form-card {
      margin-bottom: 1.5rem;
    }
    .accounts-form__fields {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .accounts-form__field {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .accounts-form__row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }
    .accounts-form__actions {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }
    .account-card {
      border-left: 4px solid;
      margin-bottom: 0.75rem;
      transition: transform 0.2s ease;
    }
    .account-card:hover {
      transform: translateY(-1px);
    }
    .account-card__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.75rem;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .account-card__info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }
    .account-card__name {
      font-weight: 600;
      color: var(--ww-text-header);
      font-size: 1rem;
    }
    .account-card__type-badge {
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .account-card__default-badge {
      font-size: 0.6875rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      background: rgba(var(--ww-blue-rgb), 0.08);
      color: var(--ww-blue);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .account-card__balance {
      font-family: var(--ww-font-data);
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--ww-text-header);
    }
    .account-card__actions {
      display: flex;
      gap: 0.5rem;
    }
    .accounts-page__transfers {
      margin-top: 2rem;
    }
    .accounts-page__transfers h2 {
      margin-bottom: 1rem;
    }
    .transfer-card {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
      padding: 1rem;
    }
    .transfer-card__info {
      display: flex;
      flex-direction: column;
      gap: 0.125rem;
    }
    .transfer-card__desc {
      font-weight: 600;
      color: var(--ww-text-header);
    }
    .transfer-card__route {
      font-size: 0.8125rem;
      color: var(--ww-text-main);
    }
    .transfer-card__date {
      font-size: 0.75rem;
      color: var(--ww-text-main);
    }
    .transfer-card__amount {
      font-family: var(--ww-font-data);
      font-size: 1rem;
      font-weight: 600;
      color: var(--ww-green);
    }
    @media (max-width: 768px) {
      .accounts-form__row {
        grid-template-columns: 1fr;
      }
      .account-card__header {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `],
})
export class AccountsComponent implements OnInit {
  AccountStore = AccountStore;
  TransferStore = TransferStore;
  showForm = false;
  showTransferForm = false;
  editingAccount = signal<Account | null>(null);
  isSaving = signal(false);
  isTransferring = signal(false);
  accountTypeEntries = Object.entries(ACCOUNT_TYPE_LABELS);

  accountForm: FormGroup;
  transferForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private accountsService: AccountsService,
    private transfersService: TransfersService,
  ) {
    this.accountForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(50)]],
      type: ['checking', Validators.required],
      initial_balance: [0, [Validators.min(0)]],
      color: ['#3498DB'],
    });
    this.transferForm = this.fb.group({
      from_account_id: ['', Validators.required],
      to_account_id: ['', Validators.required],
      amount: [null, [Validators.required, Validators.min(0.01)]],
      date: [new Date().toISOString().split('T')[0], Validators.required],
      description: [''],
    });
  }

  ngOnInit(): void {
    this.loadAccountsIfNeeded();
    this.loadTransfersIfNeeded();
  }

  private loadAccountsIfNeeded(): void {
    if (AccountStore.accounts().length > 0 && !AccountStore.isLoading()) return;
    AccountStore.setLoading(true);
    this.accountsService.list().subscribe({
      next: (data) => AccountStore.setAccounts(data),
      error: () => AccountStore.setError('Failed to load accounts'),
    });
  }

  private loadTransfersIfNeeded(): void {
    this.transfersService.list().subscribe({
      next: (data) => TransferStore.setTransfers(data),
      error: () => TransferStore.setError('Failed to load transfers'),
    });
  }

  startEdit(account: Account): void {
    this.editingAccount.set(account);
    this.showTransferForm = false;
    this.accountForm.patchValue({
      name: account.name,
      type: account.type,
      color: account.color ?? '#3498DB',
    });
    this.showForm = true;
  }

  cancelEdit(): void {
    this.editingAccount.set(null);
    this.showForm = false;
    this.accountForm.reset({ name: '', type: 'checking', initial_balance: 0, color: '#3498DB' });
  }

  onSaveAccount(): void {
    if (this.accountForm.invalid) return;
    this.isSaving.set(true);
    const formVal = this.accountForm.value;

    if (this.editingAccount()) {
      const dto = { name: formVal.name, type: formVal.type, color: formVal.color };
      this.accountsService.update(this.editingAccount()!.id, dto).subscribe({
        next: (updated) => {
          AccountStore.updateAccount(updated.id, updated);
          this.isSaving.set(false);
          this.cancelEdit();
        },
        error: () => {
          AccountStore.setError('Failed to update account');
          this.isSaving.set(false);
        },
      });
    } else {
      const dto: CreateAccountDTO = {
        name: formVal.name,
        type: formVal.type,
        initial_balance: Number(formVal.initial_balance) || 0,
        color: formVal.color,
      };
      this.accountsService.create(dto).subscribe({
        next: (account) => {
          AccountStore.addAccount(account);
          this.isSaving.set(false);
          this.showForm = false;
          this.accountForm.reset({ name: '', type: 'checking', initial_balance: 0, color: '#3498DB' });
        },
        error: () => {
          AccountStore.setError('Failed to create account');
          this.isSaving.set(false);
        },
      });
    }
  }

  onDelete(account: Account): void {
    if (!confirm(`Delete "${account.name}" and all its transactions and transfers? This cannot be undone.`)) return;
    this.accountsService.delete(account.id).subscribe({
      next: () => {
        AccountStore.removeAccount(account.id);
        this.refreshBalances();
      },
      error: (err) => {
        const msg = err?.error?.error || 'Failed to delete account';
        alert(msg);
      },
    });
  }

  onSaveTransfer(): void {
    if (this.transferForm.invalid) return;
    this.isTransferring.set(true);
    const dto: CreateTransferDTO = this.transferForm.value;
    this.transfersService.create(dto).subscribe({
      next: (transfer) => {
        TransferStore.addTransfer(transfer);
        this.isTransferring.set(false);
        this.showTransferForm = false;
        this.transferForm.reset({ from_account_id: '', to_account_id: '', amount: null, date: new Date().toISOString().split('T')[0], description: '' });
        this.refreshBalances();
      },
      error: () => {
        TransferStore.setError('Failed to create transfer');
        this.isTransferring.set(false);
      },
    });
  }

  private refreshBalances(): void {
    this.accountsService.list().subscribe({
      next: (data) => AccountStore.setAccounts(data),
      error: () => {},
    });
  }

  getTypeLabel(type: AccountType): string {
    return ACCOUNT_TYPE_LABELS[type];
  }

  getTypeColor(type: AccountType): string {
    return ACCOUNT_TYPE_COLORS[type];
  }

  getTypeBadgeBg(type: AccountType): string {
    return `rgba(${this.hexToRgb(ACCOUNT_TYPE_COLORS[type])}, 0.08)`;
  }

  getTypeBadgeColor(type: AccountType): string {
    return ACCOUNT_TYPE_COLORS[type];
  }

  getAccountName(id: string): string {
    return AccountStore.byId().get(id)?.name ?? 'Unknown';
  }

  private hexToRgb(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `${r}, ${g}, ${b}`;
  }
}