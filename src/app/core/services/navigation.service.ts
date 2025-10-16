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
      title: 'Inicio',
      items: [{ label: 'Mi perfil', route: '/bienvenida' }],
    },
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

  async getFilteredNavigation(): Promise<NavigationSection[]> {
    // Validar autenticación antes de filtrar navegación
    console.log('Filtrando navegación para el usuario');
    if (!this.authService.isAuthenticated()) {
      console.warn('Usuario no autenticado. No se muestra navegación.');
      return [];
    }
    console.log('Usuario autenticado, obteniendo roles y permisos');
    // Obtener todos los roles del usuario desde el JWT usando jwtDecode importado
    const token = await this.authService.getToken();
    let jwtRoles: string[] = [];
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        const realmRoles = this.authService.getPermissionsByToken() || [];
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
    const filtered: NavigationSection[] = [];
    for (const section of sections) {
      const items: NavigationItem[] = [];
      for (const item of section.items) {
        if (
          !item.requiredPermissions ||
          (await this.authService.hasAnyPermission(item.requiredPermissions))
        ) {
          items.push(item);
        }
      }
      if (items.length > 0) {
        filtered.push({ ...section, items });
      }
    }
    return filtered;
  }

  private async canShowItem(item: NavigationItem): Promise<boolean> {
    // Si no requiere permisos específicos, mostrar siempre (rutas públicas como tablero)
    if (!item.requiredPermissions || item.requiredPermissions.length === 0) {
      return true;
    }
    // Verificar si el usuario tiene al menos uno de los permisos requeridos
    return await this.authService.hasAnyPermission(item.requiredPermissions);
  }

  // Método para verificar acceso a una ruta específica
  async canAccessRoute(
    route: string,
    requiredPermissions?: string[],
  ): Promise<boolean> {
    if (!this.authService.isAuthenticated()) {
      return false;
    }
    if (!requiredPermissions || requiredPermissions.length === 0) {
      return true;
    }
    return await this.authService.hasAnyPermission(requiredPermissions);
  }

  // Métodos auxiliares para verificar permisos específicos por módulo
  async canManageLocalidades(): Promise<boolean> {
    return await this.authService.hasAnyPermission([
      'Localidad:Agregar',
      'Localidad:Editar',
      'Localidad:Eliminar',
      'Localidad:Consultar',
    ]);
  }

  async canManageEquipos(): Promise<boolean> {
    return await this.authService.hasAnyPermission([
      'Equipo:Agregar',
      'Equipo:Editar',
      'Equipo:Eliminar',
      'Equipo:Consultar',
    ]);
  }

  async canManagePartidos(): Promise<boolean> {
    return await this.authService.hasAnyPermission([
      'Partido:Agregar',
      'Partido:Editar',
      'Partido:Eliminar',
      'Partido:Consultar',
    ]);
  }

  async canManageJugadores(): Promise<boolean> {
    return await this.authService.hasAnyPermission([
      'Jugador:Agregar',
      'Jugador:Editar',
      'Jugador:Eliminar',
      'Jugador:Consultar',
    ]);
  }

  async canManageUsuarios(): Promise<boolean> {
    return await this.authService.hasAnyPermission([
      'Usuario:Agregar',
      'Usuario:Editar',
      'Usuario:Eliminar',
      'Usuario:Consultar',
    ]);
  }

  async canManageImagenes(): Promise<boolean> {
    return await this.authService.hasAnyPermission([
      'Imagen:Agregar',
      'Imagen:Editar',
      'Imagen:Eliminar',
      'Imagen:Consultar',
    ]);
  }

  async canManageRoles(): Promise<boolean> {
    return await this.authService.hasAnyPermission([
      'Rol:Agregar',
      'Rol:Editar',
      'Rol:Eliminar',
      'Rol:Consultar',
    ]);
  }

  async canManagePermisos(): Promise<boolean> {
    return await this.authService.hasAnyPermission([
      'Permiso:Agregar',
      'Permiso:Editar',
      'Permiso:Eliminar',
      'Permiso:Consultar',
    ]);
  }

  // Métodos para verificar permisos específicos de acciones
  async canViewModule(module: string): Promise<boolean> {
    return await this.authService.hasPermission(`${module}:Consultar`);
  }

  async canCreateIn(module: string): Promise<boolean> {
    return await this.authService.hasPermission(`${module}:Agregar`);
  }

  async canEditIn(module: string): Promise<boolean> {
    return await this.authService.hasPermission(`${module}:Editar`);
  }

  async canDeleteFrom(module: string): Promise<boolean> {
    return await this.authService.hasPermission(`${module}:Eliminar`);
  }

  // Método para obtener los permisos disponibles para un módulo específico
  async getModulePermissions(module: string): Promise<{
    canView: boolean;
    canCreate: boolean;
    canEdit: boolean;
    canDelete: boolean;
  }> {
    return {
      canView: await this.canViewModule(module),
      canCreate: await this.canCreateIn(module),
      canEdit: await this.canEditIn(module),
      canDelete: await this.canDeleteFrom(module),
    };
  }

  // Método para verificar si el usuario tiene acceso completo a un módulo
  async hasFullAccessTo(module: string): Promise<boolean> {
    return await this.authService.hasAnyPermission([
      `${module}:Consultar`,
      `${module}:Agregar`,
      `${module}:Editar`,
      `${module}:Eliminar`,
    ]);
  }

  // Método para obtener todas las rutas disponibles para el usuario actual
  async getAvailableRoutes(): Promise<string[]> {
    const availableRoutes: string[] = [];
    const filteredNavigation = await this.getFilteredNavigation();
    filteredNavigation.forEach((section) => {
      section.items.forEach((item) => {
        availableRoutes.push(item.route);
      });
    });
    return availableRoutes;
  }
}
