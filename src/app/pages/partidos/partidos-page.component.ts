import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipoService } from '../../core/services/equipo.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { PartidoService } from '../../core/services/partido.service';
import { Equipo, Localidad } from '../../core/interfaces/models';
import { NotifyService } from '../shared/notify.service';

@Component({
  standalone: true,
  selector: 'app-partidos-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './partidos-page.component.html',
  styleUrls: ['./partidos-page.component.css']
})
export class PartidosPageComponent implements OnInit {
  fechaHoraLocal = '';
  partLocalidadId?: number;
  partLocalId?: number;
  partVisitId?: number;

  equipos = signal<Equipo[]>([]);
  localidades = signal<Localidad[]>([]);
  partidos = signal<any[]>([]);

  private eqService   = inject(EquipoService);
  private locService  = inject(LocalidadService);
  private partService = inject(PartidoService);
  private notify  = inject(NotifyService);

  ngOnInit() { this.cargar(); }

  cargar() {
    this.eqService.getAll().subscribe({ next: d => this.equipos.set(d) });
    this.locService.getAll().subscribe({ next: d => this.localidades.set(d) });
    this.partService.getAll().subscribe({
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
    if (!this.fechaHoraLocal || !this.partLocalidadId || !this.partLocalId || !this.partVisitId) {
      this.notify.info('Completa todos los campos'); return;
    }
    if (this.partLocalId === this.partVisitId) {
      this.notify.info('El equipo local y visitante no pueden ser el mismo'); return;
    }

    const payload = {
      fechaHora: this.toLocalIso(this.fechaHoraLocal),
      id_Localidad: this.partLocalidadId,
      id_Local: this.partLocalId,
      id_Visitante: this.partVisitId
    };

    this.partService.create(payload).subscribe({
      next: () => {
        this.fechaHoraLocal = '';
        this.partLocalidadId = undefined;
        this.partLocalId = undefined;
        this.partVisitId = undefined;
        this.notify.success('Agregado correctamente');
        this.cargar();
      },
      error: () => this.notify.error('Error al agregar partido')
    });
  }
}
