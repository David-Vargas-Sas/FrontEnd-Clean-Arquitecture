import { inject } from '@angular/core';
import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { LoginService } from '@/modules/login/login.service';
import { API_BASE_URL } from '@/core/constants/api.constants';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(LoginService);
  const router = inject(Router);
  if (!request.url.startsWith(API_BASE_URL + '/')) return next(request);
  const token = auth.token();
  const outgoing = token ? request.clone({ setHeaders: { Authorization: 'Bearer ' + token } }) : request;
  return next(outgoing).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401 && !request.url.endsWith('/auth/login')) {
      auth.logout();
      void router.navigate(['/login'], { queryParams: { expired: '1' } });
    }
    if (error.status === 403 && !request.url.endsWith('/auth/me')) void auth.refresh();
    return throwError(() => error);
  }));
};
