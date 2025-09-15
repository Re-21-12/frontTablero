import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  // Rutas principales
  {
    path: 'tablero',
    loadComponent: () => import('./pages/home/home-page.component').then(m => m.HomePageComponent),
    title: 'Marcador'
  },
  {
    path: 'seleccion',
    loadComponent: () => import('./pages/seleccion/seleccion.component').then(m => m.SeleccionComponent),
    title: 'Selección'
  },
  {
    path: 'resultado',
    loadComponent: () => import('./pages/resultado-page/resultado-page.component').then(m => m.ResultadoPageComponent),
    title: 'Resultado'
  },

  // Rutas de administración
  {
    path: 'admin',
    canActivate: [AuthGuard], // Aquí puedes agregar tu guard principal
    children: [
      {
        path: '',
        loadComponent: () => import('./pages/admin/admin-page.component').then(m => m.AdminPageComponent),
        title: 'Administración'
      },
/*       {
        path: 'usuarios',
        loadComponent: () => import('./pages/admin/usuarios/usuarios.component').then(m => m.UsuariosComponent),
        title: 'Gestión de Usuarios'
      },
      {
        path: 'roles',
        loadComponent: () => import('./pages/admin/roles/roles.component').then(m => m.RolesComponent),
        title: 'Gestión de Roles'
      },
      {
        path: 'permisos',
        loadComponent: () => import('./pages/admin/permisos/permisos.component').then(m => m.PermisosComponent),
        title: 'Gestión de Permisos'
      },
      {
        path: 'equipos',
        loadComponent: () => import('./pages/admin/equipos/equipos.component').then(m => m.EquiposComponent),
        title: 'Gestión de Equipos'
      },
      {
        path: 'localidades',
        loadComponent: () => import('./pages/admin/localidades/localidades.component').then(m => m.LocalidadesComponent),
        title: 'Gestión de Localidades'
      },
      {
        path: 'partidos',
        loadComponent: () => import('./pages/admin/partidos/partidos.component').then(m => m.PartidosComponent),
        title: 'Gestión de Partidos'
      },
      {
        path: 'cuartos',
        loadComponent: () => import('./pages/admin/cuartos/cuartos.component').then(m => m.CuartosComponent),
        title: 'Gestión de Cuartos'
      },
      {
        path: 'imagenes',
        loadComponent: () => import('./pages/admin/imagenes/imagenes.component').then(m => m.ImagenesComponent),
        title: 'Gestión de Imágenes'
      } */
    ]
  },

  // Rutas por defecto
  { path: '', redirectTo: 'seleccion', pathMatch: 'full' },
  { path: '**', redirectTo: 'seleccion' }
];
