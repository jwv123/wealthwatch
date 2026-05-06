import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  RecurringTransaction,
  RecurringTransfer,
  CreateRecurringTransactionDTO,
  UpdateRecurringTransactionDTO,
  CreateRecurringTransferDTO,
  UpdateRecurringTransferDTO,
  ProcessDueResult,
} from '../../../shared/models/recurring.model';

@Injectable({ providedIn: 'root' })
export class RecurringService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  // ─── Recurring Transactions ────────────────────────────────────

  listRecurringTransactions(params?: { is_active?: boolean }): Observable<RecurringTransaction[]> {
    const searchParams = new URLSearchParams();
    if (params?.is_active !== undefined) {
      searchParams.set('is_active', String(params.is_active));
    }
    const qs = searchParams.toString();
    return this.http.get<RecurringTransaction[]>(`${this.apiUrl}/recurring/transactions${qs ? '?' + qs : ''}`);
  }

  createRecurringTransaction(dto: CreateRecurringTransactionDTO): Observable<RecurringTransaction> {
    return this.http.post<RecurringTransaction>(`${this.apiUrl}/recurring/transactions`, dto);
  }

  updateRecurringTransaction(id: string, dto: UpdateRecurringTransactionDTO): Observable<RecurringTransaction> {
    return this.http.patch<RecurringTransaction>(`${this.apiUrl}/recurring/transactions/${id}`, dto);
  }

  deleteRecurringTransaction(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/recurring/transactions/${id}`);
  }

  // ─── Recurring Transfers ──────────────────────────────────────

  listRecurringTransfers(params?: { is_active?: boolean }): Observable<RecurringTransfer[]> {
    const searchParams = new URLSearchParams();
    if (params?.is_active !== undefined) {
      searchParams.set('is_active', String(params.is_active));
    }
    const qs = searchParams.toString();
    return this.http.get<RecurringTransfer[]>(`${this.apiUrl}/recurring/transfers${qs ? '?' + qs : ''}`);
  }

  createRecurringTransfer(dto: CreateRecurringTransferDTO): Observable<RecurringTransfer> {
    return this.http.post<RecurringTransfer>(`${this.apiUrl}/recurring/transfers`, dto);
  }

  updateRecurringTransfer(id: string, dto: UpdateRecurringTransferDTO): Observable<RecurringTransfer> {
    return this.http.patch<RecurringTransfer>(`${this.apiUrl}/recurring/transfers/${id}`, dto);
  }

  deleteRecurringTransfer(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/recurring/transfers/${id}`);
  }

  // ─── Process Due Items ────────────────────────────────────────

  processDue(): Observable<ProcessDueResult> {
    return this.http.post<ProcessDueResult>(`${this.apiUrl}/recurring/process`, {});
  }
}