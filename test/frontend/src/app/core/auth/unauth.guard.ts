import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthStore } from '../../stores/auth.store';

export const unauthGuard: CanActivateFn = () => {
  const router = inject(Router);
  if (AuthStore.isLoading()) return true;
  if (!AuthStore.isAuthenticated()) return true;
  router.navigate(['/dashboard']);
  return false;
};