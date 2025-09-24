import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import {PermisoService} from '../services/permiso.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const permissionService = inject(PermisoService);
  const router = inject(Router);
  const permissions = permissionService.getAll();
  if (authService.isAuthenticated()) {
    return true;
  } else {
    return router.createUrlTree(['/inicio_sesion']);
  }
};
