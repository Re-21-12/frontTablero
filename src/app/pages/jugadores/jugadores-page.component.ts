import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { finalize } from 'rxjs/operators';

import { JugadorService, Jugador } from '../../core/services/jugador.service';
import { EquipoService } from '../../core/services/equipo.service';
import { PaisService } from '../../core/services/country.service';
import { NotifyService } from '../shared/notify.service';
import { Pagina, Equipo } from '../../core/interfaces/models';

@Component({
  standalone: true,
  selector: 'app-jugadores-page',
  imports: [CommonModule, FormsModule, MatPaginator],
  templateUrl: './jugadores-page.component.html',
  styleUrls: ['./jugadores-page.component.css']
})
export class JugadoresPageComponent implements OnInit {

  jugadores = signal<Jugador[]>([]);
  equipos   = signal<Equipo[]>([]);
  paises    = signal<{ codigo?: string; nombre: string }[]>([]);


  nombre = '';
  apellido = '';
  estatura?: number;
  posicion = '';
  nacionalidad = '';
  edad?: number;
  idEquipo?: number;
  idCrud?: number;
  errorNombre = '';

  loading = signal(false);
  totalRegistros = signal(0);
  tamanio = 5;
  pagina = 1;
  items = signal<Jugador[]>([]);

  private jugSvc  = inject(JugadorService);
  private eqSvc   = inject(EquipoService);
  private paisSvc = inject(PaisService);
  private notify  = inject(NotifyService);

  ngOnInit(): void {
    this.cargarEquipos();
    this.cargarJugadores();
    this.cargarPaises();
    this.cargarPagina();
  }

  cargarEquipos() {
    this.eqSvc.getAll().subscribe({
      next: (e) => this.equipos.set(e ?? []),
      error: (err) => {
        console.error('GET /Equipo error', err);
        this.notify.error('No se pudieron cargar equipos');
      }
    });
  }

  cargarJugadores() {
    this.jugSvc.getAll().subscribe({
      next: (j) => this.jugadores.set(j ?? []),
      error: (err) => {
        console.error('GET /Jugador error', err);
        this.notify.error('No se pudieron cargar jugadores');
      }
    });
  }

  cargarPaises() {
    this.paisSvc.getPaises().subscribe({
      next: (p: any[]) => this.paises.set((p ?? []).map(x => ({ nombre: x?.nombre ?? String(x) })) ),
      error: (err) => {
        console.error('GET /Paises error', err);
        this.notify.error('No se pudieron cargar países');
      }
    });
  }

  crear() {
    const nombre = this.nombre.trim();
    const apellido = this.apellido.trim();
    const estatura = Number(this.estatura);
    const posicion = this.posicion.trim();
    const nacionalidad = this.nacionalidad;
    const edad = Number(this.edad);
    const id_Equipo = Number(this.idEquipo);

    if (!nombre || !apellido || !estatura || !posicion || !nacionalidad || !edad || !id_Equipo) {
      this.notify.info('Completa todos los campos del formulario');
      return;
    }

    const payload: Jugador = {
      nombre,
      apellido,
      estatura,
      posicion,
      nacionalidad,
      edad,
      id_Equipo
    };

    this.loading.set(true);
    this.jugSvc.create(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.resetForm();
          this.cargarJugadores();
          this.cargarPagina();
          this.notify.success('Jugador creado correctamente');
        },
        error: (err) => {
          console.error('POST /Jugador error', err);
          this.notify.error('No se pudo crear el jugador');
        }
      });
  }

  buscarPorId() {
    const id = Number(this.idCrud);
    if (!id) { this.notify.info('Ingresa un ID'); return; }

    this.loading.set(true);
    this.jugSvc.getById(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (j) => {
          this.nombre        = j?.nombre ?? '';
          this.apellido      = j?.apellido ?? '';
          this.estatura      = j?.estatura;
          this.posicion      = j?.posicion ?? '';
          this.nacionalidad  = j?.nacionalidad ?? '';
          this.edad          = j?.edad;
          this.idEquipo      = j?.id_Equipo;
          this.notify.info('Jugador cargado en el formulario');
        },
        error: (err) => {
          console.error('GET /Jugador/{id} error', err);
          this.notify.error('No se encontró el jugador');
        }
      });
  }

  editar() {
    const id = Number(this.idCrud);
    if (!id) { this.notify.info('Ingresa el ID a editar'); return; }

    const nombre = this.nombre.trim();
    const apellido = this.apellido.trim();
    const estatura = Number(this.estatura);
    const posicion = this.posicion.trim();
    const nacionalidad = this.nacionalidad;
    const edad = Number(this.edad);
    const id_Equipo = Number(this.idEquipo);

    if (!nombre || !apellido || !estatura || !posicion || !nacionalidad || !edad || !id_Equipo) {
      this.notify.info('Completa todos los campos para editar');
      return;
    }

    const payload: Jugador = {
      id_Jugador: id,
      nombre,
      apellido,
      estatura,
      posicion,
      nacionalidad,
      edad,
      id_Equipo
    };

    this.loading.set(true);
    this.jugSvc.update(payload)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.resetForm();
          this.cargarJugadores();
          this.cargarPagina();
          this.notify.success('Jugador editado correctamente');
        },
        error: (err) => {
          console.error('PUT /Jugador error:', err);
          this.notify.error('No se pudo actualizar el jugador');
        }
      });
  }

  borrarPorId() {
    const id = Number(this.idCrud);
    if (!id) { this.notify.info('Ingresa el ID a borrar'); return; }
    if (!confirm(`¿Eliminar jugador #${id}?`)) return;

    this.loading.set(true);
    this.jugSvc.delete(id)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.resetForm(true);
          this.cargarJugadores();
          this.cargarPagina();
          this.notify.success('Jugador eliminado');
        },
        error: (err) => {
          console.error('DELETE /Jugador error:', err);
          this.notify.error('Error al eliminar jugador');
        }
      });
  }

  borrar(j: Jugador) {
    if (!j?.id_Jugador) return;
    if (!confirm(`¿Eliminar jugador #${j.id_Jugador}?`)) return;

    this.loading.set(true);
    this.jugSvc.delete(j.id_Jugador)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => {
          this.cargarJugadores();
          this.cargarPagina();
          this.notify.success('Jugador eliminado');
        },
        error: (err) => {
          console.error('DELETE /Jugador error:', err);
          this.notify.error('Error al eliminar jugador');
        }
      });
  }

  private resetForm(keepId = false) {
    this.nombre = '';
    this.apellido = '';
    this.estatura = undefined;
    this.posicion = '';
    this.nacionalidad = '';
    this.edad = undefined;
    this.idEquipo = undefined;
    if (!keepId) this.idCrud = undefined;
  }

  validarNombre(valor: string) {
    if (!valor.trim()) {
      this.errorNombre = 'Esto no puede estar vacío.';
      this.notify.error(this.errorNombre);
    } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(valor)) {
      this.errorNombre = 'Solo puede contener letras y espacios.';
      this.notify.error(this.errorNombre);
    } else {
      this.errorNombre = '';
    }
  }

  equipoNombre(id?: number): string {
    if (!id) return '';
    const eq = this.equipos().find(e => (e as any).id_Equipo === id);
    return eq?.nombre ?? `#${id}`;
  }

  cambiarPagina(event: PageEvent) {
    this.pagina = event.pageIndex + 1;
    this.tamanio = event.pageSize;
    this.cargarPagina();
  }

  cargarPagina() {
    this.loading.set(true);
    this.jugSvc.getPaginado(this.pagina, this.tamanio)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res: Pagina<Jugador>) => {
          this.items.set(res?.items ?? []);
          this.totalRegistros.set(res?.totalRegistros ?? (res?.items?.length ?? 0));
        },
        error: (err) => {
          console.error('GET /Jugador/Paginado error', err);
          this.notify.error('Error cargando la página de jugadores');
        }
      });
  }

    initials(j: Jugador): string {
    const n = (j?.nombre ?? '').trim();
    const a = (j?.apellido ?? '').trim();
    const in1 = n.length > 0 ? n[0] : '?';
    const in2 = a.length > 0 ? a[0] : '';
    return `${in1}${in2}`.toUpperCase();
  }
  generarReporte(): void {
  this.notify.info('Generar reporte: en construcción');
}



}
