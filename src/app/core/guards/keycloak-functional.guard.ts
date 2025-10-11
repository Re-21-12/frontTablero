import {
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree,
  CanActivateFn,
  CanActivateChildFn,
} from '@angular/router';
import { inject } from '@angular/core';
import { createAuthGuard, AuthGuardData } from 'keycloak-angular';

// Guard principal que maneja autenticación y roles múltiples
const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles, keycloak } = authData;
  const router = inject(Router);

  // Si no está autenticado, redirigir al login de Keycloak
  if (!authenticated) {
    await keycloak.login({
      redirectUri: window.location.origin + state.url,
    });
    return false;
  }

  // Obtener los roles requeridos desde los datos de la ruta
  const requiredRoles = route.data['roles'] as string[];

  // Si no se especifican roles, permitir el acceso si está autenticado
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Verificar si el usuario tiene al menos uno de los roles requeridos
  const hasRequiredRole = (role: string): boolean => {
    // Verificar en realm roles
    if (grantedRoles.realmRoles && grantedRoles.realmRoles.includes(role)) {
      return true;
    }

    // Verificar en resource roles
    if (grantedRoles.resourceRoles) {
      return Object.values(grantedRoles.resourceRoles).some((roles) =>
        roles.includes(role),
      );
    }

    return false;
  };

  const hasAccess = requiredRoles.some((role) => hasRequiredRole(role));

  if (!hasAccess) {
    // Redirigir a página de acceso denegado
    return router.parseUrl('/forbidden');
  }

  return true;
};

// Guard simplificado para un solo rol (siguiendo el ejemplo proporcionado)
const isAccessAllowedForSingleRole = async (
  route: ActivatedRouteSnapshot,
  _: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  const requiredRole = route.data['role'];
  if (!requiredRole) {
    return false;
  }

  const hasRequiredRole = (role: string): boolean => {
    // Verificar en realm roles primero
    if (grantedRoles.realmRoles && grantedRoles.realmRoles.includes(role)) {
      return true;
    }

    // Verificar en resource roles
    return Object.values(grantedRoles.resourceRoles).some((roles) =>
      roles.includes(role),
    );
  };

  if (authenticated && hasRequiredRole(requiredRole)) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/forbidden');
};

// Exportar guards funcionales con tipado correcto
export const canActivateKeycloakAuth =
  createAuthGuard<CanActivateFn>(isAccessAllowed);
export const canActivateChildKeycloakAuth =
  createAuthGuard<CanActivateChildFn>(isAccessAllowed);
export const canActivateAuthRole = createAuthGuard<CanActivateFn>(
  isAccessAllowedForSingleRole,
);
