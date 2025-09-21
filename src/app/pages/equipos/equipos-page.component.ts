import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { EquipoService } from '../../core/services/equipo.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { Equipo, Localidad } from '../../core/interfaces/models';
import { NotifyService } from '../shared/notify.service';

@Component({
  standalone: true,
  selector: 'app-equipos-page',
  imports: [CommonModule, FormsModule],
  templateUrl: './equipos-page.component.html',
  styleUrls: ['./equipos-page.component.css']
})
export class EquiposPageComponent implements OnInit {
  eqNombre = '';
  eqLocalidadId?: number;

  equipos = signal<Equipo[]>([]);
  localidades = signal<Localidad[]>([]);

  private eqService= inject(EquipoService);
  private locService= inject(LocalidadService);
  private notify = inject(NotifyService);

  ngOnInit() { this.cargar(); }

  cargar() {
    this.eqService.getAll().subscribe({
      next: d => this.equipos.set(d),
      error: () => this.notify.error('No se pudieron cargar equipos')
    });
    this.locService.getAll().subscribe({
      next: d => this.localidades.set(d),
      error: () => this.notify.error('No se pudieron cargar localidades')
    });
  }

  crearEquipo() {
    const nombre = this.eqNombre.trim();
    const idLoc  = Number(this.eqLocalidadId);
    if (!nombre) { this.notify.info('Ingresa un nombre de equipo'); return; }
    if (!idLoc)  { this.notify.info('Selecciona una localidad para el equipo'); return; }

    this.eqService.create({ nombre, id_Localidad: idLoc }).subscribe({
      next: () => { this.eqNombre = ''; this.eqLocalidadId = undefined; this.notify.success('Agregado correctamente'); this.cargar(); },
      error: () => this.notify.error('Error al agregar equipo')
    });
  }
}
