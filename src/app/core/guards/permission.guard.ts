import { inject } from '@angular/core';
import {
  CanActivateFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';

export const permissionGuardFn: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/inicio_sesion']);
    return false;
  }

  const requiredPermissions =
    (route.data['requiredPermissions'] as string[])?.map((p) =>
      p.replace(/\s+/g, ''),
    ) || [];

  if (requiredPermissions.length === 0) return true;

  if (!authService.hasAnyPermission(requiredPermissions)) {
    router.navigate(['/inicio_sesion']);
    return false;
  }

  return true;
};
