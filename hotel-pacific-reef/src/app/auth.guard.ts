import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthDbService } from './services/auth-db.service';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthDbService);
  const router = inject(Router);

  await auth.init();

  const hasSession = !!auth.getSessionEmail();
  return hasSession ? true
                    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};