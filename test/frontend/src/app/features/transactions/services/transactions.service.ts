import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Transaction, CreateTransactionDTO, UpdateTransactionDTO } from '../../../shared/models/transaction.model';

@Injectable({ providedIn: 'root' })
export class TransactionsService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(filters?: { type?: string; from?: string; to?: string; categoryId?: string }): Observable<Transaction[]> {
    const params = new URLSearchParams();
    if (filters?.type) params.set('type', filters.type);
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    if (filters?.categoryId) params.set('categoryId', filters.categoryId);
    const qs = params.toString();
    return this.http.get<Transaction[]>(`${this.apiUrl}/transactions${qs ? '?' + qs : ''}`);
  }

  create(dto: CreateTransactionDTO): Observable<Transaction> {
    return this.http.post<Transaction>(`${this.apiUrl}/transactions`, dto);
  }

  update(id: string, dto: UpdateTransactionDTO): Observable<Transaction> {
    return this.http.patch<Transaction>(`${this.apiUrl}/transactions/${id}`, dto);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/transactions/${id}`);
  }

  deleteAll(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/transactions/delete-all`, {});
  }
}