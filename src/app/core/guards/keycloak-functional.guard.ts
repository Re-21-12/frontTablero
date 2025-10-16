import { AuthGuardData, createAuthGuard } from 'keycloak-angular';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { inject } from '@angular/core';

/**
 * The logic below is a simple example, please make it more robust when implementing in your application.
 *
 * Reason: isAccessGranted is not validating the resource, since it is merging all roles. Two resources might
 * have the same role name and it makes sense to validate it more granular.
 */

const collectRequiredRoles = (route: ActivatedRouteSnapshot): string[] => {
  const roles: string[] = [];

  const pushRole = (r: any) => {
    if (!r) return;
    if (Array.isArray(r)) {
      roles.push(...r.filter((x) => typeof x === 'string'));
    } else if (typeof r === 'string') {
      roles.push(r);
    }
  };

  // Recurse and collect roles from this route and all children
  const traverse = (r: ActivatedRouteSnapshot) => {
    pushRole(r.data?.['role']);
    for (const child of r.children) {
      traverse(child);
    }
  };

  traverse(route);
  // Remove duplicates
  return Array.from(new Set(roles));
};

const hasAllRequiredRoles = (
  requiredRoles: string[],
  grantedResourceRoles: Record<string, string[]>,
): boolean => {
  console.log('[Guard] requiredRoles:', requiredRoles);
  console.log('[Guard] grantedResourceRoles:', grantedResourceRoles);

  if (!requiredRoles || requiredRoles.length === 0) {
    console.log('[Guard] No required roles, returning false');
    return false;
  }

  if (!grantedResourceRoles || typeof grantedResourceRoles !== 'object') {
    console.log('[Guard] grantedResourceRoles inválido, returning false');
    return false;
  }

  const hasRole = (role: string) => {
    const result = Object.values(grantedResourceRoles).some(
      (roles) => Array.isArray(roles) && roles.includes(role),
    );
    console.log(`[Guard] ¿El usuario tiene el rol "${role}"?`, result);
    return result;
  };

  const allRoles = requiredRoles.every((role) => hasRole(role));
  console.log(
    '[Guard] ¿El usuario tiene todos los roles requeridos?',
    allRoles,
  );
  return allRoles;
};

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  __: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  console.log('[Guard] authenticated:', authenticated);
  console.log('[Guard] grantedRoles:', grantedRoles);

  const requiredRoles = collectRequiredRoles(route);
  console.log('[Guard] requiredRoles recolectados:', requiredRoles);

  if (requiredRoles.length === 0) {
    console.log('[Guard] No hay roles requeridos, acceso denegado');
    return false;
  }

  if (
    authenticated &&
    hasAllRequiredRoles(requiredRoles, grantedRoles.resourceRoles)
  ) {
    console.log('[Guard] Acceso permitido');
    return true;
  }

  console.log('[Guard] Acceso denegado, redirigiendo a /forbidden');
  const router = inject(Router);
  return router.parseUrl('/forbidden');
};

export const canActivateAuthRole =
  createAuthGuard<CanActivateFn>(isAccessAllowed);
