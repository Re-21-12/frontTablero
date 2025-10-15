import { Component, OnInit, inject, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipoService } from '../../core/services/equipo.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { PartidoService } from '../../core/services/partido.service';
import { Equipo, Localidad } from '../../core/interfaces/models';
import { NotifyService } from '../shared/notify.service';
import { PartidoResultado, Resultado } from '../../core/interfaces/models';
import { ReporteService } from '../../core/services/reporte.service';




@Component({
  selector: 'app-historial',
  imports: [CommonModule, FormsModule],
  templateUrl: './historial.component.html',
  styleUrl: './historial.component.css'
})
export class HistorialComponent {
fechaHoraLocal = '';
  partLocalidadId = model<number>();

  equipos = signal<Equipo[]>([]);
  localidades = signal<Localidad[]>([]);
  equipoLocal = model<Equipo>();
  equipoVisitante = model<Equipo>();
  partidos = signal<PartidoResultado[]>([]);

  private eqService   = inject(EquipoService);
  private locService  = inject(LocalidadService);
  private partService = inject(PartidoService);
  private notify  = inject(NotifyService);
  private reporte = inject(ReporteService);

  ngOnInit() { this.cargar(); }

  cargar() {
    this.eqService.getAll().subscribe({ next: d => this.equipos.set(d) });
    this.locService.getAll().subscribe({ next: d => this.localidades.set(d) });
    this.partService.getPartidoResultados().subscribe({
      next: d => this.partidos.set(d),
      error: () => this.notify.error('No se pudieron cargar partidos')
    });
  }

  private toLocalIso(dtLocal: string): string {
    const d = new Date(dtLocal);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }

  crearPartido() {
    if (!this.fechaHoraLocal || !this.partLocalidadId ) {
      this.notify.info('Completa todos los campos'); return;
    }

    const eqLocal = this.equipoLocal();
    const eqVisitante = this.equipoVisitante();

    if (!eqLocal || !eqVisitante) {
      this.notify.info('Selecciona ambos equipos'); return;
    }

    if (eqLocal.id_Equipo === eqVisitante.id_Equipo) {
      this.notify.info('El equipo local y visitante no pueden ser el mismo'); return;
    }

    const payload = {
      fechaHora: this.toLocalIso(this.fechaHoraLocal),
      id: this.partLocalidadId,
      id_Local: eqLocal.id_Equipo,
      id_Visitante: eqVisitante.id_Equipo
    };

    this.partService.create(payload).subscribe({
      next: () => {
        this.fechaHoraLocal = '';
        this.partLocalidadId.set(undefined);
        this.equipoLocal.set(undefined);
        this.equipoVisitante.set(undefined);
        this.notify.success('Agregado correctamente');
        this.cargar();
      },
      error: () => this.notify.error('Error al agregar partido')
    });
  }

  generarReporte(){
    this.reporte.descargarReportePartidos().subscribe({
      next: () => this.notify.success('Reporte de partidos generado correctamente'),
      error: () => this.notify.error('Error al generar el reporte de partidos')
    });
  }
}
