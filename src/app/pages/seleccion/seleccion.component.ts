import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EquipoService } from '../../core/services/equipo.service';
import { Equipo } from '../../core/interfaces/models';
import { TableroService } from '../../core/services/tablero.service';
import { Router } from '@angular/router';
import { PartidoService } from '../../core/services/partido.service';
import { JugadorService,Jugador } from '../../core/services/jugador.service';


@Component({
  selector: 'app-seleccion',
  imports: [CommonModule],
  templateUrl: './seleccion.component.html',
  styleUrl: './seleccion.component.css'
})
export class SeleccionComponent implements OnInit {
  private _equipoService = inject(EquipoService)
  private _tableroService = inject(TableroService)
  private _partidoService = inject(PartidoService)
  private _router = inject(Router)
  private jugSvc = inject(JugadorService);
  locales = signal<Jugador[]>([]);
  visitantes = signal<Jugador[]>([]);
  equipos: Equipo[] = [];
  equiposSeleccionados: Equipo[] = [];

  ngOnInit() {
    this._equipoService.getAll().subscribe(equipos => {
      this.equipos = equipos;
    });
    
  }

  cargarJugadores(id: number) { this.jugSvc.getByTeam(id).subscribe(); }

/* Crear partido */
  createPartido(){
    this._partidoService.create({
      fechaHora: new Date().toISOString(),
      id_Local: this.equiposSeleccionados[0].id_Equipo,
      id_Visitante: this.equiposSeleccionados[1].id_Equipo
    }).subscribe({
      next: (data: any) => {
        const parsedData = JSON.parse(data);
        this._tableroService.id_partido = parsedData.id;

        this._router.navigate(['/tablero']);
      },
      error: (err) => {
        console.error('Error al crear partido:', err);
      }
    });
  }


  seleccionarEquipo(equipo: Equipo) {
    const idx = this.equiposSeleccionados.findIndex(e => e.id_Equipo === equipo.id_Equipo);
    if (idx > -1) {
      // Si ya está seleccionado, lo quitamos
      this.equiposSeleccionados.splice(idx, 1);
    } else {
      if (this.equiposSeleccionados.length < 2) {
        this.equiposSeleccionados.push(equipo);
      } else {
        // Si ya hay dos, reemplazamos el primero
        this.equiposSeleccionados.shift();
        this.equiposSeleccionados.push(equipo);
      }
    }
    this._tableroService.setEquiposSeleccionados(this.equiposSeleccionados);

      if (this.equiposSeleccionados[0]) {
    this.jugSvc.getByTeam(this.equiposSeleccionados[0].id_Equipo)
      .subscribe(j => this.locales.set(j));
  }

  if (this.equiposSeleccionados[1]) {
    this.jugSvc.getByTeam(this.equiposSeleccionados[1].id_Equipo)
      .subscribe(j => this.visitantes.set(j));
  }
  }

  estaSeleccionado(equipo: Equipo): boolean {
    return this.equiposSeleccionados.some(e => e.id_Equipo === equipo.id_Equipo);
  }
  cargarVisitantes(equipo: Equipo){
    return this.cargarJugadores(equipo.id_Equipo);
  }

}
