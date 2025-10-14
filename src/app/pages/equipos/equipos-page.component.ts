import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipoService } from '../../core/services/equipo.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { Equipo, Localidad, Pagina } from '../../core/interfaces/models';
import { NotifyService } from '../shared/notify.service';
import { MatSelectModule } from '@angular/material/select';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-equipos-page',
  imports: [CommonModule, FormsModule, MatSelectModule, MatPaginator],
  templateUrl: './equipos-page.component.html',
  styleUrls: ['./equipos-page.component.css'],
})
export class EquiposPageComponent implements OnInit {
  nombre = '';
  idLocalidad?: number;
  idCrud?: number;
  errorNombre = '';
  equipos = signal<Equipo[]>([]);
  localidades = signal<Localidad[]>([]);
  loading = signal(false);
  totalRegistros = signal(0);
  tamanio = 5;
  pagina = 1;
  items = signal<Equipo[]>([]);

  logoUrl = '';
  imgError = false;

  private equipoSvc = inject(EquipoService);
  private locSvc = inject(LocalidadService);
  private notify = inject(NotifyService);

  ngOnInit() {
    this.cargar();
    this.cargarLocalidades();
    this.cargarPagina();
  }

  cargar() {
    this.equipoSvc.getAll().subscribe({
      next: (d) => this.equipos.set(d),
      error: (err) => {
        console.error('GET /Equipo error', err);
        this.notify.error('No se pudieron cargar equipos');
      },
    });
  }

  cargarLocalidades() {
    this.locSvc.getAll().subscribe({
      next: (d) => this.localidades.set(d),
      error: (err) => {
        console.error('GET /Localidad error', err);
        this.notify.error('No se pudieron cargar localidades');
      },
    });
  }

  crear() {
    const nombre = this.nombre.trim();
    const id_Localidad = Number(this.idLocalidad);
    if (!nombre) { this.notify.info('Ingresa un nombre de equipo'); return; }
    if (!id_Localidad) { this.notify.info('Selecciona una localidad'); return; }

    this.loading.set(true);
    this.equipoSvc.create({ nombre, id_Localidad })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.resetForm();
          this.notify.success('Equipo agregado');
          this.cargar();
          this.cargarPagina();
        },
        error: (err) => {
          console.error('POST /Equipo error', err);
          this.notify.error('Error al agregar equipo');
        },
      });
  }

  buscarPorId() {
    const id = Number(this.idCrud);
    if (!id) { this.notify.info('Ingresa un ID'); return; }

    this.loading.set(true);
    this.equipoSvc.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (e) => {
          this.nombre = (e as any)?.nombre ?? '';
          this.idLocalidad = (e as any)?.id_Localidad ?? (e as any)?.localidad ?? undefined;
          this.logoUrl = (e as any)?.url ?? '';
          this.imgError = false;
          this.notify.info('Equipo cargado en el formulario');
        },
        error: (err) => {
          console.error('GET /Equipo/{id} error', err);
          this.notify.error('No se encontró el equipo');
        },
      });
  }

  editar() {
    const id_Equipo = Number(this.idCrud);
    const nombre = this.nombre.trim();
    const id_Localidad = Number(this.idLocalidad);

    if (!id_Equipo) { this.notify.info('Ingresa el ID a editar'); return; }
    if (!nombre) { this.notify.info('Ingresa el nombre'); return; }
    if (!id_Localidad) { this.notify.info('Selecciona una localidad'); return; }

    this.loading.set(true);
    this.equipoSvc.update({ id_Equipo, nombre, id_Localidad })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notify.success('Equipo actualizado');
          this.resetForm();
          this.cargar();
          this.cargarPagina();
        },
        error: (err) => {

          console.error('PUT /Equipo error', err);
          this.notify.error('Error al actualizar equipo');
        },
      });
  }

  borrarPorId() {
    const id = Number(this.idCrud);
    if (!id) { this.notify.info('Ingresa el ID a borrar'); return; }
    if (!confirm(`¿Eliminar el equipo #${id}?`)) return;

    this.loading.set(true);
    this.equipoSvc.delete(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.notify.success('Equipo eliminado');
          this.resetForm(true);
          this.cargar();
          this.cargarPagina();
          this.logoUrl = '';
          this.imgError = false;
        },
        error: (err) => {
          console.error('DELETE /Equipo/{id} error', err);
          this.notify.error('Error al eliminar equipo');
        },
      });
  }

  borrarDesdeLista(e: Equipo) {
    if (!e.id_Equipo) return;
    if (!confirm(`¿Eliminar el equipo #${e.id_Equipo}?`)) return;

    this.loading.set(true);
    this.equipoSvc.delete(e.id_Equipo)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.cargar();
          this.cargarPagina();
          this.notify.success('Equipo eliminado');
        },
        error: (err) => {
          console.error('DELETE /Equipo/{id} error', err);
          this.notify.error('No se pudo eliminar');
        },
      });
  }

  private resetForm(keepId = false) {
    this.nombre = '';
    this.idLocalidad = undefined;
    if (!keepId) this.idCrud = undefined;
  }

  validarNombre(valor: string) {
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

  cambiarPagina(event: PageEvent) {
    this.pagina = event.pageIndex + 1;
    this.tamanio = event.pageSize;
    this.cargarPagina();
  }

  cargarPagina() {
    this.loading.set(true);
    this.equipoSvc.getPaginado(this.pagina, this.tamanio)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: Pagina<Equipo>) => {
          this.items.set(res.items as Equipo[]);
          this.totalRegistros.set(res.totalRegistros);
        },
        error: (err) => {
          console.error('GET /Equipo/Paginado error', err);
          this.notify.error('Error al cargar la página de equipos');
        },
      });
  }

  private isLikelyDirectImageUrl(url: string): boolean {
    const directExt = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i.test(url);
    const isGoogleRedirect = /google\.[^/]+\/imgres/i.test(url);
    return directExt && !isGoogleRedirect;
  }

  private preloadImage(url: string, timeoutMs = 6000): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image();             
    let done = false;
    const timer = setTimeout(() => {
      if (!done) { done = true; reject(new Error('timeout')); }
    }, timeoutMs);

    img.onload = () => { if (!done) { done = true; clearTimeout(timer); resolve(); } };
    img.onerror = () => { if (!done) { done = true; clearTimeout(timer); reject(new Error('loaderror')); } };
    img.src = url;
  });
}

  async guardarLogo() {
    const id_Equipo = Number(this.idCrud);
    const url = this.logoUrl?.trim();

    if (!id_Equipo) { this.notify.info('Ingresa/Selecciona el ID del equipo'); return; }
    if (!url) { this.notify.info('Ingresa la URL del logo'); return; }

    if (/google\.[^/]+\/imgres/i.test(url)) {
      this.notify.error('Esa URL es de Google Images. Abre la imagen y copia la URL directa del archivo (.png/.jpg).');
      return;
    }

    if (!/^https?:\/\//i.test(url)) { this.notify.error('La URL debe comenzar con http(s)://'); return; }
    if (!this.isLikelyDirectImageUrl(url)) {
      this.notify.error('La URL no parece ser un archivo de imagen directo (.png/.jpg/.webp/.svg).');
      return;
    }

    this.loading.set(true);
    try {
      await this.preloadImage(url);
      this.equipoSvc.patchUrl({ id_Equipo, url })
        .pipe(finalize(() => this.loading.set(false)))
        .subscribe({
          next: () => {
            this.notify.success('Logo Actualizado');
            this.cargar();
            this.cargarPagina();
            this.imgError = false;
          },
          error: (err) => {
            console.error('PATCH /Equipo url error', err);
            this.notify.error('No se pudo actualizar la URL del logo');
          }
        });
    } catch {
      this.loading.set(false);
      this.imgError = true;
      this.notify.error('No se pudo cargar la imagen desde esa URL (verifica que sea pública y directa).');
    }
  }

  onImgErr(ev: Event) {
    const img = ev.target as HTMLImageElement | null;
    if (img) img.src = 'assets/placeholder-team.svg';
  }

  logoOf(e: any): string {
    return (e && (e as any).url) ? (e as any).url : 'assets/placeholder-team.svg';
  }

  locOf(e: any): string | number {
    return (e && ((e as any).localidad ?? (e as any).id_Localidad ?? (e as any).id_localidad)) ?? '';
  }

  trackByEquipoId = (_: number, it: any) => it?.id_Equipo ?? it?.id ?? _;
}
