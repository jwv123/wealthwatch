import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Account, CreateAccountDTO, UpdateAccountDTO } from '../../../shared/models/account.model';

@Injectable({ providedIn: 'root' })
export class AccountsService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(): Observable<Account[]> {
    return this.http.get<Account[]>(`${this.apiUrl}/accounts`);
  }

  create(dto: CreateAccountDTO): Observable<Account> {
    return this.http.post<Account>(`${this.apiUrl}/accounts`, dto);
  }

  update(id: string, dto: UpdateAccountDTO): Observable<Account> {
    return this.http.patch<Account>(`${this.apiUrl}/accounts/${id}`, dto);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/accounts/${id}`);
  }
}