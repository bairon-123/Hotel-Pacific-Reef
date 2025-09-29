import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthDbService } from '../services/auth-db.service';

export const adminGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthDbService);
  const router = inject(Router);

  await auth.init();

  const email = auth.getSessionEmail();
  const isAdmin = !!email && auth.isAdmin(email);


  if (isAdmin) return true;

  return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};