import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { Category, CreateCategoryDTO, UpdateCategoryDTO } from '../../../shared/models/category.model';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private apiUrl = environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  list(type?: 'income' | 'expense'): Observable<Category[]> {
    const params = type ? `?type=${type}` : '';
    return this.http.get<Category[]>(`${this.apiUrl}/categories${params}`);
  }

  create(dto: CreateCategoryDTO): Observable<Category> {
    return this.http.post<Category>(`${this.apiUrl}/categories`, dto);
  }

  update(id: string, dto: UpdateCategoryDTO): Observable<Category> {
    return this.http.patch<Category>(`${this.apiUrl}/categories/${id}`, dto);
  }

  delete(id: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/categories/${id}`);
  }

  resetToDefaults(): Observable<Category[]> {
    return this.http.post<Category[]>(`${this.apiUrl}/categories/reset-defaults`, {});
  }
}