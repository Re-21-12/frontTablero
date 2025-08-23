import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { LocalidadService } from '../../core/services/localidad.service';
import { EquipoService } from '../../core/services/equipo.service';
import { PartidoService } from '../../core/services/partido.service';
import { Localidad, Local, Equipo } from '../../core/models';

@Component({
  standalone: true,
  selector: 'app-admin-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-page.component.html',
  styleUrls: ['./admin-page.component.css']
})
export class AdminPageComponent implements OnInit {
  localidades = signal<Localidad[]>([]);
  equipos = signal<Equipo[]>([]);
  partidos = signal<any[]>([]);

  locNombre = '';
  eqNombre = '';
  eqLocalidadId!: number;

  fechaHoraLocal = '';
  partLocalidadId!: number;
  partLocalId!: number;
  partVisitId!: number;

  constructor(
    private locSvc: LocalidadService,
    private eqSvc: EquipoService,
    private partSvc: PartidoService
  ) {}

  ngOnInit(){ this.loadAll(); }

  loadAll(){
    this.locSvc.getAll().subscribe(d=>this.localidades.set(d));
    this.eqSvc.getAll().subscribe(d=>this.equipos.set(d));
    this.partSvc.getAll().subscribe(d=>this.partidos.set(d));
  }

  crearLocalidad(){
    const nombre = this.locNombre.trim(); if (!nombre) return;
    this.locSvc.create({ nombre }).subscribe(()=>{ this.locNombre=''; this.loadAll(); });
  }
  crearEquipo(){
    const nombre = this.eqNombre.trim();
    const idLoc = Number(this.eqLocalidadId);
    if (!nombre || !idLoc) return;
    this.eqSvc.create({ nombre, id_Localidad: idLoc }).subscribe(()=>{ this.eqNombre=''; this.eqLocalidadId = NaN as any; this.loadAll(); });
  }
  crearPartido(){
    if (!this.fechaHoraLocal) return;
    const iso = new Date(this.fechaHoraLocal).toISOString();
    const payload = {
      fechaHora: iso,
      id_Localidad: Number(this.partLocalidadId),
      id_Local: Number(this.partLocalId),
      id_Visitante: Number(this.partVisitId)
    };

    this.partSvc.create(payload).subscribe(()=> this.loadAll());
  }
}
