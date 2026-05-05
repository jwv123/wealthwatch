import { HttpInterceptorFn } from '@angular/common/http';
import { AuthStore } from '../../stores/auth.store';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = AuthStore.token();
  if (token && !req.url.includes('/auth/login') && !req.url.includes('/auth/register')) {
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
    return next(cloned);
  }
  return next(req);
};