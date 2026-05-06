import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SummaryData, MonthlyData } from '../../../stores/dashboard.store';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getSummary(year?: number, accountId?: string): Observable<SummaryData> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (accountId) params.set('accountId', accountId);
    const qs = params.toString();
    return this.http.get<SummaryData>(`${this.apiUrl}/reports/summary${qs ? '?' + qs : ''}`);
  }

  getMonthly(year?: number, accountId?: string): Observable<MonthlyData> {
    const params = new URLSearchParams();
    if (year) params.set('year', String(year));
    if (accountId) params.set('accountId', accountId);
    const qs = params.toString();
    return this.http.get<MonthlyData>(`${this.apiUrl}/reports/monthly${qs ? '?' + qs : ''}`);
  }
}