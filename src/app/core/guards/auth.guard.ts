import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '@/modules/login/login.service';

export const authGuard: CanActivateFn = async () => {
  const auth = inject(LoginService);
  const router = inject(Router);
  return await auth.refresh() || router.createUrlTree(['/login']);
};
