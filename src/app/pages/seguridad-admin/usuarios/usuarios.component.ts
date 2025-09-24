import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsuarioService } from '../../../core/services/usuario.service';
import { Usuario } from '../../../core/interfaces/usuario';

@Component({
  standalone: true,
  selector: 'app-usuarios',
  imports: [CommonModule, FormsModule],
  templateUrl: './usuarios.component.html',
  styleUrls: ['./usuarios.component.css']
})
export class UsuariosComponent {
  private svc = inject(UsuarioService);

  // estado
  usuarios = signal<Usuario[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  // búsqueda y modo edición/creación
  q = signal<string>('');
  editingId = signal<number | null>(null);

  // form
  formNombre = signal<string>('');
  formIdRol = signal<number | null>(null);
  formContrasena = signal<string>(''); 

  filtrados = computed(() => {
    const t = this.q().trim().toLowerCase();
    if (!t) return this.usuarios();
    return this.usuarios().filter(u =>
      (u.Nombre ?? '').toLowerCase().includes(t) ||
      String(u.Id_Usuario ?? '').includes(t) ||
      String(u.Id_Rol ?? '').includes(t)
    );
  });

  ngOnInit() { this.load(); }

  load() {
    this.cargando.set(true);
    this.error.set(null);
    this.svc.getAll().subscribe({
      next: list => { this.usuarios.set(list); this.cargando.set(false); },
      error: e => { this.error.set('No se pudieron cargar los usuarios'); this.cargando.set(false); console.error(e); }
    });
  }

  nuevo() {
    this.editingId.set(null);
    this.formNombre.set('');
    this.formIdRol.set(null);
    this.formContrasena.set('');
  }

  editar(u: Usuario) {
    this.editingId.set(u.Id_Usuario);
    this.formNombre.set(u.Nombre);
    this.formIdRol.set(u.Id_Rol);
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

    if (id) {
      // UPDATE
      this.svc.update(id, {
        Nombre: nombre,
        Id_Rol: idRol,
        Contrasena: contrasena || undefined
      }).subscribe({
        next: _ => { this.nuevo(); this.load(); },
        error: e => { this.error.set('No se pudo actualizar el usuario'); this.cargando.set(false); console.error(e); }
      });
    } else {
      // CREATE (register)
      if (!contrasena) { this.error.set('La contraseña es requerida para registrar'); this.cargando.set(false); return; }
      this.svc.register({
        Nombre: nombre,
        Contrasena: contrasena,
        Id_Rol: idRol
      }).subscribe({
        next: _ => { this.nuevo(); this.load(); },
        error: e => { this.error.set('No se pudo registrar el usuario'); this.cargando.set(false); console.error(e); }
      });
    }
  }

  borrar(id: number) {
    if (!confirm('¿Eliminar este usuario?')) return;
    this.cargando.set(true);
    this.error.set(null);
    this.svc.remove(id).subscribe({
      next: _ => this.load(),
      error: e => { this.error.set('No se pudo eliminar el usuario'); this.cargando.set(false); console.error(e); }
    });
  }
}
