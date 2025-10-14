import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { finalize } from 'rxjs/operators';

import { LocalidadService } from '../../core/services/localidad.service';
import { NotifyService } from '../shared/notify.service';
import { Localidad, Pagina } from '../../core/interfaces/models';

@Component({
  standalone: true,
  selector: 'app-localidades-page',
  imports: [CommonModule, FormsModule, MatPaginator],
  templateUrl: './localidades-page.component.html',
  styleUrls: ['./localidades-page.component.css'],
})
export class LocalidadesPageComponent implements OnInit {
  locNombre = '';
  errorNombre = '';
  idCrud?: number;
  localidades = signal<Localidad[]>([]);
  items = signal<Localidad[]>([]);
  totalRegistros = signal(0);
  loading = signal(false);

  tamanio = 5;
  pagina = 1;

  private locService = inject(LocalidadService);
  private notify = inject(NotifyService);

  ngOnInit(): void {
    this.cargar();
    this.cargarPagina();
  }

  private idOf(l: any): number | undefined {
    const v = l?.id ?? l?.id_Localidad ?? l?.Id;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  }

  private toLocalidadView(o: any): Localidad {
    return {
      id: this.idOf(o) ?? 0,
      nombre: o?.nombre ?? '',
    } as Localidad;
  }

  cargar(): void {
    this.locService.getAll().subscribe({
      next: (d) => this.localidades.set((d ?? []).map((x) => this.toLocalidadView(x))),
      error: () => this.notify.error('No se pudieron cargar localidades'),
    });
  }

  cargarPagina(): void {
    this.locService.getPaginado(this.pagina, this.tamanio).subscribe({
      next: (res: Pagina<Localidad>) => {
        const items = (res?.items ?? []).map((x: any) => this.toLocalidadView(x));
        this.items.set(items);
        this.totalRegistros.set(res?.totalRegistros ?? items.length);
      },
      error: () => this.notify.error('No se pudo cargar la página'),
    });
  }

  crearLocalidad(): void {
    const nombre = this.locNombre.trim();
    if (!nombre) {
      this.notify.info('Ingresa un nombre de localidad');
      return;
    }

    this.loading.set(true);
    this.locService
      .create({ nombre })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.locNombre = '';
          this.notify.success('Agregado correctamente');
          this.cargar();
          this.cargarPagina();
        },
        error: () => this.notify.error('Error al agregar localidad'),
      });
  }

  buscarPorId(): void {
    const id = Number(this.idCrud);
    if (!id) {
      this.notify.info('Ingresa un ID');
      return;
    }

    this.loading.set(true);
    this.locService
      .getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (loc) => {
          const v = this.toLocalidadView(loc as any);
          this.locNombre = v.nombre ?? '';
          this.notify.info('Localidad cargada en el formulario');
        },
        error: () => this.notify.error('No se encontró la localidad'),
      });
  }

  editarLocalidad(): void {
    const id = Number(this.idCrud);
    const nombre = this.locNombre.trim();

    if (!id) {
      this.notify.info('Ingresa el ID a editar');
      return;
    }
    if (!nombre) {
      this.notify.info('Ingresa el nuevo nombre');
      return;
    }

    this.loading.set(true);
    this.locService
      .update({ id, nombre })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notify.success('Actualizado correctamente');
          this.resetForm();
          this.cargar();
          this.cargarPagina();
        },
        error: (err) => {
          this.notify.error('Error al actualizar');
          console.error('PUT /Localidad error:', err);
        },
      });
  }

  borrarPorId(): void {
    const id = Number(this.idCrud);
    if (!id) {
      this.notify.info('Ingresa el ID a borrar');
      return;
    }
    if (!confirm(`¿Eliminar la localidad #${id}?`)) return;

    this.loading.set(true);
    this.locService
      .delete(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notify.success('Eliminado');
          this.resetForm(true);
          this.cargar();
          this.cargarPagina();
        },
        error: (err) => {
          this.notify.error('Error al eliminar');
          console.error('DELETE /Localidad error:', err);
        },
      });
  }

  borrarDesdeLista(l: Localidad): void {
    const id = this.idOf(l as any);
    if (!id) {
      this.notify.info('ID de localidad inválido');
      return;
    }
    if (!confirm(`¿Eliminar la localidad #${id}?`)) return;

    this.loading.set(true);
    this.locService
      .delete(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notify.success('Eliminado');
          this.cargar();
          this.cargarPagina();
        },
        error: (err) => {
          this.notify.error('Error al eliminar');
          console.error('DELETE /Localidad error:', err);
        },
      });
  }

  validarNombre(valor: string): void {
    if (!valor.trim()) {
      this.errorNombre = 'El nombre no puede estar vacío.';
      this.notify.error(this.errorNombre);
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) {
      this.errorNombre = 'El nombre solo puede contener letras y espacios.';
      this.notify.error(this.errorNombre);
    } else {
      this.errorNombre = '';
    }
  }

   cambiarPagina(event: PageEvent): void {
    this.pagina = event.pageIndex + 1; 
    this.tamanio = event.pageSize;
    this.cargarPagina();
  }

  private resetForm(keepId = false): void {
    this.locNombre = '';
    if (!keepId) this.idCrud = undefined;
  }
}
