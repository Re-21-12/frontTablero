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
  if (requiredRoles.length === 0) return false;

  const hasRole = (role: string) =>
    Object.values(grantedResourceRoles).some((roles) => roles.includes(role));

  return requiredRoles.every((role) => hasRole(role));
};

const isAccessAllowed = async (
  route: ActivatedRouteSnapshot,
  __: RouterStateSnapshot,
  authData: AuthGuardData,
): Promise<boolean | UrlTree> => {
  const { authenticated, grantedRoles } = authData;

  const requiredRoles = collectRequiredRoles(route);
  if (requiredRoles.length === 0) {
    return false;
  }

  if (
    authenticated &&
    hasAllRequiredRoles(requiredRoles, grantedRoles.resourceRoles)
  ) {
    return true;
  }

  const router = inject(Router);
  return router.parseUrl('/forbidden');
};

export const canActivateAuthRole =
  createAuthGuard<CanActivateFn>(isAccessAllowed);
