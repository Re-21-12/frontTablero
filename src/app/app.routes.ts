import { Routes } from '@angular/router';
import { AuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'tablero',
    loadComponent: () =>
      import('./pages/home/home-page.component')
        .then((m) => m.HomePageComponent),
    title: 'Marcador'
  },
  {
    path: 'inicio_sesion',
    loadComponent: () =>  import ("./pages/login/login.component").then((m) => m.LoginComponent),
    title: 'Inicio_sesion',

  },
  {
    path : 'registro',
    loadComponent: () => import ("./pages/register/register.component").then((m) => m.RegisterComponent),
    title: 'Registro',
  },
  {
    path: 'admin',
    loadComponent: () =>
      import('./pages/admin/admin-page.component')
        .then((m) => m.AdminPageComponent),
    title: 'Administración',
    canActivateChild: [AuthGuard],
    children: [
      { path: '', redirectTo: 'localidades', pathMatch: 'full' },

      {
        path: 'localidades',
        loadComponent: () =>
          import('./pages/localidades/localidades-page.component')
            .then((m) => m.LocalidadesPageComponent)
      },
      {
        path: 'equipos',
        loadComponent: () =>
          import('./pages/equipos/equipos-page.component')
            .then((m) => m.EquiposPageComponent)
      },
      {
        path: 'partidos',
        loadComponent: () =>
          import('./pages/partidos/partidos-page.component')
            .then((m) => m.PartidosPageComponent)
      },
      {
        path: 'jugadores',
        loadComponent: () =>
          import('./pages/jugadores/jugadores-page.component')
          .then((m) =>m.JugadoresPageComponent)
      }
    ]
  },

  {
    path: 'seleccion',
    loadComponent: () =>
      import('./pages/seleccion/seleccion.component')
        .then((m) => m.SeleccionComponent),
    title: 'Selección'
  },

  {
    path: 'resultado',
    loadComponent: () =>
      import('./pages/resultado-page/resultado-page.component')
        .then((m) => m.ResultadoPageComponent),
    title: 'Resultado'
  },
  {
  path: 'admin/seguridad',
  loadComponent: () =>
    import('./pages/seguridad-admin/seguridad-admin-page/seguridad-admin-page.component')
      .then(m => m.SeguridadAdminPageComponent),
  title: 'Administración (Seguridad)'
},

{
  path: 'recursos',
  loadComponent: () =>
    import('./pages/recursos/recursos-page.component')
      .then(m => m.RecursosPageComponent),
  title: 'Recursos',
  children: [
    { path: '', redirectTo: 'imagenes', pathMatch: 'full' },
    {
      path: 'imagenes',
      loadComponent: () =>
        import('./pages/recursos/imagenes/imagenes.component')
          .then(m => m.ImagenesComponent),
      title: 'Imágenes'
    }
  ]
},
  { path: '**', redirectTo: 'seleccion' }
];
