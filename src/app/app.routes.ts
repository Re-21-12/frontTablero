import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';
import { AdminPageComponent } from './pages/admin/admin-page.component';
import { SeleccionComponent } from './pages/seleccion/seleccion.component';

export const routes: Routes = [
  { path: 'tablero', component: HomePageComponent, title: 'Marcador' },
  { path: 'admin', component: AdminPageComponent, title: 'Administración' },
  { path: 'seleccion', component: SeleccionComponent, title: 'Selección' },
  { path: '**', redirectTo: 'seleccion' },
];
