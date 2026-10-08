import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map, catchError, of } from 'rxjs';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.checkSession().pipe(
    map(response => {
      if (response.is_authenticated) {
        return router.createUrlTree(['/dashboard']);
      }

      return true;
    }),
    catchError(() => {
      return of(true);
    })
  );
};