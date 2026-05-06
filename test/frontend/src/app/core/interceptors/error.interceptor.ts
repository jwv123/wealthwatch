import { HttpInterceptorFn, HttpErrorResponse, HttpEvent } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError, from, Observable } from 'rxjs';
import { AuthStore } from '../../stores/auth.store';
import { TransactionStore } from '../../stores/transaction.store';
import { CategoryStore } from '../../stores/category.store';
import { DashboardStore } from '../../stores/dashboard.store';
import { RecurringStore } from '../../stores/recurring.store';
import { AuthService } from '../auth/auth.service';

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: any) => void;
}> = [];

function processQueue(token: string | null, error: any = null): void {
  failedQueue.forEach((p) => {
    if (token) {
      p.resolve(token);
    } else {
      p.reject(error);
    }
  });
  failedQueue = [];
}

function forceLogout(router: Router): void {
  AuthStore.reset();
  TransactionStore.reset();
  CategoryStore.reset();
  DashboardStore.reset();
  RecurringStore.reset();
  localStorage.removeItem('ww_token');
  localStorage.removeItem('ww_refresh_token');
  router.navigate(['/login']);
}

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status !== 401) {
        return throwError(() => error);
      }

      // Don't try to refresh for auth endpoints
      if (
        req.url.includes('/auth/login') ||
        req.url.includes('/auth/register') ||
        req.url.includes('/auth/refresh')
      ) {
        return throwError(() => error);
      }

      const refreshToken = localStorage.getItem('ww_refresh_token');
      if (!refreshToken) {
        forceLogout(router);
        return throwError(() => error);
      }

      if (isRefreshing) {
        // Queue subsequent requests until refresh completes
        return new Observable<HttpEvent<any>>((observer) => {
          failedQueue.push({
            resolve: (token: string) => {
              const cloned = req.clone({
                setHeaders: { Authorization: `Bearer ${token}` },
              });
              next(cloned).subscribe(observer);
            },
            reject: (err: any) => {
              observer.error(err);
            },
          });
        });
      }

      isRefreshing = true;

      return from(authService.refreshToken(refreshToken)).pipe(
        switchMap((response: any) => {
          isRefreshing = false;
          const newToken = response.access_token;
          const newRefreshToken = response.refresh_token;
          AuthStore.setToken(newToken);
          localStorage.setItem('ww_token', newToken);
          if (newRefreshToken) {
            localStorage.setItem('ww_refresh_token', newRefreshToken);
          }
          processQueue(newToken, null);
          const cloned = req.clone({
            setHeaders: { Authorization: `Bearer ${newToken}` },
          });
          return next(cloned);
        }),
        catchError((refreshError) => {
          isRefreshing = false;
          processQueue(null, refreshError);
          forceLogout(router);
          return throwError(() => refreshError);
        })
      );
    })
  );
};