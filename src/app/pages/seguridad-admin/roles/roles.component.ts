import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RoleService } from '../../../core/services/role.service';

export interface Permiso {
  Id_Permiso: number;
  Nombre: string;
}

export interface Rol {
  Id_Rol: number;
  Nombre: string;
  Permisos?: Permiso[];
}

@Component({
  standalone: true,
  selector: 'app-roles',
  imports: [CommonModule, FormsModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent {
  private svc = inject(RoleService);

  
  roles = signal<Rol[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);


  q = signal<string>('');             
  editingId = signal<number | null>(null);
  formNombre = signal<string>('');     
  permisosInput = signal<string>('');  

  filtrados = computed(() => {
    const term = this.q().trim().toLowerCase();
    if (!term) return this.roles();
    return this.roles().filter(r =>
      r.Nombre.toLowerCase().includes(term) ||
      (r.Permisos?.some(p => p.Nombre.toLowerCase().includes(term)) ?? false)
    );
  });

  ngOnInit() {
    this.load();
  }

  load() {
    this.cargando.set(true);
    this.error.set(null);
    this.svc.getAll().subscribe({
      next: (arr) => { this.roles.set(arr); this.cargando.set(false); },
      error: (e) => { this.error.set('No se pudieron cargar los roles'); this.cargando.set(false); console.error(e); }
    });
  }


  nuevo() {
    this.editingId.set(null);
    this.formNombre.set('');
    this.permisosInput.set('');
  }

  editar(r: Rol) {
    this.editingId.set(r.Id_Rol);
    this.formNombre.set(r.Nombre);
    this.permisosInput.set('');
  }

  guardar() {
    const nombre = this.formNombre().trim();
    if (!nombre) return;

    this.cargando.set(true);
    this.error.set(null);

    const id = this.editingId();
    if (id) {
    
      this.svc.update(id, { Id_Rol: id, Nombre: nombre }).subscribe({
        next: () => { this.nuevo(); this.load(); },
        error: (e) => { this.error.set('No se pudo actualizar el rol'); this.cargando.set(false); console.error(e); }
      });
    } else {
      
      this.svc.create({ Nombre: nombre }).subscribe({
        next: () => { this.nuevo(); this.load(); },
        error: (e) => { this.error.set('No se pudo crear el rol'); this.cargando.set(false); console.error(e); }
      });
    }
  }

  borrar(id: number) {
    if (!confirm('¿Eliminar este rol?')) return;
    this.cargando.set(true);
    this.error.set(null);
    this.svc.remove(id).subscribe({
      next: () => this.load(),
      error: (e) => { this.error.set('No se pudo eliminar el rol'); this.cargando.set(false); console.error(e); }
    });
  }

  asignarPermisos() {
    const id = this.editingId();
    if (!id) return;

    const ids = this.permisosInput()
      .split(',')
      .map(x => x.trim())
      .filter(Boolean)
      .map(x => Number(x))
      .filter(n => Number.isFinite(n)) as number[];

    this.cargando.set(true);
    this.error.set(null);
    this.svc.assignPermissions(id, ids).subscribe({
      next: () => { this.permisosInput.set(''); this.load(); },
      error: (e) => { this.error.set('No se pudieron asignar los permisos'); this.cargando.set(false); console.error(e); }
    });
  }

  quitarPermiso(rol: Rol, permisoId: number) {
    this.cargando.set(true);
    this.error.set(null);
    this.svc.removePermission(rol.Id_Rol, permisoId).subscribe({
      next: () => this.load(),
      error: (e) => { this.error.set('No se pudo quitar el permiso'); this.cargando.set(false); console.error(e); }
    });
  }
}
