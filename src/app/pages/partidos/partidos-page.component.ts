import { Component, OnInit, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { EquipoService } from '../../core/services/equipo.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { PartidoService } from '../../core/services/partido.service';
import { NotifyService } from '../shared/notify.service';

import { Equipo, Localidad, Pagina, PartidoPagina } from '../../core/interfaces/models';

@Component({
  standalone: true,
  selector: 'app-partidos-page',
  imports: [CommonModule, FormsModule, MatPaginator],
  templateUrl: './partidos-page.component.html',
  styleUrls: ['./partidos-page.component.css'],
})
export class PartidosPageComponent implements OnInit {
  // Form
  fechaHoraLocal = '';
  partLocalidadId = model<number>();
  equipoLocal     = model<Equipo>();
  equipoVisitante = model<Equipo>();

  // Data
  equipos     = signal<Equipo[]>([]);
  localidades = signal<Localidad[]>([]);
  partidos    = signal<any[]>([]);

  // Lista paginada
  items          = signal<PartidoPagina[]>([]);
  totalRegistros = signal(0);
  tamanio = 5;
  pagina  = 1;

  // UI state
  expandedIndex = signal<number | null>(null); // <- usamos índice

  // Services
  private eqService   = inject(EquipoService);
  private locService  = inject(LocalidadService);
  private partService = inject(PartidoService);
  private notify      = inject(NotifyService);

  ngOnInit() {
    this.cargar();
    this.cargarPagina();
  }

  cargar() {
    this.eqService.getAll().subscribe({ next: d => this.equipos.set(d ?? []) });
    this.locService.getAll().subscribe({ next: d => this.localidades.set(d ?? []) });
    this.partService.getAll().subscribe({
      next: d => this.partidos.set(d ?? []),
      error: () => this.notify.error('No se pudieron cargar partidos'),
    });
  }

  private toLocalIso(dtLocal: string): string {
    const d = new Date(dtLocal);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }

  crearPartido() {
    if (!this.fechaHoraLocal || !this.partLocalidadId()) {
      this.notify.info('Completa todos los campos');
      return;
    }
    const eqLocal = this.equipoLocal();
    const eqVisit = this.equipoVisitante();
    if (!eqLocal || !eqVisit) { this.notify.info('Selecciona ambos equipos'); return; }
    if (eqLocal.id_Equipo === eqVisit.id_Equipo) {
      this.notify.info('El equipo local y visitante no pueden ser el mismo');
      return;
    }

    const payload = {
      fechaHora:    this.toLocalIso(this.fechaHoraLocal),
      id_Localidad: this.partLocalidadId()!,      // <- correcto
      id_Local:     eqLocal.id_Equipo,
      id_Visitante: eqVisit.id_Equipo,
    };

    this.partService.create(payload).subscribe({
      next: () => {
        this.fechaHoraLocal = '';
        this.partLocalidadId.set(undefined);
        this.equipoLocal.set(undefined);
        this.equipoVisitante.set(undefined);
        this.notify.success('Agregado correctamente');
        this.cargar();
        this.cargarPagina();
      },
      error: () => this.notify.error('Error al agregar partido'),
    });
  }

  cambiarPagina(event: PageEvent) {
    this.pagina  = event.pageIndex + 1;
    this.tamanio = event.pageSize;
    this.cargarPagina();
  }

  cargarPagina() {
    this.partService.getPaginado(this.pagina, this.tamanio).subscribe({
      next: (res: Pagina<PartidoPagina>) => {
        this.items.set(res.items ?? []);
        this.totalRegistros.set(res.totalRegistros ?? 0);
      },
    });
  }

  // ---- UI helpers ----
  logoEquipo(nombre?: string): string {
    if (!nombre) return 'assets/placeholder-team.svg';
    const eq = this.equipos().find(e => e?.nombre?.toLowerCase() === nombre.toLowerCase());
    return (eq as any)?.url || 'assets/placeholder-team.svg';
  }

  nombreLocalidad(id?: number): string {
    if (!id) return '';
    const l = this.localidades().find(x => (x as any).id === id || (x as any).id_Localidad === id);
    return l?.nombre ?? `Loc: ${id}`;
  }

  toggleDetallesByIndex(index: number) {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }

  onImgErr(ev: Event) {
    const img = ev.target as HTMLImageElement | null;
    if (img) img.src = 'assets/placeholder-team.svg';
  }

  trackByPartido = (index: number, _p: PartidoPagina) => index; 

  generarReporte() {
  this.notify?.info?.('Generando reporte…'); 
}
}
