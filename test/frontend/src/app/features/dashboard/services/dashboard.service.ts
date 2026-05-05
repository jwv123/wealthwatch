import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { SummaryData, MonthlyData } from '../../../stores/dashboard.store';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  getSummary(year?: number): Observable<SummaryData> {
    const params = year ? `?year=${year}` : '';
    return this.http.get<SummaryData>(`${this.apiUrl}/reports/summary${params}`);
  }

  getMonthly(year?: number): Observable<MonthlyData> {
    const params = year ? `?year=${year}` : '';
    return this.http.get<MonthlyData>(`${this.apiUrl}/reports/monthly${params}`);
  }
}