import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PermissionService } from '../../../core/services/permission.service';

@Component({
  standalone: true,
  selector: 'app-permisos',
  imports: [CommonModule, FormsModule],
  templateUrl: './permisos.component.html',
  styleUrls: ['./permisos.component.css']
})
export class PermisosComponent {
  private svc = inject(PermissionService);

  permisos = signal<any[]>([]);
  cargando = signal(false);
  error = signal<string | null>(null);

  q = signal<string>('');
  editingId = signal<number | null>(null);
  formNombre = signal<string>('');

 
  getId = (p: any): number | null =>
    (p?.Id_Permiso ?? p?.id ?? p?.Id ?? null);

  getNombre = (p: any): string =>
    (p?.Nombre ?? p?.nombre ?? '');

  filtrados = computed(() => {
    const term = this.q().trim().toLowerCase();
    if (!term) return this.permisos();
    return this.permisos().filter(p => this.getNombre(p).toLowerCase().includes(term));
  });

  ngOnInit() { this.load(); }

  load() {
    this.cargando.set(true);
    this.error.set(null);
    this.svc.getAll().subscribe({
      next: arr => { this.permisos.set(arr); this.cargando.set(false); },
      error: e => { this.error.set('No se pudieron cargar los permisos'); this.cargando.set(false); console.error(e); }
    });
  }

  nuevo() {
    this.editingId.set(null);
    this.formNombre.set('');
  }

  editar(p: any) {
    this.editingId.set(this.getId(p));
    this.formNombre.set(this.getNombre(p));
  }

  guardar() {
    const nombre = this.formNombre().trim();
    if (!nombre) return;

    this.cargando.set(true);
    this.error.set(null);

    const id = this.editingId();
    if (id) {
      this.svc.update(id, { Nombre: nombre }).subscribe({
        next: _ => { this.nuevo(); this.load(); },
        error: e => { this.error.set('No se pudo actualizar el permiso'); this.cargando.set(false); console.error(e); }
      });
    } else {
      this.svc.create({ Nombre: nombre }).subscribe({
        next: _ => { this.nuevo(); this.load(); },
        error: e => { this.error.set('No se pudo crear el permiso'); this.cargando.set(false); console.error(e); }
      });
    }
  }

  borrar(id: number | null) {
    if (!id) return; 
    if (!confirm('¿Eliminar este permiso?')) return;
    this.cargando.set(true);
    this.error.set(null);
    this.svc.remove(id).subscribe({
      next: _ => this.load(),
      error: e => { this.error.set('No se pudo eliminar el permiso'); this.cargando.set(false); console.error(e); }
    });
  }
}
