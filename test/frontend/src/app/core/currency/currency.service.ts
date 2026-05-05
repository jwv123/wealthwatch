import { Injectable, inject, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Profile } from '../../shared/models/profile.model';
import { AuthStore } from '../../stores/auth.store';

@Injectable({ providedIn: 'root' })
export class CurrencyService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiBaseUrl;

  currency = computed(() => AuthStore.user()?.default_currency ?? 'USD');

  currencySymbol = computed(() => {
    const code = this.currency();
    try {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: code })
        .formatToParts(0)
        .find(p => p.type === 'currency')?.value ?? code;
    } catch {
      return code;
    }
  });

  updateCurrency(code: string): Observable<Profile> {
    return this.http.patch<Profile>(`${this.apiUrl}/auth/profile`, {
      default_currency: code,
    }).pipe(
      tap((profile) => AuthStore.setUser(profile))
    );
  }
}