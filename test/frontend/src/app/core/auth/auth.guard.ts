import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../stores/auth.store';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (AuthStore.isLoading()) return router.parseUrl('/login');
  if (AuthStore.isAuthenticated()) return true;
  router.navigate(['/login']);
  return false;
};