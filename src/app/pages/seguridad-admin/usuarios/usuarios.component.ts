import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/interfaces/usuario';
import { RoleService } from '../../../core/services/role.service';
import { Rol } from '../../../core/interfaces/models';

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css'],
})
export class UsuariosComponent implements OnInit {
  private svc = inject(UsuarioService);
  private roleSvc = inject(RoleService);
  // estado
  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // búsqueda y modo edición/creación
  busqueda = signal<string>('');
  editingId = signal<number | null>(null);

  // form
  formNombre = signal<string>('');
  formIdRol = signal<number | null>(null);
  formContrasena = signal<string>('');

  roles = signal<Rol[]>([]);

  filtrados = computed(() => {
    const t = this.busqueda().trim().toLowerCase();
    if (!t) return this.usuarios();
    return this.usuarios().filter(
      (u) =>
        (u.nombre ?? '').toLowerCase().includes(t) ||
        String(u.id_Usuario ?? '').includes(t) ||
        String(u.id_Rol ?? '').includes(t),
    );
  });

  ngOnInit() {
    console.log('ngOnInit ejecutado');
    this.load();
    this.loadRoles();
  }
  loadRoles() {
    this.roleSvc.getAll().subscribe({
      next: (arr: any[]) => {
        this.roles.set(arr);
      },
      error: (e) => {
        console.error('Error cargando roles:', e);
      },
    });
  }
  load() {
    console.log('Cargando usuarios...');
    this.cargando.set(true);
    this.error.set(null);
    this.svc.getAll().subscribe({
      next: (list) => {
        // console.log('Usuarios recibidos:', list);
        this.usuarios.set(list);
        this.cargando.set(false);
        // console.log('Signal usuarios actualizado:', this.usuarios());
        // console.log('Filtrados computed:', this.filtrados());
      },
      error: (e) => {
        this.error.set('No se pudieron cargar los usuarios');
        this.cargando.set(false);
        console.error('Error cargando usuarios:', e);
      },
    });
    // console.log('Filtrados computed:', this.filtrados());
  }

  nuevo() {
    this.editingId.set(null);
    this.formNombre.set('');
    this.formIdRol.set(null);
    this.formContrasena.set('');
  }

  editar(u: Usuario) {
    this.editingId.set(u.id_Usuario);
    this.formNombre.set(u.nombre);
    this.formIdRol.set(u.id_Rol);
    this.formContrasena.set('');
  }

  guardar() {
    const id = this.editingId();
    const nombre = this.formNombre().trim();
    const idRol = Number(this.formIdRol() ?? 0);
    const contrasena = this.formContrasena().trim();

    if (!nombre || !idRol) return;

    this.cargando.set(true);
    this.error.set(null);

    const rol = this.roles().find((r) => r.id_Rol === idRol);
    if (!rol) {
      this.error.set('Rol no válido seleccionado');
      this.cargando.set(false);
      return;
    }

    const submitRol = {
      Id_rol: rol.id_Rol.toString(),
      Nombre: rol.nombre.toString(),
    };

    if (id) {
      // UPDATE
      this.svc
        .update(id, {
          Nombre: nombre,
          Rol: submitRol,
          Contrasena: contrasena || undefined,
        })
        .subscribe({
          next: (_) => {
            this.nuevo();
            this.load();
          },
          error: (e) => {
            this.error.set('No se pudo actualizar el usuario');
            this.cargando.set(false);
            console.error(e);
          },
        });
    } else {
      // CREATE (register)
      if (!contrasena) {
        this.error.set('La contraseña es requerida para registrar');
        this.cargando.set(false);
        return;
      }
      this.svc
        .register({
          Nombre: nombre,
          Contrasena: contrasena,
          Rol: submitRol,
        })
        .subscribe({
          next: (_) => {
            this.nuevo();
            this.load();
          },
          error: (e) => {
            this.error.set('No se pudo registrar el usuario');
            this.cargando.set(false);
            console.error(e);
          },
        });
    }
  }

  borrar(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.cargando.set(true);
    this.error.set(null);
    this.svc.remove(id).subscribe({
      next: (_) => this.load(),
      error: (e) => {
        this.error.set('No se pudo eliminar el usuario');
        this.cargando.set(false);
        console.error(e);
      },
    });
  }
}
