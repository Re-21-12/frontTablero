import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableroFacade } from '../../core/tablero.facade';
import { Cuarto, Itabler } from '../../core/models';
import { TableroService } from '../../core/services/tablero.service';
import { LocalidadService } from '../../core/services/localidad.service';
import { CuartoService } from '../../core/services/cuarto.service';
import { Router } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-home-page',
  imports: [FormsModule],
  templateUrl: './home-page.component.html',
  styleUrls: ['./home-page.component.css']
})
export class HomePageComponent implements OnInit {
  private _tableroService = inject(TableroService);
  private _localidadService = inject(LocalidadService);
  private _cuartoService = inject(CuartoService);
private _routerService = inject(Router);
  constructor(private facade: TableroFacade) {}
  Math: any;

  ngOnInit(): void {
    this.getLocalidad();
  }

  // estado marcador
  /* local */
  scoreLocal = signal(0);
  foulsLocal = signal(0);
  /* Visitatnte */
  scoreVisit = signal(0);
  foulsVisit = signal(0);
  /* Numero de cuarto */
  quarter = signal(1);

  // cronómetro
  timerSeconds = signal(10 * 60);
  running = signal(false);
  private _handler?: any;

  // form persistencia
  locNombre = '';
  equipoLocalNombre = '';
  equipoVisitNombre = '';
  fechaHoraLocal = '';

  cuartos = [
    { no_Cuarto:1, total_Punteo:0, total_Faltas:0, duenio:'l' },
    { no_Cuarto:2, total_Punteo:0, total_Faltas:0, duenio:'v' },
    { no_Cuarto:3, total_Punteo:0, total_Faltas:0, duenio:'l' },
    { no_Cuarto:4, total_Punteo:0, total_Faltas:0, duenio:'v' },
  ];

  msg = '';

  addLocal(n: number){ this.scoreLocal.set(Math.max(0, this.scoreLocal()+n)); }
  addVisit(n: number){ this.scoreVisit.set(Math.max(0, this.scoreVisit()+n)); }

  getLocalidad(){
  const localidadId=  this._tableroService.getEquiposSeleccionados()[0].id_Localidad;
    this._localidadService.get(localidadId).subscribe(loc => {
      this.locNombre = loc.nombre;
    });
    this.equipoLocalNombre = this._tableroService.getEquiposSeleccionados()[0].nombre;
    this.equipoVisitNombre = this._tableroService.getEquiposSeleccionados()[1].nombre;
  }
  createCuarto(id_Equipo: number, totalFaltas: number, totalPunteo: number){

    let cuarto:Cuarto = {
      no_Cuarto: this.quarter(),
      total_Faltas: totalFaltas,
      total_Punteo: totalPunteo,
      id_Partido: Number(this._tableroService.id_partido),
      id_Equipo: id_Equipo
    }

    this._cuartoService.create(cuarto).subscribe({
      next: (id) => {
        console.log('Cuarto creado con ID:', id);
      },
      error: (err) => {
        console.error('Error al crear cuarto:', err);
      }
    });
  }
  start(){
    if (this.running()) return;
    this.running.set(true);
    this._handler = setInterval(() => {
      const t = this.timerSeconds()-1;
      this.timerSeconds.set(Math.max(0, t));
      if (t<=0) { this.pause(); this.beep(); }
    }, 1000);
  }
  pause(){ this.running.set(false); if (this._handler) clearInterval(this._handler); }
  finish(){
    this._routerService.navigate(['/resultado']);
  }
  reset(){ this.pause(); this.timerSeconds.set(10*60); }
  nextQuarter(){
     if (this.quarter()<4) { this.quarter.set(this.quarter()+1); this.reset(); }

    this.createCuarto(this._tableroService.getEquiposSeleccionados()[0].id_Equipo, this.foulsLocal(), this.scoreLocal());
    this.createCuarto(this._tableroService.getEquiposSeleccionados()[1].id_Equipo, this.foulsVisit(), this.scoreVisit());
    this.clearValues()
  }
clearValues(){
  this.foulsLocal.set(0);
  this.foulsVisit.set(0);
  this.scoreLocal.set(0);
  this.scoreVisit.set(0);
}

  hardReset(){
    this.pause();
    this.scoreLocal.set(0); this.scoreVisit.set(0);
    this.foulsLocal.set(0); this.foulsVisit.set(0);
    this.quarter.set(1); this.timerSeconds.set(10*60);
    this.msg = '';
  }
  mmSS(s:number){ const m = Math.floor(s/60).toString().padStart(2,'0'); const ss=(s%60).toString().padStart(2,'0'); return `${m}:${ss}`; }
  beep(){ try{ const ctx=new (window as any).AudioContext(); const o=ctx.createOscillator(); o.type='sine'; o.frequency.value=880; o.connect(ctx.destination); o.start(); setTimeout(()=>{o.stop();ctx.close();}, 350);}catch{} }

  finalizarGuardar(){
    if (!this.locNombre.trim() || !this.equipoLocalNombre.trim() || !this.equipoVisitNombre.trim() || !this.fechaHoraLocal) {
      this.msg = 'Completa Localidad, equipos y la fecha/hora.';
      return;
    }

    const payload: Itabler = {
      localidad: { id_Localidad: 0, nombre: this.locNombre.trim() },
      local:     { id_Equipo:0, nombre: this.equipoLocalNombre.trim(), id_Localidad:0, localidad: { id_Localidad:0, nombre: this.locNombre.trim() } },
      visitante: { id_Equipo:0, nombre: this.equipoVisitNombre.trim(), id_Localidad:0, localidad: { id_Localidad:0, nombre: this.locNombre.trim() } },
      partido:   {
        fechaHora: new Date(this.fechaHoraLocal),
        id_Localidad: 0, id_Local: 0, id_Visitante: 0
      },
      cuartos: this.cuartos.map(q => ({
        id_Cuarto: 0, no_Cuarto: q.no_Cuarto, total_Punteo: Number(q.total_Punteo)||0,
        total_Faltas: Number(q.total_Faltas)||0, id_Partido: 0, id_Equipo: 0, duenio: q.duenio
      }))
    };

    this.msg = 'Guardando...';
    this.facade.save(payload).subscribe({
      next: () => this.msg = 'Partido y cuartos guardados',
      error: (e) => this.msg = 'Error: ' + (e?.message ?? e)
    });
  }
}
