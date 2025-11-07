import { Routes } from '@angular/router';
import { permissionGuardFn } from './core/guards/permission.guard';

export const routes: Routes = [
  // -------------------------------------------------
  // Inicio en Bienvenida de login
  // -------------------------------------------------
  { path: '', redirectTo: 'inicio_sesion', pathMatch: 'full' },

  // -------------------------------------------------
  // Bienvenida (libre)
  // -------------------------------------------------
  {
    path: 'bienvenida',
    loadComponent: () =>
      import('./pages/bienvenida-page/bienvenida-page.component').then(
        (m) => m.BienvenidaPagesComponent,
      ),
    title: 'Bienvenida',
  },

  // -------------------------------------------------
  // Autenticación
  // -------------------------------------------------
  {
    path: 'inicio_sesion',
    loadComponent: () =>
      import('./pages/login/login.component').then((m) => m.LoginComponent),
    title: 'Inicio de sesión',
  },
  {
    path: 'registro',
    loadComponent: () =>
      import('./pages/register/register.component').then(
        (m) => m.RegisterComponent,
      ),
    title: 'Registro',
  },

  // -------------------------------------------------
  // Tablero / Home
  // -------------------------------------------------
  {
    path: 'tablero',
    loadComponent: () =>
      import('./pages/home/home-page.component').then(
        (m) => m.HomePageComponent,
      ),
    title: 'Marcador',
  },
  {
    path: 'tablero/:id',
    loadComponent: () =>
      import('./pages/home/home-page.component').then(
        (m) => m.HomePageComponent,
      ),
    title: 'Marcador',
  },

  // -------------------------------------------------
  // Emails (conexión a API MailerController)
  // -------------------------------------------------
  {
    path: 'emails',
    loadComponent: () =>
      import('./pages/emails/emails.component').then((m) => m.EmailsComponent),
    title: 'Emails',

    canActivate: [permissionGuardFn],
    data: { requiredPermissions: ['Email:Consultar'] },
  },

  // -------------------------------------------------
  // Admin (protección a nivel padre)
  // -------------------------------------------------
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-page.component').then(
        (m) => m.AdminPageComponent,
      ),
    title: 'Administración',
    canActivateChild: [permissionGuardFn],
    data: {
      requiredPermissions: [
        'Localidad:Consultar',
        'Equipo:Consultar',
        'Partido:Consultar',
        'Jugador:Consultar',
      ],
    },
    children: [
      { path: '', redirectTo: 'localidades', pathMatch: 'full' },
      {
        path: 'localidades',
        loadComponent: () =>
          import('./pages/localidades/localidades-page.component').then(
            (m) => m.LocalidadesPageComponent,
          ),
        data: { requiredPermissions: ['Localidad:Consultar'] },
      },
      {
        path: 'equipos',
        loadComponent: () =>
          import('./pages/equipos/equipos-page.component').then(
            (m) => m.EquiposPageComponent,
          ),
        data: { requiredPermissions: ['Equipo:Consultar'] },
      },
      {
        path: 'partidos',
        loadComponent: () =>
          import('./pages/partidos/partidos-page.component').then(
            (m) => m.PartidosPageComponent,
          ),
        data: { requiredPermissions: ['Partido:Consultar'] },
      },
      {
        path: 'jugadores',
        loadComponent: () =>
          import('./pages/jugadores/jugadores-page.component').then(
            (m) => m.JugadoresPageComponent,
          ),
        data: { requiredPermissions: ['Jugador:Consultar'] },
      },
    ],
  },

  // -------------------------------------------------
  // Selección / Resultado / Historial
  // -------------------------------------------------
  {
    path: 'seleccion',
    loadComponent: () =>
      import('./pages/seleccion/seleccion.component').then(
        (m) => m.SeleccionComponent,
      ),
    title: 'Selección',
  },
  {
    path: 'resultado',
    loadComponent: () =>
      import('./pages/resultado-page/resultado-page.component').then(
        (m) => m.ResultadoPageComponent,
      ),
    title: 'Resultado',
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./pages/historial/historial.component').then(
        (m) => m.HistorialComponent,
      ),
    title: 'Historial',
  },

  // -------------------------------------------------
  // Administración de seguridad
  // -------------------------------------------------
  {
    path: 'admin/seguridad',
    loadComponent: () =>
      import(
        './pages/seguridad-admin/seguridad-admin-page/seguridad-admin-page.component'
      ).then((m) => m.SeguridadAdminPageComponent),
    title: 'Administración (Seguridad)',
    canActivate: [permissionGuardFn],
    data: {
      requiredPermissions: [
        'Usuario:Consultar',
        'Rol:Consultar',
        'Permiso:Consultar',
      ],
    },
  },

  // -------------------------------------------------
  // Recursos
  // -------------------------------------------------
  {
    path: 'recursos',
    loadComponent: () =>
      import('./pages/recursos/recursos-page.component').then(
        (m) => m.RecursosPageComponent,
      ),
    title: 'Recursos',
    canActivate: [permissionGuardFn],
    data: { requiredPermissions: ['Imagen:Consultar'] },
    children: [
      { path: '', redirectTo: 'imagenes', pathMatch: 'full' },
      {
        path: 'imagenes',
        loadComponent: () =>
          import('./pages/recursos/imagenes/imagenes.component').then(
            (m) => m.ImagenesComponent,
          ),
        title: 'Imágenes',
        data: { requiredPermissions: ['Imagen:Consultar'] },
      },
      {
        path: 'importar',
        loadComponent: () =>
          import('./pages/recursos/importar/importar.component').then(
            (m) => m.ImportarComponent,
          ),
      },
    ],
  },

  // -------------------------------------------------
  // Fallback
  // -------------------------------------------------
  { path: '**', redirectTo: 'inicio_sesion' },
];
