import { Component, OnInit, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatPaginator, PageEvent } from '@angular/material/paginator';

import { EquipoService } from '../../core/services/equipo.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { PartidoService } from '../../core/services/partido.service';
import { NotifyService } from '../shared/notify.service';

import {
  Equipo,
  Localidad,
  Pagina,
  PartidoPagina,
} from '../../core/interfaces/models';
import { ReporteService } from '../../core/services/reporte.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-partidos-page',
  imports: [CommonModule, FormsModule, MatPaginator],
  templateUrl: './partidos-page.component.html',
  styleUrls: ['./partidos-page.component.css'],
})
export class PartidosPageComponent implements OnInit {
  private router = inject(Router);
  fechaHoraLocal = '';
  partLocalidadId = model<number>();
  equipoLocal = model<Equipo>();
  equipoVisitante = model<Equipo>();

  equipos = signal<Equipo[]>([]);
  localidades = signal<Localidad[]>([]);
  partidos = signal<any[]>([]);
  items = signal<PartidoPagina[]>([]);
  totalRegistros = signal(0);

  tamanio = 5;
  pagina = 1;
  expandedIndex = signal<number | null>(null);

  private eqService = inject(EquipoService);
  private locService = inject(LocalidadService);
  private partService = inject(PartidoService);
  private notify = inject(NotifyService);
  private reporte = inject(ReporteService);

  ngOnInit() {
    this.cargar();
    this.cargarPagina();
  }
  verPartido(id: number) {
    this.router.navigate(['partidos', id]);
  }
  cargar() {
    this.eqService
      .getAll()
      .subscribe({ next: (d) => this.equipos.set(d ?? []) });
    this.locService
      .getAll()
      .subscribe({ next: (d) => this.localidades.set(d ?? []) });
    this.partService.getAll().subscribe({
      next: (d) => this.partidos.set(d ?? []),
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
    if (!eqLocal || !eqVisit) {
      this.notify.info('Selecciona ambos equipos');
      return;
    }
    if (eqLocal.id_Equipo === eqVisit.id_Equipo) {
      this.notify.info('El equipo local y visitante no pueden ser el mismo');
      return;
    }

    const payload = {
      fechaHora: this.toLocalIso(this.fechaHoraLocal),
      id_Localidad: this.partLocalidadId()!,
      id_Local: eqLocal.id_Equipo,
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
    this.pagina = event.pageIndex + 1;
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

  logoEquipo(nombre?: string): string | null {
    if (!nombre) return null;
    const eq = this.equipos().find(
      (e) => e?.nombre?.toLowerCase() === nombre.toLowerCase(),
    );
    const url = (eq as any)?.url;
    if (!url || typeof url !== 'string' || !url.trim()) return null;
    return url;
  }

  nombreLocalidad(id?: number): string {
    if (!id) return '';
    const l = this.localidades().find(
      (x) => (x as any).id === id || (x as any).id_Localidad === id,
    );
    return l?.nombre ?? `Loc: ${id}`;
  }

  toggleDetallesByIndex(index: number) {
    this.expandedIndex.set(this.expandedIndex() === index ? null : index);
  }

  onImgErr(ev: Event) {
    const img = ev.target as HTMLImageElement | null;
    if (img) {
      // ocultar la imagen si falla la carga en vez de reemplazar por un svg inexistente
      img.style.display = 'none';
    }
  }

  trackByPartido = (index: number, _p: PartidoPagina) => index;

  private normTxt(s?: string): string {
    return (s ?? '')
      .normalize('NFD')
      .replace(/\p{Diacritic}/gu, '')
      .toLowerCase()
      .replace(/\s+/g, ' ')
      .trim();
  }

  private toDate(d: any): Date | null {
    const x = d instanceof Date ? d : d ? new Date(d) : null;
    return x && !isNaN(+x) ? x : null;
  }

  private diffMinutes(a?: any, b?: any): number | null {
    const da = this.toDate(a),
      db = this.toDate(b);
    if (!da || !db) return null;
    return Math.abs((da.getTime() - db.getTime()) / 60000);
  }

  private idDirecto(p: any): number | null {
    if (!p) return null;
    return (
      (typeof p.id_Partido === 'number' && p.id_Partido) ||
      (typeof p.id_partido === 'number' && p.id_partido) ||
      (typeof p.idPartido === 'number' && p.idPartido) ||
      (typeof p.partidoId === 'number' && p.partidoId) ||
      (typeof p.id === 'number' && p.id) ||
      (p.partido &&
        typeof p.partido.id_Partido === 'number' &&
        p.partido.id_Partido) ||
      (p.partido && typeof p.partido.id === 'number' && p.partido.id) ||
      null
    );
  }

  private idPorCoincidencia(p: any): number | null {
    const loc = this.normTxt(p?.local);
    const vis = this.normTxt(p?.visitante);
    const fecha = p?.fechaHora;
    const candidatos = this.partidos().filter((x: any) => {
      const l = this.normTxt(x?.local ?? x?.equipoLocal);
      const v = this.normTxt(x?.visitante ?? x?.equipoVisitante);
      return l === loc && v === vis;
    });

    if (!candidatos.length) return null;

    const cerca = candidatos.find((x: any) => {
      const f = x?.fechaHora ?? x?.fecha_hora ?? x?.fecha;
      const dm = this.diffMinutes(fecha, f);
      return dm !== null && dm <= 5;
    });

    const match = cerca ?? candidatos[0];

    return (
      (typeof match?.id_Partido === 'number' && match.id_Partido) ||
      (typeof match?.id_partido === 'number' && match.id_partido) ||
      (typeof match?.idPartido === 'number' && match.idPartido) ||
      (typeof match?.partidoId === 'number' && match.partidoId) ||
      (typeof match?.id === 'number' && match.id) ||
      null
    );
  }

  private resolverIdPartido(p: any): number | null {
    return this.idDirecto(p) ?? this.idPorCoincidencia(p);
  }
  generarReporteRosterFromRow(p: any) {
    const ejecutar = () => {
      const id = this.resolverIdPartido(p);
      if (!id) {
        this.notify.error(
          'No hay partido seleccionado (no se pudo resolver el ID).',
        );
        return;
      }
      this.notify.info('Generando reporte de roster…');
      this.reporte.descargarReporteRosterPartido(id).subscribe({
        next: () => this.notify.success('Reporte de roster descargado'),
        error: () =>
          this.notify.error('No se pudo generar el reporte de roster'),
      });
    };

    if (!this.partidos().length) {
      this.partService.getAll().subscribe({
        next: (d) => {
          this.partidos.set(d ?? []);
          ejecutar();
        },
        error: () => this.notify.error('No se pudieron cargar partidos'),
      });
    } else {
      ejecutar();
    }
  }
}
