import { Routes } from '@angular/router';
import { HomePageComponent } from './pages/home/home-page.component';
import { AdminPageComponent } from './pages/admin/admin-page.component';
import { SeleccionComponent } from './pages/seleccion/seleccion.component';
import { ResultadoPageComponent } from './pages/resultado-page/resultado-page.component';

export const routes: Routes = [
  { path: 'tablero', component: HomePageComponent, title: 'Marcador' },
  { path: 'admin', component: AdminPageComponent, title: 'Administración' },
  { path: 'seleccion', component: SeleccionComponent, title: 'Selección' },
  { path: 'resultado', component: ResultadoPageComponent, title: 'Resultado' },
  { path: '**', redirectTo: 'seleccion' },
];
