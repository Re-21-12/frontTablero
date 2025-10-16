import { Injectable, inject } from '@angular/core';
import { AuthService } from './auth.service';
import {
  NavigationSection,
  NavigationItem,
} from '../interfaces/navigation.interface';
import { jwtDecode } from 'jwt-decode';

@Injectable({
  providedIn: 'root',
})
export class NavigationService {
  private authService = inject(AuthService);

  private navigationConfig: NavigationSection[] = [
    {
      title: 'Tablero',
      items: [
        { label: 'Selección', route: '/seleccion' },
        { label: 'Marcador', route: '/tablero' },
        { label: 'Resultado', route: '/resultado' },
        { label: 'Historial', route: '/historial' },
      ],
    },
    {
      title: 'Gestión de Entidades',
      items: [
        {
          label: 'Localidades',
          route: '/admin/localidades',
          requiredPermissions: ['Localidad:Consultar'],
        },
        {
          label: 'Equipos',
          route: '/admin/equipos',
          requiredPermissions: ['Equipo:Consultar'],
        },
        {
          label: 'Partidos',
          route: '/admin/partidos',
          requiredPermissions: ['Partido:Consultar'],
        },
        {
          label: 'Jugadores',
          route: '/admin/jugadores',
          requiredPermissions: ['Jugador:Consultar'],
        },
      ],
    },
    {
      title: 'Administración',
      items: [
        {
          label: 'Seguridad',
          route: '/admin/seguridad',
          requiredPermissions: [
            'Usuario:Consultar',
            'Rol:Consultar',
            'Permiso:Consultar',
          ],
        },
      ],
    },
    {
      title: 'Recursos',
      items: [
        {
          label: 'Imágenes',
          route: '/recursos/imagenes',
          requiredPermissions: ['Imagen:Consultar'],
        },
      ],
    },
  ];

  getNavigation(): NavigationSection[] {
    return this.navigationConfig;
  }

  getFilteredNavigation(): NavigationSection[] {
    // Validar autenticación antes de filtrar navegación
    if (!this.authService.isAuthenticated()) {
      console.warn('Usuario no autenticado. No se muestra navegación.');
      return [];
    }

    // Obtener todos los roles del usuario desde el JWT usando jwtDecode importado
    const token = this.authService.getToken();
    let jwtRoles: string[] = [];
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const realmRoles = decoded?.realm_access?.roles || [];
        const resourceRoles: string[] = [];
        if (decoded?.resource_access) {
          console.log('Decoded resource_access:', decoded.resource_access);
          Object.values(decoded.resource_access).forEach((resource: any) => {
            if (Array.isArray(resource.roles)) {
              resourceRoles.push(...resource.roles);
            }
          });
        }
        jwtRoles = [...realmRoles, ...resourceRoles];
        console.log('Roles extraídos del JWT:', jwtRoles);
      } catch (e) {
        console.warn('Error decodificando el token:', e);
      }
    }

    const sections = this.getNavigation();
    const filtered = sections
      .map((section) => ({
        ...section,
        items: section.items.filter(
          (item) =>
            !item.requiredPermissions ||
            this.authService.hasAnyPermission(item.requiredPermissions),
        ),
      }))
      .filter((section) => section.items.length > 0);

    return filtered;
  }

  private canShowItem(item: NavigationItem): boolean {
    // Si no requiere permisos específicos, mostrar siempre (rutas públicas como tablero)
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true;
    }

    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return this.authService.hasAnyPermission(item.requiredPermissions);
  }

  // Método para verificar acceso a una ruta específica
  canAccessRoute(route: string, requiredPermissions?: string[]): boolean {
    if (!this.authService.isAuthenticated()) {
      return false;
    }

    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }

    return this.authService.hasAnyPermission(requiredPermissions);
  }

  // Métodos auxiliares para verificar permisos específicos por módulo
  canManageLocalidades(): boolean {
    return this.authService.hasAnyPermission([
      'Localidad:Agregar',
      'Localidad:Editar',
      'Localidad:Eliminar',
      'Localidad:Consultar',
    ]);
  }

  canManageEquipos(): boolean {
    return this.authService.hasAnyPermission([
      'Equipo:Agregar',
      'Equipo:Editar',
      'Equipo:Eliminar',
      'Equipo:Consultar',
    ]);
  }

  canManagePartidos(): boolean {
    return this.authService.hasAnyPermission([
      'Partido:Agregar',
      'Partido:Editar',
      'Partido:Eliminar',
      'Partido:Consultar',
    ]);
  }

  canManageJugadores(): boolean {
    return this.authService.hasAnyPermission([
      'Jugador:Agregar',
      'Jugador:Editar',
      'Jugador:Eliminar',
      'Jugador:Consultar',
    ]);
  }

  canManageUsuarios(): boolean {
    return this.authService.hasAnyPermission([
      'Usuario:Agregar',
      'Usuario:Editar',
      'Usuario:Eliminar',
      'Usuario:Consultar',
    ]);
  }

  canManageImagenes(): boolean {
    return this.authService.hasAnyPermission([
      'Imagen:Agregar',
      'Imagen:Editar',
      'Imagen:Eliminar',
      'Imagen:Consultar',
    ]);
  }

  canManageRoles(): boolean {
    return this.authService.hasAnyPermission([
      'Rol:Agregar',
      'Rol:Editar',
      'Rol:Eliminar',
      'Rol:Consultar',
    ]);
  }

  canManagePermisos(): boolean {
    return this.authService.hasAnyPermission([
      'Permiso:Agregar',
      'Permiso:Editar',
      'Permiso:Eliminar',
      'Permiso:Consultar',
    ]);
  }

  // Métodos para verificar permisos específicos de acciones
  canViewModule(module: string): boolean {
    return this.authService.hasPermission(`${module}:Consultar`);
  }

  canCreateIn(module: string): boolean {
    return this.authService.hasPermission(`${module}:Agregar`);
  }

  canEditIn(module: string): boolean {
    return this.authService.hasPermission(`${module}:Editar`);
  }

  canDeleteFrom(module: string): boolean {
    return this.authService.hasPermission(`${module}:Eliminar`);
  }

  // Método para obtener los permisos disponibles para un módulo específico
  getModulePermissions(module: string): {
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  } {
    return {
      canView: this.canViewModule(module),
      canCreate: this.canCreateIn(module),
      canEdit: this.canEditIn(module),
      canDelete: this.canDeleteFrom(module),
    };
  }

  // Método para verificar si el usuario tiene acceso completo a un módulo
  hasFullAccessTo(module: string): boolean {
    return this.authService.hasAnyPermission([
      `${module}:Consultar`,
      `${module}:Agregar`,
      `${module}:Editar`,
      `${module}:Eliminar`,
    ]);
  }

  // Método para obtener todas las rutas disponibles para el usuario actual
  getAvailableRoutes(): string[] {
    const availableRoutes: string[] = [];

    this.getFilteredNavigation().forEach((section) => {
      section.items.forEach((item) => {
        availableRoutes.push(item.route);
      });
    });

    return availableRoutes;
  }
}
