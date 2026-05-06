import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, RegisterRequest, AuthResponse } from '../../shared/models/auth.models';
import { Profile } from '../../shared/models/profile.model';
import { AuthStore } from '../../stores/auth.store';
import { TransactionStore } from '../../stores/transaction.store';
import { CategoryStore } from '../../stores/category.store';
import { DashboardStore } from '../../stores/dashboard.store';
import { AccountStore } from '../../stores/account.store';
import { TransferStore } from '../../stores/transfer.store';
import { RecurringStore } from '../../stores/recurring.store';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`, payload);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/register`, payload);
  }

  logout(): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/logout`, {});
  }

  refreshToken(refreshToken: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refresh_token: refreshToken });
  }

  getProfile(): Observable<Profile> {
    return this.http.get<Profile>(`${this.apiUrl}/auth/profile`);
  }

  handleLogin(response: AuthResponse): Promise<void> {
    if (!response.access_token || !response.refresh_token) return Promise.resolve();
    AuthStore.setToken(response.access_token);
    localStorage.setItem('ww_token', response.access_token);
    localStorage.setItem('ww_refresh_token', response.refresh_token);

    return new Promise((resolve) => {
      this.getProfile().subscribe({
        next: (profile) => {
          AuthStore.setUser(profile);
          resolve();
        },
        error: () => {
          // Fallback to synthetic profile if getProfile fails
          AuthStore.setUser({
            id: response.user.id,
            email: response.user.email,
            display_name: null,
            avatar_url: null,
            default_currency: 'USD',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          resolve();
        },
      });
    });
  }

  handleLogout(): void {
    AuthStore.reset();
    TransactionStore.reset();
    CategoryStore.reset();
    DashboardStore.reset();
    AccountStore.reset();
    TransferStore.reset();
    RecurringStore.reset();
    localStorage.removeItem('ww_token');
    localStorage.removeItem('ww_refresh_token');
  }

  tryRestoreSession(): Promise<void> {
    const token = localStorage.getItem('ww_token');
    if (token) {
      AuthStore.setToken(token);
      return new Promise((resolve) => {
        this.getProfile().subscribe({
          next: (profile) => {
            AuthStore.setUser(profile);
            resolve();
          },
          error: () => {
            this.handleLogout();
            resolve();
          },
        });
      });
    } else {
      AuthStore.setLoading(false);
      return Promise.resolve();
    }
  }
}