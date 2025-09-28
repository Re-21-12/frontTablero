import { Component, OnInit, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipoService } from '../../core/services/equipo.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { PartidoService } from '../../core/services/partido.service';
import {
  Equipo,
  Localidad,
  Partido,
  Pagina,
  PartidoResultado,
  PartidoPagina,
} from '../../core/interfaces/models';
import { NotifyService } from '../shared/notify.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { RolService } from '../../core/services/rol.service';

@Component({
  standalone: true,
  selector: 'app-partidos-page',
  imports: [CommonModule, FormsModule, MatPaginator],
  templateUrl: './partidos-page.component.html',
  styleUrls: ['./partidos-page.component.css'],
})
export class PartidosPageComponent implements OnInit {
  fechaHoraLocal = '';
  partLocalidadId = model<number>();

  equipos = signal<Equipo[]>([]);
  localidades = signal<Localidad[]>([]);
  equipoLocal = model<Equipo>();
  equipoVisitante = model<Equipo>();
  partidos = signal<any[]>([]);
  totalRegistros = signal(0);
  tamanio = 5;
  pagina = 1;
  items = signal<PartidoPagina[]>([]);

  private eqService = inject(EquipoService);
  private locService = inject(LocalidadService);
  private partService = inject(PartidoService);
  private notify = inject(NotifyService);

  ngOnInit() {
    this.cargar();
    this.cargarPagina();
    console.log(this.items());
  }

  cargar() {
    this.eqService.getAll().subscribe({ next: (d) => this.equipos.set(d) });
    this.locService
      .getAll()
      .subscribe({ next: (d) => this.localidades.set(d) });
    this.partService.getAll().subscribe({
      next: (d) => this.partidos.set(d),
      error: () => this.notify.error('No se pudieron cargar partidos'),
    });
  }

  private toLocalIso(dtLocal: string): string {
    const d = new Date(dtLocal);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }

  crearPartido() {
    if (!this.fechaHoraLocal || !this.partLocalidadId) {
      this.notify.info('Completa todos los campos');
      return;
    }

    const eqLocal = this.equipoLocal();
    const eqVisitante = this.equipoVisitante();

    if (!eqLocal || !eqVisitante) {
      this.notify.info('Selecciona ambos equipos');
      return;
    }

    if (eqLocal.id_Equipo === eqVisitante.id_Equipo) {
      this.notify.info('El equipo local y visitante no pueden ser el mismo');
      return;
    }

    const payload = {
      fechaHora: this.toLocalIso(this.fechaHoraLocal),
      id: this.partLocalidadId,
      id_Local: eqLocal.id_Equipo,
      id_Visitante: eqVisitante.id_Equipo,
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
    this.partService
      .getPaginado(this.pagina, this.tamanio)
      .subscribe((res: Pagina<PartidoPagina>) => {
        this.items.set(res.items);
        this.totalRegistros.set(res.totalRegistros);
        console.log(res);
      });
  }
}
