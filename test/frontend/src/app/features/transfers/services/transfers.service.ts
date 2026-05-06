import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Transfer, CreateTransferDTO, UpdateTransferDTO } from '../../../shared/models/transfer.model';

@Injectable({ providedIn: 'root' })
export class TransfersService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(filters?: { from?: string; to?: string }): Observable<Transfer[]> {
    const params = new URLSearchParams();
    if (filters?.from) params.set('from', filters.from);
    if (filters?.to) params.set('to', filters.to);
    const qs = params.toString();
    return this.http.get<Transfer[]>(`${this.apiUrl}/transfers${qs ? '?' + qs : ''}`);
  }

  create(dto: CreateTransferDTO): Observable<Transfer> {
    return this.http.post<Transfer>(`${this.apiUrl}/transfers`, dto);
  }

  update(id: string, dto: UpdateTransferDTO): Observable<Transfer> {
    return this.http.patch<Transfer>(`${this.apiUrl}/transfers/${id}`, dto);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/transfers/${id}`);
  }
}