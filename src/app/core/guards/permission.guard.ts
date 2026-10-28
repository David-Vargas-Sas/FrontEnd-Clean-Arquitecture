import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { LoginService } from '@/modules/login/login.service';

export const permissionGuard: CanActivateFn = async route => {
  const auth = inject(LoginService);
  const router = inject(Router);
  if (!await auth.refresh()) return router.createUrlTree(['/login']);
  return auth.can(route.data['permission']) || router.createUrlTree(['/sin-permiso']);
};
