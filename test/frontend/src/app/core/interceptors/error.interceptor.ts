import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { AuthStore } from '../../stores/auth.store';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        AuthStore.reset();
        localStorage.removeItem('ww_token');
        localStorage.removeItem('ww_refresh_token');
        router.navigate(['/login']);
      }
      return throwError(() => error);
    })
  );
};