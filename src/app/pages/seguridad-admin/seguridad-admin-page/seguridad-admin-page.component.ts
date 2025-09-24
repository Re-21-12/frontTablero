import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UsuariosComponent } from '../usuarios/usuarios.component';
import { RolesComponent } from '../roles/roles.component';
import { PermisosComponent } from '../permisos/permisos.component';

type Tab = 'usuarios' | 'roles' | 'permisos';

@Component({
  standalone: true,
  selector: 'app-seguridad-admin-page',
  imports: [CommonModule, UsuariosComponent, RolesComponent, PermisosComponent],
  templateUrl: './seguridad-admin-page.component.html',
  styleUrls: ['./seguridad-admin-page.component.css']
})
export class SeguridadAdminPageComponent {
  active = signal<Tab>('usuarios');
  setTab(t: Tab) { this.active.set(t); }
}
