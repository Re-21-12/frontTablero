import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalidadService } from '../../core/services/localidad.service';
import { EquipoService } from '../../core/services/equipo.service';
import { PartidoService } from '../../core/services/partido.service';
import { PermisoService } from '../../core/services/permiso.service';
import { Localidad, Equipo } from '../../core/interfaces/models';
import { NotifyService } from '../shared/notify.service';
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  private readonly _permisoService = inject(PermisoService);

  localidades = signal<Localidad[]>([]);
  equipos = signal<Equipo[]>([]);
  partidos = signal<any[]>([]);

  locNombre = '';
  eqNombre = '';
  eqLocalidadId?: number;

  fechaHoraLocal = '';
  partLocalidadId?: number;
  partLocalId?: number;
  partVisitId?: number;

  // Signals para permisos
  canViewLocalidades = signal(false);
  canViewEquipos = signal(false);
  canViewPartidos = signal(false);
  canViewJugadores = signal(false);
  canViewUsuarios = signal(false);
  canViewRoles = signal(false);

  loadingLoc = signal(false);
  loadingEq  = signal(false);
  loadingPar = signal(false);

  private locSvc  = inject(LocalidadService);
  private eqSvc   = inject(EquipoService);
  private partSvc = inject(PartidoService);
  private notify  = inject(NotifyService);

  ngOnInit(){
    this.loadAll();
  }



  loadAll(){
    this.locSvc.getAll().subscribe({
      next: d => this.localidades.set(d),
      error: () => this.notify.error('No se pudieron cargar localidades')
    });
    this.eqSvc.getAll().subscribe({
      next: d => this.equipos.set(d),
      error: () => this.notify.error('No se pudieron cargar equipos')
    });
    this.partSvc.getAll().subscribe({
      next: d => this.partidos.set(d),
      error: () => this.notify.error('No se pudieron cargar partidos')
    });
  }

  crearLocalidad(){
    const nombre = this.locNombre.trim();
    if (!nombre) { this.notify.info('Ingresa un nombre de localidad'); return; }
    this.loadingLoc.set(true);
    this.locSvc.create({ nombre }).subscribe({
      next: () => { this.locNombre = ''; this.notify.success('Agregado correctamente'); this.loadAll(); },
      error: () => this.notify.error('Error al agregar localidad'),
      complete: () => this.loadingLoc.set(false)
    });
  }

  crearEquipo(){
    const nombre = this.eqNombre.trim();
    const idLoc  = Number(this.eqLocalidadId);
    if (!nombre) { this.notify.info('Ingresa un nombre de equipo'); return; }
    if (!idLoc)  { this.notify.info('Selecciona una localidad para el equipo'); return; }
    this.loadingEq.set(true);
    this.eqSvc.create({ nombre, id_Localidad: idLoc }).subscribe({
      next: () => { this.eqNombre = ''; this.eqLocalidadId = undefined; this.notify.success('Agregado correctamente'); this.loadAll(); },
      error: () => this.notify.error('Error al agregar equipo'),
      complete: () => this.loadingEq.set(false)
    });
  }

  private toLocalIso(dtLocal: string): string {
    const d = new Date(dtLocal);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
  }

  crearPartido(){
    if (!this.fechaHoraLocal) { this.notify.info('Selecciona fecha y hora'); return; }
    const idLoc   = Number(this.partLocalidadId);
    const idLocal = Number(this.partLocalId);
    const idVisit = Number(this.partVisitId);
    if (!idLoc)   { this.notify.info('Selecciona localidad del partido'); return; }
    if (!idLocal) { this.notify.info('Selecciona equipo local'); return; }
    if (!idVisit) { this.notify.info('Selecciona equipo visitante'); return; }
    if (idLocal === idVisit) { this.notify.info('Local y visitante no pueden ser el mismo'); return; }

    const payload = {
      fechaHora: this.toLocalIso(this.fechaHoraLocal),
      id: idLoc,
      id_Local: idLocal,
      id_Visitante: idVisit
    };

    this.loadingPar.set(true);
    this.partSvc.create(payload).subscribe({
      next: () => {
        this.fechaHoraLocal = '';
        this.partLocalidadId = undefined;
        this.partLocalId = undefined;
        this.partVisitId = undefined;
        this.notify.success('Agregado correctamente');
        this.loadAll();
      },
      error: () => this.notify.error('Error al agregar partido'),
      complete: () => this.loadingPar.set(false)
    });
  }
}
