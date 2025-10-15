import { Injectable, inject } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from '@angular/router';
import { AuthService } from '../services/auth.service';
import { NavigationService } from '../services/navigation.service';

@Injectable({
  providedIn: 'root',
})
export class PermissionGuard implements CanActivate {
  private authService = inject(AuthService);
  private navigationService = inject(NavigationService);
  private router = inject(Router);

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): boolean {
    console.log('PermissionGuard - Verificando acceso a:', state.url);

    // Verificar si el usuario está autenticado
    if (!this.authService.isAuthenticated()) {
      console.log('Usuario no autenticado, redirigiendo a login');
      this.router.navigate(['/inicio_sesion']);
      return false;
    }

    console.log('Usuario autenticado, verificando permisos...');

    // Obtener permisos requeridos desde los datos de la ruta
    // Limpiar espacios en blanco de los permisos requeridos
    const requiredPermissions =
      (route.data['requiredPermissions'] as string[])?.map((permission) =>
        permission.replace(/\s+/g, ''),
      ) || [];

    console.log('Permisos requeridos para la ruta:', requiredPermissions);

    // Si no requiere permisos específicos, permitir acceso
    if (requiredPermissions.length === 0) {
      console.log('Ruta sin permisos específicos requeridos, acceso permitido');
      return true;
    }

    // Verificar permisos usando AuthService directamente
    const hasPermission =
      this.authService.hasAnyPermission(requiredPermissions);

    console.log('Resultado de verificación de permisos:', hasPermission);

    if (!hasPermission) {
      console.log('Acceso denegado, redirigiendo a selección');
      // Redirigir a página de selección (tablero principal)
      this.router.navigate(['/inicio_sesion']);
      return false;
    }

    console.log('Acceso permitido a la ruta:', state.url);
    return true;
  }
}
